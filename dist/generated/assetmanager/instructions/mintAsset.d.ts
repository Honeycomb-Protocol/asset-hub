import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
export type MintAssetInstructionArgs = {
    amount: beet.bignum;
};
export declare const mintAssetStruct: beet.BeetArgsStruct<MintAssetInstructionArgs & {
    instructionDiscriminator: number[];
}>;
export type MintAssetInstructionAccounts = {
    asset: web3.PublicKey;
    mint: web3.PublicKey;
    tokenAccount: web3.PublicKey;
    candyGuard: web3.PublicKey;
    wallet: web3.PublicKey;
    tokenProgram?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const mintAssetInstructionDiscriminator: number[];
export declare function createMintAssetInstruction(accounts: MintAssetInstructionAccounts, args: MintAssetInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
