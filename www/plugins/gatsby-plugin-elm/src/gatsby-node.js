import resolve from './resolve'

exports.onCreateWebpackConfig = ({ actions, stage }, { plugins, ...elmOptions }) => {
  const { setWebpackConfig } = actions
  const isDev = stage === `develop`

  const elmLoader = {
    loader: resolve('elm-webpack-loader'),
    options: { debug: isDev, ...elmOptions }
  }

  const elmHotLoader = {
    loader: resolve('elm-hot-webpack-loader')
  }

  const elmRule = (isDev) => ({
    test: /\.elm$/,
    exclude: [/[/\\\\]elm-stuff[/\\\\]/, /[/\\\\]node_modules[/\\\\]/],
    use: [
      ...(isDev ? [elmHotLoader] : []),
      elmLoader
    ]
  })

  setWebpackConfig({
    module: {
      rules: [elmRule(isDev)]
    }
  })
}
