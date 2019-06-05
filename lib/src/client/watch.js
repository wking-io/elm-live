const path = require('path')
const chokidar = require('chokidar')
const { getSources } = require('./sources')
const { watchingDirs, eventNotification } = require('../messages')
const { build } = require('./build')
const { start } = require('./start')
const { inArray, debounce, SUCCESS } = require('../utils')

const eventNameMap = {
  add: 'added',
  addDir: 'added',
  change: 'changed',
  unlink: 'removed',
  unlinkDir: 'removed'
}
const packageFileNames = ['elm.json', 'elm-package.json']
const isPackageFilePath = inArray(packageFileNames)

const watch = (config, callback) => {
  const sources = getSources()

  config.output.write(watchingDirs(sources))

  const watcher = chokidar.watch([...sources, ...packageFileNames], {
    ignoreInitial: true,
    followSymlinks: false,
    ignored: 'elm-stuff/generated-code/*'
  })

  watcher.on(
    'all',
    debounce((event, filePath) => {
      const relativePath = path.relative(process.cwd(), filePath)
      const eventName = eventNameMap[event] || event
      config.output.write(eventNotification(eventName, relativePath))

      const { fatal, status } = build(config)
      if (fatal ||
        (!config.recover && status !== SUCCESS)
      ) {
        watcher.close()
        return callback(status)
      }

      if (status === SUCCESS && config.server === false) {
        config = start(config)
      }

      if (isPackageFilePath(relativePath)) {
        // Package file changes may result in changes to the set
        // of watched files
        watcher.close()
        watch(config, callback)
      }
    }),
    100
  )
}

module.exports = {
  watch
}
