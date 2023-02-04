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
exports.disbandNft = exports.createRemoveBlockTransaction = exports.createBurnNFTTransaction = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const splToken = __importStar(require("@solana/spl-token"));
const generated_1 = require("../../generated");
const assembler_1 = require("../../generated/assembler");
const utils_1 = require("../../utils");
const pdas_1 = require("../pdas");
function createBurnNFTTransaction(assembler, nft, nftMint, uniqueConstraint, authority, programId = assembler_1.PROGRAM_ID) {
    const tokenAccount = splToken.getAssociatedTokenAddressSync(nftMint, authority);
    const [nftMetadata] = (0, pdas_1.getMetadataAccount_)(nftMint);
    return {
        tx: new web3.Transaction().add((0, generated_1.createBurnNftInstruction)({
            assembler,
            nft,
            nftMint,
            nftMetadata,
            tokenAccount,
            uniqueConstraint,
            authority,
            tokenMetadataProgram: pdas_1.METADATA_PROGRAM_ID,
        }, programId)),
        signers: [],
        accounts: [assembler, nft, nftMint, tokenAccount, authority],
    };
}
exports.createBurnNFTTransaction = createBurnNFTTransaction;
function createRemoveBlockTransaction(assembler, nft, nftMint, block, blockDefinition, tokenMint, authority, assemblingAction = generated_1.AssemblingAction.Freeze, programId = assembler_1.PROGRAM_ID) {
    const tokenAccount = splToken.getAssociatedTokenAddressSync(tokenMint, authority);
    const [tokenMetadata] = (0, pdas_1.getMetadataAccount_)(tokenMint);
    const [tokenEdition] = (0, pdas_1.getMetadataAccount_)(tokenMint, true);
    const [depositAccount] = (0, pdas_1.getDepositPda)(tokenMint, nftMint);
    return {
        tx: new web3.Transaction().add((0, generated_1.createRemoveBlockInstruction)({
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
            authority,
            tokenMetadataProgram: pdas_1.METADATA_PROGRAM_ID,
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
            authority,
            pdas_1.METADATA_PROGRAM_ID,
        ],
    };
}
exports.createRemoveBlockTransaction = createRemoveBlockTransaction;
async function disbandNft(connection, wallet, nftMint) {
    const [nft] = (0, pdas_1.getNftPda)(nftMint);
    const nftAccount = await generated_1.NFT.fromAccountAddress(connection, nft);
    const assemblerAccount = await generated_1.Assembler.fromAccountAddress(connection, nftAccount.assembler);
    let uniqueConstraint = null;
    if (!assemblerAccount.allowDuplicates) {
        uniqueConstraint = (0, pdas_1.getUniqueConstraintPda)(nftAccount.attributes, nftAccount.assembler)[0];
    }
    const nftBurnTx = createBurnNFTTransaction(nftAccount.assembler, nft, nftMint, uniqueConstraint, wallet.publicKey);
    let signers = [...nftBurnTx.signers];
    let accounts = [...nftBurnTx.accounts];
    const tx = new web3.Transaction().add(nftBurnTx.tx, ...(await Promise.all(nftAccount.attributes.map(async (attribute) => {
        if (!attribute.mint)
            return null;
        const [block] = (0, pdas_1.getBlockPda)(nftAccount.assembler, attribute.order);
        const [blockDefinition] = (0, pdas_1.getBlockDefinitionPda)(block, attribute.mint);
        const { tx, accounts: acc, signers: sigs, } = createRemoveBlockTransaction(nftAccount.assembler, nft, nftMint, block, blockDefinition, attribute.mint, wallet.publicKey, assemblerAccount.assemblingAction);
        signers = [...signers, ...sigs];
        accounts = [...accounts, ...acc];
        return tx;
    })).then((x) => x.filter((x) => x !== null))));
    const txId = await (0, utils_1.sendAndConfirmTransaction)(tx, connection, wallet, signers, { skipPreflight: true });
    return {
        txId,
    };
}
exports.disbandNft = disbandNft;
//# sourceMappingURL=disbandNft.js.map