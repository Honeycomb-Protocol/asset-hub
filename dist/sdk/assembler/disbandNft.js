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
function createBurnNFTTransaction(assembler, nft, nftMint, authority, programId = assembler_1.PROGRAM_ID) {
    const tokenAccount = splToken.getAssociatedTokenAddressSync(nftMint, authority);
    return {
        tx: new web3.Transaction().add((0, generated_1.createBurnNftInstruction)({
            assembler,
            nft,
            nftMint,
            tokenAccount,
            authority,
        }, programId)),
        signers: [],
        accounts: [assembler, nft, nftMint, tokenAccount, authority],
    };
}
exports.createBurnNFTTransaction = createBurnNFTTransaction;
function createRemoveBlockTransaction(assembler, nft, nftMint, block, blockDefinition, tokenMint, authority, assemblingAction = generated_1.AssemblingAction.Freeze, programId = assembler_1.PROGRAM_ID) {
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
            nftAttribute,
            authority,
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
            nftAttribute,
            authority,
            utils_1.METADATA_PROGRAM_ID,
        ],
    };
}
exports.createRemoveBlockTransaction = createRemoveBlockTransaction;
async function disbandNft(connection, wallet, nftMint) {
    const [nft] = web3.PublicKey.findProgramAddressSync([Buffer.from("nft"), nftMint.toBuffer()], assembler_1.PROGRAM_ID);
    const nftAccount = await generated_1.NFT.fromAccountAddress(connection, nft);
    const assemblerAccount = await generated_1.Assembler.fromAccountAddress(connection, nftAccount.assembler);
    const attributes = await generated_1.NFTAttribute.gpaBuilder()
        .addFilter("nft", nft)
        .run(connection)
        .then((x) => x.map((y) => ({ ...y, ...generated_1.NFTAttribute.fromAccountInfo(y.account)[0] })));
    const nftBurnTx = createBurnNFTTransaction(nftAccount.assembler, nft, nftMint, wallet.publicKey);
    let signers = [...nftBurnTx.signers];
    let accounts = [...nftBurnTx.accounts];
    const tx = new web3.Transaction().add(nftBurnTx.tx, ...(await Promise.all(attributes.map(async (attribute) => {
        if (!attribute.mint)
            return null;
        const { tx, accounts: acc, signers: sigs, } = createRemoveBlockTransaction(nftAccount.assembler, nft, nftMint, attribute.block, attribute.blockDefinition, attribute.mint, wallet.publicKey, assemblerAccount.assemblingAction);
        signers = [...signers, ...sigs];
        accounts = [...accounts, ...acc];
        return tx;
    })).then((x) => x.filter((x) => x !== null))));
    accounts = accounts.filter((x, index, self) => index === self.findIndex((y) => x.equals(y)));
    const txId = await (0, utils_1.sendAndConfirmTransaction)(tx, connection, wallet, signers, { skipPreflight: true });
    return {
        txId,
    };
}
exports.disbandNft = disbandNft;
//# sourceMappingURL=disbandNft.js.map