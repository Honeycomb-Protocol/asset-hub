export type Staking = {
    "version": "0.1.0";
    "name": "staking";
    "instructions": [
        {
            "name": "createProject";
            "accounts": [
                {
                    "name": "key";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "project";
                    "isMut": true;
                    "isSigner": false;
                    "docs": [
                        "Project state account"
                    ];
                },
                {
                    "name": "authority";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "The wallet that holds the authority over the assembler"
                    ];
                },
                {
                    "name": "rewardMint";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "Reward mint address to be used for the project"
                    ];
                },
                {
                    "name": "vault";
                    "isMut": true;
                    "isSigner": false;
                    "docs": [
                        "Reward token account used as vault"
                    ];
                },
                {
                    "name": "payer";
                    "isMut": true;
                    "isSigner": true;
                    "docs": [
                        "The wallet that pays for the rent"
                    ];
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "NATIVE SYSTEM PROGRAM"
                    ];
                },
                {
                    "name": "tokenProgram";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "SPL TOKEN PROGRAM"
                    ];
                }
            ];
            "args": [
                {
                    "name": "args";
                    "type": {
                        "defined": "CreateProjectArgs";
                    };
                }
            ];
        },
        {
            "name": "updatePoject";
            "accounts": [
                {
                    "name": "project";
                    "isMut": true;
                    "isSigner": false;
                    "docs": [
                        "Project state account"
                    ];
                },
                {
                    "name": "newAuthority";
                    "isMut": false;
                    "isSigner": false;
                    "isOptional": true;
                    "docs": [
                        "The wallet that holds the authority over the assembler"
                    ];
                },
                {
                    "name": "collection";
                    "isMut": false;
                    "isSigner": false;
                    "isOptional": true;
                    "docs": [
                        "Collection mint address to be used for the project"
                    ];
                },
                {
                    "name": "creator";
                    "isMut": false;
                    "isSigner": false;
                    "isOptional": true;
                    "docs": [
                        "Creator address to be used for the project"
                    ];
                },
                {
                    "name": "authority";
                    "isMut": true;
                    "isSigner": true;
                    "docs": [
                        "The wallet that pays for the rent"
                    ];
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "NATIVE SYSTEM PROGRAM"
                    ];
                },
                {
                    "name": "rent";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "SYSVAR RENT"
                    ];
                }
            ];
            "args": [
                {
                    "name": "args";
                    "type": {
                        "defined": "UpdateProjectArgs";
                    };
                }
            ];
        },
        {
            "name": "stake";
            "accounts": [
                {
                    "name": "project";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "Project state account"
                    ];
                },
                {
                    "name": "nft";
                    "isMut": true;
                    "isSigner": false;
                    "docs": [
                        "Reward token account used as vault"
                    ];
                },
                {
                    "name": "nftMint";
                    "isMut": true;
                    "isSigner": false;
                    "docs": [
                        "Mint address of the NFT"
                    ];
                },
                {
                    "name": "nftAccount";
                    "isMut": true;
                    "isSigner": false;
                    "docs": [
                        "Token account of the NFT"
                    ];
                },
                {
                    "name": "nftMetadata";
                    "isMut": true;
                    "isSigner": false;
                    "docs": [
                        "NFT token metadata"
                    ];
                },
                {
                    "name": "nftEdition";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "NFT edition"
                    ];
                },
                {
                    "name": "wallet";
                    "isMut": true;
                    "isSigner": true;
                    "docs": [
                        "The wallet that pays for the rent"
                    ];
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "NATIVE SYSTEM PROGRAM"
                    ];
                },
                {
                    "name": "tokenProgram";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "NATIVE TOKEN PROGRAM"
                    ];
                },
                {
                    "name": "tokenMetadataProgram";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "METAPLEX TOKEN METADATA PROGRAM"
                    ];
                },
                {
                    "name": "clock";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "NATIVE CLOCK SYSVAR"
                    ];
                },
                {
                    "name": "sysvarInstructions";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "NATIVE Instructions SYSVAR"
                    ];
                }
            ];
            "args": [];
        },
        {
            "name": "unstake";
            "accounts": [
                {
                    "name": "nft";
                    "isMut": true;
                    "isSigner": false;
                    "docs": [
                        "Reward token account used as vault"
                    ];
                },
                {
                    "name": "nftMint";
                    "isMut": true;
                    "isSigner": false;
                    "docs": [
                        "Mint address of the NFT"
                    ];
                },
                {
                    "name": "nftAccount";
                    "isMut": true;
                    "isSigner": false;
                    "docs": [
                        "Token account of the NFT"
                    ];
                },
                {
                    "name": "nftMetadata";
                    "isMut": true;
                    "isSigner": false;
                    "docs": [
                        "NFT token metadata"
                    ];
                },
                {
                    "name": "nftEdition";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "NFT edition"
                    ];
                },
                {
                    "name": "wallet";
                    "isMut": true;
                    "isSigner": true;
                    "docs": [
                        "The wallet that pays for the rent"
                    ];
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "NATIVE SYSTEM PROGRAM"
                    ];
                },
                {
                    "name": "tokenProgram";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "NATIVE TOKEN PROGRAM"
                    ];
                },
                {
                    "name": "tokenMetadataProgram";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "METAPLEX TOKEN METADATA PROGRAM"
                    ];
                },
                {
                    "name": "clock";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "NATIVE CLOCK SYSVAR"
                    ];
                },
                {
                    "name": "sysvarInstructions";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "NATIVE Instructions SYSVAR"
                    ];
                }
            ];
            "args": [];
        },
        {
            "name": "fundRewards";
            "accounts": [
                {
                    "name": "project";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "Project state account"
                    ];
                },
                {
                    "name": "rewardMint";
                    "isMut": true;
                    "isSigner": false;
                    "docs": [
                        "Mint address of the reward token"
                    ];
                },
                {
                    "name": "vault";
                    "isMut": true;
                    "isSigner": false;
                    "docs": [
                        "Vault"
                    ];
                },
                {
                    "name": "tokenAccount";
                    "isMut": true;
                    "isSigner": false;
                    "docs": [
                        "Payee token account"
                    ];
                },
                {
                    "name": "wallet";
                    "isMut": true;
                    "isSigner": true;
                    "docs": [
                        "The wallet that pays for the rent"
                    ];
                },
                {
                    "name": "tokenProgram";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "NATIVE TOKEN PROGRAM"
                    ];
                }
            ];
            "args": [
                {
                    "name": "amount";
                    "type": "u64";
                }
            ];
        },
        {
            "name": "claimRewards";
            "accounts": [
                {
                    "name": "project";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "Project state account"
                    ];
                },
                {
                    "name": "nft";
                    "isMut": true;
                    "isSigner": false;
                    "docs": [
                        "NFT state account"
                    ];
                },
                {
                    "name": "rewardMint";
                    "isMut": true;
                    "isSigner": false;
                    "docs": [
                        "Mint address of the reward token"
                    ];
                },
                {
                    "name": "vault";
                    "isMut": true;
                    "isSigner": false;
                    "docs": [
                        "Vault"
                    ];
                },
                {
                    "name": "tokenAccount";
                    "isMut": true;
                    "isSigner": false;
                    "docs": [
                        "Payee token account"
                    ];
                },
                {
                    "name": "wallet";
                    "isMut": true;
                    "isSigner": true;
                    "docs": [
                        "The wallet that pays for the rent"
                    ];
                },
                {
                    "name": "tokenProgram";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "NATIVE TOKEN PROGRAM"
                    ];
                },
                {
                    "name": "clock";
                    "isMut": false;
                    "isSigner": false;
                    "docs": [
                        "SYSVAR CLOCK"
                    ];
                }
            ];
            "args": [];
        }
    ];
    "accounts": [
        {
            "name": "nft";
            "docs": [
                "The staking account linked to the NFT"
            ];
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "bump";
                        "type": "u8";
                    },
                    {
                        "name": "project";
                        "docs": [
                            "The project this NFT is staked in"
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "staker";
                        "docs": [
                            "wallet of the staker"
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "mint";
                        "docs": [
                            "The mint of the NFT"
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "lastClaim";
                        "docs": [
                            "Last time the owner claimed rewards"
                        ];
                        "type": "i64";
                    }
                ];
            };
        },
        {
            "name": "project";
            "docs": [
                "The NFT collection project state account"
            ];
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "bump";
                        "type": "u8";
                    },
                    {
                        "name": "vaultBump";
                        "type": "u8";
                    },
                    {
                        "name": "key";
                        "type": "publicKey";
                    },
                    {
                        "name": "authority";
                        "docs": [
                            "The wallet that has authority to modify the assembler"
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "rewardMint";
                        "docs": [
                            "The mint of the token distributed to stakers"
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "vault";
                        "docs": [
                            "The account owning tokens distributed to stakers"
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "name";
                        "docs": [
                            "name of the project"
                        ];
                        "type": "string";
                    },
                    {
                        "name": "rewardsPerSecond";
                        "docs": [
                            "The rewards per second"
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "totalStaked";
                        "docs": [
                            "The total number of nfts currently staked."
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "startTime";
                        "docs": [
                            "The unix_timestamp when the statking starts"
                        ];
                        "type": "i64";
                    },
                    {
                        "name": "collections";
                        "docs": [
                            "The collection mint addresses to be used for the project"
                        ];
                        "type": {
                            "vec": "publicKey";
                        };
                    },
                    {
                        "name": "creators";
                        "docs": [
                            "The creator addresses to be used for the project"
                        ];
                        "type": {
                            "vec": "publicKey";
                        };
                    }
                ];
            };
        }
    ];
    "types": [
        {
            "name": "CreateProjectArgs";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "name";
                        "type": "string";
                    },
                    {
                        "name": "rewardsPerSecond";
                        "type": "u64";
                    },
                    {
                        "name": "startTime";
                        "type": "i64";
                    }
                ];
            };
        },
        {
            "name": "UpdateProjectArgs";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "name";
                        "type": {
                            "option": "string";
                        };
                    },
                    {
                        "name": "rewardsPerSecond";
                        "type": {
                            "option": "u64";
                        };
                    },
                    {
                        "name": "startTime";
                        "type": {
                            "option": "i64";
                        };
                    }
                ];
            };
        }
    ];
    "errors": [
        {
            "code": 6000;
            "name": "Overflow";
            "msg": "Opertaion overflowed";
        },
        {
            "code": 6001;
            "name": "InvalidMetadata";
            "msg": "Invalid metadata";
        },
        {
            "code": 6002;
            "name": "InvalidNFT";
            "msg": "Invalid NFT";
        }
    ];
};
export declare const IDL: Staking;
