import * as web3 from "@solana/web3.js";
import { Honeycomb, HoneycombProject } from "@honeycomb-protocol/hive-control";
import {
  HolderStatus,
  HplCurrency,
  PermissionedCurrencyKind,
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
    metaplex.use(walletAdapterIdentity(honeycomb.identity()));

    const balance = await honeycomb
      .rpc()
      .getBalance(honeycomb.identity().address);
    expect(balance).toBeGreaterThanOrEqual(web3.LAMPORTS_PER_SOL * 0.1);
  });

  it("Create Project and currency", async () => {
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

  it("Create holder account and mint", async () => {
    const holderAccount = await honeycomb.currency().create().holderAccount();
    await holderAccount.mint(1000_000_000_000);
  });

  it("Burn tokens", async () => {
    const holderAccount = await honeycomb.currency().holderAccount();
    await holderAccount.burn(100_000_000_000);
  });

  it("Transfer tokens", async () => {
    const randomKey = web3.Keypair.generate();
    const newHolderAccount = await honeycomb
      .currency()
      .create()
      .holderAccount(randomKey.publicKey);

    const holderAccount = await honeycomb.currency().holderAccount();
    await holderAccount.transfer(100_000_000_000, newHolderAccount);
  });

  it("Delegate and Revoke Delegate", async () => {
    const holderAccount = await honeycomb.currency().holderAccount();
    await holderAccount.approveDelegate(10, honeycomb.identity().address);
    await holderAccount.revokeDelegate();
  });

  it("Freeze and Thaw", async () => {
    const holderAccount = await honeycomb.currency().holderAccount();
    await holderAccount.setHolderStatus(HolderStatus.Inactive);
    await holderAccount.setHolderStatus(HolderStatus.Active);
  });

  it("Wrapped currency", async () => {
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

    const holderAccount = await honeycomb.currency().create().holderAccount();
    await holderAccount.fund(10_000_000_000);
  });
});
