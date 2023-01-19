export * from './Assembler'
export * from './Block'
export * from './BlockDefinitionBoolean'
export * from './BlockDefinitionEnum'
export * from './BlockDefinitionNumber'
export * from './NFT'
export * from './NFTAttribute'

import { Assembler } from './Assembler'
import { Block } from './Block'
import { BlockDefinitionEnum } from './BlockDefinitionEnum'
import { BlockDefinitionBoolean } from './BlockDefinitionBoolean'
import { BlockDefinitionNumber } from './BlockDefinitionNumber'
import { NFT } from './NFT'
import { NFTAttribute } from './NFTAttribute'

export const accountProviders = {
  Assembler,
  Block,
  BlockDefinitionEnum,
  BlockDefinitionBoolean,
  BlockDefinitionNumber,
  NFT,
  NFTAttribute,
}
