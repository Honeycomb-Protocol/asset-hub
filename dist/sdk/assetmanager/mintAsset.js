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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintAsset = exports.createMintAssetTransaction = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const splToken = __importStar(require("@solana/spl-token"));
const js_1 = require("@metaplex-foundation/js");
const mpl_candy_guard_1 = require("@metaplex-foundation/mpl-candy-guard");
const utils_1 = require("../../utils");
const generated_1 = require("../../generated");
const assetmanager_1 = require("../../generated/assetmanager");
async function createMintAssetTransaction(metaplex, assetAddress, mint, wallet, amount, candyGuardAddress = null, group = null, programId = assetmanager_1.PROGRAM_ID) {
    var _a;
    const tokenAccount = splToken.getAssociatedTokenAddressSync(mint, wallet);
    const mintInstruction = (0, generated_1.createMintAssetInstruction)({
        asset: assetAddress,
        mint,
        tokenAccount,
        candyGuard: candyGuardAddress || programId,
        wallet,
    }, { amount }, programId);
    if (candyGuardAddress) {
        console.log(candyGuardAddress.toString(), (metaplex.programs().getCandyGuard().address = new web3.PublicKey("FhCHXHuD6r2iCGwHgqcgnDbwXprLf22pZcArSp4Si4n7")));
        const cmClient = metaplex.candyMachines();
        const candyGuard = await cmClient.findCandyGuardByAddress({
            address: candyGuardAddress,
        });
        const parsedMintSettings = cmClient.guards().parseMintSettings(assetAddress, candyGuard, metaplex.identity().publicKey, metaplex.identity(), { publicKey: mint }, group
            ? (_a = candyGuard.groups.find(({ label }) => label == group)) === null || _a === void 0 ? void 0 : _a.guards
            : candyGuard.guards, group);
        const customArgsLen = Buffer.alloc(2);
        customArgsLen.writeInt16LE(mintInstruction.data.length);
        const mintArgs = Buffer.concat([
            customArgsLen,
            Buffer.from(mintInstruction.data),
            parsedMintSettings.arguments,
        ]);
        const candyGuardMintInstruction = (0, mpl_candy_guard_1.createMintInstruction)({
            candyGuard: candyGuardAddress,
            candyMachineProgram: programId,
            candyMachine: assetAddress,
            payer: wallet,
            instructionSysvarAccount: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        }, {
            label: null,
            mintArgs,
        });
        candyGuardMintInstruction.keys.push(...parsedMintSettings.accountMetas);
        candyGuardMintInstruction.keys.push(...mintInstruction.keys);
        return {
            tx: new web3.Transaction().add(candyGuard ? candyGuardMintInstruction : mintInstruction),
            signers: [...parsedMintSettings.signers],
            accounts: [],
        };
    }
    else {
        return {
            tx: new web3.Transaction().add(mintInstruction),
            signers: [],
            accounts: [],
        };
    }
}
exports.createMintAssetTransaction = createMintAssetTransaction;
async function mintAsset(connection, wallet, asset, amount) {
    const assetAccount = await generated_1.Asset.fromAccountAddress(connection, asset);
    const mx = new js_1.Metaplex(connection);
    mx.use((0, js_1.walletAdapterIdentity)(wallet));
    console.log(assetAccount.candyGuard.toString());
    const ctx = await createMintAssetTransaction(mx, asset, assetAccount.mint, wallet.publicKey, amount, assetAccount.candyGuard);
    const txId = await (0, utils_1.sendAndConfirmTransaction)(ctx.tx, connection, wallet, ctx.signers, { skipPreflight: true });
    return {
        txId,
    };
}
exports.mintAsset = mintAsset;
//# sourceMappingURL=mintAsset.js.map