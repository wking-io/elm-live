const colors = {
  black: "#0D1F2D",
  white: "#ffffff",
  primary: "#F77F00",
  "primary-dark": "#EF6300",
  "primary-light": "#FFA01C",
  grey: "#D3DEE2",
  "grey-light": "#F3F4F5",
  "grey-dark": "#96B1BA",
}
module.exports = {
  theme: {
    fontFamily: {
      sans: ["Fira Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"],
      mono: ["Fira Mono", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"]
    },
    colors,
    extend: {}
  },
  variants: {},
  plugins: []
}
