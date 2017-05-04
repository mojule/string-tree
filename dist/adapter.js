'use strict';

var is = require('@mojule/is');

var $createRawNode = function $createRawNode(value) {
  return [value];
};

var Adapter = function Adapter(node, state) {
  var $isNode = function $isNode(rawNode) {
    return is.array(rawNode) && node.isValue(rawNode[0]);
  };

  var $isValue = function $isValue(value) {
    return is.string(value);
  };

  var getChildren = function getChildren() {
    return state.node.slice(1);
  };

  var getValue = function getValue() {
    return state.node[0];
  };

  var setValue = function setValue(value) {
    return state.node[0] = value;
  };

  var remove = function remove(rawChild) {
    var index = state.node.indexOf(rawChild);

    state.node.splice(index, 1);

    return rawChild;
  };

  var add = function add(rawChild, rawReference) {
    if (is.undefined(rawReference)) {
      state.node.push(rawChild);
    } else {
      var referenceIndex = state.node.indexOf(rawReference);

      state.node.splice(referenceIndex, 0, rawChild);
    }

    return rawChild;
  };

  var adapter = {
    $isNode: $isNode, $isValue: $isValue, $createRawNode: $createRawNode, getChildren: getChildren, getValue: getValue, setValue: setValue, remove: remove,
    add: add
  };

  return adapter;
};

module.exports = Adapter;