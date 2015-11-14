#! /usr/bin/env node

const {stdout, stderr, exit, argv} = process;

const flags = require('minimist')(argv.slice(2), {boolean: true});
const files = flags._;

// Print usage

if (flags.h) stdout.write(require('./help/usage'));

if (flags.help) stdout.write([
  require('./help/synopsis'),
  require('./help/options'),
  require('./help/examples'),
].join('\n\n'));

// Exit early

if (flags.h || flags.help) exit(0);

if (!files.length) {  // TODO: Remove if not expecting files
  stderr.write(require('./help/usage'));
  exit(1);
}

// TODO
