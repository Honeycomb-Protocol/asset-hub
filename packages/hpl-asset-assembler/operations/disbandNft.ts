import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import {
  createBurnNftInstruction,
  createRemoveBlockInstruction,
  AssemblingAction,
  PROGRAM_ID,
} from "../generated";
import {
  getBlockDefinitionPda,
  getBlockPda,
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

type CreateBurnNFTCtxArgs = {
  project: web3.PublicKey;
  assembler: web3.PublicKey;
  nftMint: web3.PublicKey;
  authority: web3.PublicKey;
  payer: web3.PublicKey;
  uniqueConstraint?: web3.PublicKey;
  delegateAuthority?: web3.PublicKey;
  programId?: web3.PublicKey;
};
export function createBurnNFTCtx(
  honeycomb: Honeycomb,
  args: CreateBurnNFTCtxArgs
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

  const instructions = [
    createBurnNftInstruction(
      {
        project: args.project,
        assembler: args.assembler,
        nft,
        nftMint: args.nftMint,
        nftMetadata,
        nftMasterEdition,
        tokenAccount,
        uniqueConstraint: args.uniqueConstraint || programId,
        authority: args.authority,
        payer: args.payer,
        delegateAuthority: args.delegateAuthority || programId,
        vault: VAULT,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        tokenMetadataProgram: METADATA_PROGRAM_ID,
      },
      programId
    ),
  ];

  return new Operation(honeycomb, instructions).context;
}

type CreateRemoveBlockCtxArgs = {
  project: web3.PublicKey;
  assembler: web3.PublicKey;
  nftMint: web3.PublicKey;
  block: web3.PublicKey;
  blockDefinition: web3.PublicKey;
  tokenMint: web3.PublicKey;
  authority: web3.PublicKey;
  payer: web3.PublicKey;
  delegateAuthority?: web3.PublicKey;
  assemblingAction?: AssemblingAction; // default: AssemblingAction.Freeze,
  programId?: web3.PublicKey;
};
export function createRemoveBlockCtx(
  honeycomb: Honeycomb,
  args: CreateRemoveBlockCtxArgs
) {
  const programId = args.programId || PROGRAM_ID;

  const tokenAccount = splToken.getAssociatedTokenAddressSync(
    args.tokenMint,
    args.authority
  );
  const [tokenMetadata] = getMetadataAccount_(args.tokenMint);
  const [tokenEdition] = getMetadataAccount_(args.tokenMint, {
    __kind: "edition",
  });
  const [tokenRecord] = getMetadataAccount_(args.tokenMint, {
    __kind: "token_record",
    tokenAccount,
  });
  const [depositAccount] = getDepositPda(
    args.tokenMint,
    args.nftMint,
    programId
  );
  const [depositTokenRecord] = getMetadataAccount_(args.tokenMint, {
    __kind: "token_record",
    tokenAccount: depositAccount,
  });

  const [nft] = getNftPda(args.nftMint, programId);

  const instructions = [
    createRemoveBlockInstruction(
      {
        project: args.project,
        assembler: args.assembler,
        nft,
        block: args.block,
        blockDefinition: args.blockDefinition,
        tokenMint: args.tokenMint,
        tokenAccount,
        tokenMetadata,
        tokenEdition,
        tokenRecord,
        depositAccount:
          args.assemblingAction === AssemblingAction.TakeCustody
            ? depositAccount
            : programId,
        depositTokenRecord,
        authority: args.authority,
        payer: args.payer,
        delegateAuthority: args.delegateAuthority || programId,
        vault: VAULT,
        tokenMetadataProgram: METADATA_PROGRAM_ID,
        associatedTokenProgram: splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      programId
    ),
  ];

  return new Operation(honeycomb, instructions).context;
}

type DisbandNftArgs = {
  nft: AssetAssemblerNft;
  programId?: web3.PublicKey;
};
export async function disbandNft(honeycomb: Honeycomb, args: DisbandNftArgs) {
  let uniqueConstraint: web3.PublicKey | undefined = undefined;
  if (!honeycomb.assembler().allowDuplicates) {
    uniqueConstraint = getUniqueConstraintPda(
      args.nft.attributes,
      args.nft.assembler().assemblerAddress
    )[0];
  }

  const ctxs = await Promise.all(
    args.nft.attributes.map(async (attribute) => {
      if (!attribute.mint) return null;
      const [block] = getBlockPda(
        args.nft.assembler().assemblerAddress,
        attribute.order
      );
      const [blockDefinition] = getBlockDefinitionPda(block, attribute.mint);

      return createRemoveBlockCtx(honeycomb, {
        project: honeycomb.project().address,
        assembler: honeycomb.assembler().assemblerAddress,
        nftMint: args.nft.mintAddress,
        block,
        blockDefinition,
        tokenMint: attribute.mint,
        authority: honeycomb.identity().address,
        payer: honeycomb.identity().address,
        assemblingAction: honeycomb.assembler().assemblingAction,
        delegateAuthority: honeycomb.identity().delegateAuthority()?.address,
        programId: args.programId,
      });
    })
  ).then((x) => x.filter((x) => x !== null) as OperationContext[]);

  ctxs.unshift(
    createBurnNFTCtx(honeycomb, {
      project: honeycomb.project().address,
      assembler: honeycomb.assembler().assemblerAddress,
      nftMint: args.nft.mintAddress,
      uniqueConstraint,
      authority: honeycomb.identity().address,
      payer: honeycomb.identity().address,
      delegateAuthority: honeycomb.identity().delegateAuthority()?.address,
      programId: args.programId,
    })
  );

  const preparedCtxs = await honeycomb.rpc().prepareTransactions(ctxs);

  return await honeycomb.rpc().sendAndConfirmTransactions(preparedCtxs, {
    commitment: "processed",
    skipPreflight: true,
    batchSize: 1,
  });
}

type BurnNftArgs = {
  nft: AssetAssemblerNft;
  programId?: web3.PublicKey;
};
export async function burnNft(honeycomb: Honeycomb, args: BurnNftArgs) {
  let uniqueConstraint: web3.PublicKey | undefined = undefined;
  if (!honeycomb.assembler().allowDuplicates) {
    [uniqueConstraint] = getUniqueConstraintPda(
      args.nft.attributes,
      honeycomb.assembler().assemblerAddress
    );
  }

  const ctx = createBurnNFTCtx(honeycomb, {
    project: honeycomb.project().address,
    assembler: honeycomb.assembler().assemblerAddress,
    nftMint: args.nft.mintAddress,
    authority: honeycomb.identity().address,
    payer: honeycomb.identity().address,
    uniqueConstraint,
    delegateAuthority: honeycomb.identity().delegateAuthority()?.address,
    programId: args.programId,
  });

  return honeycomb.rpc().sendAndConfirmTransaction(ctx, {
    commitment: "processed",
    skipPreflight: true,
  });
}

type RemoveBlockArgs = {
  nft: AssetAssemblerNft;
  blockDefinition: AssetAssemblerBlockDefinition;
  programId?: web3.PublicKey;
};
export async function removeBlock(honeycomb: Honeycomb, args: RemoveBlockArgs) {
  const ctx = createRemoveBlockCtx(honeycomb, {
    project: honeycomb.project().address,
    assembler: honeycomb.assembler().assemblerAddress,
    nftMint: args.nft.mintAddress,
    block: args.blockDefinition.block,
    blockDefinition: args.blockDefinition.address,
    tokenMint: args.blockDefinition.mint,
    authority: honeycomb.identity().address,
    payer: honeycomb.identity().address,
    delegateAuthority: honeycomb.identity().delegateAuthority()?.address,
    assemblingAction: honeycomb.assembler().assemblingAction,
    programId: args.programId,
  });

  return honeycomb.rpc().sendAndConfirmTransaction(ctx, {
    commitment: "processed",
    skipPreflight: true,
  });
}
