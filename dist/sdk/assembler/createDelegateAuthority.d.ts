import * as web3 from "@solana/web3.js";
import { CreateDelegateAuthorityArgs } from "../../generated";
import { TxSignersAccounts } from "../../types";
import { Metaplex } from "@metaplex-foundation/js";
export declare function createCreateDelegateAuthorityTransaction(assembler: web3.PublicKey, delegate: web3.PublicKey, authority: web3.PublicKey, payer: web3.PublicKey, args: CreateDelegateAuthorityArgs, programId?: web3.PublicKey): TxSignersAccounts & {
    delegateAuthority: web3.PublicKey;
};
export declare function createDelegateAuthority(mx: Metaplex, assembler: web3.PublicKey, delegate: web3.PublicKey, args: CreateDelegateAuthorityArgs): Promise<{
    response: void | import("@metaplex-foundation/js").SendAndConfirmTransactionResponse;
}>;
