const child = require('child_process');
const path = require('path');

const indent = require('indent-string');
const budo = require('budo');
const gaze = require('gaze');

const parseArgs = require('./parse-args');

/*
  ({
    outputStream: WritableStream,
    inputStream: ReadableStream,
  }) =>
    exitCode: Integer
*/
module.exports = (argv, options) => {
  const outputStream = options.outputStream;
  const inputStream = options.inputStream;
  const args = parseArgs(argv);

  // Display help
  if (args.help) {
    child.spawnSync('man', [
      path.resolve(__dirname, '../manpages/elm-live.1'),
    ], { stdio: 'inherit' });

    return 0;
  }

  // First build
  const build = () => {
    const elmMake = child.spawnSync('elm-make', args.elmMakeArgs, {
      stdio: [inputStream, outputStream, outputStream],
    });

    if (elmMake.error && elmMake.error.code === 'ENOENT') {
      outputStream.write(
`elm-live:
  I can’t find the command \`elm-make\`! Looks like elm-platform
  isn’t installed. Make sure you’ve followed the steps
  at https://git.io/elm-platform and that you can call \`elm-make\`
  from your command line.

  If that fails, have a look at open issues:
  https://github.com/tomekwi/elm-live/issues .

`
      );

      return 1;
    } else if (elmMake.error) {
      outputStream.write(
`elm-live: Error while calling \`elm-make\`! This output may be helpful:
${ indent(String(elmMake.error), '  ') }

`
      );
    }

    return elmMake.status;
  };

  const exitStatus = build();
  if (exitStatus !== 0) { return exitStatus; }

  // Serve
  const server = budo({
    live: true,
    watchGlob: '**/*.{html,css,js}',
    port: args.port,
    open: args.open,
    stream: outputStream,
  });
  server.on('error', (error) => { throw error; });

  // Watch Elm files
  gaze('**/*.elm', (error, watcher) => {
    if (error) throw error;

    watcher.on('all', (event, filePath) => {
      outputStream.write(
        `elm-live: \`${ filePath }\` ${ event }. Rebuilding!\n`
      );
      build();
    });
  });
};
