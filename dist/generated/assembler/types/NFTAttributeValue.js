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
exports.nFTAttributeValueBeet = exports.isNFTAttributeValueNumber = exports.isNFTAttributeValueBoolean = exports.isNFTAttributeValueString = void 0;
const beet = __importStar(require("@metaplex-foundation/beet"));
const isNFTAttributeValueString = (x) => x.__kind === 'String';
exports.isNFTAttributeValueString = isNFTAttributeValueString;
const isNFTAttributeValueBoolean = (x) => x.__kind === 'Boolean';
exports.isNFTAttributeValueBoolean = isNFTAttributeValueBoolean;
const isNFTAttributeValueNumber = (x) => x.__kind === 'Number';
exports.isNFTAttributeValueNumber = isNFTAttributeValueNumber;
exports.nFTAttributeValueBeet = beet.dataEnum([
    [
        'String',
        new beet.FixableBeetArgsStruct([['value', beet.utf8String]], 'NFTAttributeValueRecord["String"]'),
    ],
    [
        'Boolean',
        new beet.BeetArgsStruct([['value', beet.bool]], 'NFTAttributeValueRecord["Boolean"]'),
    ],
    [
        'Number',
        new beet.BeetArgsStruct([['value', beet.u64]], 'NFTAttributeValueRecord["Number"]'),
    ],
]);
//# sourceMappingURL=NFTAttributeValue.js.map