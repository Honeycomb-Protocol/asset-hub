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
exports.getAssociatedTokenAccountIntructions = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const splToken = __importStar(require("@solana/spl-token"));
async function getAssociatedTokenAccountIntructions(mx, mints) {
    let wallet = mx.identity();
    const preTxns = [];
    const postTxns = [];
    for (let index = 0; index < mints.length; index++) {
        const mint = mints[index];
        const tokenAccountAddress = splToken.getAssociatedTokenAddressSync(mint, wallet.publicKey);
        const tokenAccount = await splToken
            .getAccount(mx.connection, tokenAccountAddress)
            .catch((e) => null);
        if (!tokenAccount)
            preTxns.push({
                tx: new web3.Transaction().add(splToken.createAssociatedTokenAccountInstruction(wallet.publicKey, tokenAccountAddress, wallet.publicKey, mint)),
                accounts: [
                    web3.SystemProgram.programId,
                    wallet.publicKey,
                    tokenAccountAddress,
                    mint,
                ],
                signers: [],
            });
        if (!tokenAccount || !Number(tokenAccount.amount))
            postTxns.push({
                tx: new web3.Transaction().add(splToken.createCloseAccountInstruction(tokenAccountAddress, wallet.publicKey, wallet.publicKey)),
                accounts: [
                    web3.SystemProgram.programId,
                    wallet.publicKey,
                    tokenAccountAddress,
                    mint,
                ],
                signers: [],
            });
    }
    return {
        preTxns,
        postTxns,
    };
}
exports.getAssociatedTokenAccountIntructions = getAssociatedTokenAccountIntructions;
//# sourceMappingURL=associatedTokenAccounts.js.map