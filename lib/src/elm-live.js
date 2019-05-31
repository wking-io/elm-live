const { parseArgs } = require('./parseArgs')
const { pipe, SUCCESS } = require('./utils')

function elmLive (args) {
  const elmServe = require('elm-serve')
  const { buildSuccess } = require('./messages')
  const { build } = require('./build')
  const { watchElm } = require('./watch')

  const startServer = ({ open, dir, port, host, pushstate, proxyPrefix, proxyHost, startPage, ssl }) => {
    elmServe({
      watchDir: dir,
      port,
      host,
      open,
      dir,
      pushstate,
      proxyPrefix,
      proxyHost,
      startPage,
      ssl
    })

    return true
  }

  // First build
  const firstBuildResult = build(args)
  if (
    firstBuildResult.fatal ||
    (!args.recover && firstBuildResult.exitCode !== SUCCESS)
  ) {
    return firstBuildResult.exitCode
  }

  args.output.write(buildSuccess(args.open))
  startServer(args)
  watchElm(args)

  return null
}

module.exports = pipe(parseArgs, elmLive)
