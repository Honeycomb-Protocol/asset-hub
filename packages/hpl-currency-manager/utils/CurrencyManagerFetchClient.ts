import { Commitment, PublicKey } from "@solana/web3.js";
import {
  FetchModule,
  FetchClient,
  isPublicKey,
  ForceScenario,
} from "@honeycomb-protocol/hive-control";
import { Currency, HolderAccount } from "../generated";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { metadataPda } from ".";
import {
  Account as TokenAccount,
  Mint,
  unpackAccount as unpackTokenAccount,
  unpackMint,
} from "@solana/spl-token";

/**
 * Extends the Honeycomb interface with the `fetch` method to access the CurrencyManagerFetchClient.
 */
declare module "@honeycomb-protocol/hive-control" {
  interface FetchModule {
    currencyManager(): CurrencyManagerFetchClient;
  }
}

/**
 * Represents the Fetch Module which contains boiler plates for fetching HiveControl accounts.
 * @category Modules
 */
export class CurrencyManagerFetchClient extends FetchClient {
  /**
   * Creates a new instance of the CurrencyManagerFetchClient.
   */
  constructor() {
    super();
  }

  /**
   * Fetches the Currency object.
   * @param address - The public address of the Currency account.
   * @param commitment The Solana block commitment.
   * @param forceFetch Wether to use cache data or forcefully forceFetch.
   * @returns An instance of HoneycombProject.
   */
  public async currency(
    address: PublicKey,
    commitment: Commitment = "processed",
    forceFetch = ForceScenario.NoForce
  ): Promise<Currency | null> {
    try {
      return Currency.fromAccountInfo(
        await this.getAccount(address, { commitment })
      )[0];
    } catch {
      return null;
    }
  }

  /**
   * Fetches the mint object.
   * @param address - The mint address.
   * @param commitment The Solana block commitment.
   * @param forceFetch Wether to use cache data or forcefully forceFetch.
   * @returns An instance of HoneycombProject.
   */
  public async mint(
    address: PublicKey,
    commitment: Commitment = "processed",
    forceFetch = ForceScenario.NoForce
  ): Promise<Mint | null> {
    try {
      return unpackMint(
        address,
        await this.getAccount(address, { commitment })
      );
    } catch {
      return null;
    }
  }

  /**
   * Fetches the Metadata object.
   * @param mint - The minnt address of the token.
   * @param commitment The Solana block commitment.
   * @param forceFetch Wether to use cache data or forcefully forceFetch.
   * @returns An instance of HoneycombProject.
   */
  public async metadata(
    mint: PublicKey,
    commitment: Commitment = "processed",
    forceFetch = ForceScenario.NoForce
  ): Promise<Metadata | null> {
    try {
      return Metadata.fromAccountInfo(
        await this.getAccount(metadataPda(mint)[0], { commitment })
      )[0];
    } catch {
      return null;
    }
  }

  /**
   * Fetches the Currecy object along with it's dependencies.
   * @param address - The public address of the token.
   * @param commitment The Solana block commitment.
   * @param forceFetch Wether to use cache data or forcefully forceFetch.
   * @returns An instance of HoneycombProject.
   */
  public async currencyWithDeps(
    address: PublicKey,
    commitment: Commitment = "processed",
    forceFetch = ForceScenario.NoForce
  ): Promise<{ currency: Currency; mint: Mint; metadata: Metadata } | null> {
    try {
      const currency = await this.currency(address, commitment, forceFetch);
      if (!currency) return null;

      const mint = await this.mint(currency.mint, commitment, forceFetch);
      if (!mint) return null;

      const metadata = await this.metadata(
        currency.mint,
        commitment,
        forceFetch
      );
      if (!metadata) return null;

      return { currency, mint, metadata };
    } catch {
      return null;
    }
  }

  /**
   * Fetches the Holder Account object.
   * @param args - The currency address and owner of holder account.
   * @param commitment The Solana block commitment.
   * @param forceFetch Wether to use cache data or forcefully forceFetch.
   * @returns An instance of HoneycombProject.
   */
  public async holderAccount(
    args: { currency: PublicKey; owner: PublicKey },
    commitment?: Commitment,
    forceFetch?: ForceScenario
  ): Promise<HolderAccount | null>;

  /**
   * Fetches the Holder Account object.
   * @param address - The public address of the holderAccount.
   * @param commitment The Solana block commitment.
   * @param forceFetch Wether to use cache data or forcefully forceFetch.
   * @returns An instance of HoneycombProject.
   */
  public async holderAccount(
    address: PublicKey,
    commitment?: Commitment,
    forceFetch?: ForceScenario
  ): Promise<HolderAccount | null>;

  public async holderAccount(
    addressOrArgs: PublicKey | { currency: PublicKey; owner: PublicKey },
    commitment: Commitment = "processed",
    forceFetch = ForceScenario.NoForce
  ): Promise<HolderAccount | null> {
    try {
      const address = isPublicKey(addressOrArgs)
        ? addressOrArgs
        : this.honeycomb()
            .pda()
            .currencyManager()
            .holderAccount(addressOrArgs.owner, addressOrArgs.currency)[0];

      return HolderAccount.fromAccountInfo(
        await this.getAccount(address, { commitment })
      )[0];
    } catch {
      return null;
    }
  }

  /**
   * Fetches the Token Account object.
   * @param address - The public address of the tokenAccount.
   * @param commitment The Solana block commitment.
   * @param forceFetch Wether to use cache data or forcefully forceFetch.
   * @returns An instance of HoneycombProject.
   */
  public async tokenAccount(
    address: PublicKey,
    commitment: Commitment = "processed",
    forceFetch = ForceScenario.NoForce
  ): Promise<TokenAccount | null> {
    try {
      return unpackTokenAccount(
        address,
        await this.getAccount(address, { commitment })
      );
    } catch {
      return null;
    }
  }

  /**
   * Fetches the Currecy object along with it's dependencies.
   * @param address - The public address of the holderAccount.
   * @param commitment The Solana block commitment.
   * @param forceFetch Wether to use cache data or forcefully forceFetch.
   * @returns An instance of HoneycombProject.
   */
  public async holderAccountWithDeps(
    address: PublicKey,
    commitment: Commitment = "processed",
    forceFetch = ForceScenario.NoForce
  ): Promise<{
    holderAccount: HolderAccount;
    tokenAccount: TokenAccount;
  } | null> {
    try {
      const holderAccount = await this.holderAccount(
        address,
        commitment,
        forceFetch
      );
      if (!holderAccount) return null;

      const tokenAccount = await this.tokenAccount(
        holderAccount.tokenAccount,
        commitment,
        forceFetch
      );
      if (!tokenAccount) return null;

      return { holderAccount, tokenAccount };
    } catch {
      return null;
    }
  }

  /**
   * Installs the CurrencyManagerFetchClient into the FetchModule instance.
   *
   * @param fetchModule - The FetchModule instance to install the module into.
   * @returns The modified FetchModule instance with the CurrencyManagerFetchClient installed.
   */
  public install(fetchModule: FetchModule): FetchModule {
    this._fetchModule = fetchModule;
    fetchModule.currencyManager = () => this;
    return fetchModule;
  }
}

/**
 * Factory function to create a new instance of the CurrencyManagerFetchClient.
 * @category Factory
 * @returns A new instance of the CurrencyManagerFetchClient.
 */
export const currencyManagerFetch = () => new CurrencyManagerFetchClient();
