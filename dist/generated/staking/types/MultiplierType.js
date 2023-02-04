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
exports.multiplierTypeBeet = exports.isMultiplierTypeCollection = exports.isMultiplierTypeCreator = exports.isMultiplierTypeNFTCount = exports.isMultiplierTypeStakeDuration = void 0;
const beet = __importStar(require("@metaplex-foundation/beet"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
const isMultiplierTypeStakeDuration = (x) => x.__kind === 'StakeDuration';
exports.isMultiplierTypeStakeDuration = isMultiplierTypeStakeDuration;
const isMultiplierTypeNFTCount = (x) => x.__kind === 'NFTCount';
exports.isMultiplierTypeNFTCount = isMultiplierTypeNFTCount;
const isMultiplierTypeCreator = (x) => x.__kind === 'Creator';
exports.isMultiplierTypeCreator = isMultiplierTypeCreator;
const isMultiplierTypeCollection = (x) => x.__kind === 'Collection';
exports.isMultiplierTypeCollection = isMultiplierTypeCollection;
exports.multiplierTypeBeet = beet.dataEnum([
    [
        'StakeDuration',
        new beet.BeetArgsStruct([['minDuration', beet.u64]], 'MultiplierTypeRecord["StakeDuration"]'),
    ],
    [
        'NFTCount',
        new beet.BeetArgsStruct([['minCount', beet.u64]], 'MultiplierTypeRecord["NFTCount"]'),
    ],
    [
        'Creator',
        new beet.BeetArgsStruct([['creator', beetSolana.publicKey]], 'MultiplierTypeRecord["Creator"]'),
    ],
    [
        'Collection',
        new beet.BeetArgsStruct([['collection', beetSolana.publicKey]], 'MultiplierTypeRecord["Collection"]'),
    ],
]);
//# sourceMappingURL=MultiplierType.js.map