const Async = require('crocks/Async')
const { pipe } = require('crocks/helpers')
const { merge, trace } = require('./utils')
const { build } = require('./build')
const { init } = require('./init')
const { start, sendMessage } = require('./server/start')
const { watch } = require('./watch')

// elmLive :: Model -> Async Model
const elmLive = (config) =>
  Async
    .all([ start(config), build(config) ])
    .map(merge(config))
    .map(trace('First message.'))
    .map(sendMessage)
    .chain(watch)
    .fork(config.log, config.log)

module.exports = pipe(init, elmLive)
