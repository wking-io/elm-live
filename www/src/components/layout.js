// Dependencies
import React from "react"
import { Link, graphql, useStaticQuery } from "gatsby"
import Either from 'data.either'
import { safePath } from 'safe-prop'

// Components
import { GithubIcon, LogoIcon, WebIcon } from "../components/icons"

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

const Layout = ({ children }) => {

  const data = useStaticQuery(
    graphql`
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
  )

  const stats = getStats(data.github)
  const repoUrl = getRepoUrl(data.github).getOrElse('https://github.com/wking-io/elm-live')

  return (
    <div className="font-sans text-black flex flex-col md:flex-row">
      <header className="p-8 md:w-2/5 lg:w-1/3 md:max-w-md flex-shrink-0 flex flex-col space-between md:h-screen md:fixed z-10 bg-white">
        <h1 className="flex items-center font-bold mb-12">
          <span className="h-8 mr-2"><LogoIcon /></span>
          <span className="leading-none">elm-live</span>
        </h1>
        <div className="flex-1">
          <h2 className="text-2xl mb-4 font-bold leading-tight">A flexible dev server for Elm. Live reload included.</h2>
          <p className="leading-relaxed mb-12">A thin wrapper around elm make, elm-live is a dev server that gives you a few extra convenience features during development. Features include pushstate for SPA development, proxies, and more. Usage and API documentation is below. Check out <a className="link" href="#getting-started">how to get started</a> or jump straight to the <a className="link" href="#documentation">API Documentation</a>.</p>
        </div>
        <div>
          <p className="mb-4"><strong>Interested in listening to real Elm implementation stories from members in the community?</strong></p>
          <a to="https://www.implementingelm.com" className="btn btn--primary block mb-6 rounded">Check out a new Elm podcast</a>
        </div>
        {stats.fold(console.log, renderStats)}
      </header>
      <nav className="md:fixed md:w-3/5 lg:w-2/3 right-0 nav bg-grey-light px-8 md:px-12 z-10 xl:px-16">
        <div className="flex pt-8 border-b-2 border-black max-w-4xl mx-auto">
          <ul className="flex flex-1">
            <li className="text-sm"><a className="block mr-6 pb-3 border-b-2 border-grey-light hover:border-black" href="#getting-started">Getting Started</a></li>
            <li className="text-sm"><a className="block pb-3 border-b-2 border-grey-light hover:border-black" href="#documentation">Documentation</a></li>
          </ul>
          <ul className="flex">
            <li className="h-4 w-auto mr-4"><a href="https://wking.io"><WebIcon/></a></li>
            <li className="h-4 w-auto"><a href={repoUrl} ><GithubIcon/></a></li>
          </ul>
        </div>
      </nav>
      <main className="content relative bg-grey-light md:mt-16 p-8 md:p-12 xl:p-16 w-full md:w-3/5 lg:w-2/3 ml-auto">
        {children}
      </main>
    </div>
  )
}

export default Layout
