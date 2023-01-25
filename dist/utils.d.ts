import * as web3 from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { Signer } from "@metaplex-foundation/js";
export declare const METADATA_PROGRAM_ID: web3.PublicKey;
export declare const sendAndConfirmTransaction: (tx: web3.Transaction, connection: web3.Connection, wallet: anchor.Wallet, signers?: Signer[], sendOpts?: web3.SendOptions) => Promise<string>;
export declare const createV0Tx: (payerKey: web3.PublicKey, latestBlockhash: string, ...txInstructions: web3.TransactionInstruction[]) => web3.VersionedTransaction;
export declare const createV0TxWithLUT: (connection: web3.Connection, payerKey: web3.PublicKey, lookupTableAddress: web3.PublicKey, ...txInstructions: web3.TransactionInstruction[]) => Promise<web3.VersionedTransaction>;
export declare const createLookupTable: (connection: web3.Connection, wallet: anchor.Wallet, ...addresses: web3.PublicKey[]) => Promise<web3.PublicKey>;
export declare const sendAndConfirmV0Transaction: (tx: web3.VersionedTransaction, connection: web3.Connection, wallet: anchor.Wallet, signers?: Signer[], sendOpts?: web3.SendOptions) => Promise<string>;
