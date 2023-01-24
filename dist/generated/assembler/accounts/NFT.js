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
exports.nFTBeet = exports.NFT = exports.nFTDiscriminator = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
exports.nFTDiscriminator = [88, 10, 146, 176, 101, 11, 40, 217];
class NFT {
    constructor(bump, assembler, authority, collectionAddress, mint, name, symbol, description, minted, id, uri) {
        this.bump = bump;
        this.assembler = assembler;
        this.authority = authority;
        this.collectionAddress = collectionAddress;
        this.mint = mint;
        this.name = name;
        this.symbol = symbol;
        this.description = description;
        this.minted = minted;
        this.id = id;
        this.uri = uri;
    }
    static fromArgs(args) {
        return new NFT(args.bump, args.assembler, args.authority, args.collectionAddress, args.mint, args.name, args.symbol, args.description, args.minted, args.id, args.uri);
    }
    static fromAccountInfo(accountInfo, offset = 0) {
        return NFT.deserialize(accountInfo.data, offset);
    }
    static async fromAccountAddress(connection, address, commitmentOrConfig) {
        const accountInfo = await connection.getAccountInfo(address, commitmentOrConfig);
        if (accountInfo == null) {
            throw new Error(`Unable to find NFT account at ${address}`);
        }
        return NFT.fromAccountInfo(accountInfo, 0)[0];
    }
    static gpaBuilder(programId = new web3.PublicKey('AXX2agYcoDwGFsgEWvSitqfGH4ooKXUqK5P7Ch9raDJT')) {
        return beetSolana.GpaBuilder.fromStruct(programId, exports.nFTBeet);
    }
    static deserialize(buf, offset = 0) {
        return exports.nFTBeet.deserialize(buf, offset);
    }
    serialize() {
        return exports.nFTBeet.serialize({
            accountDiscriminator: exports.nFTDiscriminator,
            ...this,
        });
    }
    static byteSize(args) {
        const instance = NFT.fromArgs(args);
        return exports.nFTBeet.toFixedFromValue({
            accountDiscriminator: exports.nFTDiscriminator,
            ...instance,
        }).byteSize;
    }
    static async getMinimumBalanceForRentExemption(args, connection, commitment) {
        return connection.getMinimumBalanceForRentExemption(NFT.byteSize(args), commitment);
    }
    pretty() {
        return {
            bump: this.bump,
            assembler: this.assembler.toBase58(),
            authority: this.authority.toBase58(),
            collectionAddress: this.collectionAddress.toBase58(),
            mint: this.mint.toBase58(),
            name: this.name,
            symbol: this.symbol,
            description: this.description,
            minted: this.minted,
            id: this.id,
            uri: this.uri,
        };
    }
}
exports.NFT = NFT;
exports.nFTBeet = new beet.FixableBeetStruct([
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['assembler', beetSolana.publicKey],
    ['authority', beetSolana.publicKey],
    ['collectionAddress', beetSolana.publicKey],
    ['mint', beetSolana.publicKey],
    ['name', beet.utf8String],
    ['symbol', beet.utf8String],
    ['description', beet.utf8String],
    ['minted', beet.bool],
    ['id', beet.u16],
    ['uri', beet.utf8String],
], NFT.fromArgs, 'NFT');
//# sourceMappingURL=NFT.js.map