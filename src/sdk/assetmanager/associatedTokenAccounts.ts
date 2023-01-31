import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { Metaplex } from "@metaplex-foundation/js";
import { TxSignersAccounts } from "../../types";
// import { Asset } from "../../generated";

// export const makeSureAsset = (
//   connection: web3.Connection,
//   asset: Asset | web3.PublicKey
// ): Promise<Asset> => {
//   if (asset instanceof Asset) return Promise.resolve(asset);
//   else return Asset.fromAccountAddress(connection, asset);
// };

export async function getAssociatedTokenAccountIntructions(
  mx: Metaplex,
  mints: web3.PublicKey[]
): Promise<{
  preTxns: TxSignersAccounts[];
  postTxns: TxSignersAccounts[];
}> {
  let wallet = mx.identity();
  const preTxns: TxSignersAccounts[] = [];
  const postTxns: TxSignersAccounts[] = [];
  for (let index = 0; index < mints.length; index++) {
    const mint = mints[index];
    const tokenAccountAddress = splToken.getAssociatedTokenAddressSync(
      mint,
      wallet.publicKey
    );
    const tokenAccount: splToken.Account | null = await splToken
      .getAccount(mx.connection, tokenAccountAddress)
      .catch((e) => null);

    if (!tokenAccount)
      preTxns.push({
        tx: new web3.Transaction().add(
          splToken.createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            tokenAccountAddress,
            wallet.publicKey,
            mint
          )
        ),
        accounts: [
          web3.SystemProgram.programId,
          wallet.publicKey,
          tokenAccountAddress,
          mint,
        ],
        signers: [],
      });

    if (!tokenAccount || !Number(tokenAccount.amount))
      postTxns.push({
        tx: new web3.Transaction().add(
          splToken.createCloseAccountInstruction(
            tokenAccountAddress,
            wallet.publicKey,
            wallet.publicKey
          )
        ),
        accounts: [
          web3.SystemProgram.programId,
          wallet.publicKey,
          tokenAccountAddress,
          mint,
        ],
        signers: [],
      });
  }

  return {
    preTxns,
    postTxns,
  };
}
