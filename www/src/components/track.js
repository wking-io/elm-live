import React from 'react'
import Either from 'data.either'
import { safeProp } from 'safe-prop'
import debounce from 'lodash.debounce'

const trace = label => val => {
  console.log(`${label}: ${val}`)
  return val
}

function always (x) {
  return () => x
}

function isGreater (comparable) {
  return function (data) {
    console.log(comparable, data)
    return comparable > data
  }
}

function findActive (gate, data) {
  console.log(data)
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
  constructor (props) {
    super(props)
    this.state = {
      waypoints: {},
      active: 'port-default'
    }
    this.getPosition = this.getPosition.bind(this)
    this.onScroll = debounce(this.onScroll.bind(this), 100)
  }

  getPosition (id, top) {
    this.setState((state) => (state.waypoints[id] = top))
  }

  onScroll () {
    findActive(window.scrollY + this.props.gate, this.state.waypoints)
      .map(active => this.setState({ active }))
  }

  componentDidMount () {
    window.addEventListener('scroll', this.onScroll)
  }

  render () {
    return this.props.render(this.getPosition)
  }
}

export default Track
