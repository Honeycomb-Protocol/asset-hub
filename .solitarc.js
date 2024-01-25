const path = require("path");
require("dotenv").config();

const defaultTypes = [
  "String",
  "bool",
  "string",
  "u8",
  "u16",
  "u32",
  "u64",
  "u128",
];

const undefinedTypes = ["HashMap", "Node", "Wallets", "ProfileData"];

const stringToType = (strType) => {
  let type;

  if (defaultTypes.includes(strType)) {
    type = strType.toLowerCase();
  } else if (strType.startsWith("Vec<")) {
    type = {
      vec: stringToType(strType.split("<")[1].slice(0, -1)),
    };
  } else if (strType.startsWith("Option<")) {
    type = {
      option: stringToType(strType.split("<")[1].slice(0, -1)),
    };
  } else if (strType.startsWith("HashMap<")) {
    const [key, mapValue] = strType
      .replaceAll("HashMap<", "")
      .slice(0, -1)
      .split(",");
    type = {
      hashMap: [stringToType(key), stringToType(mapValue)],
    };
  } else if (strType === "Node") {
    type = {
      array: ["u8", 32],
    };
  } else if (strType === "Wallets") {
    type = {
      vec: "publicKey",
    };
  } else if (strType === "ProfileData") {
    type = {
      hashMap: ["string", { vec: "string" }],
    };
  } else {
    type = { defined: strType };
  }

  return type;
};

const mapType = (type) => {
  if (
    undefinedTypes.includes(type.defined) ||
    type.defined?.includes("HashMap")
  ) {
    type = stringToType(type.defined);
  } else if (type.option) {
    type = {
      option: mapType(type.option),
    };
  } else if (type.vec) {
    type = {
      vec: mapType(type.vec),
    };
  }

  return type;
};

const mapTypes = (type) => {
  if (type.type.fields)
    type.type.fields = type.type.fields.map((field) => {
      field.type = mapType(field.type);
      return field;
    });

  if (type.type.variants)
    type.type.variants = type.type.variants.map((variant) => {
      if (variant.fields)
        variant.fields = variant.fields.map((field) => {
          if (field.defined) field = mapType(field);
          if (field.type) field.type = mapType(field.type);
          return field;
        });
      return variant;
    });

  return type;
};

const createConfig = (name, programId, customs) => {
  const packageName = "hpl-" + name;
  const programName = "hpl_" + name.replaceAll(/-/g, "_");

  return {
    idlGenerator: "anchor",
    programName,
    programId: programId,
    idlDir: path.join(__dirname, "packages", packageName),
    sdkDir: path.join(__dirname, "packages", packageName, "generated"),
    binaryInstallDir: path.join(__dirname, ".crates"),
    programDir: path.join(__dirname, "programs", packageName),
    removeExistingIdl: false,
    rustbin: {
      versionRangeFallback: "0.29.0",
    },
    idlHook: (idl) => {
      customs?.types && idl.types.push(...customs.types);
      idl.types = idl.types.map(mapTypes);

      idl.accounts = idl.accounts.map((account) => {
        account.type.fields = account.type.fields.map((field) => {
          if (field.type.defined) {
            field.type = okTypes(field.type);
          } else if (field.type.vec?.defined) {
            field.type.vec = okTypes(field.type.vec);
          }
          return field;
        });

        return account;
      });

      // idl.types = idl.types
      //   .map((type) => {
      //     if (["Condition", "Conditional"].includes(type.name)) return null;

      //     if (type.type.fields) {
      //       type.type.fields = type.type.fields.map((field) => {
      //         if (field.type.defined) {
      //           field.type = okTypes(field.type);
      //         } else if (field.type.vec?.defined) {
      //           field.type.vec = okTypes(field.type.vec);
      //         }
      //         return field;
      //       });
      //     } else if (type.type.variants) {
      //       type.type.variants = type.type.variants.map((variant) => {
      //         if (variant.fields) {
      //           variant.fields = variant.fields.map((field) => {
      //             if (field.type?.defined) {
      //               field.type = okTypes(field.type);
      //             } else if (field.type?.vec?.defined) {
      //               field.type.vec = okTypes(field.type.vec);
      //             } else if (field.defined) {
      //               field = okTypes(field);
      //             }

      //             return field;
      //           });
      //         }
      //         return variant;
      //       });
      //     }

      //     return type;
      //   })
      //   .filter((x) => !!x)
      //   .concat(...getVariantedConditionalTypes(variantsOfConditinal));

      return idl;
    },
  };
};

const configs = {
  "asset-assembler": createConfig(
    "asset-assembler",
    "Gq1333CkB2sGernk72TKfDVLnHj9LjmeijFujM2ULxJz"
  ),
  "asset-manager": createConfig(
    "asset-manager",
    "7cJdKSjPtZqiGV4CFAGtbhhpf5CsYjbkbEkLKcXfHLYd"
  ),
  "character-manager": createConfig(
    "character-manager",
    "ChRCtrG7X5kb9YncA4wuyD68DXXL8Szt3zBCCGiioBTg",
    {
      types: [
        {
          name: "ControlledMerkleTrees",
          type: {
            kind: "struct",
            fields: [
              {
                name: "active",
                type: "u8",
              },
              {
                name: "schema",
                type: {
                  defined: "Schema",
                },
              },
              {
                name: "merkleTrees",
                type: {
                  vec: "publicKey",
                },
              },
            ],
          },
        },
        {
          name: "Schema",
          type: {
            kind: "enum",
            variants: [
              {
                name: "Null",
              },
              {
                name: "Bool",
              },
              {
                name: "Number",
              },
              {
                name: "String",
              },
              {
                name: "Array",
                fields: [
                  {
                    defined: "Schema",
                  },
                ],
              },
              {
                name: "Object",
                fields: [
                  {
                    hashMap: [
                      "string",
                      {
                        defined: "Schema",
                      },
                    ],
                  },
                ],
              },
              {
                name: "Pubkey",
              },
              {
                name: "Option",
                fields: [
                  {
                    defined: "Schema",
                  },
                ],
              },
              {
                name: "HashMap",
                fields: [
                  {
                    defined: "Schema",
                  },
                  {
                    defined: "Schema",
                  },
                ],
              },
              {
                name: "Enum",
                fields: [
                  {
                    vec: {
                      tuple: [
                        "string",
                        {
                          defined: "Schema",
                        },
                      ],
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          name: "CharacterSchema",
          type: {
            kind: "struct",
            fields: [
              {
                name: "owner",
                type: "publicKey",
              },
              {
                name: "source",
                type: {
                  defined: "CharacterSource",
                },
              },
              {
                name: "usedBy",
                type: {
                  defined: "CharacterUsedBy",
                },
              },
            ],
          },
        },
      ],
    }
  ),
  "currency-manager": createConfig(
    "currency-manager",
    "CrncyaGmZfWvpxRcpHEkSrqeeyQsdn4MAedo9KuARAc4"
  ),
  "payment-manager": createConfig(
    "payment-manager",
    "Pay9ZxrVRXjt9Da8qpwqq4yBRvvrfx3STWnKK4FstPr"
  ),
  "resource-manager": createConfig(
    "resource-manager",
    "L9A9ZxrVRXjt9Da8qpwqq4yBRvvrfx3STWnKK4FstPr"
  ),
};

const defaultProgram = Object.keys(configs)[4];
module.exports = configs[process.env.PROGRAM_NAME || defaultProgram];
