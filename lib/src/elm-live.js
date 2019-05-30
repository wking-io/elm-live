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

  const path = require('path')
  const elmServe = require('elm-serve')
  const chokidar = require('chokidar')
  const debounce = require('./debounce')
  const getSourceDirs = require('./get-source-dirs')
  const { buildSuccess, watchingDirs, eventNotification } = require('./messages')
  const { secondaryBuild, elmBuild } = require('./build')

  // Build logic
  const build = () => {
    if (args.hasOwnProperty('beforeBuild')) {
      const beforeBuild = secondaryBuild({
        cmd: args.beforeBuild,
        input: inputStream,
        output: outputStream,
        recover: args.recover
      })

      if (beforeBuild.exitCode !== SUCCESS) {
        return beforeBuild
      }
    }

    const elmMake = elmBuild({
      cmd: args.pathToElm,
      options: ['make', ...args.elmMakeArgs],
      input: inputStream,
      output: outputStream,
      recover: args.recover
    })

    if (elmMake.exitCode !== SUCCESS) {
      return elmMake
    }

    if (args.hasOwnProperty('afterBuild')) {
      const afterBuild = secondaryBuild({
        cmd: args.afterBuild,
        input: inputStream,
        output: outputStream,
        recover: args.recover
      })

      if (afterBuild.exitCode !== SUCCESS) {
        return afterBuild
      }
    }

    return elmMake
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
