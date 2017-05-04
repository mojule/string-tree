'use strict';

var normalizeEol = function normalizeEol(str) {
  return str.replace(/\r\n|\r/g, '\n');
};
var normalizeIndent = function normalizeIndent(str) {
  return str.replace(/\t/g, '  ');
};
var escape = function escape(str) {
  return normalizeEol(str).replace(/\n/g, '\\n');
};
var unescape = function unescape(str) {
  return str.replace(/\\n/g, '\n');
};
var trimStart = function trimStart(str) {
  return str.replace(/^\s+/g, '');
};

var serializer = function serializer(node) {
  return {
    serialize: function serialize() {
      var serialized = '';

      node.walk(function (current, parent, depth) {
        serialized += '  '.repeat(depth);
        serialized += trimStart(escape(current.getValue()));
        serialized += '\n';
      });

      return serialized;
    },
    $deserialize: function $deserialize(str) {
      var lines = normalizeEol(str).split(/\n/).map(unescape).map(normalizeIndent).filter(function (s) {
        return s.trim() !== '';
      });

      var parsedNodes = lines.reduce(function (nodes, line, i) {
        var value = trimStart(line);
        var indent = line.length - value.length;
        var prev = nodes[i - 1];
        var current = node(node.createState(value));

        current.meta({ indent: indent, prev: prev });

        nodes.push(current);

        return nodes;
      }, []);

      var root = parsedNodes.shift();

      parsedNodes.forEach(function (current) {
        var indent = current.getMeta('indent');
        var parent = current.getMeta('prev');

        while (parent && parent.getMeta('indent') >= indent) {
          parent = parent.getMeta('prev');
        }if (!parent) throw new Error('Bad nesting');

        parent.append(current);
      });

      return root;
    }
  };
};

module.exports = serializer;