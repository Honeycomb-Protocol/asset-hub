const fs = require("fs");
const { spawnSync } = require("child_process");

if (!fs.existsSync("./node_modules"))
  spawnSync("yarn", ["install"], { stdio: "inherit" });
if (
  fs.existsSync("../@metaplex-foundation/mpl-candy-guard") &&
  !fs.existsSync("../@metaplex-foundation/mpl-candy-guard/dist")
) {
  if (!fs.existsSync("../@metaplex-foundation/mpl-candy-guard/node_modules"))
    spawnSync("yarn", ["install"], {
      stdio: "inherit",
      cwd: "../@metaplex-foundation/mpl-candy-guard/",
    });
  spawnSync("yarn", ["run build"], {
    stdio: "inherit",
    cwd: "../@metaplex-foundation/mpl-candy-guard/",
  });
}
spawnSync("yarn", ["run build"], { stdio: "inherit" });
