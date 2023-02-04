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
exports.fundRewards = exports.createFundRewardsTransaction = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const splToken = __importStar(require("@solana/spl-token"));
const generated_1 = require("../../generated");
const staking_1 = require("../../generated/staking");
function createFundRewardsTransaction(project, rewardMint, wallet, amount, programId = staking_1.PROGRAM_ID) {
    const [vault] = web3.PublicKey.findProgramAddressSync([Buffer.from("vault"), project.toBuffer(), rewardMint.toBuffer()], programId);
    const tokenAccount = splToken.getAssociatedTokenAddressSync(rewardMint, wallet);
    const instructions = [
        (0, generated_1.createFundRewardsInstruction)({
            project,
            rewardMint,
            vault,
            tokenAccount,
            wallet,
        }, {
            amount,
        }, programId),
    ];
    return {
        tx: new web3.Transaction().add(...instructions),
        signers: [],
        accounts: instructions.flatMap((i) => i.keys.map((k) => k.pubkey)),
        project,
    };
}
exports.createFundRewardsTransaction = createFundRewardsTransaction;
async function fundRewards(mx, project, amount) {
    const projectAccount = await generated_1.Project.fromAccountAddress(mx.connection, project);
    const wallet = mx.identity();
    const ctx = createFundRewardsTransaction(project, projectAccount.rewardMint, wallet.publicKey, amount);
    const blockhash = await mx.connection.getLatestBlockhash();
    ctx.tx.recentBlockhash = blockhash.blockhash;
    const response = await mx
        .rpc()
        .sendAndConfirmTransaction(ctx.tx, { skipPreflight: true }, ctx.signers);
    return {
        response,
        project: ctx.project,
    };
}
exports.fundRewards = fundRewards;
//# sourceMappingURL=fundRewards.js.map