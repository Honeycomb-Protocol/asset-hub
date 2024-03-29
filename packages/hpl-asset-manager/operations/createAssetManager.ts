import * as web3 from "@solana/web3.js";
import { createCreateAssetManagerInstruction, PROGRAM_ID } from "../generated";
import { getAssetManagerPda } from "../pdas";
import {
  HPL_HIVE_CONTROL_PROGRAM,
  Honeycomb,
  Operation,
  VAULT,
} from "@honeycomb-protocol/hive-control";

type CreateCreateAssetManagerCtx = {
  serviceIndex: number;
  project: web3.PublicKey;
  authority: web3.PublicKey;
  payer: web3.PublicKey;
  delegateAuthority?: web3.PublicKey;
  programId?: web3.PublicKey;
};
export function createCreateAssetManagerCtx(
  honeycomb: Honeycomb,
  args: CreateCreateAssetManagerCtx
) {
  const programId = args.programId || PROGRAM_ID;

  const [assetManager] = getAssetManagerPda(
    args.project,
    args.serviceIndex,
    programId
  );

  const instructions = [
    createCreateAssetManagerInstruction(
      {
        assetManager,
        authority: args.authority,
        payer: args.payer,
        project: args.project,
        delegateAuthority: args.delegateAuthority || programId,
        vault: VAULT,
        hiveControl: HPL_HIVE_CONTROL_PROGRAM,
        rentSysvar: web3.SYSVAR_RENT_PUBKEY,
      },
      programId
    ),
  ];

  return {
    ...new Operation(honeycomb, instructions).context,
    assetManager,
  };
}

type CreataeAssetManagerArgs = {
  programId?: web3.PublicKey;
};
export async function createAssetManager(
  honeycomb: Honeycomb,
  args: CreataeAssetManagerArgs
) {
  const ctx = createCreateAssetManagerCtx(honeycomb, {
    project: honeycomb.project().address,
    serviceIndex: honeycomb.project().services.length,
    authority: honeycomb.identity().address,
    payer: honeycomb.identity().address,
    delegateAuthority: honeycomb.identity().delegateAuthority()?.address,
    programId: args.programId,
  });

  const response = await honeycomb
    .rpc()
    .sendAndConfirmTransaction(ctx, { skipPreflight: true });

  return {
    response,
    assetManagerAddress: ctx.assetManager,
  };
}
