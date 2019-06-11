const path = require('path')
const os = require('os')
const fs = require('fs')
const opn = require('opn')
const { serverStarted, serverRestarted } = require('../messages')

// listener
function listener (model) {
  const runFile = path.join(
    os.tmpdir(),
    'reload-' +
      Math.random()
        .toString()
        .slice(2)
  )

  if (!fs.existsSync(runFile)) {
    fs.writeFileSync(runFile)

    // If openBrowser, open the browser with the given start page above, at a hostname (localhost default or specified).
    if (model.open) {
      const protocol = model.ssl ? 'https://' : 'http://'
      opn(protocol + model.host + ':' + model.port)
    }

    const time = new Date()
    model.log(serverStarted(time))
  } else {
    const time = new Date()
    model.log(serverRestarted(time))
  }
}

module.exports = {
  listener
}
