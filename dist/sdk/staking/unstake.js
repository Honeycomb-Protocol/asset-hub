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
exports.unstake = exports.createUnstakeTransaction = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const splToken = __importStar(require("@solana/spl-token"));
const generated_1 = require("../../generated");
const staking_1 = require("../../generated/staking");
const utils_1 = require("../../utils");
function createUnstakeTransaction(project, nftMint, wallet, programId = staking_1.PROGRAM_ID) {
    const [nft] = web3.PublicKey.findProgramAddressSync([Buffer.from("nft"), nftMint.toBuffer()], programId);
    const nftAccount = splToken.getAssociatedTokenAddressSync(nftMint, wallet);
    const [nftMetadata] = web3.PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        utils_1.METADATA_PROGRAM_ID.toBuffer(),
        nftMint.toBuffer(),
    ], utils_1.METADATA_PROGRAM_ID);
    const [nftEdition] = web3.PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        utils_1.METADATA_PROGRAM_ID.toBuffer(),
        nftMint.toBuffer(),
        Buffer.from("edition"),
    ], utils_1.METADATA_PROGRAM_ID);
    const instructions = [
        (0, generated_1.createUnstakeInstruction)({
            nft,
            nftMint,
            nftAccount,
            nftMetadata,
            nftEdition,
            wallet,
            tokenMetadataProgram: utils_1.METADATA_PROGRAM_ID,
            clock: web3.SYSVAR_CLOCK_PUBKEY,
            sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        }, programId),
    ];
    return {
        tx: new web3.Transaction().add(...instructions),
        signers: [],
        accounts: instructions.flatMap((i) => i.keys.map((k) => k.pubkey)),
        project,
    };
}
exports.createUnstakeTransaction = createUnstakeTransaction;
async function unstake(mx, project, nftMint) {
    const wallet = mx.identity();
    const ctx = createUnstakeTransaction(project, nftMint, wallet.publicKey);
    const blockhash = await mx.connection.getLatestBlockhash();
    ctx.tx.recentBlockhash = blockhash.blockhash;
    const response = await mx
        .rpc()
        .sendAndConfirmTransaction(ctx.tx, { skipPreflight: true }, ctx.signers);
    return {
        response,
        project: ctx.project,
    };
}
exports.unstake = unstake;
//# sourceMappingURL=unstake.js.map