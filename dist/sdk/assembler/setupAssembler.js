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
const web3 = __importStar(require("@solana/web3.js"));
const key_json_1 = __importDefault(require("../../../key.json"));
const generated_1 = require("../../generated");
const _1 = require(".");
const utils_1 = require("../../utils");
const wallet = new anchor.Wallet(web3.Keypair.fromSecretKey(Uint8Array.from(key_json_1.default)));
const connection = new web3.Connection("https://api.devnet.solana.com/");
async function setupAssembler(config) {
    let transactions = [];
    let signers = [];
    let accounts = [];
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
    const collectionUri = "";
    const createAssemblerCtx = (0, _1.createCreateAssemblerTransaction)(wallet.publicKey, wallet.publicKey, {
        assemblingAction: assemblingAction,
        collectionName: config.name,
        collectionSymbol: config.symbol,
        collectionUri,
        collectionDescription: config.description,
        nftBaseUri: config.base_url
    });
    transactions.push(createAssemblerCtx.tx);
    signers.push(...createAssemblerCtx.signers);
    accounts.push(...createAssemblerCtx.accounts);
    config.blocks.forEach(block => {
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
        const createBlockCtx = (0, _1.createCreateBlockTransaction)(createAssemblerCtx.assembler, wallet.publicKey, wallet.publicKey, {
            blockName: block.name,
            blockOrder: block.order,
            blockType: blockType,
            isGraphical: block.isGraphical,
        });
        transactions.push(createBlockCtx.tx);
        signers.push(...createBlockCtx.signers);
        accounts.push(...createBlockCtx.accounts);
        block.definitions.forEach(blockDefinition => {
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
                    throw new Error("Invalid mint address or collection address in block definition " + blockDefinition.value + " of block " + block.name);
                }
            }
            else {
                throw new Error("Asset Config not yet implemented");
            }
            const createBlockDefinitionCtx = (0, _1.createCreateBlockDefinitionTransaction)(createAssemblerCtx.assembler, createBlockCtx.block, blockDefinitionMint, wallet.publicKey, wallet.publicKey, blockDefArgs);
            transactions.push(createBlockDefinitionCtx.tx);
            signers.push(...createBlockDefinitionCtx.signers);
            accounts.push(...createBlockDefinitionCtx.accounts);
        });
    });
    accounts = accounts.filter((x, index, self) => index === self.findIndex((y) => x.equals(y)));
    const lookuptable = await (0, utils_1.createLookupTable)(connection, wallet, ...accounts);
    const v0Tx = await (0, utils_1.createV0TxWithLUT)(connection, wallet.publicKey, lookuptable, ...transactions.map(t => t.instructions).flat());
    const txId = await (0, utils_1.sendAndConfirmV0Transaction)(v0Tx, connection, wallet, signers);
    console.log("Assembler setup tx:", txId);
}
exports.setupAssembler = setupAssembler;
//# sourceMappingURL=setupAssembler.js.map