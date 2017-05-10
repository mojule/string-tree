'use strict'

const normalizeEol = str => str.replace( /\r\n|\r/g, '\n' )
const normalizeIndent = str => str.replace( /\t/g, '  ' )
const escape = str => normalizeEol( str ).replace( /\n/g, '\\n' )
const unescape = str => str.replace( /\\n/g, '\n' )
const trimStart = str => str.replace( /^\s+/g, '' )

const serializer = node => {
  const defaultOptions = {
    retainEmpty: false
  }

  return {
    serialize: () => {
      let serialized = ''

      node.walk( ( current, parent, depth ) => {
        serialized += '  '.repeat( depth )
        serialized += trimStart( escape( current.getValue() ) )
        serialized += '\n'
      })

      return serialized
    },
    $deserialize: ( str, options ) => {
      options = Object.assign( {}, defaultOptions, options )

      const { retainEmpty } = options

      let lines = (
        normalizeEol( str )
        .split( /\n/ )
        .map( unescape )
        .map( normalizeIndent )
      )

      if( retainEmpty ){
        fixEmpty( lines )
      } else {
        lines = lines.filter( s => s.trim() !== '' )
      }

      const parsedNodes = lines.reduce( ( nodes, line ) => {
        const value = trimStart( line )
        const indent = line.length - value.length
        const prev = nodes[ nodes.length - 1 ]
        const current = node( node.createState( value ) )

        current.meta( { indent, prev } )

        nodes.push( current )

        return nodes
      }, [] )

      const root = parsedNodes.shift()

      parsedNodes.forEach( current => {
        const indent = current.getMeta( 'indent' )
        let parent = current.getMeta( 'prev' )

        while( parent && parent.getMeta( 'indent' ) >= indent )
          parent = parent.getMeta( 'prev' )

        if( !parent )
          throw new Error( 'Bad nesting' )

        parent.append( current )
      })

      return root
    }
  }
}

const fixEmpty = lines => {
  while( lines[ 0 ].trim() === '' )
    lines.shift()

  lines.forEach( ( line, i ) => {
    if( line.trim() === '' ){
      let indent = 0

      for( let j = i; j < lines.length; j++ ){
        const next = lines[ j ]
        const value = trimStart( next )

        indent = next.length - value.length

        if( indent > 0 ){
          lines[ i ] = ' '.repeat( indent )
          break;
        }
      }

      if( indent === 0 ){
        for( let j = i; j > 0; j-- ){
          const prev = lines[ j ]
          const value = trimStart( prev )

          indent = prev.length - value.length

          if( indent > 0 ){
            lines[ i ] = ' '.repeat( indent )
            break;
          }
        }
      }
    }
  })
}

module.exports = serializer
