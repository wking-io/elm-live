// Dependencies
import React from "react"
import { Link, graphql } from "gatsby"
import Either from 'data.either'
import { safePath } from 'safe-prop'

// Components
import SEO from "../components/seo"
import { GithubIcon, LogoIcon, MenuIcon, WebIcon } from "../components/icons"

// Assets
import './style.css'


function getStats (data) {
  const forks = safePath(['repository', 'forkCount'], data)
  const stars = safePath(['repository', 'stargazers', 'totalCount'], data)
  const version = safePath(['repository', 'releases', 'nodes'], data)
    .map(a => a[0])
    .chain(safePath(['tag', 'name']))

  return Either
    .of(a => b => c => [{ name: 'Forks', value: a }, { name: 'Stars', value: b }, { name: 'Version', value: c }])
    .ap(forks)
    .ap(stars)
    .ap(version)
}

const getRepoUrl = safePath(['repository', 'url'])

const renderStats = stats => (
  <ul className="flex border-t-2 border-black">
    {stats.map(({ name, value }) => (
      <li className="stat flex-1 pt-4 mr-4" key={`${name}-${value}`} >
        <p className="text-sm leading-none mb-1">{name}</p>
        <p className="text-4xl font-bold leading-none">{value}</p>
      </li>
    ))}
  </ul>
)

const IndexPage = ({ data }) => {

  const stats = getStats(data.github)
  const repoUrl = getRepoUrl(data.github).getOrElse('https://github.com/wking-io/elm-live')

  return (
    <div className="font-sans text-black flex">
      <SEO title="elm-live | Live reloading server for Elm development" />
      <header className="p-8 w-1/3 flex-shrink-0 flex flex-col space-between h-screen fixed z-10 bg-white">
        <h1 className="flex items-center font-bold mb-12">
          <span className="h-8 mr-2"><LogoIcon /></span>
          <span className="leading-none">elm-live</span>
        </h1>
        <div className="flex-1">
          <h2 className="text-2xl mb-4 font-bold leading-tight">A flexible dev server for Elm. Live reload included.</h2>
          <p>A thin wrapper around elm make, elm-live is a dev server that gives you a few extra convenience features during development. Features include pushstate for SPA development, proxies, and more. Usage and API documentation is below. Check out <a className="link" href="#getting-started">how to get started</a> or jump straight to the <a className="link" href="#documentation">API Documentation</a>.</p>
        </div>
        <div>
          <p className="mb-4"><strong>Would you be willing to answer a few questions to help improve development in elm?</strong></p>
          <Link to="/surveys/2019" className="btn btn--primary block mb-6">Take the quick survey</Link>
        </div>
        {stats.fold(console.log, renderStats)}
      </header>
      <nav className="fixed w-2/3 right-0 nav bg-grey-light px-12 z-10">
        <div className="flex pt-8 border-b-2 border-black">
          <ul className="flex flex-1">
            <li className="text-sm"><a className="block mr-6 pb-3 border-b-2 border-grey-light hover:border-black" href="#getting-started">Getting Started</a></li>
            <li className="text-sm"><a className="block pb-3 border-b-2 border-grey-light hover:border-black" href="#documentation">Documentation</a></li>
          </ul>
          <ul className="flex">
            <li className="h-4 w-auto mr-4"><a href="https://wking.io"><WebIcon/></a></li>
            <li className="h-4 w-auto mr-4"><a href={repoUrl} ><GithubIcon/></a></li>
            <li className="h-4 w-auto"><button className="w-4"><MenuIcon/></button></li>
          </ul>
        </div>
      </nav>
      <main className="content relative bg-grey-light pt-32 px-12 w-2/3 ml-auto">
        <h2 className="text-3xl font-bold mb-6" id="geting-started"># Getting Started</h2>
        <pre className="code bg-grey leading-none text-sm mb-6">
          <code>elm-live &lt;elm-file&gt; [other-elm-files...] [flags] [--] [elm make flags]</code>
        </pre>
        <p className="leading-relaxed mb-8">Although all the flags are broken down in the documentation below I want to cover the different parts of the command you see above so that there is nothing left you need to assume or guess at:</p>
        <h3 className="text-2xl font-bold mb-4" id="geting-started-elm-live"># elm-live</h3>
        <p className="leading-relaxed mb-8">This is the name of the binary that is installed either to your local or global path.</p>
        <h3 className="text-2xl font-bold mb-4" id="geting-started-elm-live"># &lt;elm-file&gt;</h3>
        <p className="leading-relaxed mb-8">This represents the one required argument and is the path to the Elm file you want to compile. This file path gets passed directly to elm make.</p>
        <h3 className="text-2xl font-bold mb-4" id="geting-started-elm-live"># [other-elm-files...]</h3>
        <p className="leading-relaxed mb-8">This represents the potentially infinite, but completely optional other Elm files you want to compile, E.g. <code className="font-mono">elm-live src/Main.elm src/Widget.elm src/Tool.elm</code>.</p>
        <h3 className="text-2xl font-bold mb-4" id="geting-started-elm-live"># [--] [elm make flags]</h3>
        <p className="leading-relaxed mb-8">This represents the optional <code>elm-live</code> specific flags that help manage how the server is setup. See below for docs on how these are used.</p>
        <h3 className="text-2xl font-bold mb-4" id="geting-started-elm-live"># [--] [elm make flags]</h3>
        <p className="leading-relaxed mb-8">These come as a package deal. Both are optional, but you cannot have one without the other. The <code>--</code> allows us to capture all flags after it into a single bucket. We use it to group the <code>elm make</code> flags and pass them right into the command. This keeps all <code>elm make</code> flags future proof. If Elm releases new flags for <code>elm make</code> they will be immediately avaialble for use in <code>elm-live</code> without needing to upgrade since we do not depend on parsing the flags in our source code. See below for docs on what <code>elm make</code> flags are available and how they are used.</p>
        <h2 className="text-3xl font-bold mb-4" id="documentation"># Flags</h2>
        <h3 className="text-2xl font-bold mb-6" id="geting-started-elm-live"># --port, -p</h3>
        <pre className="code bg-grey leading-none text-sm mb-6">
          <code>elm-live src/Main.elm --port=1234</code>
        </pre>
        <p className="mb-4"><strong>Default: 4000</strong></p>
        <p className="leading-relaxed mb-8">Set the port that the elm-live server is listening for requests at. If the default port used by elm-live is already in use this flag gives you a backdoor to pass in a port that is not in use. In the example above the url that your elm project would be available at would be <code>http://localhost::1234</code>.</p>
      </main>
    </div>
  )
}

export const query = graphql`
  query {
    github {
      repository(owner: "wking-io", name: "elm-live") {
        forkCount
        url
        releases(first: 1, orderBy: { field: CREATED_AT, direction: DESC } ) {
          nodes {
            tag {
              name
            }
          }
        }
        stargazers {
          totalCount
        }
      }
    }
  }
`

export default IndexPage
