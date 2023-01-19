type ErrorWithCode = Error & {
    code: number;
};
type MaybeErrorWithCode = ErrorWithCode | null | undefined;
export declare class BlockNotEnumError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class BlockNotNumberError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class BlockNotBooleanError extends Error {
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
export declare function errorFromCode(code: number): MaybeErrorWithCode;
export declare function errorFromName(name: string): MaybeErrorWithCode;
export {};
