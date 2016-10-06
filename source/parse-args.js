const defaults = {
  port: 8000,
  open: false,
  help: false,
  recover: true,
  pathToElmMake: 'elm-make',
  host: 'localhost',
  dir: '.',
  pushstate: false,
};

module.exports = (argv) => {
  const args = {};
  const elmMakeArgs = [];

  argv.every((arg, index) => {
    const tryBoolOption = (boolOption) => {
      if (arg === `--${boolOption}`) {
        args[boolOption] = true;
        return true;
      }
      return false;
    };
    if (['help', 'open', 'pushstate'].some(tryBoolOption)) {
      return true;
    }

    if (arg === '--no-recover') {
      args.recover = false;
      return true;
    }

    const portPattern = /^--port=(\d+)$/;
    const portMatch = arg.match(portPattern);
    if (portMatch) {
      args.port = Number(portMatch[1]);
      return true;
    }

    const tryStringOption = (option) => {
      const pattern = new RegExp(`^${option.arg}=(.*)$`);
      const match = arg.match(pattern);
      if (match) {
        args[option.key] = match[1];
        return true;
      }
      return false;
    };
    if ([
      { arg: '--host', key: 'host' },
      { arg: '--path-to-elm-make', key: 'pathToElmMake' },
      { arg: '--dir', key: 'dir' },
      { arg: '--before-build', key: 'beforeBuild' },
    ].some(tryStringOption)) {
      return true;
    }

    if (arg === '--') {
      const elmMakeRest = argv.slice(index + 1);
      elmMakeRest.forEach(elmMakeArg => elmMakeArgs.push(elmMakeArg));
      return false;
    }

    elmMakeArgs.push(arg);
    return true;
  });

  return Object.assign({}, defaults, args, { elmMakeArgs });
};
