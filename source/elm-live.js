const cp = require('child_process');
const path = require('path');

const minimist = require('minimist');

const parseArgs = (argv) => minimist(argv);

module.exports = (argv) => {
  const args = parseArgs(argv);

  if (args.help) {
    cp.spawnSync('man', [
      path.resolve(__dirname, '../manpages/elm-live.1'),
    ], { stdio: 'inherit' });
  }
};
