import {
  AssemblerProgramAction,
  AssetManagerProgramAction,
  ProgramName,
} from "./types";
import assembler from "./assembler";
import assetmanager from "./assetmanager";

function main() {
  const args = process.argv.slice(2);
  const action = args[1];
  const network = "devnet";

  switch (args[0] as ProgramName) {
    case "assembler":
      assembler(action as AssemblerProgramAction, network, ...args.slice(2));
      break;
    case "assetmanager":
      assetmanager(
        action as AssetManagerProgramAction,
        network,
        ...args.slice(2)
      );
      break;
    default:
      throw new Error("Invalid program name");
  }
}

main();
