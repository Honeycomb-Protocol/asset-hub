import { Signer } from "@metaplex-foundation/js";
import * as web3 from "@solana/web3.js";
export type TxSignersAccounts = {
    tx: web3.Transaction;
    signers: Signer[];
    accounts: web3.PublicKey[];
};
export * from "./AssemblerConfig";
