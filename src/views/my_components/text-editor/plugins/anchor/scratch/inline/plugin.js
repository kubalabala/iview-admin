(function () {

var defs = {}; // id -> {dependencies, definition, instance (possibly undefined)}

// Used when there is no 'main' module.
// The name is probably (hopefully) unique so minification removes for releases.
var register_3795 = function (id) {
  var module = dem(id);
  var fragments = id.split('.');
  var target = Function('return this;')();
  for (var i = 0; i < fragments.length - 1; ++i) {
    if (target[fragments[i]] === undefined)
      target[fragments[i]] = {};
    target = target[fragments[i]];
  }
  target[fragments[fragments.length - 1]] = module;
};

var instantiate = function (id) {
  var actual = defs[id];
  var dependencies = actual.deps;
  var definition = actual.defn;
  var len = dependencies.length;
  var instances = new Array(len);
  for (var i = 0; i < len; ++i)
    instances[i] = dem(dependencies[i]);
  var defResult = definition.apply(null, instances);
  if (defResult === undefined)
     throw 'module [' + id + '] returned undefined';
  actual.instance = defResult;
};

var def = function (id, dependencies, definition) {
  if (typeof id !== 'string')
    throw 'module id must be a string';
  else if (dependencies === undefined)
    throw 'no dependencies for ' + id;
  else if (definition === undefined)
    throw 'no definition function for ' + id;
  defs[id] = {
    deps: dependencies,
    defn: definition,
    instance: undefined
  };
};

var dem = function (id) {
  var actual = defs[id];
  if (actual === undefined)
    throw 'module [' + id + '] was undefined';
  else if (actual.instance === undefined)
    instantiate(id);
  return actual.instance;
};

var req = function (ids, callback) {
  var len = ids.length;
  var instances = new Array(len);
  for (var i = 0; i < len; ++i)
    instances.push(dem(ids[i]));
  callback.apply(null, callback);
};

var ephox = {};

ephox.bolt = {
  module: {
    api: {
      define: def,
      require: req,
      demand: dem
    }
  }
};

var define = def;
var require = req;
var demand = dem;
// this helps with minificiation when using a lot of global references
var defineGlobal = function (id, ref) {
  define(id, [], function () { return ref; });
};
/*jsc
["0","1","2","3","4","5","6","7"]
jsc*/
defineGlobal("5", tinymce.util.Tools.resolve);
/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  "1",
  [
    "5"
  ],
  function (resolve) {
    return resolve('tinymce.PluginManager');
  }
);

/**
 * Anchor.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  "7",
  [
  ],
  function () {
    var isValidId = function (id) {
      // Follows HTML4 rules: https://www.w3.org/TR/html401/types.html#type-id
      return /^[A-Za-z][A-Za-z0-9\-:._]*$/.test(id);
    };

    var getId = function (editor) {
      var selectedNode = editor.selection.getNode();
      var isAnchor = selectedNode.tagName === 'A' && editor.dom.getAttrib(selectedNode, 'href') === '';
      return isAnchor ? (selectedNode.id || selectedNode.name) : '';
    };

    var insert = function (editor, id) {
      var selectedNode = editor.selection.getNode();
      var isAnchor = selectedNode.tagName === 'A' && editor.dom.getAttrib(selectedNode, 'href') === '';

      if (isAnchor) {
        selectedNode.removeAttribute('name');
        selectedNode.id = id;
      } else {
        editor.selection.collapse(true);
        editor.execCommand('mceInsertContent', false, editor.dom.createHTML('a', {
          id: id
        }));
      }
    };

    return {
      isValidId: isValidId,
      getId: getId,
      insert: insert
    };
  }
);
/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  "6",
  [
    "7"
  ],
  function (Anchor) {
    var insertAnchor = function (editor, newId) {
      if (!Anchor.isValidId(newId)) {
        editor.windowManager.alert(
          'Id should start with a letter, followed only by letters, numbers, dashes, dots, colons or underscores.'
        );
        return true;
      } else {
        Anchor.insert(editor, newId);
        return false;
      }
    };

    var open = function (editor) {
      var currentId = Anchor.getId(editor);

      editor.windowManager.open({
        title: 'Anchor',
        body: { type: 'textbox', name: 'id', size: 40, label: 'Id', value: currentId },
        onsubmit: function (e) {
          var newId = e.data.id;

          if (insertAnchor(editor, newId)) {
            e.preventDefault();
          }
        }
      });
    };

    return {
      open: open
    };
  }
);
/**
 * Commands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  "2",
  [
    "6"
  ],
  function (Dialog) {
    var register = function (editor) {
      editor.addCommand('mceAnchor', function () {
        Dialog.open(editor);
      });
    };

    return {
      register: register
    };
  }
);
/**
 * FilterContent.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  "3",
  [
  ],
  function () {
    var isAnchorNode = function (node) {
      return !node.attr('href') && (node.attr('id') || node.attr('name')) && !node.firstChild;
    };

    var setContentEditable = function (state) {
      return function (nodes) {
        for (var i = 0; i < nodes.length; i++) {
          if (isAnchorNode(nodes[i])) {
            nodes[i].attr('contenteditable', state);
          }
        }
      };
    };

    var setup = function (editor) {
      editor.on('PreInit', function () {
        editor.parser.addNodeFilter('a', setContentEditable('false'));
        editor.serializer.addNodeFilter('a', setContentEditable(null));
      });
    };

    return {
      setup: setup
    };
  }
);
/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  "4",
  [
  ],
  function () {
    var register = function (editor) {
      editor.addButton('anchor', {
        icon: 'anchor',
        tooltip: 'Anchor',
        cmd: 'mceAnchor',
        stateSelector: 'a:not([href])'
      });

      editor.addMenuItem('anchor', {
        icon: 'anchor',
        text: 'Anchor',
        context: 'insert',
        cmd: 'mceAnchor'
      });
    };

    return {
      register: register
    };
  }
);
/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  "0",
  [
    "1",
    "2",
    "3",
    "4"
  ],
  function (PluginManager, Commands, FilterContent, Buttons) {
    PluginManager.add('anchor', function (editor) {
      FilterContent.setup(editor);
      Commands.register(editor);
      Buttons.register(editor);
    });

    return function () { };
  }
);
dem("0")();
})();
