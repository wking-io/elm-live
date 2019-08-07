const Async = require('crocks/Async')
const { pipe } = require('crocks/helpers')
const { init } = require('./init')
const { build } = require('./build')
const { start } = require('./start')
const { watch } = require('./watch')
const { merge } = require('./utils')

// elmLive :: Model -> Async Model
const elmLive = model =>
  Async
    .all([ start(model), build(model) ])
    .map(merge(model))
    .chain(watch)
    .fork(pipe(model.log, () => process.exit()), model.log)

module.exports = pipe(init, elmLive)
