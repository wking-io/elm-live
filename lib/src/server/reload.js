const path = require('path')
const ws = require('ws')

function startWsServer (server) {
  const wss = new ws.Server({ server })
  return {
    sendMessage: message => {
      wss.clients.forEach(client => {
        console.log(message)
        if (client.readyState === ws.OPEN) {
          client.send(JSON.stringify(message))
        }
      })
    }
  }
}

module.exports = {
  RELOAD_FILE: path.join(__dirname, './websocket.js'),
  startWsServer
}
