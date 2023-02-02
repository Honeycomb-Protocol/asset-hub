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
exports.updateAssembler = exports.createUpdateAssemblerTransaction = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const generated_1 = require("../../generated");
const assembler_1 = require("../../generated/assembler");
function createUpdateAssemblerTransaction(assembler, authority, args, delegate, newAuthority, programId = assembler_1.PROGRAM_ID) {
    return {
        tx: new web3.Transaction().add((0, generated_1.createUpdateAssemblerInstruction)({
            assembler,
            authority,
            delegate: delegate || programId,
            newAuthority: newAuthority || programId,
        }, { args }, programId)),
        signers: [],
        accounts: [assembler, authority, delegate, newAuthority],
        assembler,
    };
}
exports.createUpdateAssemblerTransaction = createUpdateAssemblerTransaction;
async function updateAssembler(mx, assembler, args, newAuthority) {
    const wallet = mx.identity();
    const ctx = createUpdateAssemblerTransaction(assembler, wallet.publicKey, args, undefined, newAuthority);
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
exports.updateAssembler = updateAssembler;
//# sourceMappingURL=updateAssembler.js.map