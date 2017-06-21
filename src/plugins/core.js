'use strict'

const is = require( '@mojule/is' )

const core = ({ core, Api }) => {
  const { createState } = core

  core.createState = value => {
    if( is.array( value ) ){
      const node = Api.deserialize( value )

      return core.getState( node )
    }

    return createState( value )
  }

  core.isState = state => is.object( state ) && is.string( state.value )
}

module.exports = core
