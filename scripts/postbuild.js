const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const postFix = (package) => {
  const postFixPath = path.join(
    __dirname,
    "..",
    `packages/${package}/post-fix`
  );
  const generatedPath = path.join(
    __dirname,
    "..",
    `packages/${package}/generated`
  );
  if (fs.existsSync(postFixPath)) {
    const dirs = fs.readdirSync(postFixPath);
    dirs.forEach((dir) =>
      execSync(`cp -r ${path.join(postFixPath, dir)} ${generatedPath}`)
    );
  }
};

if (process.env.PROGRAM_NAME) {
  postFix("hpl-" + process.env.PROGRAM_NAME);
} else {
  const packages = fs.readdirSync("packages");
  packages.forEach(postFix);
}
