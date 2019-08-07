const chalk = require('chalk')

const header = chalk.dim('elm-live:')

const hotReloadOn =
`${header}
  ${chalk.bold('Hot Reloading is ') + chalk.bold.green('ON')}

  ${chalk.magenta.bold('Warning:')} Hot Reloading does not replay the messages of the app.
  It just restores the previous state and can lead to bad state.
  If this happen, reload the app in the browser manually to fix it.
`

const wrongLocation =
`${chalk.red(`-- Output In Wrong Location -----------------`)}

You have used the ${chalk.blue('elm make')} flag --output in the wrong location. As seen in the usage example about, all ${chalk.blue('elm make')} flags must be added to your command after the -- separator.
`

const needsJs =
`${chalk.red(`-- Needs JS Output When Hot Reloading ------`)}

You have turned hot reloading on, but for hot reloading to work you need to load your Elm code through an external JS file. You can learn more about how to do this using the --output flag by reading the following section of the elm guide on JavaScript Interop: <${chalk.blue('https://guide.elm-lang.org/interop/')}>
`

const missingProxy =
`${chalk.red(`-- Missing Proxy Flag ----------------------`)}

You have used the proxy flags incorrectly. If you are using the proxy flags you must include both ${chalk.blue('--proxyHost')} and ${chalk.blue('--proxyPrefix')}. You cannot use one without the other.
`

const flagError = `

${chalk.red.bold(`----------------------`)}
${chalk.red.bold(`|| ERROR IN COMMAND ||`)}
${chalk.red.bold(`----------------------`)}


Usage: ${chalk.blue('<elm-main> [options] [--] [elm make options]')}
`

const flagErrorMsgs = {
  wrongLocation,
  needsJs,
  missingProxy
}

const help = () =>
  `
    Only ${chalk.magenta('<elm-main>')} is required. If you want to pass on specific options to ${chalk.blue.underline('elm make')} make sure they are passed after the -- in the command.

    If you have any problems, do not hesitate to file an issue:

      <${chalk.blue('https://github.com/wking-io/elm-live')}>
`

const commandError = (cmd, error) =>
  `${header}
  Error while calling ${chalk.bold(cmd)}! This output may be helpful:

  ${error}

  Keep calm and take your time to check why the command is failing. We’ll try to run it again as soon as you change an Elm file.
`

const compileError = error =>
  `${error}

${header}
  You have a compiler error. No biggie, just read the error above and figure out what's up
`

const elmNotFound = pathToElm =>
  `${header}
  I can’t find the command ${chalk.bold(pathToElm)}!

  Looks like ${chalk.bold(
    'elm'
  )} isn’t installed. Make sure you’ve followed the steps at https://github.com/elm/compiler and that you can call ${chalk.bold(
  pathToElm
)} from your command line.

  If that fails, have a look at open issues:
  https://github.com/wking-io/elm-live/issues .
`

const buildError = error =>
  `${header}

${error}
`

const buildSuccess = open =>
  `${header}
  The build has succeeded. ${
  open
    ? ` We’ll open your app in the default browser as soon as it’s up and running.`
    : ''
}
`

const watchingDirs = sourceDirs =>
  `${header}
  Watching the following files:
    ${sourceDirs
    .map(dir => `- ${chalk.blue.bold(dir)}`)
    .join('\n    ')}
`

const eventNotification = (event, path) => (isBrowser = false) => {
  const msg = `You’ve ${event} \`${path}\`. Rebuilding!`
  return isBrowser ? msg
    : `${header}
  ${msg}
`
}

const serverStarted = model =>
  `
${header}
  Server has been started! Server details below:
    - Website URL: ${chalk.blue.bold((model.ssl ? 'https://' : 'http://') + (model.host || 'localhost') + ':' + (model.port || 1234))}
    - Serving files from: ${chalk.blue.bold(model.dir || process.cwd())}
  ${model.proxyPrefix && model.proxyHost
    ? `  - Proxying requests starting with ${chalk.blue.bold(model.proxyPrefix)} to ${chalk.blue.bold(model.proxyHost)}`
    : ''}
`

module.exports = {
  hotReloadOn,
  flagError,
  flagErrorMsgs,
  help,
  commandError,
  elmNotFound,
  buildError,
  buildSuccess,
  watchingDirs,
  eventNotification,
  compileError,
  serverStarted
}
