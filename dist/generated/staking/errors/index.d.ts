type ErrorWithCode = Error & {
    code: number;
};
type MaybeErrorWithCode = ErrorWithCode | null | undefined;
export declare class OverflowError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class OnlyOwnerError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class InvalidMetadataError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class InvalidNFTError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class RewardsNotAvailableError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class CantStakeYetError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class CantUnstakeYetError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare class DepositAccountNotProvidedError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
export declare function errorFromCode(code: number): MaybeErrorWithCode;
export declare function errorFromName(name: string): MaybeErrorWithCode;
export {};
