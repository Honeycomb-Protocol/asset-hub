import * as web3 from "@solana/web3.js";
import { LockType } from "../../generated/staking";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
export declare function createUnstakeTransaction(project: web3.PublicKey, nftMint: web3.PublicKey, wallet: web3.PublicKey, lockType?: LockType, tokenStandard?: TokenStandard, programId?: web3.PublicKey): TxSignersAccounts;
export declare function unstake(mx: Metaplex, project: web3.PublicKey, nftMint: web3.PublicKey): Promise<{
    response: import("@metaplex-foundation/js").SendAndConfirmTransactionResponse;
}>;
