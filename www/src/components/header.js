import React from 'react'
import styled from 'styled-components'

import { colors, Sans, Wrapper, BodySmall, Jumbo } from './elements'

const NavWrapper = styled.div`
  display: flex;
`

const LogoWrapper = styled.div`
  display: flex;
`

export function LogoIcon () {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 313.81 460'>
      <path fill='#f77f00' d='M290.55,192.55a5.29,5.29,0,0,1-.46,4L150.24,457.13a5.27,5.27,0,0,1-2.09,2.17l-.55-1.19V292a5.43,5.43,0,0,0-6.83-5.26L88.85,300.68l-29.8,8a4.32,4.32,0,0,1-1.68.16l.05-.59L198.74,43.63l1.14-.22a4.42,4.42,0,0,1,.11,1V209.63a5.43,5.43,0,0,0,6.83,5.23l82.27-22Z' />
      <path fill='#ffa01c' d='M290.55,192.55l-1.46.27-82.27,22a5.43,5.43,0,0,1-6.83-5.23V167.06l31.73-8.49a5.36,5.36,0,0,1,4.12.54L288,189.24A5.36,5.36,0,0,1,290.55,192.55Z' />
      <path class='cls-3' d='M199.88,43.41l-1.14.22L57.42,308.25l-.05.59a5.26,5.26,0,0,1-2.44-.7L2.7,278a5.42,5.42,0,0,1-2.06-7.24l138-258.38a5.42,5.42,0,0,1,7.51-2.14l51.14,29.52A5.42,5.42,0,0,1,199.88,43.41Z' />
      <path fill='#ef6300' d='M147.6,458.11l.55,1.19a5.45,5.45,0,0,1-5.4,0L91.61,429.75a5.44,5.44,0,0,1-2.71-4.69V300.84l-.05-.16,51.92-13.91A5.43,5.43,0,0,1,147.6,292Z' />
      <path fill='#0d1f2d' d='M309.05,180.3l-52.21-30.14a9.39,9.39,0,0,0-7.2-.95L223,156.34V39a9.53,9.53,0,0,0-4.74-8.22L167.15,1.28A9.49,9.49,0,0,0,154,5L16,263.4a9.46,9.46,0,0,0,3.63,12.69l52.22,30.15a9.37,9.37,0,0,0,7.19.95l24.74-6.63V419.62a9.52,9.52,0,0,0,4.75,8.22l51.15,29.53a9.48,9.48,0,0,0,13.1-3.73L312.67,193A9.44,9.44,0,0,0,309.05,180.3Zm-57.3-23.23a1.37,1.37,0,0,1,1,.13L301,185.06l-76.29,20.45a1.34,1.34,0,0,1-1.18-.24,1.31,1.31,0,0,1-.53-1.07V164.76Zm-228,112a1.35,1.35,0,0,1-.52-1.82l138-258.37a1.35,1.35,0,0,1,1.87-.54l50.44,29.13L74.25,298.21ZM112.62,420.8a1.36,1.36,0,0,1-.68-1.18V298.38l48.87-13.09a1.31,1.31,0,0,1,1.18.23,1.35,1.35,0,0,1,.53,1.08v163Zm58,19.67V286.6a9.49,9.49,0,0,0-12-9.17l-51.92,13.91-22.92,6.14,131-245.34V204.2a9.5,9.5,0,0,0,9.46,9.49,9.55,9.55,0,0,0,2.48-.33l76.7-20.55Z' />
    </svg>
  )
}

export const LogoText = styled.p`
  ${Sans(colors.black)}
  font-size: 3.5rem;
  margin: 0;
  padding: 0;
`

const StatList = styled.ul`
  display: flex;
  list-style-type: none;
`

const Stat = styled.li`
  padding: 4rem;
  border-left: 1px solid ${colors.grey};
`

const Header = ({ repoUrl, stats }) => (
  <Wrapper>
    <NavWrapper>
      <LogoWrapper>
        <LogoIcon />
        <LogoText>elm-live</LogoText>
      </LogoWrapper>
    </NavWrapper>
    <StatList>
      {stats.map(stat => (
        <Stat>
          <BodySmall>{stat.name}</BodySmall>
          <Jumbo>{stat.stat}</Jumbo>
        </Stat>
      ))}
    </StatList>
  </Wrapper>
)

export default Header
