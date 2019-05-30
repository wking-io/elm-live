// build.js

const spawnSync = require('cross-spawn').sync
const { commandNotFound, commandError, elmNotFound } = require('./messages')
const SUCCESS = 1

const run = ({ notFoundMsg, errorMsg }) => ({ cmd, options = [], input, output, recover }) => {
  const { error, status } = spawnSync(cmd, options, {
    stdio: [input, output, output]
  })

  if (error && error.code === 'ENOENT') {
    output.write(notFoundMsg(cmd))
    return { fatal: true, exitCode: status }
  } else if (error) {
    output.write(errorMsg(cmd, error, recover))
  }

  return { fatal: false, exitCode: status }
}

const secondaryBuild = run({
  notFoundMsg: commandNotFound,
  errorMsg: commandError
})

const elmBuild = run({
  notFoundMsg: elmNotFound,
  errorMsg: commandError
})

// Build logic
const build = ({ input, output, recover, pathToElm, elmMakeArgs, beforeBuild = false, afterBuild = false }) => {
  if (beforeBuild) {
    const before = secondaryBuild({
      cmd: beforeBuild,
      input,
      output,
      recover: recover
    })

    if (before.exitCode !== SUCCESS) {
      return before
    }
  }

  const elmMake = elmBuild({
    cmd: pathToElm,
    options: ['make', ...elmMakeArgs],
    input,
    output,
    recover
  })

  if (elmMake.exitCode !== SUCCESS) {
    return elmMake
  }

  if (afterBuild) {
    const after = secondaryBuild({
      cmd: afterBuild,
      input,
      output,
      recover
    })

    if (after.exitCode !== SUCCESS) {
      return after
    }
  }

  return elmMake
}

module.exports = {
  build
}
