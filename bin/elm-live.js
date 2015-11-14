#! /usr/bin/env node

const Gaze = require('gaze').Gaze;
const path = require('path');
const spawnSync = require('child_process').spawnSync;

// Process info
const flags = require('minimist')(process.argv.slice(2), {boolean: true});

// Print usage
if (flags.h) process.stdout.write(require('./help/usage'));
if (flags.help) process.stdout.write([
  require('./help/synopsis'),
  require('./help/what-it-does'),
  require('./help/options'),
].join('\n\n'));

// Exit early
if (flags.h || flags.help) process.exit(0);

// Spawn elm-reactor
const reactorArgs = flags._;
const cwd = process.cwd();
const reactor = spawnSync('elm-reactor', reactorArgs, {stdio: 'inherit'});
if (reactor.error) {
  if (reactor.error.code === 'ENOENT') {
    process.stderr.write(
`elm-live: I can’t find the command \`elm-reactor\`! Looks like elm-platform
  isn’t installed. Make sure you’ve followed the steps at http://npm.im/elm
  and that you can call \`elm-reactor\` on your command line.

  If that fails, have a look at open issues:
  https://github.com/tomekwi/elm-live/issues .

`
    );
    process.exit(1);
  } else {
    throw reactor.error;
  }
}

// Watch
const gaze = new Gaze('**/*.elm');

gaze.on('all', (_, filePath) => {
  console.log(path.relative(cwd, filePath));
});
