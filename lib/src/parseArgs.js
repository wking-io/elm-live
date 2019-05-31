function parseArgs ({ program, input, output }) {
  return {
    afterBuild: program.afterBuild || false,
    beforeBuild: program.beforeBuild || false,
    dir: program.dir || process.cwd(),
    elmMakeArgs: program.args || [],
    host: program.host || 'localhost',
    input,
    open: program.open || false,
    output,
    port: program.port || 8000,
    pathToElm: program.pathToElm || 'elm',
    proxyPrefix: program.proxyPrefix || false,
    proxyHost: program.proxyHost || false,
    pushstate: program.pushstate || false,
    recover: program.recover !== false,
    ssl: program.ssl || false,
    startPage: program.startPage || 'index.html'
  }
}

module.exports = {
  parseArgs
}
