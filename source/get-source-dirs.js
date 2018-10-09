const path = require('path')
const fs = require('fs')

const defaultElmDirs = ['**/*.elm']

function getSourceDirs (packageFilePath) {
  try {
    const elmPackage = JSON.parse(fs.readFileSync(packageFilePath))
    const sourceDirs = elmPackage['source-directories']
    if (sourceDirs !== undefined) {
      return sourceDirs.map(dir => path.join(dir, '/**/*.elm'))
    } else {
      return defaultElmDirs
    }
  } catch (e) {
    // Do nothing about the exception (in parsing JSON) because the Elm compiler
    // will also parse the file and report the error - and elm-live will show it
    // to the user. We don't want to report the same error twice.
    return defaultElmDirs
  }
}

module.exports = (workPath = process.cwd()) => {
  const elmJsonPath = path.join(workPath, 'elm.json')
  const elmPackageJsonPath = path.join(workPath, 'elm-package.json')

  if (fs.existsSync(elmJsonPath)) {
    return getSourceDirs(elmJsonPath)
  } else if (fs.existsSync(elmPackageJsonPath)) {
    return getSourceDirs(elmPackageJsonPath)
  } else {
    return defaultElmDirs
  }
}
