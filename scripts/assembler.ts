import * as web3 from "@solana/web3.js";
import { AssemblerProgramAction } from "./types";
import { getDependencies } from "./utils";
import { Honeycomb, identityModule } from "@honeycomb-protocol/hive-control";
import {
  AssemblingAction,
  AssetAssembler,
  AssetAssemblerBlock,
  AssetAssemblerBlockDefinition,
  AssetAssemblerNft,
  BlockDefinitionValue,
  BlockType,
  TokenStandard,
} from "../packages/hpl-asset-assembler";

export default async function (
  action: AssemblerProgramAction,
  network: "mainnet" | "devnet" = "devnet",
  ...args: string[]
) {
  const { connection, signer, deployments, setDeployments } = getDependencies(
    network,
    "assembler"
  );

  const honeycomb = await Honeycomb.fromAddress(
    connection,
    new web3.PublicKey("HEHH65goNqxcWpxDpgPqKwernLawqbQJ7L9aocNkm2YT")
  );
  honeycomb.use(identityModule(signer));
  await honeycomb.identity().loadDelegateAuthority();

  if (action === "create-assembler") {
    const assetAssembler = await AssetAssembler.new(honeycomb, {
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
      defaultCreators: [
        {
          address: honeycomb.identity().publicKey,
          share: 100,
        },
      ],
    });

    console.log("Assembler address: ", assetAssembler.assemblerAddress);
    setDeployments({
      ...deployments,
      assembler: assetAssembler.assemblerAddress,
    });
  } else {
    console.log("Fetching assemmbler");
    honeycomb.use(
      await AssetAssembler.fromAddress(
        honeycomb.connection,
        new web3.PublicKey(deployments.assembler)
      )
    );
    console.log("Assembler fetched loading data");
    await honeycomb.assembler().load();
    console.log("Proceeding with action: ", action);

    let block: AssetAssemblerBlock;
    let blockDefinition: AssetAssemblerBlockDefinition;
    let nft: AssetAssemblerNft;

    switch (action) {
      case "update-assembler":
        await honeycomb.assembler().update({
          assemblingAction: AssemblingAction.Burn,
          nftBaseUri: "https://api.eboy.dev/u/loading.json",
          allowDuplicates: false,
          defaultRoyalty: 100,
        });
        console.log(
          "Assembler address: ",
          honeycomb.assembler().assemblerAddress
        );
        break;

      case "create-block":
        block = await honeycomb.assembler().create().block({
          blockName: `Block`,
          blockType: BlockType.Enum,
          isGraphical: false,
        });
        console.log("Block:", block.address.toString());
        break;

      case "create-block-definition":
        block = honeycomb.assembler().blocks()[0];

        let blockDefArgs: BlockDefinitionValue;
        if (block.blockType === BlockType.Enum) {
          blockDefArgs = {
            __kind: "Enum",
            value: "test",
            isCollection: false,
            image: null,
          };
        } else if (block.blockType === BlockType.Boolean) {
          blockDefArgs = {
            __kind: "Boolean",
            value: true,
          };
        } else if (
          block.blockType === BlockType.Random ||
          block.blockType === BlockType.Computed
        ) {
          blockDefArgs = {
            __kind: "Number",
            min: 0,
            max: 100,
          };
        } else {
          throw new Error("Invalid block type");
        }

        blockDefinition = await honeycomb
          .assembler()
          .create()
          .blockDefinition({
            value: blockDefArgs,
            block: block.address,
            mint: new web3.PublicKey(args[0]),
          });

        console.log("Block definition:", blockDefinition.address);
        break;

      case "create-and-mint-nft":
        block = honeycomb.assembler().blocks()[0];
        blockDefinition = block.blockDefinitions[0];

        console.log("Creating NFT");
        nft = await honeycomb.assembler().create().nft();
        console.log("NFT created", nft.mintAddress.toString());

        console.log("Adding block definition to NFT", block);
        await nft.addBlock(blockDefinition);
        console.log("Block definition added to NFT");

        console.log("Minting NFT");
        await nft.mint();
        console.log("NFT minted");
        break;

      case "disband-nft":
        block = honeycomb.assembler().blocks()[0];
        blockDefinition = block.blockDefinitions[0];
        nft = (
          await honeycomb
            .assembler()
            .fetch()
            .nftsByWallet(honeycomb.identity().publicKey)
        )[0];

        console.log("Burning NFT");
        await nft.burn();
        console.log("NFT burned");

        console.log("Removing block definition from NFT");
        await nft.removeBlock(blockDefinition);
        console.log("Block definition removed from NFT");
        break;

      default:
        throw new Error("Invalid Assembler program action");
    }
  }
}
