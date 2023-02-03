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
    constructor(bump, project, staker, mint, lastClaim) {
        this.bump = bump;
        this.project = project;
        this.staker = staker;
        this.mint = mint;
        this.lastClaim = lastClaim;
    }
    static fromArgs(args) {
        return new NFT(args.bump, args.project, args.staker, args.mint, args.lastClaim);
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
    static gpaBuilder(programId = new web3.PublicKey('8pyniLLXEHVUJKX2h5E9DrvwTsRmSR64ucUYBg8jQgPP')) {
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
    static get byteSize() {
        return exports.nFTBeet.byteSize;
    }
    static async getMinimumBalanceForRentExemption(connection, commitment) {
        return connection.getMinimumBalanceForRentExemption(NFT.byteSize, commitment);
    }
    static hasCorrectByteSize(buf, offset = 0) {
        return buf.byteLength - offset === NFT.byteSize;
    }
    pretty() {
        return {
            bump: this.bump,
            project: this.project.toBase58(),
            staker: this.staker.toBase58(),
            mint: this.mint.toBase58(),
            lastClaim: (() => {
                const x = this.lastClaim;
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
        };
    }
}
exports.NFT = NFT;
exports.nFTBeet = new beet.BeetStruct([
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['project', beetSolana.publicKey],
    ['staker', beetSolana.publicKey],
    ['mint', beetSolana.publicKey],
    ['lastClaim', beet.i64],
], NFT.fromArgs, 'NFT');
//# sourceMappingURL=NFT.js.map