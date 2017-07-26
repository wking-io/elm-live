/* eslint-disable import/no-extraneous-dependencies */
const path = require("path");

const test = require("ava");
const proxyquire = require("proxyquire").noPreserveCache().noCallThru();
const devnull = require("dev-null");
const qs = require("q-stream");
const naked = require("strip-ansi");
const debounce = require("./source/debounce");

const dummyConfig = { inputStream: devnull(), outputStream: devnull() };
const dummyCrossSpawn = { sync: () => ({ status: 0 }) };
const dummyBudoServer = { on: () => {} };
const dummyBudo = () => dummyBudoServer;
const dummyChokidarWatcher = { on: () => {} };
const dummyChokidar = { watch: () => dummyChokidarWatcher };

const newElmLive = mocks =>
  proxyquire(
    "./source/elm-live",
    Object.assign(
      {},
      {
        "cross-spawn": dummyCrossSpawn,
        budo: dummyBudo,
        chokidar: dummyChokidar
      },
      mocks
    )
  );

test("Prints `--help`", assert => {
  assert.plan(5);

  const crossSpawn = {
    sync: (command, args, config) => {
      assert.is(command, "man", "spawns `man`");

      assert.is(
        args[0],
        path.resolve(__dirname, "manpages/elm-live.1"),
        "with the right manpage"
      );

      assert.is(
        config.stdio[0],
        dummyConfig.inputStream,
        "reads from `inputStream`"
      );

      assert.is(
        config.stdio[1],
        dummyConfig.outputStream,
        "reads from `outputStream`"
      );

      return { error: null };
    }
  };

  const elmLive = newElmLive({ "cross-spawn": crossSpawn });

  const exitCode = elmLive(["--help"], dummyConfig);

  assert.is(exitCode, 0, "succeeds");
});

test("Falls back to plain text `--help` over stdout", assert =>
  new Promise((resolve, reject) => {
    assert.plan(4);
    setTimeout(reject, 100);

    const expectedHelpContent = `I’m dreaming
of a white Christmas
`;

    const hasbin = {
      sync: command => {
        assert.is(command, "man", "checks if `man` is in the PATH");

        return false;
      }
    };

    const fs = {
      readFileSync: (file, encoding) => {
        const expectedLocation = "manpages/elm-live.1.txt";
        assert.is(
          file,
          path.resolve(__dirname, expectedLocation),
          `reads the file at \`${expectedLocation}\``
        );

        if (encoding !== "utf8") throw new Error("Bad encoding!");

        return expectedHelpContent;
      }
    };

    const outputStream = qs(chunk => {
      assert.is(chunk, expectedHelpContent, "prints the help text");

      resolve();
    });

    const elmLive = newElmLive({
      hasbin,
      fs
    });

    const exitCode = elmLive(["--help"], {
      inputStream: devnull(),
      outputStream
    });

    assert.is(exitCode, 0, "succeeds");
  }));

test("Throws any other `man` error", assert => {
  assert.plan(2);

  const dummyError = { code: "unknown" };

  const crossSpawn = {
    sync: command => {
      assert.is(command, "man", "tries to spawn `man`");

      return { error: dummyError };
    }
  };

  const elmLive = newElmLive({
    "cross-spawn": crossSpawn
  });

  try {
    elmLive(["--help"], dummyConfig);
  } catch (error) {
    assert.is(error, dummyError, "throws the same error cross-spawn returns");
  }
});

test("Prints the `--version`", assert =>
  new Promise((resolve, reject) => {
    assert.plan(2);
    setTimeout(reject, 100);

    const version = "7.8.9";

    const outputStream = qs(chunk => {
      assert.is(
        naked(chunk),
        `elm-live v${version}\n`,
        "prints the version number"
      );

      resolve();
    });

    const elmLive = newElmLive({
      "../package.json": { version }
    });

    const exitCode = elmLive(["--version"], {
      inputStream: devnull(),
      outputStream
    });

    assert.is(exitCode, 0, "succeeds");
  }));

test("Shouts if `elm-make` can’t be found", assert =>
  new Promise(resolve => {
    assert.plan(3);

    const expectedMessage = new RegExp(
      `^
elm-live:
  I can’t find the command elm-make!`
    );

    const crossSpawn = {
      sync: command => {
        assert.is(command, "elm-make", "spawns `elm-make`");

        return { error: { code: "ENOENT" } };
      }
    };

    const elmLive = newElmLive({ "cross-spawn": crossSpawn });

    const exitCode = elmLive([], {
      outputStream: qs(chunk => {
        assert.truthy(
          expectedMessage.test(naked(chunk)),
          "prints an informative message"
        );

        resolve();
      }),

      inputStream: devnull()
    });

    assert.is(exitCode, 1, "fails");
  }));

test("Exits if `--no-recover`", assert => {
  assert.plan(4);

  const status = 59;

  const crossSpawn = {
    sync: command => {
      assert.is(command, "elm-make", "spawns `elm-make`");

      return { status };
    }
  };

  const budo = () => {
    assert.fail("doesn’t start the server until errors are fixed");
  };

  const elmLive = newElmLive({
    "cross-spawn": crossSpawn,
    budo
  });

  assert.is(
    elmLive(["--no-recover"], dummyConfig),
    status,
    "exits with the same status as `elm-make`"
  );

  assert.is(elmLive([], dummyConfig), null, "keeps running otherwise");
});

test("Informs of compile errors", assert =>
  new Promise(resolve => {
    assert.plan(3);

    const message = "whatever";
    const status = 9;

    const crossSpawn = {
      sync: (command, _, options) => {
        assert.is(command, "elm-make", "spawns `elm-make`");

        options.stdio[1].write(message);

        return { status };
      }
    };

    const elmLive = newElmLive({ "cross-spawn": crossSpawn });

    let run = 0;
    const outputStream = qs(chunk => {
      if (run === 0) assert.is(chunk, message, "prints elm-make output first");

      if (run === 1)
        resolve(
          assert.is(
            naked(chunk),
            `
elm-live:
  elm-make failed! You can find more info above. Keep calm
  and take your time to fix your code. We’ll try to compile it again
  as soon as you change a file.

`,
            "prints a friendly message afterwards"
          )
        );

      run++;
    });

    elmLive([], { outputStream, inputStream: devnull() });
  }));

test("Prints any other `elm-make` error", assert =>
  new Promise(resolve => {
    assert.plan(3);

    const message = "whatever";
    const status = 9;

    const crossSpawn = {
      sync: command => {
        assert.is(command, "elm-make", "spawns `elm-make`");

        return { status, error: { toString: () => message } };
      }
    };

    const elmLive = newElmLive({ "cross-spawn": crossSpawn });

    const exitCode = elmLive(["--no-recover"], {
      outputStream: qs(chunk => {
        assert.is(
          naked(chunk),
          `
elm-live:
  Error while calling elm-make! This output may be helpful:

  ${message}

`,
          "prints the error’s output"
        );

        resolve();
      }),
      inputStream: devnull()
    });

    assert.is(exitCode, status, "exits with whatever code `elm-make` returned");
  }));

test("Passes correct args to `elm-make`", assert => {
  assert.plan(2);

  const elmLiveArgs = ["--port=77", "--no-recover"];
  const otherArgs = [
    "--anything",
    "whatever",
    "with whitespace",
    "--beep=boop",
    "--no-flag"
  ];

  const crossSpawn = {
    sync: (command, args) => {
      assert.is(command, "elm-make", "spawns `elm-make`");

      assert.deepEqual(args, otherArgs, "passes all not understood arguments");

      // Kill after one attempt
      return { status: 77, error: {} };
    }
  };

  const elmLive = newElmLive({ "cross-spawn": crossSpawn });
  elmLive(elmLiveArgs.concat(otherArgs), dummyConfig);
});

test("Disambiguates `elm-make` args with `--`", assert => {
  assert.plan(2);

  const elmMakeBefore = ["--anything", "whatever", "whatever 2"];
  const elmLiveBefore = ["--open", "--no-recover"];
  const elmMakeAfter = ["--port=77", "--beep=boop"];
  const allArgs = [].concat(elmMakeBefore, elmLiveBefore, ["--"], elmMakeAfter);

  const crossSpawn = {
    sync: (command, args) => {
      assert.is(command, "elm-make", "spawns `elm-make`");

      assert.deepEqual(
        args,
        elmMakeBefore.concat(elmMakeAfter),
        "passes all not understood commands and all commands after the `--` " +
          "to elm-make"
      );

      // Kill after one attempt
      return { status: 77, error: {} };
    }
  };

  const elmLive = newElmLive({ "cross-spawn": crossSpawn });
  elmLive(allArgs, dummyConfig);
});

test("Spawns `--path-to-elm-make` instead of `elm-make` if given", assert => {
  assert.plan(1);

  const pathToElmMake = "/path/to/any/binary";

  const crossSpawn = {
    sync: command => {
      assert.is(command, pathToElmMake);

      // Kill after one attempt
      return { status: 77, error: {} };
    }
  };

  const elmLive = newElmLive({ "cross-spawn": crossSpawn });
  elmLive([`--path-to-elm-make=${pathToElmMake}`], dummyConfig);
});

test("Redirects elm-make stdio", assert =>
  new Promise(resolve => {
    assert.plan(4);

    const elmLiveOut = `Hello there!
How’s it going?
`;
    const elmLiveErr = `Not too well, to be honest
`;

    const inputStream = {};

    const crossSpawn = {
      sync: (command, _, options) => {
        assert.is(command, "elm-make", "spawns `elm-make`");

        assert.is(
          options.stdio[0],
          inputStream,
          "takes stdin from the `inputStream`"
        );

        options.stdio[1].write(elmLiveOut);
        options.stdio[2].write(elmLiveErr);

        // Kill after one attempt
        return { status: 77, error: {} };
      }
    };

    let run = 0;
    const elmLive = newElmLive({ "cross-spawn": crossSpawn });
    elmLive(["--no-recover"], {
      inputStream,
      outputStream: qs(chunk => {
        if (run === 0)
          assert.is(chunk, elmLiveOut, "directs stdout to the `outputStream`");

        if (run === 1)
          resolve(
            assert.is(chunk, elmLiveErr, "directs stderr to the `outputStream`")
          );

        run++;
      })
    });
  }));

test("Starts budo and chokidar with correct config", assert => {
  assert.plan(10);

  const budo = options => {
    assert.is(
      options.port,
      8000,
      "uses port 8000 by default (or the next available one)"
    );

    assert.is(
      options.host,
      "localhost",
      "uses the localhost interface by default"
    );

    assert.is(options.open, false, "doesn’t `--open` the app by default");

    assert.is(
      options.dir,
      ".",
      "serves the current working directory by default"
    );

    assert.is(
      options.watchGlob,
      "**/*.{html,css,js}",
      "reloads the app when an HTML, JS or CSS static file changes"
    );

    assert.is(options.pushstate, false, "disables `--pushstate` by default");

    assert.is(
      options.stream,
      dummyConfig.outputStream,
      "directs all output to `outputStream`"
    );

    return {
      on: (event, callback) => {
        assert.is(event, "error", "listens to server errors");
        const error = {};
        assert.throws(
          () => callback(error),
          thrownError => thrownError === error,
          "rethrows server errors"
        );
      }
    };
  };

  const chokidar = {
    watch: glob => {
      assert.is(
        glob,
        "**/*.elm",
        "watches all `*.elm` files in the current directory " +
          "and its subdirectories"
      );

      return dummyChokidarWatcher;
    }
  };

  const elmLive = newElmLive({ budo, chokidar });

  elmLive([], dummyConfig);
});

test("`--open`s the default browser", assert => {
  assert.plan(1);

  const budo = options => {
    assert.is(options.open, true, "passes `--open` to budo");

    return dummyBudoServer;
  };

  const elmLive = newElmLive({ budo });

  elmLive(["--open"], dummyConfig);
});

test("Serves at the specified `--port`", assert => {
  assert.plan(1);

  const portNumber = 867;

  const budo = options => {
    assert.is(options.port, portNumber, "passes `--port` to budo");

    return dummyBudoServer;
  };

  const elmLive = newElmLive({ budo });

  elmLive([`--port=${portNumber}`], dummyConfig);
});

test("Serves on the specified `--host`", assert => {
  assert.plan(2);

  const hostName1 = "localhost";
  const hostName2 = "127.0.0.1";

  const budo = options => {
    assert.true(
      options.host === hostName1 || options.host === hostName2,
      "passes `--host` to budo"
    );

    return dummyBudoServer;
  };

  const elmLive = newElmLive({ budo });

  elmLive([`--host=${hostName1}`], dummyConfig);
  elmLive([`--host=${hostName2}`], dummyConfig);
});

test("Serves from the specified `--dir`", assert => {
  assert.plan(2);

  const dir = "relative/or/absolute/path/";

  const budo = options => {
    assert.true(options.dir === dir, "serves the right files");
    assert.true(
      options.watchGlob === `${dir}**/*.{html,css,js}`,
      "watches the right files"
    );
    return dummyBudoServer;
  };

  const elmLive = newElmLive({ budo });

  elmLive([`--dir=${dir}`], dummyConfig);
});

test("`--pushstate to support client-side routing", assert => {
  assert.plan(1);

  const budo = options => {
    assert.is(options.pushstate, true, "passes `--pushstate` to budo");

    return dummyBudoServer;
  };

  const elmLive = newElmLive({ budo });

  elmLive(["--pushstate"], dummyConfig);
});

test("Watches all `**/*.elm` files in the current directory", assert =>
  new Promise(resolve => {
    assert.plan(6);

    const event = "change";
    const relativePath = path.join("ab", "c.elm");
    const absolutePath = path.resolve(process.cwd(), relativePath);

    const watcherMock = {
      on: (what, callback) => {
        callback(event, absolutePath);
      }
    };

    const chokidar = {
      watch: (target, options) => {
        assert.is(target, "**/*.elm", "passes the right glob to chokidar");

        assert.true(
          options.ignoreInitial,
          "does not trigger events when starting watch"
        );
        assert.false(
          options.followSymlinks,
          "doesn’t run into an endless loop with symlinks"
        );

        return watcherMock;
      }
    };

    let serverStarted = false;
    const budo = () => {
      serverStarted = true;
      return dummyBudoServer;
    };

    let elmMakeRun = 0;
    const success = { status: 0, error: {} };
    const failure = { status: 77, error: {} };
    const crossSpawn = {
      sync: command => {
        if (command !== "elm-make") return success;
        elmMakeRun++;

        if (elmMakeRun === 1) return failure;

        assert.falsy(
          serverStarted,
          "doesn’t start the server immediately if things go wrong"
        );

        assert.pass(
          "retries spawning `elm-make` if things go wrong the first time"
        );

        return success;
      }
    };

    const elmLive = newElmLive({
      chokidar,
      budo,
      "cross-spawn": crossSpawn
    });

    let chunkNumber = 0;
    elmLive([], {
      inputStream: devnull(),
      outputStream: qs(chunk => {
        chunkNumber++;
        if (chunkNumber !== 3) return;

        assert.is(
          naked(chunk),
          `
elm-live:
  You’ve changed \`${relativePath}\`. Rebuilding!

`,
          "prints a message when a file is changed"
        );

        resolve();
      })
    });
  }));

test("--before-build and --after-build work", assert =>
  new Promise(resolve => {
    const beforeCommand = "run-me-beforehand";
    const afterCommand = "run-me-afterwards";

    const commandsRun = [];

    const crossSpawn = {
      sync: command => {
        commandsRun.push(command);
        return dummyCrossSpawn.sync();
      }
    };

    const elmLive = newElmLive({ "cross-spawn": crossSpawn });

    elmLive(
      [`--before-build=${beforeCommand}`, `--after-build=${afterCommand}`],
      dummyConfig
    );

    assert.deepEqual(
      commandsRun,
      [beforeCommand, "elm-make", afterCommand],
      "Calls the `--before-build` executable, `elm-make` " +
        "and the `--after-build` executable"
    );

    resolve();
  }));

test("Informs of `--before-build` and `--after-build` run errors", assert =>
  new Promise(resolve => {
    assert.plan(4);

    ["--before-build", "--after-build"].forEach(buildParameter => {
      const buildCommand = "testCommand";
      const message = "whatever";
      const status = 1;

      const crossSpawn = {
        sync: (command, _, options) => {
          if (command === buildCommand) {
            options.stdio[1].write(message);
            return { status };
          }
          return dummyCrossSpawn.sync();
        }
      };

      const elmLive = newElmLive({ "cross-spawn": crossSpawn });

      let run = 0;
      const outputStream = qs(chunk => {
        if (run === 0)
          assert.is(chunk, message, `proxies ${buildCommand} output first`);

        if (run === 1)
          resolve(
            assert.is(
              naked(chunk),
              `
elm-live:
  testCommand failed! You can find more info above. Keep calm
  and take your time to check why the command is failing. We’ll try
  to run it again as soon as you change an Elm file.

`,
              "prints a friendly message afterwards"
            )
          );

        run++;
      });

      elmLive([`${buildParameter}=${buildCommand}`], {
        outputStream,
        inputStream: devnull()
      });
      resolve();
    });
  }));

test("Shouts if the `--before-build` or `--after-build` executable can’t be found", assert =>
  new Promise(resolve => {
    assert.plan(4);

    ["--before-build", "--after-build"].forEach(buildParameter => {
      const beforeCommand = "testCommand";

      const expectedMessage = new RegExp(
        `^
elm-live:
  I can’t find the command ${beforeCommand}!`
      );

      const crossSpawn = {
        sync: command => {
          if (command === beforeCommand) {
            return { error: { code: "ENOENT" } };
          }
          return dummyCrossSpawn.sync();
        }
      };

      const elmLive = newElmLive({ "cross-spawn": crossSpawn });

      const exitCode = elmLive([`${buildParameter}=${beforeCommand}`], {
        outputStream: qs(chunk => {
          assert.truthy(
            expectedMessage.test(naked(chunk)),
            "prints an informative message"
          );

          resolve();
        }),

        inputStream: devnull()
      });

      assert.is(exitCode, 1, "fails");
    });
  }));

test("Prints any other `--before-build` or `--after-build` command error", assert =>
  new Promise(resolve => {
    assert.plan(4);

    ["--before-build", "--after-build"].forEach(buildParameter => {
      const buildCommand = "testCommand";
      const message = "whatever";
      const status = 9;

      const crossSpawn = {
        sync: command => {
          if (command === buildCommand) {
            return { status, error: { toString: () => message } };
          }

          return dummyCrossSpawn.sync();
        }
      };

      const elmLive = newElmLive({ "cross-spawn": crossSpawn });

      const exitCode = elmLive(
        ["--no-recover", `${buildParameter}=${buildCommand}`],
        {
          outputStream: qs(chunk => {
            assert.is(
              naked(chunk),
              `
elm-live:
  Error while calling testCommand! This output may be helpful:

  ${message}

`,
              "prints the error’s output"
            );

            resolve();
          }),
          inputStream: devnull()
        }
      );

      assert.is(
        exitCode,
        status,
        `exits with whatever code the \`${buildParameter}\` command returned`
      );
    });
  }));

test("debounce debounces", assert =>
  new Promise(resolve => {
    assert.plan(1);

    let timesRan = 0;
    const countTimesRan = () => {
      timesRan += 1;
    };

    const wait = 1;
    const debouncedcountTimesRan = debounce(countTimesRan, wait);

    debouncedcountTimesRan();
    debouncedcountTimesRan();
    debouncedcountTimesRan();
    debouncedcountTimesRan();

    const checkTimesRan = () => {
      assert.is(
        timesRan,
        1,
        `only calls the passed function once when the returned function
is called several times within the wait interval`
      );
      resolve();
    };

    setTimeout(checkTimesRan, wait + 200);
  }));
