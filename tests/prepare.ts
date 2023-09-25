import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import * as web3 from "@solana/web3.js";
import { Honeycomb, identityModule } from "@honeycomb-protocol/hive-control";

dotenv.config();

export const getHoneycomb = async () => {
  const RPC_URL = process.env.SOLANA_RPC || "https://api.devnet.solana.com";
  const connection = new web3.Connection(RPC_URL, "processed");

  const adminHC = new Honeycomb(connection);
  const admin = web3.Keypair.fromSecretKey(
    Uint8Array.from(
      JSON.parse(
        fs.readFileSync(path.resolve(__dirname, "keys", "admin.json"), "utf8")
      )
    )
  );
  adminHC.use(identityModule(admin));

  const userHC = new Honeycomb(connection);
  const user = web3.Keypair.fromSecretKey(
    Uint8Array.from(
      JSON.parse(
        fs.readFileSync(path.resolve(__dirname, "keys", "user.json"), "utf8")
      )
    )
  );
  userHC.use(identityModule(user));

  return {
    adminHC,
    userHC,
  };
};

export function wait(seconds = 2): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}
