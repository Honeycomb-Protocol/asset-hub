const path = require("path");

module.exports = {
  idlGenerator: "anchor",
  programName: "anchor_template",
  programId: "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
  idlDir: path.join(__dirname, "idl"),
  sdkDir: path.join(__dirname, "src"),
  binaryInstallDir: path.join(__dirname, ".crates"),
  programDir: path.join(__dirname, "programs", "anchor-template"),
};
