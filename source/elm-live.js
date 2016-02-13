const fs = require('fs');

const minimist = require('minimist');

const parseArgs = (argv) => minimist(argv);

module.exports = (argv, options) => {
  const stream = options.stream;

  const args = parseArgs(argv);

  if (args.help) {
    stream.write(fs.readFileSync(`${ __dirname }/help.txt`));
  }
};
