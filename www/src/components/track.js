import React from 'react'

function initWaypoint (data) {
  return data['port-default'].options
}

class Track extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      waypoints: {},
      active: initWaypoint(props.data)
    }
    this.getPosition = this.getPosition.bind(this)
    this.updateScroll = this.updateScroll.bind(this)
  }

  getPosition (id, top) {
    this.setState({ waypoints: { [id]: top } })
  }

  updateScroll () {
    console.log('here')
  }

  componentDidMount () {
    window.addEventListener('scroll', this.updateScroll)
  }

  render () {
    return this.props.render(this.getPosition)
  }
}

export default Track
