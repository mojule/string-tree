'use strict'

const { trimStart, escape } = require( './utils' )

const api = ({ api, state }) => {
  api.toString = () => {
    let serialized = ''

    api.dfsNodes.forEach( current => {
      const parent = current.parentNode
      const depth = current.depth()

      serialized += '  '.repeat( depth )
      serialized += trimStart( escape( current.value ) )
      serialized += '\n'
    })

    return serialized
  }
}

module.exports = api
