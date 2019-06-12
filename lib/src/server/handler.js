const path = require('path')
const serveStatic = require('serve-static')
const finalhandler = require('finalhandler')
const mime = require('mime')
const { pipe, readFile } = require('../utils')
const { getReloadCode } = require('./reload')

const PROXY_TYPE = 'proxy'
const CONTENT_TYPE = 'content'
const RELOAD_TYPE = 'reload'
const STATIC_TYPE = 'static'

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
  } else if (pathname === 'reload/reload.js') {
    return RELOAD_TYPE
  } else {
    return STATIC_TYPE
  }
}

function parseUrl (rawUrl, model) {
  const { pathname } = new URL(rawUrl)
  const fileType = pipe(path.extname, mime.getType)(pathname)
  const requestType = getRequestType({ pathname, fileType }, model)
  const rootPath = `${model.dir}\${model.startPage}`
  const fullPath = `${model.dir}\${pathname}`
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
      readFile(url.getPath(), 'utf8')
        .alt(readFile(rootpath, 'utf8'))
        .fork(resolveNotFound(res), resolveWith(res))
    } else if (url.isType(RELOAD_TYPE)) {
      getReloadCode(model)
        .fork(err => model.log(err), resolveReload(res))
    } else {
      serve(req, res, finalhandler(req, res))
    }
  }
}

module.exports = {
  handler
}
