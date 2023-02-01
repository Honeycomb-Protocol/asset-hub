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
exports.updateAssemblerArgsBeet = void 0;
const beet = __importStar(require("@metaplex-foundation/beet"));
const AssemblingAction_1 = require("./AssemblingAction");
exports.updateAssemblerArgsBeet = new beet.FixableBeetArgsStruct([
    ['assemblingAction', AssemblingAction_1.assemblingActionBeet],
    ['nftBaseUri', beet.utf8String],
    ['allowDuplicates', beet.coption(beet.bool)],
    ['defaultRoyalty', beet.coption(beet.u16)],
], 'UpdateAssemblerArgs');
//# sourceMappingURL=UpdateAssemblerArgs.js.map