#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const mime = require('mime')
const { hotReloadOn, flagError, flagErrorMsgs, help } = require('../lib/src/messages')

program
  .version(require('../package.json').version)
  .arguments('<elm-main>')
  .usage(`${chalk.magenta('<elm-main>')} [options] [--] [elm make options]`)
  // Elm executable
  .option('-e, --path-to-elm [path-to-elm]', `An absolute or relative path to elm. If you’ve installed elm locally with npm you’ll want to set this to ${chalk.cyan.underline('node_modules/.bin/elm')}.`, 'elm')

  // Server
  .option('-p, --port [port]', 'The port to bind to.', Math.floor, 8000)
  .option('-h, --host [host]', 'Set the host interface to attach the server to.', 'localhost')

  // SSL
  .option('-S, --ssl [ssl]', 'Start an https server instead of http.', false)
  .option('-c, --ssl-cert [cert]', 'Pass in a relative path to your own ssl cert.', false)
  .option('-k, --ssl-key [key]', 'Pass in a relative path to your own ssl key.', false)

  // Proxy
  .option(
    '-x, --proxy-prefix [prefix]',
    `Proxy requests for paths starting with the passed in prefix to another server. Requires ${chalk.cyan.underline('--proxyHost')} and should be a string like ${chalk.cyan.underline('/api')}.`
  )
  .option(
    '-y, --proxy-host [proxyhost]',
    `The location to proxy the requests captured under ${chalk.cyan.underline('--proxyPrefix')}. Requires ${chalk.cyan.underline('--proxyPrefix')} and should be a full URL, eg. http://localhost:9000.`
  )

  // File System
  .option('-d, --dir [dir]', 'The base for static content.', process.cwd())
  .option('-s, --start-page [start-page]', 'Specify a custom HTML file', 'index.html')

  // Booleans
  .option('-u, --pushstate [pushstate]', `Forces the index.html or whatever filename you have passed to the --start-page flag to always be served. Must be used when building with ${chalk.cyan.underline('Browser.application')}.`, false)
  .option('-H, --hot [hot]', 'Turn on hot module reloading.', false)
  .option('-o, --open [open]', 'Open in browser when server starts.', false)
  .option('-v, --verbose [verbose]', 'Will log more steps as your server starts up.', false)
  .option('--no-reload [no-releoad]', 'Turn off live reload. This means you will need to manual reload your website after each build to see the changes.')
  .option('--no-server [no-server]', 'Turn off the server for elm-live. This is useful when you are using elm inside of another development ecosystem.')
  .on('--help', help)
  .parse(process.argv)

const errorReducer = isHot => ([past, flags], arg) => {
  const isOutput = arg.includes('--output')
  if (!past && isOutput) {
    flags.wrongLocation = true
  }

  if (isHot && isOutput) {
    const target = arg.split('=')[1]
    const outputType = mime.getType(target)
    if (outputType !== 'application/javascript') {
      flags.needsJs = true
    }
  }

  return [past || arg === '--', flags]
}

const flagErrors = Object.entries(program.rawArgs.reduce(errorReducer(program.hot), [false, {
  wrongLocation: false,
  needsJs: false,
  missingProxy: (program.proxyPrefix && !program.proxyHost) ||
  (program.proxyHost && !program.proxyPrefix)
}]).pop()).reduce((acc, [key, value]) => value ? [...acc, flagErrorMsgs[key]] : acc, [])

if (flagErrors.length > 0) {
  console.log(flagError)
  flagErrors.forEach(msg => console.log(msg))
} else {
  if (program.hot) {
    console.log(hotReloadOn)
  }
  const elmLive = require('../lib')
  elmLive(program)
}
