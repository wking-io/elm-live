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
    (argv.beforeBuild ? { beforeBuild: argv.beforeBuild } : {}),
    (argv.afterBuild ? { afterBuild: argv.afterBuild } : {})
  )

  const chalk = require('chalk')

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

  const auxiliaryBuild = execPath => {
    const process = spawnSync(execPath, [], {
      stdio: [inputStream, outputStream, outputStream]
    })

    if (process.error && process.error.code === 'ENOENT') {
      outputStream.write(
        `
${chalk.dim('elm-live:')}
  I can’t find the command ${chalk.bold(execPath)}!
  Please make sure you can call ${chalk.bold(execPath)}
  from your command line.

`
      )

      return { fatal: true, exitCode: FAILURE }
    } else if (process.error) {
      outputStream.write(
        `
${chalk.dim('elm-live:')}
  Error while calling ${chalk.bold(execPath)}! This output may be helpful:

  ${process.error}

`
      )
    }

    if (args.recover && process.status !== SUCCESS) {
      outputStream.write(
        `
${chalk.dim('elm-live:')}
  ${chalk.bold(execPath)} failed! You can find more info above. Keep calm
  and take your time to check why the command is failing. We’ll try
  to run it again as soon as you change an Elm file.

`
      )
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
      outputStream.write(
        `
${chalk.dim('elm-live:')}
  I can’t find the command ${chalk.bold(args.pathToElm)}!
  Looks like ${chalk.bold('elm')} isn’t installed. Make sure you’ve followed
  the steps at https://github.com/elm/compiler and that you can call
  ${chalk.bold(args.pathToElm)} from your command line.

  If that fails, have a look at open issues:
  https://github.com/wking-io/elm-live/issues .

`
      )

      return { fatal: true, exitCode: FAILURE }
    } else if (elmMake.error) {
      outputStream.write(
        `
${chalk.dim('elm-live:')}
  Error while calling ${chalk.bold('elm make')}! This output may be helpful:

  ${elmMake.error}

`
      )
    }

    if (args.recover && elmMake.status !== SUCCESS) {
      outputStream.write(
        `
${chalk.dim('elm-live:')}
  ${chalk.bold('elm make')} failed! You can find more info above. Keep calm
  and take your time to fix your code. We’ll try to compile it again
  as soon as you change a file.

`
      )
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
    outputStream.write(
      `
${chalk.dim('elm-live:')}
  The build has succeeded. Starting the server!${args.open
    ? ` We’ll open your app
  in the default browser as soon as it’s up and running.`
    : ''}

`
    )
    elmServe({
      watchGlob: path.join(args.dir, '**/*.{html,css,js}'),
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

  const isPackageFilePath = (relativePath) => {
    return packageFileNames.indexOf(relativePath) > -1
  }

  const watchElmFiles = () => {
    const sourceDirs = getSourceDirs()

    outputStream.write(
      `
${chalk.dim('elm-live:')}
  Watching ${sourceDirs.join(', ')}.

`
    )

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

        outputStream.write(
          `
${chalk.dim('elm-live:')}
  You’ve ${eventName} \`${relativePath}\`. Rebuilding!

`
        )

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
