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
exports.getOrFetchNft = exports.getOrFetchStaker = exports.getOrFetchMultipliers = exports.uploadBulkMetadataToArwave = exports.uploadMetadataToArwave = exports.bulkLutTransactions = exports.confirmBulkTransactions = exports.sendBulkTransactionsLegacy = exports.sendBulkTransactions = exports.createLookupTable = exports.isKeypairSigner = exports.isSigner = exports.devideAndSignV0Txns = exports.devideAndSignTxns = exports.getOrFetchLoockupTable = exports.numberToBytes = exports.createV0TxWithLUT = exports.createV0TxWithLUTDumb = exports.createV0Tx = exports.sendAndConfirmTransaction = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const js_1 = require("@metaplex-foundation/js");
const staking_1 = require("./generated/staking");
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
const numberToBytes = (x) => {
    let y = Math.floor(x / 2 ** 32);
    return [y, y << 8, y << 16, y << 24, x, x << 8, x << 16, x << 24].map((z) => z >>> 24);
};
exports.numberToBytes = numberToBytes;
const getOrFetchLoockupTable = async (connection, lookupTableAddress) => {
    return "state" in lookupTableAddress
        ? lookupTableAddress
        : (await connection.getAddressLookupTable(lookupTableAddress, {
            commitment: "processed",
        })).value;
};
exports.getOrFetchLoockupTable = getOrFetchLoockupTable;
const devideAndSignTxns = async (wallet, connection, rawTxns, mextByteSizeOfAGroup = 1232) => {
    const publicKey = wallet.publicKey;
    if (!publicKey || !wallet.signAllTransactions)
        return;
    const instructionsGroups = [];
    const latestBlockhash = await connection.getLatestBlockhash();
    rawTxns.forEach((rawTx) => {
        var _a;
        const instructions = rawTx.tx.instructions;
        const tx = new web3.Transaction().add(...(((_a = instructionsGroups[instructionsGroups.length - 1]) === null || _a === void 0 ? void 0 : _a.instrunctions) ||
            []), ...instructions);
        tx.recentBlockhash = latestBlockhash.blockhash;
        tx.feePayer = wallet.publicKey;
        let newTransactionSize = 0;
        try {
            newTransactionSize = tx.serialize().byteLength;
        }
        catch (e) {
            console.error(e);
            console.log("this transaction failed to serialize", tx);
        }
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
    return instructionsGroups;
};
exports.devideAndSignTxns = devideAndSignTxns;
const devideAndSignV0Txns = async (wallet, connection, lookupTableAddress, rawTxns, mextByteSizeOfAGroup = 1232) => {
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
    console.log("AddressCount", Object.keys(addressedInLoockupTables).length);
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
const isSigner = (input) => {
    return (typeof input === "object" &&
        "publicKey" in input &&
        ("secretKey" in input || "signTransaction" in input));
};
exports.isSigner = isSigner;
const isKeypairSigner = (input) => {
    return (0, exports.isSigner)(input) && "secretKey" in input && input.secretKey != null;
};
exports.isKeypairSigner = isKeypairSigner;
const createLookupTable = async (wallet, connection, addresses) => {
    if (!wallet.publicKey || !wallet.signAllTransactions)
        return;
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
    if ((0, exports.isKeypairSigner)(wallet)) {
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
    console.log(transactions.map((tx) => tx.serialize().byteLength));
    return Promise.all(transactions.map((t) => connection.sendTransaction(t, {
        skipPreflight: true,
    }, {
        skipPreflight: true,
    })));
};
exports.sendBulkTransactions = sendBulkTransactions;
const sendBulkTransactionsLegacy = (mx, transactions) => {
    return Promise.all(transactions.map((t) => mx.rpc().sendTransaction(t, {
        skipPreflight: true,
    })));
};
exports.sendBulkTransactionsLegacy = sendBulkTransactionsLegacy;
const confirmBulkTransactions = (connection, transactions, commitment = "processed") => {
    return Promise.all(transactions.map((t) => connection.confirmTransaction(t, commitment)));
};
exports.confirmBulkTransactions = confirmBulkTransactions;
const bulkLutTransactions = async (mx, txns) => {
    const wallet = mx.identity();
    let addressesDir = {};
    txns.forEach(({ accounts }) => {
        accounts.forEach((acc) => {
            addressesDir[acc.toString()] = acc;
        });
    });
    const addresses = Object.values(addressesDir);
    const lookupTableAddress = await (0, exports.createLookupTable)(wallet, mx.connection, addresses);
    if (!lookupTableAddress)
        throw new Error("Lookup Table creation failed!");
    const lookupTable = await (0, exports.getOrFetchLoockupTable)(mx.connection, lookupTableAddress);
    if (!lookupTable)
        throw new Error("Lookup Table validation failed!");
    const lutTxns = await (0, exports.devideAndSignV0Txns)(wallet, mx.connection, lookupTable, txns);
    if (!lutTxns)
        throw new Error("DevideAndSignV0Txns creation failed!");
    console.log(lutTxns.map((tx) => tx.serialize().byteLength));
    return {
        txns: lutTxns,
        lookupTableAddress,
    };
};
exports.bulkLutTransactions = bulkLutTransactions;
const uploadMetadataToArwave = async (mx, data) => {
    const isMetaplexImage = (0, js_1.isMetaplexFile)(data.image);
    const files = [];
    if (isMetaplexImage)
        files.push(data.image);
    files.push((0, js_1.toMetaplexFileFromJson)({
        ...data,
        image: isMetaplexImage
            ? "https://arweave.net/YATQ46cZ_47VGkoGyJsMYMqyJehEkEdkRPxv9ENtT08"
            : data.image,
    }));
    const bundlrStorageDriver = mx.storage().driver();
    const fundRequired = await bundlrStorageDriver.getUploadPriceForFiles(files);
    return {
        proceed: async () => {
            if (isMetaplexImage)
                data.image = await mx.storage().upload(data.image);
            const metadataUri = await mx.storage().uploadJson({
                ...data,
            });
            return {
                uri: metadataUri,
                data: data,
            };
        },
        fundRequired: fundRequired.basisPoints,
    };
};
exports.uploadMetadataToArwave = uploadMetadataToArwave;
const uploadBulkMetadataToArwave = async (mx, items) => {
    const bundlrStorageDriver = mx.storage().driver();
    const balance = (await bundlrStorageDriver.getBalance()).basisPoints;
    console.log("Balance", balance.toNumber() / 10 ** 9);
    const uploadHandlers = await Promise.all(items.map(({ data }) => (0, exports.uploadMetadataToArwave)(mx, data)));
    const totalFundsRequired = uploadHandlers.reduce((bn, item) => bn.add(item.fundRequired), (0, js_1.toBigNumber)(0));
    const shortFall = (0, js_1.lamports)(totalFundsRequired.sub(balance));
    console.log("Short Fall", shortFall.basisPoints.toNumber() / 10 ** 9);
    if (shortFall.basisPoints.gt((0, js_1.toBigNumber)(0)))
        await bundlrStorageDriver.fund(shortFall);
    await Promise.all(uploadHandlers.map(({ proceed }, i) => proceed().then(items[i].callback).catch(console.error)));
};
exports.uploadBulkMetadataToArwave = uploadBulkMetadataToArwave;
const getOrFetchMultipliers = async (connection, project, programId = staking_1.PROGRAM_ID) => {
    const [multipliers] = web3.PublicKey.findProgramAddressSync([Buffer.from("multipliers"), project.toBuffer()], programId);
    try {
        return {
            ...(await staking_1.Multipliers.fromAccountAddress(connection, multipliers)),
            address: multipliers,
        };
    }
    catch (_a) {
        return null;
    }
};
exports.getOrFetchMultipliers = getOrFetchMultipliers;
const getOrFetchStaker = async (connection, wallet, project, programId = staking_1.PROGRAM_ID) => {
    const [staker] = web3.PublicKey.findProgramAddressSync([Buffer.from("staker"), wallet.toBuffer(), project.toBuffer()], programId);
    try {
        return {
            ...(await staking_1.Staker.fromAccountAddress(connection, staker)),
            address: staker,
        };
    }
    catch (_a) {
        return null;
    }
};
exports.getOrFetchStaker = getOrFetchStaker;
const getOrFetchNft = async (connection, nftMint, project, programId = staking_1.PROGRAM_ID) => {
    const [nft] = web3.PublicKey.findProgramAddressSync([Buffer.from("nft"), nftMint.toBuffer(), project.toBuffer()], programId);
    try {
        return {
            ...(await staking_1.NFT.fromAccountAddress(connection, nft)),
            address: nft,
        };
    }
    catch (_a) {
        return null;
    }
};
exports.getOrFetchNft = getOrFetchNft;
//# sourceMappingURL=utils.js.map