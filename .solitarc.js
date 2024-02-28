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

const undefinedTypes = ["HashMap", "Node", "Conditional", "DataOrHash"];

const generatedTypes = new Map();

const getVariantedConditionalTypes = (variants) => {
  return Object.entries(variants).flatMap(([arg, variantedName]) => {
    return [
      {
        name: variantedName,
        docs: [
          "Represents payment information with support for nested conditions.",
        ],
        type: {
          kind: "enum",
          variants: [
            {
              name: "None",
            },
            {
              name: "Item",
              fields: [primitiveTypes.includes(arg) ? arg : { defined: arg }],
            },
            {
              name: "Condition",
              fields: [
                {
                  defined: "Condition" + arg,
                },
              ],
            },
          ],
        },
      },
      {
        name: "Condition" + arg,
        docs: ["Represents a condition type (AND or OR)."],
        type: {
          kind: "struct",
          fields: [
            {
              name: "condition",
              type: {
                defined: "ConditionKind",
              },
            },
            {
              name: "items",
              type: {
                vec: {
                  defined: variantedName,
                },
              },
            },
          ],
        },
      },
    ];
  });
};

const stringToType = (strType) => {
  let type;

  if (defaultTypes.includes(strType)) {
    type = strType.toLowerCase();
  } else if (strType.startsWith("Vec<")) {
    type = {
      vec: stringToType(strType.slice(4, -1)),
    };
  } else if (strType.startsWith("Option<")) {
    type = {
      option: stringToType(strType.slice(7, -1)),
    };
  } else if (strType === "Node") {
    type = {
      array: ["u8", 32],
    };
  } else if (strType.startsWith("HashMap<")) {
    const [key, mapValue] = strType.slice(8, -1).split(",");
    type = {
      hashMap: [stringToType(key), stringToType(mapValue)],
    };
  } else if (strType.startsWith("Conditional<")) {
    const innerType = strType.slice(12, -1);
    const typeName =
      "Conditional" + innerType[0].toUpperCase() + innerType.slice(1);
    type = {
      defined: typeName,
    };
    generatedTypes.set(typeName, {
      name: typeName,
      type: {
        kind: "enum",
        variants: [
          {
            name: "None",
          },
          {
            name: "Item",
            fields: [stringToType(innerType)],
          },
          {
            name: "Or",
            fields: [
              {
                vec: {
                  defined: typeName,
                },
              },
            ],
          },
          {
            name: "And",
            fields: [
              {
                vec: {
                  defined: typeName,
                },
              },
            ],
          },
        ],
      },
    });
  } else if (strType.startsWith("DataOrHash<")) {
    const innerType = strType.slice(11, -1);
    const typeName =
      "DataOrHash" + innerType[0].toUpperCase() + innerType.slice(1);
    type = {
      defined: typeName,
    };
    generatedTypes.set(typeName, {
      name: typeName,
      type: {
        kind: "enum",
        variants: [
          {
            name: "Data",
            fields: [
              {
                defined: innerType,
              },
            ],
          },
          {
            name: "Hash",
            fields: [
              {
                array: ["u8", 32],
              },
            ],
          },
        ],
      },
    });
  } else {
    type = { defined: strType };
  }

  return type;
};

const mapType = (type) => {
  if (
    undefinedTypes.includes(type.defined) ||
    !!undefinedTypes.find((t) => type.defined?.includes(t))
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
      idl.accounts = idl.accounts.map(mapTypes);

      customs?.types && idl.types.push(...customs.types);
      idl.types = idl.types.map(mapTypes);
      idl.types = idl.types.filter(
        (type) => !undefinedTypes.includes(type.name)
      );
      idl.types.push(...Array.from(generatedTypes.values()));

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
    "Assetw8uxLogzVXic5P8wGYpVdesS1oZHfSnBFHAu42s",
    {
      types: [
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
          name: "Holding",
          docs: ["Resource holding state"],
          type: {
            kind: "enum",
            variants: [
              {
                name: "Fungible",
                fields: [
                  {
                    name: "holder",
                    type: "publicKey",
                  },
                  {
                    name: "balance",
                    type: "u64",
                  },
                ],
              },
              {
                name: "INF",
                fields: [
                  {
                    name: "holder",
                    type: {
                      defined: "NonFungibleHolder",
                    },
                  },
                  {
                    name: "characteristics",
                    type: {
                      hashMap: ["string", "string"],
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    }
  ),
};

const defaultProgram = Object.keys(configs)[0];
module.exports = configs[process.env.PROGRAM_NAME || defaultProgram];
