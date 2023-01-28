import * as web3 from "@solana/web3.js";

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
import { Signer, Metaplex, MetaplexFile } from "@metaplex-foundation/js";
import { createCreateAssetTransaction } from "../assetmanager";
import {
  bulkLutTransactions,
  confirmBulkTransactions,
  devideAndSignTxns,
  devideAndSignV0Txns,
  sendBulkTransactions,
  sendBulkTransactionsLegacy,
} from "../../utils";
import { Wallet } from "@project-serum/anchor";
type TransactionGroup = {
  txns: TxSignersAccounts[];
  postActions: ((...args: any[]) => any)[];
};
export async function setupAssembler(
  mx: Metaplex,
  config: AssemblerConfig,
  updateConfig: (cfg: AssemblerConfig) => void,
  readFile: (path: string) => Promise<MetaplexFile>
) {
  const transactionGroups: TransactionGroup[] = [
    {
      txns: [],
      postActions: [],
    },
  ];
  const wallet: Wallet = mx.identity() as any;
  if (!config.destroyableLookupTables) config.destroyableLookupTables = [];
  /// Creating the assembler
  const assemblingAction: AssemblingAction =
    AssemblingAction[config.assemblingAction] || AssemblingAction.Burn;

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
    transactionGroups[0].txns.push(createAssemblerCtx);
    transactionGroups[0].postActions.push(() => {
      config.assemblerAddress = createAssemblerCtx.assembler.toString();
      updateConfig(config);
    });
    assemblerAddress = createAssemblerCtx.assembler.toString();
  }

  /// Creating blocks
  await Promise.all(
    config.blocks.map(async (block) => {
      const blockType: BlockType = BlockType[block.type] || BlockType.Enum;

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
        transactionGroups[0].txns.push(createBlockCtx);
        transactionGroups[0].postActions.push(() => {
          block.address = createBlockCtx.block.toString();
          updateConfig(config);
        });
        blockAddress = createBlockCtx.block.toString();
      }
      const transactionGroup: TransactionGroup = {
        txns: [],
        postActions: [],
      };
      transactionGroups.push(transactionGroup);

      /// Creating block definitions
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
              const file = await readFile(blockDefinition.assetConfig.image);
              const m = await mx.nfts().uploadMetadata({
                name: "HoneyComb Asset",
                image: file,
                symbol: blockDefinition.assetConfig.symbol,
                ...(blockDefinition.assetConfig.json || {}),
              });
              if (!blockDefinition.caches)
                blockDefinition.caches = {
                  image: blockDefinition.assetConfig.image,
                };
              blockDefinition.caches.image = blockDefinition.assetConfig.image;
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
            transactionGroup.txns.push(createAssetCtx);
            transactionGroup.postActions.push(() => {
              blockDefinition.assetConfig.address =
                createAssetCtx.asset.toString();
              blockDefinition.mintAddress = createAssetCtx.mint.toString();
              updateConfig(config);
            });
            blockDefinitionMint = createAssetCtx.mint;
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

          transactionGroup.txns.push(createBlockDefinitionCtx);
          transactionGroup.postActions.push(() => {
            blockDefinition.address =
              createBlockDefinitionCtx.blockDefinition.toString();
            updateConfig(config);
          });

          return blockDefinition;
        })
      );

      return block;
    })
  );
  for (let tg of transactionGroups) {
    if (tg.txns.length) {
      console.log(tg.txns.length);
      const { txns, lookupTableAddress } = await bulkLutTransactions(
        mx,
        tg.txns
      );

      // console.log(txns);
      // console.log(txns.map((tx) => tx.serialize().byteLength));

      txns.forEach((txn) => {
        txn.sign([wallet as any]);
      });

      // console.log(txns.map((tx) => tx.serialize().byteLength));
      const processedConnection = new web3.Connection(
        mx.connection.rpcEndpoint,
        "processed"
      );
      const responses = await confirmBulkTransactions(
        mx.connection,
        await sendBulkTransactions(processedConnection, txns)
      );
      config.destroyableLookupTables.push(lookupTableAddress.toString());
      updateConfig(config);
      // console.log(responses);
    }
    tg.postActions.forEach((action) => {
      action();
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
  const destroyableLookupTables: web3.PublicKey[] =
    config.destroyableLookupTables.map((str) => new web3.PublicKey(str));

  if (false && destroyableLookupTables.length) {
    const latestBlockhash = await mx.connection.getLatestBlockhash();
    const destroyTransactions = destroyableLookupTables.map((address) =>
      new web3.Transaction({
        feePayer: wallet.publicKey,
        recentBlockhash: latestBlockhash.blockhash,
      }).add(
        web3.AddressLookupTableProgram.closeLookupTable({
          authority: wallet.publicKey,
          lookupTable: address,
          recipient: wallet.publicKey,
        })
      )
    );

    wallet.signAllTransactions(destroyTransactions);
    // txns.forEach((txn) => {
    //   txn.sign([wallet as any]);
    // });
    // console.log(txns.map((tx) => tx.serialize().byteLength));

    await confirmBulkTransactions(
      mx.connection,
      await sendBulkTransactionsLegacy(mx, destroyTransactions)
    );
  }
  return config;
}
