# string-tree

Work with trees of strings

## Install

`npm install @mojule/string-tree`

## Example

```javascript
const Tree = require( '@mojule/string-tree' )

const root = Tree( 'Root' )
const child = Tree( 'Child' )

root.add( 'child' )
```

## API

Has all the API functions from
[mojule tree-factory](https://github.com/mojule/tree-factory), and the following
plugins:

### serialize

Creates a string representation of the tree. EOL characters within string nodes
are normalized to \n and escaped.

[The example data used, as raw nodes](/test/fixtures/biology.json)

```javascript
const data = require( './test/fixtures/biology.json' )

const tree = Tree( data )

console.log( tree.serialize() )
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

### deserialize

Takes a tree as a string in the format outlined above and returns a root node
with child nodes nested as appropriate

- will throw if there is more than one root or nesting doesn't make sense
- tabs are converted to two spaces
- EOL within strings is expected to be escaped, eg `\n` rather than a literal
  EOL
- empty lines are ignored unless the option `retainEmpty` is passed, see below

```javascript
const data = `
Root
  Child 1
    Grandchild 1
  Child 2
    Grandchild 2
`

const root = Tree.deserialize( data )

// 'Root'
console.log( root.getValue() )

const child = root.firstChild()

// 'Child'
console.log( child.getValue() )

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

Calling `getValue()` on an empty node will return an empty string.

```javascript
const data = `
Root

  Child 1

    Grandchild 1
  Child 2
    Grandchild 2

`

const root = Tree.deserialize( data, { retainEmpty: true } )

console.log( root.serialize().replace( / /g, '.' ) )
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