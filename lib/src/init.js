/**
 * parseOutput :: [ String ] -> String
 *
 * This function takes in the elm args and pulls out the value assigned to the output arg.
 **/
const parseOutput = args => args
  .find(arg => arg.includes('--output='))
  .match(/--output=(.*)/)[1]

/**
 * init :: { program: Program, input: Stream, output: Stream } -> Model
 *
 * This function takes in the program object and the input/output streams and builds the Model that the rest of the application will use to work.
 **/
const init = ({ program, input, output }) => ({
  after: program.afterBuild || false,
  before: program.beforeBuild || false,
  build: false,
  cwd: process.cwd(),
  dir: program.dir || process.cwd(),
  elm: program.pathToElm || 'elm',
  elmArgs: program.args || [],
  getAction: key => ({
    reload: program.hot !== false ? 'hotReload' : 'coldReload',
    compile: 'compiling',
    error: 'error',
    buildFailure: 'failure',
    watch: 'watching'
  }[key]),
  host: program.host || 'localhost',
  hot: program.hot || false,
  ide: program.ide || 'atom',
  input,
  log: console.log,
  notify: program.notify !== false,
  open: program.open || false,
  output,
  port: program.port || 8000,
  proxyPrefix: program.proxyPrefix || false,
  proxyHost: program.proxyHost || false,
  pushstate: program.pushstate || false,
  recover: program.recover !== false,
  server: false,
  ssl: program.ssl || false,
  startPage: program.startPage || 'index.html',
  target: parseOutput(program.args),
  verbose: program.verbose || false
})

/*
|-------------------------------------------------------------------------------
| Export
|-------------------------------------------------------------------------------
*/

module.exports = {
  init
}
