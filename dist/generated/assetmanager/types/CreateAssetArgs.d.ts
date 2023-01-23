import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
export type CreateAssetArgs = {
    candyGuard: beet.COption<web3.PublicKey>;
    name: string;
    symbol: string;
    uri: string;
};
export declare const createAssetArgsBeet: beet.FixableBeetArgsStruct<CreateAssetArgs>;
