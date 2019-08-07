const chalk = require('chalk')
const Async = require('crocks/Async')
const { constant } = require('crocks/combinators')
const { map, chain } = require('crocks/pointfree')
const { pipe } = require('crocks/helpers')
const spawn = require('cross-spawn')
const { inject } = require('elm-hot')
const { PROCESS_SUCCESS, update, readFile, writeFile } = require('./utils')
const { elmNotFound, errorMsg, compileError, buildError, buildSuccess } = require('./messages')

/*
|-------------------------------------------------------------------------------
| Helpers
|-------------------------------------------------------------------------------
*/

const buildIsReload = model => {
  return model.build.action === model.getAction('reload')
}
const updateToWatching = model => {
  return update(model, { build: { action: model.getAction('watch') } })
}

/*
|-------------------------------------------------------------------------------
| Error Formatting
|-------------------------------------------------------------------------------
*/

/**
 * parseHeader :: (String, String) -> String
 *
 * This function takes in the error title and the path to the file with the error and formats it like elm make's regular output
 **/
const parseHeader = (title, path) => chalk.cyan(
  `-- ${title.replace('-', ' ')} --------------- ${path || ''}


`)

/**
 * parseMsg :: String|Object -> String
 *
 * This function takes in the error message and makes sure that it has the proper formatting
 **/
function parseMsg (msg) {
  if (typeof msg === 'string') {
    return msg
  } else {
    if (msg.underline) {
      return chalk.underline(msg.string)
    } else if (msg.color) {
      return chalk[msg.color.toLowerCase()](msg.string)
    } else {
      return msg.string
    }
  }
}

/**
 * parseMsg :: { errors: Array } -> String
 *
 * This function takes in the array of compiler errors and maps over them to generate a formatted compiler error
 **/
const restoreColor = ({ errors }) =>
  errors.map(({ problems, path }) =>
    problems.map(restoreProblem(path)).join('\n\n\n')
  ).join('\n\n\n\n\n')

/**
 * parseMsg :: { errors: Array } -> String
 *
 * This function takes in the array of compiler errors and maps over them to generate a formatted compiler error
 **/
const restoreProblem = path => ({ title, message }) =>
  [parseHeader(title, path), ...message.map(parseMsg)].join('')

/*
|-------------------------------------------------------------------------------
| Build Processes
|-------------------------------------------------------------------------------
*/

/**
 * runElm :: Model -> Async Error Model
 *
 * This function is very similar to the run function with a couple differences. Since we know it is only used with elm we do not need a key to get the command from the model. Also, we want to capture the stderr output (compiler errors) and the action that we will send to the server so it knows how to update based on the result of the build.
 **/
const runElm = model => Async((reject, resolve) => {
  const result = {
    action: model.getAction('reload'),
    data: ''
  }

  const proc = spawn(model.elm, ['make', '--report=json', ...model.elmArgs])

  proc.stderr.on('data', data => update(result, { data: result.data + data }))

  proc.on('error', function (error) {
    if (error.name === 'ENOENT') {
      reject(elmNotFound(model.elm))
    } else {
      reject(errorMsg(model.elm, error, model.recover))
    }
  })

  proc.on('exit', function (status) {
    if (status !== PROCESS_SUCCESS) {
      try {
        const parsedData = JSON.parse(result.data)
        if (parsedData.type === 'error') {
          reject(pipe(restoreProblem(parsedData.path), buildError)(parsedData))
        } else {
          resolve(update(model, { build: update(result, { action: model.getAction('buildFailure'), data: parsedData }) }))
        }
      } catch (e) {
        model.log('Error parsing result: ', e)
        reject(update(model, { build: update(result, { action: model.getAction('error') }) }))
      }
    } else {
      resolve(update(model, { build: result }))
    }
  })
})

/*
|-------------------------------------------------------------------------------
| Hot Reloading
|-------------------------------------------------------------------------------
*/

/**
 * updateTarget :: Model -> Async Error Model
 *
 * This function takes the model grabs the compiled output of the build and uses `elmHot.inject` to hot update the compiled code to maintain the state before the build.
 **/
const updateTarget = model => readFile(model.target, 'utf8')
  .map(inject)
  .chain(injectedCode => writeFile(model.target, injectedCode))
  .map(constant(model))

/**
 * maybeInject :: Model -> Async Error Model
 *
 * This function checks if hot reloading is on and runs the update if it is.
 **/
const maybeInject = model => model.hot ? updateTarget(model) : Async.of(model)

/*
|-------------------------------------------------------------------------------
| Result Handling
|-------------------------------------------------------------------------------
*/

/**
 * processError :: Model -> Model
 *
 * This function takes in the updated model from the build pipeline and if the build had a compiler error it tries to format the compiler error. If the formatting fails then it just logs the error as is.
 **/
const processError = model => {
  const { action, data } = model.build
  if (action === model.getAction('buildFailure')) {
    try {
      pipe(restoreColor, compileError, model.log)(data)
    } catch (e) {
      model.log(data)
    }
  }

  return model
}

/**
 * processSuccess :: Model -> Model
 *
 * This function takes in the updated model from the build pipeline and if the build was successful it logs the build success message.
 **/
const processSuccess = model => {
  const { action } = model.build
  if (action === model.getAction('reload')) {
    model.log(buildSuccess(!model.server && model.open))
  }

  return model
}

/**
 * loadMessage :: Model -> { build: Message }
 *
 * This function checks the build results and updates the build message with the needed properties from the model for each message action types.
 **/
const loadMessage = model => {
  if (model.build.action === model.getAction('reload')) {
    update(model.build, { url: model.target.replace(model.dir, '') })
  }

  return { build: model.build }
}

/**
 * processResult :: Model -> { build: Message }
 *
 * This just combines the different result handlers into a single pipeline
 **/
const processResult = pipe(processError, processSuccess, loadMessage)

/*
|-------------------------------------------------------------------------------
| Main Build
|-------------------------------------------------------------------------------
*/

// build :: Model -> Async { client: message }
const build = pipe(
  runElm,
  chain(maybeInject),
  map(processResult)
)

/*
|-------------------------------------------------------------------------------
| Export
|-------------------------------------------------------------------------------
*/

module.exports = {
  build,
  buildIsReload,
  updateToWatching
}
