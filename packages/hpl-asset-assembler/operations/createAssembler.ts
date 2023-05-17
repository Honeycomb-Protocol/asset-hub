import * as web3 from "@solana/web3.js";
import {
  PROGRAM_ID,
  CreateAssemblerArgs as CreateAssemblerArgsChain,
  createCreateAssemblerInstruction,
} from "../generated";
import {
  getAssemblerPda,
  getMetadataAccount_,
  METADATA_PROGRAM_ID,
} from "../pdas";
import {
  createCtx,
  HIVECONTROL_PROGRAM_ID,
  Honeycomb,
  OperationCtx,
  VAULT,
} from "@honeycomb-protocol/hive-control";

type CreateCreateAssemblerCtxArgs = {
  args: CreateAssemblerArgsChain;
  project: web3.PublicKey;
  authority: web3.PublicKey;
  payer: web3.PublicKey;
  delegateAuthority?: web3.PublicKey;
  programId?: web3.PublicKey;
};
export function createCreateAssemblerCtx(
  args: CreateCreateAssemblerCtxArgs
): OperationCtx & { assembler: web3.PublicKey } {
  const programId = args.programId || PROGRAM_ID;

  const collectionMint = web3.Keypair.generate();
  const [collectionMetadata] = getMetadataAccount_(collectionMint.publicKey);
  const [collectionMasterEdition] = getMetadataAccount_(
    collectionMint.publicKey,
    { __kind: "edition" }
  );
  const [assembler] = getAssemblerPda(collectionMint.publicKey, programId);

  const instructions: web3.TransactionInstruction[] = [
    createCreateAssemblerInstruction(
      {
        collectionMint: collectionMint.publicKey,
        collectionMetadata,
        collectionMasterEdition,
        assembler,
        authority: args.authority,
        payer: args.payer,
        sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        tokenMetadataProgram: METADATA_PROGRAM_ID,
        project: args.project,
        delegateAuthority: args.delegateAuthority || programId,
        vault: VAULT,
        hiveControl: HIVECONTROL_PROGRAM_ID,
      },
      { args: args.args },
      programId
    ),
  ];

  return {
    ...createCtx(instructions, [collectionMint]),
    assembler,
  };
}

type CreateAssemblerArgs = {
  args: CreateAssemblerArgsChain;
  programId?: web3.PublicKey;
};
export async function createAssembler(
  honeycomb: Honeycomb,
  args: CreateAssemblerArgs
) {
  const wallet = honeycomb.identity();
  const ctx = createCreateAssemblerCtx({
    args: args.args,
    project: honeycomb.project().address,
    authority: wallet.publicKey,
    payer: wallet.publicKey,
    delegateAuthority: wallet.delegateAuthority().address,
    programId: args.programId,
  });

  return {
    assemblerAddress: ctx.assembler,
    response: await honeycomb
      .rpc()
      .sendAndConfirmTransaction(ctx, { skipPreflight: true }),
  };
}
