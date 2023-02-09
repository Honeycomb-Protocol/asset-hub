import * as web3 from "@solana/web3.js";
import { AssemblerProgramAction } from "./types";
import { getDependencies } from "./utils";
import {
  createAssembler,
  updateAssembler,
  createBlock,
  createBlockDefinition,
  createAndMintNft,
  disbandNft,
  AssemblingAction,
  BlockType,
  BlockDefinitionValue,
  Block,
  TokenStandard,
} from "../src";

export default async function (
  action: AssemblerProgramAction,
  network: "mainnet" | "devnet" = "devnet",
  ...args: string[]
) {
  const { connection, wallet, deployments, mx, setDeployments } =
    getDependencies(network, "assembler");

  switch (action) {
    case "create-assembler":
      const assemblerTx = await createAssembler(mx, {
        assemblingAction: AssemblingAction.TakeCustody,
        collectionName: "Assembler Test Collection",
        collectionSymbol: "ATC",
        collectionDescription: "This is a test collection to test assembler",
        collectionUri: "https://assembler.test",
        nftBaseUri: "https://api.eboy.dev/u/temp",
        allowDuplicates: false,
        defaultRoyalty: 100,
        tokenStandard: TokenStandard.ProgrammableNonFungible,
        ruleSet: null,
      });
      console.log("Assembler address: ", assemblerTx.response);
      setDeployments({ ...deployments, assembler: assemblerTx.assembler });
      break;
    case "update-assembler":
      if (!deployments.assembler)
        throw new Error(
          "Assembler address not found in deployments, Please create assembler first"
        );
      const updateAssemblerTx = await updateAssembler(
        mx,
        new web3.PublicKey(deployments.assembler),
        {
          assemblingAction: AssemblingAction.Burn,
          nftBaseUri: "https://api.eboy.dev/u/loading.json",
          allowDuplicates: false,
          defaultRoyalty: 100,
        }
      );
      console.log("Assembler address: ", updateAssemblerTx.response);
      break;

    case "create-block":
      if (!deployments.assembler)
        throw new Error(
          "Assembler address not found in deployments, Please create assembler first"
        );
      const blockOrder = (deployments.blockOrder || 0) + 1;
      const blockAddress = await createBlock(
        mx,
        new web3.PublicKey(deployments.assembler),
        {
          blockName: `Block ${blockOrder}`,
          blockOrder: blockOrder,
          blockType: BlockType.Enum,
          isGraphical: false,
        }
      );
      console.log("Create Block tx: ", blockAddress.response);
      setDeployments({
        ...deployments,
        block: blockAddress.block,
        blockOrder: blockOrder,
        blockDefinitionIndex: -1,
      });
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
          isCollection: false,
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
      const blockDefinitionIndex =
        "blockDefinitionIndex" in deployments
          ? deployments.blockDefinitionIndex + 1
          : 0;

      const blockDefinitionAddress = await createBlockDefinition(
        mx,
        blockAccount.assembler,
        block,
        new web3.PublicKey(args[0]),
        blockDefArgs
      );
      console.log(
        "Block definition address: ",
        blockDefinitionAddress.response
      );
      setDeployments({
        ...deployments,
        blockDefinition: blockDefinitionAddress.blockDefinition,
        blockDefinitionIndex: blockDefinitionIndex,
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

      const mint = await createAndMintNft({
        mx,
        assembler: new web3.PublicKey(deployments.assembler),
        blocks: [
          {
            block: new web3.PublicKey(deployments.block),
            blockDefinition: new web3.PublicKey(deployments.blockDefinition),
            tokenMint: new web3.PublicKey(deployments.blockDefinitionMint),
            blockDefinitionIndex: deployments.blockDefinitionIndex,
            order: deployments.blockOrder,
          },
        ],
      }).catch((e) => console.error(e));
      if (!mint) throw new Error("Mint txns failed!");
      console.log("Mint response: ", mint.responses);
      console.log("NFT Mint", mint.nftMint.toString());
      setDeployments({
        ...deployments,
        nftMint: mint.nftMint,
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
