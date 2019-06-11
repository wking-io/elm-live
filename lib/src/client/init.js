function parseOutput (program) {
  return program
}

function init ({ program, input, output }) {
  return {
    after: program.afterBuild || false,
    before: program.beforeBuild || false,
    build: false,
    dir: program.dir || process.cwd(),
    elmArgs: program.args || [],
    host: program.host || 'localhost',
    hot: program.hot || true,
    ide: program.ide || 'atom',
    input,
    log: output.write,
    open: program.open || false,
    output,
    port: program.port || 8000,
    elm: program.pathToElm || 'elm',
    proxyPrefix: program.proxyPrefix || false,
    proxyHost: program.proxyHost || false,
    pushstate: program.pushstate || false,
    recover: program.recover !== false,
    server: false,
    ssl: program.ssl || false,
    startPage: program.startPage || 'index.html',
    target: parseOutput(program),
    getAction: key => ({
      reload: program.hot ? 'hotReload' : 'coldReload',
      compile: 'compiling',
      error: 'error',
      buildFailure: 'failure'
    }[key])
  }
}

module.exports = {
  init
}
