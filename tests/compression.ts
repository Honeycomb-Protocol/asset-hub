import keccak from "keccak";
import { PublicKey } from "@solana/web3.js";
import {
  CharacterSchema,
  CharacterSource,
  CharacterUsedBy,
  GuildRole,
  NftWrapCriteria,
} from "../packages/hpl-character-manager";

export function keccak256Hash(buffers: Buffer[]): number[] {
  // Create a Keccak-256 hash object
  const hash = keccak("keccak256");

  // Concatenate the buffers
  buffers.forEach((buffer) => {
    hash.update(buffer);
  });

  // Get the final hash as a Buffer
  const resultBuffer = hash.digest();

  // Convert the Buffer to an array of numbers
  const resultArray: number[] = [];
  for (let i = 0; i < resultBuffer.length; i++) {
    resultArray.push(resultBuffer.readUInt8(i));
  }

  return resultArray;
}

export type Proof = {
  root: PublicKey;
  proof: PublicKey[];
  node_index: number;
  leaf: PublicKey;
  tree_id: PublicKey;
};
export type CompressedData<T = any> = {
  id: number;
  tree_id: string;
  leaf_idx: number;
  parsed_data: T;
};

export type Character = CharacterSchema & {
  merkleTree: PublicKey;
  leafIndex: number;
};
export type CharacterParsedData = {
  owner: string;
  source: {
    __kind: "Wrapped";
    params: {
      mint: string;
      criteria: {
        __kind: "Collection" | "Creator" | "MerkleTree";
        params: string;
      };
      is_compressed: boolean;
    };
  };
  used_by:
    | {
        __kind: "None";
        params: null;
      }
    | {
        __kind: "Staking";
        params: {
          pool: string;
          staker: string;
          staked_at: number;
          claimed_at: number;
        };
      }
    | {
        __kind: "Missions";
        params: {
          participation: string;
        };
      }
    | {
        __kind: "Guild";
        params: {
          id: string;
          role: { __kind: "Chief" } | { __kind: "Member" };
          order: number;
        };
      };
};

export const boolHash = (bool: boolean) => {
  return keccak256Hash([Buffer.from(bool ? [1] : [0])]);
};

export const nftWrapCriteriaHash = (criteria: NftWrapCriteria) => {
  return keccak256Hash([
    Buffer.from(criteria.__kind),
    criteria.fields[0].toBuffer(),
  ]);
};

export const sourceHash = (source: CharacterSource) => {
  switch (source.__kind) {
    case "Wrapped":
      return keccak256Hash([
        Buffer.from("Wrapped"),
        source.mint.toBuffer(),
        Buffer.from(nftWrapCriteriaHash(source.criteria)),
        Buffer.from(boolHash(source.isCompressed)),
      ]);
    default:
      throw new Error("Invalid Character source");
  }
};

export const usedByHash = (usedBy: CharacterUsedBy) => {
  switch (usedBy.__kind) {
    case "None":
      return keccak256Hash([Buffer.from("None")]);

    default:
      throw new Error("Invalid Character used by");
  }
};

export const characterHash = (character: CharacterSchema) => {
  return keccak256Hash([
    Buffer.from("CharacterSchema"),
    character.owner.toBuffer(),
    Buffer.from(sourceHash(character.source)),
    Buffer.from(usedByHash(character.usedBy)),
  ]);
};

async function getCompressedData<T = any>(
  rpcUrl: string,
  leafIdx: number,
  tree: PublicKey
): Promise<CompressedData<T> | null> {
  const { result, error } = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "my-id",
      method: "getCompressedData",
      params: {
        tree: tree.toString(),
        leafIdx,
      },
    }),
  }).then((res) => res.json());
  if (!result) {
    console.log(error);
    return null;
  }
  return result;
}

export async function getProof(
  rpcUrl: string,
  leafIdx: number,
  tree: PublicKey
): Promise<Proof | null> {
  const { result, error } = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "my-id",
      method: "getProof",
      params: {
        tree: tree.toString(),
        leafIdx,
      },
    }),
  }).then((res) => res.json());
  if (!result) {
    console.log(error);
    return null;
  }
  return {
    leaf: new PublicKey(result.leaf),
    root: new PublicKey(result.root),
    tree_id: new PublicKey(result.tree_id),
    node_index: result.node_index,
    proof: result.proof.map((p) => new PublicKey(p)),
  };
}

export const parseCharacterToSolita = (
  characterData: CharacterParsedData
): CharacterSchema => {
  return {
    owner: new PublicKey(characterData.owner.replace("pubkey:", "")),
    source: {
      __kind: "Wrapped",
      mint: new PublicKey(
        characterData.source.params.mint.replace("pubkey:", "")
      ),
      criteria: {
        __kind: characterData.source.params.criteria.__kind,
        fields: [
          new PublicKey(
            characterData.source.params.criteria.params.replace("pubkey:", "")
          ),
        ],
      },
      isCompressed: characterData.source.params.is_compressed,
    },
    usedBy:
      "Staking" === characterData.used_by.__kind
        ? {
            __kind: "Staking",
            pool: new PublicKey(
              characterData.used_by.params.pool.replace("pubkey:", "")
            ),
            staker: new PublicKey(
              characterData.used_by.params.staker.replace("pubkey:", "")
            ),
            stakedAt: characterData.used_by.params.staked_at,
            claimedAt: characterData.used_by.params.claimed_at,
          }
        : "Missions" === characterData.used_by.__kind
        ? {
            __kind: "Missions",
            participation: new PublicKey(
              characterData.used_by.params.participation.replace("pubkey:", "")
            ),
          }
        : "Guild" === characterData.used_by.__kind
        ? {
            __kind: "Guild",
            id: new PublicKey(
              characterData.used_by.params.id.replace("pubkey:", "")
            ),
            order: characterData.used_by.params.order,
            role:
              characterData.used_by.params.role.__kind == "Chief"
                ? GuildRole.Chief
                : GuildRole.Member,
          }
        : { __kind: "None" },
  };
};

export async function getCharacter(
  rpcUrl: string,
  leafIdx: number,
  tree: PublicKey
): Promise<Character | null> {
  const characterData = await getCompressedData<CharacterParsedData>(
    rpcUrl,
    leafIdx,
    tree
  );
  if (!characterData) return null;

  return {
    ...parseCharacterToSolita(characterData.parsed_data),
    merkleTree: new PublicKey(characterData.tree_id),
    leafIndex: characterData.leaf_idx,
  };
}
