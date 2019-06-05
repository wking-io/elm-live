const { pipe, SUCCESS } = require('./utils')
const { build } = require('./client/build')
const { buildSuccess } = require('./messages')
const { parse } = require('./client/parse')
const { start } = require('./client/start')
const { watch } = require('./client/watch')

function elmLive (config) {
  const { fatal, status } = build(config)
  if (fatal ||
    (!config.recover && status !== SUCCESS)
  ) {
    return status
  }

  config.output.write(buildSuccess(config.open))
  config = start(config)
  watch(config, status => {
    process.exit(status)
  })

  return null
}

module.exports = pipe(parse, elmLive)
