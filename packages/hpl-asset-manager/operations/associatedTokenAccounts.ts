import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { Honeycomb, OperationCtx } from "@honeycomb-protocol/hive-control";

export async function getAssociatedTokenAccountIntructions(
  honeycomb: Honeycomb,
  mints: web3.PublicKey[]
): Promise<{
  preTxns: OperationCtx[];
  postTxns: OperationCtx[];
}> {
  let wallet = honeycomb.identity();
  const preTxns: OperationCtx[] = [];
  const postTxns: OperationCtx[] = [];
  for (let index = 0; index < mints.length; index++) {
    const mint = mints[index];
    const tokenAccountAddress = splToken.getAssociatedTokenAddressSync(
      mint,
      wallet.publicKey
    );
    const tokenAccount: splToken.Account | null = await splToken
      .getAccount(honeycomb.connection, tokenAccountAddress)
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
