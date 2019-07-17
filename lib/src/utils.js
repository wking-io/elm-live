const Async = require('crocks/Async')
const fs = require('fs')

const when = (pred, fn) => x => pred(x) ? fn(x) : x
const update = (obj, part) => Object.assign(obj, part)
const merge = obj => ([part1, part2]) => {
  return Object.assign(obj, part1, part2)
}
const trace = msg => x => console.log(msg, x) || x
const isObj = x => typeof x === 'object'
const empty = x => (x === null || x === undefined || x.length === 0)
const noop = () => {}
const hasProp = key => obj => (obj[key] && obj[key] !== false)

const readFile = Async.fromNode(fs.readFile)
const writeFile = (file, data = '') => Async((reject, resolve) => fs.writeFile(file, data, err => {
  if (err) {
    reject(err)
  } else {
    resolve(file)
  }
}))
const notExists = file => Async((reject, resolve) => {
  fs.access(file, fs.F_OK, (err) => {
    if (err) {
      resolve(file)
    } else {
      reject(file)
    }
  })
})

const PROCESS_SUCCESS = 0
const PROCESS_FAILURE = 1

const inArray = arr => x => arr.includes(x)

const debounce = (func, wait) => {
  let timeout
  return (...theArgs) => {
    const later = () => {
      func(...theArgs)
    }

    if (timeout !== undefined) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

module.exports = {
  when,
  update,
  merge,
  trace,
  inArray,
  debounce,
  readFile,
  writeFile,
  notExists,
  isObj,
  empty,
  noop,
  hasProp,
  PROCESS_SUCCESS,
  PROCESS_FAILURE
}
