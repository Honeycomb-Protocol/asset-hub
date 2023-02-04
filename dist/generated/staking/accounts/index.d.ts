export * from './Multipliers';
export * from './NFT';
export * from './Project';
export * from './Staker';
import { Multipliers } from './Multipliers';
import { NFT } from './NFT';
import { Project } from './Project';
import { Staker } from './Staker';
export declare const accountProviders: {
    Multipliers: typeof Multipliers;
    NFT: typeof NFT;
    Project: typeof Project;
    Staker: typeof Staker;
};
