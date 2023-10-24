use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use std::io::Write;

/// Represents payment information with support for nested conditions.
#[derive(Clone, Debug, PartialEq)]
pub enum Conditional<T: AnchorSerialize + AnchorDeserialize + Clone + PartialEq> {
    // No Condition
    None,

    // Leaf Item.
    Item(T),

    // Vec of item, any be fullfilled .
    Or(Vec<Conditional<T>>),

    // Vec of item, any be fullfilled .
    And(Vec<Conditional<T>>),
}

impl<T> AnchorSerialize for Conditional<T>
where
    T: AnchorSerialize + AnchorDeserialize + Clone + PartialEq,
{
    #[inline]
    fn serialize<W: Write>(&self, writer: &mut W) -> std::io::Result<()> {
        match self {
            Conditional::None => 0u8.serialize(writer),
            Conditional::Item(item) => {
                1u8.serialize(writer)?;
                item.serialize(writer)
            }
            Conditional::Or(items) => {
                2u8.serialize(writer)?;
                items.serialize(writer)
            }
            Conditional::And(items) => {
                3u8.serialize(writer)?;
                items.serialize(writer)
            }
        }
    }
}
const ERROR_UNEXPECTED_LENGTH_OF_INPUT: &str = "Unexpected length of input";

impl<T> AnchorDeserialize for Conditional<T>
where
    T: AnchorSerialize + AnchorDeserialize + Clone + PartialEq,
{
    #[inline]
    fn deserialize(buf: &mut &[u8]) -> std::io::Result<Self> {
        if buf.is_empty() {
            return Err(std::io::Error::new(
                std::io::ErrorKind::InvalidInput,
                ERROR_UNEXPECTED_LENGTH_OF_INPUT,
            ));
        }
        let flag = buf[0];
        *buf = &buf[1..];
        if flag == 0 {
            Ok(Self::None)
        } else if flag == 1 {
            Ok(Self::Item(T::deserialize(buf)?))
        } else if flag == 2 {
            Ok(Self::Or(Vec::deserialize(buf)?))
        } else if flag == 3 {
            Ok(Self::And(Vec::deserialize(buf)?))
        } else {
            let msg = format!(
                "Invalid Option representation: {}. The first byte must be 0 till 3",
                flag
            );

            Err(std::io::Error::new(std::io::ErrorKind::InvalidInput, msg))
        }
    }
}

impl<T: AnchorSerialize + AnchorDeserialize + Clone + PartialEq> Conditional<T> {
    /// Get size of conditional in bytes
    pub fn get_len(&self) -> usize {
        self.try_to_vec().unwrap().len()
    }

    /// Create a new `Conditional` instance with an OR condition.
    pub fn and(items: Vec<Self>) -> Self {
        Self::And(items)
    }

    /// Create a new `Conditional` instance with an OR condition.
    pub fn or(items: Vec<Self>) -> Self {
        Self::Or(items)
    }

    pub fn evaluate(&self, process_item: &impl Fn(&T) -> Result<()>) -> Result<()> {
        match self {
            Self::None => {
                msg!("No Conditions");
                Ok(())
            }
            Self::Item(item) => process_item(item),
            Self::And(items) => {
                for conditional in items {
                    if conditional.evaluate(process_item).is_err() {
                        return Err(ErrorCode::ConditionValidationFailed.into());
                    }
                }
                Ok(())
            }
            Self::Or(items) => {
                for conditional in items {
                    if conditional.evaluate(process_item).is_ok() {
                        return Ok(());
                    }
                }
                Err(ErrorCode::ConditionValidationFailed.into())
            }
        }
    }

    pub fn match_logical(&self, other: &Conditional<bool>) -> bool {
        match (self, other) {
            (Self::None, Conditional::None) => true,
            (Self::Item(_item1), Conditional::Item(item2)) => *item2,
            (Self::And(items1), Conditional::And(items2)) => items1
                .iter()
                .zip(items2.iter())
                .all(|(item1, item2)| item1.match_logical(item2)),

            (Self::Or(items1), Conditional::Or(items2)) => items1
                .iter()
                .zip(items2.iter())
                .any(|(item1, item2)| item1.match_logical(item2)),
            _ => false,
        }
    }

    pub fn new_mapped<OT: AnchorSerialize + AnchorDeserialize + Clone + PartialEq>(
        conditional: &Conditional<OT>,
        map_item: &impl Fn(&OT) -> T,
    ) -> Self {
        match conditional {
            Conditional::None => {
                msg!("No Conditions");
                Self::None
            }
            Conditional::Item(item) => Self::Item(map_item(&item)),

            Conditional::Or(items) => Self::Or(
                (&items)
                    .into_iter()
                    .map(|item| Self::new_mapped(&item, map_item))
                    .collect(),
            ),

            Conditional::And(items) => Self::And(
                (&items)
                    .into_iter()
                    .map(|item| Self::new_mapped(&item, map_item))
                    .collect(),
            ),
        }
    }

    pub fn get_item_mut(&mut self, path: Vec<u8>) -> Result<&mut T> {
        match path[0] {
            1 => {
                if let Conditional::Item(item) = self {
                    return Ok(item);
                }
                Err(ErrorCode::InvalidConditionalPath.into())
            }
            2 => {
                if let Conditional::Or(inner_conditionals) = self {
                    return inner_conditionals[path[1] as usize]
                        .get_item_mut(path[2..path.len()].to_vec());
                }
                Err(ErrorCode::InvalidConditionalPath.into())
            }
            3 => {
                if let Conditional::And(inner_conditionals) = self {
                    return inner_conditionals[path[1] as usize]
                        .get_item_mut(path[2..path.len()].to_vec());
                }
                Err(ErrorCode::InvalidConditionalPath.into())
            }
            _ => Err(ErrorCode::InvalidConditionalPath.into()),
        }
    }

    pub fn get_item(&self, path: Vec<u8>) -> Result<T> {
        match path[0] {
            1 => {
                if let Conditional::Item(item) = self {
                    return Ok(item.clone());
                }
                Err(ErrorCode::InvalidConditionalPath.into())
            }
            2 => {
                if let Conditional::Or(inner_conditionals) = self {
                    return inner_conditionals[path[1] as usize]
                        .get_item(path[2..path.len()].to_vec());
                }
                Err(ErrorCode::InvalidConditionalPath.into())
            }
            3 => {
                if let Conditional::And(inner_conditionals) = self {
                    return inner_conditionals[path[1] as usize]
                        .get_item(path[2..path.len()].to_vec());
                }
                Err(ErrorCode::InvalidConditionalPath.into())
            }
            _ => Err(ErrorCode::InvalidConditionalPath.into()),
        }
    }
}
