import * as web3 from "@solana/web3.js";
import { UpdateProjectArgs } from "../../generated";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";
export declare function createUpdateStakingProjectTransaction(project: web3.PublicKey, authority: web3.PublicKey, args: UpdateProjectArgs, collection?: web3.PublicKey, creator?: web3.PublicKey, programId?: web3.PublicKey): TxSignersAccounts & {
    project: web3.PublicKey;
};
export declare function updateStakingProject(mx: Metaplex, project: web3.PublicKey, args: UpdateProjectArgs, collection?: web3.PublicKey, creator?: web3.PublicKey): Promise<{
    response: import("@metaplex-foundation/js").SendAndConfirmTransactionResponse;
    project: web3.PublicKey;
}>;
