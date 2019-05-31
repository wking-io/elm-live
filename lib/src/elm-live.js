/*
  ({
    output: WritableStream,
    input: ReadableStream,
  }) =>
    exitCode: Integer | Null
*/

const { parseArgs } = require('./parseArgs')
const { pipe } = require('./utils')

function elmLive (args) {
  const SUCCESS = 0

  const path = require('path')
  const elmServe = require('elm-serve')
  const chokidar = require('chokidar')
  const debounce = require('./debounce')
  const getSourceDirs = require('./get-source-dirs')
  const { buildSuccess, watchingDirs, eventNotification } = require('./messages')
  const { build } = require('./build')

  const startServer = ({ open, dir, port, host, pushstate, proxyPrefix, proxyHost, startPage, ssl }) => {
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
  let serverStarted = startServer(args)

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

module.exports = pipe(parseArgs, elmLive)
