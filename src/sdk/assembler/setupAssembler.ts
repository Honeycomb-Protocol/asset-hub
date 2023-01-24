import * as anchor from "@project-serum/anchor";
import fs from "fs/promises";
import path from "path";
import * as web3 from "@solana/web3.js";
// //@ts-ignore
// import key from "../../../key.json";
import {
  AssemblingAction,
  BlockDefinitionValue,
  BlockType,
} from "../../generated";
import { AssemblerConfig, TxSignersAccounts } from "../../types";
import {
  createCreateAssemblerTransaction,
  createCreateBlockTransaction,
  createCreateBlockDefinitionTransaction,
} from ".";
import {
  createLookupTable,
  createV0TxWithLUT,
  sendAndConfirmTransaction,
  sendAndConfirmV0Transaction,
} from "../../utils";
import {
  Signer,
  Metaplex,
  toMetaplexFile,
  keypairIdentity,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { createCreateAssetTransaction } from "../assetmanager";

const wallet = new anchor.Wallet(
  // web3.Keypair.fromSecretKey(Uint8Array.from(key))
  web3.Keypair.fromSecretKey(Uint8Array.from(web3.Keypair.generate().secretKey))
);
const connection = new web3.Connection(
  "https://api.devnet.solana.com/",
  "processed"
);

export async function setupAssembler(
  config: AssemblerConfig,
  updateConfig: (cfg: AssemblerConfig) => void
) {
  let transactions: (TxSignersAccounts & {
    postAction: (...args: any[]) => any;
  })[] = [];
  let signers: Signer[] = [];
  let accounts: web3.PublicKey[] = [];

  const metaplex = new Metaplex(connection);
  metaplex.use(walletAdapterIdentity(wallet));
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

  let assemblerAddress = config.assemblerAddress;
  if (!assemblerAddress) {
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
    transactions.push({
      ...createAssemblerCtx,
      postAction() {
        config.assemblerAddress = createAssemblerCtx.assembler.toString();
        updateConfig(config);
      },
    });
    signers.push(...createAssemblerCtx.signers);
    accounts.push(...createAssemblerCtx.accounts);
    assemblerAddress = createAssemblerCtx.assembler.toString();
  }
  /// Creating blocks
  // config.blocks =
  await Promise.all(
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

      let blockAddress = block.address;
      if (!blockAddress) {
        const createBlockCtx = createCreateBlockTransaction(
          new web3.PublicKey(assemblerAddress),
          wallet.publicKey,
          wallet.publicKey,
          {
            blockName: block.name,
            blockOrder: block.order,
            blockType: blockType,
            isGraphical: block.isGraphical,
          }
        );
        transactions.push({
          ...createBlockCtx,
          postAction() {
            block.address = createBlockCtx.block.toString();
            updateConfig(config);
          },
        });
        signers.push(...createBlockCtx.signers);
        accounts.push(...createBlockCtx.accounts);
        blockAddress = createBlockCtx.block.toString();
      }

      /// Creating block definitions
      // block.definitions =
      await Promise.all(
        block.definitions.map(async (blockDefinition) => {
          if (blockDefinition.address) return;
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
              updateConfig(config);
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
            transactions.push({
              ...createAssetCtx,
              postAction() {
                blockDefinition.assetConfig.address =
                  createAssetCtx.asset.toString();
                blockDefinition.mintAddress = createAssetCtx.mint.toString();
                updateConfig(config);
              },
            });
            // transactions.push(createAssetCtx);
            signers.push(...createAssetCtx.signers);
            accounts.push(...createAssetCtx.accounts);
            blockDefinitionMint = createAssetCtx.mint;
            // blockDefinition.mintAddress = createAssetCtx.mint.toString();
          } else {
            throw new Error("Block definition details not provided properly");
          }

          const createBlockDefinitionCtx =
            createCreateBlockDefinitionTransaction(
              new web3.PublicKey(assemblerAddress),
              new web3.PublicKey(blockAddress),
              blockDefinitionMint,
              wallet.publicKey,
              wallet.publicKey,
              blockDefArgs
            );
          transactions.push({
            ...createBlockDefinitionCtx,
            postAction() {
              blockDefinition.address =
                createBlockDefinitionCtx.blockDefinition.toString();
              updateConfig(config);
            },
          });
          // transactions.push(createBlockDefinitionCtx);
          signers.push(...createBlockDefinitionCtx.signers);
          accounts.push(...createBlockDefinitionCtx.accounts);
          // blockDefinition.address =
          //   createBlockDefinitionCtx.blockDefinition.toString();
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

  // const lookuptable = await createLookupTable(connection, wallet, ...accounts);
  let i = 0;
  for (let t of transactions) {
    await sendAndConfirmTransaction(t.tx, connection, wallet, t.signers, {
      skipPreflight: true,
    })
      .then((txId) => {
        if (t.postAction) t.postAction();
        console.log(
          `Assembler setup tx: ${txId}, (${++i}/${transactions.length})`
        );
      })
      .catch((e) => {
        console.error(e);
      });
    // await createV0TxWithLUT(
    //   connection,
    //   wallet.publicKey,
    //   lookuptable,
    //   ...t.tx.instructions
    // )
    //   .then((v0Tx) =>
    //     sendAndConfirmV0Transaction(v0Tx, connection, wallet, t.signers)
    //   )
    //   .then((txId) =>
    //     console.log(
    //       `Assembler setup tx: ${txId}, (${++i}/${transactions.length})`
    //     )
    //   );
  }

  return config;
}
