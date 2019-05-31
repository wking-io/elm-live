const path = require('path')
const chokidar = require('chokidar')
const getSourceDirs = require('./get-source-dirs')
const { watchingDirs, eventNotification } = require('./messages')
const { build } = require('./build')
const { inArray, debounce } = require('./utils')

const eventNameMap = {
  add: 'added',
  addDir: 'added',
  change: 'changed',
  unlink: 'removed',
  unlinkDir: 'removed'
}
const packageFileNames = ['elm.json', 'elm-package.json']
const isPackageFilePath = inArray(packageFileNames)

const watchElm = (options) => {
  const sourceDirs = getSourceDirs()

  options.output.write(watchingDirs(sourceDirs))

  let watcher = chokidar.watch(sourceDirs.concat(packageFileNames), {
    ignoreInitial: true,
    followSymlinks: false,
    ignored: 'elm-stuff/generated-code/*'
  })

  watcher.on(
    'all',
    debounce((event, filePath) => {
      const relativePath = path.relative(process.cwd(), filePath)
      const eventName = eventNameMap[event] || event
      options.output.write(eventNotification(eventName, relativePath))

      build(options)

      if (isPackageFilePath(relativePath)) {
        // Package file changes may result in changes to the set
        // of watched files
        watcher.close()
        watcher = watchElm(options)
      }
    }),
    100
  )
}

module.exports = {
  watchElm
}
