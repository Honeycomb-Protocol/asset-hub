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
const pdas_1 = require("../pdas");
function createCreateNftTransaction(assembler, collectionMint, authority, payer, programId = assembler_1.PROGRAM_ID) {
    const nftMint = web3.Keypair.generate();
    const [collectionMetadataAccount] = (0, pdas_1.getMetadataAccount_)(collectionMint);
    const [collectionMasterEdition] = (0, pdas_1.getMetadataAccount_)(collectionMint, {
        __kind: "edition",
    });
    const [nftMetadata] = (0, pdas_1.getMetadataAccount_)(nftMint.publicKey);
    const [nftMasterEdition] = (0, pdas_1.getMetadataAccount_)(nftMint.publicKey, {
        __kind: "edition",
    });
    const [nft] = (0, pdas_1.getNftPda)(nftMint.publicKey);
    const instructions = [
        (0, generated_1.createCreateNftInstruction)({
            assembler,
            collectionMint,
            collectionMetadataAccount,
            collectionMasterEdition,
            nftMint: nftMint.publicKey,
            nftMetadata,
            nftMasterEdition,
            nft,
            authority,
            payer,
            tokenMetadataProgram: pdas_1.METADATA_PROGRAM_ID,
            sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        }, programId),
    ];
    return {
        tx: new web3.Transaction().add(...instructions),
        signers: [nftMint],
        accounts: instructions.flatMap((i) => i.keys.map((k) => k.pubkey)),
        nft,
        nftMint: nftMint.publicKey,
    };
}
exports.createCreateNftTransaction = createCreateNftTransaction;
function createAddBlockTransaction(assembler, nft, nftMint, block, blockDefinition, tokenMint, authority, payer, assemblingAction = generated_1.AssemblingAction.Freeze, programId = assembler_1.PROGRAM_ID) {
    const tokenAccount = splToken.getAssociatedTokenAddressSync(tokenMint, authority);
    const [tokenMetadata] = (0, pdas_1.getMetadataAccount_)(tokenMint);
    const [depositAccount] = (0, pdas_1.getDepositPda)(tokenMint, nftMint);
    let tokenRecord, depositTokenRecord, tokenEdition;
    if (true) {
        [tokenEdition] = (0, pdas_1.getMetadataAccount_)(tokenMint, {
            __kind: "edition",
        });
        [tokenRecord] = (0, pdas_1.getMetadataAccount_)(tokenMint, {
            __kind: "token_record",
            tokenAccount,
        });
        [depositTokenRecord] = (0, pdas_1.getMetadataAccount_)(tokenMint, {
            __kind: "token_record",
            tokenAccount: depositAccount,
        });
    }
    const instructions = [
        (0, generated_1.createAddBlockInstruction)({
            assembler,
            nft,
            block,
            blockDefinition,
            tokenMint,
            tokenAccount,
            tokenMetadata,
            tokenEdition: tokenEdition || programId,
            tokenRecord: tokenRecord || programId,
            depositAccount: assemblingAction === generated_1.AssemblingAction.TakeCustody
                ? depositAccount
                : programId,
            depositTokenRecord: depositTokenRecord || programId,
            authority,
            payer,
            tokenMetadataProgram: pdas_1.METADATA_PROGRAM_ID,
            sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
            associatedTokenProgram: splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        }, programId),
    ];
    return {
        tx: new web3.Transaction().add(...instructions),
        signers: [],
        accounts: instructions.flatMap((i) => i.keys.map((k) => k.pubkey)),
    };
}
exports.createAddBlockTransaction = createAddBlockTransaction;
function createMintNftTransaction(assembler, nftMint, uniqueConstraint, authority, payer, programId = assembler_1.PROGRAM_ID) {
    const tokenAccount = splToken.getAssociatedTokenAddressSync(nftMint, authority);
    const [nft] = (0, pdas_1.getNftPda)(nftMint);
    const [nftMetadata] = (0, pdas_1.getMetadataAccount_)(nftMint);
    const [nftMasterEdition] = (0, pdas_1.getMetadataAccount_)(nftMint, {
        __kind: "edition",
    });
    const [nftTokenRecord] = (0, pdas_1.getMetadataAccount_)(nftMint, {
        __kind: "token_record",
        tokenAccount,
    });
    const instructions = [
        splToken.createAssociatedTokenAccountInstruction(payer, tokenAccount, authority, nftMint),
        (0, generated_1.createMintNftInstruction)({
            assembler,
            nft,
            nftMint,
            nftMetadata,
            nftMasterEdition,
            nftTokenRecord,
            tokenAccount,
            uniqueConstraint: uniqueConstraint || programId,
            authority,
            payer,
            associatedTokenProgram: splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenMetadataProgram: pdas_1.METADATA_PROGRAM_ID,
            sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        }, programId),
    ];
    return {
        tx: new web3.Transaction().add(...instructions),
        signers: [],
        accounts: instructions.flatMap((i) => i.keys.map((k) => k.pubkey)),
    };
}
exports.createMintNftTransaction = createMintNftTransaction;
async function buildCreateAndMintNftCtx({ mx, assembler, blocks, }) {
    const wallet = mx.identity();
    const txns = [];
    const assemblerAccount = await generated_1.Assembler.fromAccountAddress(mx.connection, assembler);
    const { nft, nftMint, ...nftCreateCtx } = createCreateNftTransaction(assembler, assemblerAccount.collection, wallet.publicKey, wallet.publicKey);
    txns.push(nftCreateCtx);
    const uniqueConstraintSeeds = [];
    blocks.forEach((block) => {
        txns.push(createAddBlockTransaction(assembler, nft, nftMint, block.block, block.blockDefinition, block.tokenMint, wallet.publicKey, wallet.publicKey, assemblerAccount.assemblingAction));
    });
    let uniqueConstraint = null;
    if (!assemblerAccount.allowDuplicates) {
        uniqueConstraint = (0, pdas_1.getUniqueConstraintPda)(blocks, assembler)[0];
    }
    txns.push(createMintNftTransaction(assembler, nftMint, uniqueConstraint, wallet.publicKey, wallet.publicKey));
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
    const { txns: mintNftTxns, lookupTableAddress } = await (0, utils_1.bulkLutTransactions)(mx, txns);
    if (!mintNftTxns)
        return;
    mintNftTxns.forEach((txn) => {
        txn.sign([wallet]);
    });
    const responses = await (0, utils_1.confirmBulkTransactions)(mx.connection, await (0, utils_1.sendBulkTransactions)(new web3.Connection("https://lingering-newest-sheet.solana-devnet.quiknode.pro/fb6e6465df3955a06fd5ddec2e5b003896f56adb/", "processed"), mintNftTxns));
    responses.forEach((element) => {
        var _a, _b, _c;
        if ((_a = element.value) === null || _a === void 0 ? void 0 : _a.err) {
            console.error((_b = element.value) === null || _b === void 0 ? void 0 : _b.err);
            throw (_c = element.value) === null || _c === void 0 ? void 0 : _c.err;
        }
    });
    return {
        responses,
        nftMint,
        nft,
    };
}
exports.createAndMintNft = createAndMintNft;
//# sourceMappingURL=createAndMintNft.js.map