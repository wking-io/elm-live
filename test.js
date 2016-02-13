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

  const exitCode = elmLive(['--help'], { stream: devnull });

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

// Passes correct args to elm-make

// Starts budo at the specified `--port`

// `--open`s the default browser
