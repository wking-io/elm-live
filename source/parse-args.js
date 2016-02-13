const defaults = {
  help: false,
  port: 8000,
};

module.exports = (argv) => {
  const args = {};
  const elmMakeArgs = [];

  argv.forEach((arg) => {
    if (arg === '--help') {
      args.help = true;
      return;
    }

    const portPattern = /^--port=(\d+)$/;
    const portMatch = arg.match(portPattern);
    if (portMatch) {
      args.port = portMatch[1];
      return;
    }

    elmMakeArgs.push(arg);
  });

  return Object.assign({}, defaults, args, { elmMakeArgs });
};
