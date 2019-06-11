const spawn = require('cross-spawn')
const Async = require('crocks/Async')
const { map, chain } = require('crocks/pointfree')
const { pipe } = require('crocks/helpers')
const { ifThen, not } = require('crocks/logic')
const { PROCESS_SUCCESS, update } = require('../utils')
const { notFoundMsg, errorMsg, buildSuccess } = require('../messages')

const run = key => model => Async((reject, resolve) => {
  if (!model[key]) {
    resolve(model)
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

  const maybeReject = (rejValue, resValue) => model.recover ? resolve(resValue) : reject(rejValue)

  const proc = spawn(model.elm, ['make', ...model.elmArgs])

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
      resolve(result)
    }
  })
})

// processError :: { error: String } -> Async Continue String
const processError = model => {
  const { action, data } = model.client.msg
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
  const { action } = model.client.msg
  if (action === model.getAction('reload')) {
    model.log(buildSuccess(model.open))
  }

  return model
}

const loadMessage = model => {
  if (model.build.action === model.getAction('buildFailure')) {
    return update(model, { build: update(model.build, { ide: model.ide, cwd: model.cwd }) })
  } else if (model.build.action === model.getAction('reload')) {
    return update(model, { build: update(model.build, { url: model.target.replace(model.dir, '') }) })
  }

  return model
}

const processResult = pipe(processError, processSuccess, loadMessage)

// build :: Model -> Async { client: message }
const build = pipe(run('before'), chain(runElm), chain(run('after')), map(processResult))

module.exports = {
  build
}
