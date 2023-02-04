import * as web3 from "@solana/web3.js";
import { AddMultiplierArgs } from "../../generated";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";
export declare function createAddMultiplierTransaction(project: web3.PublicKey, authority: web3.PublicKey, payer: web3.PublicKey, args: AddMultiplierArgs, programId?: web3.PublicKey): TxSignersAccounts;
export declare function addMultiplier(mx: Metaplex, project: web3.PublicKey, args: AddMultiplierArgs): Promise<{
    response: import("@metaplex-foundation/js").SendAndConfirmTransactionResponse;
}>;
