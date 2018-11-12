import React from 'react'
import { graphql } from 'gatsby'

import Layout from '../components/layout'
import Track from '../components/track'

function formatData (data) {
  return data.map(edge => ({ [edge.node.id]: edge.node.options }))
}

const IndexPage = ({ data }) => (
  <Layout>
    <Track
      data={formatData(data.allWaypointsJson.edges)}
      render={getPosition => {
        console.log(getPosition)
        return (
          <div>
            <h1>Usage</h1>
            <pre>elm-live</pre>
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
