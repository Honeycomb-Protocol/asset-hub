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
exports.addMultiplier = exports.createAddMultiplierTransaction = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const generated_1 = require("../../generated");
const staking_1 = require("../../generated/staking");
function createAddMultiplierTransaction(project, authority, payer, args, programId = staking_1.PROGRAM_ID) {
    const [multipliers] = web3.PublicKey.findProgramAddressSync([Buffer.from("multipliers"), project.toBuffer()], programId);
    const instructions = [
        (0, generated_1.createAddMultiplierInstruction)({
            project,
            multipliers,
            authority,
            payer,
            rentSysvar: web3.SYSVAR_RENT_PUBKEY,
        }, { args }, programId),
    ];
    return {
        tx: new web3.Transaction().add(...instructions),
        signers: [],
        accounts: instructions.flatMap((i) => i.keys.map((k) => k.pubkey)),
    };
}
exports.createAddMultiplierTransaction = createAddMultiplierTransaction;
async function addMultiplier(mx, project, args) {
    const wallet = mx.identity();
    const ctx = createAddMultiplierTransaction(project, wallet.publicKey, wallet.publicKey, args);
    const blockhash = await mx.connection.getLatestBlockhash();
    ctx.tx.recentBlockhash = blockhash.blockhash;
    const response = await mx
        .rpc()
        .sendAndConfirmTransaction(ctx.tx, { skipPreflight: true }, ctx.signers);
    return {
        response,
    };
}
exports.addMultiplier = addMultiplier;
//# sourceMappingURL=addMultiplier.js.map