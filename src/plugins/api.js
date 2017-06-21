'use strict'

const { trimStart, escape } = require( './utils' )

const api = ({ api, state }) => {
  api.toString = () => {
    let serialized = ''

    api.dfsNodes.forEach( current => {
      serialized += '  '.repeat( current.depth() )
      serialized += trimStart( escape( current.value ) )
      serialized += '\n'
    })

    return serialized
  }
}

module.exports = api
