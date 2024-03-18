/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from "@metaplex-foundation/beet";
import {
  HoldingAccountArgs,
  holdingAccountArgsBeet,
} from "./HoldingAccountArgs";

export type CraftBurnHoldingParams = {
  holdingState: HoldingAccountArgs;
  proofSize: number;
};

/**
 * @category userTypes
 * @category generated
 */
export const craftBurnHoldingParamsBeet =
  new beet.FixableBeetArgsStruct<CraftBurnHoldingParams>(
    [
      ["holdingState", holdingAccountArgsBeet],
      ["proofSize", beet.u8],
    ],
    "CraftBurnHoldingParams"
  );
