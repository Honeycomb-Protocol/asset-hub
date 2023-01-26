import * as web3 from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { IdentitySigner, Metaplex, Signer } from "@metaplex-foundation/js";
import { TxSignersAccounts, Wallet } from "./types";

export const METADATA_PROGRAM_ID = new web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
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
  txInstructions: web3.TransactionInstruction[]
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
  wallet: Wallet,
  connection: web3.Connection,
  addresses: web3.PublicKey[]
) => {
  if (!wallet.publicKey || !wallet.signAllTransactions) return;
  console.log(wallet.publicKey.toString());
  const [lookupTableIx, lookupTableAddress] =
    web3.AddressLookupTableProgram.createLookupTable({
      authority: wallet.publicKey,
      payer: wallet.publicKey,
      recentSlot: await connection.getSlot(),
    });
  const latestBlockhash = await connection.getLatestBlockhash();
  let creationTx = createV0Tx(
    wallet.publicKey,
    latestBlockhash.blockhash,
    lookupTableIx
  );

  let transactions: web3.VersionedTransaction[] = [];
  const batchSize = 30;
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
  }

  [creationTx, ...transactions] = await wallet.signAllTransactions([
    creationTx,
    ...transactions,
  ]);

  const createTxSignature = await connection.sendTransaction(creationTx, {
    skipPreflight: true,
  });

  const createTxConfirmation = await connection.confirmTransaction(
    createTxSignature,
    "processed"
  );

  if (createTxConfirmation.value.err) {
    throw new Error(
      "Lookup table creation error " + createTxConfirmation.value.err.toString()
    );
  }

  await sendBulkTransactions(connection, transactions);

  return lookupTableAddress;
};

export const devideAndSignV0Txns = async (
  wallet: Wallet,
  connection: web3.Connection,
  lookupTable: web3.PublicKey,
  rawTxns: TxSignersAccounts[],
  mextByteSizeOfAGroup: number = 1600
) => {
  const publicKey = wallet.publicKey;
  if (!publicKey || !wallet.signAllTransactions) return;
  let sizeOfCurrentGroup = 0;
  const instructionsGroups: {
    instrunctions: web3.TransactionInstruction[];
    signers: web3.Signer[];
  }[] = [
    {
      instrunctions: [],
      signers: [],
    },
  ];
  rawTxns.forEach((tx) => {
    const instructions = tx.tx.instructions;
    const transactionSize = instructions.reduce(
      (acc, instruction) =>
        acc +
        Buffer.byteLength(instruction.data) +
        32 +
        instruction.keys.length * 20,
      0
    );
    if (sizeOfCurrentGroup + transactionSize > mextByteSizeOfAGroup) {
      instructionsGroups.push({
        instrunctions: [],
        signers: [],
      });
      sizeOfCurrentGroup = 0;
    }
    sizeOfCurrentGroup += transactionSize;
    instructionsGroups[instructionsGroups.length - 1].instrunctions.push(
      ...instructions
    );
    instructionsGroups[instructionsGroups.length - 1].signers.push(
      ...tx.signers
    );
  });

  let groups = await Promise.all(
    instructionsGroups.map(async (group) => ({
      ...group,
      tx: await createV0TxWithLUT(
        connection,
        publicKey,
        lookupTable,
        group.instrunctions
      ),
    }))
  );
  let txns = groups.map(({ tx, signers }) => {
    tx.sign(signers);
    return tx;
  });
  txns = await wallet.signAllTransactions(txns);
  return txns;
};
export const sendBulkTransactions = (
  connection: web3.Connection,
  transactions: web3.VersionedTransaction[]
) => {
  return Promise.all(
    transactions.map((t) =>
      connection.sendTransaction(
        // @ts-ignore
        t,
        {
          skipPreflight: true,
        },
        {
          skipPreflight: true,
        }
      )
    )
  );
};
export const confirmBulkTransactions = (
  connection: web3.Connection,
  transactions: string[]
) => {
  return Promise.all(
    transactions.map((t) => connection.confirmTransaction(t, "processed"))
  );
};
