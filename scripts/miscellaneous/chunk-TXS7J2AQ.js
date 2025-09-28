import {
  require_baseClone,
  require_getAllKeysIn
} from "./chunk-SPG5J3R6.js";
import {
  require_arrayMap,
  require_baseGet,
  require_castPath,
  require_copyObject,
  require_flatRest,
  require_isPlainObject,
  require_last,
  require_toKey
} from "./chunk-DRX7DPCE.js";
import {
  __commonJS
} from "./chunk-V4OQ3NZ2.js";

// node_modules/lodash/_baseSlice.js
var require_baseSlice = __commonJS({
  "node_modules/lodash/_baseSlice.js"(exports, module) {
    function baseSlice(array, start, end) {
      var index = -1, length = array.length;
      if (start < 0) {
        start = -start > length ? 0 : length + start;
      }
      end = end > length ? length : end;
      if (end < 0) {
        end += length;
      }
      length = start > end ? 0 : end - start >>> 0;
      start >>>= 0;
      var result = Array(length);
      while (++index < length) {
        result[index] = array[index + start];
      }
      return result;
    }
    module.exports = baseSlice;
  }
});

// node_modules/lodash/_parent.js
var require_parent = __commonJS({
  "node_modules/lodash/_parent.js"(exports, module) {
    var baseGet = require_baseGet();
    var baseSlice = require_baseSlice();
    function parent(object, path) {
      return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
    }
    module.exports = parent;
  }
});

// node_modules/lodash/_baseUnset.js
var require_baseUnset = __commonJS({
  "node_modules/lodash/_baseUnset.js"(exports, module) {
    var castPath = require_castPath();
    var last = require_last();
    var parent = require_parent();
    var toKey = require_toKey();
    function baseUnset(object, path) {
      path = castPath(path, object);
      object = parent(object, path);
      return object == null || delete object[toKey(last(path))];
    }
    module.exports = baseUnset;
  }
});

// node_modules/lodash/_customOmitClone.js
var require_customOmitClone = __commonJS({
  "node_modules/lodash/_customOmitClone.js"(exports, module) {
    var isPlainObject = require_isPlainObject();
    function customOmitClone(value) {
      return isPlainObject(value) ? void 0 : value;
    }
    module.exports = customOmitClone;
  }
});

// node_modules/lodash/omit.js
var require_omit = __commonJS({
  "node_modules/lodash/omit.js"(exports, module) {
    var arrayMap = require_arrayMap();
    var baseClone = require_baseClone();
    var baseUnset = require_baseUnset();
    var castPath = require_castPath();
    var copyObject = require_copyObject();
    var customOmitClone = require_customOmitClone();
    var flatRest = require_flatRest();
    var getAllKeysIn = require_getAllKeysIn();
    var CLONE_DEEP_FLAG = 1;
    var CLONE_FLAT_FLAG = 2;
    var CLONE_SYMBOLS_FLAG = 4;
    var omit = flatRest(function(object, paths) {
      var result = {};
      if (object == null) {
        return result;
      }
      var isDeep = false;
      paths = arrayMap(paths, function(path) {
        path = castPath(path, object);
        isDeep || (isDeep = path.length > 1);
        return path;
      });
      copyObject(object, getAllKeysIn(object), result);
      if (isDeep) {
        result = baseClone(result, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
      }
      var length = paths.length;
      while (length--) {
        baseUnset(result, paths[length]);
      }
      return result;
    });
    module.exports = omit;
  }
});

export {
  require_baseSlice,
  require_omit
};
//# sourceMappingURL=chunk-TXS7J2AQ.js.map
