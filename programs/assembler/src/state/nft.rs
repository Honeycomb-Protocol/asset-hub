use crate::{errors::ErrorCode, utils::EXTRA_SIZE};
use anchor_lang::{prelude::*, solana_program};

/// NFT state account
#[account]
pub struct NFT {
    pub bump: u8,

    /// The assembler this NFT is associated to
    pub assembler: Pubkey,

    /// The wallet that has pre mint authority over this NFT
    pub authority: Pubkey,

    /// The collection address of this NFT
    pub collection_address: Pubkey,

    /// The mint address of this NFT
    pub mint: Pubkey,

    /// The name of the NFT
    pub name: String,

    /// The symbol of the NFT
    pub symbol: String,

    /// The description of the NFT
    pub description: String,

    /// Flag if this NFT is minted
    pub minted: bool,

    /// The id of the NFT
    pub id: u16,

    /// The uri of the NFT
    pub uri: String,

    /// Flag if the image for this nft is already generated
    pub is_generated: bool,

    /// NFT Attributes
    pub attributes: Vec<NFTAttribute>,
}
impl NFT {
    pub const LEN: usize = 232 + EXTRA_SIZE;

    /// Reallocate NFT size
    pub fn reallocate<'info>(
        len: isize,
        nft_info: AccountInfo<'info>,
        payer_info: AccountInfo<'info>,
        rent_sysvar: &Sysvar<'info, Rent>,
        system_program: &Program<'info, System>,
    ) -> Result<()> {
        let curr_len = isize::try_from(nft_info.data_len()).unwrap();
        let new_len = curr_len + len;
        let curr_rent = rent_sysvar.minimum_balance(usize::try_from(curr_len).unwrap());
        let new_rent = rent_sysvar.minimum_balance(usize::try_from(new_len).unwrap());
        let rent_diff: isize =
            isize::try_from(new_rent).unwrap() - isize::try_from(curr_rent).unwrap();

        let nft_info_borrow = nft_info.clone();
        if rent_diff > 0 {
            solana_program::program::invoke(
                &solana_program::system_instruction::transfer(
                    payer_info.key,
                    nft_info_borrow.key,
                    u64::try_from(rent_diff).unwrap(),
                ),
                &[
                    payer_info,
                    nft_info_borrow,
                    system_program.to_account_info(),
                ],
            )?;
        } else if rent_diff < 0 {
            let parsed_rent_diff = u64::try_from(rent_diff * -1).unwrap();

            **payer_info.lamports.borrow_mut() = payer_info
                .lamports()
                .checked_add(parsed_rent_diff)
                .ok_or(ErrorCode::Overflow)?;

            **nft_info.lamports.borrow_mut() = nft_info
                .lamports()
                .checked_sub(parsed_rent_diff)
                .ok_or(ErrorCode::Overflow)?;
        } else {
            return Ok(());
        }

        nft_info
            .realloc(usize::try_from(new_len).unwrap(), false)
            .map_err(Into::into)
    }
}

/// NFT Attribute
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct NFTAttribute {
    /// The block account
    pub block: Pubkey,

    /// The block definition
    pub block_definition: Pubkey,

    /// The token mint associated with this attribute
    pub mint: Pubkey,

    /// The order this attribute is to be place on
    pub order: u8,

    /// Attribute name
    pub attribute_name: String,

    /// Attribute value
    pub attribute_value: NFTAttributeValue,
}
impl NFTAttribute {
    pub const LEN: usize = 192;
}

/// NFT Attribute Value
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum NFTAttributeValue {
    /// If the attribute has a string value
    String { value: String },

    /// If the attribute has a boolean value
    Boolean { value: bool },

    /// If the attribute value is a number
    Number { value: u64 },
}

/// NFT Unique Constraint account
#[account]
pub struct NFTUniqueConstraint {
    pub bump: u8,

    /// The NFT this constraint is associated to
    pub nft: Pubkey,
}
impl NFTUniqueConstraint {
    pub const LEN: usize = 33 + EXTRA_SIZE;
}
