const path = require('path')
const chokidar = require('chokidar')
const Async = require('crocks/Async')
const { getSources } = require('./sources')
const { watchingDirs, eventNotification } = require('../messages')
const { build } = require('./build')
const { sendMessage } = require('../server/start')
const { inArray, debounce, update } = require('../utils')

const eventNameMap = {
  add: 'added',
  addDir: 'added',
  change: 'changed',
  unlink: 'removed',
  unlinkDir: 'removed'
}
const packageFileNames = ['elm.json', 'elm-package.json']
const isPackageFilePath = inArray(packageFileNames)

const watch = (config) => Async((reject, _) => {
  const sources = getSources()

  config.log(watchingDirs(sources))

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
      config.log(eventNotification(eventName, relativePath))

      if (isPackageFilePath(relativePath)) {
        // Package file changes may result in changes to the set
        // of watched files
        watcher.close()
        watch(config)
      }

      function closeAndReject (x) {
        watcher.close()
        reject(x)
      }

      build(config)
        .map(build => update(config, { build }))
        .map(sendMessage)
        .fork(closeAndReject, watch)
    }),
    100
  )
})

module.exports = {
  watch
}
