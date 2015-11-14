const test = require('tape-catch');

test('Programmatic usage:  Fails', (is) => {
  is.throws(
    () => require('../module/index'),
    /(remember to update this!)/i,
    'with a helpful message'
  );

  is.end();
});
