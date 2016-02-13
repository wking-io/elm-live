#! /usr/bin/env node

const argv = process.argv.slice(2);

const exitCode = require('..')(argv, {
  inputStream: process.stdin,
  outputStream: process.stdout,
});

if (exitCode !== null) process.exit(exitCode);
