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
exports.blockDefinitionBooleanBeet = exports.BlockDefinitionBoolean = exports.blockDefinitionBooleanDiscriminator = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
exports.blockDefinitionBooleanDiscriminator = [
    188, 13, 157, 245, 205, 83, 200, 45,
];
class BlockDefinitionBoolean {
    constructor(bump, block, value) {
        this.bump = bump;
        this.block = block;
        this.value = value;
    }
    static fromArgs(args) {
        return new BlockDefinitionBoolean(args.bump, args.block, args.value);
    }
    static fromAccountInfo(accountInfo, offset = 0) {
        return BlockDefinitionBoolean.deserialize(accountInfo.data, offset);
    }
    static async fromAccountAddress(connection, address, commitmentOrConfig) {
        const accountInfo = await connection.getAccountInfo(address, commitmentOrConfig);
        if (accountInfo == null) {
            throw new Error(`Unable to find BlockDefinitionBoolean account at ${address}`);
        }
        return BlockDefinitionBoolean.fromAccountInfo(accountInfo, 0)[0];
    }
    static gpaBuilder(programId = new web3.PublicKey('AXX2agYcoDwGFsgEWvSitqfGH4ooKXUqK5P7Ch9raDJT')) {
        return beetSolana.GpaBuilder.fromStruct(programId, exports.blockDefinitionBooleanBeet);
    }
    static deserialize(buf, offset = 0) {
        return exports.blockDefinitionBooleanBeet.deserialize(buf, offset);
    }
    serialize() {
        return exports.blockDefinitionBooleanBeet.serialize({
            accountDiscriminator: exports.blockDefinitionBooleanDiscriminator,
            ...this,
        });
    }
    static get byteSize() {
        return exports.blockDefinitionBooleanBeet.byteSize;
    }
    static async getMinimumBalanceForRentExemption(connection, commitment) {
        return connection.getMinimumBalanceForRentExemption(BlockDefinitionBoolean.byteSize, commitment);
    }
    static hasCorrectByteSize(buf, offset = 0) {
        return buf.byteLength - offset === BlockDefinitionBoolean.byteSize;
    }
    pretty() {
        return {
            bump: this.bump,
            block: this.block.toBase58(),
            value: this.value,
        };
    }
}
exports.BlockDefinitionBoolean = BlockDefinitionBoolean;
exports.blockDefinitionBooleanBeet = new beet.BeetStruct([
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['block', beetSolana.publicKey],
    ['value', beet.bool],
], BlockDefinitionBoolean.fromArgs, 'BlockDefinitionBoolean');
//# sourceMappingURL=BlockDefinitionBoolean.js.map