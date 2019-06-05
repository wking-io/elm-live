(function refresh () {
  var verboseLogging = false
  var socketUrl = window.location.origin

  socketUrl = socketUrl.replace() // This is dynamically populated by the reload.js file before it is sent to the browser
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

  // Check to see if the server sent us reload (meaning a manually reload event was fired) and then reloads the page
  var socketOnMessage = function (msg) {
    if (msg.data === 'reload') {
      socket.close()
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
      window.location.reload()
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
    }, 250)
  }
})()
