
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
  var socketUrl = window.location.origin

  socketUrl = socketUrl.replace(/(^http(s?):\/\/)(.*)/, 'ws$2://$3')
  var socket

  if (verboseLogging) {
    console.log('Reload Script Loaded')
  }

  if (!('WebSocket' in window)) {
    throw new Error('Reload only works with browsers that support WebSockets')
  }

  // Explanation of the flags below:

  // The first change flag is used to tell reload to wait until the socket closes at least once before we allow the page to open on a socket open event. Otherwise reload will go into a inifite loop, as the page will have a socket on open event once it loads for the first time
  var firstChangeFlag = false

  // The navigatedAwayFromPageFlag is set to true in the event handler onbeforeunload because we want to short-circuit reload to prevent it from causing the page to reload before the navigation occurs.
  var navigatedAwayFromPageFlag

  // Wait until the page loads for the first time and then call the webSocketWaiter function so that we can connect the socket for the first time
  window.addEventListener('load', function () {
    if (verboseLogging === true) {
      console.log('Page Loaded - Calling webSocketWaiter')
    }
    websocketWaiter()
  })

  // If the user navigates away from the page, we want to short-circuit reload to prevent it from causing the page to reload before the navigation occurs.
  window.addEventListener('beforeunload', function () {
    if (verboseLogging === true) {
      console.log('Navigated away from the current URL')
    }

    navigatedAwayFromPageFlag = true
  })

  var sanitizeHTML = function (str, type) {
    if (type === 'console') {
      return str.replace(/<(http[^>]*)>/, '$1')
    } else {
      var temp = document.createElement('div')
      temp.textContent = str
      return temp.innerHTML.replace(/&lt;(http[^>]*)&gt;/, "&lt;<a style='color: inherit' target='_blank' href='$1'>$1</a>&gt;")
    }
  }

  var colorConverter = function (color, type) {
    if (color === 'green') {
      if (type === 'console') {
        return 'green'
      } else {
        return 'lightgreen'
      }
    } else if (color === 'cyan') {
      if (type === 'console') {
        return 'blue'
      } else {
        return 'cyan'
      }
    } else if (color === 'yellow') {
      return 'orange'
    } else {
      return color
    }
  }

  function capitalizeFirstLetter (string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  function restoreColor (parsedError, cwd, ide, type) {
    // This function is similar to "restoreColor" in elm-live.js
    // They should be kept in sync, manually
    var styles = []
    var styleNormal = 'color:#333'
    var coloredError = parsedError.errors.map(function (err) {
      return err.problems.map(function (pro) {
        var headerContent = pro.title.replace('-', ' ') + ' --------------- ' + err.path
        var color = 'color:' + colorConverter('cyan', type)
        var header = ''
        if (type === 'console') {
          styles.push(color, styleNormal)
          header = '%c-- ' + headerContent + '%c\n\n'
        } else {
          var ideUrl = ide + '://open?url=file://' + cwd + '/' + err.path + '&line=' + pro.region.start.line + '&column=' + pro.region.start.column
          header = "<span style='" + color + "'>" + headerContent + " [<a style='color: inherit' href='" + ideUrl + "'>open in " + capitalizeFirstLetter(ide) + '</a>]</span>\n\n'
        }
        return [header].concat(pro.message.map(function (mes) {
          if (typeof mes === 'string') {
            return sanitizeHTML(mes, type)
          } else {
            var color
            if (mes.underline) {
              color = 'color:' + colorConverter('green', type)
            } else if (mes.color) {
              color = 'color:' + colorConverter(mes.color, type)
            }
            if (type === 'console') {
              styles.push(color, styleNormal)
              return '%c' + sanitizeHTML(mes.string, type) + '%c'
            } else {
              return "<span style='" + color + "'>" + sanitizeHTML(mes.string, type) + '</span>'
            }
          }
        })).join('')
      }).join('\n\n\n')
    }).join('\n\n\n\n\n')

    if (type === 'console') {
      return [coloredError].concat(styles)
    } else {
      return coloredError
    }
  }

  var speed = 400
  var delay = 20

  function showError (error, cwd, ide) {
    var coloredError = restoreColor(error, cwd, ide)
    console.log.apply(this, restoreColor(error, cwd, ide, 'console'))
    hideCompiling('fast')
    setTimeout(function () {
      showError_(coloredError)
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
        document.getElementById('elm-live:elmCompilingContainer').remove()
      } else {
        document.getElementById('elm-live:elmCompilingBackground').style.opacity = 0
        setTimeout(function () {
          document.getElementById('elm-live:elmCompilingContainer').remove()
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
    }
  }

  var socketOnOpen = function (msg) {
    if (verboseLogging) {
      console.log('Socket Opened')
    }

    // We only allow the reload on two conditions, one when the socket closed (firstChange === true) and two if we didn't navigate to a new page (navigatedAwayFromPageFlag === false)
    if (firstChangeFlag === true && navigatedAwayFromPageFlag !== true) {
      if (verboseLogging) {
        console.log('Reloaded')
      }

      // Reset the firstChangeFlag to false so that when the socket on open events are being fired it won't keep reloading the page
      firstChangeFlag = false

      // Now that everything is set up properly we reload the page
      // window.location.reload()
    }
  }

  // Socket on close event that sets flags and calls the webSocketWaiter function
  var socketOnClose = function (msg) {
    if (verboseLogging) {
      console.log('Socket Closed - Calling webSocketWaiter')
    }

    // We encountered a change so we set firstChangeFlag to true so that as soon as the server comes back up and the socket opens we can allow the reload
    firstChangeFlag = true

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
