const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x)

const SUCCESS = 1

const FAILURE = 0

const inArray = arr => x => arr.includes(x)

module.exports = {
  pipe,
  inArray,
  SUCCESS,
  FAILURE
}
