import * as web3 from "@solana/web3.js";
import { AssemblerProgramAction } from "./types";
import { getDependencies } from "./utils";
import {
  createAssembler,
  createBlock,
  createBlockDefinition,
  createAndMintNft,
  disbandNft,
  AssemblingAction,
  BlockType,
  BlockDefinitionValue,
  Block,
} from "../src";

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
      const assemblerAddress = await createAssembler(connection, wallet, {
        assemblingAction: AssemblingAction.TakeCustody,
        collectionName: "Assembler Test Collection",
        collectionSymbol: "ATC",
        collectionDescription: "This is a test collection to test assembler",
        collectionUri: "https://assembler.test",
        nftBaseUri: "",
      });
      console.log("Assembler address: ", assemblerAddress.toString());
      setDeployments({ ...deployments, assembler: assemblerAddress });
      break;

    case "create-block":
      if (!deployments.assembler)
        throw new Error(
          "Assembler address not found in deployments, Please create assembler first"
        );
      const blockAddress = await createBlock(
        connection,
        wallet,
        new web3.PublicKey(deployments.assembler),
        {
          blockName: "Block 1",
          blockOrder: 1,
          blockType: BlockType.Enum,
          isGraphical: false,
        }
      );
      console.log("Block address: ", blockAddress.toString());
      setDeployments({ ...deployments, block: blockAddress });
      break;

    case "create-block-definition":
      if (!args[0])
        throw new Error("Block definition mint address not provided");
      if (!deployments.block)
        throw new Error(
          "Block address not found in deployments, Please create block first"
        );

      const block = new web3.PublicKey(deployments.block);
      const blockAccount = await Block.fromAccountAddress(connection, block);

      let blockDefArgs: BlockDefinitionValue;
      if (blockAccount.blockType === BlockType.Enum) {
        blockDefArgs = {
          __kind: "Enum",
          value: "test",
          isCollection: true,
          image: null,
        };
      } else if (blockAccount.blockType === BlockType.Boolean) {
        blockDefArgs = {
          __kind: "Boolean",
          value: true,
        };
      } else if (
        blockAccount.blockType === BlockType.Random ||
        blockAccount.blockType === BlockType.Computed
      ) {
        blockDefArgs = {
          __kind: "Number",
          min: 0,
          max: 100,
        };
      } else {
        throw new Error("Invalid block type");
      }

      const blockDefinitionAddress = await createBlockDefinition(
        connection,
        wallet,
        blockAccount.assembler,
        block,
        new web3.PublicKey(args[0]),
        blockDefArgs
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

      const mint = await createAndMintNft(
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
      setDeployments({
        ...deployments,
        nftMint: mint,
      });
      break;

    case "disband-nft":
      if (!deployments.nftMint)
        throw new Error("NFT mint address not found in deployments");

      await disbandNft(
        connection,
        wallet,
        new web3.PublicKey(deployments.nftMint)
      );
      break;

    default:
      throw new Error("Invalid Assembler program action");
  }
}
