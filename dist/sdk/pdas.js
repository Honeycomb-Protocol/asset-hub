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
exports.getStakedNftDepositPda = exports.getStakedNftPda = exports.getStakerPda = exports.getAssetPda = exports.getUniqueConstraintPda = exports.getBlockDefinitionPda = exports.getDelegateAuthorityPda = exports.getBlockPda = exports.getDepositPda = exports.getNftPda = exports.getAssemblerPda = exports.getMetadataAccount_ = exports.METADATA_PROGRAM_ID = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const assembler_1 = require("../generated/assembler");
const assetmanager_1 = require("../generated/assetmanager");
const staking_1 = require("../generated/staking");
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
const getAssemblerPda = (collectionMint, programId = assembler_1.PROGRAM_ID) => {
    return web3.PublicKey.findProgramAddressSync([Buffer.from("assembler"), collectionMint.toBuffer()], programId);
};
exports.getAssemblerPda = getAssemblerPda;
const getNftPda = (mint, programId = assembler_1.PROGRAM_ID) => {
    return web3.PublicKey.findProgramAddressSync([Buffer.from("nft"), mint.toBuffer()], programId);
};
exports.getNftPda = getNftPda;
const getDepositPda = (tokenMint, nftMint, programId = assembler_1.PROGRAM_ID) => {
    return web3.PublicKey.findProgramAddressSync([Buffer.from("deposit"), tokenMint.toBuffer(), nftMint.toBuffer()], programId);
};
exports.getDepositPda = getDepositPda;
const getBlockPda = (assembler, blockOrder, programId = assembler_1.PROGRAM_ID) => {
    return web3.PublicKey.findProgramAddressSync([
        Buffer.from("block"),
        Uint8Array.from([blockOrder]),
        assembler.toBuffer(),
    ], programId);
};
exports.getBlockPda = getBlockPda;
const getDelegateAuthorityPda = (assembler, delegate, permission, programId = assembler_1.PROGRAM_ID) => {
    return web3.PublicKey.findProgramAddressSync([
        Buffer.from("delegate"),
        assembler.toBuffer(),
        delegate.toBuffer(),
        Buffer.from(assembler_1.DelegateAuthorityPermission[permission]),
    ], programId);
};
exports.getDelegateAuthorityPda = getDelegateAuthorityPda;
const getBlockDefinitionPda = (block, blockDefinitionMint, programId = assembler_1.PROGRAM_ID) => {
    return web3.PublicKey.findProgramAddressSync([
        Buffer.from("block_definition"),
        block.toBuffer(),
        blockDefinitionMint.toBuffer(),
    ], programId);
};
exports.getBlockDefinitionPda = getBlockDefinitionPda;
function getUniqueConstraintPda(blocks, assembler, programId = assembler_1.PROGRAM_ID) {
    const buffer = Buffer.alloc(blocks.length * 4);
    console.log(buffer.length);
    blocks
        .sort((a, b) => a.order - b.order)
        .forEach((x, i) => {
        console.log(x.order);
        buffer.writeUint16BE(x.blockDefinitionIndex, i * 4);
        buffer.writeUint16BE(x.order, i * 4 + 2);
    });
    return web3.PublicKey.findProgramAddressSync([buffer, assembler.toBuffer()], programId);
}
exports.getUniqueConstraintPda = getUniqueConstraintPda;
const getAssetPda = (mint, programId = assetmanager_1.PROGRAM_ID) => {
    return web3.PublicKey.findProgramAddressSync([Buffer.from("asset"), mint.toBuffer()], programId);
};
exports.getAssetPda = getAssetPda;
const getStakerPda = (project, wallet, programId = staking_1.PROGRAM_ID) => {
    return web3.PublicKey.findProgramAddressSync([Buffer.from("staker"), wallet.toBuffer(), project.toBuffer()], programId);
};
exports.getStakerPda = getStakerPda;
const getStakedNftPda = (project, mint, programId = staking_1.PROGRAM_ID) => {
    return web3.PublicKey.findProgramAddressSync([Buffer.from("nft"), mint.toBuffer(), project.toBuffer()], programId);
};
exports.getStakedNftPda = getStakedNftPda;
const getStakedNftDepositPda = (nftMint, programId = assembler_1.PROGRAM_ID) => {
    return web3.PublicKey.findProgramAddressSync([Buffer.from("deposit"), nftMint.toBuffer()], programId);
};
exports.getStakedNftDepositPda = getStakedNftDepositPda;
//# sourceMappingURL=pdas.js.map