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
exports.createAssembler = exports.createCreateAssemblerTransaction = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const splToken = __importStar(require("@solana/spl-token"));
const generated_1 = require("../../generated");
const assembler_1 = require("../../generated/assembler");
const pdas_1 = require("../pdas");
function createCreateAssemblerTransaction(authority, payer, args, programId = assembler_1.PROGRAM_ID) {
    const collectionMint = web3.Keypair.generate();
    const collectionTokenAccount = splToken.getAssociatedTokenAddressSync(collectionMint.publicKey, authority);
    const [collectionMetadataAccount] = (0, pdas_1.getMetadataAccount_)(collectionMint.publicKey);
    const [collectionMasterEdition] = (0, pdas_1.getMetadataAccount_)(collectionMint.publicKey, { __kind: "edition" });
    const [assembler] = (0, pdas_1.getAssemblerPda)(collectionMint.publicKey);
    return {
        tx: new web3.Transaction().add((0, generated_1.createCreateAssemblerInstruction)({
            collectionMint: collectionMint.publicKey,
            collectionMetadataAccount,
            assembler,
            authority,
            payer,
            tokenMetadataProgram: pdas_1.METADATA_PROGRAM_ID,
        }, { args }, programId), splToken.createAssociatedTokenAccountInstruction(payer, collectionTokenAccount, authority, collectionMint.publicKey), (0, generated_1.createCreateAssemblerCollectionMasterEditionInstruction)({
            collectionMint: collectionMint.publicKey,
            collectionMetadataAccount,
            collectionMasterEdition,
            collectionTokenAccount,
            assembler,
            authority,
            payer,
            tokenMetadataProgram: pdas_1.METADATA_PROGRAM_ID,
        }, programId)),
        signers: [collectionMint],
        accounts: [
            collectionMint.publicKey,
            collectionMetadataAccount,
            collectionMasterEdition,
            collectionTokenAccount,
            assembler,
            authority,
            payer,
            pdas_1.METADATA_PROGRAM_ID,
        ],
        assembler,
    };
}
exports.createCreateAssemblerTransaction = createCreateAssemblerTransaction;
async function createAssembler(mx, args) {
    const wallet = mx.identity();
    const ctx = createCreateAssemblerTransaction(wallet.publicKey, wallet.publicKey, args);
    const blockhash = await mx.connection.getLatestBlockhash();
    ctx.tx.recentBlockhash = blockhash.blockhash;
    const response = await mx
        .rpc()
        .sendAndConfirmTransaction(ctx.tx, { skipPreflight: true }, ctx.signers);
    return {
        response,
        assembler: ctx.assembler,
    };
}
exports.createAssembler = createAssembler;
//# sourceMappingURL=createAssembler.js.map