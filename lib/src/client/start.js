const elmServe = require('elm-serve')

function start (config) {
  return { ...config, server: elmServe(config) }
}

module.exports = {
  start
}
