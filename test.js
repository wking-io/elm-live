const path = require('path');

const test = require('prova');
const proxyquire = require('proxyquire').noPreserveCache();
const devnull = require('dev-null');
const qs = require('q-stream');


test('Prints `--help`', (assert) => {
  assert.plan(3);

  const cp = { spawnSync: (program, args) => {
    assert.equal(
      program,
      'man',
      'invokes `man`'
    );

    assert.equal(
      args[0],
      path.resolve(__dirname, 'manpages/elm-live.1'),
      'with the right manpage'
    );
  } };

  const elmLive = proxyquire('./source/elm-live', { 'child_process': cp });

  const exitCode = elmLive(['--help'], { stream: devnull() });

  assert.equal(exitCode, 0,
    'succeeds'
  );
});


test('Shouts if `elm-make` can’t be found', (assert) => {
  assert.plan(2);

  const expectedMessage = new RegExp(
`^elm-live:
  I can’t find the command \`elm-make\`!`
  );

  const cp = { spawnSync: (command) => {
    if (command !== 'elm-make') assert.fail(
      'doesn’t spawn any other command'
    );

    return { error: { code: 'ENOENT' } };
  } };

  const elmLive = proxyquire('./source/elm-live', { 'child_process': cp });

  const exitCode = elmLive([], { stream: qs((chunk) => {
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
  assert.plan(2);

  const message = 'whatever';
  const status = 9;

  const cp = { spawnSync: (command) => {
    if (command !== 'elm-make') assert.fail(
      'doesn’t spawn any other command'
    );

    return { status, error: { toString: () => message } };
  } };

  const elmLive = proxyquire('./source/elm-live', { 'child_process': cp });

  const exitCode = elmLive([], { stream: qs((chunk) => {
    assert.equal(
      chunk,
      (
`elm-live: Error while calling \`elm-make\`! The output may be helpful:
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
  assert.plan(1);

  const elmLiveArgs = ['--port=77'];
  const otherArgs =
    ['--anything', 'whatever', 'whatever 2', '--beep=boop', '--no-flag'];

  const cp = { spawnSync: (command, args) => {
    if (command !== 'elm-make') assert.fail(
      'doesn’t spawn any other command'
    );

    assert.deepEqual(
      args,
      otherArgs,
      'passes all not understood commands to elm-make'
    );

    // Kill after one attempt
    return { status: 77, error: {} };
  } };

  const elmLive = proxyquire('./source/elm-live', { 'child_process': cp });
  elmLive(elmLiveArgs.concat(otherArgs), { stream: devnull() });
});


test('Disambiguates `elm-make` args with `--`', (assert) => {
  assert.plan(1);

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

  const cp = { spawnSync: (command, args) => {
    if (command !== 'elm-make') assert.fail(
      'doesn’t spawn any other command'
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

  const elmLive = proxyquire('./source/elm-live', { 'child_process': cp });
  elmLive(allArgs, { stream: devnull() });
});

// Starts budo at the specified `--port`

// `--open`s the default browser
