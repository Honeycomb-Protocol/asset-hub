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
exports.projectBeet = exports.Project = exports.projectDiscriminator = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
const LockType_1 = require("../types/LockType");
exports.projectDiscriminator = [205, 168, 189, 202, 181, 247, 142, 19];
class Project {
    constructor(bump, vaultBump, key, authority, rewardMint, vault, lockType, name, rewardsPerDuration, rewardsDuration, maxRewardsDuration, minStakeDuration, cooldownDuration, resetStakeDuration, allowedMints, totalStaked, startTime, endTime, collections, creators) {
        this.bump = bump;
        this.vaultBump = vaultBump;
        this.key = key;
        this.authority = authority;
        this.rewardMint = rewardMint;
        this.vault = vault;
        this.lockType = lockType;
        this.name = name;
        this.rewardsPerDuration = rewardsPerDuration;
        this.rewardsDuration = rewardsDuration;
        this.maxRewardsDuration = maxRewardsDuration;
        this.minStakeDuration = minStakeDuration;
        this.cooldownDuration = cooldownDuration;
        this.resetStakeDuration = resetStakeDuration;
        this.allowedMints = allowedMints;
        this.totalStaked = totalStaked;
        this.startTime = startTime;
        this.endTime = endTime;
        this.collections = collections;
        this.creators = creators;
    }
    static fromArgs(args) {
        return new Project(args.bump, args.vaultBump, args.key, args.authority, args.rewardMint, args.vault, args.lockType, args.name, args.rewardsPerDuration, args.rewardsDuration, args.maxRewardsDuration, args.minStakeDuration, args.cooldownDuration, args.resetStakeDuration, args.allowedMints, args.totalStaked, args.startTime, args.endTime, args.collections, args.creators);
    }
    static fromAccountInfo(accountInfo, offset = 0) {
        return Project.deserialize(accountInfo.data, offset);
    }
    static async fromAccountAddress(connection, address, commitmentOrConfig) {
        const accountInfo = await connection.getAccountInfo(address, commitmentOrConfig);
        if (accountInfo == null) {
            throw new Error(`Unable to find Project account at ${address}`);
        }
        return Project.fromAccountInfo(accountInfo, 0)[0];
    }
    static gpaBuilder(programId = new web3.PublicKey('8pyniLLXEHVUJKX2h5E9DrvwTsRmSR64ucUYBg8jQgPP')) {
        return beetSolana.GpaBuilder.fromStruct(programId, exports.projectBeet);
    }
    static deserialize(buf, offset = 0) {
        return exports.projectBeet.deserialize(buf, offset);
    }
    serialize() {
        return exports.projectBeet.serialize({
            accountDiscriminator: exports.projectDiscriminator,
            ...this,
        });
    }
    static byteSize(args) {
        const instance = Project.fromArgs(args);
        return exports.projectBeet.toFixedFromValue({
            accountDiscriminator: exports.projectDiscriminator,
            ...instance,
        }).byteSize;
    }
    static async getMinimumBalanceForRentExemption(args, connection, commitment) {
        return connection.getMinimumBalanceForRentExemption(Project.byteSize(args), commitment);
    }
    pretty() {
        return {
            bump: this.bump,
            vaultBump: this.vaultBump,
            key: this.key.toBase58(),
            authority: this.authority.toBase58(),
            rewardMint: this.rewardMint.toBase58(),
            vault: this.vault.toBase58(),
            lockType: 'LockType.' + LockType_1.LockType[this.lockType],
            name: this.name,
            rewardsPerDuration: (() => {
                const x = this.rewardsPerDuration;
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
            rewardsDuration: (() => {
                const x = this.rewardsDuration;
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
            maxRewardsDuration: this.maxRewardsDuration,
            minStakeDuration: this.minStakeDuration,
            cooldownDuration: this.cooldownDuration,
            resetStakeDuration: this.resetStakeDuration,
            allowedMints: this.allowedMints,
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
            startTime: this.startTime,
            endTime: this.endTime,
            collections: this.collections,
            creators: this.creators,
        };
    }
}
exports.Project = Project;
exports.projectBeet = new beet.FixableBeetStruct([
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['vaultBump', beet.u8],
    ['key', beetSolana.publicKey],
    ['authority', beetSolana.publicKey],
    ['rewardMint', beetSolana.publicKey],
    ['vault', beetSolana.publicKey],
    ['lockType', LockType_1.lockTypeBeet],
    ['name', beet.utf8String],
    ['rewardsPerDuration', beet.u64],
    ['rewardsDuration', beet.u64],
    ['maxRewardsDuration', beet.coption(beet.u64)],
    ['minStakeDuration', beet.coption(beet.u64)],
    ['cooldownDuration', beet.coption(beet.u64)],
    ['resetStakeDuration', beet.bool],
    ['allowedMints', beet.bool],
    ['totalStaked', beet.u64],
    ['startTime', beet.coption(beet.i64)],
    ['endTime', beet.coption(beet.i64)],
    ['collections', beet.array(beetSolana.publicKey)],
    ['creators', beet.array(beetSolana.publicKey)],
], Project.fromArgs, 'Project');
//# sourceMappingURL=Project.js.map