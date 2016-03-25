'use strict';

const path = require('path');

const test = require('ava');
const proxyquire = require('proxyquire').noPreserveCache().noCallThru();
const devnull = require('dev-null');
const qs = require('q-stream');
const naked = require('strip-ansi');

const dummyConfig = { inputStream: devnull(), outputStream: devnull() };
const dummyCp = { spawnSync: () => { return { status: 0 }; } };
const dummyBudoServer = { on: () => {} };
const dummyBudo = () => dummyBudoServer;
const dummyGaze = () => {};


test('Prints `--help`', (assert) => {
  assert.plan(3);

  const child = { spawnSync: (command, args) => {
    assert.is(command, 'man',
      'spawns `man`'
    );

    assert.is(
      args[0],
      path.resolve(__dirname, 'manpages/elm-live.1'),
      'with the right manpage'
    );
  } };

  const elmLive = proxyquire('./source/elm-live', { 'child_process': child });

  const exitCode = elmLive(['--help'], dummyConfig);

  assert.is(exitCode, 0,
    'succeeds'
  );
});


test((
  'Shouts if `elm-make` can’t be found'
), (assert) => new Promise((resolve) => {
  assert.plan(3);

  const expectedMessage = new RegExp(
`^\nelm-live:
  I can’t find the command elm-make!`
  );

  const child = { spawnSync: (command) => {
    assert.is(command, 'elm-make',
      'spawns `elm-make`'
    );

    return { error: { code: 'ENOENT' } };
  } };

  const elmLive = proxyquire('./source/elm-live', { 'child_process': child });

  const exitCode = elmLive([], { outputStream: qs((chunk) => {
    assert.ok(
      expectedMessage.test(naked(chunk)),
      'prints an informative message'
    );

    resolve();
  }), inputStream: devnull() });

  assert.is(exitCode, 1,
    'fails'
  );
}));


test('Exits if `--no-recover`', (assert) => {
  assert.plan(4);

  const status = 59;

  const child = { spawnSync: (command) => {
    assert.is(command, 'elm-make',
      'spawns `elm-make`'
    );

    return { status };
  } };

  const budo = () => {
    assert.fail(
      'doesn’t start the server until errors are fixed'
    );
  };

  const elmLive = proxyquire('./source/elm-live', {
    'child_process': child, budo, gaze: dummyGaze,
  });

  assert.is(
    elmLive(['--no-recover'], dummyConfig),
    status,
    'exits with the same status as `elm-make`'
  );

  assert.is(
    elmLive([], dummyConfig),
    null,
    'keeps running otherwise'
  );
});


test('Informs of compile errors', (assert) => new Promise((resolve) => {
  assert.plan(3);

  const message = 'whatever';
  const status = 9;

  const child = { spawnSync: (command, _, options) => {
    assert.is(command, 'elm-make',
      'spawns `elm-make`'
    );

    options.stdio[1].write(message);

    return { status };
  } };

  const elmLive = proxyquire('./source/elm-live', {
    'child_process': child, budo: dummyBudo, gaze: dummyGaze,
  });

  let run = 0;
  const outputStream = qs((chunk) => {
    if (run === 0) assert.is(chunk, message,
      'prints elm-make output first'
    );

    if (run === 1) resolve(assert.is(
      naked(chunk),
      (
`\nelm-live:
  elm-make failed! You can find more info above. Keep calm and take your time
  to fix your code. We’ll try to compile it again as soon as you change a file.

`
      ),
      'prints a friendly message afterwards'
    ));

    run++;
  });

  elmLive([], { outputStream, inputStream: devnull() });
}));


test('Prints any other `elm-make` error', (assert) => new Promise((resolve) => {
  assert.plan(3);

  const message = 'whatever';
  const status = 9;

  const child = { spawnSync: (command) => {
    assert.is(command, 'elm-make',
      'spawns `elm-make`'
    );

    return { status, error: { toString: () => message } };
  } };

  const elmLive = proxyquire('./source/elm-live', { 'child_process': child });

  const exitCode = elmLive(['--no-recover'], { outputStream: qs((chunk) => {
    assert.is(
      naked(chunk),
      (
`\nelm-live: Error while calling elm-make! This output may be helpful:
  ${ message }

`
      ),
      'prints the error’s output'
    );

    resolve();
  }), inputStream: devnull() });

  assert.is(exitCode, status,
    'exits with whatever code `elm-make` returned'
  );
}));


test('Passes correct args to `elm-make`', (assert) => {
  assert.plan(2);

  const elmLiveArgs = ['--port=77', '--no-recover'];
  const otherArgs =
    ['--anything', 'whatever', 'with whitespace', '--beep=boop', '--no-flag'];

  const child = { spawnSync: (command, args) => {
    assert.is(command, 'elm-make',
      'spawns `elm-make`'
    );

    assert.same(
      args,
      otherArgs,
      'passes all not understood arguments'
    );

    // Kill after one attempt
    return { status: 77, error: {} };
  } };

  const elmLive = proxyquire('./source/elm-live', { 'child_process': child });
  elmLive(elmLiveArgs.concat(otherArgs), dummyConfig);
});


test('Disambiguates `elm-make` args with `--`', (assert) => {
  assert.plan(2);

  const elmMakeBefore =
    ['--anything', 'whatever', 'whatever 2'];
  const elmLiveBefore =
    ['--open', '--no-recover'];
  const elmMakeAfter =
    ['--port=77', '--beep=boop'];
  const allArgs = [].concat(
    elmMakeBefore,
    elmLiveBefore,
    ['--'],
    elmMakeAfter
  );

  const child = { spawnSync: (command, args) => {
    assert.is(command, 'elm-make',
      'spawns `elm-make`'
    );

    assert.same(
      args,
      elmMakeBefore.concat(elmMakeAfter),
      'passes all not understood commands and all commands after the `--` ' +
      'to elm-make'
    );

    // Kill after one attempt
    return { status: 77, error: {} };
  } };

  const elmLive = proxyquire('./source/elm-live', { 'child_process': child });
  elmLive(allArgs, dummyConfig);
});


test('Redirects elm-make stdio', (assert) => new Promise((resolve) => {
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
    assert.is(command, 'elm-make',
      'spawns `elm-make`'
    );

    assert.is(
      options.stdio[0],
      inputStream,
      'takes stdin from the `inputStream`'
    );

    options.stdio[1].write(elmLiveOut);
    options.stdio[2].write(elmLiveErr);

    // Kill after one attempt
    return { status: 77, error: {} };
  } };

  let run = 0;
  const elmLive = proxyquire('./source/elm-live', { 'child_process': child });
  elmLive(['--no-recover'], { inputStream, outputStream: qs((chunk) => {
    if (run === 0) assert.is(
      chunk,
      elmLiveOut,
      'directs stdout to the `outputStream`'
    );

    if (run === 1) resolve(assert.is(
      chunk,
      elmLiveErr,
      'directs stderr to the `outputStream`'
    ));

    run++;
  }) });
}));


test('Starts budo and gaze with correct config', (assert) => {
  assert.plan(5);

  const budo = (options) => {
    assert.is(options.port, 8000,
      'uses port 8000 by default (or the next available one)'
    );

    assert.is(options.open, false,
      'doesn’t `--open` the app by default'
    );

    assert.is(options.watchGlob, '**/*.{html,css,js}',
      'reloads the app when an HTML, JS or CSS static file changes'
    );

    assert.is(options.stream, dummyConfig.outputStream,
      'directs all output to `outputStream`'
    );

    return dummyBudoServer;
  };

  const gaze = (glob) => {
    assert.is(glob, '**/*.elm',
      'watches all `*.elm` files in the current directory ' +
      'and its subdirectories'
    );
  };

  const elmLive = proxyquire('./source/elm-live', {
    budo, gaze, 'child_process': dummyCp,
  });

  elmLive([], dummyConfig);
});


test('`--open`s the default browser', (assert) => {
  assert.plan(1);

  const budo = (options) => {
    assert.is(options.open, true,
      'passes `--open` to budo'
    );

    return dummyBudoServer;
  };

  const elmLive = proxyquire('./source/elm-live', {
    budo, gaze: dummyGaze, 'child_process': dummyCp,
  });

  elmLive(['--open'], dummyConfig);
});


test('Serves at the specified `--port`', (assert) => {
  assert.plan(1);

  const portNumber = 867;

  const budo = (options) => {
    assert.is(options.port, portNumber,
      'passes `--port` to budo'
    );

    return dummyBudoServer;
  };

  const elmLive = proxyquire('./source/elm-live', {
    budo, gaze: dummyGaze, 'child_process': dummyCp,
  });

  elmLive([`--port=${ portNumber }`], dummyConfig);
});


test((
  'Watches all `**/*.elm` files in the current directory'
), (assert) => new Promise((resolve) => {
  assert.plan(2);

  const event = 'touched';
  const relativePath = 'ab/c.elm';
  const absolutePath = path.resolve(process.cwd(), relativePath);

  const watcherMock = {
    on: (what, callback) => {
      callback(event, absolutePath);
    },
  };

  const gaze = (target, callback) => {
    assert.is(target, '**/*.elm',
      'passes the right glob to gaze'
    );

    callback(null, watcherMock);
  };

  const elmLive = proxyquire('./source/elm-live', {
    gaze, budo: dummyBudo, 'child_process': dummyCp,
  });

  let run = 0;
  elmLive([], { inputStream: devnull(), outputStream: qs((chunk) => {
    run++;
    if (run < 2) return;

    const expectedMessage = (
`\nelm-live:
  You’ve ${ event } \`${ relativePath }\`. Rebuilding!

`
    );

    assert.is(naked(chunk), expectedMessage,
      'prints a message every time a file is changed'
    );

    resolve();
  }) });
}));
