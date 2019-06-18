#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const mime = require('mime')
const { flagError, flagErrorMsgs, help } = require('../lib/src/messages')
const { update } = require('../lib/src/utils')

program
  .version(require('../package.json').version)
  .arguments('<elm-main>')
  .usage(`${chalk.magenta('<elm-main>')} [options] [--] [elm make options]`)
  .option('-p, --port [port]', 'The port to bind to.', Math.floor, 8000)
  .option('-e, --path-to-elm [path-to-elm]', `An absolute or relative path to elm. If you’ve installed elm locally with npm you’ll want to set this to ${chalk.cyan.underline('node_modules/.bin/elm')}.`, 'elm')
  .option('-h, --host [host]', 'Set the host interface to attach the server to.', 'localhost')
  .option('-d, --dir [dir]', 'The base for static content.', process.cwd())
  .option('-o, --open [open]', 'Open in browser when server starts.', false)
  .option('-r, --no-recover [no-recover]', `Stop server when ${chalk.cyan.underline('elm make')} runs into an issue.`)
  .option('-u, --pushstate [pushstate]', `Forces the index.html file to always be served. Must be used when building with ${chalk.cyan.underline('Browser.application')}.`, false)
  .option('-s, --start-page [start-page]', 'Specify a custom HTML file', 'index.html')
  .option(
    '-x, --proxyPrefix [prefix]',
    `Proxy requests to paths starting with the passed prefix to another server. Requires ${chalk.cyan.underline('--proxyHost')} and should be a string like ${chalk.cyan.underline('/api')}.`
  )
  .option(
    '-y, --proxyHost [proxyhost]',
    `Proxy requests to another server running at host. Requires ${chalk.cyan.underline('--proxyPrefix')} and should be a full URL, eg. http://localhost:9000.`
  )
  .option('-S, --ssl [ssl]', 'Start an https server instead of http.', false)
  .option('-b, --before-build [before-build]', `Run EXECUTABLE before every rebuild. This way you can easily use other tools like ${chalk.cyan.underline('elm-css')} or ${chalk.cyan.underline('browserify')} in your workflow.`)
  .option('-a, --after-build [after-build]', `Just like ${chalk.cyan.underline('--before-build')}, but runs after ${chalk.cyan.underline('elm make')}.`)
  .option('-v, --verbose [verbose]', 'Will log more steps as your server starts up.', false)
  .option('-i, --ide [ide]', 'Set the ide that you use so that the errors in the browser will open the file the error is found in.', 'atom')
  .option('-H, --hot [hot]', 'Turn on hot module reloading.', false)
  .option('-n, --no-notify-browser [no-notify]', 'Turn off the compiling message in the browser.')
  .on('--help', help)
  .parse(process.argv)

const errorReducer = isHot => ([past, flags], arg) => {
  const isOutput = arg.includes('--output')
  if (!past) {
    update(flags, { wrongLocation: isOutput })
  }

  if (isHot && isOutput) {
    const target = arg.split('=')[1]
    const outputType = mime.getType(target)
    if (outputType !== 'application/javascript') {
      update(flags, { needsJs: true })
    }
  }

  return [past || arg === '--', flags]
}

const flagErrors = program.rawArgs.reduce(errorReducer(program.hot), {
  wrongLocation: false,
  needsJs: false,
  missingProxy: (program.proxyPrefix && !program.proxyHost) ||
  (program.proxyHost && !program.proxyPrefix)
}).entries.reduce((acc, [key, value]) => value ? [...acc, flagErrorMsgs[key]] : acc)

if (flagErrors.length > 0) {
  process.stdout.write(flagError)
  flagErrors.forEach(process.stdout.write)
} else {
  const elmLive = require('../lib')
  elmLive({ program, input: process.stdin, output: process.stdout })
}
