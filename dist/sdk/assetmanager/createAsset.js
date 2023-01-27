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
exports.createAsset = exports.buildCreateAssetCtx = exports.createCreateAssetTransaction = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const utils_1 = require("../../utils");
const generated_1 = require("../../generated");
const assetmanager_1 = require("../../generated/assetmanager");
function createCreateAssetTransaction(payer, args, programId = assetmanager_1.PROGRAM_ID) {
    const mintKeypair = web3.Keypair.generate();
    const [metadata] = web3.PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        utils_1.METADATA_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
    ], utils_1.METADATA_PROGRAM_ID);
    const [asset] = web3.PublicKey.findProgramAddressSync([Buffer.from("asset"), mintKeypair.publicKey.toBuffer()], programId);
    return {
        tx: new web3.Transaction().add((0, generated_1.createCreateAssetInstruction)({
            mint: mintKeypair.publicKey,
            metadata,
            asset,
            owner: payer,
            tokenMetadataProgram: utils_1.METADATA_PROGRAM_ID,
        }, { args })),
        signers: [mintKeypair],
        accounts: [
            mintKeypair.publicKey,
            metadata,
            asset,
            payer,
            utils_1.METADATA_PROGRAM_ID,
        ],
        mint: mintKeypair.publicKey,
        asset,
    };
}
exports.createCreateAssetTransaction = createCreateAssetTransaction;
async function buildCreateAssetCtx(mx, args, candyGuardBuilder) {
    let wallet = mx.identity();
    const ctx = createCreateAssetTransaction(wallet.publicKey, args);
    const blockhash = await mx.connection.getLatestBlockhash();
    if (candyGuardBuilder) {
        ctx.tx = new web3.Transaction().add(candyGuardBuilder.toTransaction(blockhash), ctx.tx);
        ctx.signers = [
            ...candyGuardBuilder.getSigners(),
            ...ctx.signers,
        ];
    }
    ctx.tx.recentBlockhash = blockhash.blockhash;
    return ctx;
}
exports.buildCreateAssetCtx = buildCreateAssetCtx;
async function createAsset(mx, args, candyGuardBuilder) {
    const ctx = await buildCreateAssetCtx(mx, args, candyGuardBuilder);
    const response = await mx
        .rpc()
        .sendAndConfirmTransaction(ctx.tx, { skipPreflight: true }, ctx.signers);
    return {
        response,
        mint: ctx.mint,
    };
}
exports.createAsset = createAsset;
//# sourceMappingURL=createAsset.js.map