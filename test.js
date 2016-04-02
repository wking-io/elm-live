'use strict';

const path = require('path');

const test = require('ava');
const proxyquire = require('proxyquire').noPreserveCache().noCallThru();
const devnull = require('dev-null');
const qs = require('q-stream');
const naked = require('strip-ansi');

const dummyConfig = { inputStream: devnull(), outputStream: devnull() };
const dummyCrossSpawn = { sync: () => { return { status: 0 }; } };
const dummyBudoServer = { on: () => {} };
const dummyBudo = () => dummyBudoServer;
const dummyChokidarWatcher = { on: () => {} };
const dummyChokidar = { watch: () => dummyChokidarWatcher };


test('Prints `--help`', (assert) => {
  assert.plan(3);

  const crossSpawn = { sync: (command, args) => {
    assert.is(command, 'man',
      'spawns `man`'
    );

    assert.is(
      args[0],
      path.resolve(__dirname, 'manpages/elm-live.1'),
      'with the right manpage'
    );

    return { error: null };
  } };

  const elmLive = proxyquire('./source/elm-live', { 'cross-spawn': crossSpawn });

  const exitCode = elmLive(['--help'], dummyConfig);

  assert.is(exitCode, 0,
    'succeeds'
  );
});


test((
  'Falls back to plain text `--help` over stdout'
), (assert) => new Promise((resolve, reject) => {
  assert.plan(4);
  setTimeout(reject, 100);

  const expectedHelpContent = (
`I’m dreaming
of a white Christmas
`
  );

  const crossSpawn = { sync: (command) => {
    assert.is(command, 'man',
      'tries to spawn `man`'
    );

    return { error: { code: 'ENOENT' } };
  } };

  const fs = { readFileSync: (file, encoding) => {
    const expectedLocation = 'manpages/elm-live.1.txt';
    assert.is(file, path.resolve(__dirname, expectedLocation),
      `reads the file at \`${expectedLocation}\``
    );

    if (encoding !== 'utf8') throw new Error('Bad encoding!');

    return expectedHelpContent;
  } };

  const outputStream = qs((chunk) => {
    assert.is(chunk, expectedHelpContent,
      'prints the help text'
    );

    resolve();
  });

  const elmLive = proxyquire('./source/elm-live', {
    'cross-spawn': crossSpawn, fs,
  });

  const exitCode = elmLive(['--help'], {
    inputStream: devnull(), outputStream,
  });

  assert.is(exitCode, 0,
    'succeeds'
  );
}));


test((
  'Throws any other `man` error'
), (assert) => {
  assert.plan(2);

  const dummyError = { code: 'unknown' };

  const crossSpawn = { sync: (command) => {
    assert.is(command, 'man',
      'tries to spawn `man`'
    );

    return { error: dummyError };
  } };

  const elmLive = proxyquire('./source/elm-live', {
    'cross-spawn': crossSpawn,
  });

  try {
    elmLive(['--help'], dummyConfig);
  } catch (error) {
    assert.is(error, dummyError,
      'throws the same error cross-spawn returns'
    );
  }
});


test((
  'Shouts if `elm-make` can’t be found'
), (assert) => new Promise((resolve) => {
  assert.plan(3);

  const expectedMessage = new RegExp(
`^\nelm-live:
  I can’t find the command elm-make!`
  );

  const crossSpawn = { sync: (command) => {
    assert.is(command, 'elm-make',
      'spawns `elm-make`'
    );

    return { error: { code: 'ENOENT' } };
  } };

  const elmLive = proxyquire('./source/elm-live', { 'cross-spawn': crossSpawn });

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

  const crossSpawn = { sync: (command) => {
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
    'cross-spawn': crossSpawn, budo, chokidar: dummyChokidar,
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

  const crossSpawn = { sync: (command, _, options) => {
    assert.is(command, 'elm-make',
      'spawns `elm-make`'
    );

    options.stdio[1].write(message);

    return { status };
  } };

  const elmLive = proxyquire('./source/elm-live', {
    'cross-spawn': crossSpawn, budo: dummyBudo, chokidar: dummyChokidar,
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

  const crossSpawn = { sync: (command) => {
    assert.is(command, 'elm-make',
      'spawns `elm-make`'
    );

    return { status, error: { toString: () => message } };
  } };

  const elmLive = proxyquire('./source/elm-live', { 'cross-spawn': crossSpawn });

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

  const crossSpawn = { sync: (command, args) => {
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

  const elmLive = proxyquire('./source/elm-live', { 'cross-spawn': crossSpawn });
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

  const crossSpawn = { sync: (command, args) => {
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

  const elmLive = proxyquire('./source/elm-live', { 'cross-spawn': crossSpawn });
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

  const crossSpawn = { sync: (command, _, options) => {
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
  const elmLive = proxyquire('./source/elm-live', { 'cross-spawn': crossSpawn });
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


test('Starts budo and chokidar with correct config', (assert) => {
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

  const chokidar = {
    watch: (glob) => {
      assert.is(glob, '**/*.elm',
        'watches all `*.elm` files in the current directory ' +
        'and its subdirectories'
      );

      return dummyChokidarWatcher;
    },
  };

  const elmLive = proxyquire('./source/elm-live', {
    budo, chokidar, 'cross-spawn': dummyCrossSpawn,
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
    budo, chokidar: dummyChokidar, 'cross-spawn': dummyCrossSpawn,
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
    budo, chokidar: dummyChokidar, 'cross-spawn': dummyCrossSpawn,
  });

  elmLive([`--port=${ portNumber }`], dummyConfig);
});


test((
  'Watches all `**/*.elm` files in the current directory'
), (assert) => new Promise((resolve) => {
  assert.plan(5);

  const event = 'change';
  const relativePath = path.join('ab', 'c.elm');
  const absolutePath = path.resolve(process.cwd(), relativePath);

  const watcherMock = {
    on: (what, callback) => {
      callback(event, absolutePath);
    },
  };

  const chokidar = {
    watch: (target, options) => {
      assert.is(target, '**/*.elm',
        'passes the right glob to chokidar'
      );

      assert.true(options.ignoreInitial, 'does not trigger events when starting watch');

      return watcherMock;
    },
  };

  let serverStarted = false;
  const budo = () => {
    serverStarted = true;
    return dummyBudoServer;
  };

  let elmMakeRun = 0;
  const success = { status: 0, error: {} };
  const failure = { status: 77, error: {} };
  const crossSpawn = { sync: (command) => {
    if (command !== 'elm-make') return success;
    elmMakeRun++;

    if (elmMakeRun === 1) return failure;

    assert.notOk(serverStarted,
      'doesn’t start the server immediately if things go wrong'
    );

    assert.pass(
      'retries spawning `elm-make` if things go wrong the first time'
    );

    return success;
  } };

  const elmLive = proxyquire('./source/elm-live', {
    chokidar, budo, 'cross-spawn': crossSpawn,
  });

  let chunkNumber = 0;
  elmLive([], { inputStream: devnull(), outputStream: qs((chunk) => {
    chunkNumber++;
    if (chunkNumber !== 3) return;

    const expectedMessage = (
`\nelm-live:
  You’ve changed \`${ relativePath }\`. Rebuilding!

`
    );

    assert.is(naked(chunk), expectedMessage,
      'prints a message when a file is changed'
    );

    resolve();
  }) });
}));
