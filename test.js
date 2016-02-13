const test = require('prova');
const qs = require('q-stream');

const elmLive = require('.');

test('Prints `--help`', (assert) => {
  elmLive(['--help'], { stream: qs((chunk) => {
    assert.ok(
      /^Usage:/.test(chunk),
      'outputs usage and stuff'
    );

    assert.end();
  }) });
});

// Passes correct args to elm-make

// Starts budo at the specified `--port`

// `--open`s the default browser
