import React from 'react'
import styled from 'styled-components'

import { colors, media, HeadingOne, HeadingBox, Body, Code, HeadingLinkBase, HeadingTwo, HeadingThree, HeadingFive } from './elements'

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

const Documentation = ({ location, updateActive, options, active }) => {
  const HeadingLink = HeadingLinkBase(location)
  return (
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
                <HeadingLink location={location} linkId='flags'><HeadingOne id='flags'># Flags</HeadingOne></HeadingLink>
                <HeadingLink linkId='port'><HeadingTwo id='port'># --port</HeadingTwo></HeadingLink>
                <Body>This one is pretty straightforward. By default elm-live runs its server on port 4000. The —port flag let's you change that to something else. If you don't know what ports are or do you can check out this awesome overview here: link to awesome overview.</Body>
                <Waypoint id='path-to-elm-default' getPosition={getPosition} />
                <HeadingLink linkId='path-to-elm'><HeadingTwo id='path-to-elm'># --path-to-elm</HeadingTwo></HeadingLink>
                <Body>A lot of times you will have the elm binary globally installed on your machine. However, if you are using elm locally in your project using NPM or just have it located somewhere else the <Code>--path-to-elm</Code> flag lets you tell <Code>elm-live</Code> where to look for the binary.</Body>
                <Waypoint id='host-default' getPosition={getPosition} />
                <HeadingLink linkId='host'><HeadingTwo id='host'># --host</HeadingTwo></HeadingLink>
                <Body>A lot of times you will have the elm binary globally installed on your machine. However, if you are using elm locally in your project using NPM or just have it located somewhere else the <Code>--path-to-elm</Code> flag lets you tell <Code>elm-live</Code> where to look for the binary.</Body>
                <Waypoint id='dir-default' getPosition={getPosition} />
                <HeadingLink linkId='dir'><HeadingTwo id='dir'># --dir</HeadingTwo></HeadingLink>
                <Body>Everyone has the freedom to structure their projects however they see fit. So, the <Code>--dir</Code> flag let's you tell the server where to look for your html source file.</Body>
                <Body><strong>NOTE:</strong> Pay attention how the options you have set for the <Code>--dir</Code> flag interop with the <Code>--output</Code> flag you pass to <Code>elm make</Code>. Here are a couple scenarios to explain why.</Body>
                <HeadingLink linkId='dir-scenario-one'><HeadingThree id='dir-scenario-one'># Scenario: My elm make build outputs html into a subdirectory</HeadingThree></HeadingLink>
                <Waypoint id='dir-js' getPosition={getPosition} />
                <HeadingLink linkId='dir-scenario-one'><HeadingThree id='dir-scenario-one'># Scenario: My elm make build outputs javascript into a subdirectory</HeadingThree></HeadingLink>
                <Waypoint id='dir-js-root' getPosition={getPosition} />
                <HeadingLink linkId='dir-scenario-one'><HeadingThree id='dir-scenario-one'># Scenario: My elm make build outputs javascript into the root</HeadingThree></HeadingLink>
                <Waypoint id='start-page-default' getPosition={getPosition} />
                <HeadingLink linkId='dir'><HeadingTwo id='dir'># --dir</HeadingTwo></HeadingLink>
                <Body>Everyone has the freedom to structure their projects however they see fit. So, the <Code>--dir</Code> flag let's you tell the server where to look for your html source file.</Body>
                <Body><strong>NOTE:</strong> Pay attention how the options you have set for the <Code>--dir</Code> flag interop with the <Code>--output</Code> flag you pass to <Code>elm make</Code>. Here are a couple scenarios to explain why.</Body>
                <HeadingLink linkId='dir-scenario-one'><HeadingThree id='dir-scenario-one'># Scenario: My elm make build outputs an html file named custom.html into the root</HeadingThree></HeadingLink>
                <Waypoint id='start-page-dir' getPosition={getPosition} />
                <Waypoint id='start-page-js' getPosition={getPosition} />
                <Waypoint id='start-page-dir-js' getPosition={getPosition} />
                <Waypoint id='open-default' getPosition={getPosition} />
                <Waypoint id='no-recover-default' getPosition={getPosition} />
                <Waypoint id='pushstate-default' getPosition={getPosition} />
                <Waypoint id='proxy-default' getPosition={getPosition} />
                <Waypoint id='before-build-default' getPosition={getPosition} />
                <Waypoint id='after-build-default' getPosition={getPosition} />
                <Waypoint id='debug-default' getPosition={getPosition} />
                <Waypoint id='output-default' getPosition={getPosition} />
                <Waypoint id='output-custom' getPosition={getPosition} />
                <Waypoint id='output-custom-dir' getPosition={getPosition} />
                <Waypoint id='output-js' getPosition={getPosition} />
                <Waypoint id='output-js-custom' getPosition={getPosition} />
                <Waypoint id='output-js-custom-dir' getPosition={getPosition} />
                <Waypoint id='output-js-custom-dir-root' getPosition={getPosition} />
              </div>
            )
          }}
        />
        <ElmHandler src={Elm.Main} ports={filePreview} flags={options} options={options} />
      </ContentWrapper>
      <FileWrapper />
    </DocumentationWrapper>
  )
 }

export default Documentation
