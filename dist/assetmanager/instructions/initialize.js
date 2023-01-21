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
exports.createInitializeInstruction = exports.initializeInstructionDiscriminator = exports.initializeStruct = void 0;
const beet = __importStar(require("@metaplex-foundation/beet"));
const web3 = __importStar(require("@solana/web3.js"));
exports.initializeStruct = new beet.BeetArgsStruct([['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]], 'InitializeInstructionArgs');
exports.initializeInstructionDiscriminator = [
    175, 175, 109, 31, 13, 152, 155, 237,
];
function createInitializeInstruction(programId = new web3.PublicKey('AXX2agYcoDwGFsgEWvSitqfGH4ooKXUqK5P7Ch9raDJT')) {
    const [data] = exports.initializeStruct.serialize({
        instructionDiscriminator: exports.initializeInstructionDiscriminator,
    });
    const keys = [];
    const ix = new web3.TransactionInstruction({
        programId,
        keys,
        data,
    });
    return ix;
}
exports.createInitializeInstruction = createInitializeInstruction;
//# sourceMappingURL=initialize.js.map