'use strict'

const normalizeEol = str => str.replace( /\r\n|\r/g, '\n' )
const normalizeIndent = str => str.replace( /\t/g, '  ' )
const escape = str => normalizeEol( str ).replace( /\n/g, '\\n' )
const unescape = str => str.replace( /\\n/g, '\n' )
const trimStart = str => str.replace( /^\s+/g, '' )

const serializer = node => {
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
    $deserialize: str => {
      const lines = (
        normalizeEol( str )
        .split( /\n/ )
        .map( unescape )
        .map( normalizeIndent )
        .filter( s => s.trim() !== '' )
      )

      const parsedNodes = lines.reduce( ( nodes, line, i ) => {
        const value = trimStart( line )
        const indent = line.length - value.length
        const prev = nodes[ i - 1 ]
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

module.exports = serializer
