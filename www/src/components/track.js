import React from 'react'

function generateWaypoints (data) {
  return {}
}

function initWaypoint ([init, ...data]) {
  return init
}

class Track extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      waypoints: generateWaypoints(props.data),
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
