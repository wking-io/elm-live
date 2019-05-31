const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

module.exports = {
  pipe
}
