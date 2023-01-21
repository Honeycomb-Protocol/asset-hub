import * as web3 from "@solana/web3.js";

export type Config = {
  network: string;
  endpoint: string;
};

export type ProgramName = "assembler";

export type AssemblerProgramAction =
  | "create-assembler"
  | "create-block"
  | "create-block-definition"
  | "create-and-mint-nft"
  | "disband-nft";
export type Actions = AssemblerProgramAction;

export type TxSigners = {
  tx: web3.Transaction;
  signers: web3.Keypair[];
};
