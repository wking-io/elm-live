const {resolve} = require('path');
const {execFile} = require('child_process');

const tape = require('tape-catch');
const curry = require('1-liners/curry');
const plus = require('1-liners/plus');
const spawn = require('tape-spawn');

const title = curry(plus)('The CLI tool:  ');
const … = resolve(__dirname, '../../module/bin/….js');
const …Command = curry(execFile)(…);

tape(title('Prints usage'), (is) => {
  is.plan(8);

  …Command([], (error, _, stderr) => {
    is.equal(error && error.code, 1,
      '`…` fails…'
    );

    is.ok(
      /^usage:/i.test(stderr),
      '…and prints usage to stderr'
    );
  });

  …Command(['--invalid', '--options'], (error, _, stderr) => {
    is.equal(error && error.code, 1,
      '`… --invalid --options` fails…'
    );

    is.ok(
      /^usage:/i.test(stderr),
      '…and prints usage to stderr'
    );
  });

  …Command(['-h'], (error, stdout) => {
    is.equal(error, null,
      '`… -h` succeeds…'
    );

    is.ok(
      /^usage:/i.test(stdout),
      '…and prints usage'
    );
  });

  …Command(['--help'], (error, stdout) => {
    is.equal(error, null,
      '`… --help` succeeds…'
    );

    is.ok(
      /SYNOPSIS/.test(stdout),
      '…and prints manpage-like help'
    );
  });
});

const cwd = resolve(__dirname, '../mock-cwd');

tape(title('…'), (is) => {
  const run = spawn(is, `"${…}" a.js`, {cwd});

  run.succeeds(
    'succeeds'
  );

  run.timeout(500);
  run.end();
});
