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
exports.createUnstakeInstruction = exports.unstakeInstructionDiscriminator = exports.unstakeStruct = void 0;
const splToken = __importStar(require("@solana/spl-token"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const web3 = __importStar(require("@solana/web3.js"));
exports.unstakeStruct = new beet.BeetArgsStruct([['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]], 'UnstakeInstructionArgs');
exports.unstakeInstructionDiscriminator = [
    90, 95, 107, 42, 205, 124, 50, 225,
];
function createUnstakeInstruction(accounts, programId = new web3.PublicKey('8pyniLLXEHVUJKX2h5E9DrvwTsRmSR64ucUYBg8jQgPP')) {
    var _a, _b;
    const [data] = exports.unstakeStruct.serialize({
        instructionDiscriminator: exports.unstakeInstructionDiscriminator,
    });
    const keys = [
        {
            pubkey: accounts.project,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.nft,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.nftMint,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.nftAccount,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.nftMetadata,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.nftEdition,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.nftTokenRecord,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.depositAccount,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.depositTokenRecord,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.staker,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.wallet,
            isWritable: true,
            isSigner: true,
        },
        {
            pubkey: (_a = accounts.systemProgram) !== null && _a !== void 0 ? _a : web3.SystemProgram.programId,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: (_b = accounts.tokenProgram) !== null && _b !== void 0 ? _b : splToken.TOKEN_PROGRAM_ID,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.associatedTokenProgram,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.tokenMetadataProgram,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.clock,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.sysvarInstructions,
            isWritable: false,
            isSigner: false,
        },
    ];
    if (accounts.anchorRemainingAccounts != null) {
        for (const acc of accounts.anchorRemainingAccounts) {
            keys.push(acc);
        }
    }
    const ix = new web3.TransactionInstruction({
        programId,
        keys,
        data,
    });
    return ix;
}
exports.createUnstakeInstruction = createUnstakeInstruction;
//# sourceMappingURL=unstake.js.map