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
exports.createDelegateAuthority = exports.createCreateDelegateAuthorityTransaction = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const generated_1 = require("../../generated");
const assembler_1 = require("../../generated/assembler");
const pdas_1 = require("../pdas");
function createCreateDelegateAuthorityTransaction(assembler, delegate, authority, payer, args, programId = assembler_1.PROGRAM_ID) {
    const [delegateAuthority] = (0, pdas_1.getDelegateAuthorityPda)(assembler, delegate, args.permission);
    return {
        tx: new web3.Transaction().add((0, generated_1.createCreateDelegateAuthorityInstruction)({
            assembler,
            delegateAuthority,
            delegate,
            authority,
            payer,
        }, { args }, programId)),
        signers: [],
        accounts: [assembler, delegateAuthority, delegate, authority, payer],
        delegateAuthority,
    };
}
exports.createCreateDelegateAuthorityTransaction = createCreateDelegateAuthorityTransaction;
async function createDelegateAuthority(mx, assembler, delegate, args) {
    const wallet = mx.identity();
    const ctx = createCreateDelegateAuthorityTransaction(assembler, delegate, wallet.publicKey, wallet.publicKey, args);
    const blockhash = await mx.connection.getLatestBlockhash();
    ctx.tx.recentBlockhash = blockhash.blockhash;
    const response = await mx
        .rpc()
        .sendAndConfirmTransaction(ctx.tx, { skipPreflight: true }, ctx.signers)
        .catch((e) => {
        console.log(e.cause);
    });
    return {
        response,
    };
}
exports.createDelegateAuthority = createDelegateAuthority;
//# sourceMappingURL=createDelegateAuthority.js.map