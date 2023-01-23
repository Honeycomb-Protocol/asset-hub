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
exports.createAndMintNft = exports.createMintNftTransaction = exports.createAddBlockTransaction = exports.createCreateNftTransaction = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const splToken = __importStar(require("@solana/spl-token"));
const generated_1 = require("../../generated");
const assembler_1 = require("../../generated/assembler");
const utils_1 = require("../../utils");
function createCreateNftTransaction(assembler, collectionMint, authority, payer, args, programId = assembler_1.PROGRAM_ID) {
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
        }, { args }, programId)),
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
function createMintNftTransaction(assembler, nftMint, authority, payer, programId = assembler_1.PROGRAM_ID) {
    const [nft] = web3.PublicKey.findProgramAddressSync([Buffer.from("nft"), nftMint.toBuffer()], programId);
    const tokenAccount = splToken.getAssociatedTokenAddressSync(nftMint, authority);
    return {
        tx: new web3.Transaction().add(splToken.createAssociatedTokenAccountInstruction(payer, tokenAccount, authority, nftMint), (0, generated_1.createMintNftInstruction)({
            assembler,
            nft,
            nftMint,
            tokenAccount,
            authority,
            payer,
        }, programId)),
        signers: [],
        accounts: [assembler, nft, nftMint, tokenAccount, authority, payer],
    };
}
exports.createMintNftTransaction = createMintNftTransaction;
async function createAndMintNft(connection, wallet, assembler, blocks, args) {
    const assemblerAccount = await generated_1.Assembler.fromAccountAddress(connection, assembler);
    const nftCreateTx = createCreateNftTransaction(assembler, assemblerAccount.collection, wallet.publicKey, wallet.publicKey, args);
    const mintNftTx = createMintNftTransaction(assembler, nftCreateTx.nftMint, wallet.publicKey, wallet.publicKey);
    let signers = [...nftCreateTx.signers, ...mintNftTx.signers];
    let accounts = [...nftCreateTx.accounts, ...mintNftTx.accounts];
    const tx = new web3.Transaction().add(nftCreateTx.tx, ...(await Promise.all(blocks.map(async (blockT) => {
        const { tx, accounts: acc, signers: sigs, } = createAddBlockTransaction(assembler, nftCreateTx.nft, nftCreateTx.nftMint, blockT.block, blockT.blockDefinition, blockT.tokenMint, wallet.publicKey, wallet.publicKey, assemblerAccount.assemblingAction);
        signers = [...signers, ...sigs];
        accounts = [...accounts, ...acc];
        return tx;
    }))), mintNftTx.tx);
    accounts = accounts.filter((x, index, self) => index === self.findIndex((y) => x.equals(y)));
    const txId = await (0, utils_1.sendAndConfirmTransaction)(tx, connection, wallet, signers, { skipPreflight: true });
    console.log("NFT created:", txId);
    return nftCreateTx.nftMint;
}
exports.createAndMintNft = createAndMintNft;
//# sourceMappingURL=create_and_mint_nft.js.map