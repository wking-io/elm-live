const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x)
const when = (pred, fn) => x => pred(x) ? fn(x) : x
const always = fn => () => fn()

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
  pipe,
  when,
  always,
  inArray,
  debounce,
  SUCCESS,
  FAILURE
}
