const path = require('path')
const fs = require('fs')
const ws = require('ws')
const { when } = require('../utils')
const { fileNotFound } = require('../messages')

const send = msg => ({ send }) => send(msg)
const clientReady = ({ readyState }) => readyState === ws.OPEN

function startWsServer (server) {
  const wss = new ws.Server({ server })
  return {
    sendMessage: message => wss.clients.forEach(when(clientReady, send(message)))
  }
}

function getReloadCode (config) {
  const RELOAD_FILE = path.join(__dirname, './elm-reload-client.js')

  try {
    return fs
      .readFileSync(RELOAD_FILE, 'utf8')
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
