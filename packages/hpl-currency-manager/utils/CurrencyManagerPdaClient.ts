import { PublicKey } from "@solana/web3.js";
import { PdaClient, PdaModule } from "@honeycomb-protocol/hive-control";
import {
  CurrencyKind,
  PROGRAM_ID,
  PermissionedCurrencyKind,
} from "../generated";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

/**
 * Extends the Honeycomb interface with the `pda` method to access the CurrencyManagerPdaClient.
 */
declare module "@honeycomb-protocol/hive-control" {
  interface PdaModule {
    currencyManager: () => CurrencyManagerPdaClient;
  }
}

/**
 * Represents the Fetch Module which contains boiler plates for pda generations.
 * @category Modules
 */
export class CurrencyManagerPdaClient extends PdaClient {
  readonly defaultProgramId = PROGRAM_ID;

  /**
   * Creates a new instance of the CurrencyManagerPdaClient.
   */
  constructor() {
    super();
  }

  /**
   * Install this client in the PdaModule.
   * Every derived module class must implement this method.
   * @param pdaModule The PdaModule instance to install the client in.
   * @returns The updated PdaModule instance with the installed client.
   */
  public install(pdaModule: PdaModule): PdaModule {
    pdaModule.currencyManager = () => this;
    return pdaModule;
  }

  /**
   * Generates a PDA for the currency program based on the given `mint`.
   * @category Helpers
   * @param mint The mint public key.
   * @param programId The program ID of the currency program (optional, default is PROGRAM_ID).
   * @returns The generated PDA address for the currency program.
   */
  currency(mint: PublicKey, programId = this.defaultProgramId) {
    return PdaModule.findProgramAddressSyncWithSeeds(
      [Buffer.from("currency"), mint.toBuffer()],
      programId
    );
  }

  /**
   * Generates a PDA for the holder account based on the given `owner` and `mint`.
   * @category Helpers
   * @param owner The owner public key of the holder account.
   * @param mint The mint public key.
   * @param programId The program ID of the holder account program (optional, default is PROGRAM_ID).
   * @returns The generated PDA address for the holder account.
   */
  holderAccount(
    owner: PublicKey,
    mint: PublicKey,
    programId = this.defaultProgramId
  ) {
    return PdaModule.findProgramAddressSyncWithSeeds(
      [Buffer.from("holder_account"), owner.toBuffer(), mint.toBuffer()],
      programId
    );
  }

  /**
   * Generates both the holder account PDA and the associated token account PDA for a given `owner`, `mint`,
   * `currencyKind`, `tokenProgram`, and `programId`.
   * @category Helpers
   * @param owner The owner public key of the holder account.
   * @param mint The mint public key.
   * @param currencyKind The type of currency (e.g., permissioned or non-permissioned).
   * @param tokenProgram The program ID of the SPL Token program (optional, default is TOKEN_PROGRAM_ID).
   * @param programId The program ID of the token account program (optional, default is PROGRAM_ID).
   * @returns An object containing the generated PDA addresses for both the holder account and the token account.
   */
  holderAccountWithTokenAccount(
    owner: PublicKey,
    mint: PublicKey,
    currencyKind: CurrencyKind,
    programId = this.defaultProgramId
  ) {
    const [holderAccount] = this.holderAccount(owner, mint, programId);

    const tokenAccount = getAssociatedTokenAddressSync(
      mint,
      currencyKind.__kind === "Permissioned" &&
        currencyKind.kind === PermissionedCurrencyKind.Custodial
        ? holderAccount
        : owner,
      true
    );

    // const [tokenAccount] = tokenAccountPda(
    //   currencyKind.__kind === "Permissioned" &&
    //     currencyKind.kind === PermissionedCurrencyKind.Custodial
    //     ? holderAccount
    //     : owner,
    //   mint
    // );

    return { holderAccount, tokenAccount };
  }
}

/**
 * Factory function to create a new instance of the CurrencyManagerPdaClient.
 * @category Factory
 * @returns A new instance of the CurrencyManagerPdaClient.
 */
export const currencyManagerPdas = () => new CurrencyManagerPdaClient();
