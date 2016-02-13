const child = require('child_process');
const path = require('path');

const qs = require('q-stream');
const indent = require('indent-string');

const parseArgs = require('./parse-args');

module.exports = (argv, options) => {
  const stream = options.stream;
  const args = parseArgs(argv);

  if (args.help) {
    child.spawnSync('man', [
      path.resolve(__dirname, '../manpages/elm-live.1'),
    ], { stdio: 'inherit' });

    return 0;
  }

  const printElmMakeOutput = qs((chunk) => {
    stream.write(
      'elm-make:\n' + indent(String(chunk), '  ') + '\n'
    );
  });

  const elmMake = child.execFile('elm-make', args.elmMakeArgs, {
    stdio: [null, printElmMakeOutput, printElmMakeOutput],
  });

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
${ indent(String(elmMake.error), '  ') }

`
    );

    return elmMake.status;
  }
};
