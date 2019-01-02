import React from 'react'
import { graphql } from 'gatsby'
import Either from 'data.either'
import { safePath } from 'safe-prop'

import Layout from '../components/layout'
import Header from '../components/header'
import Intro from '../components/intro'
import GettingStarted from '../components/getting-started'
import Documentation from '../components/documentation'

function getOption (key, data) {
  return Either
    .fromNullable(data.find(edge => edge.node.id === key))
    .chain(safePath(['node', 'options']))
}

function getName (key, data) {
  return Either
    .fromNullable(data.find(edge => edge.node.id === key))
    .chain(safePath(['node', 'name']))
}

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

class IndexPage extends React.Component {
  state = {
    active: 'default'
  }

  updateActive = active => this.state.active === active ? {} : this.setState({ active })

  render () {
    const options = getOption(this.state.active, this.props.data.allWaypointsJson.edges)
    const stats = getStats(this.props.data.github)
    const repoUrl = getRepoUrl(this.props.data.github)
    const activeName = getName(this.state.active, this.props.data.allWaypointsJson.edges)
    return (
      <Layout>
        <Header repoUrl={repoUrl} stats={stats} />
        <Intro />
        <GettingStarted location={this.props.location.href} />
        <Documentation location={this.props.location.href} options={options} updateActive={this.updateActive} activeName={activeName} />
      </Layout>
    )
  }
}

export default IndexPage

export const query = graphql`
  query {
    allWaypointsJson {
      edges {
        node {
          id
          name
          options {
            flags {
              port
              pathToElm
              host
              open
              noRecover
              pushstate
              proxyHost
              proxyPrefix
              beforeBuild
              afterBuild
              debug
            }
            output
          }
        }
      }
    }
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
