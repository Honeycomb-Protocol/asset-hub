import { Metaplex, FindNftsByOwnerOutput } from "@metaplex-foundation/js";
import web3 from "@solana/web3.js";
import { NFT, Project, Staker } from "../../generated/staking";
type FetchArgs = {
    connection: web3.Connection;
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig;
};
type FetchProjectArgs = FetchArgs & {
    address: web3.PublicKey;
};
export declare const fetchProject: (args: FetchProjectArgs) => Promise<Project>;
type FetchStakerArgs = FetchArgs & {
    projectAddress: web3.PublicKey;
    walletAddress: web3.PublicKey;
};
export declare const fetchStaker: (args: FetchStakerArgs) => Promise<Staker>;
type FetchStakedNftsArgs = FetchArgs & {
    projectAddress: web3.PublicKey;
    walletAddress?: web3.PublicKey;
};
export declare const fetchStakedNfts: (args: FetchStakedNftsArgs) => Promise<NFT[]>;
type FetchAvailableNfts = {
    metaplex: Metaplex;
    project: Project;
    walletAddress?: web3.PublicKey;
    allowedMints?: web3.PublicKey[];
};
export declare const fetchAvailableNfts: ({ metaplex: mx, ...args }: FetchAvailableNfts) => Promise<FindNftsByOwnerOutput>;
type FetchAllArgs = FetchStakerArgs;
export declare const fetchAll: ({ connection, projectAddress, walletAddress, }: FetchAllArgs) => Promise<{
    project: Project;
    staker: Staker;
    stakedNfts: NFT[];
}>;
export {};
