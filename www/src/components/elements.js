import React from 'react'
import styled, { css, createGlobalStyle } from 'styled-components'

export const colors = {
  white: '#FFFFFF',
  black: '#0D1F2D',
  grey: '#CFD2D5',
  lightGrey: '#F3F4F5',
  primary: '#FFA01C',
  primaryDark: '#EF6300'
}

// ======================
// GLOBAL
// ======================

export const GlobalStyle = createGlobalStyle`
  html {
    font-size: 4px;
    margin: 0;
  }

  body {
    font-size: 4rem;
    margin: 0;
  }
`

// ======================
// LAYOUT
// ======================

export const Wrapper = styled.div`
  width: 90%;
  max-width: 962px;
  margin: 0 auto;
`

// ======================
// TYPOGRAPHY
// ======================

export const Mono = textColor => css`
  color: ${textColor};
  font-family: "Fira Mono", Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
`

export const Sans = textColor => css`
  color: ${textColor};
  font-family: "Fira Sans", system-ui, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
`

export const HeadingOne = styled.h1`
  ${props => props.light ? Sans(colors.white) : Sans(colors.black)}
  font-size: 8rem;
  font-weight: bold;
  line-height: 9rem;
`

export const HeadingTwo = styled.h2`
  ${props => props.light ? Sans(colors.white) : Sans(colors.black)}
  font-size: 6rem;
  font-weight: bold;
  line-height: 7rem;
`

export const HeadingThree = styled.h3`
  ${props => props.light ? Sans(colors.white) : Sans(colors.black)}
  font-size: 4.5rem;
  font-weight: bold;
  line-height: 6rem;
`

export const HeadingFour = styled.h4`
  ${props => props.light ? Sans(colors.white) : Sans(colors.black)}
  font-size: 3.5rem;
  font-weight: bold;
  line-height: 4rem;
  text-transform: uppercase;
`

export const HeadingFive = styled.h5`
  ${props => props.light ? Sans(colors.white) : Sans(colors.black)}
  font-size: 3.5rem;
  font-weight: bold;
  line-height: 4rem;
  text-transform: uppercase;
`

export const Jumbo = styled.p`
  ${props => props.light ? Sans(colors.white) : Sans(colors.black)}
  font-size: 7rem;
  font-weight: bold;
  line-height: 1;

  @media ()
`

export const HeadingBox = styled.div`
  background-color: ${props => props.dark ? colors.black : colors.white};
  border: 1px solid ${colors.black};
  padding: 2rem;
`

export const Body = styled.p`
  ${props => props.light ? Sans(colors.white) : Sans(colors.black)}
  font-size: 4rem;
  line-height: 6rem;
`

export const BodySmall = styled.p`
  ${props => props.light ? Sans(colors.white) : Sans(colors.black)}
  font-size: 3.5rem;
  line-height: 4.5rem;
`

export const Link = styled.a`
  background-image: linear-gradient(to right, ${colors.primary} 0%, ${colors.primaryDark} 100%);
  background-repeat: no-repeat;
  background-size: 100% 0.2em;
  background-position: 0 88%;
  transition: background-image 0.25s ease-in;
  &:hover {
    background-image: linear-gradient(to right, ${colors.primaryDark} 0%, ${colors.primaryDark} 100%);
  }
`

export const Code = styled.code`
  ${props => props.light ? Mono(colors.white) : Sans(colors.black)}
  background-color: ${colors.lightGrey};
`

export const CodeBlock = styled.pre`
  ${props => props.light ? Mono(colors.white) : Sans(colors.black)}
  background-color: ${props => props.noBg ? colors.white : colors.lightGrey};
  padding: 7rem;
`

// ======================
// BUTTONS
// ======================

export const NoButton = styled.button`
  background: none;
  border: none;
  margin: 0;
  padding: 0;

  &:hover {
    background: none;
    border: none;
  }
`