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
exports.createAssetManager = exports.createCreateAssetManagerTransaction = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const utils_1 = require("../../utils");
const generated_1 = require("../../generated");
const assetmanager_1 = require("../../generated/assetmanager");
function createCreateAssetManagerTransaction(treasury, authority, payer, args, programId = assetmanager_1.PROGRAM_ID) {
    const key = web3.Keypair.generate().publicKey;
    const [assetManager] = web3.PublicKey.findProgramAddressSync([Buffer.from("asset_manager"), key.toBuffer()], programId);
    return {
        tx: new web3.Transaction().add((0, generated_1.createCreateAssetManagerInstruction)({
            key,
            assetManager,
            treasury,
            authority,
            payer,
        }, { args })),
        signers: [],
        accounts: [key, assetManager, treasury, authority, payer],
        assetManager,
    };
}
exports.createCreateAssetManagerTransaction = createCreateAssetManagerTransaction;
async function createAssetManager(connection, wallet, args) {
    const ctx = createCreateAssetManagerTransaction(wallet.publicKey, wallet.publicKey, wallet.publicKey, args);
    const txId = await (0, utils_1.sendAndConfirmTransaction)(ctx.tx, connection, wallet, ctx.signers, { skipPreflight: true });
    return {
        txId,
        assetManager: ctx.assetManager,
    };
}
exports.createAssetManager = createAssetManager;
//# sourceMappingURL=createAssetManager.js.map