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
exports.createUpdateMetadataInstruction = exports.updateMetadataInstructionDiscriminator = exports.updateMetadataStruct = void 0;
const beet = __importStar(require("@metaplex-foundation/beet"));
const web3 = __importStar(require("@solana/web3.js"));
const UpdateMetadataArgs_1 = require("../types/UpdateMetadataArgs");
exports.updateMetadataStruct = new beet.FixableBeetArgsStruct([
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', UpdateMetadataArgs_1.updateMetadataArgsBeet],
], 'UpdateMetadataInstructionArgs');
exports.updateMetadataInstructionDiscriminator = [
    170, 182, 43, 239, 97, 78, 225, 186,
];
function createUpdateMetadataInstruction(accounts, args, programId = new web3.PublicKey('4cEhZgkh41JbuXsXdcKhNaeHJ2BpzmXN3VpMQ3nFPDrp')) {
    const [data] = exports.updateMetadataStruct.serialize({
        instructionDiscriminator: exports.updateMetadataInstructionDiscriminator,
        ...args,
    });
    const keys = [
        {
            pubkey: accounts.assembler,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.nft,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.metadata,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.authority,
            isWritable: false,
            isSigner: true,
        },
        {
            pubkey: accounts.delegate,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.tokenMetadataProgram,
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
exports.createUpdateMetadataInstruction = createUpdateMetadataInstruction;
//# sourceMappingURL=updateMetadata.js.map