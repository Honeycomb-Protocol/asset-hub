import path from "path";
import fs from "fs";
import * as web3 from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { IdentitySigner, Signer } from "@metaplex-foundation/js";
import { AssemblerConfig } from "./types";

export const METADATA_PROGRAM_ID = new web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export const readConfigFile = (configFile: string): AssemblerConfig => {
  const configPath = path.join(process.cwd(), configFile);
  return JSON.parse(fs.readFileSync(configPath).toString());
};

export const saveConfigFile = (
  configFile: AssemblerConfig,
  configFileName: string
): void => {
  const configPath = path.join(process.cwd(), configFileName);
  fs.writeFileSync(configPath, JSON.stringify(configFile, null, 2));
};

export const sendAndConfirmTransaction = async (
  tx: web3.Transaction,
  connection: web3.Connection,
  wallet: anchor.Wallet,
  signers: Signer[] = [],
  sendOpts: web3.SendOptions = {}
) => {
  const block = await connection.getLatestBlockhash();
  tx.recentBlockhash = block.blockhash;
  tx.feePayer = wallet.publicKey;

  let adapterSigners: { [key: string]: IdentitySigner } = {};
  signers.length &&
    signers.forEach((s) => {
      if ("signTransaction" in s) adapterSigners[s.publicKey.toString()] = s;
      else if ("secretKey" in s) tx.partialSign(s);
      // @ts-ignore
      else if ("_signer" in s) tx.partialSign(s._signer);
    });

  let signedTx = await wallet.signTransaction(tx);
  for (let signer in adapterSigners) {
    signedTx = await adapterSigners[signer].signTransaction(signedTx);
  }

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

export const createV0Tx = (
  payerKey: web3.PublicKey,
  latestBlockhash: string,
  ...txInstructions: web3.TransactionInstruction[]
) => {
  return new web3.VersionedTransaction(
    new web3.TransactionMessage({
      payerKey,
      recentBlockhash: latestBlockhash,
      instructions: txInstructions,
    }).compileToV0Message()
  );
};

export const createV0TxWithLUT = async (
  connection: web3.Connection,
  payerKey: web3.PublicKey,
  lookupTableAddress: web3.PublicKey,
  ...txInstructions: web3.TransactionInstruction[]
) => {
  const latestBlockhash = await connection.getLatestBlockhash();

  const lookupTable = (
    await connection.getAddressLookupTable(lookupTableAddress)
  ).value;
  if (!lookupTable) throw new Error("Lookup table not found");

  return await new web3.VersionedTransaction(
    new web3.TransactionMessage({
      payerKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: txInstructions,
    }).compileToV0Message([lookupTable])
  );
};

export const createLookupTable = async (
  connection: web3.Connection,
  wallet: anchor.Wallet,
  ...addresses: web3.PublicKey[]
) => {
  const [lookupTableIx, lookupTableAddress] =
    web3.AddressLookupTableProgram.createLookupTable({
      authority: wallet.publicKey,
      payer: wallet.publicKey,
      recentSlot: await connection.getSlot(),
    });
  const txn = await createV0Tx(
    wallet.publicKey,
    (
      await connection.getLatestBlockhash()
    ).blockhash,
    lookupTableIx
  );
  txn.sign([wallet.payer]);

  const txId = await connection.sendTransaction(txn, {
    skipPreflight: true,
  });
  console.log(txId);

  const createTxConfirmation = await connection.confirmTransaction(
    txId,
    "finalized"
  );

  if (createTxConfirmation.value.err) {
    throw new Error(
      "Lookup table creation error " + createTxConfirmation.value.err.toString()
    );
  }

  const transactions: web3.VersionedTransaction[] = [];
  const latestBlockhash = await connection.getLatestBlockhash();

  const batchSize = 20;
  for (let i = 0; i < addresses.length; i += batchSize) {
    transactions.push(
      createV0Tx(
        wallet.publicKey,
        latestBlockhash.blockhash,
        web3.AddressLookupTableProgram.extendLookupTable({
          payer: wallet.publicKey,
          authority: wallet.publicKey,
          lookupTable: lookupTableAddress,
          addresses: addresses.slice(i, i + batchSize),
        })
      )
    );
    // console.log(addresses.slice(i, i + batchSize).length, addresses.length)
  }
  // wallet.signTransaction
  // const signedTransactions = await wallet.signAllTransactions(transactions);
  transactions.map((tx) => tx.sign([wallet.payer]));
  // const signedTransactions = transactions;
  // console.log(transactions.length)
  // const tx0Id = await connection.sendTransaction(
  //   transactions[0],
  //   {
  //     skipPreflight: true,
  //   }
  // );
  // console.log(tx0Id)

  // const createTx0Confirmation = await connection.confirmTransaction(
  //   tx0Id,
  //   "finalized"
  // );

  // if (createTx0Confirmation.value.err) {
  //   throw new Error(
  //     "Lookup table creation error " +
  //     createTx0Confirmation.value.err.toString()
  //   );
  // }

  const sigs = await Promise.all(
    transactions.map((t) =>
      connection.sendTransaction(t, {
        skipPreflight: true,
      })
    )
  );

  return lookupTableAddress;
};

export const sendAndConfirmV0Transaction = async (
  tx: web3.VersionedTransaction,
  connection: web3.Connection,
  wallet: anchor.Wallet,
  signers: Signer[] = [],
  sendOpts: web3.SendOptions = {}
) => {
  let adapterSigners: { [key: string]: IdentitySigner } = {};
  signers.length &&
    signers.forEach((s) => {
      if ("signTransaction" in s) adapterSigners[s.publicKey.toString()] = s;
      else if ("secretKey" in s) tx.sign([s]);
      // @ts-ignore
      else if ("_signer" in s) tx.sign([s._signer]);
    });
  tx.sign([wallet.payer]);
  let signedTx = tx;

  const txId = await connection.sendRawTransaction(signedTx.serialize(), {
    preflightCommitment: "processed",
    ...sendOpts,
  });
  await connection.confirmTransaction(txId);
  return txId;
};
