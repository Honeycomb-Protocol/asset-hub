import * as web3 from "@solana/web3.js";
import {
  Honeycomb,
  HoneycombProject,
  Operation,
  VAULT,
} from "@honeycomb-protocol/hive-control";
import {
  CURRENCY_MANAGER_ID,
  Currency,
  HolderAccount,
  HolderStatus,
  HplCurrency,
  PermissionedCurrencyKind,
  createFixHolderAccountInstruction,
  currencyPda,
  findProjectCurrencies,
  holderAccountPda,
  holderAccountPdas,
  tokenAccountPda,
} from "../packages/hpl-currency-manager";
import { prepare } from "./prepare";
import {
  Metaplex,
  walletAdapterIdentity,
  keypairIdentity,
  token as tokenAmount,
} from "@metaplex-foundation/js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  AuthorityType,
  getMint,
  setAuthority,
} from "@solana/spl-token";
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
    expect(balance).toBeGreaterThanOrEqual(web3.LAMPORTS_PER_SOL * 0.01);
  });

  it.skip("Temp", async () => {
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

    const holderAccounts = await HolderAccount.gpaBuilder()
      .run(honeycomb.connection)
      .then(
        (x) =>
          x
            .map((y) => {
              try {
                return HolderAccount.fromAccountInfo(y.account)[0];
              } catch {
                return null;
              }
            })
            .filter((x) => !!x) as HolderAccount[]
      );

    for (let holderAccount of holderAccounts) {
      const currency = currencies.find((c) =>
        c[0].equals(holderAccount.currency)
      );
      if (!currency) continue;

      const {
        holderAccount: holderAccountAddress,
        tokenAccount: newTokenAccount,
      } = holderAccountPdas(
        holderAccount.owner,
        currency[1].mint,
        currency[1].kind
      );
      const [tokenAccount] = tokenAccountPda(
        holderAccount.owner,
        currency[1].mint,
        undefined,
        CURRENCY_MANAGER_ID
      );

      if (newTokenAccount.equals(holderAccount.tokenAccount)) continue;

      const ctx = await new Operation(honeycomb, [
        createFixHolderAccountInstruction({
          project: currency[1].project,
          currency: currency[0],
          mint: currency[1].mint,
          holderAccount: holderAccountAddress,
          tokenAccount,
          newTokenAccount,
          owner: holderAccount.owner,
          payer: honeycomb.identity().address,
          vault: VAULT,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        }),
      ]).send();
      console.log("Signature", ctx.signature);
      break;
    }
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
        mintAuthority: web3.Keypair.generate(),
        freezeAuthority: web3.Keypair.generate(),
      })
    );

    const holderAccount = await honeycomb
      .currency()
      .create()
      .holderAccount(honeycomb.identity().address);
    await holderAccount.fund(10_000_000_000);
  });
});
