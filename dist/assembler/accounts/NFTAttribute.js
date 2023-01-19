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
exports.nFTAttributeBeet = exports.NFTAttribute = exports.nFTAttributeDiscriminator = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
exports.nFTAttributeDiscriminator = [161, 3, 226, 65, 113, 87, 24, 132];
class NFTAttribute {
    constructor(bump, nft, block, blockDefinition, attributeName, attributeValue) {
        this.bump = bump;
        this.nft = nft;
        this.block = block;
        this.blockDefinition = blockDefinition;
        this.attributeName = attributeName;
        this.attributeValue = attributeValue;
    }
    static fromArgs(args) {
        return new NFTAttribute(args.bump, args.nft, args.block, args.blockDefinition, args.attributeName, args.attributeValue);
    }
    static fromAccountInfo(accountInfo, offset = 0) {
        return NFTAttribute.deserialize(accountInfo.data, offset);
    }
    static async fromAccountAddress(connection, address, commitmentOrConfig) {
        const accountInfo = await connection.getAccountInfo(address, commitmentOrConfig);
        if (accountInfo == null) {
            throw new Error(`Unable to find NFTAttribute account at ${address}`);
        }
        return NFTAttribute.fromAccountInfo(accountInfo, 0)[0];
    }
    static gpaBuilder(programId = new web3.PublicKey('AXX2agYcoDwGFsgEWvSitqfGH4ooKXUqK5P7Ch9raDJT')) {
        return beetSolana.GpaBuilder.fromStruct(programId, exports.nFTAttributeBeet);
    }
    static deserialize(buf, offset = 0) {
        return exports.nFTAttributeBeet.deserialize(buf, offset);
    }
    serialize() {
        return exports.nFTAttributeBeet.serialize({
            accountDiscriminator: exports.nFTAttributeDiscriminator,
            ...this,
        });
    }
    static byteSize(args) {
        const instance = NFTAttribute.fromArgs(args);
        return exports.nFTAttributeBeet.toFixedFromValue({
            accountDiscriminator: exports.nFTAttributeDiscriminator,
            ...instance,
        }).byteSize;
    }
    static async getMinimumBalanceForRentExemption(args, connection, commitment) {
        return connection.getMinimumBalanceForRentExemption(NFTAttribute.byteSize(args), commitment);
    }
    pretty() {
        return {
            bump: this.bump,
            nft: this.nft.toBase58(),
            block: this.block.toBase58(),
            blockDefinition: this.blockDefinition.toBase58(),
            attributeName: this.attributeName,
            attributeValue: this.attributeValue,
        };
    }
}
exports.NFTAttribute = NFTAttribute;
exports.nFTAttributeBeet = new beet.FixableBeetStruct([
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['nft', beetSolana.publicKey],
    ['block', beetSolana.publicKey],
    ['blockDefinition', beetSolana.publicKey],
    ['attributeName', beet.utf8String],
    ['attributeValue', beet.utf8String],
], NFTAttribute.fromArgs, 'NFTAttribute');
//# sourceMappingURL=NFTAttribute.js.map