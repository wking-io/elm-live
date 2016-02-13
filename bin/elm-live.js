#! /usr/bin/env node

const argv = process.argv.slice(2);

require('..')(argv, {
  inputStream: process.stdin,
  outputStream: process.stdout,
});
