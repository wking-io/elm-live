const path = require('path')
const fs = require('fs')
const ws = require('ws')
const { when, always } = require('../utils')
const { startingWsServer, clientConnected, clientReady, sendingMessage, fileNotFound } = require('../messages')

function send () {

}

function startWsServer (config) {
  config.verboselog(startingWsServer)

  const wss = new ws.Server({ server: config.server })

  wss.on('connection', always(config.verboselog(clientConnected)))

  function sendMessage (message) {
    config.verboseLog(sendingMessage(wss.clients.size, message))

    wss.clients.forEach(when(clientReady, send(message)))
  }

  return {
    ...config,
    ...{
      wss,
      sendMessage
    }
  }
}

function getReloadCode (config) {
  const RELOAD_FILE = path.join(__dirname, './elm-reload-client.js')

  try {
    return fs
      .readFileSync(RELOAD_FILE, 'utf8')
      .replace(
        'verboseLogging = false',
        `verboseLogging = ${config.verbose}`
      )
      .replace(
        'socketUrl.replace()',
        'socketUrl.replace(/(^http(s?):\\/\\/)(.*)/, "ws$2://$3")'
      )
  } catch (e) {
    config.log(fileNotFound(RELOAD_FILE))
  }
}

module.exports = {
  getReloadCode,
  startWsServer
}
