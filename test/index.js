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

      assert( is.function( tree.get ) )
    })

    it( 'sets value', () => {
      const root = Tree( 'Root' )

      root.setValue( 'New Root' )

      assert.equal( root.getValue(), 'New Root' )
    })

    it( 'removes', () => {
      const root = Tree( 'Root' )
      const child1 = Tree( 'Child 1' )
      const child2 = Tree( 'Child 2' )

      root.append( child1 )
      root.append( child2 )

      root.remove( child1 )

      assert.equal( root.getChildren().length, 1 )
      assert.equal( root.firstChild(), child2 )
    })

    it( 'adds before', () => {
      const root = Tree( 'Root' )
      const child1 = Tree( 'Child 1' )
      const child2 = Tree( 'Child 2' )

      root.add( child2 )
      root.add( child1, child2 )

      assert.equal( root.getChildren().length, 2 )
      assert.equal( root.firstChild(), child1 )
    })
  })

  describe( 'Plugins', () => {
    describe( 'Serializer', () => {
      it( 'serializes', () => {
        const tree = Tree( biology )
        const serialized = tree.serialize()

        assert.equal( serialized, expectSerialized )
      })

      it( 'deserializes', () => {
        const tree = Tree( biology )
        const serialized = tree.serialize()
        const deserialized = Tree.deserialize( serialized )

        assert.equal( serialized, deserialized.serialize() )
      })

      it( 'deserializes with empty', () => {
        const deserialized = Tree.deserialize( withEmpty, { retainEmpty: true } )
        const serialized = deserialized.serialize()

        assert.equal( expectEmpty, serialized )
      })

      it( 'escapes', () => {
        const root = Tree( 'Root\n' )
        const child1 = Tree( 'Child\r1' )
        const child2 = Tree( 'Child\r\n2' )

        root.add( child1 )
        root.add( child2 )

        const serialized = root.serialize()
        const deserialized = Tree.deserialize( serialized )

        assert.equal( serialized, deserialized.serialize() )
      })

      it( 'tabs', () => {
        const serialized = 'Root\n\tChild\n\t\tGrandchild'
        const root = Tree.deserialize( serialized )
        const child = root.firstChild()
        const grandChild = child.firstChild()

        assert.equal( root.getValue(), 'Root' )
        assert.equal( child.getValue(), 'Child' )
        assert.equal( grandChild.getValue(), 'Grandchild' )
      })

      it( 'bad nesting', () => {
        const bad1 = '  Chordate\nAnimalia'
        const bad2 = 'Chordate\nAnimalia'

        assert.throws( () => Tree.deserialize( bad1 ) )
        assert.throws( () => Tree.deserialize( bad2 ) )
      })
    })
  })

  describe( 'Factory', () => {
    const { Factory } = Tree

    describe( 'Options', () => {
      it( 'exposeState', () => {
        const Tree = Factory( { exposeState: true } )
        const root = Tree( 'Root' )

        assert( is.object( root.state ) )
      })
    })

    describe( 'Plugins', () => {
      it( 'plugin array', () => {
        const plugin = node => {
          return {
            lowerCaseValue: () => node.getValue().toLowerCase()
          }
        }

        const Tree = Factory( [ plugin ] )

        const root = Tree( 'Root' )

        assert.equal( root.lowerCaseValue(), 'root' )
      })
    })
  })
})
