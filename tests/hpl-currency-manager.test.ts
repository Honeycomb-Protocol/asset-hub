import * as web3 from "@solana/web3.js";
import { Honeycomb, HoneycombProject } from "@honeycomb-protocol/hive-control";
import {
  HolderStatus,
  HplCurrency,
  PermissionedCurrencyKind,
} from "../packages/hpl-currency-manager";
import getHoneycombs from "../scripts/prepare";
jest.setTimeout(200000);

describe("Currency Manager", () => {
  let adminHC: Honeycomb;
  let userHC: Honeycomb;

  it("Prepare", async () => {
    const honeycombs = await getHoneycombs();
    adminHC = honeycombs.adminHC;
    userHC = honeycombs.userHC;
    console.log("Admin", adminHC.identity().address.toString());
    console.log("User", userHC.identity().address.toString());

    adminHC.use(
      await HoneycombProject.new(adminHC, {
        name: "Project",
        expectedMintAddresses: 0,
        profileDataConfigs: [],
      })
    );
    expect(adminHC.project().name).toBe("Project");

    userHC.use(
      await HoneycombProject.fromAddress(userHC, adminHC.project().address)
    );
  });

  it("Create Currency", async () => {
    adminHC.use(
      await HplCurrency.new(adminHC, {
        kind: PermissionedCurrencyKind.NonCustodial,
        decimals: 9,
        name: "Bounty",
        symbol: "BNTY",
        uri: "https://arweave.net/1VxSzPEOwYlTo3lU5XSQWj-9Ldt3dB68cynDDjzeF-c",
      })
    );
    expect(adminHC.currency().name).toBe("Bounty");

    userHC.use(
      await HplCurrency.fromAddress(
        userHC.connection,
        adminHC.currency().address
      )
    );
  });

  it("Create holder account and mint", async () => {
    const holderAccount = await adminHC
      .currency()
      .create()
      .holderAccount(userHC.identity().address);
    await holderAccount.mint(1000_000_000_000);
  });

  it("Burn tokens", async () => {
    const holderAccount = await userHC.currency().holderAccount();
    await holderAccount.burn(100_000_000_000);
  });

  it("Transfer tokens", async () => {
    const newHolderAccount = await userHC
      .currency()
      .create()
      .holderAccount(web3.Keypair.generate().publicKey);

    const holderAccount = await userHC.currency().holderAccount();
    await holderAccount.transfer(100_000_000_000, newHolderAccount);
  });

  it("Delegate and Revoke Delegate", async () => {
    const holderAccount = await userHC.currency().holderAccount();
    await holderAccount.approveDelegate(
      10_000_000_000,
      adminHC.identity().address
    );
    await holderAccount.revokeDelegate();
  });

  it("Freeze and Thaw", async () => {
    const holderAccount = await userHC.currency().holderAccount();
    await holderAccount.setHolderStatus(HolderStatus.Inactive);
    await holderAccount.setHolderStatus(HolderStatus.Active);
  });
});
