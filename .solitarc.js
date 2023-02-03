const path = require("path");

module.exports = {
  idlGenerator: "anchor",
  programName: "assembler",
  programId: "4cEhZgkh41JbuXsXdcKhNaeHJ2BpzmXN3VpMQ3nFPDrp",
  idlDir: path.join(__dirname, "src", "idl"),
  sdkDir: path.join(__dirname, "src", "generated", "assembler"),
  binaryInstallDir: path.join(__dirname, ".crates"),
  programDir: path.join(__dirname, "programs", "assembler"),
};
