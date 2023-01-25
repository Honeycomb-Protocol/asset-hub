const fs = require('fs');
const { spawnSync } = require("child_process")


if (!fs.existsSync('./node_modules')) spawnSync("yarn", ["install"], { stdio: 'inherit' });
if (!fs.existsSync('./node_modules/@metaplex-foundation/mpl-candy-guard/dist')) {
    spawnSync("yarn", ["install"], { stdio: 'inherit', cwd: "./node_modules/@metaplex-foundation/mpl-candy-guard/" });
    spawnSync("yarn", ["build"], { stdio: 'inherit', cwd: "./node_modules/@metaplex-foundation/mpl-candy-guard/" });
}