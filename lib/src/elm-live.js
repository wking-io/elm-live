const Async = require('crocks/Async')
const { pipe } = require('crocks/helpers')
const { merge } = require('./utils')
const { build } = require('./build')
const { init } = require('./init')
const { start, sendMessage } = require('./start')
const { watch } = require('./watch')

// elmLive :: Model -> Async Model
const elmLive = model =>
  Async
    .all([ start(model), build(model) ])
    .map(merge(model))
    .map(sendMessage)
    .chain(watch)
    .fork(model.log, model.log)

module.exports = pipe(init, elmLive)
