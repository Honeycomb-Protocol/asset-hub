import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import key from "../../../key.json";
import { AssemblingAction, BlockDefinitionValue, BlockType } from "../../generated";
import { AssemblerConfig } from "../../types";
import { createCreateAssemblerTransaction, createCreateBlockTransaction, createCreateBlockDefinitionTransaction } from ".";
import { createLookupTable, createV0TxWithLUT, sendAndConfirmV0Transaction } from "../../utils";

const wallet = new anchor.Wallet(
    web3.Keypair.fromSecretKey(Uint8Array.from(key))
);
const connection = new web3.Connection("https://api.devnet.solana.com/");


export async function setupAssembler(config: AssemblerConfig) {

    let transactions: (web3.Transaction)[] = []
    let signers: web3.Signer[] = []
    let accounts: web3.PublicKey[] = []

    /// Creating the assembler

    let assemblingAction: AssemblingAction;

    switch (config.assemblingAction) {
        case "Burn":
            assemblingAction = AssemblingAction.Burn
            break;
        case "Freeze":
            assemblingAction = AssemblingAction.Freeze
            break;
        case "TakeCustody":
            assemblingAction = AssemblingAction.TakeCustody
            break;

        default:
            break;
    }

    const collectionUri = ""
    const createAssemblerCtx = createCreateAssemblerTransaction(
        wallet.publicKey,
        wallet.publicKey,
        {
            assemblingAction: assemblingAction,
            collectionName: config.name,
            collectionSymbol: config.symbol,
            collectionUri,
            collectionDescription: config.description,
            nftBaseUri: config.base_url
        }
    )
    transactions.push(createAssemblerCtx.tx);
    signers.push(...createAssemblerCtx.signers);
    accounts.push(...createAssemblerCtx.accounts);

    /// Creating blocks
    config.blocks.forEach(block => {

        let blockType: BlockType;
        switch (block.type) {
            case "Enum":
                blockType = BlockType.Enum
                break;
            case "Boolean":
                blockType = BlockType.Boolean
                break;
            case "Random":
                blockType = BlockType.Random
                break;
            case "Computed":
                blockType = BlockType.Computed
                break;
            default:
                throw new Error("Invalid Block Type");

        }

        const createBlockCtx = createCreateBlockTransaction(
            createAssemblerCtx.assembler,
            wallet.publicKey,
            wallet.publicKey,
            {
                blockName: block.name,
                blockOrder: block.order,
                blockType: blockType,
                isGraphical: block.isGraphical,
            }
        )
        transactions.push(createBlockCtx.tx);
        signers.push(...createBlockCtx.signers);
        accounts.push(...createBlockCtx.accounts);

        /// Creating block definitions
        block.definitions.forEach(blockDefinition => {

            let blockDefArgs: BlockDefinitionValue;
            if (blockType === BlockType.Enum) {
                blockDefArgs = {
                    __kind: "Enum",
                    value: blockDefinition.value,
                    isCollection: !!!blockDefinition.mintAddress && !!blockDefinition.collection,
                    image: null,
                };
            } else if (blockType === BlockType.Boolean) {
                blockDefArgs = {
                    __kind: "Boolean",
                    value: blockDefinition.value === "true",
                };
            } else if (
                blockType === BlockType.Random ||
                blockType === BlockType.Computed
            ) {
                const [min, max] = blockDefinition.value.split("-")
                blockDefArgs = {
                    __kind: "Number",
                    min: parseInt(min),
                    max: parseInt(max),
                };
            } else {
                throw new Error("Invalid block type");
            }

            let blockDefinitionMint: web3.PublicKey;
            if (blockDefinition.mintAddress || blockDefinition.collection) {
                try {
                    blockDefinitionMint = new web3.PublicKey(blockDefinition.mintAddress || blockDefinition.collection)
                } catch (error) {
                    throw new Error("Invalid mint address or collection address in block definition " + blockDefinition.value + " of block " + block.name)
                }
            } else {
                /// TODO create new asset if assetConfig provided
                throw new Error("Asset Config not yet implemented")
            }

            const createBlockDefinitionCtx = createCreateBlockDefinitionTransaction(
                createAssemblerCtx.assembler,
                createBlockCtx.block,
                blockDefinitionMint,
                wallet.publicKey,
                wallet.publicKey,
                blockDefArgs
            )
            transactions.push(createBlockDefinitionCtx.tx);
            signers.push(...createBlockDefinitionCtx.signers);
            accounts.push(...createBlockDefinitionCtx.accounts);

        })

    })

    /// Remove duplicate accounts
    accounts = accounts.filter(
        (x, index, self) => index === self.findIndex((y) => x.equals(y))
    );

    const lookuptable = await createLookupTable(
        connection,
        wallet,
        ...accounts
    );

    const v0Tx = await createV0TxWithLUT(
        connection,
        wallet.publicKey,
        lookuptable,
        ...transactions.map(t => t.instructions).flat()
    )

    const txId = await sendAndConfirmV0Transaction(
        v0Tx,
        connection,
        wallet,
        signers
    )

    console.log("Assembler setup tx:", txId);

}