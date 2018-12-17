import React from 'react'
import PropTypes from 'prop-types'
import Either from 'data.either'
import { safeProp } from 'safe-prop'
import debounce from 'lodash.debounce'

function always (x) {
  return () => x
}

function isGreater (comparable) {
  return function (data) {
    return comparable > data
  }
}

function findActive (gate, data) {
  return Object
    .keys(data)
    .reduce(
      (acc, key) =>
        acc
          .chain(always(safeProp(key, data)))
          .map(isGreater(gate))
          .chain(isGreater => isGreater ? Either.Right(key) : acc)
          .leftMap(always('No active property found.')), Either.Right('port-default')
    )
}

class Track extends React.Component {
  state = {
    waypoints: {}
  }

  getPosition = (id, top) => this.setState((state) => (state.waypoints[id] = top))

  onScroll = debounce(() => findActive(window.scrollY + this.props.gate, this.state.waypoints)
    .map(this.props.updateActive), 1)

  componentDidMount () {
    window.addEventListener('scroll', this.onScroll)
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.onScroll)
  }

  render () {
    return this.props.render(this.getPosition)
  }
}

Track.propTypes = {
  gate: PropTypes.number.isRequired,
  render: PropTypes.func.isRequired,
  updateActive: PropTypes.func.isRequired
}

export default Track
