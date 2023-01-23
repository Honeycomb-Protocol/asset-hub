import * as anchor from "@project-serum/anchor";
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
import { TxSignersAccounts } from "../../types";
import { METADATA_PROGRAM_ID, sendAndConfirmTransaction } from "../../utils";

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

export async function createAndMintNft(
  connection: web3.Connection,
  wallet: anchor.Wallet,
  assembler: web3.PublicKey,
  blocks: {
    block: web3.PublicKey;
    blockDefinition: web3.PublicKey;
    tokenMint: web3.PublicKey;
  }[]
) {
  const assemblerAccount = await Assembler.fromAccountAddress(
    connection,
    assembler
  );

  const nftCreateTx = createCreateNftTransaction(
    assembler,
    assemblerAccount.collection,
    wallet.publicKey,
    wallet.publicKey
  );

  const mintNftTx = createMintNftTransaction(
    assembler,
    nftCreateTx.nftMint,
    wallet.publicKey,
    wallet.publicKey
  );

  let signers = [...nftCreateTx.signers, ...mintNftTx.signers];
  let accounts = [...nftCreateTx.accounts, ...mintNftTx.accounts];

  const tx = new web3.Transaction().add(
    nftCreateTx.tx,
    ...(await Promise.all(
      blocks.map(async (blockT) => {
        const {
          tx,
          accounts: acc,
          signers: sigs,
        } = createAddBlockTransaction(
          assembler,
          nftCreateTx.nft,
          nftCreateTx.nftMint,
          blockT.block,
          blockT.blockDefinition,
          blockT.tokenMint,
          wallet.publicKey,
          wallet.publicKey,
          assemblerAccount.assemblingAction
        );
        signers = [...signers, ...sigs];
        accounts = [...accounts, ...acc];
        return tx;
      })
    )),
    mintNftTx.tx
  );

  accounts = accounts.filter(
    (x, index, self) => index === self.findIndex((y) => x.equals(y))
  );
  const txId = await sendAndConfirmTransaction(
    tx,
    connection,
    wallet,
    signers,
    { skipPreflight: true }
  );

  return {
    txId,
    mint: nftCreateTx.nftMint,
  };
}
