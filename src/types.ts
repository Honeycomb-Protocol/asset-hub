import * as web3 from "@solana/web3.js";

export type TxSigners = {
  tx: web3.Transaction;
  signers: web3.Keypair[];
};
