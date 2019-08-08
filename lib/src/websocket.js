
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
  const verboseLogging = '{{verbose}}' // This is dynamically update before it is sent to the browser
  const reload = '{{reload}}' // This is dynamically update by before it is sent to the browser

  const socketUrl = window.location.origin.replace(/(^http(s?):\/\/)(.*)/, 'ws$2://$3')

  if (verboseLogging) {
    console.log('Reload Script Loaded')
  }

  if (!('WebSocket' in window)) {
    throw new Error('Reload only works with browsers that support WebSockets')
  }

  /*
  |-------------------------------------------------------------------------------
  | Helpers
  |-------------------------------------------------------------------------------
  */

  const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x)

  function colorConverter (color) {
    return {
      black: '#000000',
      red: '#F77F00',
      green: '#33ff00',
      yellow: '#ffff00',
      blue: '#99B1BC',
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

  const htmlHeader = (title, path) => `<span style="${parseStyle({ color: 'blue' })}">${parseHeader(title, path)}</span>\n\n`

  const htmlMsg = (acc, msg) => `${acc}<span style="${parseStyle(typeof msg === 'string' ? { color: 'WHITE' } : msg)}">${htmlSanitize(typeof msg === 'string' ? msg : msg.string)}</span>`

  const parseHtmlErrors = (path) =>
  ({ title, message }) =>
    message.reduce(htmlMsg, htmlHeader(title, path))

  const restoreColorHtml = ({ errors }) =>
  errors.reduce((acc, { problems, path }) =>
    acc.concat(problems.map(parseHtmlErrors(path))), [])

  /*
  |-------------------------------------------------------------------------------
  | TODO: Refactor Below
  |-------------------------------------------------------------------------------
  */

  var speed = 400
  var delay = 20

  function showError (error) {
    restoreColorConsole(error).forEach((error) => {
      console.log.apply(this, error)
    })
    hideCompiling('fast')
    setTimeout(function () {
      showError_(restoreColorHtml(error))
    }, delay)
  }

  function showError_ (error) {
    var nodeContainer = document.getElementById('elm-live:elmErrorContainer')

    if (!nodeContainer) {
      nodeContainer = document.createElement('div')
      nodeContainer.id = 'elm-live:elmErrorContainer'
      document.body.appendChild(nodeContainer)
    }

    nodeContainer.innerHTML = `
<div
  id="elm-live:elmErrorBackground"
  style="
    z-index: 100;
    perspective: 500px;
    transition: opacity 400ms;
    position: fixed;
    top: 0;
    left: 0;
    background-color: rgba(13,31,45,0.2);
    width: 100%;
    height: 100%;
    display: flex;
    justify-content:center;
    align-items: center;
  "
>
  <div
    onclick="elmLive.hideError()"
    style="
      background-color: rgba(0,0,0,0);
      position: fixed;
      top:0;
      left:0;
      bottom:0;
      right:0
    "
  ></div>
  <pre
    id="elm-live:elmError"
    style="
      transform: rotateX(0deg);
      transition: transform 400ms;
      transform-style: preserve-3d;
      font-size: 16px;
      overflow: scroll;
      background-color: rgba(13, 31, 45, 0.9);
      color: #ddd;
      width: calc(100% - 150px);
      height: calc(100% - 150px);
      margin: 0;
      padding: 30px;
      font-family: 'Fira Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    "
  >${error}</pre>
</div>
`

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

    nodeContainer.innerHTML = `
    <style>
    #loading {
      display: inline-block;
      width: 70px;
      height: 105px;
      animation: spin 1s ease-out infinite;
      transform-origin: center;
    }

    @keyframes spin {
      0% { transform: rotate(0deg) }
      30% { transform: rotate(360deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
  <div
    id="elm-live:elmCompilingBackground"
    style="
      z-index: 100;
      transition: opacity ${speed}ms;
      opacity: 0;
      position: fixed;
      top: 0;
      left: 0;
      background-color: rgba(255,255,255,0.9);
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    "
  >
    <div
      onclick="elmLive.hideCompiling()"
      style="
        background-color: rgba(0,0,0,0);
        position: fixed;
        top:0;
        left:0;
        bottom:0;
        right:0;
      "
    ></div>
    <div id="loading">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 313.81 460">
        <path fill="#f77f00" d="M290.55,192.55a5.29,5.29,0,0,1-.46,4L150.24,457.13a5.27,5.27,0,0,1-2.09,2.17l-.55-1.19V292a5.43,5.43,0,0,0-6.83-5.26L88.85,300.68l-29.8,8a4.32,4.32,0,0,1-1.68.16l.05-.59L198.74,43.63l1.14-.22a4.42,4.42,0,0,1,.11,1V209.63a5.43,5.43,0,0,0,6.83,5.23l82.27-22Z"/>
        <path fill="#ffa01c" d="M290.55,192.55l-1.46.27-82.27,22a5.43,5.43,0,0,1-6.83-5.23V167.06l31.73-8.49a5.36,5.36,0,0,1,4.12.54L288,189.24A5.36,5.36,0,0,1,290.55,192.55Z"/>
        <path fill="#ef6300" d="M199.88,43.41l-1.14.22L57.42,308.25l-.05.59a5.26,5.26,0,0,1-2.44-.7L2.7,278a5.42,5.42,0,0,1-2.06-7.24l138-258.38a5.42,5.42,0,0,1,7.51-2.14l51.14,29.52A5.42,5.42,0,0,1,199.88,43.41Z"/>
        <path fill="#ef6300" d="M147.6,458.11l.55,1.19a5.45,5.45,0,0,1-5.4,0L91.61,429.75a5.44,5.44,0,0,1-2.71-4.69V300.84l-.05-.16,51.92-13.91A5.43,5.43,0,0,1,147.6,292Z"/>
        <path fill="#0d1f2d" d="M309.05,180.3l-52.21-30.14a9.39,9.39,0,0,0-7.2-.95L223,156.34V39a9.53,9.53,0,0,0-4.74-8.22L167.15,1.28A9.49,9.49,0,0,0,154,5L16,263.4a9.46,9.46,0,0,0,3.63,12.69l52.22,30.15a9.37,9.37,0,0,0,7.19.95l24.74-6.63V419.62a9.52,9.52,0,0,0,4.75,8.22l51.15,29.53a9.48,9.48,0,0,0,13.1-3.73L312.67,193A9.44,9.44,0,0,0,309.05,180.3Zm-57.3-23.23a1.37,1.37,0,0,1,1,.13L301,185.06l-76.29,20.45a1.34,1.34,0,0,1-1.18-.24,1.31,1.31,0,0,1-.53-1.07V164.76Zm-228,112a1.35,1.35,0,0,1-.52-1.82l138-258.37a1.35,1.35,0,0,1,1.87-.54l50.44,29.13L74.25,298.21ZM112.62,420.8a1.36,1.36,0,0,1-.68-1.18V298.38l48.87-13.09a1.31,1.31,0,0,1,1.18.23,1.35,1.35,0,0,1,.53,1.08v163Zm58,19.67V286.6a9.49,9.49,0,0,0-12-9.17l-51.92,13.91-22.92,6.14,131-245.34V204.2a9.5,9.5,0,0,0,9.46,9.49,9.55,9.55,0,0,0,2.48-.33l76.7-20.55Z"/>
      </svg>
    </div>
    <div
      style="
        text-align: center;
        color: #0D1F2D;
        padding: 30px;
        font-size: 24px;
        font-weight: bold;
        font-family: 'Fira Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
      "
    >${message}</div>
  </div>
`
    setTimeout(function () {
      document.getElementById('elm-live:elmCompilingBackground').style.opacity = 1
    }, delay)
  }

  function hideCompiling (velocity) {
    const node = document.getElementById('elm-live:elmCompilingContainer')
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
      // Displaying the Elm compiler error in the console
      // and in the browsers
      hideCompiling()
      showError(parsedData.data)
    } else if (reload && parsedData.action === 'hotReload') {
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
    } else if (reload && parsedData.action === 'coldReload') {
      hideCompiling()
      window.location.reload()
    } else if (reload && parsedData.action === 'compiling') {
      showCompiling(parsedData.message)
    } else {
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
       const socket = new WebSocket(socketUrl);

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

  // Wait until the page loads for the first time and then call the webSocketWaiter function so that we can connect the socket for the first time
  window.addEventListener('load', function () {
    if (verboseLogging === true) {
      console.log('Page Loaded - Calling webSocketWaiter')
    }
    websocketWaiter()
  })
})()
