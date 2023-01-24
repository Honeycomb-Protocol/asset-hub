const path = require("path");

module.exports = {
  idlGenerator: "anchor",
  programName: "assembler",
  programId: "AXX2agYcoDwGFsgEWvSitqfGH4ooKXUqK5P7Ch9raDJT",
  idlDir: path.join(__dirname, "idl"),
  sdkDir: path.join(__dirname, "src", "generated", "assembler"),
  binaryInstallDir: path.join(__dirname, ".crates"),
  programDir: path.join(__dirname, "programs", "assembler"),
};
