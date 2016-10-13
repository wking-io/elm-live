[![Travis – build status
](https://img.shields.io/travis/tomekwi/elm-live/master.svg?style=flat-square
)](https://travis-ci.org/tomekwi/elm-live
) [![Coveralls – test coverage
](https://img.shields.io/coveralls/tomekwi/elm-live.svg?style=flat-square
)](https://coveralls.io/r/tomekwi/elm-live
) [![David – status of dependencies
](https://img.shields.io/david/tomekwi/elm-live.svg?style=flat-square
)](https://david-dm.org/tomekwi/elm-live
) [![Code style: airbnb
](https://img.shields.io/badge/code%20style-airbnb-777777.svg?style=flat-square
)](https://github.com/airbnb/javascript
)




# elm-live

**A flexible dev server for Elm  
Live reload included!**




<a id="/screenshot"></a>&nbsp;

<p align="center"><img
  alt="Screencast"
  src="https://cdn.rawgit.com/tomekwi/elm-live/b990094/screencast.gif"
  title="Sweet, isn’t it?"
  width="405"
/></p>




<a id="/installation"></a>&nbsp;

## INSTALLATION

```sh
# Globally for a user:
npm install --global elm elm-live

# …or locally for a project:
npm install --save-dev elm elm-live
```

If you’d rather bring your own global `elm-make`, `npm install --global elm-live` will do.

Note that you need *node 4.0+* to run the tool natively. But if you’re stuck on an older version, don’t worry! [Rumour has it](https://github.com/tomekwi/elm-live/issues/2#issuecomment-156698732) that you can transpile the code to ES5!




<a id="/synopsis"></a>&nbsp;

## SYNOPSIS

```sh
elm-live [...<options>] [--] ...<elm-make args>  
elm-live --help
```




<a id="/description"></a>&nbsp;

## DESCRIPTION

First, we spawn `elm-make` with the `elm-make args` you’ve given.

When the build is ready, we start a static HTTP server in the current directory. We inject a _live reload_ snippet into every HTML file we serve. Every time a static file has changed, we’ll reload your app in all browsers you’ve opened it with. (Mobile and IE included!)

We also watch all `*.elm` files in the current directory and its subdirectories. Whenever you change, add or remove one of them, we’ll rebuild your program and reload the page.




<a id="/options"></a>&nbsp;

## OPTIONS

#### `--port=PORT`
Set the port to start the server at. If the port is taken, we’ll use the next available one. `PORT` should be a valid port number. Default: `8000`.

#### `--path-to-elm-make=PATH`
An absolute or relative path to `elm-make`. If you’ve installed _elm-platform_ locally with _npm_ (`npm install --save-dev elm`), you’ll likely want to set this to `node_modules/.bin/elm-make`. Default: `elm-make`.

#### `--host=HOSTNAME|IP`
Set the host interface to attach the server to. Default: `localhost`.

#### `--dir=PATH`
The base for static content. Default: `.`.

#### `--open`
We’ll open the app in your default browser as soon as the server is up.

#### `--no-recover`
When _elm-make_ encounters a compile error, we keep _elm-live_ running and give you time to fix your code. Pass `--no-recover` if you want the server to exit immediately whenever it encounters a compile error.

#### `--pushstate`
Serve `index.html` on 404 errors. This lets us use client-side routing in Elm. For instance, we can have a URL like `http://localhost:8000/account` get handled by the Elm _navigation_ package instead of failing with a 404 error.

#### `--before-build`
Run an executable before every rebuild. This way you can easily use other tools like elm-css or browserify in your workflow.

Heads up! At the moment, we only allow running a single executable without parameters. If you need more than that, please give us a shout at https://git.io/elm-live.before-build-args.

#### `--help`
You’re looking at it.




<a id="/examples"></a>&nbsp;

## EXAMPLES

The simplest scenario:

```sh
$ elm-live Main.elm --open
```

Custom HTML file:

```html
$ cat <<——— > index.html
  <!doctype html>
  <link rel="stylesheet" href="style.css" />

  <body>
    <div></div>
    <script src="elm.js"></script>
    <script>Elm.Main.embed(document.querySelector("div"));</script>
  </body>
———
$ elm-live Main.elm --output=elm.js --open
```

Support client-side routing in Elm:

```sh
$ elm-live Main.elm --open --pushstate
```


<a id="/caveats"></a>&nbsp;

## CAVEATS

Your HTML file must have an explicit `<body>` tag, so that we know where to inject a LiveReload snippet.




<a id="/credits"></a>&nbsp;

## CREDITS

Many thanks to [Evan Czaplicki](https://github.com/evancz), the creator of Elm, for [git.io/elm-make](https://git.io/elm-make) – the most brilliant language compiler the world has ever seen! Without _elm-make_, _elm-live_ would be a car without an engine.

Many thanks to [Matt DesLauriers](https://github.com/mattdesl) for the wonderful [git.io/budo-server](https://git.io/budo-server). That’s what does the heavy lifting on the static server side.

Warm thanks to our amazing contributors! Credits to [Brian](https://github.com/bdukes) for making Windows support possible, [Kurt](https://github.com/kbsymanz) for allowing a configurable `--host` and [Josh](https://github.com/joshmh) for his work on enabling client-side routing. Kudos to [Mathieu](https://github.com/magopian), [Rémy](https://github.com/natim) and [Nicolas](https://github.com/n1k0) for making the developer experience smoother and to [Gabriel](https://github.com/peacememories) for the `--before-build` option.




<a id="/license"></a>&nbsp;

## LICENSE

[MIT](https://git.io/elm-live.License) © [Tomek Wiszniewski](https://github.com/tomekwi)
