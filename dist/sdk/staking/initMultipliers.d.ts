import * as web3 from "@solana/web3.js";
import { InitMultipliersArgs } from "../../generated";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";
export declare function createInitMultiplierTransaction(project: web3.PublicKey, authority: web3.PublicKey, args: InitMultipliersArgs, programId?: web3.PublicKey): TxSignersAccounts;
export declare function initMultipliers(mx: Metaplex, project: web3.PublicKey, args: InitMultipliersArgs): Promise<{
    response: import("@metaplex-foundation/js").SendAndConfirmTransactionResponse;
}>;
