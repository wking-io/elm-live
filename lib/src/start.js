const Async = require('crocks/Async')
const { ifElse } = require('crocks/logic')
const { pipe } = require('crocks/helpers')
const { map } = require('crocks/pointfree')
const finalhandler = require('finalhandler')
const http = require('http')
const https = require('https')
const mime = require('mime')
const os = require('os')
const path = require('path')
const serveStatic = require('serve-static')
const ws = require('ws')
const { update, readFile, notExists, writeFile, isObj, hasProp } = require('./utils')
const { fileNotFound, serverStarted } = require('./messages')

/*
|-------------------------------------------------------------------------------
| Relaod
|-------------------------------------------------------------------------------
*/

/**
 * RELOAD_FILE :: String
 *
 * This just points to the client facing reload file.
 **/
const RELOAD_FILE = path.join(__dirname, './websocket.js')

/**
 * startWsServer :: Server -> { wss: WebsocketServer, sendMessage: String -> Never }
 *
 * This function takes in the server object and starts a WebSocket Server.
 **/
const startWsServer = server => {
  const wss = new ws.Server({ server })
  return {
    wss,
    sendMessage: message => {
      wss.clients.forEach(client => {
        if (client.readyState === ws.OPEN) {
          client.send(JSON.stringify(message))
        }
      })
    }
  }
}

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

/**
 * isRoot :: { pathname: String, fileType: String, pushstate: Bool } -> Bool
 *
 * This function returns boolean if the variables passed indicate the root.
 **/
const isRoot = ({ pathname, fileType, pushstate }) =>
  ((pushstate && fileType === null) ||
    pathname === '/' ||
    pathname === '')

/**
 * getRequestType :: ({ pathname: String, fileType: String }, { proxyPrefix: String, pushstate: Bool }) -> String
 *
 * This function returns one of the request type constants defined above using some of the passed in variables from the request.
 **/
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

/**
 * parseUrl :: (String, Model) -> { fullPath: String, getPath: String, isRoot: Bool, isType: String -> Bool}
 *
 * This function takes in the path from the request and the model and returns the needed values to finish running the request.
 **/
function parseUrl (pathname, model) {
  const fileType = pipe(path.extname, mime.getType)(pathname)
  const requestType = getRequestType({ pathname, fileType }, model)
  const rootPath = `${model.dir}/${model.startPage}`
  const fullPath = `${model.dir}${pathname}`
  return {
    rootPath,
    getPath: isRoot({ pathname, pushstate: model.pushstate, fileType }) ? rootPath : fullPath,
    isRoot: isRoot({ pathname, pushstate: model.pushstate, fileType }),
    isType (reqType) { return reqType === requestType }
  }
}

/**
 * resolveWith :: Resolver -> String -> ()
 *
 * This function resolves the request with the passed in contents and includes the reload script.
 **/
const resolveWith = res => contents => {
  res.setHeader('Content-Type', 'text/html')
  res.end(`

<!-- Inserted by Reload -->
<script src="/reload/reload.js"></script>
<!-- End Reload -->

${contents}
`)
}

/**
 * resolveNotFound :: Resolver -> () -> ()
 *
 * This function resolves the request with a 404.
 **/
function resolveNotFound (res) {
  return function () {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('File Not Found')
  }
}

/**
 * resolveReload :: Resolver -> String -> ()
 *
 * This function resolves the request with the passed in contents of the reload file.
 **/
function resolveReload (res) {
  return function (file) {
    res.setHeader('Content-Type', 'text/javascript')
    res.end(file)
  }
}

/**
 * handler :: Model -> (Request, Resolver) -> ()
 *
 * This function is the server handler function. It takes the model and the Request and Resolver and parses the Request and returns the correct files to the client
 **/
function handler (model) {
  const proxy = getProxy(model)
  const serve = serveStatic(model.dir, { index: ['index.html', 'index.htm'] })

  return function (req, res) {
    const url = parseUrl(req.url, model)

    if (proxy && url.isType(PROXY_TYPE)) {
      req.url = req.url.replace(model.proxyPrefix, '')
      proxy.web(req, res, {
        target: model.proxyHost,
        changeOrigin: true,
        hostRewrite: true
      }, function (err) {
        console.log('Proxy failure :', err.message)
        res.writeHead(502)
        res.end('502 Bad Gateway')
      })
    } else if (url.isType(CONTENT_TYPE)) {
      readFile(url.getPath, 'utf8')
        .alt(readFile(url.rootpath, 'utf8'))
        .fork(resolveNotFound(res), resolveWith(res))
    } else if (url.isType(RELOAD_TYPE)) {
      readFile(RELOAD_FILE, 'utf8')
        .map(file => file.replace(`'{{verbose}}'`, `${model.verbose}`))
        .map(file => file.replace(`'{{reload}}'`, `${model.reload}`))
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

/**
 * maybeOpen :: Model -> () -> Model
 *
 * This function opens the browser at the root url if the open flag is on.
 **/
function maybeOpen (model) {
  return function (server) {
    if (model.open) {
      const open = require('open')
      const protocol = model.ssl ? 'https://' : 'http://'
      open(protocol + model.host + ':' + model.port)
    }
    return server
  }
}

/**
 * listener :: Model -> ()
 *
 * This function listens to the server being started and when it connects it generates the relaod file if it doesn't exist, opens the browser, and logs the server message.
 **/
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
    .fork(
      () => model.log(serverStarted(model)),
      () => model.log(serverStarted(model))
    )
}

/*
|-------------------------------------------------------------------------------
| Start Helpers
|-------------------------------------------------------------------------------
*/

/**
 * startServer :: Protocal -> Model -> Model
 *
 * This function starts the server using the passed in protocal and updates the model with the returned Server instance.
 **/
const startServer = protocol => model => update(model, { server: protocol.createServer(typeof model.server !== 'object' ? {} : model.server, handler(model)) })

/**
 * startWs :: Model -> Async Error { sendMessage: String -> () }
 *
 * This function starts the WebSocket server and returns an Async ADT where it rejects with an error or resolves once the connection has been made successfully with the function to send messages to the client.
 **/
const startWs = model => ({ server: startWsServer(model.server) })

/**
 * setupListener :: Model -> Model
 *
 * This function sets the listener on the server instance in the model.
 **/
const setupListener = model => {
  model.server.listen({ port: model.port, host: model.host }, listener(model))
  return model
}

/**
 * readSsl :: Model -> Async Error Model
 *
 * This function returns an Async ADT that tries to read the passed in creds needed for an SSL cert and either rejects with the error or resolves with an updated model with the needed keys.
 **/
const readSsl = model => Async
  .of(key => cert => ({ server: { key, cert } }))
  .ap(readFile(model.ssl.key))
  .ap(readFile(model.ssl.cert))
  .map(server => update(model, server))

/**
 * generateSsl :: Model -> Async Error Model
 *
 * This function returns an Async ADT that tries to generate the creds needed for an SSL cert and either rejects with the error or resolves with an updated model with the needed keys.
 **/
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

/**
 * getSsl :: Model -> Async Error Model
 *
 * This function returns an Async ADT that either uses the passed in cred locations or tries to generate the creds needed for an SSL cert and either rejects with the error or resolves with an updated model with the needed keys.
 **/
const getSsl = model => isObj(model.ssl) ? readSsl(model) : generateSsl(model)

/**
 * sendCompilingMessage :: String -> Server -> Server
 *
 * This function takes a message and the server instance ( which at this point will be the function to send messages to the Websocket client ) and sends the compiling message to the client. This function is needed so it can be sent when the server is first being started and on all the re-builds moving forward.
 **/
function sendCompilingMessage (message) {
  return function send (model) {
    model.server.sendMessage({ action: 'compiling', message })
    return model
  }
}

/**
 * sendMessage :: Model -> Model
 *
 * This function takes the model and sends the build result message to the client.
 **/
function sendMessage (model) {
  model.server.sendMessage(model.build)
  return model
}

/**
 * start :: Model -> Async Error Server
 *
 * This function takes the model and pipes it through the Server pipeline and returns an Async ADT that resolves with the sendMessage function to be merged into the model and used to update the client or rejects with the error.
 **/
const start = model => model.useServer ? pipe(
  ifElse(hasProp('ssl'), getSsl, Async.of),
  map(startServer(model.ssl ? https : http)),
  map(setupListener),
  map(startWs),
  map(maybeOpen(model))
)(model) : Async.of(model)

/*
|-------------------------------------------------------------------------------
| Export
|-------------------------------------------------------------------------------
*/
module.exports = {
  start,
  sendMessage,
  sendCompilingMessage
}
