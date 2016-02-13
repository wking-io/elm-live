const defaults = {
  port: 8000,
  open: false,
  help: false,
};

module.exports = (argv) => {
  const args = {};
  const elmMakeArgs = [];

  argv.every((arg, index) => {
    const tryBoolOption = (boolOption) => {
      if (arg === `--${ boolOption }`) {
        args[boolOption] = true;
        return true;
      }
    };

    if (['help', 'open'].some(tryBoolOption)) {
      return true;
    }

    const portPattern = /^--port=(\d+)$/;
    const portMatch = arg.match(portPattern);
    if (portMatch) {
      args.port = portMatch[1];
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
