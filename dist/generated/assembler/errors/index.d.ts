type ErrorWithCode = Error & {
    code: number;
};
type MaybeErrorWithCode = ErrorWithCode | null | undefined;
export declare class OverflowError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class UnauthorizedError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class BlockTypeMismatchError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class RequiredBlockImageError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class InvalidBlockTypeError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class InvalidBlockDefinitionError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class InvalidMetadataError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class InvalidTokenForBlockDefinitionError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class NFTAlreadyMintedError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class BlockExistsForNFTError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class BlockDoesNotExistsForNFTError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class InvalidUniqueConstraintError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class UniqueConstraintNotProvidedError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class DepositAccountNotProvidedError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class NFTNotMintedError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class NFTNotBurnableError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class InitialArtGeneratedError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare function errorFromCode(code: number): MaybeErrorWithCode;
export declare function errorFromName(name: string): MaybeErrorWithCode;
export {};
