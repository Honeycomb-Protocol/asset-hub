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
exports.multipliersBeet = exports.Multipliers = exports.multipliersDiscriminator = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
const Multiplier_1 = require("../types/Multiplier");
exports.multipliersDiscriminator = [129, 233, 66, 228, 168, 129, 38, 204];
class Multipliers {
    constructor(bump, project, decimals, durationMultipliers, countMultipliers, creatorMultipliers, collectionMultipliers) {
        this.bump = bump;
        this.project = project;
        this.decimals = decimals;
        this.durationMultipliers = durationMultipliers;
        this.countMultipliers = countMultipliers;
        this.creatorMultipliers = creatorMultipliers;
        this.collectionMultipliers = collectionMultipliers;
    }
    static fromArgs(args) {
        return new Multipliers(args.bump, args.project, args.decimals, args.durationMultipliers, args.countMultipliers, args.creatorMultipliers, args.collectionMultipliers);
    }
    static fromAccountInfo(accountInfo, offset = 0) {
        return Multipliers.deserialize(accountInfo.data, offset);
    }
    static async fromAccountAddress(connection, address, commitmentOrConfig) {
        const accountInfo = await connection.getAccountInfo(address, commitmentOrConfig);
        if (accountInfo == null) {
            throw new Error(`Unable to find Multipliers account at ${address}`);
        }
        return Multipliers.fromAccountInfo(accountInfo, 0)[0];
    }
    static gpaBuilder(programId = new web3.PublicKey('8pyniLLXEHVUJKX2h5E9DrvwTsRmSR64ucUYBg8jQgPP')) {
        return beetSolana.GpaBuilder.fromStruct(programId, exports.multipliersBeet);
    }
    static deserialize(buf, offset = 0) {
        return exports.multipliersBeet.deserialize(buf, offset);
    }
    serialize() {
        return exports.multipliersBeet.serialize({
            accountDiscriminator: exports.multipliersDiscriminator,
            ...this,
        });
    }
    static byteSize(args) {
        const instance = Multipliers.fromArgs(args);
        return exports.multipliersBeet.toFixedFromValue({
            accountDiscriminator: exports.multipliersDiscriminator,
            ...instance,
        }).byteSize;
    }
    static async getMinimumBalanceForRentExemption(args, connection, commitment) {
        return connection.getMinimumBalanceForRentExemption(Multipliers.byteSize(args), commitment);
    }
    pretty() {
        return {
            bump: this.bump,
            project: this.project.toBase58(),
            decimals: this.decimals,
            durationMultipliers: this.durationMultipliers,
            countMultipliers: this.countMultipliers,
            creatorMultipliers: this.creatorMultipliers,
            collectionMultipliers: this.collectionMultipliers,
        };
    }
}
exports.Multipliers = Multipliers;
exports.multipliersBeet = new beet.FixableBeetStruct([
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['project', beetSolana.publicKey],
    ['decimals', beet.u8],
    ['durationMultipliers', beet.array(Multiplier_1.multiplierBeet)],
    ['countMultipliers', beet.array(Multiplier_1.multiplierBeet)],
    ['creatorMultipliers', beet.array(Multiplier_1.multiplierBeet)],
    ['collectionMultipliers', beet.array(Multiplier_1.multiplierBeet)],
], Multipliers.fromArgs, 'Multipliers');
//# sourceMappingURL=Multipliers.js.map