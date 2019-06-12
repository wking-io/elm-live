const path = require('path')
const os = require('os')
const opn = require('opn')
const { serverStarted, serverRestarted } = require('../messages')
const { always, notExists, writeFile } = require('../utils')

function maybeOpen (model) {
  return function () {
    if (model.open) {
      const protocol = model.ssl ? 'https://' : 'http://'
      opn(protocol + model.host + ':' + model.port)
    }
    return model
  }
}

// listener
function listener (model) {
  const runFile = path.join(
    os.tmpdir(),
    'reload-' +
      Math.random()
        .toString()
        .slice(2)
  )

  notExists(runFile)
    .chain(writeFile)
    .bimap(always(model), maybeOpen(model))
    .fork(
      ({ log }) => log(serverRestarted()),
      ({ log }) => log(serverStarted())
    )
}

module.exports = {
  listener
}
