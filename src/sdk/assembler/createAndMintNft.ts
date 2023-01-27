import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import {
  createCreateNftInstruction,
  createAddBlockInstruction,
  createMintNftInstruction,
  Assembler,
  AssemblingAction,
} from "../../generated";
import { PROGRAM_ID } from "../../generated/assembler";
import { CreateAndMintNftArgs, TxSignersAccounts, Wallet } from "../../types";
import {
  confirmBulkTransactions,
  createLookupTable,
  devideAndSignV0Txns,
  getOrFetchLoockupTable,
  METADATA_PROGRAM_ID,
  sendBulkTransactions,
} from "../../utils";

export function createCreateNftTransaction(
  assembler: web3.PublicKey,
  collectionMint: web3.PublicKey,
  authority: web3.PublicKey,
  payer: web3.PublicKey,
  programId: web3.PublicKey = PROGRAM_ID
): TxSignersAccounts & {
  nft: web3.PublicKey;
  nftMint: web3.PublicKey;
} {
  const [collectionMetadataAccount] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      collectionMint.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );

  const [collectionMasterEdition] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      collectionMint.toBuffer(),
      Buffer.from("edition"),
    ],
    METADATA_PROGRAM_ID
  );

  const nftMint = web3.Keypair.generate();

  const [nftMetadata] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      nftMint.publicKey.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );

  const [nft] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("nft"), nftMint.publicKey.toBuffer()],
    programId
  );

  return {
    tx: new web3.Transaction().add(
      createCreateNftInstruction(
        {
          assembler,
          collectionMint,
          collectionMetadataAccount,
          collectionMasterEdition,
          nftMint: nftMint.publicKey,
          nftMetadata,
          nft,
          authority,
          payer,
          tokenMetadataProgram: METADATA_PROGRAM_ID,
        },
        programId
      )
    ),
    signers: [nftMint],
    accounts: [
      assembler,
      collectionMint,
      collectionMetadataAccount,
      collectionMasterEdition,
      nftMint.publicKey,
      nftMetadata,
      nft,
      authority,
      payer,
      METADATA_PROGRAM_ID,
    ],
    nft,
    nftMint: nftMint.publicKey,
  };
}

export function createAddBlockTransaction(
  assembler: web3.PublicKey,
  nft: web3.PublicKey,
  nftMint: web3.PublicKey,
  block: web3.PublicKey,
  blockDefinition: web3.PublicKey,
  tokenMint: web3.PublicKey,
  authority: web3.PublicKey,
  payer: web3.PublicKey,
  assemblingAction: AssemblingAction = AssemblingAction.Freeze,
  programId: web3.PublicKey = PROGRAM_ID
): TxSignersAccounts {
  const tokenAccount = splToken.getAssociatedTokenAddressSync(
    tokenMint,
    authority
  );

  const [tokenMetadata] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      tokenMint.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );

  const [tokenEdition] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      tokenMint.toBuffer(),
      Buffer.from("edition"),
    ],
    METADATA_PROGRAM_ID
  );

  const [nftAttribute] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("nft_attribute"), block.toBuffer(), nftMint.toBuffer()],
    programId
  );

  const [depositAccount] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("deposit"), tokenMint.toBuffer()],
    programId
  );

  return {
    tx: new web3.Transaction().add(
      createAddBlockInstruction(
        {
          assembler,
          nft,
          block,
          blockDefinition,
          tokenMint,
          tokenAccount,
          tokenMetadata,
          tokenEdition,
          depositAccount:
            assemblingAction === AssemblingAction.TakeCustody
              ? depositAccount
              : programId,
          nftAttribute,
          authority,
          payer,
          tokenMetadataProgram: METADATA_PROGRAM_ID,
        },
        programId
      )
    ),
    signers: [],
    accounts: [
      assembler,
      nft,
      block,
      blockDefinition,
      tokenMint,
      tokenAccount,
      tokenMetadata,
      tokenEdition,
      nftAttribute,
      authority,
      payer,
      METADATA_PROGRAM_ID,
    ],
  };
}

export function createMintNftTransaction(
  assembler: web3.PublicKey,
  nftMint: web3.PublicKey,
  authority: web3.PublicKey,
  payer: web3.PublicKey,
  programId: web3.PublicKey = PROGRAM_ID
): TxSignersAccounts {
  const [nft] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("nft"), nftMint.toBuffer()],
    programId
  );

  const tokenAccount = splToken.getAssociatedTokenAddressSync(
    nftMint,
    authority
  );

  return {
    tx: new web3.Transaction().add(
      splToken.createAssociatedTokenAccountInstruction(
        payer,
        tokenAccount,
        authority,
        nftMint
      ),

      createMintNftInstruction(
        {
          assembler,
          nft,
          nftMint,
          tokenAccount,
          authority,
          payer,
        },
        programId
      )
    ),
    signers: [],
    accounts: [assembler, nft, nftMint, tokenAccount, authority, payer],
  };
}

export async function buildCreateAndMintNftCtx({
  mx,
  assembler,
  blocks,
}: CreateAndMintNftArgs): Promise<{
  txns: TxSignersAccounts[];
  nft: web3.PublicKey;
  nftMint: web3.PublicKey;
}> {
  const wallet = mx.identity();
  const txns: TxSignersAccounts[] = [];
  const assemblerAccount = await Assembler.fromAccountAddress(
    mx.connection,
    assembler
  );

  const { nft, nftMint, ...nftCreateCtx } = createCreateNftTransaction(
    assembler,
    assemblerAccount.collection,
    wallet.publicKey,
    wallet.publicKey
  );
  txns.push(nftCreateCtx);

  blocks.forEach((block) => {
    txns.push(
      createAddBlockTransaction(
        assembler,
        nft,
        nftMint,
        block.block,
        block.blockDefinition,
        block.tokenMint,
        wallet.publicKey,
        wallet.publicKey,
        assemblerAccount.assemblingAction
      )
    );
  });

  txns.push(
    createMintNftTransaction(
      assembler,
      nftMint,
      wallet.publicKey,
      wallet.publicKey
    )
  );

  return {
    txns,
    nftMint: nftMint,
    nft: nft,
  };
}

export async function createAndMintNft({
  mx,
  assembler,
  blocks,
}: CreateAndMintNftArgs) {
  const { txns, nftMint, nft } = await buildCreateAndMintNftCtx({
    mx,
    assembler,
    blocks,
  });
  const wallet: Wallet = mx.identity() as any;
  let addressesDir: { [key: string]: web3.PublicKey } = {};

  txns
    // .concat(assemblerTxns)
    .forEach(({ accounts }, i) => {
      accounts.forEach((acc) => {
        addressesDir[acc.toString()] = acc;
      });
    });

  const addresses = Object.values(addressesDir);

  // alert("first");
  const lookupTableAddress = await createLookupTable(
    wallet,
    mx.connection,
    addresses
  );

  const lookupTable = await getOrFetchLoockupTable(
    mx.connection,
    lookupTableAddress
  );

  const mintNftTxns = await devideAndSignV0Txns(
    wallet,
    mx.connection,
    lookupTable,
    txns
  );

  console.log(mintNftTxns);

  if (!mintNftTxns) return;

  await wallet.signAllTransactions([...mintNftTxns]);

  const responses = await confirmBulkTransactions(
    mx.connection,
    await sendBulkTransactions(
      mx.connection,
      // signedTransactions.slice(purchaseTraitsTxns.length)
      mintNftTxns
    )
  );
  return {
    responses,
    nftMint,
    nft,
  };
}
