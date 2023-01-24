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
exports.assetBeet = exports.Asset = exports.assetDiscriminator = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
exports.assetDiscriminator = [234, 180, 241, 252, 139, 224, 160, 8];
class Asset {
    constructor(bump, owner, candyGuard, mint, itemsRedeemed, uri) {
        this.bump = bump;
        this.owner = owner;
        this.candyGuard = candyGuard;
        this.mint = mint;
        this.itemsRedeemed = itemsRedeemed;
        this.uri = uri;
    }
    static fromArgs(args) {
        return new Asset(args.bump, args.owner, args.candyGuard, args.mint, args.itemsRedeemed, args.uri);
    }
    static fromAccountInfo(accountInfo, offset = 0) {
        return Asset.deserialize(accountInfo.data, offset);
    }
    static async fromAccountAddress(connection, address, commitmentOrConfig) {
        const accountInfo = await connection.getAccountInfo(address, commitmentOrConfig);
        if (accountInfo == null) {
            throw new Error(`Unable to find Asset account at ${address}`);
        }
        return Asset.fromAccountInfo(accountInfo, 0)[0];
    }
    static gpaBuilder(programId = new web3.PublicKey('BNGKUeQQHw2MgZc9EqFsCWmnkLEKLCUfu5cw9YFWK3hF')) {
        return beetSolana.GpaBuilder.fromStruct(programId, exports.assetBeet);
    }
    static deserialize(buf, offset = 0) {
        return exports.assetBeet.deserialize(buf, offset);
    }
    serialize() {
        return exports.assetBeet.serialize({
            accountDiscriminator: exports.assetDiscriminator,
            ...this,
        });
    }
    static byteSize(args) {
        const instance = Asset.fromArgs(args);
        return exports.assetBeet.toFixedFromValue({
            accountDiscriminator: exports.assetDiscriminator,
            ...instance,
        }).byteSize;
    }
    static async getMinimumBalanceForRentExemption(args, connection, commitment) {
        return connection.getMinimumBalanceForRentExemption(Asset.byteSize(args), commitment);
    }
    pretty() {
        return {
            bump: this.bump,
            owner: this.owner.toBase58(),
            candyGuard: this.candyGuard,
            mint: this.mint.toBase58(),
            itemsRedeemed: (() => {
                const x = this.itemsRedeemed;
                if (typeof x.toNumber === 'function') {
                    try {
                        return x.toNumber();
                    }
                    catch (_) {
                        return x;
                    }
                }
                return x;
            })(),
            uri: this.uri,
        };
    }
}
exports.Asset = Asset;
exports.assetBeet = new beet.FixableBeetStruct([
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['owner', beetSolana.publicKey],
    ['candyGuard', beet.coption(beetSolana.publicKey)],
    ['mint', beetSolana.publicKey],
    ['itemsRedeemed', beet.u64],
    ['uri', beet.utf8String],
], Asset.fromArgs, 'Asset');
//# sourceMappingURL=Asset.js.map