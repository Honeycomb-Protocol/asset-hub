import * as web3 from "@solana/web3.js";
import { AssemblerProgramAction } from "../types";
import { getDependencies, sendAndConfirmTransaction } from "../utils";
import create_and_mint_nft from "./create_and_mint_nft";
import create_assembler from "./create_assembler";
import create_block from "./create_block";
import create_block_definition from "./create_block_definition";

export default async function (
  action: AssemblerProgramAction,
  network: "mainnet" | "devnet" = "devnet",
  ...args: string[]
) {
  const { connection, wallet, deployments, setDeployments } = getDependencies(
    network,
    "assembler"
  );

  switch (action) {
    case "create-assembler":
      const assemblerAddress = await create_assembler(connection, wallet);
      console.log("Assembler address: ", assemblerAddress.toString());
      setDeployments({ ...deployments, assembler: assemblerAddress });
      break;

    case "create-block":
      if (!deployments.assembler)
        throw new Error(
          "Assembler address not found in deployments, Please create assembler first"
        );
      const blockAddress = await create_block(
        connection,
        wallet,
        new web3.PublicKey(deployments.assembler)
      );
      console.log("Block address: ", blockAddress.toString());
      setDeployments({ ...deployments, block: blockAddress });
      break;

    case "create-block-definition":
      if (!deployments.block)
        throw new Error(
          "Block address not found in deployments, Please create block first"
        );

      const blockDefinitionAddress = await create_block_definition(
        connection,
        wallet,
        new web3.PublicKey(deployments.block),
        args[0] ? new web3.PublicKey(args[0]) : undefined
      );
      console.log(
        "Block definition address: ",
        blockDefinitionAddress.toString()
      );
      setDeployments({
        ...deployments,
        blockDefinition: blockDefinitionAddress,
        blockDefinitionMint: args[0],
      });
      break;

    case "create-and-mint-nft":
      if (
        !deployments.assembler ||
        !deployments.block ||
        !deployments.blockDefinition ||
        !deployments.blockDefinitionMint
      )
        throw new Error(
          "Dependencies not found in deployments, Please create assembler, block and block definition first"
        );

      const mint = await create_and_mint_nft(
        connection,
        wallet,
        new web3.PublicKey(deployments.assembler),
        [
          {
            block: new web3.PublicKey(deployments.block),
            blockDefinition: new web3.PublicKey(deployments.blockDefinition),
            tokenMint: new web3.PublicKey(deployments.blockDefinitionMint),
          },
        ]
      );
      console.log("Mint address: ", mint.toString());
      break;

    default:
      throw new Error("Invalid Assembler program action");
  }
}
