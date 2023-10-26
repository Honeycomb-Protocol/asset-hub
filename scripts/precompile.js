const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log(process.env.NODE_AUTH_TOKEN);

// write the version in cargo.toml of all programs
const packages = fs.readdirSync("packages");
packages.forEach((package) => {
  if (package === "idl") return;

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
});
