use anchor_lang::prelude::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("Opertaion overflowed")]
    Overflow,

    #[msg("The provided authority or delegate authority is not valid")]
    Unauthorized,

    #[msg("The type of block is not same as the block definition value provided")]
    BlockTypeMismatch,

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

    #[msg("NFT attribute is already present for this block")]
    BlockExistsForNFT,

    #[msg("NFT does not have attribute for this block")]
    BlockDoesNotExistsForNFT,

    #[msg("Unique constraint is not valid")]
    InvalidUniqueConstraint,

    #[msg("Unique constraint is not provided")]
    UniqueConstraintNotProvided,

    #[msg("Delegate is not provided")]
    DelegateAccountNotProvided,

    #[msg("Deposit account is not provided")]
    DepositAccountNotProvided,

    #[msg("The NFT is not minted")]
    NFTNotMinted,

    #[msg("The NFT is cannot be burned")]
    NFTNotBurnable,

    #[msg("The initial generation of art is already complete")]
    InitialArtGenerated,
}
