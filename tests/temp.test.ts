import fs from "fs";
import path from "path";
import { Honeycomb, Operation } from "@honeycomb-protocol/hive-control";
import getHoneycombs from "../scripts/prepare";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  Currency,
  HolderAccount,
  createFixHolderAccountInstruction,
  currencyDiscriminator,
  currencyManagerPdas,
  holderAccountDiscriminator,
} from "../packages/hpl-currency-manager";
jest.setTimeout(200000);

const authority = Keypair.fromSecretKey(
  Uint8Array.from(require(process.env.AUTHORITY || "./random-key.json"))
);

describe("Currency Manager", () => {
  let adminHC: Honeycomb;

  it("Prepare", async () => {
    const honeycombs = await getHoneycombs();
    adminHC = honeycombs.adminHC;

    adminHC.pda().register(currencyManagerPdas());
  });

  it("Fix Holder Account", async () => {
    const currencies = new Map<String, Currency>();
    await Currency.gpaBuilder()
      .addFilter("accountDiscriminator", currencyDiscriminator)
      .run(adminHC.connection)
      .then((x) =>
        x.forEach((y) => {
          try {
            currencies.set(
              y.pubkey.toString(),
              Currency.fromAccountInfo(y.account)[0]
            );
          } catch {
            return null;
          }
        })
      );

    const holderAccounts = await HolderAccount.gpaBuilder()
      .addFilter("accountDiscriminator", holderAccountDiscriminator)
      .run(adminHC.connection)
      .then(
        (x) =>
          x
            .map((y) => {
              try {
                const account = HolderAccount.fromAccountInfo(y.account)[0];
                return {
                  address: y.pubkey,
                  account,
                  currency: currencies.get(account.currency.toString()),
                };
              } catch {
                return null;
              }
            })
            .filter((x) => x !== null && !!x.currency) as {
            address: PublicKey;
            account: HolderAccount;
            currency: Currency;
          }[]
      );

    const operations = holderAccounts.map((x) => {
      const mint = x.currency.mint;
      const currency = x.account.currency;
      const holderAccount = x.address;
      const tokenAccount = x.account.tokenAccount;
      return new Operation(
        adminHC,
        [
          createFixHolderAccountInstruction({
            mint,
            currency,
            holderAccount,
            tokenAccount,
            authority: authority.publicKey,
          }),
        ],
        [authority]
      );
    });

    await Operation.sendBulk(adminHC, operations, {
      batchSize: 17,
      commitment: "processed",
      preflightCommitment: "processed",
      statusUpdate(status) {
        console.log(status);
      },
    });
  });
});
