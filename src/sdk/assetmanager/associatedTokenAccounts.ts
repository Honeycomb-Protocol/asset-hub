import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { Metaplex } from "@metaplex-foundation/js";
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
  preInstructions: web3.TransactionInstruction[];
  postTransactions: web3.TransactionInstruction[];
}> {
  let wallet = mx.identity();
  const preInstructions: web3.TransactionInstruction[] = [];
  const postTransactions: web3.TransactionInstruction[] = [];
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
      preInstructions.push(
        splToken.createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          tokenAccountAddress,
          wallet.publicKey,
          mint
        )
      );

    if (!tokenAccount || !Number(tokenAccount.amount))
      postTransactions.push(
        splToken.createCloseAccountInstruction(
          tokenAccountAddress,
          wallet.publicKey,
          wallet.publicKey
        )
      );
  }

  return {
    preInstructions,
    postTransactions,
  };
}
