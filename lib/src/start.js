const Async = require('crocks/Async')
const { when } = require('crocks/logic')
const { propEq } = require('crocks/predicates')
const { pipe } = require('crocks/helpers')
const { map, chain } = require('crocks/pointfree')
const finalhandler = require('finalhandler')
const http = require('http')
const https = require('https')
const mime = require('mime')
const opn = require('opn')
const os = require('os')
const path = require('path')
const serveStatic = require('serve-static')
const ws = require('ws')
const { update, readFile, always, notExists, writeFile } = require('./utils')
const { fileNotFound, serverStarted } = require('./messages')

/*
|-------------------------------------------------------------------------------
| Relaod
|-------------------------------------------------------------------------------
*/

/**
 * startWsServer :: Server -> Async Error { sendMessage: String -> Never }
 *
 * This function takes in the server object and starts a WebSocket Server. It then resolves when the connection was successfully made with the browser.
 **/
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

/**
 * RELOAD_FILE :: String
 *
 * This just points to the client facing reload file.
 **/
const RELOAD_FILE = path.join(__dirname, './websocket.js')

/*
|-------------------------------------------------------------------------------
| Handler
|-------------------------------------------------------------------------------
*/

/**
 * These are a set of constants to use so we always know we are using/checking the same values.
 **/
const PROXY_TYPE = 'proxy'
const CONTENT_TYPE = 'content'
const RELOAD_TYPE = 'reload'
const STATIC_TYPE = 'static'

/**
 * getProxy :: { proxyPrefix: String, proxyHost: String } -> ProxyServer|Bool
 *
 * This function takes in the proxy values and makes sure they are valid before returning the Proxy Server. If the values are invalid it returns false.
 *
 * TODO: Turn this into a Result ADT.
 **/
const getProxy = ({ proxyPrefix, proxyHost }) => (typeof proxyPrefix === 'string' && typeof proxyHost === 'string')
  ? require('http-proxy').createProxyServer()
  : false

const isRoot = ({ pathname, fileType, pushstate }) =>
  ((pushstate && fileType === null) ||
    pathname === '/' ||
    pathname === '')

function getRequestType ({ pathname, fileType }, { proxyPrefix, pushstate }) {
  if (pathname.startsWith(proxyPrefix)) {
    return PROXY_TYPE
  } else if (
    isRoot({ pathname, pushstate, fileType }) ||
    fileType === 'text/html'
  ) {
    return CONTENT_TYPE
  } else if (pathname === '/reload/reload.js') {
    return RELOAD_TYPE
  } else {
    return STATIC_TYPE
  }
}

function parseUrl (pathname, model) {
  const fileType = pipe(path.extname, mime.getType)(pathname)
  const requestType = getRequestType({ pathname, fileType }, model)
  const rootPath = `${model.dir}/${model.startPage}`
  const fullPath = `${model.dir}${pathname}`
  return {
    fullPath,
    getPath: isRoot({ pathname, pushstate: model.pushstate, fileType }) ? rootPath : fullPath,
    isRoot: isRoot({ pathname, pushstate: model.pushstate, fileType }),
    isType (reqType) { return reqType === requestType }
  }
}

const resolveWith = res => contents => {
  res.setHeader('Content-Type', 'text/html')
  res.end(`

<!-- Inserted by Reload -->
<script src="/reload/reload.js"></script>
<!-- End Reload -->

${contents}
`)
}

function resolveNotFound (res) {
  return function () {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('File Not Found')
  }
}

function resolveReload (res) {
  return function (file) {
    res.setHeader('Content-Type', 'text/javascript')
    res.end(file)
  }
}

function handler (model) {
  const proxy = getProxy(model)
  const serve = serveStatic(model.dir, { index: ['index.html', 'index.htm'] })

  return function (req, res) {
    const url = parseUrl(req.url, model)

    if (proxy && url.isType(PROXY_TYPE)) {
      proxy.web(req, res, { target: model.proxyHost })
    } else if (url.isType(CONTENT_TYPE)) {
      const rootpath = model.dir + '/' + model.startPage
      readFile(url.getPath, 'utf8')
        .alt(readFile(rootpath, 'utf8'))
        .fork(resolveNotFound(res), resolveWith(res))
    } else if (url.isType(RELOAD_TYPE)) {
      readFile(RELOAD_FILE, 'utf8')
        .map(file => file.replace(`'{{verbose}}'`, `${model.verbose}`))
        .fork(file => model.log(fileNotFound(file)), resolveReload(res))
    } else {
      serve(req, res, finalhandler(req, res))
    }
  }
}

/*
|-------------------------------------------------------------------------------
| Listener
|-------------------------------------------------------------------------------
*/

function maybeOpen (model) {
  return function () {
    if (model.open) {
      const protocol = model.ssl ? 'https://' : 'http://'
      opn(protocol + model.host + ':' + model.port)
    }
    return model
  }
}

// listener
function listener (model) {
  const runFile = path.join(
    os.tmpdir(),
    'reload-' +
      Math.random()
        .toString()
        .slice(2)
  )

  notExists(runFile)
    .chain(writeFile)
    .bimap(always(model), maybeOpen(model))
    .fork(
      ({ log }) => log(serverStarted(model)),
      ({ log }) => log(serverStarted(model))
    )
}

/*
|-------------------------------------------------------------------------------
| Start Helpers
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

function sendCompilingMessage (message) {
  return function send (server) {
    server.sendMessage({ action: 'compiling', message })
    return server
  }
}

function sendMessage (model) {
  model.server.sendMessage(model.build)
  return model
}

const start = model => pipe(
  when(propEq('ssl'), generateSsl),
  map(startServer(model.ssl ? https : http)),
  map(setupListener),
  chain(startWs),
  map(sendCompilingMessage('First Build.'))
)(model)

module.exports = {
  start,
  sendMessage,
  sendCompilingMessage
}
