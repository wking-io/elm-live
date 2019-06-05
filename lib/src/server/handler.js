const fs = require('fs')
const path = require('path')
const serveStatic = require('serve-static')
const finalhandler = require('finalhandler')
const mime = require('mime')

const PROXY_TYPE = 'proxy'
const CONTENT_TYPE = 'content'
const RELOAD_TYPE = 'reload'
const STATIC_TYPE = 'static'

const getProxy = ({ proxyPrefix, proxyHost }) => (typeof proxyPrefix === 'string' && typeof proxyHost === 'string')
  ? require('http-proxy').createProxyServer()
  : false

function getRequestType ({ pathname }, { proxyPrefix, pushstate }) {
  const fileType = mime.getType(path.extname(pathname))
  if (pathname.startsWith(proxyPrefix)) {
    return PROXY_TYPE
  } else if (
    (pushstate && fileType === null) ||
    fileType === 'text/html' ||
    pathname === '/' ||
    pathname === ''
  ) {
    return CONTENT_TYPE
  } else if (pathname === 'reload/reload.js') {
    return RELOAD_TYPE
  } else {
    return STATIC_TYPE
  }
}

function parseUrl (rawUrl, config) {
  const url = new URL(rawUrl)
  const requestType = getRequestType(url, config)
  return {
    isRoot: url.pathname === '/' || url.pathname === '',
    isType (reqType) { return reqType === requestType }
  }
}

function handler (config, reloader) {
  const proxy = getProxy(config)
  const serve = serveStatic(config.dir, { index: ['index.html', 'index.htm'] })

  return function (req, res) {
    const url = parseUrl(req.url, config)

    if (proxy && url.isType(PROXY_TYPE)) {
      proxy.web(req, res, { target: config.proxyHost })
    } else if (url.isType(CONTENT_TYPE)) {
      const finalpath = url.isRoot ? config.dir + '/' + config.startPage : config.dir + '/' + config.pathname

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
    } else if (url.isType(RELOAD_TYPE)) {
      // Server reload-client.js file from injected script tag
      res.setHeader('Content-Type', 'text/javascript')
      res.end(reloader.reloadClientCode())
    } else {
      // Serve any other file using serve-static
      serve(req, res, finalhandler(req, res))
    }
  }
}

module.exports = {
  handler
}
