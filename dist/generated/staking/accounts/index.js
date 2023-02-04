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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountProviders = void 0;
__exportStar(require("./Multipliers"), exports);
__exportStar(require("./NFT"), exports);
__exportStar(require("./Project"), exports);
__exportStar(require("./Staker"), exports);
const Multipliers_1 = require("./Multipliers");
const NFT_1 = require("./NFT");
const Project_1 = require("./Project");
const Staker_1 = require("./Staker");
exports.accountProviders = { Multipliers: Multipliers_1.Multipliers, NFT: NFT_1.NFT, Project: Project_1.Project, Staker: Staker_1.Staker };
//# sourceMappingURL=index.js.map