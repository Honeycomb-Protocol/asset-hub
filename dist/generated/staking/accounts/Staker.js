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
exports.stakerBeet = exports.Staker = exports.stakerDiscriminator = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
exports.stakerDiscriminator = [171, 229, 193, 85, 67, 177, 151, 4];
class Staker {
    constructor(bump, project, wallet, totalStaked) {
        this.bump = bump;
        this.project = project;
        this.wallet = wallet;
        this.totalStaked = totalStaked;
    }
    static fromArgs(args) {
        return new Staker(args.bump, args.project, args.wallet, args.totalStaked);
    }
    static fromAccountInfo(accountInfo, offset = 0) {
        return Staker.deserialize(accountInfo.data, offset);
    }
    static async fromAccountAddress(connection, address, commitmentOrConfig) {
        const accountInfo = await connection.getAccountInfo(address, commitmentOrConfig);
        if (accountInfo == null) {
            throw new Error(`Unable to find Staker account at ${address}`);
        }
        return Staker.fromAccountInfo(accountInfo, 0)[0];
    }
    static gpaBuilder(programId = new web3.PublicKey('8pyniLLXEHVUJKX2h5E9DrvwTsRmSR64ucUYBg8jQgPP')) {
        return beetSolana.GpaBuilder.fromStruct(programId, exports.stakerBeet);
    }
    static deserialize(buf, offset = 0) {
        return exports.stakerBeet.deserialize(buf, offset);
    }
    serialize() {
        return exports.stakerBeet.serialize({
            accountDiscriminator: exports.stakerDiscriminator,
            ...this,
        });
    }
    static get byteSize() {
        return exports.stakerBeet.byteSize;
    }
    static async getMinimumBalanceForRentExemption(connection, commitment) {
        return connection.getMinimumBalanceForRentExemption(Staker.byteSize, commitment);
    }
    static hasCorrectByteSize(buf, offset = 0) {
        return buf.byteLength - offset === Staker.byteSize;
    }
    pretty() {
        return {
            bump: this.bump,
            project: this.project.toBase58(),
            wallet: this.wallet.toBase58(),
            totalStaked: (() => {
                const x = this.totalStaked;
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
exports.Staker = Staker;
exports.stakerBeet = new beet.BeetStruct([
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['project', beetSolana.publicKey],
    ['wallet', beetSolana.publicKey],
    ['totalStaked', beet.u64],
], Staker.fromArgs, 'Staker');
//# sourceMappingURL=Staker.js.map