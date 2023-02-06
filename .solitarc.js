const path = require("path");

module.exports = {
  idlGenerator: "anchor",
  programName: "staking",
  programId: "8pyniLLXEHVUJKX2h5E9DrvwTsRmSR64ucUYBg8jQgPP",
  idlDir: path.join(__dirname, "src", "idl"),
  sdkDir: path.join(__dirname, "src", "generated", "staking"),
  binaryInstallDir: path.join(__dirname, ".crates"),
  programDir: path.join(__dirname, "programs", "staking"),
};
