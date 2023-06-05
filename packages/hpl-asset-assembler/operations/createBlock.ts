import { Honeycomb, Operation, VAULT } from "@honeycomb-protocol/hive-control";
import * as web3 from "@solana/web3.js";
import {
  createCreateBlockInstruction,
  CreateBlockArgs as CreateBlockArgsChain,
  PROGRAM_ID,
} from "../generated";
import { getBlockPda } from "../pdas";

type CreateCreateBlockCtxArgs = {
  args: CreateBlockArgsChain;
  project: web3.PublicKey;
  assembler: web3.PublicKey;
  authority: web3.PublicKey;
  payer: web3.PublicKey;
  delegateAuthority?: web3.PublicKey;
  programId?: web3.PublicKey;
};
export function createCreateBlockCtx(
  honeycomb: Honeycomb,
  args: CreateCreateBlockCtxArgs,
  proofIndex: number
) {
  const programId = args.programId || PROGRAM_ID;

  const [block] = getBlockPda(args.assembler, args.args.blockOrder, programId);

  const instructions = [
    createCreateBlockInstruction(
      {
        assembler: args.assembler,
        block,
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
    ...new Operation(honeycomb, instructions).context,
    block,
  };
}

type CreateBlockArgs = {
  args: CreateBlockArgsChain;
  programId?: web3.PublicKey;
};
export async function createBlock(
  honeycomb: Honeycomb,
  args: CreateBlockArgs,
  proofIndex: number
) {
  const wallet = honeycomb.identity();
  const ctx = createCreateBlockCtx(
    honeycomb,
    {
      args: args.args,
      project: honeycomb.project().address,
      assembler: honeycomb.assembler().assemblerAddress,
      authority: wallet.address,
      payer: wallet.address,
      delegateAuthority: wallet.delegateAuthority().address,
      programId: args.programId,
    },
    proofIndex
  );

  return {
    block: ctx.block,
    response: await honeycomb
      .rpc()
      .sendAndConfirmTransaction(ctx, { skipPreflight: true }),
  };
}
