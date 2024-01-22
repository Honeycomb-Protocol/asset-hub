import {
  CharacterModel as CharacterModelSolita,
  PROGRAM_ID,
} from "./generated";
import {
  Commitment,
  Connection,
  GetAccountInfoConfig,
  PublicKey,
} from "@solana/web3.js";

export class HplCharacterModel {
  constructor(private _solita: CharacterModelSolita) {}

  public get solita() {
    return this._solita;
  }

  public get address() {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("character_model"),
        this.project.toBuffer(),
        this.solita.key.toBuffer(),
      ],
      PROGRAM_ID
    )[0];
  }

  public get project() {
    return this.solita.project;
  }

  public get config() {
    return this.solita.config;
  }

  public get attributes() {
    return this.solita.attributes;
  }

  public get merkleTrees() {
    return this.solita.merkleTrees.merkleTrees;
  }

  public get activeCharactersMerkleTree() {
    if (this.merkleTrees.length < this.solita.merkleTrees.active)
      throw new Error("Active characters merkle tree not found");
    return this.merkleTrees[this.solita.merkleTrees.active];
  }

  public static async fromAddress(
    connection: Connection,
    address: PublicKey,
    commitmentOrConfig?: Commitment | GetAccountInfoConfig
  ) {
    return new HplCharacterModel(
      await CharacterModelSolita.fromAccountAddress(
        connection,
        address,
        commitmentOrConfig
      )
    );
  }
}
