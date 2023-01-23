import * as web3 from "@solana/web3.js";

export type TxSignersAccounts = {
  tx: web3.Transaction;
  signers: web3.Keypair[];
  accounts: web3.PublicKey[];
};
