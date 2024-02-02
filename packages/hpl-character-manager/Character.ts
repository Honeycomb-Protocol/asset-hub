import { PublicKey } from "@solana/web3.js";
import { CharacterSchema, GuildRole, NftWrapCriteria } from "./generated";
import type { Asset, CompressedData } from "./types";
import {
  boolHash,
  fetchHeliusAssets,
  getCompressedData,
  getProof,
  keccak256Hash,
} from "./utils";

export type CharacterOffchainData = {
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
        __kind: "Mission";
        params: {
          id: string;
          requirement: {
            __kind: "Time";
            endTime: number;
          };
          rewards: {
            delta: number;
            rewardIdx: number;
          }[];
          rewardsCollected: boolean;
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

export const nftWrapCriteriaHash = (criteria: NftWrapCriteria) => {
  return keccak256Hash([
    Buffer.from(criteria.__kind),
    criteria.fields[0].toBuffer(),
  ]);
};

export class HplCharacter {
  private _asset: Asset;

  constructor(
    private _schema: CharacterSchema,
    private _merkleTree: PublicKey,
    private _leafIdx: number
  ) {}

  public get owner() {
    return this._schema.owner;
  }

  public get ownerHash() {
    return this.owner.toBuffer();
  }

  public get source() {
    return this._schema.source;
  }

  public get sourceHash() {
    switch (this.source.__kind) {
      case "Wrapped":
        return keccak256Hash([
          Buffer.from("Wrapped"),
          this.source.mint.toBuffer(),
          Buffer.from(nftWrapCriteriaHash(this.source.criteria)),
          Buffer.from(boolHash(this.source.isCompressed)),
        ]);
    }
  }

  public get usedBy() {
    return this._schema.usedBy;
  }

  public get usedByHash() {
    switch (this.usedBy.__kind) {
      case "None":
        return keccak256Hash([Buffer.from("None")]);

      default:
        throw new Error(
          "Used by `" + this.usedBy.__kind + "` hash not support yet"
        );
    }
  }

  public get merkleTree() {
    return this._merkleTree;
  }

  public get leafIdx() {
    return this._leafIdx;
  }

  public get hash() {
    return keccak256Hash([
      Buffer.from("CharacterSchema"),
      this.ownerHash,
      this.sourceHash,
      this.usedByHash,
    ]);
  }

  public static parseOffchainToSchema(
    offchainData: CharacterOffchainData
  ): CharacterSchema {
    return {
      owner: new PublicKey(offchainData.owner.replace("pubkey:", "")),
      source: {
        __kind: "Wrapped",
        mint: new PublicKey(
          offchainData.source.params.mint.replace("pubkey:", "")
        ),
        criteria: {
          __kind: offchainData.source.params.criteria.__kind,
          fields: [
            new PublicKey(
              offchainData.source.params.criteria.params.replace("pubkey:", "")
            ),
          ],
        },
        isCompressed: offchainData.source.params.is_compressed,
      },
      usedBy:
        "Staking" === offchainData.used_by.__kind
          ? {
              __kind: "Staking",
              pool: new PublicKey(
                offchainData.used_by.params.pool.replace("pubkey:", "")
              ),
              staker: new PublicKey(
                offchainData.used_by.params.staker.replace("pubkey:", "")
              ),
              stakedAt: offchainData.used_by.params.staked_at,
              claimedAt: offchainData.used_by.params.claimed_at,
            }
          : "Mission" === offchainData.used_by.__kind
          ? {
              __kind: "Mission",
              id: new PublicKey(
                offchainData.used_by.params.id.replace("pubkey:", "")
              ),
              endTime: offchainData.used_by.params.requirement.endTime,
              rewards: offchainData.used_by.params.rewards,
              rewardsCollected: offchainData.used_by.params.rewardsCollected,
            }
          : "Guild" === offchainData.used_by.__kind
          ? {
              __kind: "Guild",
              id: new PublicKey(
                offchainData.used_by.params.id.replace("pubkey:", "")
              ),
              order: offchainData.used_by.params.order,
              role:
                offchainData.used_by.params.role.__kind == "Chief"
                  ? GuildRole.Chief
                  : GuildRole.Member,
            }
          : { __kind: "None" },
    };
  }

  public static fromCompressedData(
    compressedData: CompressedData<CharacterOffchainData>
  ) {
    return new HplCharacter(
      HplCharacter.parseOffchainToSchema(compressedData.parsed_data),
      new PublicKey(compressedData.tree_id),
      compressedData.leaf_idx
    );
  }

  public static async fetchWithTreeAndLeaf(
    rpcUrl: string,
    tree: PublicKey,
    leafIdx: number
  ) {
    const compressedData = await getCompressedData<CharacterOffchainData>(
      rpcUrl,
      leafIdx,
      tree
    );
    if (!compressedData) throw new Error("Character not found");
    return HplCharacter.fromCompressedData(compressedData);
  }

  public static async fetchWithWallet(rpcUrl: string, wallet: PublicKey) {
    const { result, error } = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "my-id",
        method: "getCharacters",
        params: {
          wallet: wallet.toString(),
        },
      }),
    }).then((res) => res.json());
    if (!result) {
      console.error(error);
      throw new Error("Error while fetching characters");
    }
    console.log("Result", result);
    return (result as CompressedData<CharacterOffchainData>[]).map(
      HplCharacter.fromCompressedData
    );
  }

  public async asset(rpcUrl: string): Promise<Asset> {
    if (!this._asset) {
      this._asset = await fetchHeliusAssets(rpcUrl, {
        mintList: [this.source.mint],
      }).then((x) => x[0]);
    }
    return this._asset;
  }

  public proof(rpcUrl: string) {
    return getProof(rpcUrl, this.leafIdx, this.merkleTree);
  }
}
