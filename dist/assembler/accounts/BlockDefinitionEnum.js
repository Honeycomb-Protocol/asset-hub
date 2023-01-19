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
exports.blockDefinitionEnumBeet = exports.BlockDefinitionEnum = exports.blockDefinitionEnumDiscriminator = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
exports.blockDefinitionEnumDiscriminator = [
    96, 135, 54, 133, 70, 183, 156, 24,
];
class BlockDefinitionEnum {
    constructor(bump, block, mint, isCollection, value, image) {
        this.bump = bump;
        this.block = block;
        this.mint = mint;
        this.isCollection = isCollection;
        this.value = value;
        this.image = image;
    }
    static fromArgs(args) {
        return new BlockDefinitionEnum(args.bump, args.block, args.mint, args.isCollection, args.value, args.image);
    }
    static fromAccountInfo(accountInfo, offset = 0) {
        return BlockDefinitionEnum.deserialize(accountInfo.data, offset);
    }
    static async fromAccountAddress(connection, address, commitmentOrConfig) {
        const accountInfo = await connection.getAccountInfo(address, commitmentOrConfig);
        if (accountInfo == null) {
            throw new Error(`Unable to find BlockDefinitionEnum account at ${address}`);
        }
        return BlockDefinitionEnum.fromAccountInfo(accountInfo, 0)[0];
    }
    static gpaBuilder(programId = new web3.PublicKey('AXX2agYcoDwGFsgEWvSitqfGH4ooKXUqK5P7Ch9raDJT')) {
        return beetSolana.GpaBuilder.fromStruct(programId, exports.blockDefinitionEnumBeet);
    }
    static deserialize(buf, offset = 0) {
        return exports.blockDefinitionEnumBeet.deserialize(buf, offset);
    }
    serialize() {
        return exports.blockDefinitionEnumBeet.serialize({
            accountDiscriminator: exports.blockDefinitionEnumDiscriminator,
            ...this,
        });
    }
    static byteSize(args) {
        const instance = BlockDefinitionEnum.fromArgs(args);
        return exports.blockDefinitionEnumBeet.toFixedFromValue({
            accountDiscriminator: exports.blockDefinitionEnumDiscriminator,
            ...instance,
        }).byteSize;
    }
    static async getMinimumBalanceForRentExemption(args, connection, commitment) {
        return connection.getMinimumBalanceForRentExemption(BlockDefinitionEnum.byteSize(args), commitment);
    }
    pretty() {
        return {
            bump: this.bump,
            block: this.block.toBase58(),
            mint: this.mint.toBase58(),
            isCollection: this.isCollection,
            value: this.value,
            image: this.image,
        };
    }
}
exports.BlockDefinitionEnum = BlockDefinitionEnum;
exports.blockDefinitionEnumBeet = new beet.FixableBeetStruct([
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['block', beetSolana.publicKey],
    ['mint', beetSolana.publicKey],
    ['isCollection', beet.bool],
    ['value', beet.utf8String],
    ['image', beet.coption(beet.utf8String)],
], BlockDefinitionEnum.fromArgs, 'BlockDefinitionEnum');
//# sourceMappingURL=BlockDefinitionEnum.js.map