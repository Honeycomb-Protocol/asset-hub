import * as web3 from "@solana/web3.js";
import {
  HPL_HIVE_CONTROL_PROGRAM,
  Honeycomb,
  HoneycombProject,
  Operation,
  VAULT,
} from "@honeycomb-protocol/hive-control";
import {
  Currency,
  HPL_CURRENCY_MANAGER_PROGRAM,
  HolderAccount,
  HolderStatus,
  HplCurrency,
  PermissionedCurrencyKind,
  createFixHolderAccountInstruction,
  holderAccountPdas,
  tokenAccountPda,
} from "../packages/hpl-currency-manager";
import { getHoneycomb } from "./prepare";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
jest.setTimeout(200000);

describe("Currency Manager", () => {
  let adminHC: Honeycomb;
  let userHC: Honeycomb;
  let metaplex: Metaplex;

  it("Prepare", async () => {
    const temp = await getHoneycomb();
    adminHC = temp.adminHC;
    userHC = temp.userHC;
    console.log("Admin", adminHC.identity().address.toString());

    metaplex = new Metaplex(adminHC.connection);
    // metaplex.use(keypairIdentity(temp.signer));
    metaplex.use(
      walletAdapterIdentity({
        ...adminHC.identity(),
        publicKey: adminHC.identity().address,
      })
    );

    const balance = await adminHC.rpc().getBalance(adminHC.identity().address);
    expect(balance).toBeGreaterThanOrEqual(web3.LAMPORTS_PER_SOL * 0.01);
  });

  it.skip("Temp", async () => {
    // const project = await HoneycombProject.fromAddress(
    //   adminHC.connection,
    //   new web3.PublicKey("7CKTHsJ3EZqChNf3XGt9ytdZXvSzDFWmrQJL3BCe4Ppw")
    // );
    // adminHC.use(project);
    // await findProjectCurrencies(project);
    // console.log(adminHC._currencies);

    const currencies = (await Currency.gpaBuilder()
      .run(adminHC.connection)
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
      .run(adminHC.connection)
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
        HPL_CURRENCY_MANAGER_PROGRAM
      );

      if (newTokenAccount.equals(holderAccount.tokenAccount)) continue;

      const [ctx] = await new Operation(adminHC, [
        createFixHolderAccountInstruction({
          project: currency[1].project,
          currency: currency[0],
          mint: currency[1].mint,
          holderAccount: holderAccountAddress,
          tokenAccount,
          newTokenAccount,
          owner: holderAccount.owner,
          payer: adminHC.identity().address,
          vault: VAULT,
          hiveControl: HPL_HIVE_CONTROL_PROGRAM,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          instructionsSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        }),
      ]).send();
      console.log("Signature", ctx.signature);
      break;
    }
  });

  it("Create Project and currency", async () => {
    // Create project
    adminHC.use(
      await HoneycombProject.new(adminHC, {
        name: "TestProject",
        expectedMintAddresses: 1,
        profileDataConfigs: [],
      })
    );
    expect(adminHC.project().name).toBe("TestProject");

    adminHC.use(
      await HplCurrency.new(adminHC, {
        kind: PermissionedCurrencyKind.NonCustodial,
        decimals: 9,
        name: "TestCoin",
        symbol: "TSC",
        uri: "https://arweave.net/QPC6FYdUn-3V8ytFNuoCS85S2tHAuiDblh6u3CIZLsw",
      })
    );
  });

  it("Create holder account and mint", async () => {
    const holderAccount = await adminHC
      .currency()
      .create()
      .holderAccount(adminHC.identity().address, { skipPreflight: true });
    await holderAccount.mint(1000_000_000_000);
  });

  it("Burn tokens", async () => {
    const holderAccount = await adminHC.currency().holderAccount();
    await holderAccount.burn(100_000_000_000);
  });

  it("Transfer tokens", async () => {
    const newHolderAccount = await adminHC
      .currency()
      .create()
      .holderAccount(userHC.identity().address);

    const holderAccount = await adminHC.currency().holderAccount();
    await holderAccount.transfer(100_000_000_000, newHolderAccount);
  });

  it("Delegate and Revoke Delegate", async () => {
    const holderAccount = await adminHC.currency().holderAccount();
    await holderAccount.approveDelegate(
      10_000_000_000,
      userHC.identity().address
    );
    await holderAccount.revokeDelegate();
  });

  it("Freeze and Thaw", async () => {
    const holderAccount = await adminHC.currency().holderAccount();
    await holderAccount.setHolderStatus(HolderStatus.Inactive);
    await holderAccount.setHolderStatus(HolderStatus.Active);
  });

  it.skip("Wrapped currency", async () => {
    adminHC.use(
      await HplCurrency.new(adminHC, {
        mint: new web3.PublicKey(
          "GsRHzw9G6at1hjiq7YEGKiZmm3opMvp1iguqkq4TsXcE"
        ),
        mintAuthority: web3.Keypair.generate(),
        freezeAuthority: web3.Keypair.generate(),
      })
    );

    const holderAccount = await adminHC
      .currency()
      .create()
      .holderAccount(adminHC.identity().address);
    await holderAccount.fund(10_000_000_000);
  });
});
