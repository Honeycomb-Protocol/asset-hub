import { AssemblingAction, BlockType } from "../generated"

export type AssemblerConfig = {
    name: string
    symbol: string
    description: string
    assemblingAction: string
    base_url: string
    blocks: BlockConfig[]
    assemblerAddress?: string
    assetProject?: string
}

export type BlockConfig = {
    name: string
    order: number
    type: string
    isGraphical?: boolean
    definitions: BlockDefinitionConfig[]
    address?: string
}

export type BlockDefinitionConfig = {
    value: string
    mintAddress?: string
    collection?: string
    assetConfig?: AssetConfig
    address?: string
}

export type AssetConfig = {
    symbol: string;
    image?: string
    json?: any
    uri?: string
    candyGuard?: string
    address?: string
}