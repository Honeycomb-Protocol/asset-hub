const path = require("path");

module.exports = {
  idlGenerator: "anchor",
  programName: "assembler",
  programId: "Gq1333CkB2sGernk72TKfDVLnHj9LjmeijFujM2ULxJz",
  idlDir: path.join(__dirname, "src", "idl"),
  sdkDir: path.join(__dirname, "src", "generated", "assembler"),
  binaryInstallDir: path.join(__dirname, ".crates"),
  programDir: path.join(__dirname, "programs", "assembler"),
};
