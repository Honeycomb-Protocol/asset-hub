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
exports.setNftGenerated = exports.createSetNftGeneratedTransaction = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const utils_1 = require("../../utils");
const generated_1 = require("../../generated");
const assembler_1 = require("../../generated/assembler");
function createSetNftGeneratedTransaction(assembler, nft, nftMint, authority, args, delegate, programId = assembler_1.PROGRAM_ID) {
    const [nftMetadata] = web3.PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        utils_1.METADATA_PROGRAM_ID.toBuffer(),
        nftMint.toBuffer(),
    ], utils_1.METADATA_PROGRAM_ID);
    return {
        tx: new web3.Transaction().add((0, generated_1.createSetNftGeneratedInstruction)({
            assembler,
            nft,
            nftMetadata,
            authority,
            delegate: delegate || programId,
            tokenMetadataProgram: utils_1.METADATA_PROGRAM_ID,
        }, {
            args,
        }, programId)),
        signers: [],
        accounts: [nft],
    };
}
exports.createSetNftGeneratedTransaction = createSetNftGeneratedTransaction;
async function setNftGenerated(mx, nft, args, nftArgs) {
    const nftAccount = nftArgs
        ? null
        : await assembler_1.NFT.fromAccountAddress(mx.connection, nft);
    const ctx = await createSetNftGeneratedTransaction((nftAccount === null || nftAccount === void 0 ? void 0 : nftAccount.assembler) || nftArgs.assembler, nft, (nftAccount === null || nftAccount === void 0 ? void 0 : nftAccount.mint) || nftArgs.mint, mx.identity().publicKey, args);
    const blockhash = await mx.connection.getLatestBlockhash();
    ctx.tx.recentBlockhash = blockhash.blockhash;
    const response = await mx
        .rpc()
        .sendAndConfirmTransaction(ctx.tx, { skipPreflight: true }, ctx.signers);
    return {
        response,
    };
}
exports.setNftGenerated = setNftGenerated;
//# sourceMappingURL=setNftGenerated.js.map