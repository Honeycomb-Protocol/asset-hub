const path = require("path");

module.exports = {
  idlGenerator: "anchor",
  programName: "assetmanager",
  programId: "BNGKUeQQHw2MgZc9EqFsCWmnkLEKLCUfu5cw9YFWK3hF",
  idlDir: path.join(__dirname, "idl"),
  sdkDir: path.join(__dirname, "src", "generated", "assetmanager"),
  binaryInstallDir: path.join(__dirname, ".crates"),
  programDir: path.join(__dirname, "programs", "assetmanager"),
};
