[![Build Status](https://travis-ci.org/wking-io/elm-live.svg?branch=master)](https://travis-ci.org/wking-io/elm-live)
[![Coverage Status](https://coveralls.io/repos/github/wking-io/elm-live/badge.svg?branch=master)](https://coveralls.io/github/wking-io/elm-live?branch=master)




# elm-live

**A flexible dev server for Elm  
Live reload included!**




<a id="/screenshot"></a>&nbsp;

<p align="center"><img
  alt="Screencast"
  src="https://cdn.rawgit.com/wking-io/elm-live/b990094/screencast.gif"
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

### If you are using Elm 0.18

```sh
# Globally for a user:
npm install --global elm elm-live@prev

# …or locally for a project:
npm install --save-dev elm elm-live@prev
```

If you’d rather bring your own global `elm`, `npm install --global elm-live` will do.

Note that you need *node 6.0+* to run the tool natively. But if you’re stuck on an older version, don’t worry! [Rumour has it](https://github.com/wking-io/elm-live/issues/2#issuecomment-156698732) that you can transpile the code to ES5!




<a id="/synopsis"></a>&nbsp;

## SYNOPSIS

```sh
elm-live [...<options>] [--] ...<elm make args>  
elm-live --help
```




<a id="/description"></a>&nbsp;

## DESCRIPTION

First, we spawn `elm make` with the `elm make args` you’ve given.

When the build is ready, we start a static HTTP server in the current directory. We inject a _live reload_ snippet into every HTML file we serve. Every time a static file has changed, we’ll reload your app in all browsers you’ve opened it with. (Mobile and IE included!)

We also watch all `*.elm` files in the current directory and its subdirectories. Whenever you change, add or remove one of them, we’ll rebuild your program and reload the page.




<a id="/options"></a>&nbsp;

## OPTIONS

#### `-p, --port [PORT]`
Set the port to start the server at. If the port is taken, we’ll use the next available one. `PORT` should be a valid port number. Default: `8000`.

#### `-e, --path-to-elm [PATH]`
An absolute or relative path to `elm`. If you’ve installed _elm-platform_ locally with _npm_ (`npm install --save-dev elm`), you’ll likely want to set this to `node_modules/.bin/elm`. Default: `elm`.

#### `-h, --host [HOSTNAME|IP]`
Set the host interface to attach the server to. Default: `localhost`.

#### `-d, --dir=PATH`
The base for static content. Default: `.`.

#### `-o, --open`
We’ll open the app in your default browser as soon as the server is up.

#### `-r, --no-recover`
When _elm make_ encounters a compile error, we keep _elm-live_ running and give you time to fix your code. Pass `--no-recover` if you want the server to exit immediately whenever it encounters a compile error.

#### `-u, --pushstate`
Serve `index.html` on 404 errors. This lets us use client-side routing in Elm. For instance, we can have a URL like `http://localhost:8000/account` get handled by the Elm _navigation_ package instead of failing with a 404 error.

#### `-s, --start-page [STARTPAGE]`
A custom html file to serve other than the default `index.html`.

#### `-x, --proxyPrefix [PREFIX]`
Proxy requests to paths starting with `prefix` to another server. Requires `--proxyHost` and should be a string like `/api`. Defaults to not proxying

#### `-y, --proxyHost`
Proxy requests to another server running at `host`. Requires `--proxyPrefix` and should be a full URL, eg. `http://localhost:9000`. Defaults to not proxying

#### `-b, --before-build [EXECUTABLE]`
Run `EXECUTABLE` before every rebuild. This way you can easily use other tools like _elm-css_ or _browserify_ in your workflow.

Heads up! At the moment, we only allow running a single executable without parameters. If you need more than that, please give us a shout at https://git.io/elm-live.before-build-args.

#### `-a, --after-build [EXECUTABLE]`
Just like `--before-build`, but runs after `elm make`.

#### `--help`
You’re looking at it.




<a id="/examples"></a>&nbsp;

## EXAMPLES

### Have the compiler generate your index.html for you.

This command will start the server at https://localhost:8000 and compile your elm code to an index.html file in the folder you are running the command from. Note: the `--open` flag will open the page in the browser for you. 

```sh
$ elm-live src/Main.elm --open
```

### Use a custom HTML file

This command tells `elm make` to compile your elm code to a file named `elm.js` in the folder you are running the command from. From there you just need to include the script in default file of index.html as shown in the Elm guide here: https://guide.elm-lang.org/interop/

```sh
$ elm-live src/Main.elm --open -- --output=elm.js
```

To specify an HTML file other than the default, you can use the `--start-page` flag. This is an easy way to avoid `elm make` accidentally overriding your custom HTML.

```sh
$ elm-live src/Main.elm --open --start-page=custom.html -- --output=elm.js
```

### Support client-side routing in Elm

This command tells the server to always serve up the index.html no matter what the URL is. This allows Elm to handle the routing clientside. Note: this option is a must when you are using `Browser.Navigation`

```sh
$ elm-live src/Main.elm --open --pushstate
```

### Adding the debugger during dev

All possible `elm make` flags are available in `elm-live`. You just need to make sure they are passed after `--` in the command. So the command below shows how to turn on the debugger in `elm make`.

```sh
elm-live src/Main.elm --open -- --debug
```


<a id="/troubleshooting"></a>&nbsp;

## TROUBLESHOOTING

#### I’m seeing a SyntaxError about block-scoped declarations

If you’re seeing one of these:

```
SyntaxError: Block-scoped declarations (let, const, function, class) not yet supported outside strict mode
```

make sure you’re running on node 6+. If you can’t upgrade, consider [transpiling](https://github.com/wking-io/elm-live/issues/2#issuecomment-156698732) `source/elm-live.js` to ES5.

By the way, [yarn](https://github.com/yarnpkg/yarn) should be warning you about installing incompatible packages. To get the same behavior in npm, [set the `engine-strict`](https://docs.npmjs.com/misc/config#engine-strict) flag.




<a id="/credits"></a>&nbsp;

## Original Author
Huge shoutout to the creator [Tomek Wiszniewski](https://github.com/tomekwi)!

## Current Owner
[Will King](https://github.com/wking-io)

## CREDITS

Many thanks to [Evan Czaplicki](https://github.com/evancz), the creator of Elm, for the [Elm Compiler](https://github.com/elm/compiler) – the most brilliant language compiler the world has ever seen! Without _elm make_, _elm-live_ would be a car without an engine.

Many thanks to [Matt DesLauriers](https://github.com/mattdesl) for the wonderful [budo](https://github.com/mattdesl/budo). That’s what does the heavy lifting on the static server side.

Warm thanks to our amazing contributors! Credits to [Brian](https://github.com/bdukes) for making Windows support possible, [Kurt](https://github.com/kbsymanz) for allowing a configurable `--host` and [Josh](https://github.com/joshmh) for his work on enabling client-side navigation. Thanks to [Ryan](https://github.com/Ryan1729) batch updates are nice and fast. Kudos to [Mathieu](https://github.com/magopian), [Rémy](https://github.com/natim) and [Nicolas](https://github.com/n1k0) for making the developer experience smoother and to [Gabriel](https://github.com/peacememories) for the `--before-build` option. Many thanks to [Noah](https://github.com/eeue56) for making sure elm-live works smoothly with [elm-test](https://github.com/elm-community/elm-test). Thanks to [Darren](https://github.com/darrensiegel) for finding and fixing the bug with `--port` options on the 3.0.0 release.




<a id="/license"></a>&nbsp;

## LICENSE

[MIT](https://git.io/elm-live.License) © [Will King](https://github.com/wking-io) & [Tomek Wiszniewski](https://github.com/tomekwi)
