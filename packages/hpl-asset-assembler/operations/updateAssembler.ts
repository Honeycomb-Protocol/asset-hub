import { Honeycomb, Operation, VAULT } from "@honeycomb-protocol/hive-control";
import * as web3 from "@solana/web3.js";
import {
  UpdateAssemblerArgs as UpdateAssemblerArgsChain,
  createUpdateAssemblerInstruction,
  PROGRAM_ID,
} from "../generated";

type CreateUpdateAssemblerCtxArgs = {
  args: UpdateAssemblerArgsChain;
  project: web3.PublicKey;
  assembler: web3.PublicKey;
  authority: web3.PublicKey;
  payer: web3.PublicKey;
  delegateAuthority?: web3.PublicKey;
  programId?: web3.PublicKey;
};
export function createUpdateAssemblerCtx(
  honeycomb: Honeycomb,
  args: CreateUpdateAssemblerCtxArgs,
  proofIndex
) {
  const programId = args.programId || PROGRAM_ID;

  const instructions = [
    createUpdateAssemblerInstruction(
      {
        project: args.project,
        assembler: args.assembler,
        authority: args.authority,
        payer: args.payer,
        delegateAuthority: args.delegateAuthority || programId,
        vault: VAULT,
      },
      { args: args.args, proofIndex },
      programId
    ),
  ];

  return new Operation(honeycomb, instructions).context;
}

type UpdateAssemblerArgs = {
  args: UpdateAssemblerArgsChain;
  programId?: web3.PublicKey;
};
export async function updateAssembler(
  honeycomb: Honeycomb,
  args: UpdateAssemblerArgs,
  proofIndex: number
) {
  const wallet = honeycomb.identity();
  const ctx = createUpdateAssemblerCtx(
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

  return await honeycomb
    .rpc()
    .sendAndConfirmTransaction(ctx, { skipPreflight: true });
}
