'use strict';

const spawnSync = require('cross-spawn').sync;
const path = require('path');
const fs = require('fs');

const indent = require('indent-string');
const budo = require('budo');
const chokidar = require('chokidar');
const chalk = require('chalk');
const bold = chalk.bold;
const dim = chalk.dim;
const hasbinSync = require('hasbin').sync;

const SUCCESS = 0;
const FAILURE = 1;

const parseArgs = require('./parse-args');

/*
  ({
    outputStream: WritableStream,
    inputStream: ReadableStream,
  }) =>
    exitCode: Integer | Null
*/
module.exports = (argv, options) => {
  const outputStream = options.outputStream;
  const inputStream = options.inputStream;
  const args = parseArgs(argv);

  // Display help
  if (args.help) {
    if (hasbinSync('man')) {
      const manpagePath =
        path.resolve(__dirname, '../manpages/elm-live.1');
      const manProcess =
        spawnSync('man', [manpagePath], { stdio: [
          inputStream, outputStream, outputStream,
        ] });

      if (manProcess.error) throw manProcess.error;
    } else {
      const fallbackPath =
        path.resolve(__dirname, '../manpages/elm-live.1.txt');
      const plainTextHelp =
        fs.readFileSync(fallbackPath, 'utf8');
      outputStream.write(plainTextHelp);
    }

    return SUCCESS;
  }

  // Build logic
  const build = () => {
    const elmMake = spawnSync('elm-make', args.elmMakeArgs, {
      stdio: [inputStream, outputStream, outputStream],
    });

    if (elmMake.error && elmMake.error.code === 'ENOENT') {
      outputStream.write(
`\n${dim('elm-live:')}
  I can’t find the command ${bold('elm-make')}! Looks like ${bold('elm-platform')}
  isn’t installed. Make sure you’ve followed the steps
  at https://git.io/elm-platform and that you can call ${bold('elm-make')}
  from your command line.

  If that fails, have a look at open issues:
  https://github.com/tomekwi/elm-live/issues .

`
      );

      return { fatal: true, exitCode: FAILURE };
    } else if (elmMake.error) {
      outputStream.write(
`\n${dim('elm-live:')} Error while calling ${bold('elm-make')}! This output may be helpful:
${indent(String(elmMake.error), '  ')}

`
      );
    }

    if (args.recover && elmMake.status !== SUCCESS) outputStream.write(
`\n${dim('elm-live:')}
  ${bold('elm-make')} failed! You can find more info above. Keep calm and take your time
  to fix your code. We’ll try to compile it again as soon as you change a file.

`
    );

    return { fatal: false, exitCode: elmMake.status };
  };

  // Server logic
  let serverStarted;
  const startServer = () => {
    outputStream.write(
`\n${dim('elm-live:')}
  ${bold('elm-make')} has succeeded. Starting the server!${args.open ? (
` We’ll open your app
  in the default browser as soon as it’s up and running.`) : ''}

`
    );
    const server = budo({
      live: true,
      watchGlob: '**/*.{html,css,js}',
      port: args.port,
      host: args.host,
      open: args.open,
      stream: outputStream,
    });
    server.on('error', (error) => { throw error; });

    serverStarted = true;
  };

  // First build
  const firstBuildResult = build();
  if (
    firstBuildResult.fatal ||
    (!args.recover && firstBuildResult.exitCode !== SUCCESS)
  ) {
    return firstBuildResult.exitCode;
  } else if (firstBuildResult.exitCode === SUCCESS) {
    startServer();
  }

  const eventNameMap = {
    add: 'added',
    addDir: 'added',
    change: 'changed',
    unlink: 'removed',
    unlinkDir: 'removed',
  };

  // Watch Elm files
  const watcher = chokidar.watch('**/*.elm', { ignoreInitial: true });

  watcher.on('all', (event, filePath) => {
    const relativePath = path.relative(process.cwd(), filePath);
    const eventName = eventNameMap[event] || event;

    outputStream.write(
`\n${dim('elm-live:')}
  You’ve ${eventName} \`${relativePath}\`. Rebuilding!

`
    );

    const buildResult = build();
    if (!serverStarted && buildResult.exitCode === SUCCESS) {
      startServer();
    }
  });

  return null;
};
