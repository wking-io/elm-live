import React from 'react'
import { graphql } from 'gatsby'
import Either from 'data.either'
import { safePath } from 'safe-prop'

import { Wrapper } from '../components/elements'
import Header from '../components/header'
import Layout from '../components/layout'
import Track from '../components/track'
import Waypoint from '../components/waypoint'
import ElmHandler from '../components/elm-handler'
import { filePreview } from '../lib/ports'
import { Elm } from '../Elm/Main.elm'

function getOption (key, data) {
  return Either
    .fromNullable(data.find(edge => edge.node.id === key))
    .chain(safePath(['node', 'options']))
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
    active: 'port-default'
  }

  updateActive = active => this.state.active === active ? {} : this.setState({ active })

  render () {
    const options = getOption(this.state.active, this.props.data.allWaypointsJson.edges)
    const stats = getStats(this.props.data.github)
    const repoUrl = getRepoUrl(this.props.data.github)
    return (
      <Layout>
        <Header repoUrl={repoUrl} stats={stats} />
        <Wrapper>
          <Track
            gate={500}
            updateActive={this.updateActive}
            render={getPosition => {
              return (
                <div>
                  <h1>Usage</h1>
                  <pre>elm-live</pre>
                  <Waypoint id='port-default' getPosition={getPosition} />
                  <Waypoint id='path-to-elm-default' getPosition={getPosition} />
                  <Waypoint id='host-default' getPosition={getPosition} />
                  <Waypoint id='dir-default' getPosition={getPosition} />
                  <Waypoint id='dir-js' getPosition={getPosition} />
                </div>
              )
            }}
          />
          <ElmHandler src={Elm.Main} ports={filePreview} flags={options} options={options} />
        </Wrapper>
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
