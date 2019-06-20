import React from "react"
import { graphql } from "gatsby"
import Either from 'data.either'
import { safePath } from 'safe-prop'
import './style.css'


import Layout from "../components/layout"
import SEO from "../components/seo"
import Header from "../components/header"

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

const IndexPage = () => {

  const stats = getStats(this.props.data.github)
  const repoUrl = getRepoUrl(this.props.data.github)

  return (
    <Layout>
      <SEO title="elm-live | Live reloading server for Elm development" />
      <Header repoUrl={repoUrl} stats={stats} />
      <Documentation></Documentation>
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
