import { Metaplex, Nft, Sft, Metadata } from "@metaplex-foundation/js";
import * as web3 from "@solana/web3.js";
import { NFT } from "../generated/staking";

export type Wallet = {
  publicKey: web3.PublicKey;
  signAllTransactions: (
    txns: web3.VersionedTransaction[]
  ) => web3.VersionedTransaction[];
};

export type TxSignersAccounts = {
  tx: web3.Transaction;
  signers: web3.Signer[];
  accounts: web3.PublicKey[];
};

export type CreateAndMintNftArgs = {
  mx: Metaplex;
  assembler: web3.PublicKey;
  blocks: {
    block: web3.PublicKey;
    blockDefinition: web3.PublicKey;
    tokenMint: web3.PublicKey;
    order: number;
    blockDefinitionIndex: number;
  }[];
};

export type TokenAccountInfo = {
  tokenMint: web3.PublicKey;
  owner: string;
  state: "frozen" | string;
  tokenAmount: {
    amount: string;
    decimals: number;
    uiAmount: number;
    uiAmountString: string;
  };
};

export type MetaplexNftOut = Metadata | Nft | Sft;
export type StakedNft = MetaplexNftOut & NFT;
export type AvailableNft = MetaplexNftOut & TokenAccountInfo;

export * from "./AssemblerConfig";
