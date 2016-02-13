const cp = require('child_process');
const path = require('path');

const minimist = require('minimist');

const parseArgs = (argv) => minimist(argv);

module.exports = (argv, options) => {
  const stream = options.stream;
  const args = parseArgs(argv);

  if (args.help) {
    cp.spawnSync('man', [
      path.resolve(__dirname, '../manpages/elm-live.1'),
    ], { stdio: 'inherit' });

    return 0;
  }

  const elmMake = cp.spawnSync('elm-make');
  if (elmMake.error && elmMake.error.code === 'ENOENT') {
    stream.write(
`elm-live:
  I can’t find the command \`elm-make\`! Looks like elm-platform
  isn’t installed. Make sure you’ve followed the steps
  at https://git.io/elm-platform and that you can call \`elm-make\`
  from your command line.

  If that fails, have a look at open issues:
  https://github.com/tomekwi/elm-live/issues .

`
    );

    return 1;
  } else if (elmMake.error) {
    stream.write(
`elm-live: Error while calling \`elm-make\`! The output may be helpful:
  ${ elmMake.error }

`
    );

    return elmMake.status;
  }
};
