const test = require('prova');
const proxyquire = require('proxyquire').noPreserveCache();
const path = require('path');
const devnull = require('dev-null');


test('Prints `--help`', (assert) => {
  assert.plan(2);

  const spawnSyncStub = (program, args) => {
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
  };

  const elmLive = proxyquire('./source/elm-live', {
    'child_process': { spawnSync: spawnSyncStub },
  });

  elmLive(['--help'], { stream: devnull });
});

// Passes correct args to elm-make

// Starts budo at the specified `--port`

// `--open`s the default browser
