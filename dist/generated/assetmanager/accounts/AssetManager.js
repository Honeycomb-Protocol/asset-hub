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
exports.assetManagerBeet = exports.AssetManager = exports.assetManagerDiscriminator = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
exports.assetManagerDiscriminator = [136, 86, 167, 98, 220, 48, 54, 97];
class AssetManager {
    constructor(bump, key, authority, treasury, name) {
        this.bump = bump;
        this.key = key;
        this.authority = authority;
        this.treasury = treasury;
        this.name = name;
    }
    static fromArgs(args) {
        return new AssetManager(args.bump, args.key, args.authority, args.treasury, args.name);
    }
    static fromAccountInfo(accountInfo, offset = 0) {
        return AssetManager.deserialize(accountInfo.data, offset);
    }
    static async fromAccountAddress(connection, address, commitmentOrConfig) {
        const accountInfo = await connection.getAccountInfo(address, commitmentOrConfig);
        if (accountInfo == null) {
            throw new Error(`Unable to find AssetManager account at ${address}`);
        }
        return AssetManager.fromAccountInfo(accountInfo, 0)[0];
    }
    static gpaBuilder(programId = new web3.PublicKey('BNGKUeQQHw2MgZc9EqFsCWmnkLEKLCUfu5cw9YFWK3hF')) {
        return beetSolana.GpaBuilder.fromStruct(programId, exports.assetManagerBeet);
    }
    static deserialize(buf, offset = 0) {
        return exports.assetManagerBeet.deserialize(buf, offset);
    }
    serialize() {
        return exports.assetManagerBeet.serialize({
            accountDiscriminator: exports.assetManagerDiscriminator,
            ...this,
        });
    }
    static byteSize(args) {
        const instance = AssetManager.fromArgs(args);
        return exports.assetManagerBeet.toFixedFromValue({
            accountDiscriminator: exports.assetManagerDiscriminator,
            ...instance,
        }).byteSize;
    }
    static async getMinimumBalanceForRentExemption(args, connection, commitment) {
        return connection.getMinimumBalanceForRentExemption(AssetManager.byteSize(args), commitment);
    }
    pretty() {
        return {
            bump: this.bump,
            key: this.key.toBase58(),
            authority: this.authority.toBase58(),
            treasury: this.treasury.toBase58(),
            name: this.name,
        };
    }
}
exports.AssetManager = AssetManager;
exports.assetManagerBeet = new beet.FixableBeetStruct([
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['key', beetSolana.publicKey],
    ['authority', beetSolana.publicKey],
    ['treasury', beetSolana.publicKey],
    ['name', beet.utf8String],
], AssetManager.fromArgs, 'AssetManager');
//# sourceMappingURL=AssetManager.js.map