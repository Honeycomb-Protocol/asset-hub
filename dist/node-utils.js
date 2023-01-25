"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveConfigFile = exports.readConfigFile = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const readConfigFile = (configFile) => {
    const configPath = path_1.default.join(process.cwd(), configFile);
    return JSON.parse(fs_1.default.readFileSync(configPath).toString());
};
exports.readConfigFile = readConfigFile;
const saveConfigFile = (configFile, configFileName) => {
    const configPath = path_1.default.join(process.cwd(), configFileName);
    fs_1.default.writeFileSync(configPath, JSON.stringify(configFile, null, 2));
};
exports.saveConfigFile = saveConfigFile;
//# sourceMappingURL=node-utils.js.map