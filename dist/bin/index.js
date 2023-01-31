#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_utils_1 = require("../node-utils");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const sdk_1 = require("../sdk");
const js_1 = require("@metaplex-foundation/js");
const anchor_1 = require("@project-serum/anchor");
(0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .command("validate", "validate config", () => { }, (argv) => {
    console.info(argv);
})
    .command("lfg", "Deploy assembler and asset managers", () => { }, (argv) => {
    const connection = new anchor_1.web3.Connection("https://lingering-newest-sheet.solana-devnet.quiknode.pro/fb6e6465df3955a06fd5ddec2e5b003896f56adb/", "confirmed");
    const metaplex = new js_1.Metaplex(connection);
    metaplex.use((0, js_1.keypairIdentity)(anchor_1.web3.Keypair.fromSecretKey(Uint8Array.from((0, node_utils_1.readConfigFile)("key.json")))));
    const config = (0, node_utils_1.readConfigFile)("assembler.json");
    (0, sdk_1.setupAssembler)(metaplex, config, (cfg) => {
        (0, node_utils_1.saveConfigFile)(cfg, "assembler.json");
    }, async (file) => {
        const buffer = await promises_1.default.readFile(path_1.default.resolve(process.cwd(), file));
        return (0, js_1.toMetaplexFile)(buffer, file.slice(file.lastIndexOf("/") + 1));
    });
})
    .demandCommand(1)
    .parse();
//# sourceMappingURL=index.js.map