const elmServe = require('../server/elm-serve')

function start (config) {
  return { ...config, server: elmServe(config) }
}

module.exports = {
  start
}
