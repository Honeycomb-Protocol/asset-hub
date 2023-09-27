import {
  Honeycomb,
  Operation,
  VAULT,
  HPL_HIVE_CONTROL_PROGRAM,
} from "@honeycomb-protocol/hive-control";
import * as web3 from "@solana/web3.js";
import {
  PROGRAM_ID,
  SetNFTGeneratedArgs as SetNFTGeneratedArgsChain,
  createSetNftGeneratedInstruction,
} from "../generated";
import { getMetadataAccount_, getNftPda } from "../pdas";

type CreateSetNftGeneratedCtxArgs = {
  args: SetNFTGeneratedArgsChain;
  project: web3.PublicKey;
  assembler: web3.PublicKey;
  nftMint: web3.PublicKey;
  authority: web3.PublicKey;
  payer: web3.PublicKey;
  delegateAuthority?: web3.PublicKey;
  programId?: web3.PublicKey;
};
export function createSetNftGeneratedCtx(
  honeycomb: Honeycomb,
  args: CreateSetNftGeneratedCtxArgs,
  proofIndex: number
) {
  const programId = args.programId || PROGRAM_ID;
  const [nft] = getNftPda(args.nftMint, programId);
  const [nftMetadata] = getMetadataAccount_(args.nftMint);
  const [nftMasterEdition] = getMetadataAccount_(args.nftMint, {
    __kind: "edition",
  });

  const instructions = [
    createSetNftGeneratedInstruction(
      {
        project: args.project,
        assembler: args.assembler,
        nft,
        nftMint: args.nftMint,
        nftMetadata,
        nftMasterEdition,
        authority: args.authority,
        payer: args.payer,
        delegateAuthority: args.delegateAuthority || programId,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        vault: VAULT,
      },
      {
        args: args.args,
        proofIndex,
      },
      programId
    ),
  ];

  return new Operation(honeycomb, instructions).context;
}

type SetNFTGeneratedArgs = {
  args: SetNFTGeneratedArgsChain;
  nftMint: web3.PublicKey;
  programId?: web3.PublicKey;
};
export async function setNftGenerated(
  honeycomb: Honeycomb,
  args: SetNFTGeneratedArgs,
  proofIndex: number
) {
  const ctx = await createSetNftGeneratedCtx(
    honeycomb,
    {
      args: args.args,
      project: honeycomb.project().address,
      assembler: honeycomb.assembler().assemblerAddress,
      nftMint: args.nftMint,
      authority: honeycomb.identity().address,
      payer: honeycomb.identity().address,
      delegateAuthority: honeycomb.identity().delegateAuthority()?.address,
      programId: args.programId,
    },
    proofIndex
  );

  return honeycomb
    .rpc()
    .sendAndConfirmTransaction(ctx, { skipPreflight: true });
}
