/**
 * parseOutput :: [ String ] -> String
 *
 * This function takes in the elm args and pulls out the value assigned to the output arg.
 **/
const parseOutput = args => {
  const output = args.find(arg => arg.includes('--output='))
  if (output) {
    return output.match(/--output=(.*)/)[1]
  }
  return 'index.html'
}

/**
 * parseOutput :: [ String ] -> String
 *
 * This function takes in the elm args and pulls out the value assigned to the output arg.
 **/
const parseSsl = args => args.sslCert ? ({
  key: args.sslKey,
  cert: args.sslCert
}) : !!args.ssl

/**
 * init :: { program: Program, input: Stream, output: Stream } -> Model
 *
 * This function takes in the program object and the input/output streams and builds the Model that the rest of the application will use to work.
 **/
const init = program => ({
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
  log: console.log,
  open: program.open || false,
  port: program.port || 8000,
  proxyPrefix: program.proxyPrefix || false,
  proxyHost: program.proxyHost || false,
  pushstate: program.pushstate || false,
  reload: program.reload !== false,
  server: false,
  useServer: program.server !== false,
  ssl: parseSsl(program),
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
