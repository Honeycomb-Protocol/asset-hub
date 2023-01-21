import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import {
  PROGRAM_ID,
  createBurnNftInstruction,
  createRemoveBlockInstruction,
  NFT,
  NFTAttribute,
  AssemblingAction,
  Assembler,
} from "../../src";
import { TxSigners } from "../types";
import { METADATA_PROGRAM_ID, sendAndConfirmTransaction } from "../utils";

export function createBurnNFTTransaction(
  assembler: web3.PublicKey,
  nft: web3.PublicKey,
  nftMint: web3.PublicKey,
  authority: web3.PublicKey,
  programId: web3.PublicKey = PROGRAM_ID
): TxSigners & {
  accounts: web3.PublicKey[];
} {
  const tokenAccount = splToken.getAssociatedTokenAddressSync(
    nftMint,
    authority
  );

  return {
    tx: new web3.Transaction().add(
      createBurnNftInstruction(
        {
          assembler,
          nft,
          nftMint,
          tokenAccount,
          authority,
        },
        programId
      )
    ),
    signers: [],
    accounts: [assembler, nft, nftMint, tokenAccount, authority],
  };
}

export function createRemoveBlockTransaction(
  assembler: web3.PublicKey,
  nft: web3.PublicKey,
  nftMint: web3.PublicKey,
  block: web3.PublicKey,
  blockDefinition: web3.PublicKey,
  tokenMint: web3.PublicKey,
  authority: web3.PublicKey,
  assemblingAction: AssemblingAction = AssemblingAction.Freeze,
  programId: web3.PublicKey = PROGRAM_ID
): TxSigners & { accounts: web3.PublicKey[] } {
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
      createRemoveBlockInstruction(
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
      nftAttribute,
      authority,
      METADATA_PROGRAM_ID,
    ],
  };
}

export default async function (
  connection: web3.Connection,
  wallet: anchor.Wallet,
  nftMint: web3.PublicKey
) {
  const [nft] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("nft"), nftMint.toBuffer()],
    PROGRAM_ID
  );

  const nftAccount = await NFT.fromAccountAddress(connection, nft);

  const assemblerAccount = await Assembler.fromAccountAddress(
    connection,
    nftAccount.assembler
  );

  //@ts-ignore
  const attributes: (NFTAttribute & { pubkey: web3.PublicKey })[] =
    await NFTAttribute.gpaBuilder()
      .addFilter("nft", nft)
      .run(connection)
      .then((x) =>
        x.map((y) => ({ ...y, ...NFTAttribute.fromAccountInfo(y.account)[0] }))
      );

  const nftBurnTx = createBurnNFTTransaction(
    nftAccount.assembler,
    nft,
    nftMint,
    wallet.publicKey
  );

  let signers = [...nftBurnTx.signers];
  let accounts = [...nftBurnTx.accounts];

  const tx = new web3.Transaction().add(
    nftBurnTx.tx,
    ...(await Promise.all(
      attributes.map(async (attribute) => {
        if (!attribute.mint) return null;
        const {
          tx,
          accounts: acc,
          signers: sigs,
        } = createRemoveBlockTransaction(
          nftAccount.assembler,
          nft,
          nftMint,
          attribute.block,
          attribute.blockDefinition,
          attribute.mint,
          wallet.publicKey,
          assemblerAccount.assemblingAction
        );
        signers = [...signers, ...sigs];
        accounts = [...accounts, ...acc];
        return tx;
      })
    ).then((x) => x.filter((x) => x !== null) as web3.Transaction[]))
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
  console.log("NFT Disbanded:", txId);
}
