// Dependencies
import React from "react"
import { Link } from "gatsby"

// Components
import SEO from "../components/seo"
import Layout from "../components/layout"

// Assets
import './style.css'

export const HeadingLinkBase = location => ({ children, linkId, className }) => (
  <div className={`heading-link flex relative ${className}`}>
    <a className="heading-link__icon absolute w-5 opacity-0" href={`${location}#${linkId}`}>
      <svg className="w-full h-auto" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 12'>
        <path className="text-grey-dark fill-current" d='M18,0H13.2V2.4H18a3.6,3.6,0,1,1,0,7.2H13.2V12H18A6,6,0,0,0,18,0ZM10.8,9.6H6A3.6,3.6,0,0,1,6,2.4h4.8V0H6A6,6,0,0,0,6,12h4.8ZM7.2,4.8h9.6V7.2H7.2Z' />
      </svg>
    </a>
    <div>{children}</div>
  </div>
)

const IndexPage = ({ location }) => {
  console.log(location);
  const HeadingLink = HeadingLinkBase(location.origin);
  return (
    <Layout>
      <SEO title="elm-live | Live reloading server for Elm development" />
      <div className="max-w-4xl mx-auto">
        <HeadingLink className="mb-6" linkId="installation"><h2 className="text-3xl font-bold" id="installation"># Installation</h2></HeadingLink>
        <p className="leading-relaxed mb-4">The new version of elm-live is currently in testing so you will need to install it using one of the commands below.</p>
        <pre className="code overflow-auto bg-grey leading-none text-sm mb-6">
          <code className="block mb-2 opacity-50"># Using NPM</code>
          <code className="block mb-2">npm install elm-live@next --save-dev</code>
          <code className="block mb-2"> </code>
          <code className="block mb-2 opacity-50"># Using Yarn</code>
          <code className="block">yarn add elm-live@next --dev</code>
        </pre>
        <p className="leading-relaxed mb-4">If you would like to install the older version you can use one of the commands below.</p>
        <pre className="code overflow-auto bg-grey leading-none text-sm mb-0">
          <code className="block mb-2 opacity-50"># Using NPM</code>
          <code className="block mb-2">npm install elm-live --save-dev</code>
          <code className="block mb-2"> </code>
          <code className="block mb-2 opacity-50"># Using Yarn</code>
          <code className="block">yarn add elm-live --dev</code>
        </pre>
        <div className="py-12" id="getting-started"></div>
        <HeadingLink className="mb-6" linkId="getting-started"><h2 className="text-3xl font-bold"># Getting Started</h2></HeadingLink>
        <pre className="code overflow-auto bg-grey leading-none text-sm mb-6">
          <code>elm-live &lt;elm-file&gt; [other-elm-files...] [flags] [--] [elm make flags]</code>
        </pre>
        <p className="leading-relaxed mb-12">Although all the flags are explained in the documentation below I want to cover the different parts of the command you see above so that there is nothing left you need to assume or guess at:</p>
        <HeadingLink className="mb-4" linkId="geting-started-elm-live"><h3 className="text-2xl font-bold" id="geting-started-elm-live"># elm-live</h3></HeadingLink>
        <p className="leading-relaxed mb-12">This is the name of the binary that is installed either to your local or global path.</p>
        <HeadingLink className="mb-4" linkId="geting-started-elm-file"><h3 className="text-2xl font-bold" id="geting-started-elm-file"># &lt;elm-file&gt;</h3></HeadingLink>
        <p className="leading-relaxed mb-12">This represents the one required argument and is the path to the Elm file you want to compile. This file path gets passed directly to elm make.</p>
        <HeadingLink className="mb-4" linkId="geting-started-other-elm-files"><h3 className="text-2xl font-bold" id="geting-started-other-elm-files"># [other-elm-files...]</h3></HeadingLink>
        <p className="leading-relaxed mb-12">This represents the potentially infinite, but completely optional other Elm files you want to compile, E.g. <code className="font-mono">elm-live src/Main.elm src/Widget.elm src/Tool.elm</code>.</p>
        <HeadingLink className="mb-4" linkId="geting-started-elm-make"><h3 className="text-2xl font-bold" id="geting-started-elm-make"># [--] [elm make flags]</h3></HeadingLink>
        <p className="leading-relaxed mb-0">This represents the optional <code>elm-live</code> specific flags that help manage how the server is setup. See below for docs on how these are used.</p>
        <div className="py-12" id="documentation"></div>
        <HeadingLink className="mb-4" linkId="documentation"><h2 className="text-3xl font-bold"># Flags</h2></HeadingLink>
        <HeadingLink className="mb-6" linkId="path-to-elm"><h3 className="text-2xl font-bold" id="path-to-elm"># --path-to-elm, -e</h3></HeadingLink>
        <pre className="code overflow-auto bg-grey leading-none text-sm mb-6">
          <code>elm-live src/Main.elm --path-to-elm=./node_modules/.bin/elm</code>
        </pre>
        <p className="mb-4"><strong>Default: elm</strong></p>
        <p className="leading-relaxed mb-12">Set the path to the Elm binary that <code>elm-live</code> should use when compiling your project. If you have the elm binary globally installed on your machine this is not needed. However, if you are using elm locally in your project using NPM or just have it located somewhere else on your machine this flag lets you tell <code>elm-live</code> where to look for the binary.</p>
        <HeadingLink className="mb-6" linkId="port"><h3 className="text-2xl font-bold" id="port"># --port, -p</h3></HeadingLink>
        <pre className="code overflow-auto bg-grey leading-none text-sm mb-6">
          <code>elm-live src/Main.elm --port=1234</code>
        </pre>
        <p className="mb-4"><strong>Default: 4000</strong></p>
        <p className="leading-relaxed mb-12">Set the port that the elm-live server is listening for requests at. If the default port used by elm-live is already in use this flag gives you a backdoor to pass in a port that is not in use. In the example above the url that your elm project would be available at would be <code>http://localhost::1234</code>.</p>
        <HeadingLink className="mb-6" linkId="host"><h3 className="text-2xl font-bold" id="host"># --host, -h</h3></HeadingLink>
        <pre className="code overflow-auto bg-grey leading-none text-sm mb-6">
          <code>elm-live src/Main.elm --host=my-site.com</code>
        </pre>
        <p className="mb-4"><strong>Default: localhost</strong></p>
        <p className="leading-relaxed mb-12">Set the host (the domain part of the url) that <code>elm-live</code> serves the files on.</p>
        <HeadingLink className="mb-6" linkId="ssl"><h3 className="text-2xl font-bold" id="ssl"># --ssl, -S</h3></HeadingLink>
        <pre className="code overflow-auto bg-grey leading-none text-sm mb-6">
          <code>elm-live src/Main.elm --ssl</code>
        </pre>
        <p className="mb-4"><strong>Default: false</strong></p>
        <p className="leading-relaxed mb-4">Boolean flag that generates a self signed ssl cert and makes your project available at an <code>https://</code> url. Not needed if you are using <code>--sslKey</code> and <code>--sslCert</code> to use local ssl credentials.</p>
        <p className="leading-relaxed mb-12"><strong>NOTE:</strong> This is a self-signed cert so you will most likely see a warning in the browser when you first open your project.</p>
        <HeadingLink className="mb-6" linkId="sslCert"><h3 className="text-2xl font-bold" id="sslCert"># --sslCert, -c</h3></HeadingLink>
        <pre className="code overflow-auto bg-grey leading-none text-sm mb-6">
          <code>elm-live src/Main.elm --sslCert=./mycert.pem --sslKey=./mykey.pem</code>
        </pre>
        <p className="mb-4"><strong>Default: false</strong></p>
        <p className="leading-relaxed mb-12">Relative path to your self generated certificate. If you are using this flag you must also use <code>--sslKey</code> otherwise it will not work.</p>
        <HeadingLink className="mb-6" linkId="sslKey"><h3 className="text-2xl font-bold" id="sslKey"># --sslKey, -k</h3></HeadingLink>
        <pre className="code overflow-auto bg-grey leading-none text-sm mb-6">
          <code>elm-live src/Main.elm --sslCert=./mycert.pem --sslKey=./mykey.pem</code>
        </pre>
        <p className="mb-4"><strong>Default: false</strong></p>
        <p className="leading-relaxed mb-12">Relative path to your self generated key. If you are using this flag you must also use <code>--sslCert</code> otherwise it will not work.</p>
        <HeadingLink className="mb-6" linkId="dir"><h3 className="text-2xl font-bold" id="dir"># --dir, -d</h3></HeadingLink>
        <pre className="code overflow-auto bg-grey leading-none text-sm mb-6">
          <code>elm-live src/Main.elm --dir=./dist</code>
        </pre>
        <p className="mb-4"><strong>Default: ./</strong></p>
        <p className="leading-relaxed mb-4">Set the root directory for the server. Everyone has the freedom to structure their projects however they see fit. So, this flag let's you tell the server where your asset files should be served from.</p>
        <p className="leading-relaxed mb-12"><strong>NOTE:</strong> If you are setting the <code>--dir</code> flag then make sure you are taking into account how that will interop with the <code>--output</code> flag you pass to <code>elm make</code>. If your output from the compiler is not inside of the directory you are passing to the dir flag you are going to run into bugs.</p>
        <HeadingLink className="mb-6" linkId="start-page"><h3 className="text-2xl font-bold" id="start-page"># --start-page, -s</h3></HeadingLink>
        <pre className="code overflow-auto bg-grey leading-none text-sm mb-6">
          <code>elm-live src/Main.elm --start-page=custom.html</code>
        </pre>
        <p className="mb-4"><strong>Default: index.html</strong></p>
        <p className="leading-relaxed mb-4">Set a custom html file for the server to look for when serving up your project. Did we mention that developers have the freedom to do whatever they want?</p>
        <p className="leading-relaxed mb-12"><strong>NOTE:</strong> Just like <code>--dir</code> keep in mind how this interacts with the  <code>--output</code> flag from <code>elm make</code>. Since you are setting the name as something different than index you will always need to include the <code>--output</code> flag and either set it as the same value you passed to <code>--start-page</code> or as a JS file.</p>
        <HeadingLink className="mb-6" linkId="pushstate"><h3 className="text-2xl font-bold" id="pushstate"># --pushstate, -u</h3></HeadingLink>
        <pre className="code overflow-auto bg-grey leading-none text-sm mb-6">
          <code>elm-live src/Main.elm --pushstate</code>
        </pre>
        <p className="mb-4"><strong>Default: false</strong></p>
        <p className="leading-relaxed mb-12">Tell the server to let the client handle routing and always serve the <code>--start-page</code>. One of the best features in Elm is the ability to control routing on the client. However, the server needs to know that you are expecting the client to handle routing too. That is what <code>--pushstate</code> is for.</p>
        <HeadingLink className="mb-6" linkId="hot"><h3 className="text-2xl font-bold" id="hot"># --hot, -H</h3></HeadingLink>
        <pre className="code overflow-auto bg-grey leading-none text-sm mb-6">
          <code>elm-live src/Main.elm --hot</code>
        </pre>
        <p className="mb-4"><strong>Default: false</strong></p>
        <p className="leading-relaxed mb-4">Turn hot reloading on. Hot reloading is the ability to update the Javascript currently running without reloading. This means that the state of your Elm app is maintained across compiles.</p>
        <p className="leading-relaxed mb-12"><strong>NOTE:</strong> This only works if you are outputting your compiled Elm into a js file using the <code>--output</code> flag for <code>elm make</code>.</p>
        <HeadingLink className="mb-6" linkId="open"><h3 className="text-2xl font-bold" id="open"># --open, -o</h3></HeadingLink>
        <pre className="code overflow-auto bg-grey leading-none text-sm mb-6">
          <code>elm-live src/Main.elm --open</code>
        </pre>
        <p className="mb-4"><strong>Default: false</strong></p>
        <p className="leading-relaxed mb-12">Open the project in the browser once the server is started.</p>
        <HeadingLink className="mb-6" linkId="verbose"><h3 className="text-2xl font-bold" id="verbose"># --verbose, -v</h3></HeadingLink>
        <pre className="code overflow-auto bg-grey leading-none text-sm mb-6">
          <code>elm-live src/Main.elm --verbose</code>
        </pre>
        <p className="mb-4"><strong>Default: false</strong></p>
        <p className="leading-relaxed mb-12">Log more stuff.</p>
        <HeadingLink className="mb-6" linkId="no-reload"><h3 className="text-2xl font-bold" id="no-reload"># --no-reload</h3></HeadingLink>
        <pre className="code overflow-auto bg-grey leading-none text-sm mb-6">
          <code>elm-live src/Main.elm --no-reload</code>
        </pre>
        <p className="mb-4"><strong>Default: true</strong></p>
        <p className="leading-relaxed mb-12">Turn off all live reloading. This means you have to refresh the browser yourself.</p>
        <HeadingLink className="mb-6" linkId="no-server"><h3 className="text-2xl font-bold" id="no-server"># --no-server</h3></HeadingLink>
        <pre className="code overflow-auto bg-grey leading-none text-sm mb-6">
          <code>elm-live src/Main.elm --no-server</code>
        </pre>
        <p className="mb-4"><strong>Default: true</strong></p>
        <p className="leading-relaxed mb-12">Turn off the server. This means <code>elm-live</code> only watches for changes to Elm files and compiles that code. Useful when you are using Elm in another ecosystem like Elixir, Wordpress, etc.</p>
        <HeadingLink className="mb-4 pt-8" linkId="proxies"><h2 className="text-3xl font-bold" id="proxies"># Proxies</h2></HeadingLink>
        <p className="leading-relaxed mb-12">Sometimes, in production your frontend may be served by some static file mechanism in your backend system, but while developing that might not be the way you have it setup. So you may have your backend running on say <code>localhost:5000</code> , but your frontend server (aka <code>elm-live</code>) runs separately on <code>localhost:6000</code>. In production all requests sent to <code>/api</code> know to make that request to the backend api, but on your local environment <code>/api</code> on the frontend sends that request to <code>localhost:6000/api</code> when it needs to be sent to <code>localhost:5000/api</code>. That is where proxies come in.</p>
        <HeadingLink className="mb-6" linkId="proxy-prefix"><h3 className="text-2xl font-bold" id="proxy-prefix"># --proxy-prefix</h3></HeadingLink>
        <pre className="code overflow-auto bg-grey leading-none text-sm mb-6">
          <code>elm-live src/Main.elm --proxy-prefix=/api --proxy-host=http://localhost:5000</code>
        </pre>
        <p className="mb-4"><strong>Default: false</strong></p>
        <p className="leading-relaxed mb-12">The <code>--proxy-prefix</code> flag tells the server what path to capture and point to the server located at <code>--proxy-host</code>. It requires the <code>--proxy-host</code> flag and should be a string like <code>/api</code>. </p>
        <HeadingLink className="mb-6" linkId="porxy-host"><h3 className="text-2xl font-bold" id="proxy-host"># --proxy-host</h3></HeadingLink>
        <pre className="code overflow-auto bg-grey leading-none text-sm mb-6">
          <code>elm-live src/Main.elm --proxy-prefix=/api --proxy-host=http://localhost:5000</code>
        </pre>
        <p className="mb-4"><strong>Default: false</strong></p>
        <p className="leading-relaxed mb-20">The <code>--proxy-host</code> flag tells the server what host to redirect requests to. It requires the <code>--proxy-prefix</code> flag and should be a full URL like <code>http://localhost:5000</code>.</p>
        <HeadingLink className="mb-4" linkId="elm-make"><h2 className="text-3xl font-bold" id="elm-make"># Elm Make Flags</h2></HeadingLink>
        <p className="leading-relaxed mb-4">These flags are passed through directly to <code>elm make</code> and are added to the <code>elm-live</code> command a little differently than the flags covered above. The <code>elm make</code> flags must be added after the separator <code>--</code> in the command. The <code>--</code> allows us to capture all flags after it into a single bucket so we can pass them right into <code>elm make</code>.</p>
        <p className="leading-relaxed mb-12"><strong>NOTE:</strong> If you are familiar with all of the <code>elm make</code> flags you will notice that there a some missing below, e.g. <code>--optimize</code>. I only cover <code>--debug</code> and <code>--output</code> because these are the only ones that apply to compiling for development. You can also pass the missing flags if you are really feeling it, but it is just not a regular or recommended practice during development.</p>
        <HeadingLink className="mb-6" linkId="debug"><h3 className="text-2xl font-bold" id="debug"># --debug</h3></HeadingLink>
        <pre className="code overflow-auto bg-grey leading-none text-sm mb-6">
          <code>elm-live src/Main.elm -- --debug</code>
        </pre>
        <p className="mb-4"><strong>Default: false</strong></p>
        <p className="leading-relaxed mb-12">Passing this flag adds the elm time-traveling debugger we all know and love.</p>
        <HeadingLink className="mb-6" linkId="output"><h3 className="text-2xl font-bold" id="output"># --output</h3></HeadingLink>
        <pre className="code overflow-auto bg-grey leading-none text-sm mb-6">
          <code>elm-live src/Main.elm -- --output=elm.js</code>
        </pre>
        <p className="mb-4"><strong>Default: index.html</strong></p>
        <p className="leading-relaxed mb-4">This is a very important flag. This flag allows you to change both the name and the file type of your compiled Elm code. You can name your output anything you want, but the file type must be either <code>html</code> or <code>js</code>. You can also check out this section of the Elm guide for an overview of why you might want to do this: <a className="link" href="https://guide.elm-lang.org/interop/">https://guide.elm-lang.org/interop/</a></p>
        <p className="leading-relaxed mb-20"><strong>NOTE:</strong> This flag can affect other <code>elm-live</code> flags you may be using. Since the <code>--dir</code> flag sets the root folder for the server you will need to make sure that the <code>--output</code> is inside that directory. The <code>--start-page</code> flag allows you to give a custom html file name for the server to use. So, if you are outputting html from the compiler the <code>--output</code> filename will need to match the <code>--start-page</code>.</p>
        <HeadingLink className="mb-4" linkId="feedback"><h2 className="text-3xl font-bold" id="feedback"># If you have feedback</h2></HeadingLink>
        <p className="leading-relaxed mb-4">I would love to hear from you. I want to make sure that <code>elm-live</code> is the most helpful tool it can be for the Elm community. You can reach out to me on Twitter at <a className="link" href="https://twitter.com/wking__">@wking__</a> or add an issue on the <a className="link" href="https://github.com/wking-io/elm-live">Github repo</a>.</p>
        <p className="leading-relaxed mb-12">Also, if you haven't had a chance to take the survey yet that would be a huge help to making <code>elm-live</code> better: <Link to="/surveys/2019" className="link font-bold">Take the quick survey</Link></p>
      </div>
    </Layout>
  )
}

export default IndexPage
