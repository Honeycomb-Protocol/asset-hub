#!/usr/bin/env node

import { readConfigFile, saveConfigFile } from "../node-utils";
import fs from "fs/promises";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { setupAssembler, uploadFiles } from "../sdk";
import { Block, BlockDefinition } from "../generated";
import {
  bundlrStorage,
  keypairIdentity,
  Metaplex,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import { web3 } from "@project-serum/anchor";
import { AssemblerConfig } from "src/types";

yargs(hideBin(process.argv))
  .command(
    "validate",
    "validate config",
    () => {},
    (argv) => {
      console.info(argv);
    }
  )
  .command(
    "upload",
    "Deploy assembler and asset managers",
    () => {},
    (argv) => {
      const connection = new web3.Connection(
        "https://lingering-newest-sheet.solana-devnet.quiknode.pro/fb6e6465df3955a06fd5ddec2e5b003896f56adb/",
        "confirmed"
      );

      const metaplex = new Metaplex(connection);
      metaplex.use(
        keypairIdentity(
          web3.Keypair.fromSecretKey(
            Uint8Array.from(readConfigFile("key.json"))
          )
        )
      );

      metaplex.use(
        bundlrStorage({
          address: "https://devnet.bundlr.network",
          providerUrl: connection.rpcEndpoint,
          timeout: 60000,
        })
      );
      const config = readConfigFile("assembler.json");

      uploadFiles(
        metaplex,
        config,
        (cfg) => {
          // ...
          saveConfigFile(cfg, "assembler.json");
        },
        async (file) => {
          const buffer = await fs.readFile(path.resolve(process.cwd(), file));
          return toMetaplexFile(buffer, file.slice(file.lastIndexOf("/") + 1));
        }
      );
    }
  )
  .command(
    "lfg",
    "Deploy assembler and asset managers",
    () => {},
    (argv) => {
      const connection = new web3.Connection(
        "https://lingering-newest-sheet.solana-devnet.quiknode.pro/fb6e6465df3955a06fd5ddec2e5b003896f56adb/",
        "confirmed"
      );

      const metaplex = new Metaplex(connection);
      metaplex.use(
        keypairIdentity(
          web3.Keypair.fromSecretKey(
            Uint8Array.from(readConfigFile("key.json"))
          )
        )
      );

      const config = readConfigFile("assembler.json");

      setupAssembler(metaplex, config, (cfg) => {
        // ...
        saveConfigFile(cfg, "assembler.json");
      });
    }
  )
  .command(
    "post-lfg",
    "Deploy assembler and asset managers",
    () => {},
    async (argv) => {
      const connection = new web3.Connection(
        "https://lingering-newest-sheet.solana-devnet.quiknode.pro/fb6e6465df3955a06fd5ddec2e5b003896f56adb/",
        "confirmed"
      );

      const metaplex = new Metaplex(connection);
      metaplex.use(
        keypairIdentity(
          web3.Keypair.fromSecretKey(
            Uint8Array.from(readConfigFile("key.json"))
          )
        )
      );

      const config: AssemblerConfig = readConfigFile("assembler.json");
      await Promise.all(
        config.blocks.map(async (block) => {
          if (block.address) {
            const blockAccount = await Block.fromAccountAddress(
              connection,
              new web3.PublicKey(block.address)
            );
            console.log(blockAccount);
            const blockDefinitions = await BlockDefinition.gpaBuilder()
              .addFilter("block", new web3.PublicKey(block.address))
              .run(connection);
            const definationIndexes: { [k: string]: number } = {};
            blockDefinitions.forEach(({ pubkey, account }) => {
              const [definition] = BlockDefinition.fromAccountInfo(account);
              definationIndexes[pubkey.toString()] = definition.definationIndex;
              definition.definationIndex;
            });
            block.definitions.forEach((definition) => {
              definition.definationIndex =
                definationIndexes[definition.address];
            });
          }
        })
      );
      saveConfigFile(config, "assembler.json");
    }
  )
  .demandCommand(1)
  .parse();
