const {bold} = require('chalk');

module.exports =
`  ${bold('SYNOPSIS')}

${require('./usage').replace(/^(?!$)/g, '    ')}`;
