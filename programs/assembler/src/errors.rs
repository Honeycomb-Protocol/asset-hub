use anchor_lang::prelude::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("The type of block is not enum, block definitions must only be created for enum")]
    BlockNotEnum,

    #[msg("The type of block is not number, block definitions must only be created for number")]
    BlockNotNumber,

    #[msg("The type of block is not boolean, block definitions must only be created for boolean")]
    BlockNotBoolean,

    #[msg("The particular block requires an image in definition")]
    RequiredBlockImage,

    #[msg("The block has an invalid type")]
    InvalidBlockType,

    #[msg("The block defintion is invalid")]
    InvalidBlockDefinition,

    #[msg("The metadata provided for the mint is not valid")]
    InvalidMetadata,

    #[msg("The token is not valid for this block definition")]
    InvalidTokenForBlockDefinition,

    #[msg("The NFT is already minted")]
    NFTAlreadyMinted,
}
