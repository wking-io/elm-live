import React from 'react'
import styled, { css, createGlobalStyle } from 'styled-components'

export const colors = {
  white: '#FFFFFF',
  secondaryDarkest: '#0D1F2D',
  secondaryDarker: '#1A3547',
  secondaryDark: '#375363',
  secondary: '#4D7489',
  secondaryLight: '#99B1BC',
  secondaryLighter: '#D3DEE2',
  secondaryLightest: '#F3F4F5',
  primaryDark: '#EF6300',
  primary: '#F77F00',
  primaryLight: '#FFA01C'
}

const sizes = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200
}

export const generateKeyframes = total => frames =>
  Array
    .from({ length: total })
    .reduce((acc, _, i) => frames[i + 1] ? `${acc} ${(100 / total) * i}% { ${frames[i + 1]} }` : acc, '')

// iterate through the sizes and create a media template
export const media = Object.keys(sizes).reduce((accumulator, label) => {
  accumulator[label] = (...args) => css`
    @media (min-width: ${sizes[label] / 16}em) {
      ${css(...args)};
    }
  `
  return accumulator
}, {})

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
  width: 85%;
  max-width: 962px;
  margin: 0 auto;
`

export const Aspect = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: ${props => `${(props.y / props.x) * 100}%`};
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
  ${props => props.light ? Sans(colors.white) : Sans(colors.secondaryDarkest)}
  font-size: 8rem;
  font-weight: bold;
  line-height: 9rem;
  margin: 2rem 0 3rem;
`

export const HeadingTwo = styled.h2`
  ${props => props.light ? Sans(colors.white) : Sans(colors.secondaryDarkest)}
  font-size: 6rem;
  font-weight: bold;
  line-height: 7rem;
  margin: 2rem 0 3rem;
`

export const HeadingThree = styled.h3`
  ${props => props.light ? Sans(colors.white) : Sans(colors.secondaryDarkest)}
  font-size: 4.5rem;
  font-weight: bold;
  line-height: 6rem;
  margin: 0 0 3rem;
`

export const HeadingFour = styled.h4`
  ${props => props.light ? Sans(colors.white) : Sans(colors.secondaryDarkest)}
  font-size: 3.5rem;
  font-weight: bold;
  line-height: 4rem;
  margin: 0 0 3rem;
  text-transform: uppercase;
`

export const HeadingFive = styled.h5`
  ${props => props.light ? Sans(colors.white) : Sans(colors.secondaryDarkest)}
  font-size: 3.5rem;
  font-weight: bold;
  line-height: 4rem;
  margin: 0 0 3rem;
  text-transform: uppercase;
`

export const Jumbo = styled.p`
  ${props => props.light ? Sans(colors.white) : Sans(colors.secondaryDarkest)}
  font-size: 7rem;
  font-weight: bold;
  line-height: 1;

  ${media.md`
    font-size: 10rem;
  `}

  ${media.lg`
    font-size: 12rem;
  `}
`

export const HeadingBox = styled.div`
  background-color: ${props => props.dark ? colors.secondaryDarkest : colors.white};
  border: 1px solid ${colors.secondaryDarkest};
  padding: 2rem;

  & > * {
    margin: 0;
    color: ${props => props.dark ? colors.white : colors.secondaryDarkest};
  }
`

export const Body = styled.p`
  ${props => props.light ? Sans(colors.white) : Sans(colors.secondaryDarkest)}
  font-size: 4rem;
  line-height: 6rem;
  margin: 0 0 6rem;
`

export const BodySmall = styled.p`
  ${props => props.light ? Sans(colors.white) : Sans(colors.secondaryDarkest)}
  font-size: 3.5rem;
  line-height: 4.5rem;
  margin: 0 0 3rem;
`

export const Link = styled.a`
  background-image: linear-gradient(to right, ${colors.primaryLight} 0%, ${colors.primaryDark} 100%);
  background-repeat: no-repeat;
  background-size: 100% 0.2em;
  background-position: 0 88%;
  transition: background-image 0.25s ease-in;
  &:hover {
    background-image: linear-gradient(to right, ${colors.primaryDark} 0%, ${colors.primaryDark} 100%);
  }
`

export const Code = styled.code`
  ${props => props.light ? Mono(colors.white) : Mono(colors.secondaryDarkest)}
  background-color: ${colors.secondaryLightest};
`

export const CodeBlock = styled.pre`
  ${props => props.light ? Mono(colors.white) : Mono(colors.secondaryDarkest)}
  background-color: ${props => props.noBg ? colors.white : colors.secondaryLightest};
  padding: 7rem;
  overflow: auto;
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

// ======================
// LINKS
// ======================

export const UnderlineAnchor = styled.a`
  background-image: linear-gradient(to right, ${colors.primary} 0%, ${colors.primaryDark} 100%);
  background-repeat: no-repeat;
  background-size: 100% 0.5rem;
  background-position: 0 100%;
  color: ${colors.secondaryDarkest};
  font-style: italic;
  text-decoration: none;

  &:hover {
    background-image: linear-gradient(to right, ${colors.primaryDark} 0%, ${colors.primaryDark} 100%);
    text-decoration: none;
  }
`

const HeadingLinkWrapper = styled.div`
  display: flex;
  align-items: center;

  & a {
    display: none;
  }

  &:hover a {
    opacity: 1;
  }

  ${media.sm`
    margin-left: -7rem;

    & a {
      display: block;
    }
  `}
`

const HeadingLinkIcon = styled.a`
  margin: 0 2rem 0 0;
  width: 5rem;
  opacity: 0;
  transform: rotate(-45deg);
`

export const HeadingLink = ({ children, linkId, location }) => (
  <HeadingLinkWrapper>
    <HeadingLinkIcon href={`${location}#${linkId}`}>
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 12'>
        <path fill={colors.secondaryLight} d='M18,0H13.2V2.4H18a3.6,3.6,0,1,1,0,7.2H13.2V12H18A6,6,0,0,0,18,0ZM10.8,9.6H6A3.6,3.6,0,0,1,6,2.4h4.8V0H6A6,6,0,0,0,6,12h4.8ZM7.2,4.8h9.6V7.2H7.2Z' />
      </svg>
    </HeadingLinkIcon>
    <div>{children}</div>
  </HeadingLinkWrapper>
)
