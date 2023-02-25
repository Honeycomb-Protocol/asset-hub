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
exports.getAssetPda = exports.getMetadataAccount_ = exports.METADATA_PROGRAM_ID = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const assetmanager_1 = require("../generated/assetmanager");
exports.METADATA_PROGRAM_ID = new web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const getMetadataAccount_ = (mint, type, programId = exports.METADATA_PROGRAM_ID) => {
    const seeds = [
        Buffer.from("metadata"),
        programId.toBuffer(),
        mint.toBuffer(),
    ];
    if (type) {
        seeds.push(Buffer.from(type.__kind));
        switch (type.__kind) {
            case "token_record":
                seeds.push(type.tokenAccount.toBuffer());
                break;
            case "persistent_delegate":
                seeds.push(type.tokenAccountOwner.toBuffer());
                break;
            default:
                break;
        }
    }
    return web3.PublicKey.findProgramAddressSync(seeds, programId);
};
exports.getMetadataAccount_ = getMetadataAccount_;
const getAssetPda = (mint, programId = assetmanager_1.PROGRAM_ID) => {
    return web3.PublicKey.findProgramAddressSync([Buffer.from("asset"), mint.toBuffer()], programId);
};
exports.getAssetPda = getAssetPda;
//# sourceMappingURL=pdas.js.map