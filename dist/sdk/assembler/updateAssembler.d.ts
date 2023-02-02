import * as web3 from "@solana/web3.js";
import { UpdateAssemblerArgs } from "../../generated";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";
export declare function createUpdateAssemblerTransaction(assembler: web3.PublicKey, authority: web3.PublicKey, args: UpdateAssemblerArgs, delegate?: web3.PublicKey, newAuthority?: web3.PublicKey, programId?: web3.PublicKey): TxSignersAccounts & {
    assembler: web3.PublicKey;
};
export declare function updateAssembler(mx: Metaplex, assembler: web3.PublicKey, args: UpdateAssemblerArgs, newAuthority?: web3.PublicKey): Promise<{
    response: void | import("@metaplex-foundation/js").SendAndConfirmTransactionResponse;
}>;
