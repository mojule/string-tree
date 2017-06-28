'use strict'

const { trimStart, escape } = require( './utils' )

const api = ({ api, state, privates }) => {
  api.toString = () => {
    let serialized = ''

    api.dfsNodes.forEach( current => {
      serialized += '  '.repeat( current.depth() )
      serialized += trimStart( escape( current.value ) )
      serialized += '\n'
    })

    return serialized
  }

  privates.registerGet({
    target: api,
    name: 'treeName',
    get: () => 'string-tree'
  })
}

module.exports = api
