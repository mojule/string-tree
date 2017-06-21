'use strict'

const is = require( '@mojule/is' )
const Tree = require( '@mojule/tree' )
const defaultPlugins = require( './plugins' )

const StringTree = Tree.Factory( defaultPlugins )

module.exports = StringTree
