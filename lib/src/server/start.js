const Async = require('crocks/Async')
// const http = require('http')
// const https = require('https')
// const path = require('path')
// const os = require('os')
// const fs = require('fs')
// const opn = require('opn')
// const chalk = require('chalk')
// const internalIp = require('internal-ip')
// const { serverStarted } = require('../messages')
// const elmReload = require('./reload')
// const { handler } = require('./handler')

const start = model => Async((reject, resolve) => {
  return resolve({
    server: {
      sendMessage (msg) {
        model.log(msg)
      }
    }
  })
})

// function refactorThis (model) {
//   if ((model.proxyPrefix && !model.proxyHost) || (model.proxyHost && !model.proxyPrefix)) {
//     throw new Error('If either `--proxyPrefix` and `--proxyHost` is given, the other must be as well')
//   }

//   const ip = internalIp.v4.sync()
//   const reloadOpts = {
//     port: model.port,
//     verbose: model.verbose
//   }
//   const runFile = path.join(
//     os.tmpdir(),
//     'reload-' +
//       Math.random()
//         .toString()
//         .slice(2)
//   )

//   let reloadReturned

//   function listener () {
//     if (!fs.existsSync(runFile)) {
//       fs.writeFileSync(runFile)

//       // If openBrowser, open the browser with the given start page above, at a hostname (localhost default or specified).
//       if (model.open) {
//         const protocol = model.ssl ? 'https://' : 'http://'
//         opn(protocol + model.host + ':' + model.port)
//       }
//     } else {
//       const time = new Date()
//       console.log(
//         chalk.green('Server restarted at ' + time.toTimeString().slice(0, 8))
//       )
//     }
//   }

//   if (model.ssl) {
//     const pem = require('pem')
//     const baseNames = [ 'localhost', '127.0.0.1' ]
//     const altNames = (ip && baseNames.indexOf(ip) === -1)
//       ? [ip, ...baseNames]
//       : baseNames

//     pem.createCertificate({
//       days: 1,
//       selfSigned: true,
//       commonName: ip,
//       altNames
//     }, function (err, { serviceKey, certificate }) {
//       if (err) throw new Error(err)
//       const server = https.createServer({ key: serviceKey, cert: certificate }, handler(model, reloadReturned))
//       reloadReturned = elmReload(reloadOpts, server)
//       server.listen(model.port, listener)
//     })
//   } else {
//     const server = http.createServer(handler(model, reloadReturned))
//     reloadReturned = elmReload(reloadOpts, server)
//     server.listen(model.port, listener)
//   }
//   model.log(serverStarted)
// }

function sendMessage (model) {
  model.server.sendMessage(model.build)
  return model
}

module.exports = {
  start,
  sendMessage
}
