#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const sdk_1 = require("../sdk");
(0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .command('validate', 'validate config', () => { }, (argv) => {
    console.info(argv);
})
    .command('lfg', 'Deploy assembler and asset managers', () => { }, (argv) => {
    const config = (0, utils_1.readConfigFile)("assembler.json");
    (0, sdk_1.setupAssembler)(config).then(newConf => (0, utils_1.saveConfigFile)(newConf, "assembler.json"));
})
    .demandCommand(1)
    .parse();
//# sourceMappingURL=index.js.map