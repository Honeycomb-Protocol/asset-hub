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
exports.confirmBulkTransactions = exports.sendBulkTransactionsNew = exports.sendBulkTransactions = exports.createLookupTable = exports.devideAndSignV0Txns = exports.getOrFetchLoockupTable = exports.createV0TxWithLUT = exports.createV0TxWithLUTDumb = exports.createV0Tx = exports.sendAndConfirmTransaction = exports.METADATA_PROGRAM_ID = void 0;
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
const createV0TxWithLUTDumb = ({ lookupTable, ...msgArgs }) => {
    return new web3.VersionedTransaction(new web3.TransactionMessage(msgArgs).compileToV0Message([lookupTable]));
};
exports.createV0TxWithLUTDumb = createV0TxWithLUTDumb;
const createV0TxWithLUT = async (connection, payerKey, lookupTableAddress, txInstructions, latestBlockhash) => {
    if (!latestBlockhash)
        latestBlockhash = await connection.getLatestBlockhash();
    const lookupTable = await (0, exports.getOrFetchLoockupTable)(connection, lookupTableAddress);
    if (!lookupTable)
        throw new Error("Lookup table not found");
    return (0, exports.createV0TxWithLUTDumb)({
        payerKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: txInstructions,
        lookupTable,
    });
};
exports.createV0TxWithLUT = createV0TxWithLUT;
const getOrFetchLoockupTable = async (connection, lookupTableAddress) => {
    return "state" in lookupTableAddress
        ? lookupTableAddress
        : (await connection.getAddressLookupTable(lookupTableAddress, {
            commitment: "processed",
        })).value;
};
exports.getOrFetchLoockupTable = getOrFetchLoockupTable;
const devideAndSignV0Txns = async (wallet, connection, lookupTableAddress, rawTxns, mextByteSizeOfAGroup = 1600) => {
    const publicKey = wallet.publicKey;
    if (!publicKey || !wallet.signAllTransactions)
        return;
    const lookupTable = await (0, exports.getOrFetchLoockupTable)(connection, lookupTableAddress);
    if (!lookupTable)
        throw new Error("Lookup table not found");
    const addressedInLoockupTables = {};
    lookupTable.state.addresses.forEach((add) => {
        addressedInLoockupTables[add.toString()] = true;
    });
    console.log("addressedInLoockupTablesCount", Object.keys(addressedInLoockupTables).length, "addressedInLoockupTables", Object.keys(addressedInLoockupTables));
    const instructionsGroups = [];
    const latestBlockhash = await connection.getLatestBlockhash();
    rawTxns.forEach((rawTx) => {
        var _a;
        const instructions = rawTx.tx.instructions;
        const tx = (0, exports.createV0TxWithLUTDumb)({
            lookupTable,
            payerKey: publicKey,
            recentBlockhash: latestBlockhash.blockhash,
            instructions: (((_a = instructionsGroups[instructionsGroups.length - 1]) === null || _a === void 0 ? void 0 : _a.instrunctions) || []).concat(instructions),
        });
        let newTransactionSize = 0;
        try {
            newTransactionSize = tx.serialize().byteLength;
        }
        catch (e) {
            console.error(e);
            console.log("this transaction failed to serialize", tx);
        }
        console.log({
            newTransactionSize,
            mextByteSizeOfAGroup,
        });
        if (!instructionsGroups.length ||
            newTransactionSize > mextByteSizeOfAGroup ||
            (!newTransactionSize && instructionsGroups.length)) {
            instructionsGroups.push({
                tx,
                instrunctions: [...instructions],
                signers: [...rawTx.signers],
            });
        }
        else {
            instructionsGroups[instructionsGroups.length - 1].tx = tx;
            instructionsGroups[instructionsGroups.length - 1].instrunctions.push(...instructions);
            instructionsGroups[instructionsGroups.length - 1].signers.push(...rawTx.signers);
        }
    });
    let txns = instructionsGroups.map(({ tx, signers }) => {
        tx.sign(signers);
        return tx;
    });
    return txns;
};
exports.devideAndSignV0Txns = devideAndSignV0Txns;
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
    if ("secretKey" in wallet) {
        creationTx.sign([wallet]);
        transactions.forEach((txn) => {
            txn.sign([wallet]);
        });
    }
    else {
        [creationTx, ...transactions] = await wallet.signAllTransactions([
            creationTx,
            ...transactions,
        ]);
    }
    const createTxSignature = await connection.sendTransaction(creationTx, {
        skipPreflight: true,
    });
    const createTxConfirmation = await connection.confirmTransaction(createTxSignature, "confirmed");
    if (createTxConfirmation.value.err) {
        throw new Error("Lookup table creation error " + createTxConfirmation.value.err.toString());
    }
    const extensionConfirmations = await (0, exports.confirmBulkTransactions)(connection, await (0, exports.sendBulkTransactions)(connection, transactions), "confirmed");
    extensionConfirmations.forEach(({ value }) => {
        if (value.err) {
            throw new Error("Lookup table exntension error " + value.err.toString());
        }
    });
    return lookupTableAddress;
};
exports.createLookupTable = createLookupTable;
const sendBulkTransactions = (connection, transactions) => {
    return Promise.all(transactions.map((t) => connection.sendTransaction(t, {
        skipPreflight: true,
    }, {
        skipPreflight: true,
    })));
};
exports.sendBulkTransactions = sendBulkTransactions;
const sendBulkTransactionsNew = (connection, transactions) => {
    return Promise.all(transactions.map((t) => connection.sendTransaction(t, {
        skipPreflight: true,
    })));
};
exports.sendBulkTransactionsNew = sendBulkTransactionsNew;
const confirmBulkTransactions = (connection, transactions, commitment = "processed") => {
    return Promise.all(transactions.map((t) => connection.confirmTransaction(t, commitment)));
};
exports.confirmBulkTransactions = confirmBulkTransactions;
//# sourceMappingURL=utils.js.map