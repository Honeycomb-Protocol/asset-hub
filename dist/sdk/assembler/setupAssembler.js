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
exports.uploadFiles = exports.setupAssembler = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const generated_1 = require("../../generated");
const _1 = require(".");
const assetmanager_1 = require("../assetmanager");
const utils_1 = require("../../utils");
async function setupAssembler(mx, config, updateConfig) {
    const transactionGroups = [
        {
            txns: [],
            postActions: [],
        },
    ];
    const wallet = mx.identity();
    if (!config.destroyableLookupTables)
        config.destroyableLookupTables = [];
    const assemblingAction = generated_1.AssemblingAction[config.assemblingAction] || generated_1.AssemblingAction.Burn;
    let assemblerAddress = config.assemblerAddress;
    if (!assemblerAddress) {
        const collectionUri = "";
        const createAssemblerCtx = (0, _1.createCreateAssemblerTransaction)(wallet.publicKey, wallet.publicKey, {
            assemblingAction: assemblingAction,
            collectionName: config.name,
            collectionSymbol: config.symbol,
            collectionUri,
            collectionDescription: config.description,
            nftBaseUri: config.base_url,
            allowDuplicates: config.allowDuplicates || null,
            defaultRoyalty: config.defaultRoyalty || null,
        });
        transactionGroups[0].txns.push(createAssemblerCtx);
        transactionGroups[0].postActions.push(() => {
            config.assemblerAddress = createAssemblerCtx.assembler.toString();
            updateConfig(config);
        });
        assemblerAddress = createAssemblerCtx.assembler.toString();
    }
    await Promise.all(config.blocks.map(async (block) => {
        const blockType = generated_1.BlockType[block.type] || generated_1.BlockType.Enum;
        let blockAddress = block.address;
        if (!blockAddress) {
            const createBlockCtx = (0, _1.createCreateBlockTransaction)(new web3.PublicKey(assemblerAddress), wallet.publicKey, wallet.publicKey, {
                blockName: block.name,
                blockOrder: block.order,
                blockType: blockType,
                isGraphical: block.isGraphical,
            });
            transactionGroups[0].txns.push(createBlockCtx);
            transactionGroups[0].postActions.push(() => {
                block.address = createBlockCtx.block.toString();
                updateConfig(config);
            });
            blockAddress = createBlockCtx.block.toString();
        }
        const transactionGroup = {
            txns: [],
            postActions: [],
        };
        transactionGroups.push(transactionGroup);
        await Promise.all(block.definitions.map(async (blockDefinition) => {
            if (blockDefinition.address)
                return;
            let blockDefArgs;
            if (blockType === generated_1.BlockType.Enum) {
                blockDefArgs = {
                    __kind: "Enum",
                    value: blockDefinition.value,
                    isCollection: !!!blockDefinition.mintAddress && !!blockDefinition.collection,
                    image: null,
                };
            }
            else if (blockType === generated_1.BlockType.Boolean) {
                blockDefArgs = {
                    __kind: "Boolean",
                    value: blockDefinition.value === "true",
                };
            }
            else if (blockType === generated_1.BlockType.Random ||
                blockType === generated_1.BlockType.Computed) {
                const [min, max] = blockDefinition.value.split("-");
                blockDefArgs = {
                    __kind: "Number",
                    min: parseInt(min),
                    max: parseInt(max),
                };
            }
            else {
                throw new Error("Invalid block type");
            }
            let blockDefinitionMint;
            if (blockDefinition.mintAddress || blockDefinition.collection) {
                try {
                    blockDefinitionMint = new web3.PublicKey(blockDefinition.mintAddress || blockDefinition.collection);
                }
                catch (error) {
                    throw new Error("Invalid mint address or collection address in block definition " +
                        blockDefinition.value +
                        " of block " +
                        block.name);
                }
            }
            else if (blockDefinition.assetConfig.uri) {
                let uri = blockDefinition.assetConfig.uri;
                const createAssetCtx = (0, assetmanager_1.createCreateAssetTransaction)(wallet.publicKey, {
                    name: blockDefinition.value,
                    candyGuard: blockDefinition.assetConfig.candyGuard
                        ? new web3.PublicKey(blockDefinition.assetConfig.candyGuard)
                        : null,
                    symbol: blockDefinition.assetConfig.symbol,
                    uri: uri,
                });
                transactionGroup.txns.push(createAssetCtx);
                transactionGroup.postActions.push(() => {
                    blockDefinition.assetConfig.address =
                        createAssetCtx.asset.toString();
                    blockDefinition.mintAddress = createAssetCtx.mint.toString();
                    updateConfig(config);
                });
                blockDefinitionMint = createAssetCtx.mint;
            }
            else {
                throw new Error("Block definition details not provided properly");
            }
            const createBlockDefinitionCtx = (0, _1.createCreateBlockDefinitionTransaction)(new web3.PublicKey(assemblerAddress), new web3.PublicKey(blockAddress), blockDefinitionMint, wallet.publicKey, wallet.publicKey, blockDefArgs);
            transactionGroup.txns.push(createBlockDefinitionCtx);
            transactionGroup.postActions.push(() => {
                blockDefinition.address =
                    createBlockDefinitionCtx.blockDefinition.toString();
                updateConfig(config);
            });
            return blockDefinition;
        }));
        return block;
    }));
    for (let tg of transactionGroups) {
        if (tg.txns.length) {
            console.log(tg.txns.length);
            const { txns, lookupTableAddress } = await (0, utils_1.bulkLutTransactions)(mx, tg.txns);
            txns.forEach((txn) => {
                txn.sign([wallet]);
            });
            const processedConnection = new web3.Connection(mx.connection.rpcEndpoint, "processed");
            const responses = await (0, utils_1.confirmBulkTransactions)(mx.connection, await (0, utils_1.sendBulkTransactions)(processedConnection, txns));
            config.destroyableLookupTables.push(lookupTableAddress.toString());
            updateConfig(config);
        }
        tg.postActions.forEach((action) => {
            action();
        });
    }
    const destroyableLookupTables = config.destroyableLookupTables.map((str) => new web3.PublicKey(str));
    if (false && destroyableLookupTables.length) {
        const latestBlockhash = await mx.connection.getLatestBlockhash();
        const destroyTransactions = destroyableLookupTables.map((address) => new web3.Transaction({
            feePayer: wallet.publicKey,
            recentBlockhash: latestBlockhash.blockhash,
        }).add(web3.AddressLookupTableProgram.closeLookupTable({
            authority: wallet.publicKey,
            lookupTable: address,
            recipient: wallet.publicKey,
        })));
        wallet.signAllTransactions(destroyTransactions);
        await (0, utils_1.confirmBulkTransactions)(mx.connection, await (0, utils_1.sendBulkTransactionsLegacy)(mx, destroyTransactions));
    }
    await (0, node_fetch_1.default)("https://api.eboy.dev/honeycomb/assembler", {
        method: "post",
        body: JSON.stringify(config),
        headers: { "Content-Type": "application/json" },
    }).catch((e) => {
        console.error(e);
        return null;
    });
    return config;
}
exports.setupAssembler = setupAssembler;
async function uploadFiles(mx, config, updateConfig, readFile) {
    const uploadItems = [];
    await Promise.all(config.blocks.map(async (block) => {
        await Promise.all(block.definitions.map(async (blockDefinition) => {
            if (blockDefinition.assetConfig) {
                let uri = blockDefinition.assetConfig.uri;
                if (!uri && blockDefinition.assetConfig.image) {
                    const file = await readFile(blockDefinition.assetConfig.image);
                    uploadItems.push({
                        data: {
                            name: "HoneyComb Asset",
                            image: file,
                            symbol: blockDefinition.assetConfig.symbol,
                            ...(blockDefinition.assetConfig.json || {}),
                        },
                        callback(res) {
                            if (!blockDefinition.caches)
                                blockDefinition.caches = {
                                    image: res.data.image || blockDefinition.assetConfig.image,
                                };
                            blockDefinition.assetConfig.image =
                                blockDefinition.caches.image =
                                    res.data.image || blockDefinition.assetConfig.image;
                            uri = blockDefinition.assetConfig.uri = res.uri;
                            updateConfig(config);
                        },
                    });
                }
            }
            return blockDefinition;
        }));
        return uploadItems;
    }));
    await (0, utils_1.uploadBulkMetadataToArwave)(mx, uploadItems);
    return config;
}
exports.uploadFiles = uploadFiles;
//# sourceMappingURL=setupAssembler.js.map