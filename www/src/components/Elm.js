import React from 'react'
import PropTypes from 'prop-types'

class Elm extends React.Component {
  node = React.createRef()

  componentDidMount () {
    const app = this.props.src.init({
      node: this.node,
      flags: this.props.flags
    })

    if (this.props.ports) { this.props.ports(app.ports) }
  }

  shouldComponentUpdate () {
    return false
  }

  render () {
    return (
      <div ref={this.node} />
    )
  }
}

Elm.propTypes = {
  flags: PropTypes.object,
  ports: PropTypes.func,
  src: PropTypes.object.isRequired
}

export default Elm
