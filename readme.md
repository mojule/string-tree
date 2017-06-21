# string-tree

Work with trees of strings

## Install

`npm install @mojule/string-tree`

## Example

```javascript
const Tree = require( '@mojule/string-tree' )

const root = Tree( 'Root' )
const child = Tree( 'Child' )

root.appendChild( 'child' )
```

## API

Has all the API functions from
[tree](https://github.com/mojule/tree), and the following
plugins:

### toString

Creates a string representation of the tree. EOL characters within string nodes
are normalized to \n and escaped.

[The example data used, as raw nodes](/test/fixtures/biology.json)

```javascript
const data = require( './test/fixtures/biology.json' )

const tree = Tree.deserialize( data )

console.log( tree.toString() )
```

```
Animalia
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
```

### parse

The default behaviour is to take a tree as a string in the format outlined above and
returns a root node with child nodes nested as appropriate.

- root must have no indent.
- will throw if there is more than one root or nesting doesn't make sense.
- tabs are converted to two spaces.
- EOL within strings is expected to be escaped, eg `\n` rather than a literal
  EOL.
- empty lines are ignored unless the option `retainEmpty` is passed, see below.

If the `deserializeMultiple : true` option is set there may be multiple roots in the passed string.
Returns an array of root nodes with child nodes nested as appropriate.

```javascript
const data = `
Root
  Child 1
    Grandchild 1
  Child 2
    Grandchild 2
`

const root = Tree.parse( data )

// 'Root'
console.log( root.value )

const child = root.firstChild

// 'Child'
console.log( child.value )

// etc.
```

#### options

You can pass an optional `options` parameter. By default it is:

```json
{
  "retainEmpty": false
}
```

Even with `retainEmpty` set to true, any leading empty lines are removed, as
they cannot have a parent to be added to.

Empty lines between non-empty lines are added at the same level as the next
non-empty line.

Empty lines at the end of the data are added at the same level as the previous
non-empty line.

The value property of an empty node will be an empty string.

```javascript
const data = `
Root

  Child 1

    Grandchild 1
  Child 2
    Grandchild 2

`

const root = Tree.parse( data, { retainEmpty: true } )

console.log( root.toString().replace( / /g, '.' ) )
```

```
Root
..
..Child.1
....
....Grandchild.1
..Child.2
....Grandchild.2
....
....
```