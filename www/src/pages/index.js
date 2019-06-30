// Dependencies
import React from "react"
import { Link, graphql } from "gatsby"
import Either from 'data.either'
import { safePath } from 'safe-prop'

// Components
import Layout from "../components/layout"
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
    .map(v => v.substring(1))

  return Either
    .of(a => b => c => [{ name: 'Forks', value: a }, { name: 'Stars', value: b }, { name: 'Version', value: c }])
    .ap(forks)
    .ap(stars)
    .ap(version)
}

const getRepoUrl = safePath(['repository', 'url'])

const renderStats = stats => (
  <ul>
    {stats.map(({ name, value }) => (
      <li key={`${name}-${value}`} >
        <p>{name}</p>
        <p>{value}</p>
      </li>
    ))}
  </ul>
)

const IndexPage = () => {

  const stats = getStats(this.props.data.github)
  const repoUrl = getRepoUrl(this.props.data.github)

  return (
    <Layout>
      <SEO title="elm-live | Live reloading server for Elm development" />
      <header>
        <h1><span>elm-live</span><LogoIcon /></h1>
        <div>
          <h2>A flexible dev server for Elm. Live reload included.</h2>
          <p>A thin wrapper around elm make, elm-live is a dev server that gives you a few extra convenience features during development. Features include pushstate for SPA development, proxies, and more. Usage and API documentation is below. Check out <a href="#getting-started">how to get started</a> or jump straight to the <a href="#documentation">API Documentation</a>.</p>
        </div>
        <div>
          <p><strong>Would you be willing to answer a few questions to help improve development in elm?</strong></p>
          <Link>Take the quick survey</Link>
        </div>
        {stats.fold(console.log, renderStats)}
      </header>
      <nav>
        <ul>
          <li><a href="#getting-started">Getting Started</a></li>
          <li><a href="#documentation">Documentation</a></li>
        </ul>
        <ul>
          <li><a href="https://wking.io"><WebIcon/></a></li>
          <li><a href={repoUrl} ><GithubIcon/></a></li>
          <li><button><MenuIcon/></button></li>
        </ul>
      </nav>
      <main>
        <h2 id="geting-started"># Getting Started</h2>
        <pre>elm-live &gt;elm-file&lt; [other-elm-files...] [flags] [--] [elm make flags]</pre>
        <p>Although all the flags are broken down in the documentation below I want to cover the different parts of the command you see above so that there is nothing left you need to assume or guess at:</p>
      </main>
    </Layout>
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
