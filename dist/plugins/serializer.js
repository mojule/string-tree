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
  var defaultOptions = {
    retainEmpty: false
  };

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
    $deserialize: function $deserialize(str, options) {
      options = Object.assign({}, defaultOptions, options);

      var _options = options,
          retainEmpty = _options.retainEmpty;


      var lines = normalizeEol(str).split(/\n/).map(unescape).map(normalizeIndent);

      if (retainEmpty) {
        fixEmpty(lines);
      } else {
        lines = lines.filter(function (s) {
          return s.trim() !== '';
        });
      }

      var parsedNodes = lines.reduce(function (nodes, line) {
        var value = trimStart(line);
        var indent = line.length - value.length;
        var prev = nodes[nodes.length - 1];
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

var fixEmpty = function fixEmpty(lines) {
  while (lines[0].trim() === '') {
    lines.shift();
  }lines.forEach(function (line, i) {
    if (line.trim() === '') {
      var indent = 0;

      for (var j = i; j < lines.length; j++) {
        var next = lines[j];
        var value = trimStart(next);

        indent = next.length - value.length;

        if (indent > 0) {
          lines[i] = ' '.repeat(indent);
          break;
        }
      }

      if (indent === 0) {
        for (var _j = i; _j > 0; _j--) {
          var prev = lines[_j];
          var _value = trimStart(prev);

          indent = prev.length - _value.length;

          if (indent > 0) {
            lines[i] = ' '.repeat(indent);
            break;
          }
        }
      }
    }
  });
};

module.exports = serializer;