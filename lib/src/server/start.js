const Async = require('crocks/Async')
const { when } = require('crocks/logic')
const { propEq } = require('crocks/predicates')
const { pipe } = require('crocks/helpers')
const { map, chain } = require('crocks/pointfree')
const http = require('http')
const https = require('https')
const { handler } = require('./handler')
const { listener } = require('./listener')
const { startWsServer } = require('./reload')
const { update } = require('../utils')

/*
|-------------------------------------------------------------------------------
| Main Build
|-------------------------------------------------------------------------------
*/
const startServer = protocol => model => update(model, { server: protocol.createServer(model.server, handler(model)) })

const startWs = model => startWsServer(model.server).map(server => update(model.server, server))

const setupListener = model => {
  model.server.listen(model.port, listener(model))
  return model
}

const generateSsl = model => Async((reject, resolve) => {
  const pem = require('pem')
  const internalIp = require('internal-ip')
  const baseNames = [ 'localhost', '127.0.0.1' ]
  const ip = internalIp.v4.sync()
  const altNames = (ip && baseNames.indexOf(ip) === -1)
    ? [ip, ...baseNames]
    : baseNames

  pem.createCertificate({
    days: 1,
    selfSigned: true,
    commonName: ip,
    altNames
  }, function (err, { serviceKey, certificate }) {
    if (err) reject(err)
    resolve(update(model, { server: { key: serviceKey, cert: certificate } }))
  })
})

const sendCompilingMessage = message => server => {
  server.sendMessage({ action: 'compiling', message })
  return server
}

const start = model => pipe(
  when(propEq('ssl'), generateSsl),
  map(startServer(model.ssl ? https : http)),
  map(setupListener),
  chain(startWs),
  map(sendCompilingMessage('First Build.'))
)(model)

function sendMessage (model) {
  model.server.sendMessage(model.build)
  return model
}

module.exports = {
  start,
  sendMessage,
  sendCompilingMessage
}
