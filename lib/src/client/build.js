const spawnSync = require('cross-spawn').sync
const { commandNotFound, commandError, elmNotFound, commandFailure, compileError } = require('./messages')
const { SUCCESS } = require('../utils')

const run = ({ notFoundMsg, errorMsg, failureMsg }) => ({ cmd, options = [], input, output, recover }) => {
  const { error, status } = spawnSync(cmd, options, {
    stdio: [input, output, output]
  })

  // If command is not found log not found message and return fatal
  if (error && error.code === 'ENOENT') {
    output.write(notFoundMsg(cmd))
    return { fatal: true, status }

    // If there is an error from the command log it and return fatal if recover is off
  } else if (error) {
    output.write(errorMsg(cmd, error, recover))
    return { fatal: !recover, status }

    // If there is an error then log it and return fatal if recover is off
  } else if (status !== SUCCESS) {
    output.write(failureMsg)
    return { fatal: !recover, status }
  }

  return { fatal: false, status }
}

const secondaryBuild = run({
  notFoundMsg: commandNotFound,
  errorMsg: commandError,
  failureMsg: commandFailure
})

const elmBuild = run({
  notFoundMsg: elmNotFound,
  errorMsg: commandError,
  failureMsg: compileError
})

// Build logic
const build = ({ input, output, recover, pathToElm, elmMakeArgs, beforeBuild = false, afterBuild = false }) => {
  if (beforeBuild) {
    const before = secondaryBuild({
      cmd: beforeBuild,
      input,
      output,
      recover
    })

    if (before.fatal) {
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

  if (elmMake.fatal) {
    return elmMake
  }

  if (afterBuild) {
    const after = secondaryBuild({
      cmd: afterBuild,
      input,
      output,
      recover
    })

    if (after.fatal) {
      return after
    }
  }

  return elmMake
}

module.exports = {
  build
}
