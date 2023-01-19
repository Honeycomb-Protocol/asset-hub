import * as web3 from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import key from "../key.json";
import fs from "fs";
import { PROGRAM_ADDRESS } from "../src";
import { Config } from "./types";

export const METADATA_PROGRAM_ID = new web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export const devnetConfig: Config = {
  network: "devnet",
  endpoint: "https://api.devnet.solana.com/",
  // endpoint: "https://metaplex.devnet.rpcpool.com/",
};

export const mainnetConfig: Config = {
  network: "mainnet-beta",
  endpoint: "https://api.metaplex.solana.com",
};

export const getDeployments = (
  program: string,
  network: "mainnet" | "devnet"
) => {
  let deployments = {};
  try {
    deployments = JSON.parse(fs.readFileSync("./deployments.json").toString());
  } catch (e) {}

  if (!Object.keys(deployments).includes(program))
    throw new Error(`Deployment for ${program} not found!`);

  if (!Object.keys(deployments[program]).includes(network))
    throw new Error(`Deployment for ${network} not found!`);

  return deployments[program][network];
};

export const setDeployments = (
  program: string,
  network: "mainnet" | "devnet",
  deployments: any
) => {
  let deploymentsMap = {};

  try {
    deploymentsMap = JSON.parse(
      fs.readFileSync("./deployments.json").toString()
    );
  } catch (e) {}

  if (!Object.keys(deploymentsMap).includes(program))
    deploymentsMap[program] = {};

  if (!Object.keys(deploymentsMap[program]).includes(program))
    deploymentsMap[program][network] = {};

  deploymentsMap[program][network] = deployments;

  fs.writeFileSync(
    "./deployments.json",
    JSON.stringify(deploymentsMap, null, 2)
  );
};

export const getDependencies = (
  network: "mainnet" | "devnet",
  programName: "assembler"
) => {
  const config = network === "mainnet" ? mainnetConfig : devnetConfig;

  const wallet = new anchor.Wallet(
    web3.Keypair.fromSecretKey(Uint8Array.from(key))
  );
  const connection = new web3.Connection(config.endpoint);

  const setDeploymentsLocal = (deployments) =>
    setDeployments(programName, network, deployments);

  let deployments: any = {
    program: PROGRAM_ADDRESS,
  };
  try {
    deployments = getDeployments(programName, network);
  } catch {
    setDeploymentsLocal(deployments);
  }

  return {
    config,
    wallet,
    connection,
    deployments,
    setDeployments: setDeploymentsLocal,
  };
};

export const sendAndConfirmTransaction = async (
  tx: web3.Transaction,
  connection: web3.Connection,
  wallet: anchor.Wallet,
  signers: web3.Signer[] = [],
  sendOpts: web3.SendOptions = {}
) => {
  const block = await connection.getLatestBlockhash();
  tx.recentBlockhash = block.blockhash;
  tx.feePayer = wallet.publicKey;
  signers.length && (await tx.partialSign(...signers));
  const signedTx = await wallet.signTransaction(tx);
  const txId = await connection.sendRawTransaction(signedTx.serialize(), {
    preflightCommitment: "processed",
    ...sendOpts,
  });
  await connection.confirmTransaction(
    {
      blockhash: block.blockhash,
      lastValidBlockHeight: block.lastValidBlockHeight,
      signature: txId,
    },
    "processed"
  );
  return txId;
};
