const bold = require('chalk').bold;

module.exports =
`  ${bold('WHAT IT DOES')}

    We spawn elm-reactor in the current working directory and start
    a LiveReload server watching all \`*.elm\` files.

    Make sure you’ve got one of http://livereload.com/extensions turned on
    in your browser. Whenever you change an Elm file, the page will be refreshed
    and elm-reactor will recompile your program on the fly.
`;
