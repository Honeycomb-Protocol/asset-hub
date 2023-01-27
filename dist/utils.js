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
exports.confirmBulkTransactions = exports.sendBulkTransactions = exports.devideAndSignV0Txns = exports.createLookupTable = exports.createV0TxWithLUT = exports.createV0Tx = exports.sendAndConfirmTransaction = exports.METADATA_PROGRAM_ID = void 0;
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
const createV0Tx = (payerKey, latestBlockhash, ...txInstructions) => {
    return new web3.VersionedTransaction(new web3.TransactionMessage({
        payerKey,
        recentBlockhash: latestBlockhash,
        instructions: txInstructions,
    }).compileToV0Message());
};
exports.createV0Tx = createV0Tx;
const createV0TxWithLUT = async (connection, payerKey, lookupTableAddress, txInstructions) => {
    const latestBlockhash = await connection.getLatestBlockhash();
    const lookupTable = (await connection.getAddressLookupTable(lookupTableAddress)).value;
    if (!lookupTable)
        throw new Error("Lookup table not found");
    return await new web3.VersionedTransaction(new web3.TransactionMessage({
        payerKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: txInstructions,
    }).compileToV0Message([lookupTable]));
};
exports.createV0TxWithLUT = createV0TxWithLUT;
const createLookupTable = async (wallet, connection, addresses) => {
    if (!wallet.publicKey || !wallet.signAllTransactions)
        return;
    console.log(wallet.publicKey.toString());
    const [lookupTableIx, lookupTableAddress] = web3.AddressLookupTableProgram.createLookupTable({
        authority: wallet.publicKey,
        payer: wallet.publicKey,
        recentSlot: await connection.getSlot(),
    });
    const latestBlockhash = await connection.getLatestBlockhash();
    let creationTx = (0, exports.createV0Tx)(wallet.publicKey, latestBlockhash.blockhash, lookupTableIx);
    let transactions = [];
    const batchSize = 30;
    for (let i = 0; i < addresses.length; i += batchSize) {
        transactions.push((0, exports.createV0Tx)(wallet.publicKey, latestBlockhash.blockhash, web3.AddressLookupTableProgram.extendLookupTable({
            payer: wallet.publicKey,
            authority: wallet.publicKey,
            lookupTable: lookupTableAddress,
            addresses: addresses.slice(i, i + batchSize),
        })));
    }
    [creationTx, ...transactions] = await wallet.signAllTransactions([
        creationTx,
        ...transactions,
    ]);
    const createTxSignature = await connection.sendTransaction(creationTx, {
        skipPreflight: true,
    });
    const createTxConfirmation = await connection.confirmTransaction(createTxSignature, "processed");
    if (createTxConfirmation.value.err) {
        throw new Error("Lookup table creation error " + createTxConfirmation.value.err.toString());
    }
    await (0, exports.sendBulkTransactions)(connection, transactions);
    return lookupTableAddress;
};
exports.createLookupTable = createLookupTable;
const devideAndSignV0Txns = async (wallet, connection, lookupTable, rawTxns, mextByteSizeOfAGroup = 1600) => {
    const publicKey = wallet.publicKey;
    if (!publicKey || !wallet.signAllTransactions)
        return;
    let sizeOfCurrentGroup = 0;
    const instructionsGroups = [
        {
            instrunctions: [],
            signers: [],
        },
    ];
    rawTxns.forEach((tx) => {
        const instructions = tx.tx.instructions;
        const transactionSize = instructions.reduce((acc, instruction) => acc +
            Buffer.byteLength(instruction.data) +
            32 +
            instruction.keys.length * 20, 0);
        if (sizeOfCurrentGroup + transactionSize > mextByteSizeOfAGroup) {
            instructionsGroups.push({
                instrunctions: [],
                signers: [],
            });
            sizeOfCurrentGroup = 0;
        }
        sizeOfCurrentGroup += transactionSize;
        instructionsGroups[instructionsGroups.length - 1].instrunctions.push(...instructions);
        instructionsGroups[instructionsGroups.length - 1].signers.push(...tx.signers);
    });
    let groups = await Promise.all(instructionsGroups.map(async (group) => ({
        ...group,
        tx: await (0, exports.createV0TxWithLUT)(connection, publicKey, lookupTable, group.instrunctions),
    })));
    let txns = groups.map(({ tx, signers }) => {
        tx.sign(signers);
        return tx;
    });
    txns = await wallet.signAllTransactions(txns);
    return txns;
};
exports.devideAndSignV0Txns = devideAndSignV0Txns;
const sendBulkTransactions = (connection, transactions) => {
    return Promise.all(transactions.map((t) => connection.sendTransaction(t, {
        skipPreflight: true,
    }, {
        skipPreflight: true,
    })));
};
exports.sendBulkTransactions = sendBulkTransactions;
const confirmBulkTransactions = (connection, transactions) => {
    return Promise.all(transactions.map((t) => connection.confirmTransaction(t, "processed")));
};
exports.confirmBulkTransactions = confirmBulkTransactions;
//# sourceMappingURL=utils.js.map