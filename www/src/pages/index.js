import React from 'react'
import { graphql } from 'gatsby'
import Either from 'data.either'
import { safePath } from 'safe-prop'

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
  return Either
    .of((a, b, c) => [{ name: 'Forks', stat: a }, { name: 'Stars', stat: b }, { name: 'Version', stat: c }])
    .ap(safePath(['repository', 'forkCount']))
    .ap(
      safePath(['repository', 'releases', 'nodes'])
        .map(a => a[0])
        .chain(safePath(['tag', 'name']))
    )
    .ap(safePath(['stargazers', 'totalCount']))
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
