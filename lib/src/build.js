const spawn = require('cross-spawn')
const Async = require('crocks/Async')
const { map, chain } = require('crocks/pointfree')
const { pipe } = require('crocks/helpers')
const { ifThen, not } = require('crocks/logic')
const chalk = require('chalk')
const { PROCESS_SUCCESS, update } = require('./utils')
const { notFoundMsg, errorMsg, buildSuccess } = require('./messages')

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
  `-- ${title.replace('-', ' ')} --------------- ${path}


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
      return chalk[msg.color](msg.string)
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
    problems.map(({ title, message }) =>
      [parseHeader(title, path), ...message.map(parseMsg)].join('')
    ).join('\n\n\n')
  ).join('\n\n\n\n\n')

/*
|-------------------------------------------------------------------------------
| Build Processes
|-------------------------------------------------------------------------------
*/

/**
 * run :: String -> Model -> Async Error Model
 *
 * This function takes in the model and the key for the command that needs to be run and then runs the command Asynchronously capturing any fator error. If there are no errors the model is passed through.
 **/
const run = key => model => Async((reject, resolve) => {
  if (!model[key]) {
    resolve(model)
    return
  }

  const maybeReject = model.recover ? resolve : reject

  spawn(model[key], [], { stdio: [model.input, model.output, model.output] })
    .on('error', maybeReject)
    .on('exit', ifThen(not(PROCESS_SUCCESS), maybeReject, resolve))
})

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

  const maybeReject = (rejValue, resValue) => model.recover ? resolve(resValue) : reject(rejValue)

  const proc = spawn(model.elm, ['make', '--report=json', ...model.elmArgs])

  proc.stderr.on('data', data => update(result, { data: result.data + data }))

  proc.on('error', function (error) {
    if (error.name === 'ENOENT') {
      reject(notFoundMsg(model.elm))
    } else {
      maybeReject(errorMsg(model.elm, error, model.recover), { action: model.getAction('error'), data: error })
    }
  })

  proc.on('exit', function (status) {
    if (status !== PROCESS_SUCCESS) {
      resolve(update(model, { build: update(result, { action: model.getAction('buildFailure') }) }))
    } else {
      resolve(update(model, { build: result }))
    }
  })
})

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
      pipe(JSON.parse, restoreColor, model.log)(data)
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
    model.log(buildSuccess(model.open))
  }

  return model
}

/**
 * loadMessage :: Model -> { build: Message }
 *
 * This function checks the build results and updates the build message with the needed properties from the model for each message action types.
 **/
const loadMessage = model => {
  if (model.build.action === model.getAction('buildFailure')) {
    return { build: update(model.build, { ide: model.ide, cwd: model.cwd }) }
  } else if (model.build.action === model.getAction('reload')) {
    return { build: update(model.build, { url: model.target.replace(model.dir, '') }) }
  }

  return model
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
  run('before'),
  chain(runElm),
  chain(run('after')),
  map(processResult)
)

/*
|-------------------------------------------------------------------------------
| Export
|-------------------------------------------------------------------------------
*/

module.exports = {
  build
}
