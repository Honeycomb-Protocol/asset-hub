#!/usr/bin/env node

import { readConfigFile, saveConfigFile } from "../utils";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { setupAssembler } from "../sdk";

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
    "lfg",
    "Deploy assembler and asset managers",
    () => {},
    (argv) => {
      const config = readConfigFile("assembler.json");
      setupAssembler(config, (cfg) => {
        // ...
        saveConfigFile(cfg, "assembler.json");
      }); //.then((newConf) => saveConfigFile(newConf, "assembler.json"));
    }
  )
  .demandCommand(1)
  .parse();
