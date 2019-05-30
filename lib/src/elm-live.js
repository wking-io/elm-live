/*
  ({
    outputStream: WritableStream,
    inputStream: ReadableStream,
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
      startPage: argv.startPage || 'index.html'
    },
    argv.beforeBuild ? { beforeBuild: argv.beforeBuild } : {},
    argv.afterBuild ? { afterBuild: argv.afterBuild } : {}
  )

  const outputStream = options.outputStream
  const inputStream = options.inputStream

  const SUCCESS = 0
  const FAILURE = 1

  const path = require('path')
  const spawnSync = require('cross-spawn').sync
  const elmServe = require('elm-serve')
  const chokidar = require('chokidar')
  const debounce = require('./debounce')
  const getSourceDirs = require('./get-source-dirs')
  const { missingCommand, commandError, missingElmMake, buildSuccess, watchingDirs, eventNotification } = require('./messages')

  const auxiliaryBuild = cmd => {
    const process = spawnSync(cmd, [], {
      stdio: [inputStream, outputStream, outputStream]
    })

    if (process.error && process.error.code === 'ENOENT') {
      outputStream.write(missingCommand(cmd))
      return { fatal: true, exitCode: FAILURE }
    } else if (process.error) {
      outputStream.write(commandError(cmd, process.error, args.recover))
    }

    return { fatal: false, exitCode: process.status }
  }

  // Build logic
  const build = () => {
    if (args.hasOwnProperty('beforeBuild')) {
      const beforeBuild = auxiliaryBuild(args.beforeBuild)
      if (beforeBuild.exitCode !== SUCCESS) {
        return beforeBuild
      }
    }

    const elmMake = spawnSync(args.pathToElm, ['make', ...args.elmMakeArgs], {
      stdio: [inputStream, outputStream, outputStream]
    })

    if (elmMake.error && elmMake.error.code === 'ENOENT') {
      outputStream.write(missingElmMake(args.pathToElm))
      return { fatal: true, exitCode: FAILURE }
    } else if (elmMake.error) {
      outputStream.write(commandError('elm make', elmMake.error, args.recover))
    }

    if (args.hasOwnProperty('afterBuild')) {
      const afterBuild = auxiliaryBuild(args.afterBuild)
      if (afterBuild.exitCode !== SUCCESS) {
        return afterBuild
      }
    }

    return { fatal: false, exitCode: elmMake.status }
  }

  // Server logic
  let serverStarted
  const startServer = () => {
    outputStream.write(buildSuccess(args.open))
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

    serverStarted = true
  }

  // First build
  const firstBuildResult = build()
  if (
    firstBuildResult.fatal ||
    (!args.recover && firstBuildResult.exitCode !== SUCCESS)
  ) {
    return firstBuildResult.exitCode
  } else if (firstBuildResult.exitCode === SUCCESS) {
    startServer()
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

  const watchElmFiles = () => {
    const sourceDirs = getSourceDirs()

    outputStream.write(watchingDirs(sourceDirs))

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

        outputStream.write(eventNotification(eventName, relativePath))

        const buildResult = build()
        if (!serverStarted && buildResult.exitCode === SUCCESS) {
          startServer()
        }

        if (isPackageFilePath(relativePath)) {
          // Package file changes may result in changes to the set
          // of watched files
          watcher.close()
          watcher = watchElmFiles()
        }
      }),
      100
    )
  }

  watchElmFiles()

  return null
}
