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
exports.delegateAuthorityBeet = exports.DelegateAuthority = exports.delegateAuthorityDiscriminator = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
const DelegateAuthorityPermission_1 = require("../types/DelegateAuthorityPermission");
exports.delegateAuthorityDiscriminator = [
    121, 110, 250, 77, 147, 244, 126, 81,
];
class DelegateAuthority {
    constructor(bump, authority, permission) {
        this.bump = bump;
        this.authority = authority;
        this.permission = permission;
    }
    static fromArgs(args) {
        return new DelegateAuthority(args.bump, args.authority, args.permission);
    }
    static fromAccountInfo(accountInfo, offset = 0) {
        return DelegateAuthority.deserialize(accountInfo.data, offset);
    }
    static async fromAccountAddress(connection, address, commitmentOrConfig) {
        const accountInfo = await connection.getAccountInfo(address, commitmentOrConfig);
        if (accountInfo == null) {
            throw new Error(`Unable to find DelegateAuthority account at ${address}`);
        }
        return DelegateAuthority.fromAccountInfo(accountInfo, 0)[0];
    }
    static gpaBuilder(programId = new web3.PublicKey('4cEhZgkh41JbuXsXdcKhNaeHJ2BpzmXN3VpMQ3nFPDrp')) {
        return beetSolana.GpaBuilder.fromStruct(programId, exports.delegateAuthorityBeet);
    }
    static deserialize(buf, offset = 0) {
        return exports.delegateAuthorityBeet.deserialize(buf, offset);
    }
    serialize() {
        return exports.delegateAuthorityBeet.serialize({
            accountDiscriminator: exports.delegateAuthorityDiscriminator,
            ...this,
        });
    }
    static get byteSize() {
        return exports.delegateAuthorityBeet.byteSize;
    }
    static async getMinimumBalanceForRentExemption(connection, commitment) {
        return connection.getMinimumBalanceForRentExemption(DelegateAuthority.byteSize, commitment);
    }
    static hasCorrectByteSize(buf, offset = 0) {
        return buf.byteLength - offset === DelegateAuthority.byteSize;
    }
    pretty() {
        return {
            bump: this.bump,
            authority: this.authority.toBase58(),
            permission: 'DelegateAuthorityPermission.' +
                DelegateAuthorityPermission_1.DelegateAuthorityPermission[this.permission],
        };
    }
}
exports.DelegateAuthority = DelegateAuthority;
exports.delegateAuthorityBeet = new beet.BeetStruct([
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['authority', beetSolana.publicKey],
    ['permission', DelegateAuthorityPermission_1.delegateAuthorityPermissionBeet],
], DelegateAuthority.fromArgs, 'DelegateAuthority');
//# sourceMappingURL=DelegateAuthority.js.map