import * as anchor from "@project-serum/anchor";
import fs from "fs/promises";
import path from "path";
import * as web3 from "@solana/web3.js";
import key from "../../../key.json";
import {
  AssemblingAction,
  BlockDefinitionValue,
  BlockType,
} from "../../generated";
import { AssemblerConfig } from "../../types";
import {
  createCreateAssemblerTransaction,
  createCreateBlockTransaction,
  createCreateBlockDefinitionTransaction,
} from ".";
import {
  createLookupTable,
  createV0TxWithLUT,
  sendAndConfirmV0Transaction,
} from "../../utils";
import {
  Signer,
  Metaplex,
  toMetaplexFile,
  keypairIdentity,
} from "@metaplex-foundation/js";
import { createCreateAssetTransaction } from "../assetmanager";

const wallet = new anchor.Wallet(
  web3.Keypair.fromSecretKey(Uint8Array.from(key))
);
const connection = new web3.Connection(
  "https://api.devnet.solana.com/",
  "processed"
);

export async function setupAssembler(config: AssemblerConfig) {
  let transactions: web3.Transaction[] = [];
  let signers: Signer[] = [];
  let accounts: web3.PublicKey[] = [];

  const metaplex = new Metaplex(connection);
  metaplex.use(keypairIdentity(wallet.payer));
  /// Creating the assembler

  let assemblingAction: AssemblingAction;

  switch (config.assemblingAction) {
    case "Burn":
      assemblingAction = AssemblingAction.Burn;
      break;
    case "Freeze":
      assemblingAction = AssemblingAction.Freeze;
      break;
    case "TakeCustody":
      assemblingAction = AssemblingAction.TakeCustody;
      break;

    default:
      break;
  }

  const collectionUri = "";
  const createAssemblerCtx = createCreateAssemblerTransaction(
    wallet.publicKey,
    wallet.publicKey,
    {
      assemblingAction: assemblingAction,
      collectionName: config.name,
      collectionSymbol: config.symbol,
      collectionUri,
      collectionDescription: config.description,
      nftBaseUri: config.base_url,
    }
  );
  transactions.push(createAssemblerCtx.tx);
  signers.push(...createAssemblerCtx.signers);
  accounts.push(...createAssemblerCtx.accounts);
  config.assemblerAddress = createAssemblerCtx.assembler.toString();

  /// Creating blocks
  config.blocks = await Promise.all(
    config.blocks.map(async (block) => {
      let blockType: BlockType;
      switch (block.type) {
        case "Enum":
          blockType = BlockType.Enum;
          break;
        case "Boolean":
          blockType = BlockType.Boolean;
          break;
        case "Random":
          blockType = BlockType.Random;
          break;
        case "Computed":
          blockType = BlockType.Computed;
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
      );
      transactions.push(createBlockCtx.tx);
      signers.push(...createBlockCtx.signers);
      accounts.push(...createBlockCtx.accounts);
      block.address = createBlockCtx.block.toString();

      /// Creating block definitions
      block.definitions = await Promise.all(
        block.definitions.map(async (blockDefinition) => {
          let blockDefArgs: BlockDefinitionValue;
          if (blockType === BlockType.Enum) {
            blockDefArgs = {
              __kind: "Enum",
              value: blockDefinition.value,
              isCollection:
                !!!blockDefinition.mintAddress && !!blockDefinition.collection,
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
            const [min, max] = blockDefinition.value.split("-");
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
              blockDefinitionMint = new web3.PublicKey(
                blockDefinition.mintAddress || blockDefinition.collection
              );
            } catch (error) {
              throw new Error(
                "Invalid mint address or collection address in block definition " +
                  blockDefinition.value +
                  " of block " +
                  block.name
              );
            }
          } else if (blockDefinition.assetConfig) {
            let uri = blockDefinition.assetConfig.uri;
            if (!uri && blockDefinition.assetConfig.image) {
              const buffer = await fs.readFile(
                path.resolve(process.cwd(), blockDefinition.assetConfig.image)
              );
              const file = toMetaplexFile(
                buffer,
                blockDefinition.assetConfig.image.slice(
                  blockDefinition.assetConfig.image.lastIndexOf("/") + 1
                )
              );
              const m = await metaplex.nfts().uploadMetadata({
                name: "My NFT",
                image: file,
                symbol: blockDefinition.assetConfig.symbol,
              });
              uri = blockDefinition.assetConfig.uri = m.uri;
            }

            const createAssetCtx = createCreateAssetTransaction(
              wallet.publicKey,
              {
                name: blockDefinition.value,
                candyGuard: blockDefinition.assetConfig.candyGuard
                  ? new web3.PublicKey(blockDefinition.assetConfig.candyGuard)
                  : null,
                symbol: blockDefinition.assetConfig.symbol,
                uri: uri,
              }
            );
            transactions.push(createAssetCtx.tx);
            signers.push(...createAssetCtx.signers);
            accounts.push(...createAssetCtx.accounts);
            blockDefinitionMint = createAssetCtx.mint;
            blockDefinition.mintAddress = createAssetCtx.mint.toString();
          } else {
            throw new Error("Block definition details not provided properly");
          }

          const createBlockDefinitionCtx =
            createCreateBlockDefinitionTransaction(
              createAssemblerCtx.assembler,
              createBlockCtx.block,
              blockDefinitionMint,
              wallet.publicKey,
              wallet.publicKey,
              blockDefArgs
            );
          transactions.push(createBlockDefinitionCtx.tx);
          signers.push(...createBlockDefinitionCtx.signers);
          accounts.push(...createBlockDefinitionCtx.accounts);
          blockDefinition.address =
            createBlockDefinitionCtx.blockDefinition.toString();
          return blockDefinition;
        })
      );

      return block;
    })
  );

  /// Remove duplicate accounts
  accounts = accounts.filter(
    (x, index, self) => index === self.findIndex((y) => x.equals(y))
  );

  const lookuptable = await createLookupTable(connection, wallet, ...accounts);

  const v0Tx = await createV0TxWithLUT(
    connection,
    wallet.publicKey,
    lookuptable,
    ...transactions.map((t) => t.instructions).flat()
  );

  const txId = await sendAndConfirmV0Transaction(
    v0Tx,
    connection,
    wallet,
    signers
  );

  console.log("Assembler setup tx:", txId);

  return config;
}
