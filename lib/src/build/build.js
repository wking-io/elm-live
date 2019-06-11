const spawn = require('cross-spawn')
const Async = require('crocks/Async')
const { map, chain } = require('crocks/pointfree')
const { pipe } = require('crocks/helpers')
const { ifThen, not } = require('crocks/logic')
const chalk = require('chalk')
const { PROCESS_SUCCESS, update } = require('../utils')
const { notFoundMsg, errorMsg, buildSuccess } = require('../messages')

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

const runElm = model => Async((reject, resolve) => {
  const result = {
    action: model.getAction('reload'),
    data: ''
  }

  let output = ''

  const maybeReject = (rejValue, resValue) => model.recover ? resolve(resValue) : reject(rejValue)

  const proc = spawn(model.elm, ['make', '--report=json', ...model.elmArgs])

  proc.stdout.on('data', data => (output += data))
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

const parseHeader = (title, path) => chalk.cyan(
  `-- ${title.replace('-', ' ')} --------------- ${path}


`)

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

const restoreColor = ({ errors }) =>
  errors.map(({ problems, path }) =>
    problems.map(({ title, message }) =>
      [parseHeader(title, path), ...message.map(parseMsg)].join('')
    ).join('\n\n\n')
  ).join('\n\n\n\n\n')

// processError :: { error: String } -> Async Continue String
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

// processSuccess :: { error: String } -> Async Continue String
const processSuccess = model => {
  const { action } = model.build
  if (action === model.getAction('reload')) {
    model.log(buildSuccess(model.open))
  }

  return model
}

const loadMessage = model => {
  if (model.build.action === model.getAction('buildFailure')) {
    return { build: update(model.build, { ide: model.ide, cwd: model.cwd }) }
  } else if (model.build.action === model.getAction('reload')) {
    return { build: update(model.build, { url: model.target.replace(model.dir, '') }) }
  }

  return model
}

const processResult = pipe(processError, processSuccess, loadMessage)

// build :: Model -> Async { client: message }
const build = pipe(run('before'), chain(runElm), chain(run('after')), map(processResult))

module.exports = {
  build
}
