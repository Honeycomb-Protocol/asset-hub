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
exports.blockDefinitionBeet = exports.BlockDefinition = exports.blockDefinitionDiscriminator = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
const BlockDefinitionValue_1 = require("../types/BlockDefinitionValue");
exports.blockDefinitionDiscriminator = [107, 76, 146, 41, 130, 62, 5, 143];
class BlockDefinition {
    constructor(bump, block, mint, value) {
        this.bump = bump;
        this.block = block;
        this.mint = mint;
        this.value = value;
    }
    static fromArgs(args) {
        return new BlockDefinition(args.bump, args.block, args.mint, args.value);
    }
    static fromAccountInfo(accountInfo, offset = 0) {
        return BlockDefinition.deserialize(accountInfo.data, offset);
    }
    static async fromAccountAddress(connection, address, commitmentOrConfig) {
        const accountInfo = await connection.getAccountInfo(address, commitmentOrConfig);
        if (accountInfo == null) {
            throw new Error(`Unable to find BlockDefinition account at ${address}`);
        }
        return BlockDefinition.fromAccountInfo(accountInfo, 0)[0];
    }
    static gpaBuilder(programId = new web3.PublicKey('AXX2agYcoDwGFsgEWvSitqfGH4ooKXUqK5P7Ch9raDJT')) {
        return beetSolana.GpaBuilder.fromStruct(programId, exports.blockDefinitionBeet);
    }
    static deserialize(buf, offset = 0) {
        return exports.blockDefinitionBeet.deserialize(buf, offset);
    }
    serialize() {
        return exports.blockDefinitionBeet.serialize({
            accountDiscriminator: exports.blockDefinitionDiscriminator,
            ...this,
        });
    }
    static byteSize(args) {
        const instance = BlockDefinition.fromArgs(args);
        return exports.blockDefinitionBeet.toFixedFromValue({
            accountDiscriminator: exports.blockDefinitionDiscriminator,
            ...instance,
        }).byteSize;
    }
    static async getMinimumBalanceForRentExemption(args, connection, commitment) {
        return connection.getMinimumBalanceForRentExemption(BlockDefinition.byteSize(args), commitment);
    }
    pretty() {
        return {
            bump: this.bump,
            block: this.block.toBase58(),
            mint: this.mint.toBase58(),
            value: this.value.__kind,
        };
    }
}
exports.BlockDefinition = BlockDefinition;
exports.blockDefinitionBeet = new beet.FixableBeetStruct([
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['block', beetSolana.publicKey],
    ['mint', beetSolana.publicKey],
    ['value', BlockDefinitionValue_1.blockDefinitionValueBeet],
], BlockDefinition.fromArgs, 'BlockDefinition');
//# sourceMappingURL=BlockDefinition.js.map