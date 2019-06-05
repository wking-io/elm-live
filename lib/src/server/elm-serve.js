module.exports = function elmServe (config) {
  const supervisor = require('supervisor')
  const path = require('path')
  const os = require('os')
  const { serverStarted } = require('../messages')

  const runFile = path.join(
    os.tmpdir(),
    'reload-' +
      Math.random()
        .toString()
        .slice(2)
  )

  const serverFile = path.join(__dirname, './server/server.js')

  if (config.proxyPrefix && !config.proxyPrefix.startsWith('/')) {
    config.proxyPrefix = config.proxyPrefix + '/'
  }

  var args = [
    '-e',
    config.exts || 'html|js|css',
    '-w',
    config.watchDir || process.cwd(),
    '-q',
    '--',
    serverFile,
    config.port || 1234,
    config.dir || process.cwd(),
    config.open || false,
    config.host || 'localhost',
    runFile,
    config.startPage || 'index.html',
    config.pushstate || false,
    config.verbose || false,
    config.proxyPrefix || false,
    config.proxyHost || false,
    config.ssl || false
  ]

  if ((config.proxyPrefix && !config.proxyHost) || (config.proxyHost && !config.proxyPrefix)) {
    throw new Error('If either `--proxyPrefix` and `--proxyHost` is given, the other must be as well')
  }

  supervisor.run(args)
  config.output.write(serverStarted)
  return true
}
