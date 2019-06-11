const Async = require('crocks/Async')
const { pipe } = require('crocks/helpers')
const { merge } = require('./utils')
const { build } = require('./build/build')
const { init } = require('./build/init')
const { start, sendMessage } = require('./server/start')
const { watch } = require('./build/watch')

// elmLive :: Model -> Async Model
const elmLive = (config) =>
  Async
    .all([ start(config), build(config) ])
    .map(merge(config))
    .map(sendMessage)
    .chain(watch)
    .fork(config.log, config.log)

module.exports = pipe(init, elmLive)
