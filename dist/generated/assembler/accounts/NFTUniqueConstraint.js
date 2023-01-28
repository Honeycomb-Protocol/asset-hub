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
exports.nFTUniqueConstraintBeet = exports.NFTUniqueConstraint = exports.nFTUniqueConstraintDiscriminator = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
exports.nFTUniqueConstraintDiscriminator = [
    75, 203, 174, 40, 209, 200, 19, 215,
];
class NFTUniqueConstraint {
    constructor(bump, nft) {
        this.bump = bump;
        this.nft = nft;
    }
    static fromArgs(args) {
        return new NFTUniqueConstraint(args.bump, args.nft);
    }
    static fromAccountInfo(accountInfo, offset = 0) {
        return NFTUniqueConstraint.deserialize(accountInfo.data, offset);
    }
    static async fromAccountAddress(connection, address, commitmentOrConfig) {
        const accountInfo = await connection.getAccountInfo(address, commitmentOrConfig);
        if (accountInfo == null) {
            throw new Error(`Unable to find NFTUniqueConstraint account at ${address}`);
        }
        return NFTUniqueConstraint.fromAccountInfo(accountInfo, 0)[0];
    }
    static gpaBuilder(programId = new web3.PublicKey('Gq1333CkB2sGernk72TKfDVLnHj9LjmeijFujM2ULxJz')) {
        return beetSolana.GpaBuilder.fromStruct(programId, exports.nFTUniqueConstraintBeet);
    }
    static deserialize(buf, offset = 0) {
        return exports.nFTUniqueConstraintBeet.deserialize(buf, offset);
    }
    serialize() {
        return exports.nFTUniqueConstraintBeet.serialize({
            accountDiscriminator: exports.nFTUniqueConstraintDiscriminator,
            ...this,
        });
    }
    static get byteSize() {
        return exports.nFTUniqueConstraintBeet.byteSize;
    }
    static async getMinimumBalanceForRentExemption(connection, commitment) {
        return connection.getMinimumBalanceForRentExemption(NFTUniqueConstraint.byteSize, commitment);
    }
    static hasCorrectByteSize(buf, offset = 0) {
        return buf.byteLength - offset === NFTUniqueConstraint.byteSize;
    }
    pretty() {
        return {
            bump: this.bump,
            nft: this.nft.toBase58(),
        };
    }
}
exports.NFTUniqueConstraint = NFTUniqueConstraint;
exports.nFTUniqueConstraintBeet = new beet.BeetStruct([
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['nft', beetSolana.publicKey],
], NFTUniqueConstraint.fromArgs, 'NFTUniqueConstraint');
//# sourceMappingURL=NFTUniqueConstraint.js.map