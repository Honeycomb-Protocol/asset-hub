import * as web3 from "@solana/web3.js";
import { Honeycomb } from "@honeycomb-protocol/hive-control";
import {
  CurrencyType,
  HolderStatus,
  HplCurrency,
  HplHolderAccount,
} from "../packages/hpl-currency-manager";
import { prepare } from "./prepare";
jest.setTimeout(200000);

describe("Currency Manager", () => {
  let currency: web3.PublicKey | null = null;

  let honeycomb: Honeycomb;

  it("Prepare", async () => {
    honeycomb = await prepare();
    console.log(
      "address",
      honeycomb.identity().publicKey.toString(),
      honeycomb.connection.rpcEndpoint
    );
    const balance = await honeycomb
      .rpc()
      .getBalance(honeycomb.identity().publicKey);
    expect(balance).toBeGreaterThanOrEqual(web3.LAMPORTS_PER_SOL * 0.1);
  });

  it("Create or use currency", async () => {
    honeycomb.use(
      await (currency
        ? HplCurrency.fromAddress(honeycomb.connection, currency)
        : HplCurrency.new(honeycomb, {
            currencyType: CurrencyType.Custodial,
            decimals: 9,
            name: "TestCoin",
            symbol: "TST",
            uri: "https://arweave.net/QPC6FYdUn-3V8ytFNuoCS85S2tHAuiDblh6u3CIZLsw",
          }))
    );
    console.log("Currency", honeycomb.currency().address.toString());
  });

  it("Create holder account and mint", async () => {
    let holderAccount: HplHolderAccount;
    try {
      holderAccount = await honeycomb.currency().holderAccount();
    } catch {
      holderAccount = await honeycomb.currency().create().holderAccount();
    }
    await holderAccount.mint(1000);
    console.log("TokenAccount", holderAccount.tokenAccount.toString());
  });

  it("Burn tokens", async () => {
    const holderAccount = await honeycomb.currency().holderAccount();
    await holderAccount.burn(100);
  });

  it("Transfer tokens", async () => {
    const randomKey = web3.Keypair.generate();
    const newHolderAccount = await honeycomb
      .currency()
      .create()
      .holderAccount(randomKey.publicKey);

    const holderAccount = await honeycomb.currency().holderAccount();
    await holderAccount.transfer(100, newHolderAccount);
  });

  it("Delegate and Revoke Delegate", async () => {
    const holderAccount = await honeycomb.currency().holderAccount();
    await holderAccount.approveDelegate(10, honeycomb.identity().publicKey);
    await holderAccount.revokeDelegate();
  });

  it("Freeze and Thaw", async () => {
    const holderAccount = await honeycomb.currency().holderAccount();
    await holderAccount.setHolderStatus(HolderStatus.Inactive);
    await holderAccount.setHolderStatus(HolderStatus.Active);
  });
});
