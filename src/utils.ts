import * as web3 from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import {
  IdentityClient,
  IdentitySigner,
  Metaplex,
  Signer,
  isKeypairSigner,
} from "@metaplex-foundation/js";
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

export const createV0TxWithLUTDumb = ({
  lookupTable,
  ...msgArgs
}: {
  payerKey: web3.PublicKey;
  lookupTable: web3.AddressLookupTableAccount;
  instructions: web3.TransactionInstruction[];
  recentBlockhash: web3.Blockhash;
}) => {
  return new web3.VersionedTransaction(
    new web3.TransactionMessage(msgArgs).compileToV0Message([lookupTable])
  );
};
export const createV0TxWithLUT = async (
  connection: web3.Connection,
  payerKey: web3.PublicKey,
  lookupTableAddress: web3.PublicKey | web3.AddressLookupTableAccount,
  txInstructions: web3.TransactionInstruction[],
  latestBlockhash?: web3.BlockhashWithExpiryBlockHeight
) => {
  if (!latestBlockhash) latestBlockhash = await connection.getLatestBlockhash();

  const lookupTable = await getOrFetchLoockupTable(
    connection,
    lookupTableAddress
  );

  if (!lookupTable) throw new Error("Lookup table not found");
  return createV0TxWithLUTDumb({
    payerKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions: txInstructions,
    lookupTable,
  });
};
export const getOrFetchLoockupTable = async (
  connection: web3.Connection,
  lookupTableAddress: web3.PublicKey | web3.AddressLookupTableAccount
): Promise<web3.AddressLookupTableAccount | null> => {
  return "state" in lookupTableAddress
    ? lookupTableAddress
    : (
        await connection.getAddressLookupTable(lookupTableAddress, {
          commitment: "processed",
        })
      ).value;
};
export const devideAndSignTxns = async (
  wallet: Wallet,
  connection: web3.Connection,
  rawTxns: TxSignersAccounts[],
  mextByteSizeOfAGroup: number = 1232
) => {
  const publicKey = wallet.publicKey;
  if (!publicKey || !wallet.signAllTransactions) return;

  const instructionsGroups: {
    tx: web3.Transaction;
    instrunctions: web3.TransactionInstruction[];
    signers: web3.Signer[];
  }[] = [];
  const latestBlockhash = await connection.getLatestBlockhash();

  rawTxns.forEach((rawTx) => {
    const instructions = rawTx.tx.instructions;
    const tx = new web3.Transaction().add(
      ...(instructionsGroups[instructionsGroups.length - 1]?.instrunctions ||
        []),
      ...instructions
    );
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.feePayer = wallet.publicKey;
    // const tx = createV0TxWithLUTDumb({
    //   lookupTable,
    //   payerKey: publicKey,
    //   recentBlockhash: latestBlockhash.blockhash,
    // instructions: (
    //   instructionsGroups[instructionsGroups.length - 1]?.instrunctions || []
    // ).concat(instructions),
    // });
    let newTransactionSize = 0;
    try {
      newTransactionSize = tx.serialize().byteLength;
    } catch (e) {
      console.error(e);
      console.log("this transaction failed to serialize", tx);
    }
    if (
      !instructionsGroups.length ||
      newTransactionSize > mextByteSizeOfAGroup ||
      (!newTransactionSize && instructionsGroups.length)
    ) {
      instructionsGroups.push({
        tx,
        instrunctions: [...instructions],
        signers: [...rawTx.signers],
      });
    } else {
      instructionsGroups[instructionsGroups.length - 1].tx = tx;
      instructionsGroups[instructionsGroups.length - 1].instrunctions.push(
        ...instructions
      );
      instructionsGroups[instructionsGroups.length - 1].signers.push(
        ...rawTx.signers
      );
    }
  });
  // console.log(instructionsGroups.map(({ tx }) => tx.serialize().byteLength));
  // let txns = instructionsGroups.map(({ tx, signers }) => {
  //   tx.sign(signers);
  //   signers.forEach(signer => {
  //     signer.
  //   })
  //   return tx;
  // });
  // if (closeTableInTheEnd) {
  //   txns.push(
  //     createV0Tx(
  //       wallet.publicKey,
  //       latestBlockhash.blockhash,
  //       web3.AddressLookupTableProgram.closeLookupTable({
  //         authority: wallet.publicKey,
  //         lookupTable: lookupTable.key,
  //         recipient: wallet.publicKey,
  //       })
  //     )
  //   );
  // }
  // console.log(txns.map((tx) => tx.serialize().byteLength));
  return instructionsGroups;
};
export const devideAndSignV0Txns = async (
  wallet: Wallet,
  connection: web3.Connection,
  lookupTableAddress: web3.PublicKey | web3.AddressLookupTableAccount,
  rawTxns: TxSignersAccounts[],
  mextByteSizeOfAGroup: number = 1232
) => {
  const publicKey = wallet.publicKey;
  if (!publicKey || !wallet.signAllTransactions) return;

  const lookupTable = await getOrFetchLoockupTable(
    connection,
    lookupTableAddress
  );

  if (!lookupTable) throw new Error("Lookup table not found");

  const addressedInLoockupTables: { [k: string]: boolean } = {};
  lookupTable.state.addresses.forEach((add) => {
    addressedInLoockupTables[add.toString()] = true;
  });
  console.log("AddressCount", Object.keys(addressedInLoockupTables).length);
  const instructionsGroups: {
    tx: web3.VersionedTransaction;
    instrunctions: web3.TransactionInstruction[];
    signers: web3.Signer[];
  }[] = [];
  const latestBlockhash = await connection.getLatestBlockhash();

  rawTxns.forEach((rawTx) => {
    const instructions = rawTx.tx.instructions;
    const tx = createV0TxWithLUTDumb({
      lookupTable,
      payerKey: publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: (
        instructionsGroups[instructionsGroups.length - 1]?.instrunctions || []
      ).concat(instructions),
    });
    let newTransactionSize = 0;
    try {
      newTransactionSize = tx.serialize().byteLength;
    } catch (e) {
      console.error(e);
      console.log("this transaction failed to serialize", tx);
    }
    if (
      !instructionsGroups.length ||
      newTransactionSize > mextByteSizeOfAGroup ||
      (!newTransactionSize && instructionsGroups.length)
    ) {
      instructionsGroups.push({
        tx,
        instrunctions: [...instructions],
        signers: [...rawTx.signers],
      });
    } else {
      instructionsGroups[instructionsGroups.length - 1].tx = tx;
      instructionsGroups[instructionsGroups.length - 1].instrunctions.push(
        ...instructions
      );
      instructionsGroups[instructionsGroups.length - 1].signers.push(
        ...rawTx.signers
      );
    }
  });
  // console.log(instructionsGroups.map(({ tx }) => tx.serialize().byteLength));
  let txns = instructionsGroups.map(({ tx, signers }) => {
    tx.sign(signers);
    return tx;
  });

  // if (closeTableInTheEnd) {
  //   txns.push(
  //     createV0Tx(
  //       wallet.publicKey,
  //       latestBlockhash.blockhash,
  //       web3.AddressLookupTableProgram.closeLookupTable({
  //         authority: wallet.publicKey,
  //         lookupTable: lookupTable.key,
  //         recipient: wallet.publicKey,
  //       })
  //     )
  //   );
  // }
  // console.log(txns.map((tx) => tx.serialize().byteLength));
  return txns;
};
export const createLookupTable = async (
  wallet: Wallet | IdentityClient,
  connection: web3.Connection,
  addresses: web3.PublicKey[]
) => {
  if (!wallet.publicKey || !wallet.signAllTransactions) return;

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
  if (isKeypairSigner(wallet)) {
    // @ts-ignore
    creationTx.sign([wallet]);
    transactions.forEach((txn) => {
      // txn.tx.partialSign(signer);
      // @ts-ignore
      txn.sign([wallet]);
    });
  } else {
    // @ts-ignore
    [creationTx, ...transactions] = await wallet.signAllTransactions([
      // @ts-ignore
      creationTx,
      // @ts-ignore
      ...transactions,
    ]);
  }
  const createTxSignature = await connection.sendTransaction(creationTx, {
    skipPreflight: true,
  });

  const createTxConfirmation = await connection.confirmTransaction(
    createTxSignature,
    "confirmed"
  );

  if (createTxConfirmation.value.err) {
    throw new Error(
      "Lookup table creation error " + createTxConfirmation.value.err.toString()
    );
  }

  const extensionConfirmations = await confirmBulkTransactions(
    connection,
    await sendBulkTransactions(connection, transactions),
    "confirmed"
  );
  extensionConfirmations.forEach(({ value }) => {
    if (value.err) {
      throw new Error("Lookup table exntension error " + value.err.toString());
    }
  });
  return lookupTableAddress;
};

export const sendBulkTransactions = (
  connection: web3.Connection,
  transactions: (web3.VersionedTransaction | web3.Transaction)[]
) => {
  console.log(transactions.map((tx) => tx.serialize().byteLength));
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
export const sendBulkTransactionsLegacy = (
  mx: Metaplex,
  transactions: web3.Transaction[]
) => {
  return Promise.all(
    transactions.map((t) =>
      mx.rpc().sendTransaction(t, {
        skipPreflight: true,
      })
    )
  );
};
export const confirmBulkTransactions = (
  connection: web3.Connection,
  transactions: string[],
  commitment: web3.Commitment = "processed"
) => {
  return Promise.all(
    transactions.map((t) => connection.confirmTransaction(t, commitment))
  );
};
export const bulkLutTransactions = async (
  mx: Metaplex,
  txns: TxSignersAccounts[]
) => {
  const wallet: Wallet = mx.identity() as any;

  let addressesDir: { [key: string]: web3.PublicKey } = {};

  txns.forEach(({ accounts }) => {
    accounts.forEach((acc) => {
      addressesDir[acc.toString()] = acc;
    });
  });

  const addresses = Object.values(addressesDir);

  const lookupTableAddress = await createLookupTable(
    wallet,
    mx.connection,
    addresses
  );
  if (!lookupTableAddress) throw new Error("Lookup Table creation failed!");
  const lookupTable = await getOrFetchLoockupTable(
    mx.connection,
    lookupTableAddress
  );

  if (!lookupTable) throw new Error("Lookup Table validation failed!");

  const lutTxns = await devideAndSignV0Txns(
    wallet,
    mx.connection,
    lookupTable,
    txns
  );
  if (!lutTxns) throw new Error("DevideAndSignV0Txns creation failed!");

  console.log(lutTxns.map((tx) => tx.serialize().byteLength));

  return {
    txns: lutTxns,
    lookupTableAddress,
  };
};
