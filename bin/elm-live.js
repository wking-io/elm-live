#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')

program
  .version(require('../package.json').version)
  .arguments('<elm-main>')
  .usage(`${chalk.magenta('<elm-main>')} [options]`)
  .option('-p, --port [port]', 'The port to bind to.', parseInt, 8000)
  .option('-e, --path-to-elm [path-to-elm]', 'An absolute or relative path to elm. If you’ve installed elm locally with npm you’ll want to set this to `node_modules/.bin/elm`.', 'elm')
  .option('-h, --host [host]', 'Set the host interface to attach the server to.', 'localhost')
  .option('-d, --dir [dir]', 'The base for static content.', process.cwd())
  .option('-o, --open [open]', 'Open in browser when server starts.', false)
  .option('-r, --no-recover [no-recover]', `Stop server when ${chalk.cyan.underline('elm make')} runs into an issue. Default: false`, false)
  .option('-u, --pushstate [pushstate]', `Forces the index.html file to always be served. Must be used when building with ${chalk.cyan.underline('Browser.application')}.`, false)
  .option('-b, --before-build [before-build]', `Run EXECUTABLE before every rebuild. This way you can easily use other tools like ${chalk.cyan.underline('elm-css')} or ${chalk.cyan.underline('browserify')} in your workflow.`)
  .option('-a, --after-build [after-build]', `Just like ${chalk.cyan.underline('--before-build')}, but runs after ${chalk.cyan.underline('elm make')}.`)
  .on('--help', () => {
    console.log(`    Only ${chalk.magenta('<elm-main>')} is required.`)
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

const elmLive = require('../source/elm-live')
elmLive(program, { inputStream: process.stdin, outputStream: process.stdout })
