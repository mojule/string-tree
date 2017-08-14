'use strict'

const { trimStart, escape } = require( './utils' )

const api = ({ api, state, core }) => {
  api.toString = () => {
    let serialized = ''

    api.dfsNodes.forEach( current => {
      serialized += '  '.repeat( current.depth() )
      serialized += trimStart( escape( current.value ) )
      serialized += '\n'
    })

    return serialized
  }

  core.registerProperty({
    target: api,
    name: 'treeName',
    get: () => 'string-tree'
  })
}

module.exports = api
