// build.js

const spawnSync = require('cross-spawn').sync
const { commandNotFound, commandError, elmNotFound } = require('./messages')

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

module.exports = {
  secondaryBuild,
  elmBuild
}
