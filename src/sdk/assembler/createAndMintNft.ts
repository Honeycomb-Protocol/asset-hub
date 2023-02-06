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
  bulkLutTransactions,
  confirmBulkTransactions,
  sendBulkTransactions,
} from "../../utils";
import {
  getDepositPda,
  getMetadataAccount_,
  getNftPda,
  getUniqueConstraintPda,
  METADATA_PROGRAM_ID,
} from "../pdas";

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
  const nftMint = web3.Keypair.generate();

  const [collectionMetadataAccount] = getMetadataAccount_(collectionMint);
  const [collectionMasterEdition] = getMetadataAccount_(collectionMint, {
    __kind: "edition",
  });
  const [nftMetadata] = getMetadataAccount_(nftMint.publicKey);
  const [nft] = getNftPda(nftMint.publicKey);

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
  const [tokenMetadata] = getMetadataAccount_(tokenMint);
  const [tokenEdition] = getMetadataAccount_(tokenMint, {
    __kind: "edition",
  });
  const [tokenRecord] = getMetadataAccount_(tokenMint, {
    __kind: "token_record",
    tokenAccount,
  });
  const [depositAccount] = getDepositPda(tokenMint, nftMint);
  const [depositTokenRecord] = getMetadataAccount_(tokenMint, {
    __kind: "token_record",
    tokenAccount: depositAccount,
  });

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
          tokenRecord,
          depositAccount:
            assemblingAction === AssemblingAction.TakeCustody
              ? depositAccount
              : programId,
          depositTokenRecord,
          authority,
          payer,
          tokenMetadataProgram: METADATA_PROGRAM_ID,
          sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
          associatedTokenProgram: splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
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
      authority,
      payer,
      METADATA_PROGRAM_ID,
    ],
  };
}

export function createMintNftTransaction(
  assembler: web3.PublicKey,
  nftMint: web3.PublicKey,
  uniqueConstraint: web3.PublicKey | null,
  authority: web3.PublicKey,
  payer: web3.PublicKey,
  programId: web3.PublicKey = PROGRAM_ID
): TxSignersAccounts {
  const tokenAccount = splToken.getAssociatedTokenAddressSync(
    nftMint,
    authority
  );

  const [nft] = getNftPda(nftMint);
  const [nftMetadata] = getMetadataAccount_(nftMint);
  const [nftMasterEdition] = getMetadataAccount_(nftMint, {
    __kind: "edition",
  });

  console.log("uniqueConstraint", uniqueConstraint?.toString());

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
          nftMetadata,
          nftMasterEdition,
          tokenAccount,
          uniqueConstraint: uniqueConstraint || programId,
          authority,
          payer,
          tokenMetadataProgram: METADATA_PROGRAM_ID,
        },
        programId
      )
    ),
    signers: [],
    accounts: [assembler, nft, nftMint, tokenAccount, authority, payer].concat(
      uniqueConstraint ? [uniqueConstraint] : []
    ),
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

  const uniqueConstraintSeeds: Buffer[] = [];

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
  let uniqueConstraint: web3.PublicKey | null = null;

  if (!assemblerAccount.allowDuplicates) {
    uniqueConstraint = getUniqueConstraintPda(blocks, assembler)[0];
  }

  txns.push(
    createMintNftTransaction(
      assembler,
      nftMint,
      uniqueConstraint,
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
  const { txns: mintNftTxns, lookupTableAddress } = await bulkLutTransactions(
    mx,
    txns
  );

  if (!mintNftTxns) return;
  // console.log(mintNftTxns);

  mintNftTxns.forEach((txn) => {
    // txn.tx.partialSign(signer);
    txn.sign([wallet as any]);
  });

  const responses = await confirmBulkTransactions(
    mx.connection,
    await sendBulkTransactions(
      new web3.Connection(
        "https://lingering-newest-sheet.solana-devnet.quiknode.pro/fb6e6465df3955a06fd5ddec2e5b003896f56adb/",
        "processed"
      ),
      // signedTransactions.slice(purchaseTraitsTxns.length)
      mintNftTxns
    )
  );

  // let error = null;
  responses.forEach((element) => {
    if (element.value?.err) {
      console.error(element.value?.err);
      throw element.value?.err;
    }
  });

  return {
    responses,
    nftMint,
    nft,
  };
}
