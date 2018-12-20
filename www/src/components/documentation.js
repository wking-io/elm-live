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
  width: 100%;

  ${media.lg`
    display: flex;
    flex-direction: row;
  `}
`

const FileWrapper = styled.div`
  width: 100%;
  position: relative;

  ${media.md`
    width: 100rem;
    flex-shrink: 0;
    border-left: 1px solid ${colors.secondaryDarkest};
  `}
`

const FileSystem = styled.div`
  width: 100%;
  position: ${props => props.isFixed ? 'fixed' : 'absolute'};
  bottom: 0;
  right: 0;
  background-color: ${colors.white};
  z-index: 99;

  & > div {
    height: 100%;
  }

  ${media.md`
    width: 100rem;
    height: 100%;
    border-left: 1px solid ${colors.secondaryDarkest};
  `}
`

const ContentWrapper = styled.div`
  position: relative;
  padding: 26rem 6rem 6rem;

  ${media.md`
    padding: 32rem 12rem 12rem;
  `}
`

const DocumenationGuide = styled.div`
  display: flex;
  position: ${props => props.isFixed ? 'fixed' : 'absolute'};
  top: 0;
  left: 0;
  width: 100%;
  padding: 6rem;
  background-image: linear-gradient(to bottom, rgba(255, 255, 255, 1) 64%, rgba(255, 255, 255, 0));
  z-index: 9999;

  ${media.md`
    padding: 12rem;
    left: 0;
  `}
`

class Documentation extends React.Component {
  state = {
    isFixed: false,
    contentHeight: 0
  }

  _ref = React.createRef()

  onScroll = () => this.setState((state) => (state.isFixed = (this._ref.current.getBoundingClientRect().top <= 0)))

  componentDidMount () {
    window.addEventListener('scroll', this.onScroll)
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.onScroll)
  }

  render () {
    const { location, updateActive, options, activeName } = this.props
    const HeadingLink = HeadingLinkBase(location)
    return (
      <DocumentationWrapper id='documentation' ref={this._ref}>
        <ContentWrapper>
          <Track
            gate={130}
            updateActive={updateActive}
            render={getPosition => {
              return (
                <div>
                  <Waypoint id='default' getPosition={getPosition} />
                  <DocumenationGuide isFixed={this.state.isFixed}>
                    <HeadingBox><HeadingFive>API Documentation:</HeadingFive></HeadingBox>
                    <HeadingBox dark><HeadingFive lower>{activeName.getOrElse('Default')}</HeadingFive></HeadingBox>
                  </DocumenationGuide>
                  <HeadingLink location={location} linkId='flags'><HeadingOne id='flags'># Flags</HeadingOne></HeadingLink>
                  <Waypoint id='port-default' getPosition={getPosition} />
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
                  <HeadingLink linkId='dir'><HeadingTwo id='dir'># --dir</HeadingTwo></HeadingLink>
                  <Body>Everyone has the freedom to structure their projects however they see fit. So, the <Code>--dir</Code> flag let's you tell the server where to look for your html source file.</Body>
                  <Body><strong>NOTE:</strong> Pay attention how the options you have set for the <Code>--dir</Code> flag interop with the <Code>--output</Code> flag you pass to <Code>elm make</Code>. Here are a couple scenarios to explain why.</Body>
                  <HeadingLink linkId='dir-scenario-one'><HeadingThree id='dir-scenario-one'># Scenario: My elm make build outputs an html file named custom.html into the root</HeadingThree></HeadingLink>
                  <Waypoint id='start-page-js' getPosition={getPosition} />
                  <HeadingLink linkId='dir'><HeadingTwo id='dir'># --dir</HeadingTwo></HeadingLink>
                  <Body>Everyone has the freedom to structure their projects however they see fit. So, the <Code>--dir</Code> flag let's you tell the server where to look for your html source file.</Body>
                  <Body><strong>NOTE:</strong> Pay attention how the options you have set for the <Code>--dir</Code> flag interop with the <Code>--output</Code> flag you pass to <Code>elm make</Code>. Here are a couple scenarios to explain why.</Body>
                  <HeadingLink linkId='dir-scenario-one'><HeadingThree id='dir-scenario-one'># Scenario: My elm make build outputs an html file named custom.html into the root</HeadingThree></HeadingLink>
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
        </ContentWrapper>
        <FileWrapper>
          <FileSystem isFixed={this.state.isFixed}>
            <ElmHandler style={{ height: '100%' }} src={Elm.Main} ports={filePreview} flags={options} options={options} />
          </FileSystem>
        </FileWrapper>
      </DocumentationWrapper>
    )
  }
}

export default Documentation
