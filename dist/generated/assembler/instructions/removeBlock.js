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
exports.createRemoveBlockInstruction = exports.removeBlockInstructionDiscriminator = exports.removeBlockStruct = void 0;
const splToken = __importStar(require("@solana/spl-token"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const web3 = __importStar(require("@solana/web3.js"));
exports.removeBlockStruct = new beet.BeetArgsStruct([['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]], 'RemoveBlockInstructionArgs');
exports.removeBlockInstructionDiscriminator = [
    145, 94, 239, 114, 4, 117, 167, 145,
];
function createRemoveBlockInstruction(accounts, programId = new web3.PublicKey('Gq1333CkB2sGernk72TKfDVLnHj9LjmeijFujM2ULxJz')) {
    var _a, _b, _c;
    const [data] = exports.removeBlockStruct.serialize({
        instructionDiscriminator: exports.removeBlockInstructionDiscriminator,
    });
    const keys = [
        {
            pubkey: accounts.assembler,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.nft,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.block,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.blockDefinition,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.tokenMint,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.tokenAccount,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.tokenMetadata,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.tokenEdition,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.tokenRecord,
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
            pubkey: accounts.authority,
            isWritable: true,
            isSigner: true,
        },
        {
            pubkey: accounts.payer,
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
            pubkey: accounts.sysvarInstructions,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: (_c = accounts.rent) !== null && _c !== void 0 ? _c : web3.SYSVAR_RENT_PUBKEY,
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
exports.createRemoveBlockInstruction = createRemoveBlockInstruction;
//# sourceMappingURL=removeBlock.js.map