import React from 'react'

import { HeadingOne, Body, Code, HeadingLink, Wrapper, CodeBlock, HeadingTwo } from './elements'

const GettingStarted = ({ location }) => (
  <Wrapper>
    <HeadingLink linkId='getting-started' location={location}><HeadingOne id='getting-started'>Getting Started</HeadingOne></HeadingLink>
    <CodeBlock>
      <Code>elm-live &lt;elm-file&gt; [other-elm-files] [flags] [--] [elm make flags]</Code>
    </CodeBlock>
    <Body>Although all the flags are broken down in the documentation below I want to cover the different parts of the command you see above so that there is nothing left you need to assume or guess at:</Body>
    <HeadingLink linkId='getting-started-cmd' location={location}><HeadingTwo id='getting-started-cmd'># elm-live</HeadingTwo></HeadingLink>
    <Body>This is the name of the binary that is installed either to your local or global path.</Body>
    <HeadingLink linkId='getting-started-file' location={location}><HeadingTwo id='getting-started-file'># &lt;elm-file&gt;</HeadingTwo></HeadingLink>
    <Body>This represents the one required argument and is the path to the Elm file you want to compile. This file path gets passed directly to <Code>elm make</Code>.</Body>
    <HeadingLink linkId='getting-started-file-extra' location={location}><HeadingTwo id='getting-started-file-extra'># [other-elm-files]</HeadingTwo></HeadingLink>
    <Body>This represents the potentially infinite, but completely optional other Elm files you want to compile, E.g. <Code>elm-live src/Main.elm src/Widget.elm src/Tool.elm</Code>.</Body>
    <HeadingLink linkId='getting-started-flags' location={location}><HeadingTwo id='getting-started-flags'># [flags]</HeadingTwo></HeadingLink>
    <Body>This represents the optional <Code>elm-live</Code> specific flags that help manage how the server is setup. See below for docs on how these are used.</Body>
    <HeadingLink linkId='getting-started-elm-make' location={location}><HeadingTwo id='getting-started-elm-make'># [--] [elm make flags]</HeadingTwo></HeadingLink>
    <Body>These come as a package deal. Both are optional, but you cannot have one without the other. The <Code>--</Code> allows us to capture all flags after it into a single bucket so they are passed as a group. We use it so they are passed right into <Code>elm make</Code>. This keeps all <Code>elm make</Code> flags future proof. If Elm releases new flags for <Code>elm make</Code> they will be immediately avaialble for use in <Code>elm-live</Code> without needing to upgrade since we do not depend on parsing the flags in our source code. See below for docs on what elm make flags are available and how they are used.</Body>
  </Wrapper>
)

export default GettingStarted
