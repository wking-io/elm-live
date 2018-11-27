import React from 'react'
import { graphql } from 'gatsby'
import Either from 'data.either'
import { safePath } from 'safe-prop'

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

const height = { height: '400px' }

class IndexPage extends React.Component {
  state = {
    active: 'port-default'
  }

  updateActive = active => this.state.active === active ? {} : this.setState({ active })

  render () {
    const options = getOption(this.state.active, this.props.data.allWaypointsJson.edges)
    return (
      <Layout>
        <ElmHandler src={Elm.Main} ports={filePreview} flags={options} options={options} />
        <Track
          gate={500}
          updateActive={this.updateActive}
          render={getPosition => {
            return (
              <div>
                <h1>Usage</h1>
                <pre>elm-live</pre>
                <section style={height} />
                <Waypoint id='port-default' getPosition={getPosition} />
                <section style={height} />
                <Waypoint id='path-to-elm-default' getPosition={getPosition} />
                <section style={height} />
                <Waypoint id='host-default' getPosition={getPosition} />
                <section style={height} />
                <Waypoint id='dir-default' getPosition={getPosition} />
                <section style={height} />
                <Waypoint id='dir-js' getPosition={getPosition} />
              </div>
            )
          }}
        />
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
