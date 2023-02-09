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
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const pdas_1 = require("../pdas");
const utils_1 = require("../../utils");
const initStaker_1 = require("./initStaker");
const initNFT_1 = require("./initNFT");
function createStakeTransaction(project, nftMint, wallet, lockType = staking_1.LockType.Freeze, tokenStandard = mpl_token_metadata_1.TokenStandard.NonFungible, programId = staking_1.PROGRAM_ID) {
    const [nft] = (0, pdas_1.getStakedNftPda)(project, nftMint);
    const nftAccount = splToken.getAssociatedTokenAddressSync(nftMint, wallet);
    const [nftMetadata] = (0, pdas_1.getMetadataAccount_)(nftMint);
    const [nftEdition] = (0, pdas_1.getMetadataAccount_)(nftMint, { __kind: "edition" });
    const [staker] = (0, pdas_1.getStakerPda)(project, wallet);
    let nftTokenRecord, depositAccount, depositTokenRecord;
    if (lockType == staking_1.LockType.Custoday) {
        [depositAccount] = (0, pdas_1.getStakedNftDepositPda)(nftMint);
    }
    if (tokenStandard === mpl_token_metadata_1.TokenStandard.ProgrammableNonFungible) {
        [nftTokenRecord] = (0, pdas_1.getMetadataAccount_)(nftMint, {
            __kind: "token_record",
            tokenAccount: nftAccount,
        });
        if (lockType == staking_1.LockType.Custoday) {
            [depositTokenRecord] = (0, pdas_1.getMetadataAccount_)(nftMint, {
                __kind: "token_record",
                tokenAccount: depositAccount,
            });
        }
    }
    const instructions = [
        (0, generated_1.createStakeInstruction)({
            project,
            nft,
            nftMint,
            nftAccount,
            nftMetadata,
            nftEdition,
            nftTokenRecord: nftTokenRecord || programId,
            depositAccount: depositAccount || programId,
            depositTokenRecord: depositTokenRecord || programId,
            staker,
            wallet,
            associatedTokenProgram: splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
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
    const projectAccount = await staking_1.Project.fromAccountAddress(mx.connection, project);
    const metadata = await mx.nfts().findByMint({ mintAddress: nftMint });
    const stakeCtx = createStakeTransaction(project, nftMint, wallet.publicKey, projectAccount.lockType, metadata.tokenStandard);
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