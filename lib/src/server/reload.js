module.exports = function elmReload (opts = {}, server) {
  // Requires
  const path = require('path')
  const fs = require('fs')

  // Parameter variables
  const verboseLogging = opts.verbose === true || opts.verbose === 'true'

  // Application variables
  const RELOAD_FILE = path.join(__dirname, './websocket.js')
  let reloadCode = fs.readFileSync(RELOAD_FILE, 'utf8')

  // Websocket server variables
  const ws = require('ws')
  const WebSocketServer = ws.Server
  var wss

  if (arguments.length === 0) {
    throw new TypeError(
      'Lack of/invalid arguments provided to reload',
      'reload.js',
      7
    )
  }

  // Application setup
  if (verboseLogging) {
    reloadCode = reloadCode.replace(
      'verboseLogging = false',
      'verboseLogging = true'
    )
  }

  reloadCode = reloadCode.replace(
    'socketUrl.replace()',
    'socketUrl.replace(/(^http(s?):\\/\\/)(.*)/, "ws$2://$3")'
  )

  startWebSocketServer()

  // Websocket server setup
  function startWebSocketServer () {
    if (verboseLogging) {
      console.log('Starting WebSocket Server')
    }

    wss = new WebSocketServer({ server })

    wss.on('connection', ws => {
      if (verboseLogging) {
        console.log('Reload client connected to server')
      }
    })
  }

  function sendMessage (message) {
    if (verboseLogging) {
      console.log(
        'Sending message to ' + wss.clients.size + ' connection(s): ' + message
      )
    }

    wss.clients.forEach(function each (client) {
      if (client.readyState === ws.OPEN) {
        client.send(message)
      }
    })
  }

  return {
    reload () {
      sendMessage('reload')
    },
    reloadClientCode () {
      return reloadCode
    },
    wss: wss
  }
}
