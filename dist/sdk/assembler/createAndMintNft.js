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
exports.createAndMintNft = exports.buildCreateAndMintNftCtx = exports.createMintNftTransaction = exports.createAddBlockTransaction = exports.createCreateNftTransaction = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const splToken = __importStar(require("@solana/spl-token"));
const generated_1 = require("../../generated");
const assembler_1 = require("../../generated/assembler");
const utils_1 = require("../../utils");
function createCreateNftTransaction(assembler, collectionMint, authority, payer, programId = assembler_1.PROGRAM_ID) {
    const [collectionMetadataAccount] = web3.PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        utils_1.METADATA_PROGRAM_ID.toBuffer(),
        collectionMint.toBuffer(),
    ], utils_1.METADATA_PROGRAM_ID);
    const [collectionMasterEdition] = web3.PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        utils_1.METADATA_PROGRAM_ID.toBuffer(),
        collectionMint.toBuffer(),
        Buffer.from("edition"),
    ], utils_1.METADATA_PROGRAM_ID);
    const nftMint = web3.Keypair.generate();
    const [nftMetadata] = web3.PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        utils_1.METADATA_PROGRAM_ID.toBuffer(),
        nftMint.publicKey.toBuffer(),
    ], utils_1.METADATA_PROGRAM_ID);
    const [nft] = web3.PublicKey.findProgramAddressSync([Buffer.from("nft"), nftMint.publicKey.toBuffer()], programId);
    return {
        tx: new web3.Transaction().add((0, generated_1.createCreateNftInstruction)({
            assembler,
            collectionMint,
            collectionMetadataAccount,
            collectionMasterEdition,
            nftMint: nftMint.publicKey,
            nftMetadata,
            nft,
            authority,
            payer,
            tokenMetadataProgram: utils_1.METADATA_PROGRAM_ID,
        }, programId)),
        signers: [nftMint],
        accounts: [
            assembler,
            collectionMint,
            collectionMetadataAccount,
            collectionMasterEdition,
            nftMint.publicKey,
            nftMetadata,
            nft,
            authority,
            payer,
            utils_1.METADATA_PROGRAM_ID,
        ],
        nft,
        nftMint: nftMint.publicKey,
    };
}
exports.createCreateNftTransaction = createCreateNftTransaction;
function createAddBlockTransaction(assembler, nft, nftMint, block, blockDefinition, tokenMint, authority, payer, assemblingAction = generated_1.AssemblingAction.Freeze, programId = assembler_1.PROGRAM_ID) {
    const tokenAccount = splToken.getAssociatedTokenAddressSync(tokenMint, authority);
    const [tokenMetadata] = web3.PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        utils_1.METADATA_PROGRAM_ID.toBuffer(),
        tokenMint.toBuffer(),
    ], utils_1.METADATA_PROGRAM_ID);
    const [tokenEdition] = web3.PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        utils_1.METADATA_PROGRAM_ID.toBuffer(),
        tokenMint.toBuffer(),
        Buffer.from("edition"),
    ], utils_1.METADATA_PROGRAM_ID);
    const [nftAttribute] = web3.PublicKey.findProgramAddressSync([Buffer.from("nft_attribute"), block.toBuffer(), nftMint.toBuffer()], programId);
    const [depositAccount] = web3.PublicKey.findProgramAddressSync([Buffer.from("deposit"), tokenMint.toBuffer()], programId);
    return {
        tx: new web3.Transaction().add((0, generated_1.createAddBlockInstruction)({
            assembler,
            nft,
            block,
            blockDefinition,
            tokenMint,
            tokenAccount,
            tokenMetadata,
            tokenEdition,
            depositAccount: assemblingAction === generated_1.AssemblingAction.TakeCustody
                ? depositAccount
                : programId,
            nftAttribute,
            authority,
            payer,
            tokenMetadataProgram: utils_1.METADATA_PROGRAM_ID,
        }, programId)),
        signers: [],
        accounts: [
            assembler,
            nft,
            block,
            blockDefinition,
            tokenMint,
            tokenAccount,
            tokenMetadata,
            tokenEdition,
            nftAttribute,
            authority,
            payer,
            utils_1.METADATA_PROGRAM_ID,
        ],
    };
}
exports.createAddBlockTransaction = createAddBlockTransaction;
function createMintNftTransaction(assembler, collectionMint, nftMint, authority, payer, programId = assembler_1.PROGRAM_ID) {
    const [collectionMetadata] = web3.PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        utils_1.METADATA_PROGRAM_ID.toBuffer(),
        collectionMint.toBuffer(),
    ], utils_1.METADATA_PROGRAM_ID);
    const [collectionMasterEdition] = web3.PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        utils_1.METADATA_PROGRAM_ID.toBuffer(),
        collectionMint.toBuffer(),
        Buffer.from("edition"),
    ], utils_1.METADATA_PROGRAM_ID);
    const [nft] = web3.PublicKey.findProgramAddressSync([Buffer.from("nft"), nftMint.toBuffer()], programId);
    const [nftMetadata] = web3.PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        utils_1.METADATA_PROGRAM_ID.toBuffer(),
        nftMint.toBuffer(),
    ], utils_1.METADATA_PROGRAM_ID);
    const [nftMasterEdition] = web3.PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        utils_1.METADATA_PROGRAM_ID.toBuffer(),
        nftMint.toBuffer(),
        Buffer.from("edition"),
    ], utils_1.METADATA_PROGRAM_ID);
    const tokenAccount = splToken.getAssociatedTokenAddressSync(nftMint, authority);
    return {
        tx: new web3.Transaction().add(splToken.createAssociatedTokenAccountInstruction(payer, tokenAccount, authority, nftMint), (0, generated_1.createMintNftInstruction)({
            assembler,
            collectionMint,
            collectionMetadata,
            collectionMasterEdition,
            nft,
            nftMint,
            nftMetadata,
            nftMasterEdition,
            tokenAccount,
            authority,
            payer,
            tokenMetadataProgram: utils_1.METADATA_PROGRAM_ID,
        }, programId)),
        signers: [],
        accounts: [assembler, nft, nftMint, tokenAccount, authority, payer],
    };
}
exports.createMintNftTransaction = createMintNftTransaction;
async function buildCreateAndMintNftCtx({ mx, assembler, blocks, }) {
    const wallet = mx.identity();
    const txns = [];
    const assemblerAccount = await generated_1.Assembler.fromAccountAddress(mx.connection, assembler);
    const { nft, nftMint, ...nftCreateCtx } = createCreateNftTransaction(assembler, assemblerAccount.collection, wallet.publicKey, wallet.publicKey);
    txns.push(nftCreateCtx);
    blocks.forEach((block) => {
        txns.push(createAddBlockTransaction(assembler, nft, nftMint, block.block, block.blockDefinition, block.tokenMint, wallet.publicKey, wallet.publicKey, assemblerAccount.assemblingAction));
    });
    txns.push(createMintNftTransaction(assembler, assemblerAccount.collection, nftMint, wallet.publicKey, wallet.publicKey));
    return {
        txns,
        nftMint: nftMint,
        nft: nft,
    };
}
exports.buildCreateAndMintNftCtx = buildCreateAndMintNftCtx;
async function createAndMintNft({ mx, assembler, blocks, }) {
    const { txns, nftMint, nft } = await buildCreateAndMintNftCtx({
        mx,
        assembler,
        blocks,
    });
    const wallet = mx.identity();
    let addressesDir = {};
    txns
        .forEach(({ accounts }, i) => {
        accounts.forEach((acc) => {
            addressesDir[acc.toString()] = acc;
        });
    });
    const addresses = Object.values(addressesDir);
    const lookupTableAddress = await (0, utils_1.createLookupTable)(wallet, mx.connection, addresses);
    const lookupTable = await (0, utils_1.getOrFetchLoockupTable)(mx.connection, lookupTableAddress);
    const mintNftTxns = await (0, utils_1.devideAndSignV0Txns)(wallet, mx.connection, lookupTable, txns);
    console.log(mintNftTxns);
    mintNftTxns.forEach((txn) => {
        txn.sign([wallet]);
    });
    const responses = await (0, utils_1.confirmBulkTransactions)(mx.connection, await (0, utils_1.sendBulkTransactionsNew)(new web3.Connection("https://lingering-newest-sheet.solana-devnet.quiknode.pro/fb6e6465df3955a06fd5ddec2e5b003896f56adb/", "processed"), mintNftTxns));
    return {
        responses,
        nftMint,
        nft,
    };
}
exports.createAndMintNft = createAndMintNft;
//# sourceMappingURL=createAndMintNft.js.map