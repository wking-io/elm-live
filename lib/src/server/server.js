const http = require('http')
const https = require('https')
const elmReload = require('./reload')
const fs = require('fs')
const opn = require('opn')
const clc = require('cli-color')
const argv = require('minimist')(process.argv.slice(2))
const internalIp = require('internal-ip')
const serveStatic = require('serve-static')
const finalhandler = require('finalhandler')
const URL = require('url-parse')

const port = argv._[0]
const dir = argv._[1]
const openBrowser = argv._[2] === 'true'
const hostname = argv._[3]
const runFile = argv._[4]
const startPage = argv._[5]
const pushstate = argv._[6] === 'true'
const verbose = argv._[7] === 'true'
const proxyPrefix = argv._[8]
const proxyHost = argv._[9]
const ssl = argv._[10] === 'true'
const ip = internalIp.v4.sync()
const reloadOpts = {
  port: port,
  verbose: verbose
}

let reloadReturned

const serve = serveStatic(dir, { index: ['index.html', 'index.htm'] })

const proxy = (typeof proxyPrefix === 'string' && typeof proxyHost === 'string')
  ? require('http-proxy').createProxyServer()
  : false

function handler (req, res) {
  const url = new URL(req.url)

  if (proxy && url.pathname.startsWith(proxyPrefix)) {
    proxy.web(req, res, { target: proxyHost })
    return
  }

  const pathname = url.pathname.replace(/(\/)(.*)/, '$2') // Strip leading `/` so we can find files on file system
  const fileEnding = pathname.split('.')[1]

  if (
    (pushstate && fileEnding === undefined) ||
    fileEnding === 'html' ||
    pathname === '/' ||
    pathname === ''
  ) {
    const finalpath =
      pathname === '/' || pathname === ''
        ? dir + '/' + startPage
        : dir + '/' + pathname

    fs.readFile(finalpath, 'utf8', function (err, contents) {
      if (err) {
        const rootpath = dir + '/' + startPage
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
    if (openBrowser) {
      const protocol = ssl ? 'https://' : 'http://'
      opn(protocol + hostname + ':' + port)
    }
  } else {
    const time = new Date()
    console.log(
      clc.green('Server restarted at ' + time.toTimeString().slice(0, 8))
    )
  }
}

if (ssl) {
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
    server.listen(port, listener)
  })
} else {
  const server = http.createServer(handler)
  reloadReturned = elmReload(reloadOpts, server)
  server.listen(port, listener)
}
