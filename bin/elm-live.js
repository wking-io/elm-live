#! /usr/bin/env node

const Gaze = require('gaze').Gaze;
const path = require('path');
const spawn = require('child_process').spawn;
const tinyLr = require('tiny-lr');

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
const reactor = spawn('elm-reactor', reactorArgs, {stdio: 'inherit'});
reactor.on('error', (error) => {
  if (error.code === 'ENOENT') {
    process.stderr.write(
`elm-live:
  I can’t find the command \`elm-reactor\`! Looks like elm-platform
  isn’t installed. Make sure you’ve followed the steps at http://npm.im/elm
  and that you can call \`elm-reactor\` on your command line.

  If that fails, have a look at open issues:
  https://github.com/tomekwi/elm-live/issues .

`
    );
    process.exit(1);
  } else {
    throw error;
  }
});

// Watch
const cwd = process.cwd();
const port = 35729;  // Standard http://livereload.com port
const livereload = tinyLr();
livereload.listen(port, (error) => {
  if (error) throw error;
  process.stdout.write(
`elm-live:
  LiveReload running on the default port (${ port }).

  Remember to switch on LiveReload in your browser. More info:
  http://livereload.com/extensions .

`
  );

  const gaze = new Gaze();
  gaze.on('error', (gazeError) => { throw gazeError; });
  gaze.add('**/*.elm');

  gaze.on('all', (event, filePath) => {
    process.stdout.write(
`elm-live: \`${ path.relative(cwd, filePath) }\` ${ event }. Reloading!
`
    );
    livereload.changed({ body: { files: 'elm.js' } });
  });
});
