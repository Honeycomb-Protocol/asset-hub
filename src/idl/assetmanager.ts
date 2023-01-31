export type Assetmanager = {
  "version": "0.1.0",
  "name": "assetmanager",
  "instructions": [
    {
      "name": "createAsset",
      "accounts": [
        {
          "name": "mint",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Mint of the asset"
          ]
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Metadata account of the asset"
          ]
        },
        {
          "name": "asset",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for everything."
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The system program."
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL TOKEN PROGRAM"
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
            "defined": "CreateAssetArgs"
          }
        }
      ]
    },
    {
      "name": "mintAsset",
      "accounts": [
        {
          "name": "asset",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The asset state account."
          ]
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Mint of the asset"
          ]
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The token account of user wallet."
          ]
        },
        {
          "name": "candyGuard",
          "isMut": false,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "Candy guard address of the asset"
          ]
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet holds the complete authority over the asset manager."
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
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "asset",
      "docs": [
        "The Asset."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "owner",
            "docs": [
              "The asset manager this asset is associated to"
            ],
            "type": "publicKey"
          },
          {
            "name": "candyGuard",
            "docs": [
              "Candy Guard address if any"
            ],
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "mint",
            "docs": [
              "The mint address of this Asset"
            ],
            "type": "publicKey"
          },
          {
            "name": "itemsRedeemed",
            "docs": [
              "Total items minted"
            ],
            "type": "u64"
          },
          {
            "name": "uri",
            "docs": [
              "The uri of the metadata of the Asset"
            ],
            "type": "string"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "CreateAssetArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "candyGuard",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "UnauthorizedMint",
      "msg": "Unauthorized to mints"
    }
  ]
};

export const IDL: Assetmanager = {
  "version": "0.1.0",
  "name": "assetmanager",
  "instructions": [
    {
      "name": "createAsset",
      "accounts": [
        {
          "name": "mint",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Mint of the asset"
          ]
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Metadata account of the asset"
          ]
        },
        {
          "name": "asset",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet that pays for everything."
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The system program."
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL TOKEN PROGRAM"
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
            "defined": "CreateAssetArgs"
          }
        }
      ]
    },
    {
      "name": "mintAsset",
      "accounts": [
        {
          "name": "asset",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The asset state account."
          ]
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Mint of the asset"
          ]
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The token account of user wallet."
          ]
        },
        {
          "name": "candyGuard",
          "isMut": false,
          "isSigner": false,
          "isOptional": true,
          "docs": [
            "Candy guard address of the asset"
          ]
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The wallet holds the complete authority over the asset manager."
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
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "asset",
      "docs": [
        "The Asset."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "owner",
            "docs": [
              "The asset manager this asset is associated to"
            ],
            "type": "publicKey"
          },
          {
            "name": "candyGuard",
            "docs": [
              "Candy Guard address if any"
            ],
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "mint",
            "docs": [
              "The mint address of this Asset"
            ],
            "type": "publicKey"
          },
          {
            "name": "itemsRedeemed",
            "docs": [
              "Total items minted"
            ],
            "type": "u64"
          },
          {
            "name": "uri",
            "docs": [
              "The uri of the metadata of the Asset"
            ],
            "type": "string"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "CreateAssetArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "candyGuard",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "UnauthorizedMint",
      "msg": "Unauthorized to mints"
    }
  ]
};
