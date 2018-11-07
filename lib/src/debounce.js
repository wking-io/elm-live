// wait until the returned funtion has not been called for `wait`
// milliseconds before calling the passed in function
module.exports = (func, wait) => {
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
