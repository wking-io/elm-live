export function filePreview (ports) {
  return function ({ options }) {
    return options.map(ports.options.send)
  }
}
