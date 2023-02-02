import * as beet from '@metaplex-foundation/beet';
import { DelegateAuthorityPermission } from './DelegateAuthorityPermission';
export type CreateDelegateAuthorityArgs = {
    permission: DelegateAuthorityPermission;
};
export declare const createDelegateAuthorityArgsBeet: beet.BeetArgsStruct<CreateDelegateAuthorityArgs>;
