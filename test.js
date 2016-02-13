const fs = require('fs');

const testDir = `${ __dirname }/test`;

fs.readdirSync(testDir).forEach((file) => {
  require(`${ testDir }/${ file }`);
});
