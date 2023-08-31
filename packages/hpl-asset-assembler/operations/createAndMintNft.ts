import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import {
  createCreateNftInstruction,
  createAddBlockInstruction,
  createMintNftInstruction,
  Assembler,
  AssemblingAction,
  PROGRAM_ID,
} from "../generated";
import {
  getDepositPda,
  getMetadataAccount_,
  getNftPda,
  getUniqueConstraintPda,
  METADATA_PROGRAM_ID,
} from "../pdas";
import {
  Honeycomb,
  Operation,
  OperationContext,
  VAULT,
} from "@honeycomb-protocol/hive-control";
import {
  AssetAssemblerBlockDefinition,
  AssetAssemblerNft,
} from "../AssetAssembler";
import {
  Metadata,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";

type CreateCreateNftCtxArgs = {
  project: web3.PublicKey;
  assembler: web3.PublicKey;
  collectionMint: web3.PublicKey;
  authority: web3.PublicKey;
  payer: web3.PublicKey;
  delegateAuthority?: web3.PublicKey;
  programId?: web3.PublicKey;
};
export function createCreateNftCtx(
  honeycomb: Honeycomb,
  args: CreateCreateNftCtxArgs
) {
  const programId = args.programId || PROGRAM_ID;

  const nftMint = web3.Keypair.generate();
  const [collectionMetadataAccount] = getMetadataAccount_(args.collectionMint);
  const [collectionMasterEdition] = getMetadataAccount_(args.collectionMint, {
    __kind: "edition",
  });
  const [nftMetadata] = getMetadataAccount_(nftMint.publicKey);
  const [nftMasterEdition] = getMetadataAccount_(nftMint.publicKey, {
    __kind: "edition",
  });
  const [nft] = getNftPda(nftMint.publicKey, programId);

  const instructions: web3.TransactionInstruction[] = [
    createCreateNftInstruction(
      {
        assembler: args.assembler,
        collectionMint: args.collectionMint,
        collectionMetadataAccount,
        collectionMasterEdition,
        nftMint: nftMint.publicKey,
        nftMetadata,
        nftMasterEdition,
        nft,
        authority: args.authority,
        payer: args.payer,
        tokenMetadataProgram: METADATA_PROGRAM_ID,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        project: args.project,
        delegateAuthority: args.delegateAuthority || programId,
        vault: VAULT,
      },
      programId
    ),
  ];

  return {
    ...new Operation(honeycomb, instructions, [nftMint]).context,
    nft,
    nftMint: nftMint.publicKey,
  };
}

type CreateAddBlockCtx = {
  project: web3.PublicKey;
  assembler: web3.PublicKey;
  nftMint: web3.PublicKey;
  block: web3.PublicKey;
  blockDefinition: web3.PublicKey;
  tokenMint: web3.PublicKey;
  authority: web3.PublicKey;
  payer: web3.PublicKey;
  assemblingAction?: AssemblingAction; // default: AssemblingAction.Freeze,
  tokenStandard?: TokenStandard;
  delegateAuthority?: web3.PublicKey;
  programId?: web3.PublicKey;
};
export function createAddBlockCtx(
  honeycomb: Honeycomb,
  args: CreateAddBlockCtx
) {
  const programId = args.programId || PROGRAM_ID;
  const tokenAccount = splToken.getAssociatedTokenAddressSync(
    args.tokenMint,
    args.authority
  );
  const [tokenMetadata] = getMetadataAccount_(args.tokenMint);
  const [depositAccount] = getDepositPda(
    args.tokenMint,
    args.nftMint,
    programId
  );
  const [nft] = getNftPda(args.nftMint, programId);

  let tokenRecord: web3.PublicKey | undefined = undefined,
    depositTokenRecord: web3.PublicKey | undefined = undefined,
    tokenEdition: web3.PublicKey | undefined = undefined;

  if (args.tokenStandard === TokenStandard.ProgrammableNonFungible) {
    [tokenEdition] = getMetadataAccount_(args.tokenMint, {
      __kind: "edition",
    });
    [tokenRecord] = getMetadataAccount_(args.tokenMint, {
      __kind: "token_record",
      tokenAccount,
    });
    [depositTokenRecord] = getMetadataAccount_(args.tokenMint, {
      __kind: "token_record",
      tokenAccount: depositAccount,
    });
  }

  const instructions: web3.TransactionInstruction[] = [
    createAddBlockInstruction(
      {
        assembler: args.assembler,
        nft,
        block: args.block,
        blockDefinition: args.blockDefinition,
        tokenMint: args.tokenMint,
        tokenAccount,
        tokenMetadata,
        tokenEdition: tokenEdition || programId,
        tokenRecord: tokenRecord || programId,
        depositAccount:
          args.assemblingAction === AssemblingAction.TakeCustody
            ? depositAccount
            : programId,
        depositTokenRecord: depositTokenRecord || programId,
        authority: args.authority,
        payer: args.payer,
        tokenMetadataProgram: METADATA_PROGRAM_ID,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        associatedTokenProgram: splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        project: args.project,
        delegateAuthority: args.delegateAuthority || programId,
        vault: VAULT,
      },
      programId
    ),
  ];

  return new Operation(honeycomb, instructions).context;
}

type CreateMintNftCtxArgs = {
  project: web3.PublicKey;
  assembler: web3.PublicKey;
  nftMint: web3.PublicKey;
  uniqueConstraint?: web3.PublicKey;
  authority: web3.PublicKey;
  payer: web3.PublicKey;
  delegateAuthority?: web3.PublicKey;
  programId?: web3.PublicKey;
};
export function createMintNftCtx(
  honeycomb: Honeycomb,
  args: CreateMintNftCtxArgs
) {
  const programId = args.programId || PROGRAM_ID;
  const tokenAccount = splToken.getAssociatedTokenAddressSync(
    args.nftMint,
    args.authority
  );

  const [nft] = getNftPda(args.nftMint, programId);
  const [nftMetadata] = getMetadataAccount_(args.nftMint);
  const [nftMasterEdition] = getMetadataAccount_(args.nftMint, {
    __kind: "edition",
  });
  const [nftTokenRecord] = getMetadataAccount_(args.nftMint, {
    __kind: "token_record",
    tokenAccount,
  });

  const instructions: web3.TransactionInstruction[] = [
    splToken.createAssociatedTokenAccountInstruction(
      args.payer,
      tokenAccount,
      args.authority,
      args.nftMint
    ),

    createMintNftInstruction(
      {
        assembler: args.assembler,
        nft,
        nftMint: args.nftMint,
        nftMetadata,
        nftMasterEdition,
        nftTokenRecord,
        tokenAccount,
        uniqueConstraint: args.uniqueConstraint || programId,
        authority: args.authority,
        payer: args.payer,
        associatedTokenProgram: splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: METADATA_PROGRAM_ID,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        project: args.project,
        delegateAuthority: args.delegateAuthority || programId,
        vault: VAULT,
      },
      programId
    ),
  ];

  return new Operation(honeycomb, instructions).context;
}

export type CreateCreateAndMintNftCtxsArgs = {
  project: web3.PublicKey;
  assemblerAddress: web3.PublicKey;
  assembler: Assembler;
  wallet: web3.PublicKey;
  blocks: {
    block: web3.PublicKey;
    blockDefinition: web3.PublicKey;
    tokenMint: web3.PublicKey;
    order: number;
    blockDefinitionIndex: number;
    tokenStandard?: TokenStandard;
  }[];
  delegateAuthority?: web3.PublicKey;
  programId?: web3.PublicKey;
};
export async function createCreateAndMintNftCtxs(
  honeycomb: Honeycomb,
  args: CreateCreateAndMintNftCtxsArgs
): Promise<{
  ctxs: OperationContext[];
  nft: web3.PublicKey;
  nftMint: web3.PublicKey;
}> {
  const ctxs: OperationContext[] = [];

  const { nft, nftMint, ...nftCreateCtx } = createCreateNftCtx(honeycomb, {
    project: args.project,
    assembler: args.assemblerAddress,
    collectionMint: args.assembler.collection,
    authority: args.wallet,
    payer: args.wallet,
    delegateAuthority: args.delegateAuthority,
    programId: args.programId,
  });
  ctxs.push(nftCreateCtx);

  args.blocks.forEach((block) => {
    ctxs.push(
      createAddBlockCtx(honeycomb, {
        project: args.project,
        assembler: args.assemblerAddress,
        nftMint,
        block: block.block,
        blockDefinition: block.blockDefinition,
        tokenMint: block.tokenMint,
        authority: args.wallet,
        payer: args.wallet,
        assemblingAction: args.assembler.assemblingAction,
        tokenStandard: block.tokenStandard,
        delegateAuthority: args.delegateAuthority,
        programId: args.programId,
      })
    );
  });
  let uniqueConstraint: web3.PublicKey | undefined = undefined;

  if (!args.assembler.allowDuplicates) {
    [uniqueConstraint] = getUniqueConstraintPda(
      args.blocks,
      args.assemblerAddress
    );
  }

  ctxs.push(
    createMintNftCtx(honeycomb, {
      project: args.project,
      assembler: args.assemblerAddress,
      nftMint,
      uniqueConstraint: uniqueConstraint,
      authority: args.wallet,
      payer: args.wallet,
      delegateAuthority: args.delegateAuthority,
      programId: args.programId,
    })
  );

  return {
    ctxs,
    nftMint,
    nft,
  };
}

export type CreateCreateAndMintNftArgs = {
  blocks: {
    block: web3.PublicKey;
    blockDefinition: web3.PublicKey;
    tokenMint: web3.PublicKey;
    order: number;
    blockDefinitionIndex: number;
    tokenStandard?: TokenStandard;
  }[];
  programId?: web3.PublicKey;
};
export async function createAndMintNft(
  honeycomb: Honeycomb,
  args: CreateCreateAndMintNftArgs
) {
  const { ctxs, nftMint, nft } = await createCreateAndMintNftCtxs(honeycomb, {
    project: honeycomb.project().address,
    assemblerAddress: honeycomb.assembler().assemblerAddress,
    assembler: honeycomb.assembler().assembler(),
    wallet: honeycomb.identity().address,
    blocks: args.blocks,
    delegateAuthority: honeycomb.identity().delegateAuthority()?.address,
    programId: args.programId,
  });

  const preparedCtxs = await honeycomb.rpc().prepareTransactions(ctxs);

  const responses = await honeycomb
    .rpc()
    .sendAndConfirmTransactions(preparedCtxs, {
      commitment: "processed",
      skipPreflight: true,
      batchSize: 1,
    });

  return {
    responses,
    nftMint,
    nft,
  };
}

export type CreateNftArgs = {
  programId?: web3.PublicKey;
};
export async function createNft(honeycomb: Honeycomb, args: CreateNftArgs) {
  const ctx = createCreateNftCtx(honeycomb, {
    project: honeycomb.project().address,
    assembler: honeycomb.assembler().assemblerAddress,
    collectionMint: honeycomb.assembler().collection,
    authority: honeycomb.identity().address,
    payer: honeycomb.identity().address,
    delegateAuthority: honeycomb.identity().delegateAuthority()?.address,
    programId: args.programId,
  });

  return {
    response: honeycomb
      .rpc()
      .sendAndConfirmTransaction(ctx, { skipPreflight: true }),
    nft: ctx.nft,
    nftMint: ctx.nftMint,
  };
}

export type AddBlockArgs = {
  nft: AssetAssemblerNft;
  blockDefinition: AssetAssemblerBlockDefinition;
  programId?: web3.PublicKey;
};
export async function addBlock(honeycomb: Honeycomb, args: AddBlockArgs) {
  const [metadata] = getMetadataAccount_(args.blockDefinition.mint);
  const { tokenStandard } = await Metadata.fromAccountAddress(
    honeycomb.connection,
    metadata
  );

  const ctx = createAddBlockCtx(honeycomb, {
    project: honeycomb.project().address,
    assembler: honeycomb.assembler().assemblerAddress,
    nftMint: args.nft.mintAddress,
    block: args.blockDefinition.block,
    blockDefinition: args.blockDefinition.address,
    tokenMint: args.blockDefinition.mint,
    authority: honeycomb.identity().address,
    payer: honeycomb.identity().address,
    assemblingAction: honeycomb.assembler().assemblingAction,
    tokenStandard: tokenStandard || undefined,
    delegateAuthority: honeycomb.identity().delegateAuthority()?.address,
    programId: args.programId,
  });

  return honeycomb
    .rpc()
    .sendAndConfirmTransaction(ctx, { skipPreflight: true });
}

export type MintNftArgs = {
  nftMint: web3.PublicKey;
  blocks: {
    order: number;
    blockDefinitionIndex: number;
  }[];
  programId?: web3.PublicKey;
};
export async function mintNft(honeycomb: Honeycomb, args: MintNftArgs) {
  let uniqueConstraint: web3.PublicKey | undefined = undefined;
  if (!honeycomb.assembler().allowDuplicates) {
    [uniqueConstraint] = getUniqueConstraintPda(
      args.blocks,
      honeycomb.assembler().assemblerAddress
    );
  }

  const ctx = createMintNftCtx(honeycomb, {
    project: honeycomb.project().address,
    assembler: honeycomb.assembler().assemblerAddress,
    nftMint: args.nftMint,
    uniqueConstraint,
    authority: honeycomb.identity().address,
    payer: honeycomb.identity().address,
    delegateAuthority: honeycomb.identity().delegateAuthority()?.address,
    programId: args.programId,
  });

  return honeycomb
    .rpc()
    .sendAndConfirmTransaction(ctx, { skipPreflight: true });
}
