import * as web3 from "@solana/web3.js";
import { CreateProjectArgs } from "../../generated";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";
export declare function createCreateStakingProjectTransaction(rewardMint: web3.PublicKey, authority: web3.PublicKey, payer: web3.PublicKey, args: CreateProjectArgs, collections?: web3.PublicKey[], creators?: web3.PublicKey[], programId?: web3.PublicKey): TxSignersAccounts & {
    project: web3.PublicKey;
};
export declare function createStakingProject(mx: Metaplex, rewardMint: web3.PublicKey, args: CreateProjectArgs, collections?: web3.PublicKey[], creators?: web3.PublicKey[]): Promise<{
    response: import("@metaplex-foundation/js").SendAndConfirmTransactionResponse;
    project: web3.PublicKey;
}>;
