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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rustbinMatch = exports.rustbinCheck = exports.rustbinVersion = void 0;
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
const text_table_1 = __importDefault(require("text-table"));
__exportStar(require("./utils/confirm"), exports);
const DEFAULT_BINARY_VERSION_FLAG = '--version';
/** @private */
class Rustbin {
    constructor(rootDir, binaryName, binaryCrateName, binaryVersionFlag, binaryVersionRx, libName, cargoToml, dryRun, locked, versionRangeFallback) {
        this.rootDir = rootDir;
        this.binaryName = binaryName;
        this.binaryCrateName = binaryCrateName;
        this.binaryVersionFlag = binaryVersionFlag;
        this.binaryVersionRx = binaryVersionRx;
        this.libName = libName;
        this.cargoToml = cargoToml;
        this.dryRun = dryRun;
        this.locked = locked;
        this.versionRangeFallback = versionRangeFallback;
        this.fullPathToBinary = path_1.default.join(rootDir, 'bin', binaryName);
        (0, utils_1.logDebug)(this);
    }
    async check() {
        const libVersion = await this.getVersionInToml();
        const { binVersion, satisfies } = await (0, utils_1.binarySatisfies)(this.fullPathToBinary, this.binaryVersionFlag, this.binaryVersionRx, libVersion);
        const rows = [
            ['Type', 'Name', 'Version'],
            ['----', '----', '-------'],
            ['lib', this.libName, libVersion],
            ['bin', this.binaryName, binVersion !== null && binVersion !== void 0 ? binVersion : '<unknown'],
        ];
        (0, utils_1.logInfo)((0, text_table_1.default)(rows));
        return {
            satisfies,
            libVersion,
            binVersion,
        };
    }
    async getVersionInToml() {
        const { parsed, toml } = await (0, utils_1.parseCargoToml)(this.cargoToml);
        const libVersion = parsed.dependencies[this.libName];
        if (libVersion == null) {
            (0, utils_1.logDebug)(toml);
            throw new Error(`${this.libName} not found as dependency in ${this.cargoToml}`);
        }
        return (typeof libVersion === 'string' ? libVersion : libVersion.version) || "unknown";
    }
    async installMatchinBin(libVersionRange) {
        // cargo install anchor-cli --version 0.24.2 --force --root `pwd`/scripts
        const cmd = 'cargo';
        const args = (0, utils_1.installArgs)(this.binaryCrateName, libVersionRange, this.locked, this.rootDir);
        const fullCmd = `${cmd} ${args.join(' ')}`;
        (0, utils_1.logInfo)(fullCmd);
        if (!this.dryRun) {
            try {
                await (0, utils_1.spawnCmd)(cmd, args);
            }
            catch (err) {
                const backupCmd = await this.handleFailedInstall(cmd, err);
                return backupCmd !== null && backupCmd !== void 0 ? backupCmd : fullCmd;
            }
        }
        return fullCmd;
    }
    async handleFailedInstall(cmd, err) {
        if (this.versionRangeFallback == null) {
            throw err;
        }
        else {
            // NOTE: this fallback logic isn't tested as it would be a lot of setup to simulate
            (0, utils_1.logError)(err.message);
            // 1. see if the currently installed binary matches the fallback
            const { satisfies } = await (0, utils_1.binarySatisfies)(this.fullPathToBinary, this.binaryVersionFlag, this.binaryVersionRx, this.versionRangeFallback);
            if (satisfies) {
                (0, utils_1.logError)(`Install for compatible version failed, using already installed fallback: '${this.versionRangeFallback}'`);
                return;
            }
            // 2. if not, install it
            const args = (0, utils_1.installArgs)(this.binaryCrateName, this.versionRangeFallback, this.locked, this.rootDir);
            const fullCmd = `${cmd} ${args.join(' ')}`;
            (0, utils_1.logError)(`Install for compatible version failed, trying fallback: '${this.versionRangeFallback}'`);
            (0, utils_1.logInfo)(fullCmd);
            await (0, utils_1.spawnCmd)(cmd, args);
            return fullCmd;
        }
    }
    static fromConfig(config) {
        const { rootDir, binaryName, libName, binaryVersionRx = utils_1.versionRx, binaryVersionFlag = DEFAULT_BINARY_VERSION_FLAG, dryRun = false, locked = false, cargoToml, versionRangeFallback, } = config;
        const { binaryCrateName = binaryName } = config;
        const fullRootDir = path_1.default.resolve(rootDir);
        const fullCargoToml = path_1.default.resolve(cargoToml);
        return new Rustbin(fullRootDir, binaryName, binaryCrateName, binaryVersionFlag, binaryVersionRx, libName, fullCargoToml, dryRun, locked, versionRangeFallback);
    }
}
/**
 * Queries version of the installed binary.
 *
 * @returns version of the installed binary or `undefined` if the binary was
 * not found or the version string could not be parsed
 */
async function rustbinVersion(fullPathToBinary, binaryVersionFlag = DEFAULT_BINARY_VERSION_FLAG, binaryVersionRx = utils_1.versionRx) {
    const { binVersion } = await (0, utils_1.getBinaryVersion)(fullPathToBinary, binaryVersionFlag, binaryVersionRx);
    return binVersion;
}
exports.rustbinVersion = rustbinVersion;
/**
 * Checks if the installed binary matches the installed library.
 *
 * @returns result of check including if the binary version satisfies the
 * library version range
 */
function rustbinCheck(config) {
    const rustbin = Rustbin.fromConfig(config);
    return rustbin.check();
}
exports.rustbinCheck = rustbinCheck;
/**
 * Checks if the installed binary matches the installed library.
 * If not it attempts to install the latest binary matching the library version
 * range via `cargo install`.
 *
 * @returns result including the `cmd` used to install the binary (if it was
 * necessary), the full path to said binary and the installed version of it
 */
async function rustbinMatch(config, confirmInstall = () => Promise.resolve(true)) {
    const rustbin = Rustbin.fromConfig(config);
    const { satisfies, libVersion, binVersion } = await rustbin.check();
    if (satisfies ||
        !(await confirmInstall({
            binaryName: rustbin.binaryName,
            libName: rustbin.libName,
            libVersion,
            binVersion,
            fullPathToBinary: rustbin.fullPathToBinary,
        }))) {
        return {
            libVersion,
            binVersion,
            fullPathToBinary: rustbin.fullPathToBinary,
        };
    }
    (0, utils_1.logInfo)(`Installing ${libVersion} compatible version of ${config.binaryName}`);
    const cmd = await rustbin.installMatchinBin(libVersion);
    const installedBinVersion = await rustbinVersion(rustbin.fullPathToBinary);
    return {
        cmd,
        libVersion,
        binVersion: installedBinVersion,
        fullPathToBinary: rustbin.fullPathToBinary,
    };
}
exports.rustbinMatch = rustbinMatch;
//# sourceMappingURL=rustbin.js.map