import { Metaplex, Signer } from "@metaplex-foundation/js";
import * as web3 from "@solana/web3.js";
import { CreateNFTArgs } from "src/generated";
export type TxSignersAccounts = {
    tx: web3.Transaction;
    signers: Signer[];
    accounts: web3.PublicKey[];
};
export type CreateAndMintNftArgs = {
    mx: Metaplex;
    assembler: web3.PublicKey;
    args: CreateNFTArgs;
    blocks: {
        block: web3.PublicKey;
        blockDefinition: web3.PublicKey;
        tokenMint: web3.PublicKey;
    }[];
};
export * from "./AssemblerConfig";
