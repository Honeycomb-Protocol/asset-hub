const path = require("path");
require("dotenv").config();

const primitiveTypes = ["bool", "string", "u8", "u16", "u32", "u64", "u128"];

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
              name: "Or",
              fields: [
                {
                  vec: {
                    defined: variantedName,
                  },
                },
              ],
            },
            {
              name: "And",
              fields: [
                {
                  vec: {
                    defined: variantedName,
                  },
                },
              ],
            },
          ],
        },
      },
    ];
  });
};

const createConfig = (name, programId) => {
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
    idlHook: (idl) => {
      const variantsOfConditinal = {};
      const okTypes = (type) => {
        if (type.defined.startsWith("Conditional<")) {
          let args = type.defined.slice(12, -1);
          type.defined = "Conditional" + args;
          variantsOfConditinal[args] = type.defined;
        } else if (type.defined.includes("HashMap")) {
          type = {
            hashMap: [
              "string",
              {
                defined: type.defined.split(",")[1].slice(0, -1),
              },
            ],
          };
        }
        return type;
      };

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

      idl.types = idl.types
        .map((type) => {
          if (["Condition", "Conditional"].includes(type.name)) return null;

          if (type.type.fields) {
            type.type.fields = type.type.fields.map((field) => {
              if (field.type.defined) {
                field.type = okTypes(field.type);
              } else if (field.type.vec?.defined) {
                field.type.vec = okTypes(field.type.vec);
              }
              return field;
            });
          } else if (type.type.variants) {
            type.type.variants = type.type.variants.map((variant) => {
              if (variant.fields) {
                variant.fields = variant.fields.map((field) => {
                  if (field.type?.defined) {
                    field.type = okTypes(field.type);
                  } else if (field.type?.vec?.defined) {
                    field.type.vec = okTypes(field.type.vec);
                  } else if (field.defined) {
                    field = okTypes(field);
                  }

                  return field;
                });
              }
              return variant;
            });
          }

          return type;
        })
        .filter((x) => !!x)
        .concat(...getVariantedConditionalTypes(variantsOfConditinal));

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
  "currency-manager": createConfig(
    "currency-manager",
    "CrncyaGmZfWvpxRcpHEkSrqeeyQsdn4MAedo9KuARAc4"
  ),
  "payment-manager": createConfig(
    "payment-manager",
    "Pay9ZxrVRXjt9Da8qpwqq4yBRvvrfx3STWnKK4FstPr"
  ),
};

const defaultProgram = Object.keys(configs)[0];

module.exports = configs[process.env.PROGRAM_NAME || defaultProgram];
