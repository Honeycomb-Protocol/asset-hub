const fs = require("fs");
const { spawnSync } = require("child_process");
if (!fs.existsSync("./node_modules"))
  spawnSync("yarn", ["install"], { stdio: "inherit" });
const potencialDirs = ["..", "node_modules"];
for (let index = 0; index < potencialDirs.length; index++) {
  const dir = potencialDirs[index] + "/@metaplex-foundation/mpl-candy-guard/";

  if (fs.existsSync(dir) && !fs.existsSync(dir + "dist")) {
    if (!fs.existsSync(dir + "node_modules"))
      spawnSync("yarn", ["install"], {
        stdio: "inherit",
        cwd: dir,
      });
    spawnSync("yarn", ["build"], {
      stdio: "inherit",
      cwd: dir,
    });
  }
  spawnSync("yarn", ["compile"], { stdio: "inherit" });
}
