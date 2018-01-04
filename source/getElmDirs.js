const defaultElmDirs = "**/*.elm";

module.exports = (workPath = process.cwd()) => {
  const path = require("path");
  const fs = require("fs");

  const elmPackagePath = path.join(workPath, "elm-package.json");

  let elmDirs = defaultElmDirs;
  if (fs.existsSync(elmPackagePath)) {
    const elmPackage = JSON.parse(fs.readFileSync(elmPackagePath));
    const sourceDirs = elmPackage["source-directories"];
    if (sourceDirs !== undefined) {
      elmDirs = sourceDirs.map(dir => path.join(dir, "/**/*.elm"));
    }
  }

  return elmDirs;
};
