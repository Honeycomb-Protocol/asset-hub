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
exports.stake = exports.createStakeTransaction = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const splToken = __importStar(require("@solana/spl-token"));
const generated_1 = require("../../generated");
const staking_1 = require("../../generated/staking");
const pdas_1 = require("../pdas");
const utils_1 = require("../../utils");
const initStaker_1 = require("./initStaker");
const initNFT_1 = require("./initNFT");
function createStakeTransaction(project, nftMint, wallet, programId = staking_1.PROGRAM_ID) {
    const [nft] = web3.PublicKey.findProgramAddressSync([Buffer.from("nft"), nftMint.toBuffer(), project.toBuffer()], programId);
    const nftAccount = splToken.getAssociatedTokenAddressSync(nftMint, wallet);
    const [nftMetadata] = web3.PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        pdas_1.METADATA_PROGRAM_ID.toBuffer(),
        nftMint.toBuffer(),
    ], pdas_1.METADATA_PROGRAM_ID);
    const [nftEdition] = web3.PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        pdas_1.METADATA_PROGRAM_ID.toBuffer(),
        nftMint.toBuffer(),
        Buffer.from("edition"),
    ], pdas_1.METADATA_PROGRAM_ID);
    const [staker] = web3.PublicKey.findProgramAddressSync([Buffer.from("staker"), wallet.toBuffer(), project.toBuffer()], programId);
    const instructions = [
        (0, generated_1.createStakeInstruction)({
            project,
            nft,
            nftMint,
            nftAccount,
            nftMetadata,
            nftEdition,
            staker,
            wallet,
            tokenMetadataProgram: pdas_1.METADATA_PROGRAM_ID,
            clock: web3.SYSVAR_CLOCK_PUBKEY,
            sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        }, programId),
    ];
    return {
        tx: new web3.Transaction().add(...instructions),
        signers: [],
        accounts: instructions.flatMap((i) => i.keys.map((k) => k.pubkey)),
    };
}
exports.createStakeTransaction = createStakeTransaction;
async function stake(mx, project, nftMint) {
    const wallet = mx.identity();
    const staker = await (0, utils_1.getOrFetchStaker)(mx.connection, wallet.publicKey, project);
    const initStakerCtx = !staker && (0, initStaker_1.createInitStakerTransaction)(project, wallet.publicKey);
    const nft = await (0, utils_1.getOrFetchNft)(mx.connection, nftMint, project);
    const initNftCtx = !nft && (0, initNFT_1.createInitNFTTransaction)(project, nftMint, wallet.publicKey);
    const stakeCtx = createStakeTransaction(project, nftMint, wallet.publicKey);
    const tx = new web3.Transaction();
    initNftCtx && tx.add(initNftCtx.tx);
    initStakerCtx && tx.add(initStakerCtx.tx);
    tx.add(stakeCtx.tx);
    const blockhash = await mx.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash.blockhash;
    const response = await mx
        .rpc()
        .sendAndConfirmTransaction(tx, { skipPreflight: true }, [
        ...((initNftCtx === null || initNftCtx === void 0 ? void 0 : initNftCtx.signers) || []),
        ...((initStakerCtx === null || initStakerCtx === void 0 ? void 0 : initStakerCtx.signers) || []),
        ...stakeCtx.signers,
    ]);
    return {
        response,
    };
}
exports.stake = stake;
//# sourceMappingURL=stake.js.map