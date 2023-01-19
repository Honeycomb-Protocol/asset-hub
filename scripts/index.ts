import { Actions, ProgramName } from "./types";
import assembler from "./assembler";

function main() {
  const args = process.argv.slice(2);
  const action = args[1] as Actions;
  const network = "devnet";

  switch (args[0] as ProgramName) {
    case "assembler":
      assembler(action, network, ...args.slice(2));
      break;

    default:
      throw new Error("Invalid program name");
  }
}

main();
