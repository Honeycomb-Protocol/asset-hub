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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAndConfirmV0Transaction = exports.createLookupTable = exports.createV0TxWithLUT = exports.createV0Tx = exports.sendAndConfirmTransaction = exports.saveConfigFile = exports.readConfigFile = exports.METADATA_PROGRAM_ID = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const web3 = __importStar(require("@solana/web3.js"));
exports.METADATA_PROGRAM_ID = new web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const readConfigFile = (configFile) => {
    const configPath = path_1.default.join(process.cwd(), configFile);
    return JSON.parse(fs_1.default.readFileSync(configPath).toString());
};
exports.readConfigFile = readConfigFile;
const saveConfigFile = (configFile, configFileName) => {
    const configPath = path_1.default.join(process.cwd(), configFileName);
    fs_1.default.writeFileSync(configPath, JSON.stringify(configFile, null, 2));
};
exports.saveConfigFile = saveConfigFile;
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
const createV0TxWithLUT = async (connection, payerKey, lookupTableAddress, ...txInstructions) => {
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
const createLookupTable = async (connection, wallet, ...addresses) => {
    const [lookupTableIx, lookupTableAddress] = web3.AddressLookupTableProgram.createLookupTable({
        authority: wallet.publicKey,
        payer: wallet.publicKey,
        recentSlot: await connection.getSlot(),
    });
    const txn = await (0, exports.createV0Tx)(wallet.publicKey, (await connection.getLatestBlockhash()).blockhash, lookupTableIx);
    txn.sign([wallet.payer]);
    const txId = await connection.sendTransaction(txn, {
        skipPreflight: true,
    });
    console.log(txId);
    const createTxConfirmation = await connection.confirmTransaction(txId, "finalized");
    if (createTxConfirmation.value.err) {
        throw new Error("Lookup table creation error " + createTxConfirmation.value.err.toString());
    }
    const transactions = [];
    const latestBlockhash = await connection.getLatestBlockhash();
    const batchSize = 25;
    for (let i = 0; i < addresses.length; i += batchSize) {
        transactions.push((0, exports.createV0Tx)(wallet.publicKey, latestBlockhash.blockhash, web3.AddressLookupTableProgram.extendLookupTable({
            payer: wallet.publicKey,
            authority: wallet.publicKey,
            lookupTable: lookupTableAddress,
            addresses: addresses.slice(i, i + batchSize),
        })));
    }
    transactions.map((tx) => tx.sign([wallet.payer]));
    const sigs = await Promise.all(transactions.map((t) => connection.sendTransaction(t, {
        skipPreflight: true,
    })));
    return lookupTableAddress;
};
exports.createLookupTable = createLookupTable;
const sendAndConfirmV0Transaction = async (tx, connection, wallet, signers = [], sendOpts = {}) => {
    let adapterSigners = {};
    signers.length &&
        signers.forEach((s) => {
            if ("signTransaction" in s)
                adapterSigners[s.publicKey.toString()] = s;
            else if ("secretKey" in s)
                tx.sign([s]);
            else if ("_signer" in s)
                tx.sign([s._signer]);
        });
    tx.sign([wallet.payer]);
    let signedTx = tx;
    const txId = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: true,
        ...sendOpts,
    });
    await connection.confirmTransaction(txId);
    return txId;
};
exports.sendAndConfirmV0Transaction = sendAndConfirmV0Transaction;
//# sourceMappingURL=utils.js.map