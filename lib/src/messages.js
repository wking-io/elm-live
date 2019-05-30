// messages.js

const chalk = require('chalk')

const header = chalk.dim('elm-live:')

export const missingCommand = cmd =>
  `
${header}
  I can’t find the command ${chalk.bold(
    cmd
  )}! Please make sure you can call ${chalk.bold(cmd)} from your command line.

`

export const commandError = (cmd, error, recoveryOn) =>
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

export const missingElmMake = pathToElm =>
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

export const buildSuccess = open =>
  `
${header}
  The build has succeeded. Starting the server!${
  open
    ? ` We’ll open your app in the default browser as soon as it’s up and running.`
    : ''
}

`

export const watchingDirs = sourceDirs =>
  `
${header}
  Watching
    ${sourceDirs.join('\n    ')}.

`

export const eventNotification = (event, path) =>
  `
${chalk.dim('elm-live:')}
  You’ve ${event} \`${path}\`. Rebuilding!

`
