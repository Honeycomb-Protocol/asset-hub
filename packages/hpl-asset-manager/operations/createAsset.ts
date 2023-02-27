import * as web3 from "@solana/web3.js";
import {
  CreateAssetArgs as CreateAssetArgsChain,
  createCreateAssetInstruction,
  PROGRAM_ID,
} from "../generated";
import {
  CreateCandyGuardBuilderContext,
  TransactionBuilder,
} from "@metaplex-foundation/js";
import { getAssetPda, getMetadataAccount_, METADATA_PROGRAM_ID } from "../pdas";
import {
  createCtx,
  Honeycomb,
  OperationCtx,
  VAULT,
} from "@honeycomb-protocol/hive-control";

type CreateCreateAssetCtx = {
  args: CreateAssetArgsChain;
  project: web3.PublicKey;
  assetManager: web3.PublicKey;
  authority: web3.PublicKey;
  payer: web3.PublicKey;
  delegateAuthority?: web3.PublicKey;
  programId?: web3.PublicKey;
};
export function createCreateAssetCtx(
  args: CreateCreateAssetCtx,
  proofIndex: number
): OperationCtx & { mint: web3.PublicKey; asset: web3.PublicKey } {
  const programId = args.programId || PROGRAM_ID;
  const mintKeypair = web3.Keypair.generate();

  const [metadata] = getMetadataAccount_(mintKeypair.publicKey);
  const [edition] = getMetadataAccount_(mintKeypair.publicKey, {
    __kind: "edition",
  });
  const [asset] = getAssetPda(mintKeypair.publicKey);

  const instructions = [
    createCreateAssetInstruction(
      {
        project: args.project,
        assetManager: args.assetManager,
        mint: mintKeypair.publicKey,
        metadata,
        edition,
        asset,
        authority: args.authority,
        payer: args.payer,
        delegateAuthority: args.delegateAuthority || programId,
        vault: VAULT,
        rentSysvar: web3.SYSVAR_RENT_PUBKEY,
        sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        tokenMetadataProgram: METADATA_PROGRAM_ID,
      },
      { args: args.args, proofIndex },
      programId
    ),
  ];

  return {
    ...createCtx(instructions, [mintKeypair]),
    mint: mintKeypair.publicKey,
    asset,
  };
}

type CreataeAssetArgs = {
  args: CreateAssetArgsChain;
  candyGuardBuilder?: TransactionBuilder<CreateCandyGuardBuilderContext>;
  programId?: web3.PublicKey;
};
export async function createAsset(
  honeycomb: Honeycomb,
  args: CreataeAssetArgs
) {
  const ctx = createCreateAssetCtx(
    {
      args: args.args,
      project: honeycomb.projectAddress,
      assetManager: honeycomb.assetManager().assetManagerAddress,
      authority: honeycomb.identity().publicKey,
      payer: honeycomb.identity().publicKey,
      delegateAuthority: honeycomb.identity().getDelegateAuthority()
        .delegateAuthorityAddress,
      programId: args.programId,
    },
    honeycomb.assetManager().proofIndex()
  );

  if (args.candyGuardBuilder) {
    const blockhash = await honeycomb.rpc().getLatestBlockhash();
    ctx.tx = new web3.Transaction().add(
      ...args.candyGuardBuilder.toTransaction(blockhash).instructions,
      ctx.tx
    );
    ctx.signers = [
      ...(args.candyGuardBuilder.getSigners() as web3.Signer[]),
      ...ctx.signers,
    ];
  }

  const response = await honeycomb
    .rpc()
    .sendAndConfirmTransaction(ctx, { skipPreflight: true });

  return {
    response,
    assetAddress: ctx.asset,
  };
}
