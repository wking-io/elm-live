import React from 'react'
import styled, { keyframes } from 'styled-components'

import { colors, media, setKeyframes, HeadingOne, Body, Code, UnderlineAnchor, Wrapper, Aspect } from './elements'

const IntroWrapper = styled.div`
  border: 0.25rem solid ${colors.grey};
`

const IntroIconFrame = styled.div`
  padding: 4rem;
  border-bottom: 0.25rem solid ${colors.grey};

  ${media.lg`
    border-bottom: none;
    border right: 0.25rem solid ${colors.grey};
  `}
`

const EditorAnimation = keyframes`${setKeyframes(22, {
  7: `{ z-index: 1; }`,
  11: `{ z-index: 2; }`,
  18: `{ z-index: 1; }`,
  22: `{ z-index: 2; }`
})}`

const CodeSnippetAnimation = keyframes`${setKeyframes(22, {
  2: `{ transform: scaleX(1); }`,
  3: `{ transform: scaleX(0); }`,
  4: `{ transform: scaleX(0); }`,
  5: `{ transform: scaleX(1); }`,
  13: `{ transform: scaleX(1); }`,
  14: `{ transform: scaleX(0); }`,
  15: `{ transform: scaleX(0); }`,
  16: `{ transform: scaleX(1); }`
})}`

const EditorSvg = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 60%;
  z-index: 2;
  animation: ${EditorAnimation} 10s steps(1, end) 0s infinite both;
`

const CodeSnippet = styled.div`
  background-color: ${colors.blueLight};
  height: 2.5%;
  left: 36.65%;
  position: absolute;
  top: 24.95%;
  width: 7%;
  z-index: 3;
  transform-origin: left center;
  animation: ${CodeSnippetAnimation} 10s steps(6, end) 0s infinite both;
`

const EditorIcon = () => (
  <EditorSvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 552 503.37'>
    <path fill='#1e202b' d='M152.39 21H551v30H152.39z' />
    <path fill='#1a3547' d='M276 51V21H152.39v481.38H551V51H276zM1 21h151.39v481.37H1z' />
    <path fill='#1e202b' d='M152.89 502.87H.5V20.5h152.39zm-151.39-1h150.39V21.5H1.5z' />
    <path fill='#1a3547' d='M1 1h550v20H1z' />
    <path fill='#1e202b' d='M551.5 21.5H.5V.5h551zm-550-1h549v-19H1.5z' />
    <circle fill='#ef6300' cx='10.8' cy='11' r='4' />
    <circle fill='#f77f00' cx='22.8' cy='11' r='4' />
    <circle fill='#ffa10c' cx='34.8' cy='11' r='4' />
    <path fill='#ef6300' d='M196.41 89.11h94.43v14h-94.43z' />
    <path fill='#ffa10c' d='M303.05 89.11h59.66v14h-59.66z' />
    <path fill='#4d7489' d='M234.07 123.18h69.6v14h-69.6z' />
    <path fill='#99b1bc' d='M315.66 123.18h59.66v14h-59.66z' />
    <path fill='#4d7489' d='M234.07 175.31h69.6v14h-69.6z' />
    <path fill='#99b1bc' d='M315.66 175.31h59.66v14h-59.66z' />
    <path fill='#4d7489' d='M234.07 149.25h91.64v14h-91.64z' />
    <path fill='#ef6300' d='M196.41 407.32h49.38v14h-49.38z' />
    <path fill='#ffa10c' d='M257.42 407.32h91.07v14h-91.07z' />
    <path fill='#4d7489' d='M234.07 441.39h69.6v14h-69.6z' />
    <path fill='#99b1bc' d='M315.66 441.39h59.66v14h-59.66z' />
    <path fill='#4d7489' d='M234.07 467.46h91.64v14h-91.64z' />
    <path fill='#99b1bc' d='M337.66 467.46h59.66v14h-59.66z' />
    <path fill='#ef6300' d='M196.41 236.9h125.2v14h-125.2z' />
    <path fill='#4d7489' d='M234.07 270.97h56.77v14h-56.77z' />
    <path fill='#99b1bc' d='M302.67 270.97h74.65v14h-74.65z' />
    <path fill='#4d7489' d='M234.07 297.04h91.64v14h-91.64z' />
    <path fill='#99b1bc' d='M337.66 297.04h59.66v14h-59.66z' />
    <path fill='#4d7489' d='M234.07 493.52h75.13v8.85h-75.13z' />
    <path fill='#99b1bc' d='M322.01 493.52h69.42v8.85h-69.42z' />
    <path fill='#4d7489' d='M234.07 323.11h75.13v14h-75.13z' />
    <path fill='#99b1bc' d='M321.61 323.11h61.22v14h-61.22z' />
    <path fill='#4d7489' d='M234.07 349.18h111.6v14h-111.6z' />
    <path fill='#99b1bc' d='M358.66 349.18h59.66v14h-59.66z' />
    <path fill='#0d1f2d' d='M552 503.37H0V0h552zm-550-2h548V2H2z' />
    <path fill='#1e202b' d='M14.8 36h78.26v6H14.8z' />
    <path fill='#375363' d='M14.8 71.61h9.14v9.14H14.8zM30.8 71.61h78.26v9.14H30.8zM31.55 88.36h9.14v9.14h-9.14zM47.55 88.36h78.26v9.14H47.55zM31.55 105.11h9.14v9.14h-9.14zM47.55 105.11h51.44v9.14H47.55zM31.55 122.04h9.14v9.14h-9.14zM47.55 122.04h67.14v9.14H47.55z' />
    <path fill='#99b1bc' d='M31.55 171.96h9.14v9.14h-9.14zM47.55 171.96h78.26v9.14H47.55z' />
    <path fill='#375363' d='M168.97 32.08h9.14v9.14h-9.14zM184.97 32.08h78.26v9.14h-78.26zM31.55 188.72h9.14v9.14h-9.14zM47.55 188.72h51.44v9.14H47.55zM31.55 205.64h9.14v9.14h-9.14zM47.55 205.64h67.14v9.14H47.55zM14.8 152.53h9.14v9.14H14.8zM30.8 152.53h78.26v9.14H30.8z' />
  </EditorSvg>
)

const BrowserAnimation = keyframes`${setKeyframes(22, {
  7: `{ z-index: 4; }`,
  11: `{ z-index: 1; }`,
  18: `{ z-index: 4; }`,
  22: `{ z-index: 1; }`
})}`

const ButtonBackgroundAnimation = keyframes`${setKeyframes(22, {
  9: `{ opacity: 0; }`,
  20: `{ opacity: 1; }`
})}`

const ButtonTextAnimation = keyframes`${setKeyframes(22, {
  9: `{ fill: #ffffff; }`,
  20: `{ fill: ${colors.blue}; }`
})}`

console.log(setKeyframes(22, {
  9: `{ fill: #ffffff; }`,
  20: `{ fill: ${colors.blue}; }`
}))

const BrowserSvg = styled.svg`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 60%;
  z-index: 1;
  animation: ${BrowserAnimation} 10s steps(1, end) 0s infinite both;

  & .button-bg {
    fill: #ffffff;
    animation: ${ButtonBackgroundAnimation} 10s steps(1, end) 0s infinite both;
  }

  & .button-text {
    fill: ${colors.blue};
    animation: ${ButtonTextAnimation} 10s steps(1, end) 0s infinite both;
  }
`

const BrowserIcon = () => (
  <BrowserSvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 552 502.87'>
    <defs>
      <linearGradient id='linear-gradient' x1='64.2' y1='232.21' x2='175.2' y2='232.21' gradientUnits='userSpaceOnUse'>
        <stop offset='0' stopColor='#ffa01c' />
        <stop offset='1' stopColor='#ef6300' />
      </linearGradient>
    </defs>
    <path fill='#d3dee2' d='M1.5 1h550v25H1.5z' />
    <circle fill='#ef6300' cx='14' cy='13' r='4' />
    <circle fill='#f77f00' cx='26' cy='13' r='4' />
    <circle fill='#ffa01c' cx='38' cy='13' r='4' />
    <path fill='#ffffff' d='M1 51h550v283.28H1z' />
    <path fill='#d3dee2' d='M1 334.28h550v167.59H1z' />
    <path fill='#f3f4f5' d='M175.62 26V1H52.01v25H1v25h550V26H175.62z' />
    <path fill='#0d1f2d' d='M551.5 51.5H.5v-26h51V.5h124.62v25H551.5zm-550-1h549v-24H175.12v-25H52.51v25H1.5z' />
    <path fill='#4d7489' d='M64.7 423.13h118.4v78.74H64.7zM218.87 423.13h118.4v78.74h-118.4zM373.05 423.13h118.4v78.74h-118.4z' />
    <path fill='#0d1f2d' d='M552 502.87H0V0h552zm-550-2h548V2H2z' />
    <path fill='url(#linear-gradient)' d='M64.2 221.71h111v21h-111z' />
    <path class='button-bg' d='M65.2 222.71h109v19h-109z' />
    <path class='button-text' d='M81.95 231.21h75.5v2h-75.5z' />
    <path fill='#d3dee2' d='M239.76 101.28h251.69v181.43H239.76z' />
    <path fill='#4d7489' d='M64.93 150.66h230.18v14H64.93zM64.93 179.36h204.68v14H64.93zM160.23 379.36h254.2v14h-254.2z' />
  </BrowserSvg>
)

const IntroIllustration = () => (
  <IntroIconFrame>
    <Aspect x={20} y={13}>
      <CodeSnippet />
      <EditorIcon />
      <BrowserIcon />
    </Aspect>
  </IntroIconFrame>
)

const IntroContent = styled.div`
  padding: 4rem;
`

const Intro = () => (
  <Wrapper>
    <IntroWrapper>
      <IntroIllustration />
      <IntroContent>
        <HeadingOne>A flexible dev server for Elm. Live reload included.</HeadingOne>
        <Body>A thin wrapper around <Code>elm make</Code>, <Code>elm-live</Code> is a dev server that gives you a few extra convenience features during development. Features include pushstate for SPA development, proxies, and more. Usage and API documentation is below. Check out how to <UnderlineAnchor href='#usage'>get started</UnderlineAnchor> or jump straight to the <UnderlineAnchor href='#docs'>API Documentation</UnderlineAnchor>.</Body>
      </IntroContent>
    </IntroWrapper>
  </Wrapper>
)

export default Intro
