const path = require("path");

const programId = "7cJdKSjPtZqiGV4CFAGtbhhpf5CsYjbkbEkLKcXfHLYd"
const prefix = "hpl asset"
const programName = "manager"; // with spaces
const programFullName = prefix + " " + programName;

module.exports = {
  idlGenerator: "anchor",
  programName: programFullName.replaceAll(" ", "_"),
  programId,
  idlDir: path.join(__dirname, "packages", "idl"),
  sdkDir: path.join(__dirname, "packages", programFullName.replaceAll(" ", "-"), "generated"),
  binaryInstallDir: path.join(__dirname, ".crates"),
  programDir: path.join(__dirname, "programs", programFullName.replaceAll(" ", "-")),
};