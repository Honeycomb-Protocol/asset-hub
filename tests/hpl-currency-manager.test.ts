import * as web3 from "@solana/web3.js";
import {
  Honeycomb,
  HoneycombProject,
  Operation,
} from "@honeycomb-protocol/hive-control";
import {
  Currency,
  HolderAccount,
  HolderStatus,
  HplCurrency,
  PermissionedCurrencyKind,
  findProjectCurrencies,
} from "../packages/hpl-currency-manager";
import { prepare } from "./prepare";
import {
  Metaplex,
  walletAdapterIdentity,
  keypairIdentity,
  token as tokenAmount,
} from "@metaplex-foundation/js";
jest.setTimeout(200000);

describe("Currency Manager", () => {
  let honeycomb: Honeycomb;
  let metaplex: Metaplex;

  it("Prepare", async () => {
    const temp = await prepare();
    honeycomb = temp.honeycomb;
    console.log(
      "address",
      honeycomb.identity().address.toString(),
      honeycomb.connection.rpcEndpoint
    );

    metaplex = new Metaplex(honeycomb.connection);
    // metaplex.use(keypairIdentity(temp.signer));
    metaplex.use(
      walletAdapterIdentity({
        ...honeycomb.identity(),
        publicKey: honeycomb.identity().address,
      })
    );

    const balance = await honeycomb
      .rpc()
      .getBalance(honeycomb.identity().address);
    expect(balance).toBeGreaterThanOrEqual(web3.LAMPORTS_PER_SOL * 0.1);
  });

  it("Temp", async () => {
    // const project = await HoneycombProject.fromAddress(
    //   honeycomb.connection,
    //   new web3.PublicKey("7CKTHsJ3EZqChNf3XGt9ytdZXvSzDFWmrQJL3BCe4Ppw")
    // );
    // honeycomb.use(project);
    // await findProjectCurrencies(project);
    // console.log(honeycomb._currencies);

    const currencies = (await Currency.gpaBuilder()
      .run(honeycomb.connection)
      .then((x) =>
        x
          .map((y) => {
            try {
              return [y.pubkey, Currency.fromAccountInfo(y.account)[0]] as [
                web3.PublicKey,
                Currency
              ];
            } catch {
              return null;
            }
          })
          .filter((x) => !!x)
      )) as [web3.PublicKey, Currency][];
    console.log("Currencies", currencies.length);

    // for (let currency of currencies) {
    //   await new Operation(honeycomb, [
    //     createUpgradeCurrencyInstruction({
    //       project: currency[1].project,
    //       currency: currency[0],
    //       authority: honeycomb.identity().address,
    //       payer: honeycomb.identity().address,
    //       rentSysvar: web3.SYSVAR_RENT_PUBKEY,
    //     }),
    //   ]).send({ skipPreflight: true });
    //   console.log("Currency", currency[0].toString());
    //   break;
    // }

    console.log("Doe");

    // await HolderAccount.gpaBuilder()
    //   .run(honeycomb.connection)
    //   .then((x) =>
    //     x
    //       .map((y) => {
    //         try {
    //           return HolderAccount.fromAccountInfo(y.account);
    //         } catch {
    //           return null;
    //         }
    //       })
    //       .filter((x) => !!x)
    //   )
    //   .then((x) => console.log("Holder Accounts", x.length));
  });

  it.skip("Create Project and currency", async () => {
    // Create project
    honeycomb.use(
      await HoneycombProject.new(honeycomb, {
        name: "TestProject",
        expectedMintAddresses: 1,
        profileDataConfigs: [],
      })
    );
    expect(honeycomb.project().name).toBe("TestProject");

    honeycomb.use(
      await HplCurrency.new(honeycomb, {
        kind: PermissionedCurrencyKind.Custodial,
        decimals: 9,
        name: "TestCoin",
        symbol: "TSC",
        uri: "https://arweave.net/QPC6FYdUn-3V8ytFNuoCS85S2tHAuiDblh6u3CIZLsw",
      })
    );
  });

  it.skip("Create holder account and mint", async () => {
    const holderAccount = await honeycomb
      .currency()
      .create()
      .holderAccount(honeycomb.identity().address);
    await holderAccount.mint(1000_000_000_000);
  });

  it.skip("Burn tokens", async () => {
    const holderAccount = await honeycomb.currency().holderAccount();
    await holderAccount.burn(100_000_000_000);
  });

  it.skip("Transfer tokens", async () => {
    const randomKey = web3.Keypair.generate();
    const newHolderAccount = await honeycomb
      .currency()
      .create()
      .holderAccount(randomKey.publicKey);

    const holderAccount = await honeycomb.currency().holderAccount();
    await holderAccount.transfer(100_000_000_000, newHolderAccount, {
      skipPreflight: true,
    });
  });

  it.skip("Delegate and Revoke Delegate", async () => {
    const holderAccount = await honeycomb.currency().holderAccount();
    await holderAccount.approveDelegate(10, honeycomb.identity().address);
    await holderAccount.revokeDelegate();
  });

  it.skip("Freeze and Thaw", async () => {
    const holderAccount = await honeycomb.currency().holderAccount();
    await holderAccount.setHolderStatus(HolderStatus.Inactive);
    await holderAccount.setHolderStatus(HolderStatus.Active);
  });

  it.skip("Wrapped currency", async () => {
    // let mint = web3.Keypair.generate();
    // const token = await metaplex.tokens().createMint({
    //   decimals: 9,
    //   mint: mint,
    // });

    // await metaplex.tokens().mint({
    //   amount: tokenAmount(100_000_000_000, token.mint.decimals),
    //   mintAddress: token.mint.address,
    // });

    honeycomb.use(
      await HplCurrency.new(honeycomb, {
        mint: new web3.PublicKey(
          "GsRHzw9G6at1hjiq7YEGKiZmm3opMvp1iguqkq4TsXcE"
        ),
      })
    );

    const holderAccount = await honeycomb
      .currency()
      .create()
      .holderAccount(honeycomb.identity().address);
    await holderAccount.fund(10_000_000_000);
  });
});
