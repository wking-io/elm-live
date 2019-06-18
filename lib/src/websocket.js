
// The following 20 lines are from https://github.com/klazuka/elm-hot/blob/master/test/client.js#L40
var myDisposeCallback = null

// simulate the HMR api exposed by webpack
var module = {
  hot: {
    accept: function () {},

    dispose: function (callback) {
      myDisposeCallback = callback
    },

    data: null,

    apply: function () {
      var newData = {}
      myDisposeCallback(newData)
      module.hot.data = newData
    }

  }
};

(function refresh () {
  var verboseLogging = '{{verbose}}' // This is dynamically update by elm-reload.js file before it is sent to the browser

  const socketUrl = window.location.origin.replace(/(^http(s?):\/\/)(.*)/, 'ws$2://$3')
  var socket

  if (verboseLogging) {
    console.log('Reload Script Loaded')
  }

  if (!('WebSocket' in window)) {
    throw new Error('Reload only works with browsers that support WebSockets')
  }

  // Wait until the page loads for the first time and then call the webSocketWaiter function so that we can connect the socket for the first time
  window.addEventListener('load', function () {
    if (verboseLogging === true) {
      console.log('Page Loaded - Calling webSocketWaiter')
    }
    websocketWaiter()
  })

  /*
  |-------------------------------------------------------------------------------
  | Helpers
  |-------------------------------------------------------------------------------
  */

  const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x)

  function colorConverter (color) {
    return {
      black: '#000000',
      red: '#ff0000',
      green: '#33ff00',
      yellow: '#ffff00',
      blue: '#0066ff',
      magenta: '#cc00ff',
      cyan: '#00ffff',
      white: '#d0d0d0',
      BLACK: '#808080',
      RED: '#ff0000',
      GREEN: '#33ff00',
      YELLOW: '#ffff00',
      BLUE: '#0066ff',
      MAGENTA: '#cc00ff',
      CYAN: '#00ffff',
      WHITE: '#ffffff',
    }[color]
  }


  const addNewLine = str => str + '\n'
  const styleColor = (str = 'WHITE') => `color: ${colorConverter(str)};`
  const styleUnderline = `text-decoration: underline;`
  const styleBold = `text-decoration: bold;`
  const parseStyle = ({ underline, color, bold }) => `${underline ? styleUnderline : ''}${color ? styleColor(color) : ''}${bold ? styleBold : ''}`

  function capitalizeFirstLetter (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  function consoleSanitize (str) {
    return str.replace(/<(http[^>]*)>/, '$1')
  }

  function htmlSanitize(str, type) {
    var temp = document.createElement('div')
    temp.textContent = str
    return temp.innerHTML.replace(/&lt;(http[^>]*)&gt;/, "&lt;<a style='color: inherit' target='_blank' href='$1'>$1</a>&gt;")
  }

  const parseHeader = (title, path) => `-- ${title.replace('-', ' ')} --------------- ${path}`

  /*
  |-------------------------------------------------------------------------------
  | Console Logging
  |-------------------------------------------------------------------------------
  */

  const wrapConsole = str => `%c${str}`
  const consoleHeader = pipe(parseHeader, wrapConsole, addNewLine, addNewLine)

  const parseMsg = pipe(consoleSanitize, wrapConsole)
  const consoleMsg = ({ error, style }, msg) => ({
    error: error.concat(parseMsg(typeof msg === 'string' ? msg : msg.string)),
    style: style.concat(parseStyle(typeof msg === 'string' ? { color: 'black' } : msg))
  })

  const joinMessage = ({ error, style }) => [error.join('')].concat(style)

  const parseConsoleErrors = path =>
    ({ title, message }) =>
      joinMessage(message
        .reduce(consoleMsg, {
          error: [consoleHeader(title, path)],
          style: [styleColor('blue')]
        }))

  const restoreColorConsole = ({ errors }) =>
    errors.reduce((acc, { problems, path }) =>
      acc.concat(problems.map(parseConsoleErrors(path))), [])

  /*
  |-------------------------------------------------------------------------------
  | Html Logging
  |-------------------------------------------------------------------------------
  */

  const ideUrl = (path, ide, cwd, { line, column }) => `${ide}://open?url=file://${cwd}/${path}&line=${line}&column=${column}`

  const htmlHeader = (title, path, cwd, ide, start, msg) => `<span style="${parseStyle({ color: 'cyan' })}">${parseHeader(title, path)} [<a style="color: inherit" href="${ideUrl(path, ide, cwd, start)}">open in ${capitalizeFirstLetter(ide)}</a>]</span>\n\n`

  const htmlMsg = (acc, msg) => `${acc}<span style="${parseStyle(typeof msg === 'string' ? { color: 'WHITE' } : msg)}">${htmlSanitize(typeof msg === 'string' ? msg : msg.string)}</span>`

  const parseHtmlErrors = (path, cwd, ide) =>
  ({ title, message, region }) =>
    message.reduce(htmlMsg, htmlHeader(title, path, cwd, ide, region.start, message))

  const restoreColorHtml = ({ errors }, cwd, ide) =>
  errors.reduce((acc, { problems, path }) =>
    acc.concat(problems.map(parseHtmlErrors(path, cwd, ide))), [])

  /*
  |-------------------------------------------------------------------------------
  | Old Stuff
  |-------------------------------------------------------------------------------
  */

  var speed = 400
  var delay = 20

  function showError (error, cwd, ide) {
    restoreColorConsole(error).forEach((error) => {
      console.log.apply(this, error)
    })
    hideCompiling('fast')
    setTimeout(function () {
      showError_(restoreColorHtml(error, cwd, ide))
    }, delay)
  }

  function showError_ (error) {
    var nodeContainer = document.getElementById('elm-live:elmErrorContainer')
    if (!nodeContainer) {
      nodeContainer = document.createElement('div')
      nodeContainer.id = 'elm-live:elmErrorContainer'
      document.body.appendChild(nodeContainer)
    }
    nodeContainer.innerHTML =
                "<div id='elm-live:elmErrorBackground' style='z-index: 100; perspective: 500px; transition: opacity " +
                speed +
                "ms; position: fixed; top: 0; left: 0; background-color: rgba(0,0,0,0.3); width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;'>" +
                "<div onclick='elmLive.hideError()' style='background-color: rgba(0,0,0,0); position: fixed; top:0; left:0; bottom:0; right:0'></div>" +
                "<pre id='elm-live:elmError' style='transform: rotateX(-90deg); transition: transform " +
                speed +
                "ms; transform-style: preserve-3d; font-size: 16px; overflow: scroll; background-color: rgba(20, 20, 20, 0.9); color: #ddd; width: 70%; height: 60%; padding: 30px'>" +
                error +
                '</pre>' +
                '</div>'
    setTimeout(function () {
      document.getElementById('elm-live:elmErrorBackground').style.opacity = 1
      document.getElementById('elm-live:elmError').style.transform = 'rotateX(0deg)'
    }, delay)
  }

  function hideError (velocity) {
    var node = document.getElementById('elm-live:elmErrorContainer')
    if (node) {
      if (velocity === 'fast') {
        document.getElementById('elm-live:elmErrorContainer').remove()
      } else {
        document.getElementById('elm-live:elmErrorBackground').style.opacity = 0
        document.getElementById('elm-live:elmError').style.transform = 'rotateX(90deg)'
        setTimeout(function () {
          document.getElementById('elm-live:elmErrorContainer').remove()
        }, speed)
      }
    }
  }

  function showCompiling (message) {
    hideError('fast')
    setTimeout(function () {
      showCompiling_(message)
    }, delay)
  }

  function showCompiling_ (message) {
    var nodeContainer = document.getElementById('elm-live:elmCompilingContainer')
    if (!nodeContainer) {
      nodeContainer = document.createElement('div')
      nodeContainer.id = 'elm-live:elmCompilingContainer'
      document.body.appendChild(nodeContainer)
    }
    nodeContainer.innerHTML =
                '<style>' +
                '#loading {' +
                '  display: inline-block;' +
                '  width: 50px;' +
                '  height: 50px;' +
                '  border: 3px solid rgba(255,255,255,.3);' +
                '  border-radius: 50%;' +
                '  border-top-color: #fff;' +
                '  animation: spin 1s linear infinite;' +
                '}' +
                '@keyframes spin {' +
                'to { transform: rotate(360deg); }' +
                '}' +
                '</style>' +
                "<div id='elm-live:elmCompilingBackground' style='z-index: 100; transition: opacity " +
                speed +
                "ms; opacity: 0; position: fixed; top: 0; left: 0; background-color: rgba(0,0,0,0.3); width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; flex-direction: column'>" +
                "<div onclick='elmLive.hideCompiling()' style='background-color: rgba(0,0,0,0); position: fixed; top:0; left:0; bottom:0; right:0'></div>" +
                "<div id='loading'>" +
                '</div>' +
                "<div style='text-align: center; color: #fff; padding: 30px; font-size: 24px; font-weight: bold; font-family: sans-serif'>" +
                message +
                '</div>' +
                '</div>'
    setTimeout(function () {
      document.getElementById('elm-live:elmCompilingBackground').style.opacity = 1
    }, delay)
  }

  function hideCompiling (velocity) {
    var node = document.getElementById('elm-live:elmCompilingContainer')
    if (node) {
      if (velocity === 'fast') {
        node.remove()
      } else {
        document.getElementById('elm-live:elmCompilingBackground').style.opacity = 0
        setTimeout(function () {
          node.remove()
        }, speed)
      }
    }
  }

  // Check to see if the server sent us reload (meaning a manually reload event was fired) and then reloads the page
  var socketOnMessage = function (msg) {
    var parsedData
    try {
      parsedData = JSON.parse(msg.data)
    } catch (e) {
      parsedData = ''
      if (verboseLogging) {
        console.log('Error parsing', msg.data)
      }
    }

    if (parsedData.action === 'failure') {
      const parsedError = JSON.parse(parsedData.data)
      // Displaying the Elm compiler error in the console
      // and in the browsers
      hideCompiling()
      showError(parsedError, parsedData.cwd, parsedData.ide)
    } else if (parsedData.action === 'hotReload') {
      hideCompiling()
      if (verboseLogging) {
        console.log('Hot Reload', parsedData.url)
      }
      // The following 13 lines are from https://github.com/klazuka/elm-hot/blob/master/test/client.js#L22
      var myRequest = new Request(parsedData.url)
      myRequest.cache = 'no-cache'
      fetch(myRequest).then(function (response) {
        if (response.ok) {
          response.text().then(function (value) {
            module.hot.apply()
            delete Elm;
            eval(value)
          })
        } else {
          console.error('HMR fetch failed:', response.status, response.statusText)
        }
      })
    } else if (parsedData.action === 'coldReload') {
      hideCompiling()
      window.location.reload()
    } else if (parsedData.action === 'compiling') {
      showCompiling(parsedData.message)
    } else if (parsedData.action === 'watching') {
      hideCompiling()
      hideError()
    }
  }

  var socketOnOpen = function (msg) {
    if (verboseLogging) {
      console.log('Socket Opened')
    }
  }

  // Socket on close event that sets flags and calls the webSocketWaiter function
  var socketOnClose = function () {
    if (verboseLogging) {
      console.log('Socket Closed - Calling webSocketWaiter')
    }

    // Call the webSocketWaiter function so that we can open a new socket and set the event handlers
    websocketWaiter()
  }

  var socketOnError = function (msg) {
    if (verboseLogging) {
      console.log(msg)
    }
  }

  // Function that opens a new socket and sets the event handlers for the socket
  function websocketWaiter () {
    if (verboseLogging) {
      console.log('Waiting for socket')
    }
    setTimeout(function () {
      socket = new WebSocket(socketUrl); // eslint-disable-line

      socket.onopen = socketOnOpen
      socket.onclose = socketOnClose
      socket.onmessage = socketOnMessage
      socket.onerror = socketOnError
    }, 500)

    window.elmLive = {
      hideError: hideError,
      hideCompiling: hideCompiling
    }
  }
})()
