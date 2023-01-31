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
const mpl_candy_guard_1 = require("@metaplex-foundation/mpl-candy-guard");
const generated_1 = require("../../generated");
const assetmanager_1 = require("../../generated/assetmanager");
async function createMintAssetTransaction(mx, assetAddress, amount, checkAssociatedTokenAccount = true, group = null, programId = assetmanager_1.PROGRAM_ID) {
    var _a;
    let wallet = mx.identity();
    const assetAccount = await generated_1.Asset.fromAccountAddress(mx.connection, assetAddress);
    if (!assetAccount)
        throw new Error("Asset account not found!");
    const mint = assetAccount.mint;
    const candyGuardAddress = assetAccount.candyGuard;
    const tokenAccount = splToken.getAssociatedTokenAddressSync(mint, wallet.publicKey);
    let mintInstruction = (0, generated_1.createMintAssetInstruction)({
        asset: assetAddress,
        mint,
        tokenAccount,
        candyGuard: candyGuardAddress || programId,
        wallet: wallet.publicKey,
    }, { amount }, programId);
    let signers = [];
    let accounts = mintInstruction.keys;
    if (candyGuardAddress) {
        mx.programs().getCandyGuard().address = new web3.PublicKey("FhCHXHuD6r2iCGwHgqcgnDbwXprLf22pZcArSp4Si4n7");
        console.log(candyGuardAddress.toString());
        const cmClient = mx.candyMachines();
        const candyGuard = await cmClient.findCandyGuardByAddress({
            address: candyGuardAddress,
        });
        if (candyGuard) {
            const parsedMintSettings = cmClient
                .guards()
                .parseMintSettings(assetAddress, candyGuard, wallet.publicKey, wallet, { publicKey: mint }, group
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
                payer: wallet.publicKey,
                instructionSysvarAccount: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
            }, {
                label: null,
                mintArgs,
            });
            candyGuardMintInstruction.keys.push(...parsedMintSettings.accountMetas);
            candyGuardMintInstruction.keys.push(...mintInstruction.keys);
            mintInstruction = candyGuardMintInstruction;
            accounts = candyGuardMintInstruction.keys.slice();
            signers.push(...parsedMintSettings.signers);
        }
    }
    const tx = new web3.Transaction();
    if (checkAssociatedTokenAccount) {
        if (!(await mx.rpc().accountExists(tokenAccount)))
            tx.add(splToken.createAssociatedTokenAccountInstruction(wallet.publicKey, tokenAccount, wallet.publicKey, mint));
    }
    tx.add(mintInstruction);
    return {
        tx: tx,
        signers,
        accounts: accounts.map(({ pubkey }) => pubkey),
    };
}
exports.createMintAssetTransaction = createMintAssetTransaction;
async function mintAsset(mx, assetAddress, amount) {
    const ctx = await createMintAssetTransaction(mx, assetAddress, amount);
    const response = await mx
        .rpc()
        .sendAndConfirmTransaction(ctx.tx, { skipPreflight: true }, ctx.signers);
    return {
        response,
    };
}
exports.mintAsset = mintAsset;
//# sourceMappingURL=mintAsset.js.map