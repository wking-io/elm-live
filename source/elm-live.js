'use strict';

const spawnSync = require('cross-spawn').sync;
const path = require('path');
const fs = require('fs');

const indent = require('indent-string');
const budo = require('budo');
const chokidar = require('chokidar');
const chalk = require('chalk');
const hasbinSync = require('hasbin').sync;

const parseArgs = require('./parse-args');

const SUCCESS = 0;
const FAILURE = 1;

const bold = chalk.bold;
const dim = chalk.dim;

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

  const auxiliaryBuild = (execPath) => {
    if (!execPath) {
      return { fatal: false, exitCode: SUCCESS };
    }

    const process = spawnSync(execPath, [], {
      stdio: [inputStream, outputStream, outputStream],
    });

    if (process.error && process.error.code === 'ENOENT') {
      outputStream.write(
`\n${dim('elm-live:')}
  I can’t find the command ${bold(execPath)}!
  Please make sure you can call ${bold(execPath)}
  from your command line.

`
      );

      return { fatal: true, exitCode: FAILURE };
    } else if (process.error) {
      outputStream.write(
`\n${dim('elm-live:')} Error while calling ${bold(execPath)}! This output may be helpful:
${indent(String(process.error), 2)}

`
      );
    }

    if (args.recover && process.status !== SUCCESS) outputStream.write(
`\n${dim('elm-live:')}
  ${bold(execPath)} failed! You can find more info above. Keep calm and take your time
  to check why the command is failing. We’ll try to run it again as soon as you change an Elm file.

`
    );

    return { fatal: false, exitCode: process.status };
  };

  // Build logic
  const build = () => {
    const beforeBuild = auxiliaryBuild(args.beforeBuild);
    if (beforeBuild.exitCode !== SUCCESS) {
      return beforeBuild;
    }

    const elmMake = spawnSync(args.pathToElmMake, args.elmMakeArgs, {
      stdio: [inputStream, outputStream, outputStream],
    });

    if (elmMake.error && elmMake.error.code === 'ENOENT') {
      outputStream.write(
`\n${dim('elm-live:')}
  I can’t find the command ${bold(args.pathToElmMake)}!
  Looks like ${bold('elm-platform')} isn’t installed. Make sure you’ve followed
  the steps at https://git.io/elm-platform and that you can call
  ${bold(args.pathToElmMake)} from your command line.

  If that fails, have a look at open issues:
  https://github.com/tomekwi/elm-live/issues .

`
      );

      return { fatal: true, exitCode: FAILURE };
    } else if (elmMake.error) {
      outputStream.write(
`\n${dim('elm-live:')} Error while calling ${bold('elm-make')}! This output may be helpful:
${indent(String(elmMake.error), 2)}

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
      watchGlob: path.join(args.dir, '**/*.{html,css,js}'),
      port: args.port,
      host: args.host,
      open: args.open,
      dir: args.dir,
      stream: outputStream,
      pushstate: args.pushstate,
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
