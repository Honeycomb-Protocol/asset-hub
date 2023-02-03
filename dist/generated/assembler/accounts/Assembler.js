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
exports.assemblerBeet = exports.Assembler = exports.assemblerDiscriminator = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
const AssemblingAction_1 = require("../types/AssemblingAction");
exports.assemblerDiscriminator = [102, 198, 246, 85, 86, 197, 55, 95];
class Assembler {
    constructor(bump, authority, collection, collectionName, collectionSymbol, collectionDescription, nftBaseUri, assemblingAction, nfts, allowDuplicates, defaultRoyalty) {
        this.bump = bump;
        this.authority = authority;
        this.collection = collection;
        this.collectionName = collectionName;
        this.collectionSymbol = collectionSymbol;
        this.collectionDescription = collectionDescription;
        this.nftBaseUri = nftBaseUri;
        this.assemblingAction = assemblingAction;
        this.nfts = nfts;
        this.allowDuplicates = allowDuplicates;
        this.defaultRoyalty = defaultRoyalty;
    }
    static fromArgs(args) {
        return new Assembler(args.bump, args.authority, args.collection, args.collectionName, args.collectionSymbol, args.collectionDescription, args.nftBaseUri, args.assemblingAction, args.nfts, args.allowDuplicates, args.defaultRoyalty);
    }
    static fromAccountInfo(accountInfo, offset = 0) {
        return Assembler.deserialize(accountInfo.data, offset);
    }
    static async fromAccountAddress(connection, address, commitmentOrConfig) {
        const accountInfo = await connection.getAccountInfo(address, commitmentOrConfig);
        if (accountInfo == null) {
            throw new Error(`Unable to find Assembler account at ${address}`);
        }
        return Assembler.fromAccountInfo(accountInfo, 0)[0];
    }
    static gpaBuilder(programId = new web3.PublicKey('4cEhZgkh41JbuXsXdcKhNaeHJ2BpzmXN3VpMQ3nFPDrp')) {
        return beetSolana.GpaBuilder.fromStruct(programId, exports.assemblerBeet);
    }
    static deserialize(buf, offset = 0) {
        return exports.assemblerBeet.deserialize(buf, offset);
    }
    serialize() {
        return exports.assemblerBeet.serialize({
            accountDiscriminator: exports.assemblerDiscriminator,
            ...this,
        });
    }
    static byteSize(args) {
        const instance = Assembler.fromArgs(args);
        return exports.assemblerBeet.toFixedFromValue({
            accountDiscriminator: exports.assemblerDiscriminator,
            ...instance,
        }).byteSize;
    }
    static async getMinimumBalanceForRentExemption(args, connection, commitment) {
        return connection.getMinimumBalanceForRentExemption(Assembler.byteSize(args), commitment);
    }
    pretty() {
        return {
            bump: this.bump,
            authority: this.authority.toBase58(),
            collection: this.collection.toBase58(),
            collectionName: this.collectionName,
            collectionSymbol: this.collectionSymbol,
            collectionDescription: this.collectionDescription,
            nftBaseUri: this.nftBaseUri,
            assemblingAction: 'AssemblingAction.' + AssemblingAction_1.AssemblingAction[this.assemblingAction],
            nfts: this.nfts,
            allowDuplicates: this.allowDuplicates,
            defaultRoyalty: this.defaultRoyalty,
        };
    }
}
exports.Assembler = Assembler;
exports.assemblerBeet = new beet.FixableBeetStruct([
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['authority', beetSolana.publicKey],
    ['collection', beetSolana.publicKey],
    ['collectionName', beet.utf8String],
    ['collectionSymbol', beet.utf8String],
    ['collectionDescription', beet.utf8String],
    ['nftBaseUri', beet.utf8String],
    ['assemblingAction', AssemblingAction_1.assemblingActionBeet],
    ['nfts', beet.u16],
    ['allowDuplicates', beet.bool],
    ['defaultRoyalty', beet.u16],
], Assembler.fromArgs, 'Assembler');
//# sourceMappingURL=Assembler.js.map