const Async = require('crocks/Async')
const path = require('path')
const ws = require('ws')

const startWsServer = server => Async((reject, resolve) => {
  const wss = new ws.Server({ server })
  wss.on('connection', () => resolve({
    sendMessage: message => {
      wss.clients.forEach(client => {
        if (client.readyState === ws.OPEN) {
          client.send(JSON.stringify(message))
        }
      })
    }
  }))

  wss.on('error', reject)
})

module.exports = {
  RELOAD_FILE: path.join(__dirname, './websocket.js'),
  startWsServer
}
