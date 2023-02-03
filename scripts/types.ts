import * as web3 from "@solana/web3.js";

export type Config = {
  network: string;
  endpoint: string;
};

export type ProgramName = "assembler" | "assetmanager" | "staking";

export type AssemblerProgramAction =
  | "create-assembler"
  | "update-assembler"
  | "create-block"
  | "create-block-definition"
  | "create-and-mint-nft"
  | "disband-nft";

export type AssetManagerProgramAction =
  | "create-asset-manager"
  | "create-asset"
  | "mint-asset";

export type StakingProgramAction =
  | "create-project"
  | "stake"
  | "unstake"
  | "fund-rewards"
  | "claim-rewards";

export type TxSigners = {
  tx: web3.Transaction;
  signers: web3.Keypair[];
};
