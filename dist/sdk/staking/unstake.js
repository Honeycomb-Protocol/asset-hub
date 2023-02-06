"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unstake = exports.createUnstakeTransaction = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const splToken = __importStar(require("@solana/spl-token"));
const generated_1 = require("../../generated");
const staking_1 = require("../../generated/staking");
const pdas_1 = require("../pdas");
const claimRewards_1 = require("./claimRewards");
const utils_1 = require("../../utils");
function createUnstakeTransaction(project, nftMint, wallet, programId = staking_1.PROGRAM_ID) {
    const [nft] = (0, pdas_1.getStakedNftPda)(project, nftMint);
    const nftAccount = splToken.getAssociatedTokenAddressSync(nftMint, wallet);
    const [nftMetadata] = (0, pdas_1.getMetadataAccount_)(nftMint);
    const [nftEdition] = (0, pdas_1.getMetadataAccount_)(nftMint, { __kind: "edition" });
    const [nftTokenRecord] = (0, pdas_1.getMetadataAccount_)(nftMint, {
        __kind: "token_record",
        tokenAccount: nftAccount,
    });
    const [depositAccount] = (0, pdas_1.getStakedNftDepositPda)(nftMint);
    const [depositTokenRecord] = (0, pdas_1.getMetadataAccount_)(nftMint, {
        __kind: "token_record",
        tokenAccount: depositAccount,
    });
    const [staker] = (0, pdas_1.getStakerPda)(project, wallet);
    const instructions = [
        (0, generated_1.createUnstakeInstruction)({
            project,
            nft,
            nftMint,
            nftAccount,
            nftMetadata,
            nftEdition,
            nftTokenRecord,
            depositAccount,
            depositTokenRecord,
            staker,
            wallet,
            associatedTokenProgram: splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenMetadataProgram: pdas_1.METADATA_PROGRAM_ID,
            clock: web3.SYSVAR_CLOCK_PUBKEY,
            sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        }, programId),
    ];
    return {
        tx: new web3.Transaction().add(...instructions),
        signers: [],
        accounts: instructions.flatMap((i) => i.keys.map((k) => k.pubkey)),
    };
}
exports.createUnstakeTransaction = createUnstakeTransaction;
async function unstake(mx, project, nftMint) {
    const projectAccount = await generated_1.Project.fromAccountAddress(mx.connection, project);
    const multipliers = await (0, utils_1.getOrFetchMultipliers)(mx.connection, project);
    const wallet = mx.identity();
    const claimCtx = (0, claimRewards_1.createClaimRewardsTransaction)(project, nftMint, projectAccount.rewardMint, wallet.publicKey, multipliers === null || multipliers === void 0 ? void 0 : multipliers.address);
    const unstakeCtx = createUnstakeTransaction(project, nftMint, wallet.publicKey);
    const blockhash = await mx.connection.getLatestBlockhash();
    const tx = new web3.Transaction().add(claimCtx.tx, unstakeCtx.tx);
    tx.recentBlockhash = blockhash.blockhash;
    const response = await mx
        .rpc()
        .sendAndConfirmTransaction(tx, { skipPreflight: true }, [
        ...claimCtx.signers,
        ...unstakeCtx.signers,
    ]);
    return {
        response,
    };
}
exports.unstake = unstake;
//# sourceMappingURL=unstake.js.map