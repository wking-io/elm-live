const when = (pred, fn) => x => pred(x) ? fn(x) : x
const always = fn => () => fn()
const update = (obj, part) => Object.assign(obj, part)
const merge = obj => ([part1, part2]) => Object.assign(obj, part1, part2)

const SUCCESS = 0
const FAILURE = 1

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
  always,
  inArray,
  debounce,
  SUCCESS,
  FAILURE
}
