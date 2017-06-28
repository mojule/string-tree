'use strict'

const {
  normalizeEol, normalizeIndent, unescape, trimStart
} = require( './utils' )

const defaultOptions = {
  retainEmpty: false,
  deserializeMultiple: false
}

const statics = ({ statics, Api }) => {
  statics.parse = ( str, options ) => {
    options = Object.assign( {}, defaultOptions, options )

    const { retainEmpty, deserializeMultiple } = options

    let lines = (
      normalizeEol( str )
        .split( /\n/ )
        .map( unescape )
        .map( normalizeIndent )
    )

    if( retainEmpty ) {
      fixEmpty( lines )
    } else {
      lines = lines.filter( s => s.trim() !== '' )
    }

    const parsedNodes = lines.reduce(( nodes, line ) => {
      const value = trimStart( line )
      const indent = line.length - value.length
      const prev = nodes[ nodes.length - 1 ]
      const current = Api( value )

      current.meta = { indent, prev }

      nodes.push( current )

      return nodes
    }, [] )

    if( parsedNodes.length === 0 )
      throw new Error( 'Cannot deserialize empty file' )

    if( parsedNodes[ 0 ].meta.indent !== 0  )
      throw new Error( 'Bad nesting' )

    const rootNodeIndices = parsedNodes.reduce(( indices, node, index ) => {
      if( node.meta.indent === 0 ) {
        indices.push( index )
      }

      return indices
    }, [] )

    const parsedNodeTrees = []

    for( let i = 0; i < rootNodeIndices.length; i++ ) {
      const start = rootNodeIndices[ i ]
      let end

      if( ( i + 1 ) < rootNodeIndices.length ) {
        end = rootNodeIndices[ i + 1 ] - 1
      }

      const newTree = parsedNodes.slice( start, end )
      parsedNodeTrees.push( newTree )
    }

    if( deserializeMultiple ) {
      const result = parsedNodeTrees.map( current => parsedNodesToTree( current ) )

      return result
    } else {
      if( parsedNodeTrees.length === 1 ) {
        const result = parsedNodesToTree( parsedNodeTrees[ 0 ] )
        return result
      }

      throw new Error( 'Multiple roots and deserializeMultiple=false' )
    }
  }
}


const parsedNodesToTree = parsedNodes => {
  const root = parsedNodes.shift()

  parsedNodes.forEach( current => {
    const { indent } = current.meta
    let parent = current.meta.prev

    while( parent && parent.meta.indent >= indent ) {
      parent = parent.meta.prev
    }

    parent.appendChild( current )
  })

  return root
}

const fixEmpty = lines => {
  while( lines.length > 0 && lines[ 0 ].trim() === '' )
    lines.shift()

  lines.forEach(( line, i ) => {
    if( line.trim() === '' ) {
      let indent = 0

      for( let j = i; j < lines.length; j++ ) {
        const next = lines[ j ]
        const value = trimStart( next )

        indent = next.length - value.length

        if( indent > 0 ) {
          lines[ i ] = ' '.repeat( indent )
          break
        }
      }

      if( indent === 0 ) {
        for( let j = i; j > 0; j-- ) {
          const prev = lines[ j ]
          const value = trimStart( prev )

          indent = prev.length - value.length

          if( indent > 0 ) {
            lines[ i ] = ' '.repeat( indent )
            break;
          }
        }
      }
    }
  })
}

module.exports = statics
