import { KeypairLike, Operation } from "@honeycomb-protocol/hive-control";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, PublicKey, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { ResourseKind, createCreateNewResourceInstruction } from "../generated";
import { resourceManagerPdas } from "../utils";
import { HplResourceManager } from "../HplResource";

export interface CreateNewResourceParams {
  owner: KeypairLike;
  payer: KeypairLike;
  project: PublicKey;
  resource: {
    decimals: number;
    kind: ResourseKind;
    metadata: {
      name: string;
      symbol: string;
      uri: string;
    };
  };
}
export const createNewResource = async (
  resource: HplResourceManager,
  params: CreateNewResourceParams
) => {
  const payer = params.payer ? params.payer.publicKey : params.owner.publicKey;
  const mint = new Keypair();

  const [resourceAddress] = resourceManagerPdas().resource(
    params.project,
    mint.publicKey
  );

  const ix = createCreateNewResourceInstruction(
    {
      payer,
      mint: mint.publicKey,
      project: params.project,
      resource: resourceAddress,
      owner: params.owner.publicKey,
      rentSysvar: SYSVAR_RENT_PUBKEY,
      token22Program: TOKEN_2022_PROGRAM_ID,
    },
    {
      args: {
        decimals: params.resource.decimals,
        kind: params.resource.kind,
        metadata: {
          name: params.resource.metadata.name,
          symbol: params.resource.metadata.symbol,
          uri: params.resource.metadata.uri,
        },
      },
    }
  );

  return new Operation(
    resource.honeycomb(),
    [ix],
    [params.owner, params.payer]
  );
};
