import * as web3 from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import { TxSignersAccounts } from "../../types";
export declare function getAssociatedTokenAccountIntructions(mx: Metaplex, mints: web3.PublicKey[]): Promise<{
    preTxns: TxSignersAccounts[];
    postTxns: TxSignersAccounts[];
}>;
