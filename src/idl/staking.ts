export type Staking = {
  "version": "0.1.0",
  "name": "staking",
  "instructions": [
    {
      "name": "createProject",
      "accounts": [
        {
          "name": "key",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "project",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The wallet that holds the authority over the assembler"
          ]
        },
        {
          "name": "rewardMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Reward mint address to be used for the project"
          ]
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Reward token account used as vault"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE SYSTEM PROGRAM"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL TOKEN PROGRAM"
          ]
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "CreateProjectArgs"
          }
        }
      ]
    },
    {
      "name": "updateProject",
      "accounts": [
        {
          "name": "project",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "newAuthority",
          "isMut": false,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "The wallet that holds the authority over the assembler"
          ]
        },
        {
          "name": "collection",
          "isMut": false,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "Collection mint address to be used for the project"
          ]
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "Creator address to be used for the project"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE SYSTEM PROGRAM"
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SYSVAR RENT"
          ]
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "UpdateProjectArgs"
          }
        }
      ]
    },
    {
      "name": "initMultipliers",
      "accounts": [
        {
          "name": "project",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "multipliers",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Multiplier state account"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE SYSTEM PROGRAM"
          ]
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "InitMultipliersArgs"
          }
        }
      ]
    },
    {
      "name": "addMultiplier",
      "accounts": [
        {
          "name": "project",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "multipliers",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Multiplier state account"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE SYSTEM PROGRAM"
          ]
        },
        {
          "name": "rentSysvar",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "RENT SYSVAR"
          ]
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "AddMultiplierArgs"
          }
        }
      ]
    },
    {
      "name": "initNft",
      "accounts": [
        {
          "name": "project",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "nft",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "NFT state account"
          ]
        },
        {
          "name": "nftMint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Mint address of the NFT"
          ]
        },
        {
          "name": "nftMetadata",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "NFT token metadata"
          ]
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE SYSTEM PROGRAM"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "initStaker",
      "accounts": [
        {
          "name": "project",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "staker",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staker state account"
          ]
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE SYSTEM PROGRAM"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "stake",
      "accounts": [
        {
          "name": "project",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "nft",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "NFT state account"
          ]
        },
        {
          "name": "nftMint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Mint address of the NFT"
          ]
        },
        {
          "name": "nftAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Token account of the NFT"
          ]
        },
        {
          "name": "nftMetadata",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "NFT token metadata"
          ]
        },
        {
          "name": "nftEdition",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "NFT edition"
          ]
        },
        {
          "name": "nftTokenRecord",
          "isMut": true,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "NFT token record"
          ]
        },
        {
          "name": "staker",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staker state account"
          ]
        },
        {
          "name": "depositAccount",
          "isMut": true,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "The account that will hold the nft sent on expedition"
          ]
        },
        {
          "name": "depositTokenRecord",
          "isMut": true,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "Deposit token_record"
          ]
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE SYSTEM PROGRAM"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE TOKEN PROGRAM"
          ]
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "ASSOCIATED TOKEN PROGRAM"
          ]
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "METAPLEX TOKEN METADATA PROGRAM"
          ]
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE CLOCK SYSVAR"
          ]
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE Instructions SYSVAR"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "project",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "nft",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "NFT state account"
          ]
        },
        {
          "name": "nftMint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Mint address of the NFT"
          ]
        },
        {
          "name": "nftAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Token account of the NFT"
          ]
        },
        {
          "name": "nftMetadata",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "NFT token metadata"
          ]
        },
        {
          "name": "nftEdition",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "NFT edition"
          ]
        },
        {
          "name": "nftTokenRecord",
          "isMut": true,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "NFT token record"
          ]
        },
        {
          "name": "depositAccount",
          "isMut": true,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "The account that will hold the nft sent on expedition"
          ]
        },
        {
          "name": "depositTokenRecord",
          "isMut": true,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "Deposit token_record"
          ]
        },
        {
          "name": "staker",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staker state account"
          ]
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE SYSTEM PROGRAM"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE TOKEN PROGRAM"
          ]
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "ASSOCIATED TOKEN PROGRAM"
          ]
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "METAPLEX TOKEN METADATA PROGRAM"
          ]
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE CLOCK SYSVAR"
          ]
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE Instructions SYSVAR"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "fundRewards",
      "accounts": [
        {
          "name": "project",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "rewardMint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Mint address of the reward token"
          ]
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Vault"
          ]
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Payee token account"
          ]
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE TOKEN PROGRAM"
          ]
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawRewards",
      "accounts": [
        {
          "name": "project",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "rewardMint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Mint address of the reward token"
          ]
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Vault"
          ]
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Payee token account"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE TOKEN PROGRAM"
          ]
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimRewards",
      "accounts": [
        {
          "name": "project",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "multipliers",
          "isMut": false,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "Multpliers state account"
          ]
        },
        {
          "name": "nft",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "NFT state account"
          ]
        },
        {
          "name": "rewardMint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Mint address of the reward token"
          ]
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Vault"
          ]
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Payee token account"
          ]
        },
        {
          "name": "staker",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staker state account"
          ]
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE TOKEN PROGRAM"
          ]
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SYSVAR CLOCK"
          ]
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "multipliers",
      "docs": [
        "The project multiplier state account"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "project",
            "docs": [
              "The project this multiplier is associated with"
            ],
            "type": "publicKey"
          },
          {
            "name": "decimals",
            "docs": [
              "The decimals for multipliers"
            ],
            "type": "u8"
          },
          {
            "name": "durationMultipliers",
            "docs": [
              "The duration multipliers for the project"
            ],
            "type": {
              "vec": {
                "defined": "Multiplier"
              }
            }
          },
          {
            "name": "countMultipliers",
            "docs": [
              "The duration multipliers for the project"
            ],
            "type": {
              "vec": {
                "defined": "Multiplier"
              }
            }
          },
          {
            "name": "creatorMultipliers",
            "docs": [
              "The duration multipliers for the project"
            ],
            "type": {
              "vec": {
                "defined": "Multiplier"
              }
            }
          },
          {
            "name": "collectionMultipliers",
            "docs": [
              "The duration multipliers for the project"
            ],
            "type": {
              "vec": {
                "defined": "Multiplier"
              }
            }
          }
        ]
      }
    },
    {
      "name": "nft",
      "docs": [
        "The staking account linked to the NFT"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "project",
            "docs": [
              "The project this NFT is staked in"
            ],
            "type": "publicKey"
          },
          {
            "name": "staker",
            "docs": [
              "wallet of the staker"
            ],
            "type": "publicKey"
          },
          {
            "name": "mint",
            "docs": [
              "The mint of the NFT"
            ],
            "type": "publicKey"
          },
          {
            "name": "creator",
            "docs": [
              "The verified creator of the NFT"
            ],
            "type": "publicKey"
          },
          {
            "name": "collection",
            "docs": [
              "The verified collection of the NFT"
            ],
            "type": "publicKey"
          },
          {
            "name": "lastClaim",
            "docs": [
              "Last time the owner claimed rewards"
            ],
            "type": "i64"
          },
          {
            "name": "stakedAt",
            "docs": [
              "Accumulated staked at"
            ],
            "type": "i64"
          },
          {
            "name": "lastStakedAt",
            "docs": [
              "Last staked at"
            ],
            "type": "i64"
          },
          {
            "name": "lastUnstakedAt",
            "docs": [
              "Last unstraked_at"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "project",
      "docs": [
        "The NFT collection project state account"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          },
          {
            "name": "key",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "docs": [
              "The wallet that has authority to modify the assembler"
            ],
            "type": "publicKey"
          },
          {
            "name": "rewardMint",
            "docs": [
              "The mint of the token distributed to stakers"
            ],
            "type": "publicKey"
          },
          {
            "name": "vault",
            "docs": [
              "The account owning tokens distributed to stakers"
            ],
            "type": "publicKey"
          },
          {
            "name": "lockType",
            "docs": [
              "Lock type { Freeze, Custody }"
            ],
            "type": {
              "defined": "LockType"
            }
          },
          {
            "name": "name",
            "docs": [
              "name of the project"
            ],
            "type": "string"
          },
          {
            "name": "rewardsPerDuration",
            "docs": [
              "The rewards per selected duration"
            ],
            "type": "u64"
          },
          {
            "name": "rewardsDuration",
            "docs": [
              "The duration of the rewards in seconds"
            ],
            "type": "u64"
          },
          {
            "name": "maxRewardsDuration",
            "docs": [
              "The maximum duration of the rewards in seconds"
            ],
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "minStakeDuration",
            "docs": [
              "The minimum stake duration in seconds"
            ],
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "cooldownDuration",
            "docs": [
              "Cooldown duration in seconds"
            ],
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "resetStakeDuration",
            "docs": [
              "Flag to reset stake duration on restaking"
            ],
            "type": "bool"
          },
          {
            "name": "allowedMints",
            "docs": [
              "Allowed mints only"
            ],
            "type": "bool"
          },
          {
            "name": "totalStaked",
            "docs": [
              "Total staked nfts"
            ],
            "type": "u64"
          },
          {
            "name": "startTime",
            "docs": [
              "The unix_timestamp when the statking starts"
            ],
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "endTime",
            "docs": [
              "The unix_timestamp when the statking ends"
            ],
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "collections",
            "docs": [
              "The collection mint addresses to be used for the project"
            ],
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "creators",
            "docs": [
              "The creator addresses to be used for the project"
            ],
            "type": {
              "vec": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "staker",
      "docs": [
        "The project multiplier state account"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "project",
            "docs": [
              "The project this multiplier is associated with"
            ],
            "type": "publicKey"
          },
          {
            "name": "wallet",
            "docs": [
              "The wallet that owns this staker account"
            ],
            "type": "publicKey"
          },
          {
            "name": "totalStaked",
            "docs": [
              "The total amount of tokens staked"
            ],
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "InitMultipliersArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "decimals",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "AddMultiplierArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "value",
            "type": "u64"
          },
          {
            "name": "multiplierType",
            "type": {
              "defined": "MultiplierType"
            }
          }
        ]
      }
    },
    {
      "name": "CreateProjectArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "lockType",
            "type": {
              "option": {
                "defined": "LockType"
              }
            }
          },
          {
            "name": "rewardsPerDuration",
            "type": "u64"
          },
          {
            "name": "rewardsDuration",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "maxRewardsDuration",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "minStakeDuration",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "cooldownDuration",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "resetStakeDuration",
            "type": {
              "option": "bool"
            }
          },
          {
            "name": "startTime",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "endTime",
            "type": {
              "option": "i64"
            }
          }
        ]
      }
    },
    {
      "name": "UpdateProjectArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "rewardsPerDuration",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "rewardsDuration",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "maxRewardsDuration",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "minStakeDuration",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "cooldownDuration",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "resetStakeDuration",
            "type": {
              "option": "bool"
            }
          },
          {
            "name": "startTime",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "endTime",
            "type": {
              "option": "i64"
            }
          }
        ]
      }
    },
    {
      "name": "Multiplier",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "value",
            "type": "u64"
          },
          {
            "name": "multiplierType",
            "type": {
              "defined": "MultiplierType"
            }
          }
        ]
      }
    },
    {
      "name": "MultiplierType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "StakeDuration",
            "fields": [
              {
                "name": "min_duration",
                "type": "u64"
              }
            ]
          },
          {
            "name": "NFTCount",
            "fields": [
              {
                "name": "min_count",
                "type": "u64"
              }
            ]
          },
          {
            "name": "Creator",
            "fields": [
              {
                "name": "creator",
                "type": "publicKey"
              }
            ]
          },
          {
            "name": "Collection",
            "fields": [
              {
                "name": "collection",
                "type": "publicKey"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "LockType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Freeze"
          },
          {
            "name": "Custoday"
          }
        ]
      }
    },
    {
      "name": "ValidateCollectionCreatorOutput",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Collection",
            "fields": [
              {
                "name": "address",
                "type": "publicKey"
              }
            ]
          },
          {
            "name": "Creator",
            "fields": [
              {
                "name": "address",
                "type": "publicKey"
              }
            ]
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Overflow",
      "msg": "Opertaion overflowed"
    },
    {
      "code": 6001,
      "name": "OnlyOwner",
      "msg": "Only the owner can perform this operation"
    },
    {
      "code": 6002,
      "name": "InvalidMetadata",
      "msg": "Invalid metadata"
    },
    {
      "code": 6003,
      "name": "InvalidNFT",
      "msg": "Invalid NFT"
    },
    {
      "code": 6004,
      "name": "RewardsNotAvailable",
      "msg": "Rewards not available yet"
    },
    {
      "code": 6005,
      "name": "CantStakeYet",
      "msg": "Can't stake yet"
    },
    {
      "code": 6006,
      "name": "CantUnstakeYet",
      "msg": "Can't unstake yet"
    },
    {
      "code": 6007,
      "name": "DepositAccountNotProvided",
      "msg": "Deposit account is not provided"
    }
  ]
};

export const IDL: Staking = {
  "version": "0.1.0",
  "name": "staking",
  "instructions": [
    {
      "name": "createProject",
      "accounts": [
        {
          "name": "key",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "project",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The wallet that holds the authority over the assembler"
          ]
        },
        {
          "name": "rewardMint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Reward mint address to be used for the project"
          ]
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Reward token account used as vault"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE SYSTEM PROGRAM"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL TOKEN PROGRAM"
          ]
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "CreateProjectArgs"
          }
        }
      ]
    },
    {
      "name": "updateProject",
      "accounts": [
        {
          "name": "project",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "newAuthority",
          "isMut": false,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "The wallet that holds the authority over the assembler"
          ]
        },
        {
          "name": "collection",
          "isMut": false,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "Collection mint address to be used for the project"
          ]
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "Creator address to be used for the project"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE SYSTEM PROGRAM"
          ]
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SYSVAR RENT"
          ]
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "UpdateProjectArgs"
          }
        }
      ]
    },
    {
      "name": "initMultipliers",
      "accounts": [
        {
          "name": "project",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "multipliers",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Multiplier state account"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE SYSTEM PROGRAM"
          ]
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "InitMultipliersArgs"
          }
        }
      ]
    },
    {
      "name": "addMultiplier",
      "accounts": [
        {
          "name": "project",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "multipliers",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Multiplier state account"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE SYSTEM PROGRAM"
          ]
        },
        {
          "name": "rentSysvar",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "RENT SYSVAR"
          ]
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "AddMultiplierArgs"
          }
        }
      ]
    },
    {
      "name": "initNft",
      "accounts": [
        {
          "name": "project",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "nft",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "NFT state account"
          ]
        },
        {
          "name": "nftMint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Mint address of the NFT"
          ]
        },
        {
          "name": "nftMetadata",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "NFT token metadata"
          ]
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE SYSTEM PROGRAM"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "initStaker",
      "accounts": [
        {
          "name": "project",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "staker",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staker state account"
          ]
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE SYSTEM PROGRAM"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "stake",
      "accounts": [
        {
          "name": "project",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "nft",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "NFT state account"
          ]
        },
        {
          "name": "nftMint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Mint address of the NFT"
          ]
        },
        {
          "name": "nftAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Token account of the NFT"
          ]
        },
        {
          "name": "nftMetadata",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "NFT token metadata"
          ]
        },
        {
          "name": "nftEdition",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "NFT edition"
          ]
        },
        {
          "name": "nftTokenRecord",
          "isMut": true,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "NFT token record"
          ]
        },
        {
          "name": "staker",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staker state account"
          ]
        },
        {
          "name": "depositAccount",
          "isMut": true,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "The account that will hold the nft sent on expedition"
          ]
        },
        {
          "name": "depositTokenRecord",
          "isMut": true,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "Deposit token_record"
          ]
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE SYSTEM PROGRAM"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE TOKEN PROGRAM"
          ]
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "ASSOCIATED TOKEN PROGRAM"
          ]
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "METAPLEX TOKEN METADATA PROGRAM"
          ]
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE CLOCK SYSVAR"
          ]
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE Instructions SYSVAR"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "project",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "nft",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "NFT state account"
          ]
        },
        {
          "name": "nftMint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Mint address of the NFT"
          ]
        },
        {
          "name": "nftAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Token account of the NFT"
          ]
        },
        {
          "name": "nftMetadata",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "NFT token metadata"
          ]
        },
        {
          "name": "nftEdition",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "NFT edition"
          ]
        },
        {
          "name": "nftTokenRecord",
          "isMut": true,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "NFT token record"
          ]
        },
        {
          "name": "depositAccount",
          "isMut": true,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "The account that will hold the nft sent on expedition"
          ]
        },
        {
          "name": "depositTokenRecord",
          "isMut": true,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "Deposit token_record"
          ]
        },
        {
          "name": "staker",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staker state account"
          ]
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE SYSTEM PROGRAM"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE TOKEN PROGRAM"
          ]
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "ASSOCIATED TOKEN PROGRAM"
          ]
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "METAPLEX TOKEN METADATA PROGRAM"
          ]
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE CLOCK SYSVAR"
          ]
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE Instructions SYSVAR"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "fundRewards",
      "accounts": [
        {
          "name": "project",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "rewardMint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Mint address of the reward token"
          ]
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Vault"
          ]
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Payee token account"
          ]
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE TOKEN PROGRAM"
          ]
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawRewards",
      "accounts": [
        {
          "name": "project",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "rewardMint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Mint address of the reward token"
          ]
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Vault"
          ]
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Payee token account"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE TOKEN PROGRAM"
          ]
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimRewards",
      "accounts": [
        {
          "name": "project",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Project state account"
          ]
        },
        {
          "name": "multipliers",
          "isMut": false,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "Multpliers state account"
          ]
        },
        {
          "name": "nft",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "NFT state account"
          ]
        },
        {
          "name": "rewardMint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Mint address of the reward token"
          ]
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Vault"
          ]
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Payee token account"
          ]
        },
        {
          "name": "staker",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Staker state account"
          ]
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for the rent"
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "NATIVE TOKEN PROGRAM"
          ]
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SYSVAR CLOCK"
          ]
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "multipliers",
      "docs": [
        "The project multiplier state account"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "project",
            "docs": [
              "The project this multiplier is associated with"
            ],
            "type": "publicKey"
          },
          {
            "name": "decimals",
            "docs": [
              "The decimals for multipliers"
            ],
            "type": "u8"
          },
          {
            "name": "durationMultipliers",
            "docs": [
              "The duration multipliers for the project"
            ],
            "type": {
              "vec": {
                "defined": "Multiplier"
              }
            }
          },
          {
            "name": "countMultipliers",
            "docs": [
              "The duration multipliers for the project"
            ],
            "type": {
              "vec": {
                "defined": "Multiplier"
              }
            }
          },
          {
            "name": "creatorMultipliers",
            "docs": [
              "The duration multipliers for the project"
            ],
            "type": {
              "vec": {
                "defined": "Multiplier"
              }
            }
          },
          {
            "name": "collectionMultipliers",
            "docs": [
              "The duration multipliers for the project"
            ],
            "type": {
              "vec": {
                "defined": "Multiplier"
              }
            }
          }
        ]
      }
    },
    {
      "name": "nft",
      "docs": [
        "The staking account linked to the NFT"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "project",
            "docs": [
              "The project this NFT is staked in"
            ],
            "type": "publicKey"
          },
          {
            "name": "staker",
            "docs": [
              "wallet of the staker"
            ],
            "type": "publicKey"
          },
          {
            "name": "mint",
            "docs": [
              "The mint of the NFT"
            ],
            "type": "publicKey"
          },
          {
            "name": "creator",
            "docs": [
              "The verified creator of the NFT"
            ],
            "type": "publicKey"
          },
          {
            "name": "collection",
            "docs": [
              "The verified collection of the NFT"
            ],
            "type": "publicKey"
          },
          {
            "name": "lastClaim",
            "docs": [
              "Last time the owner claimed rewards"
            ],
            "type": "i64"
          },
          {
            "name": "stakedAt",
            "docs": [
              "Accumulated staked at"
            ],
            "type": "i64"
          },
          {
            "name": "lastStakedAt",
            "docs": [
              "Last staked at"
            ],
            "type": "i64"
          },
          {
            "name": "lastUnstakedAt",
            "docs": [
              "Last unstraked_at"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "project",
      "docs": [
        "The NFT collection project state account"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          },
          {
            "name": "key",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "docs": [
              "The wallet that has authority to modify the assembler"
            ],
            "type": "publicKey"
          },
          {
            "name": "rewardMint",
            "docs": [
              "The mint of the token distributed to stakers"
            ],
            "type": "publicKey"
          },
          {
            "name": "vault",
            "docs": [
              "The account owning tokens distributed to stakers"
            ],
            "type": "publicKey"
          },
          {
            "name": "lockType",
            "docs": [
              "Lock type { Freeze, Custody }"
            ],
            "type": {
              "defined": "LockType"
            }
          },
          {
            "name": "name",
            "docs": [
              "name of the project"
            ],
            "type": "string"
          },
          {
            "name": "rewardsPerDuration",
            "docs": [
              "The rewards per selected duration"
            ],
            "type": "u64"
          },
          {
            "name": "rewardsDuration",
            "docs": [
              "The duration of the rewards in seconds"
            ],
            "type": "u64"
          },
          {
            "name": "maxRewardsDuration",
            "docs": [
              "The maximum duration of the rewards in seconds"
            ],
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "minStakeDuration",
            "docs": [
              "The minimum stake duration in seconds"
            ],
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "cooldownDuration",
            "docs": [
              "Cooldown duration in seconds"
            ],
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "resetStakeDuration",
            "docs": [
              "Flag to reset stake duration on restaking"
            ],
            "type": "bool"
          },
          {
            "name": "allowedMints",
            "docs": [
              "Allowed mints only"
            ],
            "type": "bool"
          },
          {
            "name": "totalStaked",
            "docs": [
              "Total staked nfts"
            ],
            "type": "u64"
          },
          {
            "name": "startTime",
            "docs": [
              "The unix_timestamp when the statking starts"
            ],
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "endTime",
            "docs": [
              "The unix_timestamp when the statking ends"
            ],
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "collections",
            "docs": [
              "The collection mint addresses to be used for the project"
            ],
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "creators",
            "docs": [
              "The creator addresses to be used for the project"
            ],
            "type": {
              "vec": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "staker",
      "docs": [
        "The project multiplier state account"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "project",
            "docs": [
              "The project this multiplier is associated with"
            ],
            "type": "publicKey"
          },
          {
            "name": "wallet",
            "docs": [
              "The wallet that owns this staker account"
            ],
            "type": "publicKey"
          },
          {
            "name": "totalStaked",
            "docs": [
              "The total amount of tokens staked"
            ],
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "InitMultipliersArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "decimals",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "AddMultiplierArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "value",
            "type": "u64"
          },
          {
            "name": "multiplierType",
            "type": {
              "defined": "MultiplierType"
            }
          }
        ]
      }
    },
    {
      "name": "CreateProjectArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "lockType",
            "type": {
              "option": {
                "defined": "LockType"
              }
            }
          },
          {
            "name": "rewardsPerDuration",
            "type": "u64"
          },
          {
            "name": "rewardsDuration",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "maxRewardsDuration",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "minStakeDuration",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "cooldownDuration",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "resetStakeDuration",
            "type": {
              "option": "bool"
            }
          },
          {
            "name": "startTime",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "endTime",
            "type": {
              "option": "i64"
            }
          }
        ]
      }
    },
    {
      "name": "UpdateProjectArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "rewardsPerDuration",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "rewardsDuration",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "maxRewardsDuration",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "minStakeDuration",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "cooldownDuration",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "resetStakeDuration",
            "type": {
              "option": "bool"
            }
          },
          {
            "name": "startTime",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "endTime",
            "type": {
              "option": "i64"
            }
          }
        ]
      }
    },
    {
      "name": "Multiplier",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "value",
            "type": "u64"
          },
          {
            "name": "multiplierType",
            "type": {
              "defined": "MultiplierType"
            }
          }
        ]
      }
    },
    {
      "name": "MultiplierType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "StakeDuration",
            "fields": [
              {
                "name": "min_duration",
                "type": "u64"
              }
            ]
          },
          {
            "name": "NFTCount",
            "fields": [
              {
                "name": "min_count",
                "type": "u64"
              }
            ]
          },
          {
            "name": "Creator",
            "fields": [
              {
                "name": "creator",
                "type": "publicKey"
              }
            ]
          },
          {
            "name": "Collection",
            "fields": [
              {
                "name": "collection",
                "type": "publicKey"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "LockType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Freeze"
          },
          {
            "name": "Custoday"
          }
        ]
      }
    },
    {
      "name": "ValidateCollectionCreatorOutput",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Collection",
            "fields": [
              {
                "name": "address",
                "type": "publicKey"
              }
            ]
          },
          {
            "name": "Creator",
            "fields": [
              {
                "name": "address",
                "type": "publicKey"
              }
            ]
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Overflow",
      "msg": "Opertaion overflowed"
    },
    {
      "code": 6001,
      "name": "OnlyOwner",
      "msg": "Only the owner can perform this operation"
    },
    {
      "code": 6002,
      "name": "InvalidMetadata",
      "msg": "Invalid metadata"
    },
    {
      "code": 6003,
      "name": "InvalidNFT",
      "msg": "Invalid NFT"
    },
    {
      "code": 6004,
      "name": "RewardsNotAvailable",
      "msg": "Rewards not available yet"
    },
    {
      "code": 6005,
      "name": "CantStakeYet",
      "msg": "Can't stake yet"
    },
    {
      "code": 6006,
      "name": "CantUnstakeYet",
      "msg": "Can't unstake yet"
    },
    {
      "code": 6007,
      "name": "DepositAccountNotProvided",
      "msg": "Deposit account is not provided"
    }
  ]
};
