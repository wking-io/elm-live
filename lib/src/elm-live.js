/*
  ({
    output: WritableStream,
    input: ReadableStream,
  }) =>
    exitCode: Integer | Null
*/
module.exports = (argv, options) => {
  const args = Object.assign(
    {
      port: argv.port || 8000,
      pathToElm: argv.pathToElm || 'elm',
      host: argv.host || 'localhost',
      dir: argv.dir || process.cwd(),
      open: argv.open || false,
      recover: argv.recover !== false,
      pushstate: argv.pushstate || false,
      proxyPrefix: argv.proxyPrefix || false,
      proxyHost: argv.proxyHost || false,
      ssl: argv.ssl || false,
      elmMakeArgs: argv.args || [],
      startPage: argv.startPage || 'index.html',
      input: options.input,
      output: options.output
    },
    argv.beforeBuild ? { beforeBuild: argv.beforeBuild } : {},
    argv.afterBuild ? { afterBuild: argv.afterBuild } : {}
  )

  const SUCCESS = 0

  const path = require('path')
  const elmServe = require('elm-serve')
  const chokidar = require('chokidar')
  const debounce = require('./debounce')
  const getSourceDirs = require('./get-source-dirs')
  const { buildSuccess, watchingDirs, eventNotification } = require('./messages')
  const { build } = require('./build')

  // Server logic
  let serverStarted
  const startServer = ({ output, open, dir, port, host, pushstate, proxyPrefix, proxyHost, startPage, ssl }) => {
    output.write(buildSuccess(open))
    elmServe({
      watchDir: dir,
      port: port,
      host: host,
      open: open,
      dir: dir,
      pushstate: pushstate,
      proxyPrefix: proxyPrefix,
      proxyHost: proxyHost,
      startPage: startPage,
      ssl: ssl
    })

    serverStarted = true
  }

  // First build
  const firstBuildResult = build(args)
  if (
    firstBuildResult.fatal ||
    (!args.recover && firstBuildResult.exitCode !== SUCCESS)
  ) {
    return firstBuildResult.exitCode
  } else if (firstBuildResult.exitCode === SUCCESS) {
    startServer(args)
  }

  const eventNameMap = {
    add: 'added',
    addDir: 'added',
    change: 'changed',
    unlink: 'removed',
    unlinkDir: 'removed'
  }

  const packageFileNames = ['elm.json', 'elm-package.json']

  const isPackageFilePath = relativePath => {
    return packageFileNames.indexOf(relativePath) > -1
  }

  const watchElmFiles = (options) => {
    const sourceDirs = getSourceDirs()

    options.output.write(watchingDirs(sourceDirs))

    let watcher = chokidar.watch(sourceDirs.concat(packageFileNames), {
      ignoreInitial: true,
      followSymlinks: false,
      ignored: 'elm-stuff/generated-code/*'
    })

    watcher.on(
      'all',
      debounce((event, filePath) => {
        const relativePath = path.relative(process.cwd(), filePath)
        const eventName = eventNameMap[event] || event

        options.output.write(eventNotification(eventName, relativePath))

        const buildResult = build(options)
        if (!serverStarted && buildResult.exitCode === SUCCESS) {
          startServer(options)
        }

        if (isPackageFilePath(relativePath)) {
          // Package file changes may result in changes to the set
          // of watched files
          watcher.close()
          watcher = watchElmFiles(options)
        }
      }),
      100
    )
  }

  watchElmFiles(args)

  return null
}
