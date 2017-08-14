'use strict'

const normalizeEol = str => str.replace( /\r\n|\r/g, '\n' )
const normalizeIndent = str => str.replace( /\t/g, '  ' )
const escape = str => normalizeEol( str ).replace( /\n/g, '\\n' )
const unescape = str => str.replace( /\\n/g, '\n' )
const trimStart = str => str.replace( /^\s+/g, '' )

module.exports = {
  normalizeEol, normalizeIndent, escape, unescape, trimStart
}
