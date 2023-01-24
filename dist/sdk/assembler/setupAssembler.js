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
exports.setupAssembler = void 0;
const anchor = __importStar(require("@project-serum/anchor"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const web3 = __importStar(require("@solana/web3.js"));
const key_json_1 = __importDefault(require("../../../key.json"));
const generated_1 = require("../../generated");
const _1 = require(".");
const utils_1 = require("../../utils");
const js_1 = require("@metaplex-foundation/js");
const assetmanager_1 = require("../assetmanager");
const wallet = new anchor.Wallet(web3.Keypair.fromSecretKey(Uint8Array.from(key_json_1.default)));
const connection = new web3.Connection("https://api.devnet.solana.com/", "processed");
async function setupAssembler(config, updateConfig) {
    let transactions = [];
    let signers = [];
    let accounts = [];
    const metaplex = new js_1.Metaplex(connection);
    metaplex.use((0, js_1.keypairIdentity)(wallet.payer));
    let assemblingAction;
    switch (config.assemblingAction) {
        case "Burn":
            assemblingAction = generated_1.AssemblingAction.Burn;
            break;
        case "Freeze":
            assemblingAction = generated_1.AssemblingAction.Freeze;
            break;
        case "TakeCustody":
            assemblingAction = generated_1.AssemblingAction.TakeCustody;
            break;
        default:
            break;
    }
    if (!config.assemblerAddress) {
        const collectionUri = "";
        const createAssemblerCtx = (0, _1.createCreateAssemblerTransaction)(wallet.publicKey, wallet.publicKey, {
            assemblingAction: assemblingAction,
            collectionName: config.name,
            collectionSymbol: config.symbol,
            collectionUri,
            collectionDescription: config.description,
            nftBaseUri: config.base_url,
        });
        transactions.push({
            ...createAssemblerCtx,
            postAction() {
                config.assemblerAddress = createAssemblerCtx.assembler.toString();
                updateConfig(config);
            },
        });
        signers.push(...createAssemblerCtx.signers);
        accounts.push(...createAssemblerCtx.accounts);
        config.assemblerAddress = createAssemblerCtx.assembler.toString();
    }
    await Promise.all(config.blocks.map(async (block) => {
        let blockType;
        switch (block.type) {
            case "Enum":
                blockType = generated_1.BlockType.Enum;
                break;
            case "Boolean":
                blockType = generated_1.BlockType.Boolean;
                break;
            case "Random":
                blockType = generated_1.BlockType.Random;
                break;
            case "Computed":
                blockType = generated_1.BlockType.Computed;
                break;
            default:
                throw new Error("Invalid Block Type");
        }
        if (!block.address) {
            const createBlockCtx = (0, _1.createCreateBlockTransaction)(new web3.PublicKey(config.assemblerAddress), wallet.publicKey, wallet.publicKey, {
                blockName: block.name,
                blockOrder: block.order,
                blockType: blockType,
                isGraphical: block.isGraphical,
            });
            transactions.push({
                ...createBlockCtx,
                postAction() {
                    block.address = createBlockCtx.block.toString();
                    updateConfig(config);
                },
            });
            signers.push(...createBlockCtx.signers);
            accounts.push(...createBlockCtx.accounts);
            block.address = createBlockCtx.block.toString();
        }
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
            else if (blockDefinition.assetConfig) {
                let uri = blockDefinition.assetConfig.uri;
                if (!uri && blockDefinition.assetConfig.image) {
                    const buffer = await promises_1.default.readFile(path_1.default.resolve(process.cwd(), blockDefinition.assetConfig.image));
                    const file = (0, js_1.toMetaplexFile)(buffer, blockDefinition.assetConfig.image.slice(blockDefinition.assetConfig.image.lastIndexOf("/") + 1));
                    const m = await metaplex.nfts().uploadMetadata({
                        name: "My NFT",
                        image: file,
                        symbol: blockDefinition.assetConfig.symbol,
                    });
                    uri = blockDefinition.assetConfig.uri = m.uri;
                    updateConfig(config);
                }
                const createAssetCtx = (0, assetmanager_1.createCreateAssetTransaction)(wallet.publicKey, {
                    name: blockDefinition.value,
                    candyGuard: blockDefinition.assetConfig.candyGuard
                        ? new web3.PublicKey(blockDefinition.assetConfig.candyGuard)
                        : null,
                    symbol: blockDefinition.assetConfig.symbol,
                    uri: uri,
                });
                transactions.push({
                    ...createAssetCtx,
                    postAction() {
                        blockDefinition.assetConfig.address =
                            createAssetCtx.asset.toString();
                        blockDefinition.mintAddress = createAssetCtx.mint.toString();
                        updateConfig(config);
                    },
                });
                signers.push(...createAssetCtx.signers);
                accounts.push(...createAssetCtx.accounts);
                blockDefinitionMint = createAssetCtx.mint;
            }
            else {
                throw new Error("Block definition details not provided properly");
            }
            const createBlockDefinitionCtx = (0, _1.createCreateBlockDefinitionTransaction)(new web3.PublicKey(config.assemblerAddress), new web3.PublicKey(block.address), blockDefinitionMint, wallet.publicKey, wallet.publicKey, blockDefArgs);
            transactions.push({
                ...createBlockDefinitionCtx,
                postAction() {
                    blockDefinition.address =
                        createBlockDefinitionCtx.blockDefinition.toString();
                    updateConfig(config);
                },
            });
            signers.push(...createBlockDefinitionCtx.signers);
            accounts.push(...createBlockDefinitionCtx.accounts);
            blockDefinition.address =
                createBlockDefinitionCtx.blockDefinition.toString();
            return blockDefinition;
        }));
        return block;
    }));
    accounts = accounts.filter((x, index, self) => index === self.findIndex((y) => x.equals(y)));
    let i = 0;
    for (let t of transactions) {
        await (0, utils_1.sendAndConfirmTransaction)(t.tx, connection, wallet, t.signers, {
            skipPreflight: true,
        })
            .then((txId) => {
            if (t.postAction)
                t.postAction();
            console.log(`Assembler setup tx: ${txId}, (${++i}/${transactions.length})`);
        })
            .catch((e) => {
            console.error(e);
        });
    }
    return config;
}
exports.setupAssembler = setupAssembler;
//# sourceMappingURL=setupAssembler.js.map