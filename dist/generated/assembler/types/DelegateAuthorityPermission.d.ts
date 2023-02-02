import * as beet from '@metaplex-foundation/beet';
export declare enum DelegateAuthorityPermission {
    Master = 0,
    UpdateAssembler = 1,
    UpdateBlock = 2,
    UpdateBlockDefinition = 3,
    UpdateNFT = 4,
    InitialArtGeneration = 5
}
export declare const delegateAuthorityPermissionBeet: beet.FixedSizeBeet<DelegateAuthorityPermission, DelegateAuthorityPermission>;
