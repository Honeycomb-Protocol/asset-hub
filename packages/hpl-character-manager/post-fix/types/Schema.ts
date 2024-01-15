/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from "@metaplex-foundation/beet";
/**
 * This type is used to derive the {@link Schema} type as well as the de/serializer.
 * However don't refer to it in your code but use the {@link Schema} type instead.
 *
 * @category userTypes
 * @category enums
 * @category generated
 * @private
 */
export type SchemaRecord = {
  Null: void /* scalar variant */;
  Bool: void /* scalar variant */;
  Number: void /* scalar variant */;
  String: void /* scalar variant */;
  Array: { fields: [Schema] };
  Object: { fields: [Map<string, Schema>] };
  Pubkey: void /* scalar variant */;
  Option: { fields: [Schema] };
  HashMap: { fields: [Schema, Schema] };
};

/**
 * Union type respresenting the Schema data enum defined in Rust.
 *
 * NOTE: that it includes a `__kind` property which allows to narrow types in
 * switch/if statements.
 * Additionally `isSchema*` type guards are exposed below to narrow to a specific variant.
 *
 * @category userTypes
 * @category enums
 * @category generated
 */
export type Schema = beet.DataEnumKeyAsKind<SchemaRecord>;

export const isSchemaNull = (x: Schema): x is Schema & { __kind: "Null" } =>
  x.__kind === "Null";
export const isSchemaBool = (x: Schema): x is Schema & { __kind: "Bool" } =>
  x.__kind === "Bool";
export const isSchemaNumber = (x: Schema): x is Schema & { __kind: "Number" } =>
  x.__kind === "Number";
export const isSchemaString = (x: Schema): x is Schema & { __kind: "String" } =>
  x.__kind === "String";
export const isSchemaArray = (x: Schema): x is Schema & { __kind: "Array" } =>
  x.__kind === "Array";
export const isSchemaObject = (x: Schema): x is Schema & { __kind: "Object" } =>
  x.__kind === "Object";
export const isSchemaPubkey = (x: Schema): x is Schema & { __kind: "Pubkey" } =>
  x.__kind === "Pubkey";
export const isSchemaOption = (x: Schema): x is Schema & { __kind: "Option" } =>
  x.__kind === "Option";
export const isSchemaHashMap = (
  x: Schema
): x is Schema & { __kind: "HashMap" } => x.__kind === "HashMap";

const enumVariants: beet.DataEnumBeet<SchemaRecord, keyof SchemaRecord>[] = [
  ["Null", beet.unit],
  ["Bool", beet.unit],
  ["Number", beet.unit],
  ["String", beet.unit],
];

/**
 * @category userTypes
 * @category generated
 */
export const schemaBeet = beet.dataEnum<SchemaRecord>(
  enumVariants
) as beet.FixableBeet<Schema, Schema>;

enumVariants.push(
  [
    "Array",
    new beet.FixableBeetArgsStruct<SchemaRecord["Array"]>(
      [["fields", beet.tuple([schemaBeet])]],
      'SchemaRecord["Array"]'
    ),
  ],
  [
    "Object",
    new beet.FixableBeetArgsStruct<SchemaRecord["Object"]>(
      [["fields", beet.tuple([beet.map(beet.utf8String, schemaBeet)])]],
      'SchemaRecord["Object"]'
    ),
  ],
  ["Pubkey", beet.unit],
  [
    "Option",
    new beet.FixableBeetArgsStruct<SchemaRecord["Option"]>(
      [["fields", beet.tuple([schemaBeet])]],
      'SchemaRecord["Option"]'
    ),
  ],
  [
    "HashMap",
    new beet.FixableBeetArgsStruct<SchemaRecord["HashMap"]>(
      [["fields", beet.tuple([schemaBeet, schemaBeet])]],
      'SchemaRecord["HashMap"]'
    ),
  ]
);