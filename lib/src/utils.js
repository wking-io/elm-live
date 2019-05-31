const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x)

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
  inArray,
  debounce,
  SUCCESS,
  FAILURE
}
