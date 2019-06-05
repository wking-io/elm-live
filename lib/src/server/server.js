const http = require('http')
const https = require('https')
const path = require('path')
const os = require('os')
const elmReload = require('./reload')
const fs = require('fs')
const opn = require('opn')
const chalk = require('cli-color')
const internalIp = require('internal-ip')
const serveStatic = require('serve-static')
const finalhandler = require('finalhandler')
const URL = require('url-parse')
const { serverStarted } = require('../messages')

module.exports = function server (config) {
  if ((config.proxyPrefix && !config.proxyHost) || (config.proxyHost && !config.proxyPrefix)) {
    throw new Error('If either `--proxyPrefix` and `--proxyHost` is given, the other must be as well')
  }

  const ip = internalIp.v4.sync()
  const reloadOpts = {
    port: config.port,
    verbose: config.verbose
  }
  const runFile = path.join(
    os.tmpdir(),
    'reload-' +
      Math.random()
        .toString()
        .slice(2)
  )

  let reloadReturned

  const serve = serveStatic(config.dir, { index: ['index.html', 'index.htm'] })

  const proxy = (typeof config.proxyPrefix === 'string' && typeof config.proxyHost === 'string')
    ? require('http-proxy').createProxyServer()
    : false

  function handler (req, res) {
    const url = new URL(req.url)

    if (proxy && url.pathname.startsWith(config.proxyPrefix)) {
      proxy.web(req, res, { target: config.proxyHost })
      return
    }

    const pathname = url.pathname.replace(/(\/)(.*)/, '$2') // Strip leading `/` so we can find files on file system
    const fileEnding = pathname.split('.')[1]

    if (
      (config.pushstate && fileEnding === undefined) ||
    fileEnding === 'html' ||
    pathname === '/' ||
    pathname === ''
    ) {
      const finalpath =
      pathname === '/' || pathname === ''
        ? config.dir + '/' + config.startPage
        : config.dir + '/' + config.pathname

      fs.readFile(finalpath, 'utf8', function (err, contents) {
        if (err) {
          const rootpath = config.dir + '/' + config.startPage
          fs.readFile(rootpath, 'utf8', function (err, contents) {
            if (err) {
              res.writeHead(404, { 'Content-Type': 'text/plain' })
              res.end('File Not Found')
            } else {
              res.setHeader('Content-Type', 'text/html')
              res.end(
                `${contents} \n\n<!-- Inserted by Reload -->\n<script src="/reload/reload.js"></script>\n<!-- End Reload -->\n`
              )
            }
          })
        } else {
          res.setHeader('Content-Type', 'text/html')
          res.end(
            `${contents} \n\n<!-- Inserted by Reload -->\n<script src="/reload/reload.js"></script>\n<!-- End Reload -->\n`
          )
        }
      })
    } else if (pathname === 'reload/reload.js') {
    // Server reload-client.js file from injected script tag
      res.setHeader('Content-Type', 'text/javascript')
      res.end(reloadReturned.reloadClientCode())
    } else {
    // Serve any other file using serve-static
      serve(req, res, finalhandler(req, res))
    }
  }

  function listener () {
    if (!fs.existsSync(runFile)) {
      fs.writeFileSync(runFile)

      // If openBrowser, open the browser with the given start page above, at a hostname (localhost default or specified).
      if (config.openBrowser) {
        const protocol = config.ssl ? 'https://' : 'http://'
        opn(protocol + config.hostname + ':' + config.port)
      }
    } else {
      const time = new Date()
      console.log(
        chalk.green('Server restarted at ' + time.toTimeString().slice(0, 8))
      )
    }
  }

  if (config.ssl) {
    const pem = require('pem')
    const baseNames = [ 'localhost', '127.0.0.1' ]
    const altNames = (ip && baseNames.indexOf(ip) === -1)
      ? [ip, ...baseNames]
      : baseNames

    pem.createCertificate({
      days: 1,
      selfSigned: true,
      commonName: ip,
      altNames
    }, function (err, { serviceKey, certificate }) {
      if (err) throw new Error(err)
      const server = https.createServer({ key: serviceKey, cert: certificate }, handler)
      reloadReturned = elmReload(reloadOpts, server)
      server.listen(config.port, listener)
    })
  } else {
    const server = http.createServer(handler)
    reloadReturned = elmReload(reloadOpts, server)
    server.listen(config.port, listener)
  }
  config.output.write(serverStarted)
}
