'use strict'

const is = require( '@mojule/is' )

const core = ({ core, Api }) => {
  core.isState = state => is.object( state ) && is.string( state.value )
}

module.exports = core
