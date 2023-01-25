import * as web3 from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { IdentitySigner, Metaplex, Signer } from "@metaplex-foundation/js";

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
  mx: Metaplex,
  lookupTableAddress: web3.PublicKey,
  ...txInstructions: web3.TransactionInstruction[]
) => {
  const latestBlockhash = await mx.connection.getLatestBlockhash();

  const lookupTable = (
    await mx.connection.getAddressLookupTable(lookupTableAddress)
  ).value;
  if (!lookupTable) throw new Error("Lookup table not found");

  return await new web3.VersionedTransaction(
    new web3.TransactionMessage({
      payerKey: mx.identity().publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: txInstructions,
    }).compileToV0Message([lookupTable])
  );
};

export const createLookupTable = async (
  mx: Metaplex,
  addresses: web3.PublicKey[]
) => {
  const wallet = mx.identity();
  const [lookupTableIx, lookupTableAddress] =
    web3.AddressLookupTableProgram.createLookupTable({
      authority: wallet.publicKey,
      payer: wallet.publicKey,
      recentSlot: await mx.connection.getSlot(),
    });
  const latestBlockhash = await mx.connection.getLatestBlockhash();
  let creationTx = createV0Tx(
    wallet.publicKey,
    latestBlockhash.blockhash,
    lookupTableIx
  ) as any as web3.Transaction;
  creationTx = await wallet.signTransaction(creationTx);
  const createTxConfirmation = await mx
    .rpc()
    .sendAndConfirmTransaction(creationTx, {
      skipPreflight: true,
      commitment: "processed",
    });

  if (createTxConfirmation.confirmResponse.value.err) {
    throw new Error(
      "Lookup table creation error " +
        createTxConfirmation.confirmResponse.value.err.toString()
    );
  }

  const transactions: web3.Transaction[] = [];
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
      ) as any as web3.Transaction
    );
  }

  const signedTransactions = await wallet.signAllTransactions(transactions);
  await Promise.all(
    signedTransactions.map(async (t) =>
      mx.rpc().sendTransaction(t, {
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
    // preflightCommitment: "processed",
    skipPreflight: true,
    ...sendOpts,
  });
  await connection.confirmTransaction(txId);
  return txId;
};
