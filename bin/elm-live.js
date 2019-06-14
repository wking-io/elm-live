#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const { badOutput, badProxy, help } = require('../lib/src/messages')

program
  .version(require('../package.json').version)
  .arguments('<elm-main>')
  .usage(`${chalk.magenta('<elm-main>')} [options] [--] [elm make options]`)
  .option('-p, --port [port]', 'The port to bind to.', Math.floor, 8000)
  .option('-e, --path-to-elm [path-to-elm]', 'An absolute or relative path to elm. If you’ve installed elm locally with npm you’ll want to set this to `node_modules/.bin/elm`.', 'elm')
  .option('-h, --host [host]', 'Set the host interface to attach the server to.', 'localhost')
  .option('-d, --dir [dir]', 'The base for static content.', process.cwd())
  .option('-o, --open [open]', 'Open in browser when server starts.', false)
  .option('-r, --no-recover [no-recover]', `Stop server when ${chalk.cyan.underline('elm make')} runs into an issue.`)
  .option('-u, --pushstate [pushstate]', `Forces the index.html file to always be served. Must be used when building with ${chalk.cyan.underline('Browser.application')}.`, false)
  .option('-s, --start-page [start-page]', 'Specify a custom HTML file', 'index.html')
  .option(
    '-x, --proxyPrefix [prefix]',
    'Proxy requests to paths starting with `prefix` to another server. Requires `--proxyHost` and should be a string like `/api`. Defaults to not proxying'
  )
  .option(
    '-y, --proxyHost [proxyhost]',
    'Proxy requests to another server running at `host`. Requires `--proxyHost` and should be a full URL, eg. `http://localhost:9000`. Defaults to not proxying'
  )
  .option('-S, --ssl [ssl]', `Start an https server instead of http. Defaults to false.`, false)
  .option('-b, --before-build [before-build]', `Run EXECUTABLE before every rebuild. This way you can easily use other tools like ${chalk.cyan.underline('elm-css')} or ${chalk.cyan.underline('browserify')} in your workflow.`)
  .option('-a, --after-build [after-build]', `Just like ${chalk.cyan.underline('--before-build')}, but runs after ${chalk.cyan.underline('elm make')}.`)
  .option('-v, --verbose [verbose]', 'Will log more steps as your server starts up. Default: false', false)
  .option('-i, --ide [ide]', 'Set the ide that you use so that the errors in the browser will open the file the error is found in. Default: atom', 'atom')
  .option('-H, --no-hot [no-hot]', 'Turn off hot module reloading.')
  .option('-n, --no-notify-browser [no-notify]', 'Turn off the compiling message in the browser.')
  .on('--help', help)
  .parse(process.argv)

function hasBadOutput ([val, done], arg) {
  if (done) {
    return [val, done]
  } else if (arg === '--') {
    return [val, true]
  }

  return arg.includes('--output') ? [true, true] : [false, false]
}

const [ isBadOutput ] = program.rawArgs.reduce(hasBadOutput, [false, false])

if (isBadOutput) {
  process.stdout.write(badOutput)
} else if (
  (program.proxyPrefix && !program.proxyHost) ||
  (program.proxyHost && !program.proxyPrefix)
) {
  process.stdout.write(badProxy)
} else {
  const elmLive = require('../lib')
  elmLive({ program, input: process.stdin, output: process.stdout })
}
