import React from 'react'
import { graphql } from 'gatsby'

import Layout from '../components/layout'
import Track from '../components/track'
import Waypoint from '../components/waypoint'

function formatData (data) {
  return data.reduce(
    (acc, edge) =>
      Object.assign(acc, { [edge.node.id]: { options: edge.node.options, position: 0 } }), {})
}

const height = { height: '400px' }

const IndexPage = ({ data }) => (
  <Layout>
    <Track
      gate={500}
      data={formatData(data.allWaypointsJson.edges)}
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

export default IndexPage

export const query = graphql`
  query {
    allWaypointsJson {
      edges {
        node {
          id
          options {
            port
            pathToElm
            host
            dir
            startPage
            open
            noRecover
            pushstate
            proxyHost
            proxyPrefix
            beforeBuild
            afterBuild
            debug
            output
          }
        }
      }
    }
  }
`
