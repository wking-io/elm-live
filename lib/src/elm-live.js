const { parseArgs } = require('./parseArgs')
const { pipe, SUCCESS } = require('./utils')

function elmLive (args) {
  const elmServe = require('elm-serve')
  const { buildSuccess } = require('./messages')
  const { build } = require('./build')
  const { watchElm } = require('./watch')

  const { fatal, exitCode } = build(args)
  if (fatal ||
    (!args.recover && exitCode !== SUCCESS)
  ) {
    return exitCode
  }

  args.output.write(buildSuccess(args.open))
  elmServe({
    watchDir: args.dir,
    port: args.port,
    host: args.host,
    open: args.open,
    dir: args.dir,
    pushstate: args.pushstate,
    proxyPrefix: args.proxyPrefix,
    proxyHost: args.proxyHost,
    startPage: args.startPage,
    ssl: args.ssl
  })
  watchElm(args, exitCode => {
    process.exit(exitCode)
  })

  return null
}

module.exports = pipe(parseArgs, elmLive)
