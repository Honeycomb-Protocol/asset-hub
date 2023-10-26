import * as web3 from "@solana/web3.js";
import { Honeycomb, HoneycombProject } from "@honeycomb-protocol/hive-control";
import {
  HplConditionalPayments,
  HplPayment,
  paymentStructure,
} from "../packages/hpl-payment-manager";
import getHoneycombs from "../scripts/prepare";
import {
  PermissionedCurrencyKind,
  currencyModule,
} from "@honeycomb-protocol/currency-manager";
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

    adminHC.use(
      await currencyModule(adminHC, {
        kind: PermissionedCurrencyKind.NonCustodial,
        decimals: 9,
        name: "Bounty",
        symbol: "BNTY",
        uri: "https://arweave.net/1VxSzPEOwYlTo3lU5XSQWj-9Ldt3dB68cynDDjzeF-c",
      })
    );
    expect(adminHC.currency().name).toBe("Bounty");

    adminHC
      .currency()
      .create()
      .holderAccount(userHC.identity().address)
      .then((holderAccount) =>
        holderAccount.mint(10 * 10 ** adminHC.currency().mint.decimals)
      );
  });

  it("Create Payment Structure", async () => {
    adminHC.use(
      await paymentStructure(
        adminHC,
        HplConditionalPayments.createSolita().item({
          kind: {
            __kind: "HplCurrency",
            address: adminHC.currency().address,
            amount: 10 * 10 ** adminHC.currency().mint.decimals,
          },
          paymentMethod: {
            __kind: "Burn",
          },
        })
      )
    );
  });

  it("Load for user", async () => {
    userHC.use(
      await HoneycombProject.fromAddress(userHC, adminHC.project().address)
    );
    userHC.use(await currencyModule(userHC, adminHC.currency().address));
    await userHC.currency().holderAccount();
    userHC.use(
      await paymentStructure(userHC, adminHC.paymentStructure().address)
    );
  });

  it("Make Payment", async () => {
    const session = await userHC.paymentStructure().startSession();
    await session.pay(userHC.paymentStructure().payments.value as HplPayment);
    await session.close();
  });
});
