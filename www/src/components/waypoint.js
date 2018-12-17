import React from 'react'

function distanceFromTop (el, scroll) {
  const { top } = el.getBoundingClientRect()
  return scroll + top
}

class Waypoint extends React.Component {
  _ref = React.createRef()

  componentDidMount () {
    const { getPosition, id } = this.props
    getPosition(id, distanceFromTop(this._ref.current, window.scrollY))
  }

  render () {
    const makeTiny = { fontSize: 0 }
    return <span ref={this._ref} style={makeTiny} />
  }
}

export default Waypoint
