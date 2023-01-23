import * as web3 from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { Signer } from "@metaplex-foundation/js";
export declare const METADATA_PROGRAM_ID: web3.PublicKey;
export declare const sendAndConfirmTransaction: (tx: web3.Transaction, connection: web3.Connection, wallet: anchor.Wallet, signers?: Signer[], sendOpts?: web3.SendOptions) => Promise<string>;
