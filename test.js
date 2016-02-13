'use strict';

const path = require('path');

const test = require('prova');
const proxyquire = require('proxyquire').noPreserveCache().noCallThru();
const devnull = require('dev-null');
const qs = require('q-stream');


test('Prints `--help`', (assert) => {
  assert.plan(3);

  const child = { spawnSync: (command, args) => {
    assert.equal(command, 'man',
      'spawns `man`'
    );

    assert.equal(
      args[0],
      path.resolve(__dirname, 'manpages/elm-live.1'),
      'with the right manpage'
    );
  } };

  const elmLive = proxyquire('./source/elm-live', { 'child_process': child });

  const exitCode = elmLive(['--help'], { outputStream: devnull() });

  assert.equal(exitCode, 0,
    'succeeds'
  );
});


test('Shouts if `elm-make` can’t be found', (assert) => {
  assert.plan(3);

  const expectedMessage = new RegExp(
`^elm-live:
  I can’t find the command \`elm-make\`!`
  );

  const child = { spawnSync: (command) => {
    assert.equal(command, 'elm-make',
      'spawns `elm-make`'
    );

    return { error: { code: 'ENOENT' } };
  } };

  const elmLive = proxyquire('./source/elm-live', { 'child_process': child });

  const exitCode = elmLive([], { outputStream: qs((chunk) => {
    assert.ok(
      expectedMessage.test(chunk),
      'prints an informative message'
    );
  }) });

  assert.equal(exitCode, 1,
    'fails'
  );
});


test('Prints any other `elm-make` error', (assert) => {
  assert.plan(3);

  const message = 'whatever';
  const status = 9;

  const child = { spawnSync: (command) => {
    assert.equal(command, 'elm-make',
      'spawns `elm-make`'
    );

    return { status, error: { toString: () => message } };
  } };

  const elmLive = proxyquire('./source/elm-live', { 'child_process': child });

  const exitCode = elmLive([], { outputStream: qs((chunk) => {
    assert.equal(
      chunk,
      (
`elm-live: Error while calling \`elm-make\`! This output may be helpful:
  ${ message }

`
      ),
      'prints the error’s output'
    );
  }) });

  assert.equal(exitCode, status,
    'exits with whatever code `elm-make` returned'
  );
});


test('Passes correct args to `elm-make`', (assert) => {
  assert.plan(2);

  const elmLiveArgs = ['--port=77'];
  const otherArgs =
    ['--anything', 'whatever', 'whatever 2', '--beep=boop', '--no-flag'];

  const child = { spawnSync: (command, args) => {
    assert.equal(command, 'elm-make',
      'spawns `elm-make`'
    );

    assert.deepEqual(
      args,
      otherArgs,
      'passes all not understood arguments'
    );

    // Kill after one attempt
    return { status: 77, error: {} };
  } };

  const elmLive = proxyquire('./source/elm-live', { 'child_process': child });
  elmLive(elmLiveArgs.concat(otherArgs), { outputStream: devnull() });
});


test('Disambiguates `elm-make` args with `--`', (assert) => {
  assert.plan(2);

  const elmMakeBefore =
    ['--anything', 'whatever', 'whatever 2'];
  const elmLiveBefore =
    ['--open'];
  const elmMakeAfter =
    ['--port=77', '--beep=boop'];
  const allArgs = [].concat(
    elmMakeBefore,
    elmLiveBefore,
    ['--'],
    elmMakeAfter
  );

  const child = { spawnSync: (command, args) => {
    assert.equal(command, 'elm-make',
      'spawns `elm-make`'
    );

    assert.deepEqual(
      args,
      elmMakeBefore.concat(elmMakeAfter),
      'passes all not understood commands and all commands after the `--` ' +
      'to elm-make'
    );

    // Kill after one attempt
    return { status: 77, error: {} };
  } };

  const elmLive = proxyquire('./source/elm-live', { 'child_process': child });
  elmLive(allArgs, { outputStream: devnull() });
});


test('Redirects elm-make stdio', (assert) => {
  assert.plan(4);

  const elmLiveOut = (
`Hello there!
How’s it going?
`
  );
  const elmLiveErr = (
`Not too well, to be honest
`
  );

  const inputStream = {};

  const child = { spawnSync: (command, _, options) => {
    assert.equal(command, 'elm-make',
      'spawns `elm-make`'
    );

    assert.equal(
      options.stdio[0],
      inputStream,
      'takes stdin from the `inputStream`'
    );

    options.stdio[1].write(elmLiveOut);
    options.stdio[2].write(elmLiveErr);

    return {};
  } };

  let run = 0;
  const elmLive = proxyquire('./source/elm-live', { 'child_process': child });
  elmLive([], { inputStream, outputStream: qs((chunk) => {
    if (run === 0) assert.equal(
      chunk,
      elmLiveOut,
      'directs stdout to the `outputStream`'
    );

    if (run === 1) assert.equal(
      chunk,
      elmLiveErr,
      'directs stderr to the `outputStream`'
    );

    run++;
  }) });
});


// Starts budo at the specified `--port`


// `--open`s the default browser


// Reruns elm-make whenever an Elm file is changes
