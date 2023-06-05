import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { Honeycomb, Operation } from "@honeycomb-protocol/hive-control";

export async function getAssociatedTokenAccountIntructions(
  honeycomb: Honeycomb,
  mints: web3.PublicKey[]
): Promise<{
  preTxns: Operation[];
  postTxns: Operation[];
}> {
  let wallet = honeycomb.identity();
  const preTxns: Operation[] = [];
  const postTxns: Operation[] = [];
  for (let index = 0; index < mints.length; index++) {
    const mint = mints[index];
    const tokenAccountAddress = splToken.getAssociatedTokenAddressSync(
      mint,
      wallet.address
    );
    const tokenAccount: splToken.Account | null = await splToken
      .getAccount(honeycomb.connection, tokenAccountAddress)
      .catch((e) => null);

    if (!tokenAccount)
      preTxns.push(
        new Operation(honeycomb, [
          splToken.createAssociatedTokenAccountInstruction(
            wallet.address,
            tokenAccountAddress,
            wallet.address,
            mint
          ),
        ])
      );

    if (!tokenAccount || !Number(tokenAccount.amount))
      postTxns.push(
        new Operation(honeycomb, [
          splToken.createCloseAccountInstruction(
            tokenAccountAddress,
            wallet.address,
            wallet.address
          ),
        ])
      );
  }

  return {
    preTxns,
    postTxns,
  };
}
