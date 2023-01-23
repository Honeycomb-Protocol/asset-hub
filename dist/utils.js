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
exports.sendAndConfirmTransaction = exports.METADATA_PROGRAM_ID = void 0;
const web3 = __importStar(require("@solana/web3.js"));
exports.METADATA_PROGRAM_ID = new web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const sendAndConfirmTransaction = async (tx, connection, wallet, signers = [], sendOpts = {}) => {
    const block = await connection.getLatestBlockhash();
    tx.recentBlockhash = block.blockhash;
    tx.feePayer = wallet.publicKey;
    let adapterSigners = {};
    signers.length &&
        signers.forEach((s) => {
            if ("signTransaction" in s)
                adapterSigners[s.publicKey.toString()] = s;
            else if ("secretKey" in s)
                tx.partialSign(s);
            else if ("_signer" in s)
                tx.partialSign(s._signer);
        });
    let signedTx = await wallet.signTransaction(tx);
    for (let signer in adapterSigners) {
        signedTx = await adapterSigners[signer].signTransaction(signedTx);
    }
    const txId = await connection.sendRawTransaction(signedTx.serialize(), {
        preflightCommitment: "processed",
        ...sendOpts,
    });
    await connection.confirmTransaction({
        blockhash: block.blockhash,
        lastValidBlockHeight: block.lastValidBlockHeight,
        signature: txId,
    }, "processed");
    return txId;
};
exports.sendAndConfirmTransaction = sendAndConfirmTransaction;
//# sourceMappingURL=utils.js.map