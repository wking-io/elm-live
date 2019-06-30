import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'

export default class Header extends React.Component {
  state = { menuOpen: false }
  toggleMenu = () => {
    this.setState(({ menuOpen }) => ({ menuOpen: !menuOpen }))
  }
  render () {
    const { stats } = this.props
    return (
      <header>
        <div>
          <LogoIcon />
          <h1 class="font-sans">elm-live</h1>
        </div>
        <div>
          <h2></h2>
          <p></p>
        </div>
        <aside>
          <h3></h3>
          <Link />
        </aside>
        {stats.fold(renderMissingStats, renderStats)}
      </header>
    )
  }
}

Header.propTypes = {
  repoUrl: PropTypes.object.isRequired,
  stats: PropTypes.object.isRequired
}
