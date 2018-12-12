import React from 'react'
import styled, { keyframes } from 'styled-components'

import { colors, media, generateKeyframes, HeadingOne, Body, Code, HeadingLink, UnderlineAnchor, Wrapper, Aspect, CodeBlock, HeadingTwo } from './elements'


import Track from '../components/track'
import Waypoint from '../components/waypoint'
import ElmHandler from '../components/elm-handler'
import { filePreview } from '../lib/ports'
import { Elm } from '../Elm/Main.elm'

const DocumentationWrapper = styled.div``

const Documentation = ({ location, updateActive, options }) => (
  <DocumentationWrapper>
    <Track
      gate={500}
      updateActive={updateActive}
      render={getPosition => {
        return (
          <div>
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
  </DocumentationWrapper>
)

export default Documentation