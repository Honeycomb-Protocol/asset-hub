import * as web3 from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { JsonMetadata, IdentityClient, KeypairSigner, Metaplex, MetaplexFile, Signer, BigNumber } from "@metaplex-foundation/js";
import { TxSignersAccounts, Wallet } from "./types";
export declare const sendAndConfirmTransaction: (tx: web3.Transaction, connection: web3.Connection, wallet: anchor.Wallet, signers?: Signer[], sendOpts?: web3.SendOptions) => Promise<string>;
export declare const createV0Tx: (payerKey: web3.PublicKey, latestBlockhash: string, ...txInstructions: web3.TransactionInstruction[]) => web3.VersionedTransaction;
export declare const createV0TxWithLUTDumb: ({ lookupTable, ...msgArgs }: {
    payerKey: web3.PublicKey;
    lookupTable: web3.AddressLookupTableAccount;
    instructions: web3.TransactionInstruction[];
    recentBlockhash: web3.Blockhash;
}) => web3.VersionedTransaction;
export declare const createV0TxWithLUT: (connection: web3.Connection, payerKey: web3.PublicKey, lookupTableAddress: web3.PublicKey | web3.AddressLookupTableAccount, txInstructions: web3.TransactionInstruction[], latestBlockhash?: web3.BlockhashWithExpiryBlockHeight) => Promise<web3.VersionedTransaction>;
export declare const numberToBytes: (x: number) => number[];
export declare const getOrFetchLoockupTable: (connection: web3.Connection, lookupTableAddress: web3.PublicKey | web3.AddressLookupTableAccount) => Promise<web3.AddressLookupTableAccount | null>;
export declare const devideAndSignTxns: (wallet: Wallet, connection: web3.Connection, rawTxns: TxSignersAccounts[], mextByteSizeOfAGroup?: number) => Promise<{
    tx: web3.Transaction;
    instrunctions: web3.TransactionInstruction[];
    signers: web3.Signer[];
}[]>;
export declare const devideAndSignV0Txns: (wallet: Wallet, connection: web3.Connection, lookupTableAddress: web3.PublicKey | web3.AddressLookupTableAccount, rawTxns: TxSignersAccounts[], mextByteSizeOfAGroup?: number) => Promise<web3.VersionedTransaction[]>;
export declare const isSigner: (input: any) => input is Signer;
export declare const isKeypairSigner: (input: any) => input is KeypairSigner;
export declare const createLookupTable: (wallet: Wallet | IdentityClient, connection: web3.Connection, addresses: web3.PublicKey[]) => Promise<web3.PublicKey>;
export declare const sendBulkTransactions: (connection: web3.Connection, transactions: (web3.VersionedTransaction | web3.Transaction)[]) => Promise<string[]>;
export declare const sendBulkTransactionsLegacy: (mx: Metaplex, transactions: web3.Transaction[]) => Promise<string[]>;
export declare const confirmBulkTransactions: (connection: web3.Connection, transactions: string[], commitment?: web3.Commitment) => Promise<web3.RpcResponseAndContext<web3.SignatureResult>[]>;
export declare const bulkLutTransactions: (mx: Metaplex, txns: TxSignersAccounts[]) => Promise<{
    txns: web3.VersionedTransaction[];
    lookupTableAddress: web3.PublicKey;
}>;
export declare const uploadMetadataToArwave: (mx: Metaplex, data: UploadMetadataInput) => Promise<{
    proceed: () => Promise<{
        uri: string;
        data: JsonMetadata<string>;
    }>;
    fundRequired: BigNumber;
}>;
export type UploadMetadataInput = {
    [k: string]: any;
    image: string | MetaplexFile;
};
export type UploadMetadataItemWithCallBack = {
    data: UploadMetadataInput;
    callback: (res: {
        uri: string;
        data: JsonMetadata;
    }) => any;
};
export declare const uploadBulkMetadataToArwave: (mx: Metaplex, items: UploadMetadataItemWithCallBack[]) => Promise<void>;
