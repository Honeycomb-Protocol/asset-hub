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
const utils_1 = require("../../utils");
function createCreateAssemblerTransaction(authority, payer, args, programId = assembler_1.PROGRAM_ID) {
    const collectionMint = web3.Keypair.generate();
    const [collectionMetadataAccount] = web3.PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        utils_1.METADATA_PROGRAM_ID.toBuffer(),
        collectionMint.publicKey.toBuffer(),
    ], utils_1.METADATA_PROGRAM_ID);
    const [collectionMasterEdition] = web3.PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        utils_1.METADATA_PROGRAM_ID.toBuffer(),
        collectionMint.publicKey.toBuffer(),
        Buffer.from("edition"),
    ], utils_1.METADATA_PROGRAM_ID);
    const collectionTokenAccount = splToken.getAssociatedTokenAddressSync(collectionMint.publicKey, authority);
    const [assembler] = web3.PublicKey.findProgramAddressSync([Buffer.from("assembler"), collectionMint.publicKey.toBuffer()], programId);
    return {
        tx: new web3.Transaction().add((0, generated_1.createCreateAssemblerInstruction)({
            collectionMint: collectionMint.publicKey,
            collectionMetadataAccount,
            assembler,
            authority,
            payer,
            tokenMetadataProgram: utils_1.METADATA_PROGRAM_ID,
        }, { args }, programId), splToken.createAssociatedTokenAccountInstruction(payer, collectionTokenAccount, authority, collectionMint.publicKey), (0, generated_1.createCreateAssemblerCollectionMasterEditionInstruction)({
            collectionMint: collectionMint.publicKey,
            collectionMetadataAccount,
            collectionMasterEdition,
            collectionTokenAccount,
            assembler,
            authority,
            payer,
            tokenMetadataProgram: utils_1.METADATA_PROGRAM_ID,
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
            utils_1.METADATA_PROGRAM_ID,
        ],
        assembler,
    };
}
exports.createCreateAssemblerTransaction = createCreateAssemblerTransaction;
async function createAssembler(connection, wallet, args) {
    const assemblerTx = createCreateAssemblerTransaction(wallet.publicKey, wallet.publicKey, args);
    const txId = await (0, utils_1.sendAndConfirmTransaction)(assemblerTx.tx, connection, wallet, assemblerTx.signers, { skipPreflight: true });
    return {
        txId,
        assembler: assemblerTx.assembler,
    };
}
exports.createAssembler = createAssembler;
//# sourceMappingURL=createAssembler.js.map