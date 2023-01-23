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
exports.blockBeet = exports.Block = exports.blockDiscriminator = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
const BlockType_1 = require("../types/BlockType");
exports.blockDiscriminator = [12, 72, 207, 108, 1, 228, 167, 221];
class Block {
    constructor(bump, assembler, blockOrder, isGraphical, blockType, blockName) {
        this.bump = bump;
        this.assembler = assembler;
        this.blockOrder = blockOrder;
        this.isGraphical = isGraphical;
        this.blockType = blockType;
        this.blockName = blockName;
    }
    static fromArgs(args) {
        return new Block(args.bump, args.assembler, args.blockOrder, args.isGraphical, args.blockType, args.blockName);
    }
    static fromAccountInfo(accountInfo, offset = 0) {
        return Block.deserialize(accountInfo.data, offset);
    }
    static async fromAccountAddress(connection, address, commitmentOrConfig) {
        const accountInfo = await connection.getAccountInfo(address, commitmentOrConfig);
        if (accountInfo == null) {
            throw new Error(`Unable to find Block account at ${address}`);
        }
        return Block.fromAccountInfo(accountInfo, 0)[0];
    }
    static gpaBuilder(programId = new web3.PublicKey('AXX2agYcoDwGFsgEWvSitqfGH4ooKXUqK5P7Ch9raDJT')) {
        return beetSolana.GpaBuilder.fromStruct(programId, exports.blockBeet);
    }
    static deserialize(buf, offset = 0) {
        return exports.blockBeet.deserialize(buf, offset);
    }
    serialize() {
        return exports.blockBeet.serialize({
            accountDiscriminator: exports.blockDiscriminator,
            ...this,
        });
    }
    static byteSize(args) {
        const instance = Block.fromArgs(args);
        return exports.blockBeet.toFixedFromValue({
            accountDiscriminator: exports.blockDiscriminator,
            ...instance,
        }).byteSize;
    }
    static async getMinimumBalanceForRentExemption(args, connection, commitment) {
        return connection.getMinimumBalanceForRentExemption(Block.byteSize(args), commitment);
    }
    pretty() {
        return {
            bump: this.bump,
            assembler: this.assembler.toBase58(),
            blockOrder: this.blockOrder,
            isGraphical: this.isGraphical,
            blockType: 'BlockType.' + BlockType_1.BlockType[this.blockType],
            blockName: this.blockName,
        };
    }
}
exports.Block = Block;
exports.blockBeet = new beet.FixableBeetStruct([
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['assembler', beetSolana.publicKey],
    ['blockOrder', beet.u8],
    ['isGraphical', beet.bool],
    ['blockType', BlockType_1.blockTypeBeet],
    ['blockName', beet.utf8String],
], Block.fromArgs, 'Block');
//# sourceMappingURL=Block.js.map