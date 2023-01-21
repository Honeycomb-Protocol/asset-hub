const path = require("path");

module.exports = {
  idlGenerator: "anchor",
  programName: "assetmanager",
  programId: "AXX2agYcoDwGFsgEWvSitqfGH4ooKXUqK5P7Ch9raDJT",
  idlDir: path.join(__dirname, "idl"),
  sdkDir: path.join(__dirname, "src", "assetmanager"),
  binaryInstallDir: path.join(__dirname, ".crates"),
  programDir: path.join(__dirname, "programs", "assetmanager"),
};
