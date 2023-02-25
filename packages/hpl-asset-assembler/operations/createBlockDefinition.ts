import {
  createCtx,
  Honeycomb,
  OperationCtx,
  VAULT,
} from "@honeycomb-protocol/hive-control";
import { PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js";
import {
  createCreateBlockDefinitionInstruction,
  BlockDefinitionValue,
} from "../generated";
import { getBlockDefinitionPda } from "../pdas";

type CreateCreateBlockDefinitionCtxArgs = {
  args: BlockDefinitionValue;
  project: web3.PublicKey;
  assembler: web3.PublicKey;
  block: web3.PublicKey;
  blockDefinitionMint: web3.PublicKey;
  authority: web3.PublicKey;
  payer: web3.PublicKey;
  delegateAuthority?: web3.PublicKey;
  programId?: web3.PublicKey;
};
export function createCreateBlockDefinitionCtx(
  args: CreateCreateBlockDefinitionCtxArgs,
  proofIndex: number
): OperationCtx & { blockDefinition: web3.PublicKey } {
  const programId = args.programId || PROGRAM_ID;
  const [blockDefinition] = getBlockDefinitionPda(
    args.block,
    args.blockDefinitionMint,
    programId
  );

  const instructions = [
    createCreateBlockDefinitionInstruction(
      {
        assembler: args.assembler,
        block: args.block,
        blockDefinition,
        blockDefinitionMint: args.blockDefinitionMint,
        authority: args.authority,
        payer: args.payer,
        project: args.project,
        delegateAuthority: args.delegateAuthority || programId,
        vault: VAULT,
      },
      { args: args.args, proofIndex },
      programId
    ),
  ];

  return {
    ...createCtx(instructions),
    blockDefinition,
  };
}

type CreateBlockDefinitionArgs = {
  args: BlockDefinitionValue;
  block: web3.PublicKey;
  blockDefinitionMint: web3.PublicKey;
  programId?: web3.PublicKey;
};
export async function createBlockDefinition(
  honeycomb: Honeycomb,
  args: CreateBlockDefinitionArgs,
  proofIndex: number
) {
  const wallet = honeycomb.identity();
  const ctx = createCreateBlockDefinitionCtx(
    {
      args: args.args,
      project: honeycomb.projectAddress,
      assembler: honeycomb.assembler().assemblerAddress,
      block: args.block,
      blockDefinitionMint: args.blockDefinitionMint,
      authority: wallet.publicKey,
      payer: wallet.publicKey,
      delegateAuthority: wallet.getDelegateAuthority().delegateAuthorityAddress,
      programId: args.programId,
    },
    proofIndex
  );

  return {
    blockDefinition: ctx.blockDefinition,
    response: await honeycomb
      .rpc()
      .sendAndConfirmTransaction(ctx, { skipPreflight: true }),
  };
}
