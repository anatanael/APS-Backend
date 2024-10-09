const fs = require("fs-extra");

const pathBuild = "./build";

async function main() {
  await fs.remove(pathBuild);
  await fs.ensureDir(pathBuild);

  await fs.copy("./node_modules", `${pathBuild}/node_modules`);
  await fs.copy("./src", `${pathBuild}/src`);
  await fs.copy("./package.json", `${pathBuild}/package.json`);
}

main();
