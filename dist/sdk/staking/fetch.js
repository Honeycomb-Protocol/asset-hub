"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAll = exports.fetchAvailableNfts = exports.fetchStakedNfts = exports.fetchStaker = exports.fetchProject = void 0;
const web3_js_1 = __importDefault(require("@solana/web3.js"));
const staking_1 = require("../../generated/staking");
const pdas_1 = require("../pdas");
const fetchProject = (args) => staking_1.Project.fromAccountAddress(args.connection, args.address, args.commitmentOrConfig);
exports.fetchProject = fetchProject;
const fetchStaker = (args) => {
    const [staker] = (0, pdas_1.getStakerPda)(args.projectAddress, args.walletAddress);
    return staking_1.Staker.fromAccountAddress(args.connection, staker, args.commitmentOrConfig);
};
exports.fetchStaker = fetchStaker;
const fetchStakedNfts = (args) => {
    const gpa = staking_1.NFT.gpaBuilder();
    gpa.addFilter("project", args.projectAddress);
    args.walletAddress && gpa.addFilter("staker", args.walletAddress);
    return gpa
        .run(args.connection)
        .then((nfts) => nfts.map(({ account }) => staking_1.NFT.fromAccountInfo(account)[0]));
};
exports.fetchStakedNfts = fetchStakedNfts;
const fetchAvailableNfts = async ({ metaplex: mx, ...args }) => {
    const ownedNfts = await mx.nfts().findAllByOwner({
        owner: args.walletAddress || mx.identity().publicKey,
    });
    let filteredNfts = [];
    if (args.project.allowedMints) {
        const [projectAddress] = (0, pdas_1.getStakingProjectPda)(args.project.key);
        const allowedMints = args.allowedMints ||
            (await staking_1.NFT.gpaBuilder()
                .addFilter("project", projectAddress)
                .addFilter("staker", web3_js_1.default.PublicKey.default)
                .run(mx.connection)
                .then((nfts) => nfts.map(({ account }) => staking_1.NFT.fromAccountInfo(account)[0].mint)));
        filteredNfts = [
            ...filteredNfts,
            ...ownedNfts.filter((nft) => allowedMints.includes(nft.mintAddress || nft.mint.address)),
        ];
    }
    if (args.project.collections.length) {
        filteredNfts = [
            ...filteredNfts,
            ...ownedNfts.filter((nft) => nft.collection.verified &&
                args.project.collections.includes(nft.collection.address)),
        ];
    }
    if (args.project.creators.length) {
        filteredNfts = [
            ...filteredNfts,
            ...ownedNfts.filter((nft) => nft.creators.some((creator) => creator.verified && args.project.creators.includes(creator.address))),
        ];
    }
    filteredNfts = filteredNfts.filter((nft, index, self) => self.findIndex((t) => t.address.equals(nft.address)) === index);
    return filteredNfts;
};
exports.fetchAvailableNfts = fetchAvailableNfts;
const fetchAll = async ({ connection, projectAddress, walletAddress, }) => {
    const project = await (0, exports.fetchProject)({ connection, address: projectAddress });
    return {
        project,
        staker: await (0, exports.fetchStaker)({ connection, projectAddress, walletAddress }),
        stakedNfts: await (0, exports.fetchStakedNfts)({
            connection,
            projectAddress,
            walletAddress,
        }),
    };
};
exports.fetchAll = fetchAll;
//# sourceMappingURL=fetch.js.map