#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')

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
  .on('--help', () => {
    console.log(`    Only ${chalk.magenta('<elm-main>')} is required. If you want to pass on specific options to ${chalk.cyan.underline('elm make')} make sure they are passed after the -- in the command.`)
    console.log()
    console.log(
      `    If you have any problems, do not hesitate to file an issue:`
    )
    console.log(
      `      ${chalk.cyan('https://github.com/wking-io/elm-live')}`
    )
    console.log()
  })
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
  console.log(``)
  console.log(chalk.red.bold(`----------------------`))
  console.log(chalk.red.bold(`|| ERROR IN COMMAND ||`))
  console.log(chalk.red.bold(`----------------------`))
  console.log(``)
  console.log(`Usage: ${chalk.blue('<elm-main> [options] [--] [elm make options]')}`)
  console.log(``)
  console.log(`You have used the ${chalk.blue('elm make')} flag --output in the wrong location. As seen in the usage example about, all ${chalk.blue('elm make')} flags must be added to your command after the -- separator.`)
  console.log(``)
  console.log(``)
  console.log(``)
} else {
  const elmLive = require('../lib/src/elm-live')
  elmLive(program, { inputStream: process.stdin, outputStream: process.stdout })
}
