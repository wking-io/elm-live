import React from 'react'
import styled, { keyframes } from 'styled-components'

import { colors, media, generateKeyframes, HeadingOne, HeadingBox, Body, Code, HeadingLink, UnderlineAnchor, Wrapper, Aspect, CodeBlock, HeadingTwo, HeadingFive } from './elements'

import Track from '../components/track'
import Waypoint from '../components/waypoint'
import ElmHandler from '../components/elm-handler'
import { filePreview } from '../lib/ports'
import { Elm } from '../Elm/Main.elm'

const DocumentationWrapper = styled.div`
  margin-top: 18rem;
  border-top: 0.25rem solid ${colors.secondaryDarkest};
  border-bottom: 0.25rem solid ${colors.secondaryDarkest};

  ${media.lg`
    display: flex;
  `}
`

const FileWrapper = styled.div`
  padding: 6rem;

${media.md`
  padding: 12rem;
`}
`

const ContentWrapper = styled.div`
  padding: 6rem;

  ${media.md`
    padding: 12rem;
  `}
`

const DocumenationGuide = styled.div`
  display: flex;
`

const Documentation = ({ location, updateActive, options }) => (
  <DocumentationWrapper id='documentation'>
    <ContentWrapper>
      <Track
        gate={500}
        updateActive={updateActive}
        render={getPosition => {
          return (
            <div>
              <Waypoint id='port-default' getPosition={getPosition} />
              <DocumenationGuide>
                <HeadingBox><HeadingFive>API Documentation:</HeadingFive></HeadingBox>
                <HeadingBox dark><HeadingFive>Default</HeadingFive></HeadingBox>
              </DocumenationGuide>
              <HeadingLink linkId='flags'><HeadingOne id='flags'># Flags</HeadingOne></HeadingLink>
              <Waypoint id='path-to-elm-default' getPosition={getPosition} />
              <Waypoint id='host-default' getPosition={getPosition} />
              <Waypoint id='dir-default' getPosition={getPosition} />
              <Waypoint id='dir-js' getPosition={getPosition} />
            </div>
          )
        }}
      />
      <ElmHandler src={Elm.Main} ports={filePreview} flags={options} options={options} />
    </ContentWrapper>
    <FileWrapper />
  </DocumentationWrapper>
)

export default Documentation
