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
exports.createBlockDefinition = exports.createCreateBlockDefinitionTransaction = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const generated_1 = require("../../generated");
const assembler_1 = require("../../generated/assembler");
const utils_1 = require("../../utils");
function createCreateBlockDefinitionTransaction(assembler, block, blockDefinitionMint, authority, payer, args) {
    const [blockDefinition] = web3.PublicKey.findProgramAddressSync([
        Buffer.from("block_definition"),
        block.toBuffer(),
        blockDefinitionMint.toBuffer(),
    ], assembler_1.PROGRAM_ID);
    return {
        tx: new web3.Transaction().add((0, generated_1.createCreateBlockDefinitionInstruction)({
            assembler,
            block,
            blockDefinition,
            blockDefinitionMint,
            authority,
            payer,
        }, { args })),
        signers: [],
        accounts: [
            assembler,
            block,
            blockDefinition,
            blockDefinitionMint,
            authority,
            payer,
        ],
        blockDefinition,
    };
}
exports.createCreateBlockDefinitionTransaction = createCreateBlockDefinitionTransaction;
async function createBlockDefinition(connection, wallet, assembler, block, blockDefinitionMint, args) {
    const { tx, signers, blockDefinition } = createCreateBlockDefinitionTransaction(assembler, block, blockDefinitionMint, wallet.publicKey, wallet.publicKey, args);
    const txId = await (0, utils_1.sendAndConfirmTransaction)(tx, connection, wallet, signers, { skipPreflight: true });
    return {
        txId,
        blockDefinition,
    };
}
exports.createBlockDefinition = createBlockDefinition;
//# sourceMappingURL=createBlockDefinition.js.map