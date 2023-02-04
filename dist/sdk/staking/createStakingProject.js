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
exports.createStakingProject = exports.createCreateStakingProjectTransaction = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const generated_1 = require("../../generated");
const staking_1 = require("../../generated/staking");
const updateStakingProject_1 = require("./updateStakingProject");
const initMultipliers_1 = require("./initMultipliers");
const addMultiplier_1 = require("./addMultiplier");
function createCreateStakingProjectTransaction(rewardMint, authority, payer, args, collections = [], creators = [], multipliers = [], multipliersDecimals = 9, programId = staking_1.PROGRAM_ID) {
    const key = web3.Keypair.generate().publicKey;
    const [project] = web3.PublicKey.findProgramAddressSync([Buffer.from("project"), key.toBuffer()], programId);
    const [vault] = web3.PublicKey.findProgramAddressSync([Buffer.from("vault"), project.toBuffer(), rewardMint.toBuffer()], programId);
    const instructions = [
        (0, generated_1.createCreateProjectInstruction)({
            key,
            project,
            rewardMint,
            vault,
            authority,
            payer,
        }, { args }, programId),
        ...collections.map((collection) => (0, updateStakingProject_1.createUpdateStakingProjectTransaction)(project, authority, {
            name: null,
            rewardsPerDuration: null,
            rewardsDuration: null,
            maxRewardsDuration: null,
            minStakeDuration: null,
            cooldownDuration: null,
            resetStakeDuration: null,
            startTime: null,
            endTime: null,
        }, collection).tx.instructions[0]),
        ...creators.map((creator) => (0, updateStakingProject_1.createUpdateStakingProjectTransaction)(project, authority, {
            name: null,
            rewardsPerDuration: null,
            rewardsDuration: null,
            maxRewardsDuration: null,
            minStakeDuration: null,
            cooldownDuration: null,
            resetStakeDuration: null,
            startTime: null,
            endTime: null,
        }, undefined, creator).tx.instructions[0]),
        ...(multipliers.length
            ? [
                (0, initMultipliers_1.createInitMultiplierTransaction)(project, authority, {
                    decimals: multipliersDecimals,
                }).tx.instructions[0],
                ...multipliers.map((multiplier) => (0, addMultiplier_1.createAddMultiplierTransaction)(project, authority, payer, multiplier).tx.instructions[0]),
            ]
            : []),
    ];
    return {
        tx: new web3.Transaction().add(...instructions),
        signers: [],
        accounts: instructions.flatMap((i) => i.keys.map((k) => k.pubkey)),
        project,
    };
}
exports.createCreateStakingProjectTransaction = createCreateStakingProjectTransaction;
async function createStakingProject(mx, rewardMint, args, collections = [], creators = [], multipliers = [], multipliersDecimals = 9) {
    const wallet = mx.identity();
    const ctx = createCreateStakingProjectTransaction(rewardMint, wallet.publicKey, wallet.publicKey, args, collections, creators, multipliers, multipliersDecimals);
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
exports.createStakingProject = createStakingProject;
//# sourceMappingURL=createStakingProject.js.map