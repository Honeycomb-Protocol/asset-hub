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
exports.claimRewards = exports.createClaimRewardsTransaction = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const splToken = __importStar(require("@solana/spl-token"));
const generated_1 = require("../../generated");
const staking_1 = require("../../generated/staking");
const utils_1 = require("../../utils");
function createClaimRewardsTransaction(project, nftMint, rewardMint, wallet, multipliers, programId = staking_1.PROGRAM_ID) {
    const [nft] = web3.PublicKey.findProgramAddressSync([Buffer.from("nft"), nftMint.toBuffer(), project.toBuffer()], programId);
    const [vault] = web3.PublicKey.findProgramAddressSync([Buffer.from("vault"), project.toBuffer(), rewardMint.toBuffer()], programId);
    const tokenAccount = splToken.getAssociatedTokenAddressSync(rewardMint, wallet);
    const [staker] = web3.PublicKey.findProgramAddressSync([Buffer.from("staker"), wallet.toBuffer(), project.toBuffer()], programId);
    const instructions = [
        (0, generated_1.createClaimRewardsInstruction)({
            project,
            multipliers: multipliers || programId,
            nft,
            rewardMint,
            vault,
            tokenAccount,
            staker,
            wallet,
            clock: web3.SYSVAR_CLOCK_PUBKEY,
        }, programId),
    ];
    return {
        tx: new web3.Transaction().add(...instructions),
        signers: [],
        accounts: instructions.flatMap((i) => i.keys.map((k) => k.pubkey)),
    };
}
exports.createClaimRewardsTransaction = createClaimRewardsTransaction;
async function claimRewards(mx, project, nftMint) {
    const projectAccount = await generated_1.Project.fromAccountAddress(mx.connection, project);
    const multipliers = await (0, utils_1.getOrFetchMultipliers)(mx.connection, project);
    const wallet = mx.identity();
    const ctx = createClaimRewardsTransaction(project, nftMint, projectAccount.rewardMint, wallet.publicKey, multipliers === null || multipliers === void 0 ? void 0 : multipliers.address);
    const blockhash = await mx.connection.getLatestBlockhash();
    ctx.tx.recentBlockhash = blockhash.blockhash;
    const response = await mx
        .rpc()
        .sendAndConfirmTransaction(ctx.tx, { skipPreflight: true }, ctx.signers);
    return {
        response,
    };
}
exports.claimRewards = claimRewards;
//# sourceMappingURL=claimRewards.js.map