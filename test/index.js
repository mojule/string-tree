'use strict'

const assert = require( 'assert' )
const is = require( '@mojule/is' )
const Tree = require( '../src' )
const biology = require( './fixtures/biology.json' )

const expectSerialized =
`Animalia
  Chordate
    Mammal
      Primate
        Hominidae
          Homo
            Sapiens
              Human
        Pongidae
          Pan
            Troglodytes
              Chimpanzee
      Carnivora
        Felidae
          Felis
            Domestica
              House Cat
            Leo
              Lion
  Arthropoda
    Insect
      Diptera
        Muscidae
          Musca
            Domestica
              Housefly
`

const withEmpty = `

Root

  Child 1

  Child 2
    GrandChild 1

    GrandChild 2


`

const expectEmpty = 'Root\n  \n  Child 1\n  \n  Child 2\n    GrandChild 1\n    \n    GrandChild 2\n    \n    \n    \n'

describe( 'string-tree', () => {
  describe( 'Base', () => {
    it( 'Raw nodes', () => {
      const tree = Tree( biology )

      assert( is.string( tree.value ) )
    })

    it( 'sets value', () => {
      const root = Tree( 'Root' )

      root.value = 'New Root'

      assert.equal( root.value, 'New Root' )
    })

    it( 'removes', () => {
      const root = Tree( 'Root' )
      const child1 = Tree( 'Child 1' )
      const child2 = Tree( 'Child 2' )

      root.appendChild( child1 )
      root.appendChild( child2 )

      root.removeChild( child1 )

      assert.equal( root.childNodes.length, 1 )
      assert.equal( root.firstChild, child2 )
    })

    it( 'adds before', () => {
      const root = Tree( 'Root' )
      const child1 = Tree( 'Child 1' )
      const child2 = Tree( 'Child 2' )

      root.appendChild( child2 )
      root.insertBefore( child1, child2 )

      assert.equal( root.childNodes.length, 2 )
      assert.equal( root.firstChild, child1 )
    })
  })

  describe( 'Plugins', () => {
    describe( 'Serializer', () => {
      it( 'serializes', () => {
        const tree = Tree( biology )
        const serialized = tree.toString()

        assert.equal( serialized, expectSerialized )
      })

      it( 'deserializes', () => {
        const tree = Tree( biology )
        const serialized = tree.toString()
        const deserialized = Tree.parse( serialized )
        assert.equal( serialized, deserialized.toString() )
      })

      it( 'deserializes with empty', () => {
        const deserialized = Tree.parse( withEmpty, { retainEmpty: true } )
        const serialized = deserialized.toString()

        assert.equal( expectEmpty, serialized )
      })

      it( 'escapes', () => {
        const root = Tree( 'Root\n' )
        const child1 = Tree( 'Child\r1' )
        const child2 = Tree( 'Child\r\n2' )

        root.appendChild( child1 )
        root.appendChild( child2 )

        const serialized = root.toString()
        const deserialized = Tree.parse( serialized )

        assert.equal( serialized, deserialized.toString() )
      })

      it( 'tabs', () => {
        const serialized = 'Root\n\tChild\n\t\tGrandchild'
        const root = Tree.parse( serialized )
        const child = root.firstChild
        const grandChild = child.firstChild

        assert.equal( root.value, 'Root' )
        assert.equal( child.value, 'Child' )
        assert.equal( grandChild.value, 'Grandchild' )
      })

      it( 'bad nesting', () => {
        const bad = '  Chordate\nAnimalia'
        assert.throws( () => Tree.parse( bad ) )
      } )

      it( 'multiple roots', () => {
        const mult = 'Fungi\n\tOomycota\nAnimalia\n\tChordate'
        assert.throws(() => Tree.parse( mult ) )

        const roots = Tree.parse( mult, { deserializeMultiple : true } )
        assert.equal( roots.length, 2 )
      })

      it( 'empty file', () => {
        assert.throws( () => Tree.parse( '', { retainEmpty: true } ) )
      })
    })
  })
})
