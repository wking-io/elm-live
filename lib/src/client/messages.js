const chalk = require('chalk')

const header = chalk.dim('elm-live:')

const commandNotFound = cmd =>
  `
${header}
  I can’t find the command ${chalk.bold(
    cmd
  )}! Please make sure you can call ${chalk.bold(cmd)} from your command line.

`

const commandError = (cmd, error, recoveryOn) =>
  `
${header}
  Error while calling ${chalk.bold(cmd)}! This output may be helpful:

  ${error}

${
  recoveryOn
    ? `
  Keep calm and take your time to check why the command is failing. We’ll try to run it again as soon as you change an Elm file.
`
    : ''
}

`

const commandFailure = cmd =>
  `
${header}
${chalk.bold('Okay two things!')}
- One: You had an error running the following command: ${cmd}.
- Two: Node is going to output some scary error below...ignore it. It is only showing because you turned recovery off.

`

const compileError =
`
${header}
${chalk.bold('Okay two things!')}
- One: You have a compiler error. No biggie, just read the error above and figure out what's up
- Two: Node is going to output some scary error below...ignore it. It is only showing because you turned recovery off.

`

const elmNotFound = pathToElm =>
  `
${header}
  I can’t find the command ${chalk.bold(pathToElm)}!

  Looks like ${chalk.bold(
    'elm'
  )} isn’t installed. Make sure you’ve followed the steps at https://github.com/elm/compiler and that you can call ${chalk.bold(
  pathToElm
)} from your command line.

  If that fails, have a look at open issues:
  https://github.com/wking-io/elm-live/issues .

`

const buildSuccess = open =>
  `
${header}
  The build has succeeded. Starting the server!${
  open
    ? ` We’ll open your app in the default browser as soon as it’s up and running.`
    : ''
}

`

const watchingDirs = sourceDirs =>
  `
${header}
  Watching
    ${sourceDirs.join('\n    ')}.

`

const eventNotification = (event, path) =>
  `
${chalk.dim('elm-live:')}
  You’ve ${event} \`${path}\`. Rebuilding!

`

module.exports = {
  commandNotFound,
  commandError,
  elmNotFound,
  buildSuccess,
  watchingDirs,
  eventNotification,
  compileError,
  commandFailure,
  emptyLine: console.log(' ')
}
