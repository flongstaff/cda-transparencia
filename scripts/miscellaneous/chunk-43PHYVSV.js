import {
  ascending_default,
  basisClosed_default,
  basisOpen_default,
  basis_default,
  bundle_default,
  cardinalClosed_default,
  cardinalOpen_default,
  cardinal_default,
  catmullRomClosed_default,
  catmullRomOpen_default,
  catmullRom_default,
  cubehelix,
  cubehelixLong,
  descending_default,
  diverging_default,
  expand_default,
  insideOut_default,
  linearClosed_default,
  linear_default,
  monotoneX,
  monotoneY,
  natural_default,
  none_default,
  none_default2,
  ordinal,
  require_SetCache,
  require_Stack,
  require_arrayIncludes,
  require_arrayIncludesWith,
  require_arrayMap,
  require_assignValue,
  require_baseAssignValue,
  require_baseFor,
  require_baseGet,
  require_baseRest,
  require_baseUnary,
  require_cacheHas,
  require_castPath,
  require_cloneBuffer,
  require_cloneTypedArray,
  require_copyArray,
  require_copyObject,
  require_eq,
  require_flatRest,
  require_get,
  require_hasIn,
  require_initCloneObject,
  require_isArguments,
  require_isArray,
  require_isArrayLike,
  require_isBuffer,
  require_isEqual,
  require_isFunction,
  require_isIndex,
  require_isIterateeCall,
  require_isObject,
  require_isObjectLike,
  require_isPlainObject,
  require_isString,
  require_isTypedArray,
  require_keysIn,
  require_last,
  require_toKey,
  reverse_default,
  rgb,
  rgbBasis,
  silhouette_default,
  stepAfter,
  stepBefore,
  step_default,
  string_default,
  wiggle_default
} from "./chunk-DRX7DPCE.js";
import {
  require_jsx_runtime
} from "./chunk-32NEGIXE.js";
import {
  require_react_dom
} from "./chunk-E5ODL3YF.js";
import {
  require_react
} from "./chunk-65KY755N.js";
import {
  __commonJS,
  __toESM
} from "./chunk-V4OQ3NZ2.js";

// node_modules/lodash/_assignMergeValue.js
var require_assignMergeValue = __commonJS({
  "node_modules/lodash/_assignMergeValue.js"(exports, module) {
    var baseAssignValue = require_baseAssignValue();
    var eq = require_eq();
    function assignMergeValue(object, key, value) {
      if (value !== void 0 && !eq(object[key], value) || value === void 0 && !(key in object)) {
        baseAssignValue(object, key, value);
      }
    }
    module.exports = assignMergeValue;
  }
});

// node_modules/lodash/isArrayLikeObject.js
var require_isArrayLikeObject = __commonJS({
  "node_modules/lodash/isArrayLikeObject.js"(exports, module) {
    var isArrayLike = require_isArrayLike();
    var isObjectLike = require_isObjectLike();
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }
    module.exports = isArrayLikeObject;
  }
});

// node_modules/lodash/_safeGet.js
var require_safeGet = __commonJS({
  "node_modules/lodash/_safeGet.js"(exports, module) {
    function safeGet(object, key) {
      if (key === "constructor" && typeof object[key] === "function") {
        return;
      }
      if (key == "__proto__") {
        return;
      }
      return object[key];
    }
    module.exports = safeGet;
  }
});

// node_modules/lodash/toPlainObject.js
var require_toPlainObject = __commonJS({
  "node_modules/lodash/toPlainObject.js"(exports, module) {
    var copyObject = require_copyObject();
    var keysIn = require_keysIn();
    function toPlainObject(value) {
      return copyObject(value, keysIn(value));
    }
    module.exports = toPlainObject;
  }
});

// node_modules/lodash/_baseMergeDeep.js
var require_baseMergeDeep = __commonJS({
  "node_modules/lodash/_baseMergeDeep.js"(exports, module) {
    var assignMergeValue = require_assignMergeValue();
    var cloneBuffer = require_cloneBuffer();
    var cloneTypedArray = require_cloneTypedArray();
    var copyArray = require_copyArray();
    var initCloneObject = require_initCloneObject();
    var isArguments = require_isArguments();
    var isArray = require_isArray();
    var isArrayLikeObject = require_isArrayLikeObject();
    var isBuffer = require_isBuffer();
    var isFunction = require_isFunction();
    var isObject = require_isObject();
    var isPlainObject = require_isPlainObject();
    var isTypedArray = require_isTypedArray();
    var safeGet = require_safeGet();
    var toPlainObject = require_toPlainObject();
    function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
      var objValue = safeGet(object, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
      if (stacked) {
        assignMergeValue(object, key, stacked);
        return;
      }
      var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : void 0;
      var isCommon = newValue === void 0;
      if (isCommon) {
        var isArr = isArray(srcValue), isBuff = !isArr && isBuffer(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
        newValue = srcValue;
        if (isArr || isBuff || isTyped) {
          if (isArray(objValue)) {
            newValue = objValue;
          } else if (isArrayLikeObject(objValue)) {
            newValue = copyArray(objValue);
          } else if (isBuff) {
            isCommon = false;
            newValue = cloneBuffer(srcValue, true);
          } else if (isTyped) {
            isCommon = false;
            newValue = cloneTypedArray(srcValue, true);
          } else {
            newValue = [];
          }
        } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
          newValue = objValue;
          if (isArguments(objValue)) {
            newValue = toPlainObject(objValue);
          } else if (!isObject(objValue) || isFunction(objValue)) {
            newValue = initCloneObject(srcValue);
          }
        } else {
          isCommon = false;
        }
      }
      if (isCommon) {
        stack.set(srcValue, newValue);
        mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
        stack["delete"](srcValue);
      }
      assignMergeValue(object, key, newValue);
    }
    module.exports = baseMergeDeep;
  }
});

// node_modules/lodash/_baseMerge.js
var require_baseMerge = __commonJS({
  "node_modules/lodash/_baseMerge.js"(exports, module) {
    var Stack = require_Stack();
    var assignMergeValue = require_assignMergeValue();
    var baseFor = require_baseFor();
    var baseMergeDeep = require_baseMergeDeep();
    var isObject = require_isObject();
    var keysIn = require_keysIn();
    var safeGet = require_safeGet();
    function baseMerge(object, source, srcIndex, customizer, stack) {
      if (object === source) {
        return;
      }
      baseFor(source, function(srcValue, key) {
        stack || (stack = new Stack());
        if (isObject(srcValue)) {
          baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
        } else {
          var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + "", object, source, stack) : void 0;
          if (newValue === void 0) {
            newValue = srcValue;
          }
          assignMergeValue(object, key, newValue);
        }
      }, keysIn);
    }
    module.exports = baseMerge;
  }
});

// node_modules/lodash/_createAssigner.js
var require_createAssigner = __commonJS({
  "node_modules/lodash/_createAssigner.js"(exports, module) {
    var baseRest = require_baseRest();
    var isIterateeCall = require_isIterateeCall();
    function createAssigner(assigner) {
      return baseRest(function(object, sources) {
        var index2 = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : void 0, guard = length > 2 ? sources[2] : void 0;
        customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : void 0;
        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          customizer = length < 3 ? void 0 : customizer;
          length = 1;
        }
        object = Object(object);
        while (++index2 < length) {
          var source = sources[index2];
          if (source) {
            assigner(object, source, index2, customizer);
          }
        }
        return object;
      });
    }
    module.exports = createAssigner;
  }
});

// node_modules/lodash/merge.js
var require_merge = __commonJS({
  "node_modules/lodash/merge.js"(exports, module) {
    var baseMerge = require_baseMerge();
    var createAssigner = require_createAssigner();
    var merge2 = createAssigner(function(object, source, srcIndex) {
      baseMerge(object, source, srcIndex);
    });
    module.exports = merge2;
  }
});

// node_modules/lodash/_baseSet.js
var require_baseSet = __commonJS({
  "node_modules/lodash/_baseSet.js"(exports, module) {
    var assignValue = require_assignValue();
    var castPath = require_castPath();
    var isIndex = require_isIndex();
    var isObject = require_isObject();
    var toKey = require_toKey();
    function baseSet(object, path, value, customizer) {
      if (!isObject(object)) {
        return object;
      }
      path = castPath(path, object);
      var index2 = -1, length = path.length, lastIndex = length - 1, nested = object;
      while (nested != null && ++index2 < length) {
        var key = toKey(path[index2]), newValue = value;
        if (key === "__proto__" || key === "constructor" || key === "prototype") {
          return object;
        }
        if (index2 != lastIndex) {
          var objValue = nested[key];
          newValue = customizer ? customizer(objValue, key, nested) : void 0;
          if (newValue === void 0) {
            newValue = isObject(objValue) ? objValue : isIndex(path[index2 + 1]) ? [] : {};
          }
        }
        assignValue(nested, key, newValue);
        nested = nested[key];
      }
      return object;
    }
    module.exports = baseSet;
  }
});

// node_modules/lodash/set.js
var require_set = __commonJS({
  "node_modules/lodash/set.js"(exports, module) {
    var baseSet = require_baseSet();
    function set2(object, path, value) {
      return object == null ? object : baseSet(object, path, value);
    }
    module.exports = set2;
  }
});

// node_modules/lodash/_baseDifference.js
var require_baseDifference = __commonJS({
  "node_modules/lodash/_baseDifference.js"(exports, module) {
    var SetCache = require_SetCache();
    var arrayIncludes = require_arrayIncludes();
    var arrayIncludesWith = require_arrayIncludesWith();
    var arrayMap = require_arrayMap();
    var baseUnary = require_baseUnary();
    var cacheHas = require_cacheHas();
    var LARGE_ARRAY_SIZE = 200;
    function baseDifference(array2, values, iteratee, comparator) {
      var index2 = -1, includes = arrayIncludes, isCommon = true, length = array2.length, result = [], valuesLength = values.length;
      if (!length) {
        return result;
      }
      if (iteratee) {
        values = arrayMap(values, baseUnary(iteratee));
      }
      if (comparator) {
        includes = arrayIncludesWith;
        isCommon = false;
      } else if (values.length >= LARGE_ARRAY_SIZE) {
        includes = cacheHas;
        isCommon = false;
        values = new SetCache(values);
      }
      outer:
        while (++index2 < length) {
          var value = array2[index2], computed = iteratee == null ? value : iteratee(value);
          value = comparator || value !== 0 ? value : 0;
          if (isCommon && computed === computed) {
            var valuesIndex = valuesLength;
            while (valuesIndex--) {
              if (values[valuesIndex] === computed) {
                continue outer;
              }
            }
            result.push(value);
          } else if (!includes(values, computed, comparator)) {
            result.push(value);
          }
        }
      return result;
    }
    module.exports = baseDifference;
  }
});

// node_modules/lodash/without.js
var require_without = __commonJS({
  "node_modules/lodash/without.js"(exports, module) {
    var baseDifference = require_baseDifference();
    var baseRest = require_baseRest();
    var isArrayLikeObject = require_isArrayLikeObject();
    var without = baseRest(function(array2, values) {
      return isArrayLikeObject(array2) ? baseDifference(array2, values) : [];
    });
    module.exports = without;
  }
});

// node_modules/lodash/_basePickBy.js
var require_basePickBy = __commonJS({
  "node_modules/lodash/_basePickBy.js"(exports, module) {
    var baseGet = require_baseGet();
    var baseSet = require_baseSet();
    var castPath = require_castPath();
    function basePickBy(object, paths, predicate) {
      var index2 = -1, length = paths.length, result = {};
      while (++index2 < length) {
        var path = paths[index2], value = baseGet(object, path);
        if (predicate(value, path)) {
          baseSet(result, castPath(path, object), value);
        }
      }
      return result;
    }
    module.exports = basePickBy;
  }
});

// node_modules/lodash/_basePick.js
var require_basePick = __commonJS({
  "node_modules/lodash/_basePick.js"(exports, module) {
    var basePickBy = require_basePickBy();
    var hasIn = require_hasIn();
    function basePick(object, paths) {
      return basePickBy(object, paths, function(value, path) {
        return hasIn(object, path);
      });
    }
    module.exports = basePick;
  }
});

// node_modules/lodash/pick.js
var require_pick = __commonJS({
  "node_modules/lodash/pick.js"(exports, module) {
    var basePick = require_basePick();
    var flatRest = require_flatRest();
    var pick = flatRest(function(object, paths) {
      return object == null ? {} : basePick(object, paths);
    });
    module.exports = pick;
  }
});

// node_modules/@react-spring/rafz/dist/react-spring_rafz.modern.mjs
var updateQueue = makeQueue();
var raf = (fn2) => schedule(fn2, updateQueue);
var writeQueue = makeQueue();
raf.write = (fn2) => schedule(fn2, writeQueue);
var onStartQueue = makeQueue();
raf.onStart = (fn2) => schedule(fn2, onStartQueue);
var onFrameQueue = makeQueue();
raf.onFrame = (fn2) => schedule(fn2, onFrameQueue);
var onFinishQueue = makeQueue();
raf.onFinish = (fn2) => schedule(fn2, onFinishQueue);
var timeouts = [];
raf.setTimeout = (handler, ms) => {
  const time = raf.now() + ms;
  const cancel = () => {
    const i5 = timeouts.findIndex((t5) => t5.cancel == cancel);
    if (~i5) timeouts.splice(i5, 1);
    pendingCount -= ~i5 ? 1 : 0;
  };
  const timeout = { time, handler, cancel };
  timeouts.splice(findTimeout(time), 0, timeout);
  pendingCount += 1;
  start();
  return timeout;
};
var findTimeout = (time) => ~(~timeouts.findIndex((t5) => t5.time > time) || ~timeouts.length);
raf.cancel = (fn2) => {
  onStartQueue.delete(fn2);
  onFrameQueue.delete(fn2);
  onFinishQueue.delete(fn2);
  updateQueue.delete(fn2);
  writeQueue.delete(fn2);
};
raf.sync = (fn2) => {
  sync = true;
  raf.batchedUpdates(fn2);
  sync = false;
};
raf.throttle = (fn2) => {
  let lastArgs;
  function queuedFn() {
    try {
      fn2(...lastArgs);
    } finally {
      lastArgs = null;
    }
  }
  function throttled(...args) {
    lastArgs = args;
    raf.onStart(queuedFn);
  }
  throttled.handler = fn2;
  throttled.cancel = () => {
    onStartQueue.delete(queuedFn);
    lastArgs = null;
  };
  return throttled;
};
var nativeRaf = typeof window != "undefined" ? window.requestAnimationFrame : (
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  (() => {
  })
);
raf.use = (impl) => nativeRaf = impl;
raf.now = typeof performance != "undefined" ? () => performance.now() : Date.now;
raf.batchedUpdates = (fn2) => fn2();
raf.catch = console.error;
raf.frameLoop = "always";
raf.advance = () => {
  if (raf.frameLoop !== "demand") {
    console.warn(
      "Cannot call the manual advancement of rafz whilst frameLoop is not set as demand"
    );
  } else {
    update();
  }
};
var ts = -1;
var pendingCount = 0;
var sync = false;
function schedule(fn2, queue) {
  if (sync) {
    queue.delete(fn2);
    fn2(0);
  } else {
    queue.add(fn2);
    start();
  }
}
function start() {
  if (ts < 0) {
    ts = 0;
    if (raf.frameLoop !== "demand") {
      nativeRaf(loop);
    }
  }
}
function stop() {
  ts = -1;
}
function loop() {
  if (~ts) {
    nativeRaf(loop);
    raf.batchedUpdates(update);
  }
}
function update() {
  const prevTs = ts;
  ts = raf.now();
  const count2 = findTimeout(ts);
  if (count2) {
    eachSafely(timeouts.splice(0, count2), (t5) => t5.handler());
    pendingCount -= count2;
  }
  if (!pendingCount) {
    stop();
    return;
  }
  onStartQueue.flush();
  updateQueue.flush(prevTs ? Math.min(64, ts - prevTs) : 16.667);
  onFrameQueue.flush();
  writeQueue.flush();
  onFinishQueue.flush();
}
function makeQueue() {
  let next = /* @__PURE__ */ new Set();
  let current = next;
  return {
    add(fn2) {
      pendingCount += current == next && !next.has(fn2) ? 1 : 0;
      next.add(fn2);
    },
    delete(fn2) {
      pendingCount -= current == next && next.has(fn2) ? 1 : 0;
      return next.delete(fn2);
    },
    flush(arg) {
      if (current.size) {
        next = /* @__PURE__ */ new Set();
        pendingCount -= current.size;
        eachSafely(current, (fn2) => fn2(arg) && next.add(fn2));
        pendingCount += next.size;
        current = next;
      }
    }
  };
}
function eachSafely(values, each2) {
  values.forEach((value) => {
    try {
      each2(value);
    } catch (e7) {
      raf.catch(e7);
    }
  });
}

// node_modules/@react-spring/shared/dist/react-spring_shared.modern.mjs
var import_react = __toESM(require_react(), 1);
var import_react2 = __toESM(require_react(), 1);
var import_react3 = __toESM(require_react(), 1);
var import_react4 = __toESM(require_react(), 1);
var import_react5 = __toESM(require_react(), 1);
var import_react6 = __toESM(require_react(), 1);
var import_react7 = __toESM(require_react(), 1);
var import_react8 = __toESM(require_react(), 1);
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var globals_exports = {};
__export(globals_exports, {
  assign: () => assign,
  colors: () => colors,
  createStringInterpolator: () => createStringInterpolator,
  skipAnimation: () => skipAnimation,
  to: () => to,
  willAdvance: () => willAdvance
});
function noop() {
}
var defineHidden = (obj, key, value) => Object.defineProperty(obj, key, { value, writable: true, configurable: true });
var is = {
  arr: Array.isArray,
  obj: (a4) => !!a4 && a4.constructor.name === "Object",
  fun: (a4) => typeof a4 === "function",
  str: (a4) => typeof a4 === "string",
  num: (a4) => typeof a4 === "number",
  und: (a4) => a4 === void 0
};
function isEqual(a4, b4) {
  if (is.arr(a4)) {
    if (!is.arr(b4) || a4.length !== b4.length) return false;
    for (let i5 = 0; i5 < a4.length; i5++) {
      if (a4[i5] !== b4[i5]) return false;
    }
    return true;
  }
  return a4 === b4;
}
var each = (obj, fn2) => obj.forEach(fn2);
function eachProp(obj, fn2, ctx) {
  if (is.arr(obj)) {
    for (let i5 = 0; i5 < obj.length; i5++) {
      fn2.call(ctx, obj[i5], `${i5}`);
    }
    return;
  }
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      fn2.call(ctx, obj[key], key);
    }
  }
}
var toArray = (a4) => is.und(a4) ? [] : is.arr(a4) ? a4 : [a4];
function flush(queue, iterator) {
  if (queue.size) {
    const items = Array.from(queue);
    queue.clear();
    each(items, iterator);
  }
}
var flushCalls = (queue, ...args) => flush(queue, (fn2) => fn2(...args));
var isSSR = () => typeof window === "undefined" || !window.navigator || /ServerSideRendering|^Deno\//.test(window.navigator.userAgent);
var createStringInterpolator;
var to;
var colors = null;
var skipAnimation = false;
var willAdvance = noop;
var assign = (globals) => {
  if (globals.to) to = globals.to;
  if (globals.now) raf.now = globals.now;
  if (globals.colors !== void 0) colors = globals.colors;
  if (globals.skipAnimation != null) skipAnimation = globals.skipAnimation;
  if (globals.createStringInterpolator)
    createStringInterpolator = globals.createStringInterpolator;
  if (globals.requestAnimationFrame) raf.use(globals.requestAnimationFrame);
  if (globals.batchedUpdates) raf.batchedUpdates = globals.batchedUpdates;
  if (globals.willAdvance) willAdvance = globals.willAdvance;
  if (globals.frameLoop) raf.frameLoop = globals.frameLoop;
};
var startQueue = /* @__PURE__ */ new Set();
var currentFrame = [];
var prevFrame = [];
var priority = 0;
var frameLoop = {
  get idle() {
    return !startQueue.size && !currentFrame.length;
  },
  /** Advance the given animation on every frame until idle. */
  start(animation) {
    if (priority > animation.priority) {
      startQueue.add(animation);
      raf.onStart(flushStartQueue);
    } else {
      startSafely(animation);
      raf(advance);
    }
  },
  /** Advance all animations by the given time. */
  advance,
  /** Call this when an animation's priority changes. */
  sort(animation) {
    if (priority) {
      raf.onFrame(() => frameLoop.sort(animation));
    } else {
      const prevIndex = currentFrame.indexOf(animation);
      if (~prevIndex) {
        currentFrame.splice(prevIndex, 1);
        startUnsafely(animation);
      }
    }
  },
  /**
   * Clear all animations. For testing purposes.
   *
   * ☠️ Never call this from within the frameloop.
   */
  clear() {
    currentFrame = [];
    startQueue.clear();
  }
};
function flushStartQueue() {
  startQueue.forEach(startSafely);
  startQueue.clear();
  raf(advance);
}
function startSafely(animation) {
  if (!currentFrame.includes(animation)) startUnsafely(animation);
}
function startUnsafely(animation) {
  currentFrame.splice(
    findIndex(currentFrame, (other) => other.priority > animation.priority),
    0,
    animation
  );
}
function advance(dt2) {
  const nextFrame = prevFrame;
  for (let i5 = 0; i5 < currentFrame.length; i5++) {
    const animation = currentFrame[i5];
    priority = animation.priority;
    if (!animation.idle) {
      willAdvance(animation);
      animation.advance(dt2);
      if (!animation.idle) {
        nextFrame.push(animation);
      }
    }
  }
  priority = 0;
  prevFrame = currentFrame;
  prevFrame.length = 0;
  currentFrame = nextFrame;
  return currentFrame.length > 0;
}
function findIndex(arr, test) {
  const index2 = arr.findIndex(test);
  return index2 < 0 ? arr.length : index2;
}
var clamp = (min2, max2, v2) => Math.min(Math.max(v2, min2), max2);
var colors2 = {
  transparent: 0,
  aliceblue: 4042850303,
  antiquewhite: 4209760255,
  aqua: 16777215,
  aquamarine: 2147472639,
  azure: 4043309055,
  beige: 4126530815,
  bisque: 4293182719,
  black: 255,
  blanchedalmond: 4293643775,
  blue: 65535,
  blueviolet: 2318131967,
  brown: 2771004159,
  burlywood: 3736635391,
  burntsienna: 3934150143,
  cadetblue: 1604231423,
  chartreuse: 2147418367,
  chocolate: 3530104575,
  coral: 4286533887,
  cornflowerblue: 1687547391,
  cornsilk: 4294499583,
  crimson: 3692313855,
  cyan: 16777215,
  darkblue: 35839,
  darkcyan: 9145343,
  darkgoldenrod: 3095792639,
  darkgray: 2846468607,
  darkgreen: 6553855,
  darkgrey: 2846468607,
  darkkhaki: 3182914559,
  darkmagenta: 2332068863,
  darkolivegreen: 1433087999,
  darkorange: 4287365375,
  darkorchid: 2570243327,
  darkred: 2332033279,
  darksalmon: 3918953215,
  darkseagreen: 2411499519,
  darkslateblue: 1211993087,
  darkslategray: 793726975,
  darkslategrey: 793726975,
  darkturquoise: 13554175,
  darkviolet: 2483082239,
  deeppink: 4279538687,
  deepskyblue: 12582911,
  dimgray: 1768516095,
  dimgrey: 1768516095,
  dodgerblue: 512819199,
  firebrick: 2988581631,
  floralwhite: 4294635775,
  forestgreen: 579543807,
  fuchsia: 4278255615,
  gainsboro: 3705462015,
  ghostwhite: 4177068031,
  gold: 4292280575,
  goldenrod: 3668254975,
  gray: 2155905279,
  green: 8388863,
  greenyellow: 2919182335,
  grey: 2155905279,
  honeydew: 4043305215,
  hotpink: 4285117695,
  indianred: 3445382399,
  indigo: 1258324735,
  ivory: 4294963455,
  khaki: 4041641215,
  lavender: 3873897215,
  lavenderblush: 4293981695,
  lawngreen: 2096890111,
  lemonchiffon: 4294626815,
  lightblue: 2916673279,
  lightcoral: 4034953471,
  lightcyan: 3774873599,
  lightgoldenrodyellow: 4210742015,
  lightgray: 3553874943,
  lightgreen: 2431553791,
  lightgrey: 3553874943,
  lightpink: 4290167295,
  lightsalmon: 4288707327,
  lightseagreen: 548580095,
  lightskyblue: 2278488831,
  lightslategray: 2005441023,
  lightslategrey: 2005441023,
  lightsteelblue: 2965692159,
  lightyellow: 4294959359,
  lime: 16711935,
  limegreen: 852308735,
  linen: 4210091775,
  magenta: 4278255615,
  maroon: 2147483903,
  mediumaquamarine: 1724754687,
  mediumblue: 52735,
  mediumorchid: 3126187007,
  mediumpurple: 2473647103,
  mediumseagreen: 1018393087,
  mediumslateblue: 2070474495,
  mediumspringgreen: 16423679,
  mediumturquoise: 1221709055,
  mediumvioletred: 3340076543,
  midnightblue: 421097727,
  mintcream: 4127193855,
  mistyrose: 4293190143,
  moccasin: 4293178879,
  navajowhite: 4292783615,
  navy: 33023,
  oldlace: 4260751103,
  olive: 2155872511,
  olivedrab: 1804477439,
  orange: 4289003775,
  orangered: 4282712319,
  orchid: 3664828159,
  palegoldenrod: 4008225535,
  palegreen: 2566625535,
  paleturquoise: 2951671551,
  palevioletred: 3681588223,
  papayawhip: 4293907967,
  peachpuff: 4292524543,
  peru: 3448061951,
  pink: 4290825215,
  plum: 3718307327,
  powderblue: 2967529215,
  purple: 2147516671,
  rebeccapurple: 1714657791,
  red: 4278190335,
  rosybrown: 3163525119,
  royalblue: 1097458175,
  saddlebrown: 2336560127,
  salmon: 4202722047,
  sandybrown: 4104413439,
  seagreen: 780883967,
  seashell: 4294307583,
  sienna: 2689740287,
  silver: 3233857791,
  skyblue: 2278484991,
  slateblue: 1784335871,
  slategray: 1887473919,
  slategrey: 1887473919,
  snow: 4294638335,
  springgreen: 16744447,
  steelblue: 1182971135,
  tan: 3535047935,
  teal: 8421631,
  thistle: 3636451583,
  tomato: 4284696575,
  turquoise: 1088475391,
  violet: 4001558271,
  wheat: 4125012991,
  white: 4294967295,
  whitesmoke: 4126537215,
  yellow: 4294902015,
  yellowgreen: 2597139199
};
var NUMBER = "[-+]?\\d*\\.?\\d+";
var PERCENTAGE = NUMBER + "%";
function call(...parts) {
  return "\\(\\s*(" + parts.join(")\\s*,\\s*(") + ")\\s*\\)";
}
var rgb2 = new RegExp("rgb" + call(NUMBER, NUMBER, NUMBER));
var rgba = new RegExp("rgba" + call(NUMBER, NUMBER, NUMBER, NUMBER));
var hsl = new RegExp("hsl" + call(NUMBER, PERCENTAGE, PERCENTAGE));
var hsla = new RegExp(
  "hsla" + call(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER)
);
var hex3 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
var hex4 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
var hex6 = /^#([0-9a-fA-F]{6})$/;
var hex8 = /^#([0-9a-fA-F]{8})$/;
function normalizeColor(color) {
  let match;
  if (typeof color === "number") {
    return color >>> 0 === color && color >= 0 && color <= 4294967295 ? color : null;
  }
  if (match = hex6.exec(color))
    return parseInt(match[1] + "ff", 16) >>> 0;
  if (colors && colors[color] !== void 0) {
    return colors[color];
  }
  if (match = rgb2.exec(color)) {
    return (parse255(match[1]) << 24 | // r
    parse255(match[2]) << 16 | // g
    parse255(match[3]) << 8 | // b
    255) >>> // a
    0;
  }
  if (match = rgba.exec(color)) {
    return (parse255(match[1]) << 24 | // r
    parse255(match[2]) << 16 | // g
    parse255(match[3]) << 8 | // b
    parse1(match[4])) >>> // a
    0;
  }
  if (match = hex3.exec(color)) {
    return parseInt(
      match[1] + match[1] + // r
      match[2] + match[2] + // g
      match[3] + match[3] + // b
      "ff",
      // a
      16
    ) >>> 0;
  }
  if (match = hex8.exec(color)) return parseInt(match[1], 16) >>> 0;
  if (match = hex4.exec(color)) {
    return parseInt(
      match[1] + match[1] + // r
      match[2] + match[2] + // g
      match[3] + match[3] + // b
      match[4] + match[4],
      // a
      16
    ) >>> 0;
  }
  if (match = hsl.exec(color)) {
    return (hslToRgb(
      parse360(match[1]),
      // h
      parsePercentage(match[2]),
      // s
      parsePercentage(match[3])
      // l
    ) | 255) >>> // a
    0;
  }
  if (match = hsla.exec(color)) {
    return (hslToRgb(
      parse360(match[1]),
      // h
      parsePercentage(match[2]),
      // s
      parsePercentage(match[3])
      // l
    ) | parse1(match[4])) >>> // a
    0;
  }
  return null;
}
function hue2rgb(p3, q, t5) {
  if (t5 < 0) t5 += 1;
  if (t5 > 1) t5 -= 1;
  if (t5 < 1 / 6) return p3 + (q - p3) * 6 * t5;
  if (t5 < 1 / 2) return q;
  if (t5 < 2 / 3) return p3 + (q - p3) * (2 / 3 - t5) * 6;
  return p3;
}
function hslToRgb(h2, s4, l4) {
  const q = l4 < 0.5 ? l4 * (1 + s4) : l4 + s4 - l4 * s4;
  const p3 = 2 * l4 - q;
  const r5 = hue2rgb(p3, q, h2 + 1 / 3);
  const g2 = hue2rgb(p3, q, h2);
  const b4 = hue2rgb(p3, q, h2 - 1 / 3);
  return Math.round(r5 * 255) << 24 | Math.round(g2 * 255) << 16 | Math.round(b4 * 255) << 8;
}
function parse255(str) {
  const int = parseInt(str, 10);
  if (int < 0) return 0;
  if (int > 255) return 255;
  return int;
}
function parse360(str) {
  const int = parseFloat(str);
  return (int % 360 + 360) % 360 / 360;
}
function parse1(str) {
  const num = parseFloat(str);
  if (num < 0) return 0;
  if (num > 1) return 255;
  return Math.round(num * 255);
}
function parsePercentage(str) {
  const int = parseFloat(str);
  if (int < 0) return 0;
  if (int > 100) return 1;
  return int / 100;
}
function colorToRgba(input) {
  let int32Color = normalizeColor(input);
  if (int32Color === null) return input;
  int32Color = int32Color || 0;
  const r5 = (int32Color & 4278190080) >>> 24;
  const g2 = (int32Color & 16711680) >>> 16;
  const b4 = (int32Color & 65280) >>> 8;
  const a4 = (int32Color & 255) / 255;
  return `rgba(${r5}, ${g2}, ${b4}, ${a4})`;
}
var createInterpolator = (range, output, extrapolate) => {
  if (is.fun(range)) {
    return range;
  }
  if (is.arr(range)) {
    return createInterpolator({
      range,
      output,
      extrapolate
    });
  }
  if (is.str(range.output[0])) {
    return createStringInterpolator(range);
  }
  const config2 = range;
  const outputRange = config2.output;
  const inputRange = config2.range || [0, 1];
  const extrapolateLeft = config2.extrapolateLeft || config2.extrapolate || "extend";
  const extrapolateRight = config2.extrapolateRight || config2.extrapolate || "extend";
  const easing = config2.easing || ((t5) => t5);
  return (input) => {
    const range2 = findRange(input, inputRange);
    return interpolate(
      input,
      inputRange[range2],
      inputRange[range2 + 1],
      outputRange[range2],
      outputRange[range2 + 1],
      easing,
      extrapolateLeft,
      extrapolateRight,
      config2.map
    );
  };
};
function interpolate(input, inputMin, inputMax, outputMin, outputMax, easing, extrapolateLeft, extrapolateRight, map4) {
  let result = map4 ? map4(input) : input;
  if (result < inputMin) {
    if (extrapolateLeft === "identity") return result;
    else if (extrapolateLeft === "clamp") result = inputMin;
  }
  if (result > inputMax) {
    if (extrapolateRight === "identity") return result;
    else if (extrapolateRight === "clamp") result = inputMax;
  }
  if (outputMin === outputMax) return outputMin;
  if (inputMin === inputMax) return input <= inputMin ? outputMin : outputMax;
  if (inputMin === -Infinity) result = -result;
  else if (inputMax === Infinity) result = result - inputMin;
  else result = (result - inputMin) / (inputMax - inputMin);
  result = easing(result);
  if (outputMin === -Infinity) result = -result;
  else if (outputMax === Infinity) result = result + outputMin;
  else result = result * (outputMax - outputMin) + outputMin;
  return result;
}
function findRange(input, inputRange) {
  for (var i5 = 1; i5 < inputRange.length - 1; ++i5)
    if (inputRange[i5] >= input) break;
  return i5 - 1;
}
var steps = (steps2, direction = "end") => (progress2) => {
  progress2 = direction === "end" ? Math.min(progress2, 0.999) : Math.max(progress2, 1e-3);
  const expanded = progress2 * steps2;
  const rounded = direction === "end" ? Math.floor(expanded) : Math.ceil(expanded);
  return clamp(0, 1, rounded / steps2);
};
var c1 = 1.70158;
var c2 = c1 * 1.525;
var c3 = c1 + 1;
var c4 = 2 * Math.PI / 3;
var c5 = 2 * Math.PI / 4.5;
var bounceOut = (x2) => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (x2 < 1 / d1) {
    return n1 * x2 * x2;
  } else if (x2 < 2 / d1) {
    return n1 * (x2 -= 1.5 / d1) * x2 + 0.75;
  } else if (x2 < 2.5 / d1) {
    return n1 * (x2 -= 2.25 / d1) * x2 + 0.9375;
  } else {
    return n1 * (x2 -= 2.625 / d1) * x2 + 0.984375;
  }
};
var easings = {
  linear: (x2) => x2,
  easeInQuad: (x2) => x2 * x2,
  easeOutQuad: (x2) => 1 - (1 - x2) * (1 - x2),
  easeInOutQuad: (x2) => x2 < 0.5 ? 2 * x2 * x2 : 1 - Math.pow(-2 * x2 + 2, 2) / 2,
  easeInCubic: (x2) => x2 * x2 * x2,
  easeOutCubic: (x2) => 1 - Math.pow(1 - x2, 3),
  easeInOutCubic: (x2) => x2 < 0.5 ? 4 * x2 * x2 * x2 : 1 - Math.pow(-2 * x2 + 2, 3) / 2,
  easeInQuart: (x2) => x2 * x2 * x2 * x2,
  easeOutQuart: (x2) => 1 - Math.pow(1 - x2, 4),
  easeInOutQuart: (x2) => x2 < 0.5 ? 8 * x2 * x2 * x2 * x2 : 1 - Math.pow(-2 * x2 + 2, 4) / 2,
  easeInQuint: (x2) => x2 * x2 * x2 * x2 * x2,
  easeOutQuint: (x2) => 1 - Math.pow(1 - x2, 5),
  easeInOutQuint: (x2) => x2 < 0.5 ? 16 * x2 * x2 * x2 * x2 * x2 : 1 - Math.pow(-2 * x2 + 2, 5) / 2,
  easeInSine: (x2) => 1 - Math.cos(x2 * Math.PI / 2),
  easeOutSine: (x2) => Math.sin(x2 * Math.PI / 2),
  easeInOutSine: (x2) => -(Math.cos(Math.PI * x2) - 1) / 2,
  easeInExpo: (x2) => x2 === 0 ? 0 : Math.pow(2, 10 * x2 - 10),
  easeOutExpo: (x2) => x2 === 1 ? 1 : 1 - Math.pow(2, -10 * x2),
  easeInOutExpo: (x2) => x2 === 0 ? 0 : x2 === 1 ? 1 : x2 < 0.5 ? Math.pow(2, 20 * x2 - 10) / 2 : (2 - Math.pow(2, -20 * x2 + 10)) / 2,
  easeInCirc: (x2) => 1 - Math.sqrt(1 - Math.pow(x2, 2)),
  easeOutCirc: (x2) => Math.sqrt(1 - Math.pow(x2 - 1, 2)),
  easeInOutCirc: (x2) => x2 < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x2, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x2 + 2, 2)) + 1) / 2,
  easeInBack: (x2) => c3 * x2 * x2 * x2 - c1 * x2 * x2,
  easeOutBack: (x2) => 1 + c3 * Math.pow(x2 - 1, 3) + c1 * Math.pow(x2 - 1, 2),
  easeInOutBack: (x2) => x2 < 0.5 ? Math.pow(2 * x2, 2) * ((c2 + 1) * 2 * x2 - c2) / 2 : (Math.pow(2 * x2 - 2, 2) * ((c2 + 1) * (x2 * 2 - 2) + c2) + 2) / 2,
  easeInElastic: (x2) => x2 === 0 ? 0 : x2 === 1 ? 1 : -Math.pow(2, 10 * x2 - 10) * Math.sin((x2 * 10 - 10.75) * c4),
  easeOutElastic: (x2) => x2 === 0 ? 0 : x2 === 1 ? 1 : Math.pow(2, -10 * x2) * Math.sin((x2 * 10 - 0.75) * c4) + 1,
  easeInOutElastic: (x2) => x2 === 0 ? 0 : x2 === 1 ? 1 : x2 < 0.5 ? -(Math.pow(2, 20 * x2 - 10) * Math.sin((20 * x2 - 11.125) * c5)) / 2 : Math.pow(2, -20 * x2 + 10) * Math.sin((20 * x2 - 11.125) * c5) / 2 + 1,
  easeInBounce: (x2) => 1 - bounceOut(1 - x2),
  easeOutBounce: bounceOut,
  easeInOutBounce: (x2) => x2 < 0.5 ? (1 - bounceOut(1 - 2 * x2)) / 2 : (1 + bounceOut(2 * x2 - 1)) / 2,
  steps
};
var $get = Symbol.for("FluidValue.get");
var $observers = Symbol.for("FluidValue.observers");
var hasFluidValue = (arg) => Boolean(arg && arg[$get]);
var getFluidValue = (arg) => arg && arg[$get] ? arg[$get]() : arg;
var getFluidObservers = (target) => target[$observers] || null;
function callFluidObserver(observer2, event) {
  if (observer2.eventObserved) {
    observer2.eventObserved(event);
  } else {
    observer2(event);
  }
}
function callFluidObservers(target, event) {
  const observers = target[$observers];
  if (observers) {
    observers.forEach((observer2) => {
      callFluidObserver(observer2, event);
    });
  }
}
var FluidValue = class {
  constructor(get) {
    if (!get && !(get = this.get)) {
      throw Error("Unknown getter");
    }
    setFluidGetter(this, get);
  }
};
var setFluidGetter = (target, get) => setHidden(target, $get, get);
function addFluidObserver(target, observer2) {
  if (target[$get]) {
    let observers = target[$observers];
    if (!observers) {
      setHidden(target, $observers, observers = /* @__PURE__ */ new Set());
    }
    if (!observers.has(observer2)) {
      observers.add(observer2);
      if (target.observerAdded) {
        target.observerAdded(observers.size, observer2);
      }
    }
  }
  return observer2;
}
function removeFluidObserver(target, observer2) {
  const observers = target[$observers];
  if (observers && observers.has(observer2)) {
    const count2 = observers.size - 1;
    if (count2) {
      observers.delete(observer2);
    } else {
      target[$observers] = null;
    }
    if (target.observerRemoved) {
      target.observerRemoved(count2, observer2);
    }
  }
}
var setHidden = (target, key, value) => Object.defineProperty(target, key, {
  value,
  writable: true,
  configurable: true
});
var numberRegex = /[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
var colorRegex = /(#(?:[0-9a-f]{2}){2,4}|(#[0-9a-f]{3})|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))/gi;
var unitRegex = new RegExp(`(${numberRegex.source})(%|[a-z]+)`, "i");
var rgbaRegex = /rgba\(([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+)\)/gi;
var cssVariableRegex = /var\((--[a-zA-Z0-9-_]+),? ?([a-zA-Z0-9 ()%#.,-]+)?\)/;
var variableToRgba = (input) => {
  const [token, fallback] = parseCSSVariable(input);
  if (!token || isSSR()) {
    return input;
  }
  const value = window.getComputedStyle(document.documentElement).getPropertyValue(token);
  if (value) {
    return value.trim();
  } else if (fallback && fallback.startsWith("--")) {
    const value2 = window.getComputedStyle(document.documentElement).getPropertyValue(fallback);
    if (value2) {
      return value2;
    } else {
      return input;
    }
  } else if (fallback && cssVariableRegex.test(fallback)) {
    return variableToRgba(fallback);
  } else if (fallback) {
    return fallback;
  }
  return input;
};
var parseCSSVariable = (current) => {
  const match = cssVariableRegex.exec(current);
  if (!match) return [,];
  const [, token, fallback] = match;
  return [token, fallback];
};
var namedColorRegex;
var rgbaRound = (_2, p1, p22, p3, p4) => `rgba(${Math.round(p1)}, ${Math.round(p22)}, ${Math.round(p3)}, ${p4})`;
var createStringInterpolator2 = (config2) => {
  if (!namedColorRegex)
    namedColorRegex = colors ? (
      // match color names, ignore partial matches
      new RegExp(`(${Object.keys(colors).join("|")})(?!\\w)`, "g")
    ) : (
      // never match
      /^\b$/
    );
  const output = config2.output.map((value) => {
    return getFluidValue(value).replace(cssVariableRegex, variableToRgba).replace(colorRegex, colorToRgba).replace(namedColorRegex, colorToRgba);
  });
  const keyframes = output.map((value) => value.match(numberRegex).map(Number));
  const outputRanges = keyframes[0].map(
    (_2, i5) => keyframes.map((values) => {
      if (!(i5 in values)) {
        throw Error('The arity of each "output" value must be equal');
      }
      return values[i5];
    })
  );
  const interpolators = outputRanges.map(
    (output2) => createInterpolator({ ...config2, output: output2 })
  );
  return (input) => {
    const missingUnit = !unitRegex.test(output[0]) && output.find((value) => unitRegex.test(value))?.replace(numberRegex, "");
    let i5 = 0;
    return output[0].replace(
      numberRegex,
      () => `${interpolators[i5++](input)}${missingUnit || ""}`
    ).replace(rgbaRegex, rgbaRound);
  };
};
var prefix = "react-spring: ";
var once = (fn2) => {
  const func = fn2;
  let called = false;
  if (typeof func != "function") {
    throw new TypeError(`${prefix}once requires a function parameter`);
  }
  return (...args) => {
    if (!called) {
      func(...args);
      called = true;
    }
  };
};
var warnInterpolate = once(console.warn);
function deprecateInterpolate() {
  warnInterpolate(
    `${prefix}The "interpolate" function is deprecated in v9 (use "to" instead)`
  );
}
var warnDirectCall = once(console.warn);
function deprecateDirectCall() {
  warnDirectCall(
    `${prefix}Directly calling start instead of using the api object is deprecated in v9 (use ".start" instead), this will be removed in later 0.X.0 versions`
  );
}
function isAnimatedString(value) {
  return is.str(value) && (value[0] == "#" || /\d/.test(value) || // Do not identify a CSS variable as an AnimatedString if its SSR
  !isSSR() && cssVariableRegex.test(value) || value in (colors || {}));
}
var useIsomorphicLayoutEffect = isSSR() ? import_react4.useEffect : import_react4.useLayoutEffect;
var useIsMounted = () => {
  const isMounted = (0, import_react3.useRef)(false);
  useIsomorphicLayoutEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return isMounted;
};
function useForceUpdate() {
  const update3 = (0, import_react2.useState)()[1];
  const isMounted = useIsMounted();
  return () => {
    if (isMounted.current) {
      update3(Math.random());
    }
  };
}
var useOnce = (effect) => (0, import_react6.useEffect)(effect, emptyDeps);
var emptyDeps = [];
function usePrev(value) {
  const prevRef = (0, import_react7.useRef)(void 0);
  (0, import_react7.useEffect)(() => {
    prevRef.current = value;
  });
  return prevRef.current;
}

// node_modules/@react-spring/core/dist/react-spring_core.modern.mjs
var import_react10 = __toESM(require_react(), 1);

// node_modules/@react-spring/animated/dist/react-spring_animated.modern.mjs
var React = __toESM(require_react(), 1);
var import_react9 = __toESM(require_react(), 1);
var $node = Symbol.for("Animated:node");
var isAnimated = (value) => !!value && value[$node] === value;
var getAnimated = (owner) => owner && owner[$node];
var setAnimated = (owner, node) => defineHidden(owner, $node, node);
var getPayload = (owner) => owner && owner[$node] && owner[$node].getPayload();
var Animated = class {
  constructor() {
    setAnimated(this, this);
  }
  /** Get every `AnimatedValue` used by this node. */
  getPayload() {
    return this.payload || [];
  }
};
var AnimatedValue = class _AnimatedValue extends Animated {
  constructor(_value) {
    super();
    this._value = _value;
    this.done = true;
    this.durationProgress = 0;
    if (is.num(this._value)) {
      this.lastPosition = this._value;
    }
  }
  /** @internal */
  static create(value) {
    return new _AnimatedValue(value);
  }
  getPayload() {
    return [this];
  }
  getValue() {
    return this._value;
  }
  setValue(value, step) {
    if (is.num(value)) {
      this.lastPosition = value;
      if (step) {
        value = Math.round(value / step) * step;
        if (this.done) {
          this.lastPosition = value;
        }
      }
    }
    if (this._value === value) {
      return false;
    }
    this._value = value;
    return true;
  }
  reset() {
    const { done } = this;
    this.done = false;
    if (is.num(this._value)) {
      this.elapsedTime = 0;
      this.durationProgress = 0;
      this.lastPosition = this._value;
      if (done) this.lastVelocity = null;
      this.v0 = null;
    }
  }
};
var AnimatedString = class _AnimatedString extends AnimatedValue {
  constructor(value) {
    super(0);
    this._string = null;
    this._toString = createInterpolator({
      output: [value, value]
    });
  }
  /** @internal */
  static create(value) {
    return new _AnimatedString(value);
  }
  getValue() {
    const value = this._string;
    return value == null ? this._string = this._toString(this._value) : value;
  }
  setValue(value) {
    if (is.str(value)) {
      if (value == this._string) {
        return false;
      }
      this._string = value;
      this._value = 1;
    } else if (super.setValue(value)) {
      this._string = null;
    } else {
      return false;
    }
    return true;
  }
  reset(goal) {
    if (goal) {
      this._toString = createInterpolator({
        output: [this.getValue(), goal]
      });
    }
    this._value = 0;
    super.reset();
  }
};
var TreeContext = { dependencies: null };
var AnimatedObject = class extends Animated {
  constructor(source) {
    super();
    this.source = source;
    this.setValue(source);
  }
  getValue(animated2) {
    const values = {};
    eachProp(this.source, (source, key) => {
      if (isAnimated(source)) {
        values[key] = source.getValue(animated2);
      } else if (hasFluidValue(source)) {
        values[key] = getFluidValue(source);
      } else if (!animated2) {
        values[key] = source;
      }
    });
    return values;
  }
  /** Replace the raw object data */
  setValue(source) {
    this.source = source;
    this.payload = this._makePayload(source);
  }
  reset() {
    if (this.payload) {
      each(this.payload, (node) => node.reset());
    }
  }
  /** Create a payload set. */
  _makePayload(source) {
    if (source) {
      const payload = /* @__PURE__ */ new Set();
      eachProp(source, this._addToPayload, payload);
      return Array.from(payload);
    }
  }
  /** Add to a payload set. */
  _addToPayload(source) {
    if (TreeContext.dependencies && hasFluidValue(source)) {
      TreeContext.dependencies.add(source);
    }
    const payload = getPayload(source);
    if (payload) {
      each(payload, (node) => this.add(node));
    }
  }
};
var AnimatedArray = class _AnimatedArray extends AnimatedObject {
  constructor(source) {
    super(source);
  }
  /** @internal */
  static create(source) {
    return new _AnimatedArray(source);
  }
  getValue() {
    return this.source.map((node) => node.getValue());
  }
  setValue(source) {
    const payload = this.getPayload();
    if (source.length == payload.length) {
      return payload.map((node, i5) => node.setValue(source[i5])).some(Boolean);
    }
    super.setValue(source.map(makeAnimated));
    return true;
  }
};
function makeAnimated(value) {
  const nodeType = isAnimatedString(value) ? AnimatedString : AnimatedValue;
  return nodeType.create(value);
}
function getAnimatedType(value) {
  const parentNode = getAnimated(value);
  return parentNode ? parentNode.constructor : is.arr(value) ? AnimatedArray : isAnimatedString(value) ? AnimatedString : AnimatedValue;
}
var withAnimated = (Component2, host2) => {
  const hasInstance = (
    // Function components must use "forwardRef" to avoid being
    // re-rendered on every animation frame.
    !is.fun(Component2) || Component2.prototype && Component2.prototype.isReactComponent
  );
  return (0, import_react9.forwardRef)((givenProps, givenRef) => {
    const instanceRef = (0, import_react9.useRef)(null);
    const ref = hasInstance && // eslint-disable-next-line react-hooks/rules-of-hooks
    (0, import_react9.useCallback)(
      (value) => {
        instanceRef.current = updateRef(givenRef, value);
      },
      [givenRef]
    );
    const [props, deps] = getAnimatedState(givenProps, host2);
    const forceUpdate = useForceUpdate();
    const callback = () => {
      const instance = instanceRef.current;
      if (hasInstance && !instance) {
        return;
      }
      const didUpdate = instance ? host2.applyAnimatedValues(instance, props.getValue(true)) : false;
      if (didUpdate === false) {
        forceUpdate();
      }
    };
    const observer = new PropsObserver(callback, deps);
    const observerRef = (0, import_react9.useRef)(void 0);
    useIsomorphicLayoutEffect(() => {
      observerRef.current = observer;
      each(deps, (dep) => addFluidObserver(dep, observer));
      return () => {
        if (observerRef.current) {
          each(
            observerRef.current.deps,
            (dep) => removeFluidObserver(dep, observerRef.current)
          );
          raf.cancel(observerRef.current.update);
        }
      };
    });
    (0, import_react9.useEffect)(callback, []);
    useOnce(() => () => {
      const observer2 = observerRef.current;
      each(observer2.deps, (dep) => removeFluidObserver(dep, observer2));
    });
    const usedProps = host2.getComponentProps(props.getValue());
    return React.createElement(Component2, { ...usedProps, ref });
  });
};
var PropsObserver = class {
  constructor(update3, deps) {
    this.update = update3;
    this.deps = deps;
  }
  eventObserved(event) {
    if (event.type == "change") {
      raf.write(this.update);
    }
  }
};
function getAnimatedState(props, host2) {
  const dependencies = /* @__PURE__ */ new Set();
  TreeContext.dependencies = dependencies;
  if (props.style)
    props = {
      ...props,
      style: host2.createAnimatedStyle(props.style)
    };
  props = new AnimatedObject(props);
  TreeContext.dependencies = null;
  return [props, dependencies];
}
function updateRef(ref, value) {
  if (ref) {
    if (is.fun(ref)) ref(value);
    else ref.current = value;
  }
  return value;
}
var cacheKey = Symbol.for("AnimatedComponent");
var createHost = (components, {
  applyAnimatedValues: applyAnimatedValues2 = () => false,
  createAnimatedStyle = (style) => new AnimatedObject(style),
  getComponentProps = (props) => props
} = {}) => {
  const hostConfig = {
    applyAnimatedValues: applyAnimatedValues2,
    createAnimatedStyle,
    getComponentProps
  };
  const animated2 = (Component2) => {
    const displayName = getDisplayName(Component2) || "Anonymous";
    if (is.str(Component2)) {
      Component2 = animated2[Component2] || (animated2[Component2] = withAnimated(Component2, hostConfig));
    } else {
      Component2 = Component2[cacheKey] || (Component2[cacheKey] = withAnimated(Component2, hostConfig));
    }
    Component2.displayName = `Animated(${displayName})`;
    return Component2;
  };
  eachProp(components, (Component2, key) => {
    if (is.arr(components)) {
      key = getDisplayName(Component2);
    }
    animated2[key] = animated2(Component2);
  });
  return {
    animated: animated2
  };
};
var getDisplayName = (arg) => is.str(arg) ? arg : arg && is.str(arg.displayName) ? arg.displayName : is.fun(arg) && arg.name || null;

// node_modules/@react-spring/core/dist/react-spring_core.modern.mjs
var React2 = __toESM(require_react(), 1);
var import_react11 = __toESM(require_react(), 1);
var import_react12 = __toESM(require_react(), 1);
var React22 = __toESM(require_react(), 1);
var import_react13 = __toESM(require_react(), 1);
var import_react14 = __toESM(require_react(), 1);
function callProp(value, ...args) {
  return is.fun(value) ? value(...args) : value;
}
var matchProp = (value, key) => value === true || !!(key && value && (is.fun(value) ? value(key) : toArray(value).includes(key)));
var resolveProp = (prop, key) => is.obj(prop) ? key && prop[key] : prop;
var getDefaultProp = (props, key) => props.default === true ? props[key] : props.default ? props.default[key] : void 0;
var noopTransform = (value) => value;
var getDefaultProps = (props, transform = noopTransform) => {
  let keys = DEFAULT_PROPS;
  if (props.default && props.default !== true) {
    props = props.default;
    keys = Object.keys(props);
  }
  const defaults2 = {};
  for (const key of keys) {
    const value = transform(props[key], key);
    if (!is.und(value)) {
      defaults2[key] = value;
    }
  }
  return defaults2;
};
var DEFAULT_PROPS = [
  "config",
  "onProps",
  "onStart",
  "onChange",
  "onPause",
  "onResume",
  "onRest"
];
var RESERVED_PROPS = {
  config: 1,
  from: 1,
  to: 1,
  ref: 1,
  loop: 1,
  reset: 1,
  pause: 1,
  cancel: 1,
  reverse: 1,
  immediate: 1,
  default: 1,
  delay: 1,
  onProps: 1,
  onStart: 1,
  onChange: 1,
  onPause: 1,
  onResume: 1,
  onRest: 1,
  onResolve: 1,
  // Transition props
  items: 1,
  trail: 1,
  sort: 1,
  expires: 1,
  initial: 1,
  enter: 1,
  update: 1,
  leave: 1,
  children: 1,
  onDestroyed: 1,
  // Internal props
  keys: 1,
  callId: 1,
  parentId: 1
};
function getForwardProps(props) {
  const forward = {};
  let count2 = 0;
  eachProp(props, (value, prop) => {
    if (!RESERVED_PROPS[prop]) {
      forward[prop] = value;
      count2++;
    }
  });
  if (count2) {
    return forward;
  }
}
function inferTo(props) {
  const to22 = getForwardProps(props);
  if (to22) {
    const out = { to: to22 };
    eachProp(props, (val, key) => key in to22 || (out[key] = val));
    return out;
  }
  return { ...props };
}
function computeGoal(value) {
  value = getFluidValue(value);
  return is.arr(value) ? value.map(computeGoal) : isAnimatedString(value) ? globals_exports.createStringInterpolator({
    range: [0, 1],
    output: [value, value]
  })(1) : value;
}
function hasProps(props) {
  for (const _2 in props) return true;
  return false;
}
function isAsyncTo(to22) {
  return is.fun(to22) || is.arr(to22) && is.obj(to22[0]);
}
function detachRefs(ctrl, ref) {
  ctrl.ref?.delete(ctrl);
  ref?.delete(ctrl);
}
function replaceRef(ctrl, ref) {
  if (ref && ctrl.ref !== ref) {
    ctrl.ref?.delete(ctrl);
    ref.add(ctrl);
    ctrl.ref = ref;
  }
}
var config = {
  default: { tension: 170, friction: 26 },
  gentle: { tension: 120, friction: 14 },
  wobbly: { tension: 180, friction: 12 },
  stiff: { tension: 210, friction: 20 },
  slow: { tension: 280, friction: 60 },
  molasses: { tension: 280, friction: 120 }
};
var defaults = {
  ...config.default,
  mass: 1,
  damping: 1,
  easing: easings.linear,
  clamp: false
};
var AnimationConfig = class {
  constructor() {
    this.velocity = 0;
    Object.assign(this, defaults);
  }
};
function mergeConfig(config2, newConfig, defaultConfig) {
  if (defaultConfig) {
    defaultConfig = { ...defaultConfig };
    sanitizeConfig(defaultConfig, newConfig);
    newConfig = { ...defaultConfig, ...newConfig };
  }
  sanitizeConfig(config2, newConfig);
  Object.assign(config2, newConfig);
  for (const key in defaults) {
    if (config2[key] == null) {
      config2[key] = defaults[key];
    }
  }
  let { frequency, damping } = config2;
  const { mass } = config2;
  if (!is.und(frequency)) {
    if (frequency < 0.01) frequency = 0.01;
    if (damping < 0) damping = 0;
    config2.tension = Math.pow(2 * Math.PI / frequency, 2) * mass;
    config2.friction = 4 * Math.PI * damping * mass / frequency;
  }
  return config2;
}
function sanitizeConfig(config2, props) {
  if (!is.und(props.decay)) {
    config2.duration = void 0;
  } else {
    const isTensionConfig = !is.und(props.tension) || !is.und(props.friction);
    if (isTensionConfig || !is.und(props.frequency) || !is.und(props.damping) || !is.und(props.mass)) {
      config2.duration = void 0;
      config2.decay = void 0;
    }
    if (isTensionConfig) {
      config2.frequency = void 0;
    }
  }
}
var emptyArray = [];
var Animation = class {
  constructor() {
    this.changed = false;
    this.values = emptyArray;
    this.toValues = null;
    this.fromValues = emptyArray;
    this.config = new AnimationConfig();
    this.immediate = false;
  }
};
function scheduleProps(callId, { key, props, defaultProps, state, actions }) {
  return new Promise((resolve, reject) => {
    let delay;
    let timeout;
    let cancel = matchProp(props.cancel ?? defaultProps?.cancel, key);
    if (cancel) {
      onStart();
    } else {
      if (!is.und(props.pause)) {
        state.paused = matchProp(props.pause, key);
      }
      let pause = defaultProps?.pause;
      if (pause !== true) {
        pause = state.paused || matchProp(pause, key);
      }
      delay = callProp(props.delay || 0, key);
      if (pause) {
        state.resumeQueue.add(onResume);
        actions.pause();
      } else {
        actions.resume();
        onResume();
      }
    }
    function onPause() {
      state.resumeQueue.add(onResume);
      state.timeouts.delete(timeout);
      timeout.cancel();
      delay = timeout.time - raf.now();
    }
    function onResume() {
      if (delay > 0 && !globals_exports.skipAnimation) {
        state.delayed = true;
        timeout = raf.setTimeout(onStart, delay);
        state.pauseQueue.add(onPause);
        state.timeouts.add(timeout);
      } else {
        onStart();
      }
    }
    function onStart() {
      if (state.delayed) {
        state.delayed = false;
      }
      state.pauseQueue.delete(onPause);
      state.timeouts.delete(timeout);
      if (callId <= (state.cancelId || 0)) {
        cancel = true;
      }
      try {
        actions.start({ ...props, callId, cancel }, resolve);
      } catch (err) {
        reject(err);
      }
    }
  });
}
var getCombinedResult = (target, results) => results.length == 1 ? results[0] : results.some((result) => result.cancelled) ? getCancelledResult(target.get()) : results.every((result) => result.noop) ? getNoopResult(target.get()) : getFinishedResult(
  target.get(),
  results.every((result) => result.finished)
);
var getNoopResult = (value) => ({
  value,
  noop: true,
  finished: true,
  cancelled: false
});
var getFinishedResult = (value, finished, cancelled = false) => ({
  value,
  finished,
  cancelled
});
var getCancelledResult = (value) => ({
  value,
  cancelled: true,
  finished: false
});
function runAsync(to22, props, state, target) {
  const { callId, parentId, onRest } = props;
  const { asyncTo: prevTo, promise: prevPromise } = state;
  if (!parentId && to22 === prevTo && !props.reset) {
    return prevPromise;
  }
  return state.promise = (async () => {
    state.asyncId = callId;
    state.asyncTo = to22;
    const defaultProps = getDefaultProps(
      props,
      (value, key) => (
        // The `onRest` prop is only called when the `runAsync` promise is resolved.
        key === "onRest" ? void 0 : value
      )
    );
    let preventBail;
    let bail;
    const bailPromise = new Promise(
      (resolve, reject) => (preventBail = resolve, bail = reject)
    );
    const bailIfEnded = (bailSignal) => {
      const bailResult = (
        // The `cancel` prop or `stop` method was used.
        callId <= (state.cancelId || 0) && getCancelledResult(target) || // The async `to` prop was replaced.
        callId !== state.asyncId && getFinishedResult(target, false)
      );
      if (bailResult) {
        bailSignal.result = bailResult;
        bail(bailSignal);
        throw bailSignal;
      }
    };
    const animate = (arg1, arg2) => {
      const bailSignal = new BailSignal();
      const skipAnimationSignal = new SkipAnimationSignal();
      return (async () => {
        if (globals_exports.skipAnimation) {
          stopAsync(state);
          skipAnimationSignal.result = getFinishedResult(target, false);
          bail(skipAnimationSignal);
          throw skipAnimationSignal;
        }
        bailIfEnded(bailSignal);
        const props2 = is.obj(arg1) ? { ...arg1 } : { ...arg2, to: arg1 };
        props2.parentId = callId;
        eachProp(defaultProps, (value, key) => {
          if (is.und(props2[key])) {
            props2[key] = value;
          }
        });
        const result2 = await target.start(props2);
        bailIfEnded(bailSignal);
        if (state.paused) {
          await new Promise((resume) => {
            state.resumeQueue.add(resume);
          });
        }
        return result2;
      })();
    };
    let result;
    if (globals_exports.skipAnimation) {
      stopAsync(state);
      return getFinishedResult(target, false);
    }
    try {
      let animating;
      if (is.arr(to22)) {
        animating = (async (queue) => {
          for (const props2 of queue) {
            await animate(props2);
          }
        })(to22);
      } else {
        animating = Promise.resolve(to22(animate, target.stop.bind(target)));
      }
      await Promise.all([animating.then(preventBail), bailPromise]);
      result = getFinishedResult(target.get(), true, false);
    } catch (err) {
      if (err instanceof BailSignal) {
        result = err.result;
      } else if (err instanceof SkipAnimationSignal) {
        result = err.result;
      } else {
        throw err;
      }
    } finally {
      if (callId == state.asyncId) {
        state.asyncId = parentId;
        state.asyncTo = parentId ? prevTo : void 0;
        state.promise = parentId ? prevPromise : void 0;
      }
    }
    if (is.fun(onRest)) {
      raf.batchedUpdates(() => {
        onRest(result, target, target.item);
      });
    }
    return result;
  })();
}
function stopAsync(state, cancelId) {
  flush(state.timeouts, (t5) => t5.cancel());
  state.pauseQueue.clear();
  state.resumeQueue.clear();
  state.asyncId = state.asyncTo = state.promise = void 0;
  if (cancelId) state.cancelId = cancelId;
}
var BailSignal = class extends Error {
  constructor() {
    super(
      "An async animation has been interrupted. You see this error because you forgot to use `await` or `.catch(...)` on its returned promise."
    );
  }
};
var SkipAnimationSignal = class extends Error {
  constructor() {
    super("SkipAnimationSignal");
  }
};
var isFrameValue = (value) => value instanceof FrameValue;
var nextId = 1;
var FrameValue = class extends FluidValue {
  constructor() {
    super(...arguments);
    this.id = nextId++;
    this._priority = 0;
  }
  get priority() {
    return this._priority;
  }
  set priority(priority2) {
    if (this._priority != priority2) {
      this._priority = priority2;
      this._onPriorityChange(priority2);
    }
  }
  /** Get the current value */
  get() {
    const node = getAnimated(this);
    return node && node.getValue();
  }
  /** Create a spring that maps our value to another value */
  to(...args) {
    return globals_exports.to(this, args);
  }
  /** @deprecated Use the `to` method instead. */
  interpolate(...args) {
    deprecateInterpolate();
    return globals_exports.to(this, args);
  }
  toJSON() {
    return this.get();
  }
  observerAdded(count2) {
    if (count2 == 1) this._attach();
  }
  observerRemoved(count2) {
    if (count2 == 0) this._detach();
  }
  /** Called when the first child is added. */
  _attach() {
  }
  /** Called when the last child is removed. */
  _detach() {
  }
  /** Tell our children about our new value */
  _onChange(value, idle = false) {
    callFluidObservers(this, {
      type: "change",
      parent: this,
      value,
      idle
    });
  }
  /** Tell our children about our new priority */
  _onPriorityChange(priority2) {
    if (!this.idle) {
      frameLoop.sort(this);
    }
    callFluidObservers(this, {
      type: "priority",
      parent: this,
      priority: priority2
    });
  }
};
var $P = Symbol.for("SpringPhase");
var HAS_ANIMATED = 1;
var IS_ANIMATING = 2;
var IS_PAUSED = 4;
var hasAnimated = (target) => (target[$P] & HAS_ANIMATED) > 0;
var isAnimating = (target) => (target[$P] & IS_ANIMATING) > 0;
var isPaused = (target) => (target[$P] & IS_PAUSED) > 0;
var setActiveBit = (target, active) => active ? target[$P] |= IS_ANIMATING | HAS_ANIMATED : target[$P] &= ~IS_ANIMATING;
var setPausedBit = (target, paused) => paused ? target[$P] |= IS_PAUSED : target[$P] &= ~IS_PAUSED;
var SpringValue = class extends FrameValue {
  constructor(arg1, arg2) {
    super();
    this.animation = new Animation();
    this.defaultProps = {};
    this._state = {
      paused: false,
      delayed: false,
      pauseQueue: /* @__PURE__ */ new Set(),
      resumeQueue: /* @__PURE__ */ new Set(),
      timeouts: /* @__PURE__ */ new Set()
    };
    this._pendingCalls = /* @__PURE__ */ new Set();
    this._lastCallId = 0;
    this._lastToId = 0;
    this._memoizedDuration = 0;
    if (!is.und(arg1) || !is.und(arg2)) {
      const props = is.obj(arg1) ? { ...arg1 } : { ...arg2, from: arg1 };
      if (is.und(props.default)) {
        props.default = true;
      }
      this.start(props);
    }
  }
  /** Equals true when not advancing on each frame. */
  get idle() {
    return !(isAnimating(this) || this._state.asyncTo) || isPaused(this);
  }
  get goal() {
    return getFluidValue(this.animation.to);
  }
  get velocity() {
    const node = getAnimated(this);
    return node instanceof AnimatedValue ? node.lastVelocity || 0 : node.getPayload().map((node2) => node2.lastVelocity || 0);
  }
  /**
   * When true, this value has been animated at least once.
   */
  get hasAnimated() {
    return hasAnimated(this);
  }
  /**
   * When true, this value has an unfinished animation,
   * which is either active or paused.
   */
  get isAnimating() {
    return isAnimating(this);
  }
  /**
   * When true, all current and future animations are paused.
   */
  get isPaused() {
    return isPaused(this);
  }
  /**
   *
   *
   */
  get isDelayed() {
    return this._state.delayed;
  }
  /** Advance the current animation by a number of milliseconds */
  advance(dt2) {
    let idle = true;
    let changed = false;
    const anim = this.animation;
    let { toValues } = anim;
    const { config: config2 } = anim;
    const payload = getPayload(anim.to);
    if (!payload && hasFluidValue(anim.to)) {
      toValues = toArray(getFluidValue(anim.to));
    }
    anim.values.forEach((node2, i5) => {
      if (node2.done) return;
      const to22 = (
        // Animated strings always go from 0 to 1.
        node2.constructor == AnimatedString ? 1 : payload ? payload[i5].lastPosition : toValues[i5]
      );
      let finished = anim.immediate;
      let position = to22;
      if (!finished) {
        position = node2.lastPosition;
        if (config2.tension <= 0) {
          node2.done = true;
          return;
        }
        let elapsed = node2.elapsedTime += dt2;
        const from = anim.fromValues[i5];
        const v0 = node2.v0 != null ? node2.v0 : node2.v0 = is.arr(config2.velocity) ? config2.velocity[i5] : config2.velocity;
        let velocity;
        const precision = config2.precision || (from == to22 ? 5e-3 : Math.min(1, Math.abs(to22 - from) * 1e-3));
        if (!is.und(config2.duration)) {
          let p3 = 1;
          if (config2.duration > 0) {
            if (this._memoizedDuration !== config2.duration) {
              this._memoizedDuration = config2.duration;
              if (node2.durationProgress > 0) {
                node2.elapsedTime = config2.duration * node2.durationProgress;
                elapsed = node2.elapsedTime += dt2;
              }
            }
            p3 = (config2.progress || 0) + elapsed / this._memoizedDuration;
            p3 = p3 > 1 ? 1 : p3 < 0 ? 0 : p3;
            node2.durationProgress = p3;
          }
          position = from + config2.easing(p3) * (to22 - from);
          velocity = (position - node2.lastPosition) / dt2;
          finished = p3 == 1;
        } else if (config2.decay) {
          const decay = config2.decay === true ? 0.998 : config2.decay;
          const e7 = Math.exp(-(1 - decay) * elapsed);
          position = from + v0 / (1 - decay) * (1 - e7);
          finished = Math.abs(node2.lastPosition - position) <= precision;
          velocity = v0 * e7;
        } else {
          velocity = node2.lastVelocity == null ? v0 : node2.lastVelocity;
          const restVelocity = config2.restVelocity || precision / 10;
          const bounceFactor = config2.clamp ? 0 : config2.bounce;
          const canBounce = !is.und(bounceFactor);
          const isGrowing = from == to22 ? node2.v0 > 0 : from < to22;
          let isMoving;
          let isBouncing = false;
          const step = 1;
          const numSteps = Math.ceil(dt2 / step);
          for (let n6 = 0; n6 < numSteps; ++n6) {
            isMoving = Math.abs(velocity) > restVelocity;
            if (!isMoving) {
              finished = Math.abs(to22 - position) <= precision;
              if (finished) {
                break;
              }
            }
            if (canBounce) {
              isBouncing = position == to22 || position > to22 == isGrowing;
              if (isBouncing) {
                velocity = -velocity * bounceFactor;
                position = to22;
              }
            }
            const springForce = -config2.tension * 1e-6 * (position - to22);
            const dampingForce = -config2.friction * 1e-3 * velocity;
            const acceleration = (springForce + dampingForce) / config2.mass;
            velocity = velocity + acceleration * step;
            position = position + velocity * step;
          }
        }
        node2.lastVelocity = velocity;
        if (Number.isNaN(position)) {
          console.warn(`Got NaN while animating:`, this);
          finished = true;
        }
      }
      if (payload && !payload[i5].done) {
        finished = false;
      }
      if (finished) {
        node2.done = true;
      } else {
        idle = false;
      }
      if (node2.setValue(position, config2.round)) {
        changed = true;
      }
    });
    const node = getAnimated(this);
    const currVal = node.getValue();
    if (idle) {
      const finalVal = getFluidValue(anim.to);
      if ((currVal !== finalVal || changed) && !config2.decay) {
        node.setValue(finalVal);
        this._onChange(finalVal);
      } else if (changed && config2.decay) {
        this._onChange(currVal);
      }
      this._stop();
    } else if (changed) {
      this._onChange(currVal);
    }
  }
  /** Set the current value, while stopping the current animation */
  set(value) {
    raf.batchedUpdates(() => {
      this._stop();
      this._focus(value);
      this._set(value);
    });
    return this;
  }
  /**
   * Freeze the active animation in time, as well as any updates merged
   * before `resume` is called.
   */
  pause() {
    this._update({ pause: true });
  }
  /** Resume the animation if paused. */
  resume() {
    this._update({ pause: false });
  }
  /** Skip to the end of the current animation. */
  finish() {
    if (isAnimating(this)) {
      const { to: to22, config: config2 } = this.animation;
      raf.batchedUpdates(() => {
        this._onStart();
        if (!config2.decay) {
          this._set(to22, false);
        }
        this._stop();
      });
    }
    return this;
  }
  /** Push props into the pending queue. */
  update(props) {
    const queue = this.queue || (this.queue = []);
    queue.push(props);
    return this;
  }
  start(to22, arg2) {
    let queue;
    if (!is.und(to22)) {
      queue = [is.obj(to22) ? to22 : { ...arg2, to: to22 }];
    } else {
      queue = this.queue || [];
      this.queue = [];
    }
    return Promise.all(
      queue.map((props) => {
        const up = this._update(props);
        return up;
      })
    ).then((results) => getCombinedResult(this, results));
  }
  /**
   * Stop the current animation, and cancel any delayed updates.
   *
   * Pass `true` to call `onRest` with `cancelled: true`.
   */
  stop(cancel) {
    const { to: to22 } = this.animation;
    this._focus(this.get());
    stopAsync(this._state, cancel && this._lastCallId);
    raf.batchedUpdates(() => this._stop(to22, cancel));
    return this;
  }
  /** Restart the animation. */
  reset() {
    this._update({ reset: true });
  }
  /** @internal */
  eventObserved(event) {
    if (event.type == "change") {
      this._start();
    } else if (event.type == "priority") {
      this.priority = event.priority + 1;
    }
  }
  /**
   * Parse the `to` and `from` range from the given `props` object.
   *
   * This also ensures the initial value is available to animated components
   * during the render phase.
   */
  _prepareNode(props) {
    const key = this.key || "";
    let { to: to22, from } = props;
    to22 = is.obj(to22) ? to22[key] : to22;
    if (to22 == null || isAsyncTo(to22)) {
      to22 = void 0;
    }
    from = is.obj(from) ? from[key] : from;
    if (from == null) {
      from = void 0;
    }
    const range = { to: to22, from };
    if (!hasAnimated(this)) {
      if (props.reverse) [to22, from] = [from, to22];
      from = getFluidValue(from);
      if (!is.und(from)) {
        this._set(from);
      } else if (!getAnimated(this)) {
        this._set(to22);
      }
    }
    return range;
  }
  /** Every update is processed by this method before merging. */
  _update({ ...props }, isLoop) {
    const { key, defaultProps } = this;
    if (props.default)
      Object.assign(
        defaultProps,
        getDefaultProps(
          props,
          (value, prop) => /^on/.test(prop) ? resolveProp(value, key) : value
        )
      );
    mergeActiveFn(this, props, "onProps");
    sendEvent(this, "onProps", props, this);
    const range = this._prepareNode(props);
    if (Object.isFrozen(this)) {
      throw Error(
        "Cannot animate a `SpringValue` object that is frozen. Did you forget to pass your component to `animated(...)` before animating its props?"
      );
    }
    const state = this._state;
    return scheduleProps(++this._lastCallId, {
      key,
      props,
      defaultProps,
      state,
      actions: {
        pause: () => {
          if (!isPaused(this)) {
            setPausedBit(this, true);
            flushCalls(state.pauseQueue);
            sendEvent(
              this,
              "onPause",
              getFinishedResult(this, checkFinished(this, this.animation.to)),
              this
            );
          }
        },
        resume: () => {
          if (isPaused(this)) {
            setPausedBit(this, false);
            if (isAnimating(this)) {
              this._resume();
            }
            flushCalls(state.resumeQueue);
            sendEvent(
              this,
              "onResume",
              getFinishedResult(this, checkFinished(this, this.animation.to)),
              this
            );
          }
        },
        start: this._merge.bind(this, range)
      }
    }).then((result) => {
      if (props.loop && result.finished && !(isLoop && result.noop)) {
        const nextProps = createLoopUpdate(props);
        if (nextProps) {
          return this._update(nextProps, true);
        }
      }
      return result;
    });
  }
  /** Merge props into the current animation */
  _merge(range, props, resolve) {
    if (props.cancel) {
      this.stop(true);
      return resolve(getCancelledResult(this));
    }
    const hasToProp = !is.und(range.to);
    const hasFromProp = !is.und(range.from);
    if (hasToProp || hasFromProp) {
      if (props.callId > this._lastToId) {
        this._lastToId = props.callId;
      } else {
        return resolve(getCancelledResult(this));
      }
    }
    const { key, defaultProps, animation: anim } = this;
    const { to: prevTo, from: prevFrom } = anim;
    let { to: to22 = prevTo, from = prevFrom } = range;
    if (hasFromProp && !hasToProp && (!props.default || is.und(to22))) {
      to22 = from;
    }
    if (props.reverse) [to22, from] = [from, to22];
    const hasFromChanged = !isEqual(from, prevFrom);
    if (hasFromChanged) {
      anim.from = from;
    }
    from = getFluidValue(from);
    const hasToChanged = !isEqual(to22, prevTo);
    if (hasToChanged) {
      this._focus(to22);
    }
    const hasAsyncTo = isAsyncTo(props.to);
    const { config: config2 } = anim;
    const { decay, velocity } = config2;
    if (hasToProp || hasFromProp) {
      config2.velocity = 0;
    }
    if (props.config && !hasAsyncTo) {
      mergeConfig(
        config2,
        callProp(props.config, key),
        // Avoid calling the same "config" prop twice.
        props.config !== defaultProps.config ? callProp(defaultProps.config, key) : void 0
      );
    }
    let node = getAnimated(this);
    if (!node || is.und(to22)) {
      return resolve(getFinishedResult(this, true));
    }
    const reset = (
      // When `reset` is undefined, the `from` prop implies `reset: true`,
      // except for declarative updates. When `reset` is defined, there
      // must exist a value to animate from.
      is.und(props.reset) ? hasFromProp && !props.default : !is.und(from) && matchProp(props.reset, key)
    );
    const value = reset ? from : this.get();
    const goal = computeGoal(to22);
    const isAnimatable = is.num(goal) || is.arr(goal) || isAnimatedString(goal);
    const immediate = !hasAsyncTo && (!isAnimatable || matchProp(defaultProps.immediate || props.immediate, key));
    if (hasToChanged) {
      const nodeType = getAnimatedType(to22);
      if (nodeType !== node.constructor) {
        if (immediate) {
          node = this._set(goal);
        } else
          throw Error(
            `Cannot animate between ${node.constructor.name} and ${nodeType.name}, as the "to" prop suggests`
          );
      }
    }
    const goalType = node.constructor;
    let started = hasFluidValue(to22);
    let finished = false;
    if (!started) {
      const hasValueChanged = reset || !hasAnimated(this) && hasFromChanged;
      if (hasToChanged || hasValueChanged) {
        finished = isEqual(computeGoal(value), goal);
        started = !finished;
      }
      if (!isEqual(anim.immediate, immediate) && !immediate || !isEqual(config2.decay, decay) || !isEqual(config2.velocity, velocity)) {
        started = true;
      }
    }
    if (finished && isAnimating(this)) {
      if (anim.changed && !reset) {
        started = true;
      } else if (!started) {
        this._stop(prevTo);
      }
    }
    if (!hasAsyncTo) {
      if (started || hasFluidValue(prevTo)) {
        anim.values = node.getPayload();
        anim.toValues = hasFluidValue(to22) ? null : goalType == AnimatedString ? [1] : toArray(goal);
      }
      if (anim.immediate != immediate) {
        anim.immediate = immediate;
        if (!immediate && !reset) {
          this._set(prevTo);
        }
      }
      if (started) {
        const { onRest } = anim;
        each(ACTIVE_EVENTS, (type) => mergeActiveFn(this, props, type));
        const result = getFinishedResult(this, checkFinished(this, prevTo));
        flushCalls(this._pendingCalls, result);
        this._pendingCalls.add(resolve);
        if (anim.changed)
          raf.batchedUpdates(() => {
            anim.changed = !reset;
            onRest?.(result, this);
            if (reset) {
              callProp(defaultProps.onRest, result);
            } else {
              anim.onStart?.(result, this);
            }
          });
      }
    }
    if (reset) {
      this._set(value);
    }
    if (hasAsyncTo) {
      resolve(runAsync(props.to, props, this._state, this));
    } else if (started) {
      this._start();
    } else if (isAnimating(this) && !hasToChanged) {
      this._pendingCalls.add(resolve);
    } else {
      resolve(getNoopResult(value));
    }
  }
  /** Update the `animation.to` value, which might be a `FluidValue` */
  _focus(value) {
    const anim = this.animation;
    if (value !== anim.to) {
      if (getFluidObservers(this)) {
        this._detach();
      }
      anim.to = value;
      if (getFluidObservers(this)) {
        this._attach();
      }
    }
  }
  _attach() {
    let priority2 = 0;
    const { to: to22 } = this.animation;
    if (hasFluidValue(to22)) {
      addFluidObserver(to22, this);
      if (isFrameValue(to22)) {
        priority2 = to22.priority + 1;
      }
    }
    this.priority = priority2;
  }
  _detach() {
    const { to: to22 } = this.animation;
    if (hasFluidValue(to22)) {
      removeFluidObserver(to22, this);
    }
  }
  /**
   * Update the current value from outside the frameloop,
   * and return the `Animated` node.
   */
  _set(arg, idle = true) {
    const value = getFluidValue(arg);
    if (!is.und(value)) {
      const oldNode = getAnimated(this);
      if (!oldNode || !isEqual(value, oldNode.getValue())) {
        const nodeType = getAnimatedType(value);
        if (!oldNode || oldNode.constructor != nodeType) {
          setAnimated(this, nodeType.create(value));
        } else {
          oldNode.setValue(value);
        }
        if (oldNode) {
          raf.batchedUpdates(() => {
            this._onChange(value, idle);
          });
        }
      }
    }
    return getAnimated(this);
  }
  _onStart() {
    const anim = this.animation;
    if (!anim.changed) {
      anim.changed = true;
      sendEvent(
        this,
        "onStart",
        getFinishedResult(this, checkFinished(this, anim.to)),
        this
      );
    }
  }
  _onChange(value, idle) {
    if (!idle) {
      this._onStart();
      callProp(this.animation.onChange, value, this);
    }
    callProp(this.defaultProps.onChange, value, this);
    super._onChange(value, idle);
  }
  // This method resets the animation state (even if already animating) to
  // ensure the latest from/to range is used, and it also ensures this spring
  // is added to the frameloop.
  _start() {
    const anim = this.animation;
    getAnimated(this).reset(getFluidValue(anim.to));
    if (!anim.immediate) {
      anim.fromValues = anim.values.map((node) => node.lastPosition);
    }
    if (!isAnimating(this)) {
      setActiveBit(this, true);
      if (!isPaused(this)) {
        this._resume();
      }
    }
  }
  _resume() {
    if (globals_exports.skipAnimation) {
      this.finish();
    } else {
      frameLoop.start(this);
    }
  }
  /**
   * Exit the frameloop and notify `onRest` listeners.
   *
   * Always wrap `_stop` calls with `batchedUpdates`.
   */
  _stop(goal, cancel) {
    if (isAnimating(this)) {
      setActiveBit(this, false);
      const anim = this.animation;
      each(anim.values, (node) => {
        node.done = true;
      });
      if (anim.toValues) {
        anim.onChange = anim.onPause = anim.onResume = void 0;
      }
      callFluidObservers(this, {
        type: "idle",
        parent: this
      });
      const result = cancel ? getCancelledResult(this.get()) : getFinishedResult(this.get(), checkFinished(this, goal ?? anim.to));
      flushCalls(this._pendingCalls, result);
      if (anim.changed) {
        anim.changed = false;
        sendEvent(this, "onRest", result, this);
      }
    }
  }
};
function checkFinished(target, to22) {
  const goal = computeGoal(to22);
  const value = computeGoal(target.get());
  return isEqual(value, goal);
}
function createLoopUpdate(props, loop2 = props.loop, to22 = props.to) {
  const loopRet = callProp(loop2);
  if (loopRet) {
    const overrides = loopRet !== true && inferTo(loopRet);
    const reverse2 = (overrides || props).reverse;
    const reset = !overrides || overrides.reset;
    return createUpdate({
      ...props,
      loop: loop2,
      // Avoid updating default props when looping.
      default: false,
      // Never loop the `pause` prop.
      pause: void 0,
      // For the "reverse" prop to loop as expected, the "to" prop
      // must be undefined. The "reverse" prop is ignored when the
      // "to" prop is an array or function.
      to: !reverse2 || isAsyncTo(to22) ? to22 : void 0,
      // Ignore the "from" prop except on reset.
      from: reset ? props.from : void 0,
      reset,
      // The "loop" prop can return a "useSpring" props object to
      // override any of the original props.
      ...overrides
    });
  }
}
function createUpdate(props) {
  const { to: to22, from } = props = inferTo(props);
  const keys = /* @__PURE__ */ new Set();
  if (is.obj(to22)) findDefined(to22, keys);
  if (is.obj(from)) findDefined(from, keys);
  props.keys = keys.size ? Array.from(keys) : null;
  return props;
}
function declareUpdate(props) {
  const update22 = createUpdate(props);
  if (is.und(update22.default)) {
    update22.default = getDefaultProps(update22);
  }
  return update22;
}
function findDefined(values, keys) {
  eachProp(values, (value, key) => value != null && keys.add(key));
}
var ACTIVE_EVENTS = [
  "onStart",
  "onRest",
  "onChange",
  "onPause",
  "onResume"
];
function mergeActiveFn(target, props, type) {
  target.animation[type] = props[type] !== getDefaultProp(props, type) ? resolveProp(props[type], target.key) : void 0;
}
function sendEvent(target, type, ...args) {
  target.animation[type]?.(...args);
  target.defaultProps[type]?.(...args);
}
var BATCHED_EVENTS = ["onStart", "onChange", "onRest"];
var nextId2 = 1;
var Controller = class {
  constructor(props, flush3) {
    this.id = nextId2++;
    this.springs = {};
    this.queue = [];
    this._lastAsyncId = 0;
    this._active = /* @__PURE__ */ new Set();
    this._changed = /* @__PURE__ */ new Set();
    this._started = false;
    this._state = {
      paused: false,
      pauseQueue: /* @__PURE__ */ new Set(),
      resumeQueue: /* @__PURE__ */ new Set(),
      timeouts: /* @__PURE__ */ new Set()
    };
    this._events = {
      onStart: /* @__PURE__ */ new Map(),
      onChange: /* @__PURE__ */ new Map(),
      onRest: /* @__PURE__ */ new Map()
    };
    this._onFrame = this._onFrame.bind(this);
    if (flush3) {
      this._flush = flush3;
    }
    if (props) {
      this.start({ default: true, ...props });
    }
  }
  /**
   * Equals `true` when no spring values are in the frameloop, and
   * no async animation is currently active.
   */
  get idle() {
    return !this._state.asyncTo && Object.values(this.springs).every((spring) => {
      return spring.idle && !spring.isDelayed && !spring.isPaused;
    });
  }
  get item() {
    return this._item;
  }
  set item(item) {
    this._item = item;
  }
  /** Get the current values of our springs */
  get() {
    const values = {};
    this.each((spring, key) => values[key] = spring.get());
    return values;
  }
  /** Set the current values without animating. */
  set(values) {
    for (const key in values) {
      const value = values[key];
      if (!is.und(value)) {
        this.springs[key].set(value);
      }
    }
  }
  /** Push an update onto the queue of each value. */
  update(props) {
    if (props) {
      this.queue.push(createUpdate(props));
    }
    return this;
  }
  /**
   * Start the queued animations for every spring, and resolve the returned
   * promise once all queued animations have finished or been cancelled.
   *
   * When you pass a queue (instead of nothing), that queue is used instead of
   * the queued animations added with the `update` method, which are left alone.
   */
  start(props) {
    let { queue } = this;
    if (props) {
      queue = toArray(props).map(createUpdate);
    } else {
      this.queue = [];
    }
    if (this._flush) {
      return this._flush(this, queue);
    }
    prepareKeys(this, queue);
    return flushUpdateQueue(this, queue);
  }
  /** @internal */
  stop(arg, keys) {
    if (arg !== !!arg) {
      keys = arg;
    }
    if (keys) {
      const springs = this.springs;
      each(toArray(keys), (key) => springs[key].stop(!!arg));
    } else {
      stopAsync(this._state, this._lastAsyncId);
      this.each((spring) => spring.stop(!!arg));
    }
    return this;
  }
  /** Freeze the active animation in time */
  pause(keys) {
    if (is.und(keys)) {
      this.start({ pause: true });
    } else {
      const springs = this.springs;
      each(toArray(keys), (key) => springs[key].pause());
    }
    return this;
  }
  /** Resume the animation if paused. */
  resume(keys) {
    if (is.und(keys)) {
      this.start({ pause: false });
    } else {
      const springs = this.springs;
      each(toArray(keys), (key) => springs[key].resume());
    }
    return this;
  }
  /** Call a function once per spring value */
  each(iterator) {
    eachProp(this.springs, iterator);
  }
  /** @internal Called at the end of every animation frame */
  _onFrame() {
    const { onStart, onChange, onRest } = this._events;
    const active = this._active.size > 0;
    const changed = this._changed.size > 0;
    if (active && !this._started || changed && !this._started) {
      this._started = true;
      flush(onStart, ([onStart2, result]) => {
        result.value = this.get();
        onStart2(result, this, this._item);
      });
    }
    const idle = !active && this._started;
    const values = changed || idle && onRest.size ? this.get() : null;
    if (changed && onChange.size) {
      flush(onChange, ([onChange2, result]) => {
        result.value = values;
        onChange2(result, this, this._item);
      });
    }
    if (idle) {
      this._started = false;
      flush(onRest, ([onRest2, result]) => {
        result.value = values;
        onRest2(result, this, this._item);
      });
    }
  }
  /** @internal */
  eventObserved(event) {
    if (event.type == "change") {
      this._changed.add(event.parent);
      if (!event.idle) {
        this._active.add(event.parent);
      }
    } else if (event.type == "idle") {
      this._active.delete(event.parent);
    } else return;
    raf.onFrame(this._onFrame);
  }
};
function flushUpdateQueue(ctrl, queue) {
  return Promise.all(queue.map((props) => flushUpdate(ctrl, props))).then(
    (results) => getCombinedResult(ctrl, results)
  );
}
async function flushUpdate(ctrl, props, isLoop) {
  const { keys, to: to22, from, loop: loop2, onRest, onResolve } = props;
  const defaults2 = is.obj(props.default) && props.default;
  if (loop2) {
    props.loop = false;
  }
  if (to22 === false) props.to = null;
  if (from === false) props.from = null;
  const asyncTo = is.arr(to22) || is.fun(to22) ? to22 : void 0;
  if (asyncTo) {
    props.to = void 0;
    props.onRest = void 0;
    if (defaults2) {
      defaults2.onRest = void 0;
    }
  } else {
    each(BATCHED_EVENTS, (key) => {
      const handler = props[key];
      if (is.fun(handler)) {
        const queue = ctrl["_events"][key];
        props[key] = ({ finished, cancelled }) => {
          const result2 = queue.get(handler);
          if (result2) {
            if (!finished) result2.finished = false;
            if (cancelled) result2.cancelled = true;
          } else {
            queue.set(handler, {
              value: null,
              finished: finished || false,
              cancelled: cancelled || false
            });
          }
        };
        if (defaults2) {
          defaults2[key] = props[key];
        }
      }
    });
  }
  const state = ctrl["_state"];
  if (props.pause === !state.paused) {
    state.paused = props.pause;
    flushCalls(props.pause ? state.pauseQueue : state.resumeQueue);
  } else if (state.paused) {
    props.pause = true;
  }
  const promises = (keys || Object.keys(ctrl.springs)).map(
    (key) => ctrl.springs[key].start(props)
  );
  const cancel = props.cancel === true || getDefaultProp(props, "cancel") === true;
  if (asyncTo || cancel && state.asyncId) {
    promises.push(
      scheduleProps(++ctrl["_lastAsyncId"], {
        props,
        state,
        actions: {
          pause: noop,
          resume: noop,
          start(props2, resolve) {
            if (cancel) {
              stopAsync(state, ctrl["_lastAsyncId"]);
              resolve(getCancelledResult(ctrl));
            } else {
              props2.onRest = onRest;
              resolve(
                runAsync(
                  asyncTo,
                  props2,
                  state,
                  ctrl
                )
              );
            }
          }
        }
      })
    );
  }
  if (state.paused) {
    await new Promise((resume) => {
      state.resumeQueue.add(resume);
    });
  }
  const result = getCombinedResult(ctrl, await Promise.all(promises));
  if (loop2 && result.finished && !(isLoop && result.noop)) {
    const nextProps = createLoopUpdate(props, loop2, to22);
    if (nextProps) {
      prepareKeys(ctrl, [nextProps]);
      return flushUpdate(ctrl, nextProps, true);
    }
  }
  if (onResolve) {
    raf.batchedUpdates(() => onResolve(result, ctrl, ctrl.item));
  }
  return result;
}
function getSprings(ctrl, props) {
  const springs = { ...ctrl.springs };
  if (props) {
    each(toArray(props), (props2) => {
      if (is.und(props2.keys)) {
        props2 = createUpdate(props2);
      }
      if (!is.obj(props2.to)) {
        props2 = { ...props2, to: void 0 };
      }
      prepareSprings(springs, props2, (key) => {
        return createSpring(key);
      });
    });
  }
  setSprings(ctrl, springs);
  return springs;
}
function setSprings(ctrl, springs) {
  eachProp(springs, (spring, key) => {
    if (!ctrl.springs[key]) {
      ctrl.springs[key] = spring;
      addFluidObserver(spring, ctrl);
    }
  });
}
function createSpring(key, observer) {
  const spring = new SpringValue();
  spring.key = key;
  if (observer) {
    addFluidObserver(spring, observer);
  }
  return spring;
}
function prepareSprings(springs, props, create) {
  if (props.keys) {
    each(props.keys, (key) => {
      const spring = springs[key] || (springs[key] = create(key));
      spring["_prepareNode"](props);
    });
  }
}
function prepareKeys(ctrl, queue) {
  each(queue, (props) => {
    prepareSprings(ctrl.springs, props, (key) => {
      return createSpring(key, ctrl);
    });
  });
}
var SpringContext = React2.createContext({
  pause: false,
  immediate: false
});
var SpringRef = () => {
  const current = [];
  const SpringRef2 = function(props) {
    deprecateDirectCall();
    const results = [];
    each(current, (ctrl, i5) => {
      if (is.und(props)) {
        results.push(ctrl.start());
      } else {
        const update22 = _getProps(props, ctrl, i5);
        if (update22) {
          results.push(ctrl.start(update22));
        }
      }
    });
    return results;
  };
  SpringRef2.current = current;
  SpringRef2.add = function(ctrl) {
    if (!current.includes(ctrl)) {
      current.push(ctrl);
    }
  };
  SpringRef2.delete = function(ctrl) {
    const i5 = current.indexOf(ctrl);
    if (~i5) current.splice(i5, 1);
  };
  SpringRef2.pause = function() {
    each(current, (ctrl) => ctrl.pause(...arguments));
    return this;
  };
  SpringRef2.resume = function() {
    each(current, (ctrl) => ctrl.resume(...arguments));
    return this;
  };
  SpringRef2.set = function(values) {
    each(current, (ctrl, i5) => {
      const update22 = is.fun(values) ? values(i5, ctrl) : values;
      if (update22) {
        ctrl.set(update22);
      }
    });
  };
  SpringRef2.start = function(props) {
    const results = [];
    each(current, (ctrl, i5) => {
      if (is.und(props)) {
        results.push(ctrl.start());
      } else {
        const update22 = this._getProps(props, ctrl, i5);
        if (update22) {
          results.push(ctrl.start(update22));
        }
      }
    });
    return results;
  };
  SpringRef2.stop = function() {
    each(current, (ctrl) => ctrl.stop(...arguments));
    return this;
  };
  SpringRef2.update = function(props) {
    each(current, (ctrl, i5) => ctrl.update(this._getProps(props, ctrl, i5)));
    return this;
  };
  const _getProps = function(arg, ctrl, index2) {
    return is.fun(arg) ? arg(index2, ctrl) : arg;
  };
  SpringRef2._getProps = _getProps;
  return SpringRef2;
};
function useSprings(length, props, deps) {
  const propsFn = is.fun(props) && props;
  if (propsFn && !deps) deps = [];
  const ref = (0, import_react10.useMemo)(
    () => propsFn || arguments.length == 3 ? SpringRef() : void 0,
    []
  );
  const layoutId = (0, import_react10.useRef)(0);
  const forceUpdate = useForceUpdate();
  const state = (0, import_react10.useMemo)(
    () => ({
      ctrls: [],
      queue: [],
      flush(ctrl, updates2) {
        const springs2 = getSprings(ctrl, updates2);
        const canFlushSync = layoutId.current > 0 && !state.queue.length && !Object.keys(springs2).some((key) => !ctrl.springs[key]);
        return canFlushSync ? flushUpdateQueue(ctrl, updates2) : new Promise((resolve) => {
          setSprings(ctrl, springs2);
          state.queue.push(() => {
            resolve(flushUpdateQueue(ctrl, updates2));
          });
          forceUpdate();
        });
      }
    }),
    []
  );
  const ctrls = (0, import_react10.useRef)([...state.ctrls]);
  const updates = (0, import_react10.useRef)([]);
  const prevLength = usePrev(length) || 0;
  (0, import_react10.useMemo)(() => {
    each(ctrls.current.slice(length, prevLength), (ctrl) => {
      detachRefs(ctrl, ref);
      ctrl.stop(true);
    });
    ctrls.current.length = length;
    declareUpdates(prevLength, length);
  }, [length]);
  (0, import_react10.useMemo)(() => {
    declareUpdates(0, Math.min(prevLength, length));
  }, deps);
  function declareUpdates(startIndex, endIndex) {
    for (let i5 = startIndex; i5 < endIndex; i5++) {
      const ctrl = ctrls.current[i5] || (ctrls.current[i5] = new Controller(null, state.flush));
      const update22 = propsFn ? propsFn(i5, ctrl) : props[i5];
      if (update22) {
        updates.current[i5] = declareUpdate(update22);
      }
    }
  }
  const springs = ctrls.current.map(
    (ctrl, i5) => getSprings(ctrl, updates.current[i5])
  );
  const context = (0, import_react10.useContext)(SpringContext);
  const prevContext = usePrev(context);
  const hasContext = context !== prevContext && hasProps(context);
  useIsomorphicLayoutEffect(() => {
    layoutId.current++;
    state.ctrls = ctrls.current;
    const { queue } = state;
    if (queue.length) {
      state.queue = [];
      each(queue, (cb) => cb());
    }
    each(ctrls.current, (ctrl, i5) => {
      ref?.add(ctrl);
      if (hasContext) {
        ctrl.start({ default: context });
      }
      const update22 = updates.current[i5];
      if (update22) {
        replaceRef(ctrl, update22.ref);
        if (ctrl.ref) {
          ctrl.queue.push(update22);
        } else {
          ctrl.start(update22);
        }
      }
    });
  });
  useOnce(() => () => {
    each(state.ctrls, (ctrl) => ctrl.stop(true));
  });
  const values = springs.map((x2) => ({ ...x2 }));
  return ref ? [values, ref] : values;
}
function useSpring(props, deps) {
  const isFn = is.fun(props);
  const [[values], ref] = useSprings(
    1,
    isFn ? props : [props],
    isFn ? deps || [] : deps
  );
  return isFn || arguments.length == 2 ? [values, ref] : values;
}
function useTransition(data, props, deps) {
  const propsFn = is.fun(props) && props;
  const {
    reset,
    sort: sort2,
    trail = 0,
    expires = true,
    exitBeforeEnter = false,
    onDestroyed,
    ref: propsRef,
    config: propsConfig
  } = propsFn ? propsFn() : props;
  const ref = (0, import_react13.useMemo)(
    () => propsFn || arguments.length == 3 ? SpringRef() : void 0,
    []
  );
  const items = toArray(data);
  const transitions = [];
  const usedTransitions = (0, import_react13.useRef)(null);
  const prevTransitions = reset ? null : usedTransitions.current;
  useIsomorphicLayoutEffect(() => {
    usedTransitions.current = transitions;
  });
  useOnce(() => {
    each(transitions, (t5) => {
      ref?.add(t5.ctrl);
      t5.ctrl.ref = ref;
    });
    return () => {
      each(usedTransitions.current, (t5) => {
        if (t5.expired) {
          clearTimeout(t5.expirationId);
        }
        detachRefs(t5.ctrl, ref);
        t5.ctrl.stop(true);
      });
    };
  });
  const keys = getKeys(items, propsFn ? propsFn() : props, prevTransitions);
  const expired = reset && usedTransitions.current || [];
  useIsomorphicLayoutEffect(
    () => each(expired, ({ ctrl, item, key }) => {
      detachRefs(ctrl, ref);
      callProp(onDestroyed, item, key);
    })
  );
  const reused = [];
  if (prevTransitions)
    each(prevTransitions, (t5, i5) => {
      if (t5.expired) {
        clearTimeout(t5.expirationId);
        expired.push(t5);
      } else {
        i5 = reused[i5] = keys.indexOf(t5.key);
        if (~i5) transitions[i5] = t5;
      }
    });
  each(items, (item, i5) => {
    if (!transitions[i5]) {
      transitions[i5] = {
        key: keys[i5],
        item,
        phase: "mount",
        ctrl: new Controller()
      };
      transitions[i5].ctrl.item = item;
    }
  });
  if (reused.length) {
    let i5 = -1;
    const { leave } = propsFn ? propsFn() : props;
    each(reused, (keyIndex, prevIndex) => {
      const t5 = prevTransitions[prevIndex];
      if (~keyIndex) {
        i5 = transitions.indexOf(t5);
        transitions[i5] = { ...t5, item: items[keyIndex] };
      } else if (leave) {
        transitions.splice(++i5, 0, t5);
      }
    });
  }
  if (is.fun(sort2)) {
    transitions.sort((a4, b4) => sort2(a4.item, b4.item));
  }
  let delay = -trail;
  const forceUpdate = useForceUpdate();
  const defaultProps = getDefaultProps(props);
  const changes = /* @__PURE__ */ new Map();
  const exitingTransitions = (0, import_react13.useRef)(/* @__PURE__ */ new Map());
  const forceChange = (0, import_react13.useRef)(false);
  each(transitions, (t5, i5) => {
    const key = t5.key;
    const prevPhase = t5.phase;
    const p3 = propsFn ? propsFn() : props;
    let to22;
    let phase;
    const propsDelay = callProp(p3.delay || 0, key);
    if (prevPhase == "mount") {
      to22 = p3.enter;
      phase = "enter";
    } else {
      const isLeave = keys.indexOf(key) < 0;
      if (prevPhase != "leave") {
        if (isLeave) {
          to22 = p3.leave;
          phase = "leave";
        } else if (to22 = p3.update) {
          phase = "update";
        } else return;
      } else if (!isLeave) {
        to22 = p3.enter;
        phase = "enter";
      } else return;
    }
    to22 = callProp(to22, t5.item, i5);
    to22 = is.obj(to22) ? inferTo(to22) : { to: to22 };
    if (!to22.config) {
      const config2 = propsConfig || defaultProps.config;
      to22.config = callProp(config2, t5.item, i5, phase);
    }
    delay += trail;
    const payload = {
      ...defaultProps,
      // we need to add our props.delay value you here.
      delay: propsDelay + delay,
      ref: propsRef,
      immediate: p3.immediate,
      // This prevents implied resets.
      reset: false,
      // Merge any phase-specific props.
      ...to22
    };
    if (phase == "enter" && is.und(payload.from)) {
      const p22 = propsFn ? propsFn() : props;
      const from = is.und(p22.initial) || prevTransitions ? p22.from : p22.initial;
      payload.from = callProp(from, t5.item, i5);
    }
    const { onResolve } = payload;
    payload.onResolve = (result) => {
      callProp(onResolve, result);
      const transitions2 = usedTransitions.current;
      const t22 = transitions2.find((t32) => t32.key === key);
      if (!t22) return;
      if (result.cancelled && t22.phase != "update") {
        return;
      }
      if (t22.ctrl.idle) {
        const idle = transitions2.every((t32) => t32.ctrl.idle);
        if (t22.phase == "leave") {
          const expiry = callProp(expires, t22.item);
          if (expiry !== false) {
            const expiryMs = expiry === true ? 0 : expiry;
            t22.expired = true;
            if (!idle && expiryMs > 0) {
              if (expiryMs <= 2147483647)
                t22.expirationId = setTimeout(forceUpdate, expiryMs);
              return;
            }
          }
        }
        if (idle && transitions2.some((t32) => t32.expired)) {
          exitingTransitions.current.delete(t22);
          if (exitBeforeEnter) {
            forceChange.current = true;
          }
          forceUpdate();
        }
      }
    };
    const springs = getSprings(t5.ctrl, payload);
    if (phase === "leave" && exitBeforeEnter) {
      exitingTransitions.current.set(t5, { phase, springs, payload });
    } else {
      changes.set(t5, { phase, springs, payload });
    }
  });
  const context = (0, import_react13.useContext)(SpringContext);
  const prevContext = usePrev(context);
  const hasContext = context !== prevContext && hasProps(context);
  useIsomorphicLayoutEffect(() => {
    if (hasContext) {
      each(transitions, (t5) => {
        t5.ctrl.start({ default: context });
      });
    }
  }, [context]);
  each(changes, (_2, t5) => {
    if (exitingTransitions.current.size) {
      const ind = transitions.findIndex((state) => state.key === t5.key);
      transitions.splice(ind, 1);
    }
  });
  useIsomorphicLayoutEffect(
    () => {
      each(
        exitingTransitions.current.size ? exitingTransitions.current : changes,
        ({ phase, payload }, t5) => {
          const { ctrl } = t5;
          t5.phase = phase;
          ref?.add(ctrl);
          if (hasContext && phase == "enter") {
            ctrl.start({ default: context });
          }
          if (payload) {
            replaceRef(ctrl, payload.ref);
            if ((ctrl.ref || ref) && !forceChange.current) {
              ctrl.update(payload);
            } else {
              ctrl.start(payload);
              if (forceChange.current) {
                forceChange.current = false;
              }
            }
          }
        }
      );
    },
    reset ? void 0 : deps
  );
  const renderTransitions = (render) => React22.createElement(React22.Fragment, null, transitions.map((t5, i5) => {
    const { springs } = changes.get(t5) || t5.ctrl;
    const elem = render({ ...springs }, t5.item, t5, i5);
    const key = is.str(t5.key) || is.num(t5.key) ? t5.key : t5.ctrl.id;
    const isLegacyReact = React22.version < "19.0.0";
    const props2 = elem?.props ?? {};
    if (isLegacyReact) {
      props2.ref = elem.ref;
    }
    return elem && elem.type ? React22.createElement(elem.type, { key, ...props2 }) : elem;
  }));
  return ref ? [renderTransitions, ref] : renderTransitions;
}
var nextKey = 1;
function getKeys(items, { key, keys = key }, prevTransitions) {
  if (keys === null) {
    const reused = /* @__PURE__ */ new Set();
    return items.map((item) => {
      const t5 = prevTransitions && prevTransitions.find(
        (t22) => t22.item === item && t22.phase !== "leave" && !reused.has(t22)
      );
      if (t5) {
        reused.add(t5);
        return t5.key;
      }
      return nextKey++;
    });
  }
  return is.und(keys) ? items : is.fun(keys) ? items.map(keys) : toArray(keys);
}
var Interpolation = class extends FrameValue {
  constructor(source, args) {
    super();
    this.source = source;
    this.idle = true;
    this._active = /* @__PURE__ */ new Set();
    this.calc = createInterpolator(...args);
    const value = this._get();
    const nodeType = getAnimatedType(value);
    setAnimated(this, nodeType.create(value));
  }
  advance(_dt) {
    const value = this._get();
    const oldValue = this.get();
    if (!isEqual(value, oldValue)) {
      getAnimated(this).setValue(value);
      this._onChange(value, this.idle);
    }
    if (!this.idle && checkIdle(this._active)) {
      becomeIdle(this);
    }
  }
  _get() {
    const inputs = is.arr(this.source) ? this.source.map(getFluidValue) : toArray(getFluidValue(this.source));
    return this.calc(...inputs);
  }
  _start() {
    if (this.idle && !checkIdle(this._active)) {
      this.idle = false;
      each(getPayload(this), (node) => {
        node.done = false;
      });
      if (globals_exports.skipAnimation) {
        raf.batchedUpdates(() => this.advance());
        becomeIdle(this);
      } else {
        frameLoop.start(this);
      }
    }
  }
  // Observe our sources only when we're observed.
  _attach() {
    let priority2 = 1;
    each(toArray(this.source), (source) => {
      if (hasFluidValue(source)) {
        addFluidObserver(source, this);
      }
      if (isFrameValue(source)) {
        if (!source.idle) {
          this._active.add(source);
        }
        priority2 = Math.max(priority2, source.priority + 1);
      }
    });
    this.priority = priority2;
    this._start();
  }
  // Stop observing our sources once we have no observers.
  _detach() {
    each(toArray(this.source), (source) => {
      if (hasFluidValue(source)) {
        removeFluidObserver(source, this);
      }
    });
    this._active.clear();
    becomeIdle(this);
  }
  /** @internal */
  eventObserved(event) {
    if (event.type == "change") {
      if (event.idle) {
        this.advance();
      } else {
        this._active.add(event.parent);
        this._start();
      }
    } else if (event.type == "idle") {
      this._active.delete(event.parent);
    } else if (event.type == "priority") {
      this.priority = toArray(this.source).reduce(
        (highest, parent) => Math.max(highest, (isFrameValue(parent) ? parent.priority : 0) + 1),
        0
      );
    }
  }
};
function isIdle(source) {
  return source.idle !== false;
}
function checkIdle(active) {
  return !active.size || Array.from(active).every(isIdle);
}
function becomeIdle(self2) {
  if (!self2.idle) {
    self2.idle = true;
    each(getPayload(self2), (node) => {
      node.done = true;
    });
    callFluidObservers(self2, {
      type: "idle",
      parent: self2
    });
  }
}
var to2 = (source, ...args) => new Interpolation(source, args);
globals_exports.assign({
  createStringInterpolator: createStringInterpolator2,
  to: (source, args) => new Interpolation(source, args)
});
var update2 = frameLoop.advance;

// node_modules/@react-spring/web/dist/react-spring_web.modern.mjs
var import_react_dom = __toESM(require_react_dom(), 1);
var isCustomPropRE = /^--/;
function dangerousStyleValue(name, value) {
  if (value == null || typeof value === "boolean" || value === "") return "";
  if (typeof value === "number" && value !== 0 && !isCustomPropRE.test(name) && !(isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name]))
    return value + "px";
  return ("" + value).trim();
}
var attributeCache = {};
function applyAnimatedValues(instance, props) {
  if (!instance.nodeType || !instance.setAttribute) {
    return false;
  }
  const isFilterElement = instance.nodeName === "filter" || instance.parentNode && instance.parentNode.nodeName === "filter";
  const {
    className,
    style,
    children,
    scrollTop,
    scrollLeft,
    viewBox,
    ...attributes
  } = props;
  const values = Object.values(attributes);
  const names = Object.keys(attributes).map(
    (name) => isFilterElement || instance.hasAttribute(name) ? name : attributeCache[name] || (attributeCache[name] = name.replace(
      /([A-Z])/g,
      // Attributes are written in dash case
      (n6) => "-" + n6.toLowerCase()
    ))
  );
  if (children !== void 0) {
    instance.textContent = children;
  }
  for (const name in style) {
    if (style.hasOwnProperty(name)) {
      const value = dangerousStyleValue(name, style[name]);
      if (isCustomPropRE.test(name)) {
        instance.style.setProperty(name, value);
      } else {
        instance.style[name] = value;
      }
    }
  }
  names.forEach((name, i5) => {
    instance.setAttribute(name, values[i5]);
  });
  if (className !== void 0) {
    instance.className = className;
  }
  if (scrollTop !== void 0) {
    instance.scrollTop = scrollTop;
  }
  if (scrollLeft !== void 0) {
    instance.scrollLeft = scrollLeft;
  }
  if (viewBox !== void 0) {
    instance.setAttribute("viewBox", viewBox);
  }
}
var isUnitlessNumber = {
  animationIterationCount: true,
  borderImageOutset: true,
  borderImageSlice: true,
  borderImageWidth: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  columns: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  gridRow: true,
  gridRowEnd: true,
  gridRowSpan: true,
  gridRowStart: true,
  gridColumn: true,
  gridColumnEnd: true,
  gridColumnSpan: true,
  gridColumnStart: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,
  // SVG-related properties
  fillOpacity: true,
  floodOpacity: true,
  stopOpacity: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true
};
var prefixKey = (prefix2, key) => prefix2 + key.charAt(0).toUpperCase() + key.substring(1);
var prefixes = ["Webkit", "Ms", "Moz", "O"];
isUnitlessNumber = Object.keys(isUnitlessNumber).reduce((acc, prop) => {
  prefixes.forEach((prefix2) => acc[prefixKey(prefix2, prop)] = acc[prop]);
  return acc;
}, isUnitlessNumber);
var domTransforms = /^(matrix|translate|scale|rotate|skew)/;
var pxTransforms = /^(translate)/;
var degTransforms = /^(rotate|skew)/;
var addUnit = (value, unit) => is.num(value) && value !== 0 ? value + unit : value;
var isValueIdentity = (value, id) => is.arr(value) ? value.every((v2) => isValueIdentity(v2, id)) : is.num(value) ? value === id : parseFloat(value) === id;
var AnimatedStyle = class extends AnimatedObject {
  constructor({ x: x2, y: y3, z: z4, ...style }) {
    const inputs = [];
    const transforms = [];
    if (x2 || y3 || z4) {
      inputs.push([x2 || 0, y3 || 0, z4 || 0]);
      transforms.push((xyz) => [
        `translate3d(${xyz.map((v2) => addUnit(v2, "px")).join(",")})`,
        // prettier-ignore
        isValueIdentity(xyz, 0)
      ]);
    }
    eachProp(style, (value, key) => {
      if (key === "transform") {
        inputs.push([value || ""]);
        transforms.push((transform) => [transform, transform === ""]);
      } else if (domTransforms.test(key)) {
        delete style[key];
        if (is.und(value)) return;
        const unit = pxTransforms.test(key) ? "px" : degTransforms.test(key) ? "deg" : "";
        inputs.push(toArray(value));
        transforms.push(
          key === "rotate3d" ? ([x22, y22, z22, deg]) => [
            `rotate3d(${x22},${y22},${z22},${addUnit(deg, unit)})`,
            isValueIdentity(deg, 0)
          ] : (input) => [
            `${key}(${input.map((v2) => addUnit(v2, unit)).join(",")})`,
            isValueIdentity(input, key.startsWith("scale") ? 1 : 0)
          ]
        );
      }
    });
    if (inputs.length) {
      style.transform = new FluidTransform(inputs, transforms);
    }
    super(style);
  }
};
var FluidTransform = class extends FluidValue {
  constructor(inputs, transforms) {
    super();
    this.inputs = inputs;
    this.transforms = transforms;
    this._value = null;
  }
  get() {
    return this._value || (this._value = this._get());
  }
  _get() {
    let transform = "";
    let identity = true;
    each(this.inputs, (input, i5) => {
      const arg1 = getFluidValue(input[0]);
      const [t5, id] = this.transforms[i5](
        is.arr(arg1) ? arg1 : input.map(getFluidValue)
      );
      transform += " " + t5;
      identity = identity && id;
    });
    return identity ? "none" : transform;
  }
  // Start observing our inputs once we have an observer.
  observerAdded(count2) {
    if (count2 == 1)
      each(
        this.inputs,
        (input) => each(
          input,
          (value) => hasFluidValue(value) && addFluidObserver(value, this)
        )
      );
  }
  // Stop observing our inputs once we have no observers.
  observerRemoved(count2) {
    if (count2 == 0)
      each(
        this.inputs,
        (input) => each(
          input,
          (value) => hasFluidValue(value) && removeFluidObserver(value, this)
        )
      );
  }
  eventObserved(event) {
    if (event.type == "change") {
      this._value = null;
    }
    callFluidObservers(this, event);
  }
};
var primitives = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "big",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "keygen",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
  // SVG
  "circle",
  "clipPath",
  "defs",
  "ellipse",
  "foreignObject",
  "g",
  "image",
  "line",
  "linearGradient",
  "mask",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialGradient",
  "rect",
  "stop",
  "svg",
  "text",
  "tspan"
];
globals_exports.assign({
  batchedUpdates: import_react_dom.unstable_batchedUpdates,
  createStringInterpolator: createStringInterpolator2,
  colors: colors2
});
var host = createHost(primitives, {
  applyAnimatedValues,
  createAnimatedStyle: (style) => new AnimatedStyle(style),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getComponentProps: ({ scrollTop, scrollLeft, ...props }) => props
});
var animated = host.animated;

// node_modules/@nivo/theming/dist/nivo-theming.mjs
var import_react15 = __toESM(require_react(), 1);
var import_merge = __toESM(require_merge(), 1);
var import_get = __toESM(require_get(), 1);
var import_set = __toESM(require_set(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function u() {
  return u = Object.assign ? Object.assign.bind() : function(t5) {
    for (var e7 = 1; e7 < arguments.length; e7++) {
      var o5 = arguments[e7];
      for (var i5 in o5) ({}).hasOwnProperty.call(o5, i5) && (t5[i5] = o5[i5]);
    }
    return t5;
  }, u.apply(null, arguments);
}
function d(t5, e7) {
  if (null == t5) return {};
  var o5 = {};
  for (var i5 in t5) if ({}.hasOwnProperty.call(t5, i5)) {
    if (-1 !== e7.indexOf(i5)) continue;
    o5[i5] = t5[i5];
  }
  return o5;
}
var s = ["outlineWidth", "outlineColor", "outlineOpacity"];
var b = function(t5) {
  return t5.outlineWidth, t5.outlineColor, t5.outlineOpacity, d(t5, s);
};
var y = ["axis.ticks.text", "axis.legend.text", "legends.title.text", "legends.text", "legends.ticks.text", "legends.title.text", "labels.text", "dots.text", "markers.text", "annotations.text"];
var W = function(t5, e7) {
  return u({}, e7, t5);
};
var O = function(t5, e7) {
  var o5 = (0, import_merge.default)({}, t5, e7);
  return y.forEach((function(t6) {
    (0, import_set.default)(o5, t6, W((0, import_get.default)(o5, t6), o5.text));
  })), o5;
};
var C = { background: "transparent", text: { fontFamily: "sans-serif", fontSize: 11, fill: "#333333", outlineWidth: 0, outlineColor: "#ffffff", outlineOpacity: 1 }, axis: { domain: { line: { stroke: "transparent", strokeWidth: 1 } }, ticks: { line: { stroke: "#777777", strokeWidth: 1 }, text: {} }, legend: { text: { fontSize: 12 } } }, grid: { line: { stroke: "#dddddd", strokeWidth: 1 } }, legends: { hidden: { symbol: { fill: "#333333", opacity: 0.6 }, text: { fill: "#333333", opacity: 0.6 } }, text: {}, ticks: { line: { stroke: "#777777", strokeWidth: 1 }, text: { fontSize: 10 } }, title: { text: {} } }, labels: { text: {} }, markers: { lineColor: "#000000", lineStrokeWidth: 1, text: {} }, dots: { text: {} }, tooltip: { container: { background: "white", color: "inherit", fontSize: "inherit", borderRadius: "2px", boxShadow: "0 1px 2px rgba(0, 0, 0, 0.25)", padding: "5px 9px" }, basic: { whiteSpace: "pre", display: "flex", alignItems: "center" }, chip: { marginRight: 7 }, table: {}, tableCell: { padding: "3px 5px" }, tableCellValue: { fontWeight: "bold" } }, crosshair: { line: { stroke: "#000000", strokeWidth: 1, strokeOpacity: 0.75, strokeDasharray: "6 6" } }, annotations: { text: { fontSize: 13, outlineWidth: 2, outlineColor: "#ffffff", outlineOpacity: 1 }, link: { stroke: "#000000", strokeWidth: 1, outlineWidth: 2, outlineColor: "#ffffff", outlineOpacity: 1 }, outline: { fill: "none", stroke: "#000000", strokeWidth: 2, outlineWidth: 2, outlineColor: "#ffffff", outlineOpacity: 1 }, symbol: { fill: "#000000", outlineWidth: 2, outlineColor: "#ffffff", outlineOpacity: 1 } } };
var L = function(e7) {
  return (0, import_react15.useMemo)((function() {
    return O(C, e7);
  }), [e7]);
};
var S = (0, import_react15.createContext)(null);
var j = {};
var z = function(t5) {
  var e7 = t5.theme, o5 = void 0 === e7 ? j : e7, i5 = t5.children, n6 = L(o5);
  return (0, import_jsx_runtime.jsx)(S.Provider, { value: n6, children: i5 });
};
var M = function() {
  var t5 = (0, import_react15.useContext)(S);
  if (null === t5) throw new Error("Unable to find the theme, did you forget to wrap your component with ThemeProvider?");
  return t5;
};

// node_modules/@nivo/tooltip/dist/nivo-tooltip.mjs
var import_react19 = __toESM(require_react(), 1);

// node_modules/@nivo/core/dist/nivo-core.mjs
var import_react18 = __toESM(require_react(), 1);
var import_isString = __toESM(require_isString(), 1);
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);

// node_modules/react-virtualized-auto-sizer/dist/react-virtualized-auto-sizer.esm.js
var import_react16 = __toESM(require_react());
var windowObject;
if (typeof window !== "undefined") {
  windowObject = window;
} else if (typeof self !== "undefined") {
  windowObject = self;
} else {
  windowObject = global;
}
var cancelFrame = null;
var requestFrame = null;
var TIMEOUT_DURATION = 20;
var clearTimeoutFn = windowObject.clearTimeout;
var setTimeoutFn = windowObject.setTimeout;
var cancelAnimationFrameFn = windowObject.cancelAnimationFrame || windowObject.mozCancelAnimationFrame || windowObject.webkitCancelAnimationFrame;
var requestAnimationFrameFn = windowObject.requestAnimationFrame || windowObject.mozRequestAnimationFrame || windowObject.webkitRequestAnimationFrame;
if (cancelAnimationFrameFn == null || requestAnimationFrameFn == null) {
  cancelFrame = clearTimeoutFn;
  requestFrame = function requestAnimationFrameViaSetTimeout(callback) {
    return setTimeoutFn(callback, TIMEOUT_DURATION);
  };
} else {
  cancelFrame = function cancelFrame2([animationFrameID, timeoutID]) {
    cancelAnimationFrameFn(animationFrameID);
    clearTimeoutFn(timeoutID);
  };
  requestFrame = function requestAnimationFrameWithSetTimeoutFallback(callback) {
    const animationFrameID = requestAnimationFrameFn(function animationFrameCallback() {
      clearTimeoutFn(timeoutID);
      callback();
    });
    const timeoutID = setTimeoutFn(function timeoutCallback() {
      cancelAnimationFrameFn(animationFrameID);
      callback();
    }, TIMEOUT_DURATION);
    return [animationFrameID, timeoutID];
  };
}
function createDetectElementResize(nonce) {
  let animationKeyframes;
  let animationName;
  let animationStartEvent;
  let animationStyle;
  let checkTriggers;
  let resetTriggers;
  let scrollListener;
  const attachEvent = typeof document !== "undefined" && document.attachEvent;
  if (!attachEvent) {
    resetTriggers = function(element) {
      const triggers = element.__resizeTriggers__, expand = triggers.firstElementChild, contract = triggers.lastElementChild, expandChild = expand.firstElementChild;
      contract.scrollLeft = contract.scrollWidth;
      contract.scrollTop = contract.scrollHeight;
      expandChild.style.width = expand.offsetWidth + 1 + "px";
      expandChild.style.height = expand.offsetHeight + 1 + "px";
      expand.scrollLeft = expand.scrollWidth;
      expand.scrollTop = expand.scrollHeight;
    };
    checkTriggers = function(element) {
      return element.offsetWidth !== element.__resizeLast__.width || element.offsetHeight !== element.__resizeLast__.height;
    };
    scrollListener = function(e7) {
      if (e7.target.className && typeof e7.target.className.indexOf === "function" && e7.target.className.indexOf("contract-trigger") < 0 && e7.target.className.indexOf("expand-trigger") < 0) {
        return;
      }
      const element = this;
      resetTriggers(this);
      if (this.__resizeRAF__) {
        cancelFrame(this.__resizeRAF__);
      }
      this.__resizeRAF__ = requestFrame(function animationFrame() {
        if (checkTriggers(element)) {
          element.__resizeLast__.width = element.offsetWidth;
          element.__resizeLast__.height = element.offsetHeight;
          element.__resizeListeners__.forEach(function forEachResizeListener(fn2) {
            fn2.call(element, e7);
          });
        }
      });
    };
    let animation = false;
    let keyframeprefix = "";
    animationStartEvent = "animationstart";
    const domPrefixes = "Webkit Moz O ms".split(" ");
    let startEvents = "webkitAnimationStart animationstart oAnimationStart MSAnimationStart".split(" ");
    let pfx = "";
    {
      const elm = document.createElement("fakeelement");
      if (elm.style.animationName !== void 0) {
        animation = true;
      }
      if (animation === false) {
        for (let i5 = 0; i5 < domPrefixes.length; i5++) {
          if (elm.style[domPrefixes[i5] + "AnimationName"] !== void 0) {
            pfx = domPrefixes[i5];
            keyframeprefix = "-" + pfx.toLowerCase() + "-";
            animationStartEvent = startEvents[i5];
            animation = true;
            break;
          }
        }
      }
    }
    animationName = "resizeanim";
    animationKeyframes = "@" + keyframeprefix + "keyframes " + animationName + " { from { opacity: 0; } to { opacity: 0; } } ";
    animationStyle = keyframeprefix + "animation: 1ms " + animationName + "; ";
  }
  const createStyles = function(doc) {
    if (!doc.getElementById("detectElementResize")) {
      const css = (animationKeyframes ? animationKeyframes : "") + ".resize-triggers { " + (animationStyle ? animationStyle : "") + 'visibility: hidden; opacity: 0; } .resize-triggers, .resize-triggers > div, .contract-trigger:before { content: " "; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; z-index: -1; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }', head = doc.head || doc.getElementsByTagName("head")[0], style = doc.createElement("style");
      style.id = "detectElementResize";
      style.type = "text/css";
      if (nonce != null) {
        style.setAttribute("nonce", nonce);
      }
      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(doc.createTextNode(css));
      }
      head.appendChild(style);
    }
  };
  const addResizeListener = function(element, fn2) {
    if (attachEvent) {
      element.attachEvent("onresize", fn2);
    } else {
      if (!element.__resizeTriggers__) {
        const doc = element.ownerDocument;
        const elementStyle = windowObject.getComputedStyle(element);
        if (elementStyle && elementStyle.position === "static") {
          element.style.position = "relative";
        }
        createStyles(doc);
        element.__resizeLast__ = {};
        element.__resizeListeners__ = [];
        (element.__resizeTriggers__ = doc.createElement("div")).className = "resize-triggers";
        const expandTrigger = doc.createElement("div");
        expandTrigger.className = "expand-trigger";
        expandTrigger.appendChild(doc.createElement("div"));
        const contractTrigger = doc.createElement("div");
        contractTrigger.className = "contract-trigger";
        element.__resizeTriggers__.appendChild(expandTrigger);
        element.__resizeTriggers__.appendChild(contractTrigger);
        element.appendChild(element.__resizeTriggers__);
        resetTriggers(element);
        element.addEventListener("scroll", scrollListener, true);
        if (animationStartEvent) {
          element.__resizeTriggers__.__animationListener__ = function animationListener(e7) {
            if (e7.animationName === animationName) {
              resetTriggers(element);
            }
          };
          element.__resizeTriggers__.addEventListener(animationStartEvent, element.__resizeTriggers__.__animationListener__);
        }
      }
      element.__resizeListeners__.push(fn2);
    }
  };
  const removeResizeListener = function(element, fn2) {
    if (attachEvent) {
      element.detachEvent("onresize", fn2);
    } else {
      element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn2), 1);
      if (!element.__resizeListeners__.length) {
        element.removeEventListener("scroll", scrollListener, true);
        if (element.__resizeTriggers__.__animationListener__) {
          element.__resizeTriggers__.removeEventListener(animationStartEvent, element.__resizeTriggers__.__animationListener__);
          element.__resizeTriggers__.__animationListener__ = null;
        }
        try {
          element.__resizeTriggers__ = !element.removeChild(element.__resizeTriggers__);
        } catch (e7) {
        }
      }
    }
  };
  return {
    addResizeListener,
    removeResizeListener
  };
}
var AutoSizer = class extends import_react16.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      height: this.props.defaultHeight || 0,
      width: this.props.defaultWidth || 0
    };
    this._autoSizer = null;
    this._detectElementResize = null;
    this._didLogDeprecationWarning = false;
    this._parentNode = null;
    this._resizeObserver = null;
    this._timeoutId = null;
    this._onResize = () => {
      this._timeoutId = null;
      const {
        disableHeight,
        disableWidth,
        onResize: onResize2
      } = this.props;
      if (this._parentNode) {
        const style = window.getComputedStyle(this._parentNode) || {};
        const paddingLeft = parseFloat(style.paddingLeft || "0");
        const paddingRight = parseFloat(style.paddingRight || "0");
        const paddingTop = parseFloat(style.paddingTop || "0");
        const paddingBottom = parseFloat(style.paddingBottom || "0");
        const rect = this._parentNode.getBoundingClientRect();
        const height = rect.height - paddingTop - paddingBottom;
        const width = rect.width - paddingLeft - paddingRight;
        if (!disableHeight && this.state.height !== height || !disableWidth && this.state.width !== width) {
          this.setState({
            height,
            width
          });
          const maybeLogDeprecationWarning = () => {
            if (!this._didLogDeprecationWarning) {
              this._didLogDeprecationWarning = true;
              console.warn("scaledWidth and scaledHeight parameters have been deprecated; use width and height instead");
            }
          };
          if (typeof onResize2 === "function") {
            onResize2({
              height,
              width,
              // TODO Remove these params in the next major release
              get scaledHeight() {
                maybeLogDeprecationWarning();
                return height;
              },
              get scaledWidth() {
                maybeLogDeprecationWarning();
                return width;
              }
            });
          }
        }
      }
    };
    this._setRef = (autoSizer) => {
      this._autoSizer = autoSizer;
    };
  }
  componentDidMount() {
    const {
      nonce
    } = this.props;
    const parentNode = this._autoSizer ? this._autoSizer.parentNode : null;
    if (parentNode != null && parentNode.ownerDocument && parentNode.ownerDocument.defaultView && parentNode instanceof parentNode.ownerDocument.defaultView.HTMLElement) {
      this._parentNode = parentNode;
      const ResizeObserverInstance = parentNode.ownerDocument.defaultView.ResizeObserver;
      if (ResizeObserverInstance != null) {
        this._resizeObserver = new ResizeObserverInstance(() => {
          this._timeoutId = setTimeout(this._onResize, 0);
        });
        this._resizeObserver.observe(parentNode);
      } else {
        this._detectElementResize = createDetectElementResize(nonce);
        this._detectElementResize.addResizeListener(parentNode, this._onResize);
      }
      this._onResize();
    }
  }
  componentWillUnmount() {
    if (this._parentNode) {
      if (this._detectElementResize) {
        this._detectElementResize.removeResizeListener(this._parentNode, this._onResize);
      }
      if (this._timeoutId !== null) {
        clearTimeout(this._timeoutId);
      }
      if (this._resizeObserver) {
        this._resizeObserver.disconnect();
      }
    }
  }
  render() {
    const {
      children,
      defaultHeight,
      defaultWidth,
      disableHeight = false,
      disableWidth = false,
      doNotBailOutOnEmptyChildren = false,
      nonce,
      onResize: onResize2,
      style = {},
      tagName = "div",
      ...rest
    } = this.props;
    const {
      height,
      width
    } = this.state;
    const outerStyle = {
      overflow: "visible"
    };
    const childParams = {};
    let bailoutOnChildren = false;
    if (!disableHeight) {
      if (height === 0) {
        bailoutOnChildren = true;
      }
      outerStyle.height = 0;
      childParams.height = height;
      childParams.scaledHeight = height;
    }
    if (!disableWidth) {
      if (width === 0) {
        bailoutOnChildren = true;
      }
      outerStyle.width = 0;
      childParams.width = width;
      childParams.scaledWidth = width;
    }
    if (doNotBailOutOnEmptyChildren) {
      bailoutOnChildren = false;
    }
    return (0, import_react16.createElement)(tagName, {
      ref: this._setRef,
      style: {
        ...outerStyle,
        ...style
      },
      ...rest
    }, !bailoutOnChildren && children(childParams));
  }
};

// node_modules/use-debounce/dist/index.module.js
var import_react17 = __toESM(require_react());
function c(e7, u4, c9, i5) {
  var a4 = this, o5 = (0, import_react17.useRef)(null), f2 = (0, import_react17.useRef)(0), l4 = (0, import_react17.useRef)(0), v2 = (0, import_react17.useRef)(null), m3 = (0, import_react17.useRef)([]), d4 = (0, import_react17.useRef)(), g2 = (0, import_react17.useRef)(), p3 = (0, import_react17.useRef)(e7), w2 = (0, import_react17.useRef)(true);
  p3.current = e7;
  var s4 = "undefined" != typeof window, x2 = !u4 && 0 !== u4 && s4;
  if ("function" != typeof e7) throw new TypeError("Expected a function");
  u4 = +u4 || 0;
  var h2 = !!(c9 = c9 || {}).leading, y3 = !("trailing" in c9) || !!c9.trailing, F2 = "maxWait" in c9, A2 = "debounceOnServer" in c9 && !!c9.debounceOnServer, D = F2 ? Math.max(+c9.maxWait || 0, u4) : null;
  (0, import_react17.useEffect)(function() {
    return w2.current = true, function() {
      w2.current = false;
    };
  }, []);
  var T2 = (0, import_react17.useMemo)(function() {
    var r5 = function(r6) {
      var n7 = m3.current, t6 = d4.current;
      return m3.current = d4.current = null, f2.current = r6, l4.current = l4.current || r6, g2.current = p3.current.apply(t6, n7);
    }, n6 = function(r6, n7) {
      x2 && cancelAnimationFrame(v2.current), v2.current = x2 ? requestAnimationFrame(r6) : setTimeout(r6, n7);
    }, t5 = function(r6) {
      if (!w2.current) return false;
      var n7 = r6 - o5.current;
      return !o5.current || n7 >= u4 || n7 < 0 || F2 && r6 - f2.current >= D;
    }, e8 = function(n7) {
      return v2.current = null, y3 && m3.current ? r5(n7) : (m3.current = d4.current = null, g2.current);
    }, c10 = function r6() {
      var c11 = Date.now();
      if (h2 && l4.current === f2.current && T3(), t5(c11)) return e8(c11);
      if (w2.current) {
        var i6 = u4 - (c11 - o5.current), a5 = F2 ? Math.min(i6, D - (c11 - f2.current)) : i6;
        n6(r6, a5);
      }
    }, T3 = function() {
      i5 && i5({});
    }, W3 = function() {
      if (s4 || A2) {
        var e9 = Date.now(), i6 = t5(e9);
        if (m3.current = [].slice.call(arguments), d4.current = a4, o5.current = e9, i6) {
          if (!v2.current && w2.current) return f2.current = o5.current, n6(c10, u4), h2 ? r5(o5.current) : g2.current;
          if (F2) return n6(c10, u4), r5(o5.current);
        }
        return v2.current || n6(c10, u4), g2.current;
      }
    };
    return W3.cancel = function() {
      var r6 = v2.current;
      r6 && (x2 ? cancelAnimationFrame(v2.current) : clearTimeout(v2.current)), f2.current = 0, m3.current = o5.current = d4.current = v2.current = null, r6 && i5 && i5({});
    }, W3.isPending = function() {
      return !!v2.current;
    }, W3.flush = function() {
      return v2.current ? e8(Date.now()) : g2.current;
    }, W3;
  }, [h2, F2, u4, D, y3, x2, s4, A2, i5]);
  return T2;
}
function i2(r5, n6) {
  return r5 === n6;
}
function a(n6, t5, a4) {
  var o5 = a4 && a4.equalityFn || i2, f2 = (0, import_react17.useRef)(n6), l4 = (0, import_react17.useState)({})[1], v2 = c((0, import_react17.useCallback)(function(r5) {
    f2.current = r5, l4({});
  }, [l4]), t5, a4, l4), m3 = (0, import_react17.useRef)(n6);
  return o5(m3.current, n6) || (v2(n6), m3.current = n6), [f2.current, v2];
}

// node_modules/@nivo/core/dist/nivo-core.mjs
var import_without = __toESM(require_without(), 1);

// node_modules/d3-scale-chromatic/src/colors.js
function colors_default(specifier) {
  var n6 = specifier.length / 6 | 0, colors3 = new Array(n6), i5 = 0;
  while (i5 < n6) colors3[i5] = "#" + specifier.slice(i5 * 6, ++i5 * 6);
  return colors3;
}

// node_modules/d3-scale-chromatic/src/categorical/category10.js
var category10_default = colors_default("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");

// node_modules/d3-scale-chromatic/src/categorical/Accent.js
var Accent_default = colors_default("7fc97fbeaed4fdc086ffff99386cb0f0027fbf5b17666666");

// node_modules/d3-scale-chromatic/src/categorical/Dark2.js
var Dark2_default = colors_default("1b9e77d95f027570b3e7298a66a61ee6ab02a6761d666666");

// node_modules/d3-scale-chromatic/src/categorical/observable10.js
var observable10_default = colors_default("4269d0efb118ff725c6cc5b03ca951ff8ab7a463f297bbf59c6b4e9498a0");

// node_modules/d3-scale-chromatic/src/categorical/Paired.js
var Paired_default = colors_default("a6cee31f78b4b2df8a33a02cfb9a99e31a1cfdbf6fff7f00cab2d66a3d9affff99b15928");

// node_modules/d3-scale-chromatic/src/categorical/Pastel1.js
var Pastel1_default = colors_default("fbb4aeb3cde3ccebc5decbe4fed9a6ffffcce5d8bdfddaecf2f2f2");

// node_modules/d3-scale-chromatic/src/categorical/Pastel2.js
var Pastel2_default = colors_default("b3e2cdfdcdaccbd5e8f4cae4e6f5c9fff2aef1e2cccccccc");

// node_modules/d3-scale-chromatic/src/categorical/Set1.js
var Set1_default = colors_default("e41a1c377eb84daf4a984ea3ff7f00ffff33a65628f781bf999999");

// node_modules/d3-scale-chromatic/src/categorical/Set2.js
var Set2_default = colors_default("66c2a5fc8d628da0cbe78ac3a6d854ffd92fe5c494b3b3b3");

// node_modules/d3-scale-chromatic/src/categorical/Set3.js
var Set3_default = colors_default("8dd3c7ffffb3bebadafb807280b1d3fdb462b3de69fccde5d9d9d9bc80bdccebc5ffed6f");

// node_modules/d3-scale-chromatic/src/categorical/Tableau10.js
var Tableau10_default = colors_default("4e79a7f28e2ce1575976b7b259a14fedc949af7aa1ff9da79c755fbab0ab");

// node_modules/d3-scale-chromatic/src/ramp.js
var ramp_default = (scheme28) => rgbBasis(scheme28[scheme28.length - 1]);

// node_modules/d3-scale-chromatic/src/diverging/BrBG.js
var scheme = new Array(3).concat(
  "d8b365f5f5f55ab4ac",
  "a6611adfc27d80cdc1018571",
  "a6611adfc27df5f5f580cdc1018571",
  "8c510ad8b365f6e8c3c7eae55ab4ac01665e",
  "8c510ad8b365f6e8c3f5f5f5c7eae55ab4ac01665e",
  "8c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e",
  "8c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e",
  "5430058c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e003c30",
  "5430058c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e003c30"
).map(colors_default);
var BrBG_default = ramp_default(scheme);

// node_modules/d3-scale-chromatic/src/diverging/PRGn.js
var scheme2 = new Array(3).concat(
  "af8dc3f7f7f77fbf7b",
  "7b3294c2a5cfa6dba0008837",
  "7b3294c2a5cff7f7f7a6dba0008837",
  "762a83af8dc3e7d4e8d9f0d37fbf7b1b7837",
  "762a83af8dc3e7d4e8f7f7f7d9f0d37fbf7b1b7837",
  "762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b7837",
  "762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b7837",
  "40004b762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b783700441b",
  "40004b762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b783700441b"
).map(colors_default);
var PRGn_default = ramp_default(scheme2);

// node_modules/d3-scale-chromatic/src/diverging/PiYG.js
var scheme3 = new Array(3).concat(
  "e9a3c9f7f7f7a1d76a",
  "d01c8bf1b6dab8e1864dac26",
  "d01c8bf1b6daf7f7f7b8e1864dac26",
  "c51b7de9a3c9fde0efe6f5d0a1d76a4d9221",
  "c51b7de9a3c9fde0eff7f7f7e6f5d0a1d76a4d9221",
  "c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221",
  "c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221",
  "8e0152c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221276419",
  "8e0152c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221276419"
).map(colors_default);
var PiYG_default = ramp_default(scheme3);

// node_modules/d3-scale-chromatic/src/diverging/PuOr.js
var scheme4 = new Array(3).concat(
  "998ec3f7f7f7f1a340",
  "5e3c99b2abd2fdb863e66101",
  "5e3c99b2abd2f7f7f7fdb863e66101",
  "542788998ec3d8daebfee0b6f1a340b35806",
  "542788998ec3d8daebf7f7f7fee0b6f1a340b35806",
  "5427888073acb2abd2d8daebfee0b6fdb863e08214b35806",
  "5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b35806",
  "2d004b5427888073acb2abd2d8daebfee0b6fdb863e08214b358067f3b08",
  "2d004b5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b358067f3b08"
).map(colors_default);
var PuOr_default = ramp_default(scheme4);

// node_modules/d3-scale-chromatic/src/diverging/RdBu.js
var scheme5 = new Array(3).concat(
  "ef8a62f7f7f767a9cf",
  "ca0020f4a58292c5de0571b0",
  "ca0020f4a582f7f7f792c5de0571b0",
  "b2182bef8a62fddbc7d1e5f067a9cf2166ac",
  "b2182bef8a62fddbc7f7f7f7d1e5f067a9cf2166ac",
  "b2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac",
  "b2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac",
  "67001fb2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac053061",
  "67001fb2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac053061"
).map(colors_default);
var RdBu_default = ramp_default(scheme5);

// node_modules/d3-scale-chromatic/src/diverging/RdGy.js
var scheme6 = new Array(3).concat(
  "ef8a62ffffff999999",
  "ca0020f4a582bababa404040",
  "ca0020f4a582ffffffbababa404040",
  "b2182bef8a62fddbc7e0e0e09999994d4d4d",
  "b2182bef8a62fddbc7ffffffe0e0e09999994d4d4d",
  "b2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d",
  "b2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d",
  "67001fb2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d1a1a1a",
  "67001fb2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d1a1a1a"
).map(colors_default);
var RdGy_default = ramp_default(scheme6);

// node_modules/d3-scale-chromatic/src/diverging/RdYlBu.js
var scheme7 = new Array(3).concat(
  "fc8d59ffffbf91bfdb",
  "d7191cfdae61abd9e92c7bb6",
  "d7191cfdae61ffffbfabd9e92c7bb6",
  "d73027fc8d59fee090e0f3f891bfdb4575b4",
  "d73027fc8d59fee090ffffbfe0f3f891bfdb4575b4",
  "d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4",
  "d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4",
  "a50026d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4313695",
  "a50026d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4313695"
).map(colors_default);
var RdYlBu_default = ramp_default(scheme7);

// node_modules/d3-scale-chromatic/src/diverging/RdYlGn.js
var scheme8 = new Array(3).concat(
  "fc8d59ffffbf91cf60",
  "d7191cfdae61a6d96a1a9641",
  "d7191cfdae61ffffbfa6d96a1a9641",
  "d73027fc8d59fee08bd9ef8b91cf601a9850",
  "d73027fc8d59fee08bffffbfd9ef8b91cf601a9850",
  "d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850",
  "d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850",
  "a50026d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850006837",
  "a50026d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850006837"
).map(colors_default);
var RdYlGn_default = ramp_default(scheme8);

// node_modules/d3-scale-chromatic/src/diverging/Spectral.js
var scheme9 = new Array(3).concat(
  "fc8d59ffffbf99d594",
  "d7191cfdae61abdda42b83ba",
  "d7191cfdae61ffffbfabdda42b83ba",
  "d53e4ffc8d59fee08be6f59899d5943288bd",
  "d53e4ffc8d59fee08bffffbfe6f59899d5943288bd",
  "d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd",
  "d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd",
  "9e0142d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd5e4fa2",
  "9e0142d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd5e4fa2"
).map(colors_default);
var Spectral_default = ramp_default(scheme9);

// node_modules/d3-scale-chromatic/src/sequential-multi/BuGn.js
var scheme10 = new Array(3).concat(
  "e5f5f999d8c92ca25f",
  "edf8fbb2e2e266c2a4238b45",
  "edf8fbb2e2e266c2a42ca25f006d2c",
  "edf8fbccece699d8c966c2a42ca25f006d2c",
  "edf8fbccece699d8c966c2a441ae76238b45005824",
  "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45005824",
  "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45006d2c00441b"
).map(colors_default);
var BuGn_default = ramp_default(scheme10);

// node_modules/d3-scale-chromatic/src/sequential-multi/BuPu.js
var scheme11 = new Array(3).concat(
  "e0ecf49ebcda8856a7",
  "edf8fbb3cde38c96c688419d",
  "edf8fbb3cde38c96c68856a7810f7c",
  "edf8fbbfd3e69ebcda8c96c68856a7810f7c",
  "edf8fbbfd3e69ebcda8c96c68c6bb188419d6e016b",
  "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d6e016b",
  "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d810f7c4d004b"
).map(colors_default);
var BuPu_default = ramp_default(scheme11);

// node_modules/d3-scale-chromatic/src/sequential-multi/GnBu.js
var scheme12 = new Array(3).concat(
  "e0f3dba8ddb543a2ca",
  "f0f9e8bae4bc7bccc42b8cbe",
  "f0f9e8bae4bc7bccc443a2ca0868ac",
  "f0f9e8ccebc5a8ddb57bccc443a2ca0868ac",
  "f0f9e8ccebc5a8ddb57bccc44eb3d32b8cbe08589e",
  "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe08589e",
  "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe0868ac084081"
).map(colors_default);
var GnBu_default = ramp_default(scheme12);

// node_modules/d3-scale-chromatic/src/sequential-multi/OrRd.js
var scheme13 = new Array(3).concat(
  "fee8c8fdbb84e34a33",
  "fef0d9fdcc8afc8d59d7301f",
  "fef0d9fdcc8afc8d59e34a33b30000",
  "fef0d9fdd49efdbb84fc8d59e34a33b30000",
  "fef0d9fdd49efdbb84fc8d59ef6548d7301f990000",
  "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301f990000",
  "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301fb300007f0000"
).map(colors_default);
var OrRd_default = ramp_default(scheme13);

// node_modules/d3-scale-chromatic/src/sequential-multi/PuBuGn.js
var scheme14 = new Array(3).concat(
  "ece2f0a6bddb1c9099",
  "f6eff7bdc9e167a9cf02818a",
  "f6eff7bdc9e167a9cf1c9099016c59",
  "f6eff7d0d1e6a6bddb67a9cf1c9099016c59",
  "f6eff7d0d1e6a6bddb67a9cf3690c002818a016450",
  "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016450",
  "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016c59014636"
).map(colors_default);
var PuBuGn_default = ramp_default(scheme14);

// node_modules/d3-scale-chromatic/src/sequential-multi/PuBu.js
var scheme15 = new Array(3).concat(
  "ece7f2a6bddb2b8cbe",
  "f1eef6bdc9e174a9cf0570b0",
  "f1eef6bdc9e174a9cf2b8cbe045a8d",
  "f1eef6d0d1e6a6bddb74a9cf2b8cbe045a8d",
  "f1eef6d0d1e6a6bddb74a9cf3690c00570b0034e7b",
  "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0034e7b",
  "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0045a8d023858"
).map(colors_default);
var PuBu_default = ramp_default(scheme15);

// node_modules/d3-scale-chromatic/src/sequential-multi/PuRd.js
var scheme16 = new Array(3).concat(
  "e7e1efc994c7dd1c77",
  "f1eef6d7b5d8df65b0ce1256",
  "f1eef6d7b5d8df65b0dd1c77980043",
  "f1eef6d4b9dac994c7df65b0dd1c77980043",
  "f1eef6d4b9dac994c7df65b0e7298ace125691003f",
  "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125691003f",
  "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125698004367001f"
).map(colors_default);
var PuRd_default = ramp_default(scheme16);

// node_modules/d3-scale-chromatic/src/sequential-multi/RdPu.js
var scheme17 = new Array(3).concat(
  "fde0ddfa9fb5c51b8a",
  "feebe2fbb4b9f768a1ae017e",
  "feebe2fbb4b9f768a1c51b8a7a0177",
  "feebe2fcc5c0fa9fb5f768a1c51b8a7a0177",
  "feebe2fcc5c0fa9fb5f768a1dd3497ae017e7a0177",
  "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a0177",
  "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a017749006a"
).map(colors_default);
var RdPu_default = ramp_default(scheme17);

// node_modules/d3-scale-chromatic/src/sequential-multi/YlGnBu.js
var scheme18 = new Array(3).concat(
  "edf8b17fcdbb2c7fb8",
  "ffffcca1dab441b6c4225ea8",
  "ffffcca1dab441b6c42c7fb8253494",
  "ffffccc7e9b47fcdbb41b6c42c7fb8253494",
  "ffffccc7e9b47fcdbb41b6c41d91c0225ea80c2c84",
  "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea80c2c84",
  "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea8253494081d58"
).map(colors_default);
var YlGnBu_default = ramp_default(scheme18);

// node_modules/d3-scale-chromatic/src/sequential-multi/YlGn.js
var scheme19 = new Array(3).concat(
  "f7fcb9addd8e31a354",
  "ffffccc2e69978c679238443",
  "ffffccc2e69978c67931a354006837",
  "ffffccd9f0a3addd8e78c67931a354006837",
  "ffffccd9f0a3addd8e78c67941ab5d238443005a32",
  "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443005a32",
  "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443006837004529"
).map(colors_default);
var YlGn_default = ramp_default(scheme19);

// node_modules/d3-scale-chromatic/src/sequential-multi/YlOrBr.js
var scheme20 = new Array(3).concat(
  "fff7bcfec44fd95f0e",
  "ffffd4fed98efe9929cc4c02",
  "ffffd4fed98efe9929d95f0e993404",
  "ffffd4fee391fec44ffe9929d95f0e993404",
  "ffffd4fee391fec44ffe9929ec7014cc4c028c2d04",
  "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c028c2d04",
  "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c02993404662506"
).map(colors_default);
var YlOrBr_default = ramp_default(scheme20);

// node_modules/d3-scale-chromatic/src/sequential-multi/YlOrRd.js
var scheme21 = new Array(3).concat(
  "ffeda0feb24cf03b20",
  "ffffb2fecc5cfd8d3ce31a1c",
  "ffffb2fecc5cfd8d3cf03b20bd0026",
  "ffffb2fed976feb24cfd8d3cf03b20bd0026",
  "ffffb2fed976feb24cfd8d3cfc4e2ae31a1cb10026",
  "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cb10026",
  "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cbd0026800026"
).map(colors_default);
var YlOrRd_default = ramp_default(scheme21);

// node_modules/d3-scale-chromatic/src/sequential-single/Blues.js
var scheme22 = new Array(3).concat(
  "deebf79ecae13182bd",
  "eff3ffbdd7e76baed62171b5",
  "eff3ffbdd7e76baed63182bd08519c",
  "eff3ffc6dbef9ecae16baed63182bd08519c",
  "eff3ffc6dbef9ecae16baed64292c62171b5084594",
  "f7fbffdeebf7c6dbef9ecae16baed64292c62171b5084594",
  "f7fbffdeebf7c6dbef9ecae16baed64292c62171b508519c08306b"
).map(colors_default);
var Blues_default = ramp_default(scheme22);

// node_modules/d3-scale-chromatic/src/sequential-single/Greens.js
var scheme23 = new Array(3).concat(
  "e5f5e0a1d99b31a354",
  "edf8e9bae4b374c476238b45",
  "edf8e9bae4b374c47631a354006d2c",
  "edf8e9c7e9c0a1d99b74c47631a354006d2c",
  "edf8e9c7e9c0a1d99b74c47641ab5d238b45005a32",
  "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45005a32",
  "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45006d2c00441b"
).map(colors_default);
var Greens_default = ramp_default(scheme23);

// node_modules/d3-scale-chromatic/src/sequential-single/Greys.js
var scheme24 = new Array(3).concat(
  "f0f0f0bdbdbd636363",
  "f7f7f7cccccc969696525252",
  "f7f7f7cccccc969696636363252525",
  "f7f7f7d9d9d9bdbdbd969696636363252525",
  "f7f7f7d9d9d9bdbdbd969696737373525252252525",
  "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525",
  "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525000000"
).map(colors_default);
var Greys_default = ramp_default(scheme24);

// node_modules/d3-scale-chromatic/src/sequential-single/Purples.js
var scheme25 = new Array(3).concat(
  "efedf5bcbddc756bb1",
  "f2f0f7cbc9e29e9ac86a51a3",
  "f2f0f7cbc9e29e9ac8756bb154278f",
  "f2f0f7dadaebbcbddc9e9ac8756bb154278f",
  "f2f0f7dadaebbcbddc9e9ac8807dba6a51a34a1486",
  "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a34a1486",
  "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a354278f3f007d"
).map(colors_default);
var Purples_default = ramp_default(scheme25);

// node_modules/d3-scale-chromatic/src/sequential-single/Reds.js
var scheme26 = new Array(3).concat(
  "fee0d2fc9272de2d26",
  "fee5d9fcae91fb6a4acb181d",
  "fee5d9fcae91fb6a4ade2d26a50f15",
  "fee5d9fcbba1fc9272fb6a4ade2d26a50f15",
  "fee5d9fcbba1fc9272fb6a4aef3b2ccb181d99000d",
  "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181d99000d",
  "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181da50f1567000d"
).map(colors_default);
var Reds_default = ramp_default(scheme26);

// node_modules/d3-scale-chromatic/src/sequential-single/Oranges.js
var scheme27 = new Array(3).concat(
  "fee6cefdae6be6550d",
  "feeddefdbe85fd8d3cd94701",
  "feeddefdbe85fd8d3ce6550da63603",
  "feeddefdd0a2fdae6bfd8d3ce6550da63603",
  "feeddefdd0a2fdae6bfd8d3cf16913d948018c2d04",
  "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d948018c2d04",
  "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d94801a636037f2704"
).map(colors_default);
var Oranges_default = ramp_default(scheme27);

// node_modules/d3-scale-chromatic/src/sequential-multi/cividis.js
function cividis_default(t5) {
  t5 = Math.max(0, Math.min(1, t5));
  return "rgb(" + Math.max(0, Math.min(255, Math.round(-4.54 - t5 * (35.34 - t5 * (2381.73 - t5 * (6402.7 - t5 * (7024.72 - t5 * 2710.57))))))) + ", " + Math.max(0, Math.min(255, Math.round(32.49 + t5 * (170.73 + t5 * (52.82 - t5 * (131.46 - t5 * (176.58 - t5 * 67.37))))))) + ", " + Math.max(0, Math.min(255, Math.round(81.24 + t5 * (442.36 - t5 * (2482.43 - t5 * (6167.24 - t5 * (6614.94 - t5 * 2475.67))))))) + ")";
}

// node_modules/d3-scale-chromatic/src/sequential-multi/cubehelix.js
var cubehelix_default = cubehelixLong(cubehelix(300, 0.5, 0), cubehelix(-240, 0.5, 1));

// node_modules/d3-scale-chromatic/src/sequential-multi/rainbow.js
var warm = cubehelixLong(cubehelix(-100, 0.75, 0.35), cubehelix(80, 1.5, 0.8));
var cool = cubehelixLong(cubehelix(260, 0.75, 0.35), cubehelix(80, 1.5, 0.8));
var c6 = cubehelix();
function rainbow_default(t5) {
  if (t5 < 0 || t5 > 1) t5 -= Math.floor(t5);
  var ts2 = Math.abs(t5 - 0.5);
  c6.h = 360 * t5 - 100;
  c6.s = 1.5 - 1.5 * ts2;
  c6.l = 0.8 - 0.9 * ts2;
  return c6 + "";
}

// node_modules/d3-scale-chromatic/src/sequential-multi/sinebow.js
var c7 = rgb();
var pi_1_3 = Math.PI / 3;
var pi_2_3 = Math.PI * 2 / 3;
function sinebow_default(t5) {
  var x2;
  t5 = (0.5 - t5) * Math.PI;
  c7.r = 255 * (x2 = Math.sin(t5)) * x2;
  c7.g = 255 * (x2 = Math.sin(t5 + pi_1_3)) * x2;
  c7.b = 255 * (x2 = Math.sin(t5 + pi_2_3)) * x2;
  return c7 + "";
}

// node_modules/d3-scale-chromatic/src/sequential-multi/turbo.js
function turbo_default(t5) {
  t5 = Math.max(0, Math.min(1, t5));
  return "rgb(" + Math.max(0, Math.min(255, Math.round(34.61 + t5 * (1172.33 - t5 * (10793.56 - t5 * (33300.12 - t5 * (38394.49 - t5 * 14825.05))))))) + ", " + Math.max(0, Math.min(255, Math.round(23.31 + t5 * (557.33 + t5 * (1225.33 - t5 * (3574.96 - t5 * (1073.77 + t5 * 707.56))))))) + ", " + Math.max(0, Math.min(255, Math.round(27.2 + t5 * (3211.1 - t5 * (15327.97 - t5 * (27814 - t5 * (22569.18 - t5 * 6838.66))))))) + ")";
}

// node_modules/d3-scale-chromatic/src/sequential-multi/viridis.js
function ramp(range) {
  var n6 = range.length;
  return function(t5) {
    return range[Math.max(0, Math.min(n6 - 1, Math.floor(t5 * n6)))];
  };
}
var viridis_default = ramp(colors_default("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725"));
var magma = ramp(colors_default("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));
var inferno = ramp(colors_default("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));
var plasma = ramp(colors_default("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));

// node_modules/@nivo/core/dist/nivo-core.mjs
var import_last = __toESM(require_last(), 1);
var import_isArray = __toESM(require_isArray(), 1);
var import_isFunction = __toESM(require_isFunction(), 1);

// node_modules/@nivo/core/node_modules/d3-format/src/formatDecimal.js
function formatDecimal_default(x2) {
  return Math.abs(x2 = Math.round(x2)) >= 1e21 ? x2.toLocaleString("en").replace(/,/g, "") : x2.toString(10);
}
function formatDecimalParts(x2, p3) {
  if ((i5 = (x2 = p3 ? x2.toExponential(p3 - 1) : x2.toExponential()).indexOf("e")) < 0) return null;
  var i5, coefficient = x2.slice(0, i5);
  return [
    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
    +x2.slice(i5 + 1)
  ];
}

// node_modules/@nivo/core/node_modules/d3-format/src/exponent.js
function exponent_default(x2) {
  return x2 = formatDecimalParts(Math.abs(x2)), x2 ? x2[1] : NaN;
}

// node_modules/@nivo/core/node_modules/d3-format/src/formatGroup.js
function formatGroup_default(grouping, thousands) {
  return function(value, width) {
    var i5 = value.length, t5 = [], j3 = 0, g2 = grouping[0], length = 0;
    while (i5 > 0 && g2 > 0) {
      if (length + g2 + 1 > width) g2 = Math.max(1, width - length);
      t5.push(value.substring(i5 -= g2, i5 + g2));
      if ((length += g2 + 1) > width) break;
      g2 = grouping[j3 = (j3 + 1) % grouping.length];
    }
    return t5.reverse().join(thousands);
  };
}

// node_modules/@nivo/core/node_modules/d3-format/src/formatNumerals.js
function formatNumerals_default(numerals) {
  return function(value) {
    return value.replace(/[0-9]/g, function(i5) {
      return numerals[+i5];
    });
  };
}

// node_modules/@nivo/core/node_modules/d3-format/src/formatSpecifier.js
var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function formatSpecifier(specifier) {
  if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
  var match;
  return new FormatSpecifier({
    fill: match[1],
    align: match[2],
    sign: match[3],
    symbol: match[4],
    zero: match[5],
    width: match[6],
    comma: match[7],
    precision: match[8] && match[8].slice(1),
    trim: match[9],
    type: match[10]
  });
}
formatSpecifier.prototype = FormatSpecifier.prototype;
function FormatSpecifier(specifier) {
  this.fill = specifier.fill === void 0 ? " " : specifier.fill + "";
  this.align = specifier.align === void 0 ? ">" : specifier.align + "";
  this.sign = specifier.sign === void 0 ? "-" : specifier.sign + "";
  this.symbol = specifier.symbol === void 0 ? "" : specifier.symbol + "";
  this.zero = !!specifier.zero;
  this.width = specifier.width === void 0 ? void 0 : +specifier.width;
  this.comma = !!specifier.comma;
  this.precision = specifier.precision === void 0 ? void 0 : +specifier.precision;
  this.trim = !!specifier.trim;
  this.type = specifier.type === void 0 ? "" : specifier.type + "";
}
FormatSpecifier.prototype.toString = function() {
  return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
};

// node_modules/@nivo/core/node_modules/d3-format/src/formatTrim.js
function formatTrim_default(s4) {
  out: for (var n6 = s4.length, i5 = 1, i0 = -1, i1; i5 < n6; ++i5) {
    switch (s4[i5]) {
      case ".":
        i0 = i1 = i5;
        break;
      case "0":
        if (i0 === 0) i0 = i5;
        i1 = i5;
        break;
      default:
        if (!+s4[i5]) break out;
        if (i0 > 0) i0 = 0;
        break;
    }
  }
  return i0 > 0 ? s4.slice(0, i0) + s4.slice(i1 + 1) : s4;
}

// node_modules/@nivo/core/node_modules/d3-format/src/formatPrefixAuto.js
var prefixExponent;
function formatPrefixAuto_default(x2, p3) {
  var d4 = formatDecimalParts(x2, p3);
  if (!d4) return x2 + "";
  var coefficient = d4[0], exponent = d4[1], i5 = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1, n6 = coefficient.length;
  return i5 === n6 ? coefficient : i5 > n6 ? coefficient + new Array(i5 - n6 + 1).join("0") : i5 > 0 ? coefficient.slice(0, i5) + "." + coefficient.slice(i5) : "0." + new Array(1 - i5).join("0") + formatDecimalParts(x2, Math.max(0, p3 + i5 - 1))[0];
}

// node_modules/@nivo/core/node_modules/d3-format/src/formatRounded.js
function formatRounded_default(x2, p3) {
  var d4 = formatDecimalParts(x2, p3);
  if (!d4) return x2 + "";
  var coefficient = d4[0], exponent = d4[1];
  return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1) : coefficient + new Array(exponent - coefficient.length + 2).join("0");
}

// node_modules/@nivo/core/node_modules/d3-format/src/formatTypes.js
var formatTypes_default = {
  "%": function(x2, p3) {
    return (x2 * 100).toFixed(p3);
  },
  "b": function(x2) {
    return Math.round(x2).toString(2);
  },
  "c": function(x2) {
    return x2 + "";
  },
  "d": formatDecimal_default,
  "e": function(x2, p3) {
    return x2.toExponential(p3);
  },
  "f": function(x2, p3) {
    return x2.toFixed(p3);
  },
  "g": function(x2, p3) {
    return x2.toPrecision(p3);
  },
  "o": function(x2) {
    return Math.round(x2).toString(8);
  },
  "p": function(x2, p3) {
    return formatRounded_default(x2 * 100, p3);
  },
  "r": formatRounded_default,
  "s": formatPrefixAuto_default,
  "X": function(x2) {
    return Math.round(x2).toString(16).toUpperCase();
  },
  "x": function(x2) {
    return Math.round(x2).toString(16);
  }
};

// node_modules/@nivo/core/node_modules/d3-format/src/identity.js
function identity_default(x2) {
  return x2;
}

// node_modules/@nivo/core/node_modules/d3-format/src/locale.js
var map = Array.prototype.map;
var prefixes2 = ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
function locale_default(locale3) {
  var group2 = locale3.grouping === void 0 || locale3.thousands === void 0 ? identity_default : formatGroup_default(map.call(locale3.grouping, Number), locale3.thousands + ""), currencyPrefix = locale3.currency === void 0 ? "" : locale3.currency[0] + "", currencySuffix = locale3.currency === void 0 ? "" : locale3.currency[1] + "", decimal = locale3.decimal === void 0 ? "." : locale3.decimal + "", numerals = locale3.numerals === void 0 ? identity_default : formatNumerals_default(map.call(locale3.numerals, String)), percent = locale3.percent === void 0 ? "%" : locale3.percent + "", minus = locale3.minus === void 0 ? "-" : locale3.minus + "", nan = locale3.nan === void 0 ? "NaN" : locale3.nan + "";
  function newFormat(specifier) {
    specifier = formatSpecifier(specifier);
    var fill = specifier.fill, align = specifier.align, sign = specifier.sign, symbol = specifier.symbol, zero = specifier.zero, width = specifier.width, comma = specifier.comma, precision = specifier.precision, trim = specifier.trim, type = specifier.type;
    if (type === "n") comma = true, type = "g";
    else if (!formatTypes_default[type]) precision === void 0 && (precision = 12), trim = true, type = "g";
    if (zero || fill === "0" && align === "=") zero = true, fill = "0", align = "=";
    var prefix2 = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "", suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";
    var formatType = formatTypes_default[type], maybeSuffix = /[defgprs%]/.test(type);
    precision = precision === void 0 ? 6 : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision)) : Math.max(0, Math.min(20, precision));
    function format2(value) {
      var valuePrefix = prefix2, valueSuffix = suffix, i5, n6, c9;
      if (type === "c") {
        valueSuffix = formatType(value) + valueSuffix;
        value = "";
      } else {
        value = +value;
        var valueNegative = value < 0 || 1 / value < 0;
        value = isNaN(value) ? nan : formatType(Math.abs(value), precision);
        if (trim) value = formatTrim_default(value);
        if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;
        valuePrefix = (valueNegative ? sign === "(" ? sign : minus : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
        valueSuffix = (type === "s" ? prefixes2[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");
        if (maybeSuffix) {
          i5 = -1, n6 = value.length;
          while (++i5 < n6) {
            if (c9 = value.charCodeAt(i5), 48 > c9 || c9 > 57) {
              valueSuffix = (c9 === 46 ? decimal + value.slice(i5 + 1) : value.slice(i5)) + valueSuffix;
              value = value.slice(0, i5);
              break;
            }
          }
        }
      }
      if (comma && !zero) value = group2(value, Infinity);
      var length = valuePrefix.length + value.length + valueSuffix.length, padding = length < width ? new Array(width - length + 1).join(fill) : "";
      if (comma && zero) value = group2(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";
      switch (align) {
        case "<":
          value = valuePrefix + value + valueSuffix + padding;
          break;
        case "=":
          value = valuePrefix + padding + value + valueSuffix;
          break;
        case "^":
          value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
          break;
        default:
          value = padding + valuePrefix + value + valueSuffix;
          break;
      }
      return numerals(value);
    }
    format2.toString = function() {
      return specifier + "";
    };
    return format2;
  }
  function formatPrefix2(specifier, value) {
    var f2 = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)), e7 = Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3, k2 = Math.pow(10, -e7), prefix2 = prefixes2[8 + e7 / 3];
    return function(value2) {
      return f2(k2 * value2) + prefix2;
    };
  }
  return {
    format: newFormat,
    formatPrefix: formatPrefix2
  };
}

// node_modules/@nivo/core/node_modules/d3-format/src/defaultLocale.js
var locale;
var format;
var formatPrefix;
defaultLocale({
  decimal: ".",
  thousands: ",",
  grouping: [3],
  currency: ["$", ""],
  minus: "-"
});
function defaultLocale(definition) {
  locale = locale_default(definition);
  format = locale.format;
  formatPrefix = locale.formatPrefix;
  return locale;
}

// node_modules/@nivo/core/node_modules/d3-time/src/interval.js
var t0 = /* @__PURE__ */ new Date();
var t1 = /* @__PURE__ */ new Date();
function newInterval(floori, offseti, count2, field) {
  function interval(date) {
    return floori(date = arguments.length === 0 ? /* @__PURE__ */ new Date() : /* @__PURE__ */ new Date(+date)), date;
  }
  interval.floor = function(date) {
    return floori(date = /* @__PURE__ */ new Date(+date)), date;
  };
  interval.ceil = function(date) {
    return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
  };
  interval.round = function(date) {
    var d0 = interval(date), d1 = interval.ceil(date);
    return date - d0 < d1 - date ? d0 : d1;
  };
  interval.offset = function(date, step) {
    return offseti(date = /* @__PURE__ */ new Date(+date), step == null ? 1 : Math.floor(step)), date;
  };
  interval.range = function(start2, stop2, step) {
    var range = [], previous;
    start2 = interval.ceil(start2);
    step = step == null ? 1 : Math.floor(step);
    if (!(start2 < stop2) || !(step > 0)) return range;
    do
      range.push(previous = /* @__PURE__ */ new Date(+start2)), offseti(start2, step), floori(start2);
    while (previous < start2 && start2 < stop2);
    return range;
  };
  interval.filter = function(test) {
    return newInterval(function(date) {
      if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
    }, function(date, step) {
      if (date >= date) {
        if (step < 0) while (++step <= 0) {
          while (offseti(date, -1), !test(date)) {
          }
        }
        else while (--step >= 0) {
          while (offseti(date, 1), !test(date)) {
          }
        }
      }
    });
  };
  if (count2) {
    interval.count = function(start2, end) {
      t0.setTime(+start2), t1.setTime(+end);
      floori(t0), floori(t1);
      return Math.floor(count2(t0, t1));
    };
    interval.every = function(step) {
      step = Math.floor(step);
      return !isFinite(step) || !(step > 0) ? null : !(step > 1) ? interval : interval.filter(field ? function(d4) {
        return field(d4) % step === 0;
      } : function(d4) {
        return interval.count(0, d4) % step === 0;
      });
    };
  }
  return interval;
}

// node_modules/@nivo/core/node_modules/d3-time/src/millisecond.js
var millisecond = newInterval(function() {
}, function(date, step) {
  date.setTime(+date + step);
}, function(start2, end) {
  return end - start2;
});
millisecond.every = function(k2) {
  k2 = Math.floor(k2);
  if (!isFinite(k2) || !(k2 > 0)) return null;
  if (!(k2 > 1)) return millisecond;
  return newInterval(function(date) {
    date.setTime(Math.floor(date / k2) * k2);
  }, function(date, step) {
    date.setTime(+date + step * k2);
  }, function(start2, end) {
    return (end - start2) / k2;
  });
};
var millisecond_default = millisecond;
var milliseconds = millisecond.range;

// node_modules/@nivo/core/node_modules/d3-time/src/duration.js
var durationSecond = 1e3;
var durationMinute = durationSecond * 60;
var durationHour = durationMinute * 60;
var durationDay = durationHour * 24;
var durationWeek = durationDay * 7;
var durationMonth = durationDay * 30;
var durationYear = durationDay * 365;

// node_modules/@nivo/core/node_modules/d3-time/src/second.js
var second = newInterval(function(date) {
  date.setTime(date - date.getMilliseconds());
}, function(date, step) {
  date.setTime(+date + step * durationSecond);
}, function(start2, end) {
  return (end - start2) / durationSecond;
}, function(date) {
  return date.getUTCSeconds();
});
var second_default = second;
var seconds = second.range;

// node_modules/@nivo/core/node_modules/d3-time/src/minute.js
var minute = newInterval(function(date) {
  date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond);
}, function(date, step) {
  date.setTime(+date + step * durationMinute);
}, function(start2, end) {
  return (end - start2) / durationMinute;
}, function(date) {
  return date.getMinutes();
});
var minute_default = minute;
var minutes = minute.range;

// node_modules/@nivo/core/node_modules/d3-time/src/hour.js
var hour = newInterval(function(date) {
  date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond - date.getMinutes() * durationMinute);
}, function(date, step) {
  date.setTime(+date + step * durationHour);
}, function(start2, end) {
  return (end - start2) / durationHour;
}, function(date) {
  return date.getHours();
});
var hour_default = hour;
var hours = hour.range;

// node_modules/@nivo/core/node_modules/d3-time/src/day.js
var day = newInterval(
  (date) => date.setHours(0, 0, 0, 0),
  (date, step) => date.setDate(date.getDate() + step),
  (start2, end) => (end - start2 - (end.getTimezoneOffset() - start2.getTimezoneOffset()) * durationMinute) / durationDay,
  (date) => date.getDate() - 1
);
var day_default = day;
var days = day.range;

// node_modules/@nivo/core/node_modules/d3-time/src/week.js
function weekday(i5) {
  return newInterval(function(date) {
    date.setDate(date.getDate() - (date.getDay() + 7 - i5) % 7);
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setDate(date.getDate() + step * 7);
  }, function(start2, end) {
    return (end - start2 - (end.getTimezoneOffset() - start2.getTimezoneOffset()) * durationMinute) / durationWeek;
  });
}
var sunday = weekday(0);
var monday = weekday(1);
var tuesday = weekday(2);
var wednesday = weekday(3);
var thursday = weekday(4);
var friday = weekday(5);
var saturday = weekday(6);
var sundays = sunday.range;
var mondays = monday.range;
var tuesdays = tuesday.range;
var wednesdays = wednesday.range;
var thursdays = thursday.range;
var fridays = friday.range;
var saturdays = saturday.range;

// node_modules/@nivo/core/node_modules/d3-time/src/month.js
var month = newInterval(function(date) {
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
}, function(date, step) {
  date.setMonth(date.getMonth() + step);
}, function(start2, end) {
  return end.getMonth() - start2.getMonth() + (end.getFullYear() - start2.getFullYear()) * 12;
}, function(date) {
  return date.getMonth();
});
var month_default = month;
var months = month.range;

// node_modules/@nivo/core/node_modules/d3-time/src/year.js
var year = newInterval(function(date) {
  date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);
}, function(date, step) {
  date.setFullYear(date.getFullYear() + step);
}, function(start2, end) {
  return end.getFullYear() - start2.getFullYear();
}, function(date) {
  return date.getFullYear();
});
year.every = function(k2) {
  return !isFinite(k2 = Math.floor(k2)) || !(k2 > 0) ? null : newInterval(function(date) {
    date.setFullYear(Math.floor(date.getFullYear() / k2) * k2);
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setFullYear(date.getFullYear() + step * k2);
  });
};
var year_default = year;
var years = year.range;

// node_modules/@nivo/core/node_modules/d3-time/src/utcMinute.js
var utcMinute = newInterval(function(date) {
  date.setUTCSeconds(0, 0);
}, function(date, step) {
  date.setTime(+date + step * durationMinute);
}, function(start2, end) {
  return (end - start2) / durationMinute;
}, function(date) {
  return date.getUTCMinutes();
});
var utcMinute_default = utcMinute;
var utcMinutes = utcMinute.range;

// node_modules/@nivo/core/node_modules/d3-time/src/utcHour.js
var utcHour = newInterval(function(date) {
  date.setUTCMinutes(0, 0, 0);
}, function(date, step) {
  date.setTime(+date + step * durationHour);
}, function(start2, end) {
  return (end - start2) / durationHour;
}, function(date) {
  return date.getUTCHours();
});
var utcHour_default = utcHour;
var utcHours = utcHour.range;

// node_modules/@nivo/core/node_modules/d3-time/src/utcDay.js
var utcDay = newInterval(function(date) {
  date.setUTCHours(0, 0, 0, 0);
}, function(date, step) {
  date.setUTCDate(date.getUTCDate() + step);
}, function(start2, end) {
  return (end - start2) / durationDay;
}, function(date) {
  return date.getUTCDate() - 1;
});
var utcDay_default = utcDay;
var utcDays = utcDay.range;

// node_modules/@nivo/core/node_modules/d3-time/src/utcWeek.js
function utcWeekday(i5) {
  return newInterval(function(date) {
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i5) % 7);
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCDate(date.getUTCDate() + step * 7);
  }, function(start2, end) {
    return (end - start2) / durationWeek;
  });
}
var utcSunday = utcWeekday(0);
var utcMonday = utcWeekday(1);
var utcTuesday = utcWeekday(2);
var utcWednesday = utcWeekday(3);
var utcThursday = utcWeekday(4);
var utcFriday = utcWeekday(5);
var utcSaturday = utcWeekday(6);
var utcSundays = utcSunday.range;
var utcMondays = utcMonday.range;
var utcTuesdays = utcTuesday.range;
var utcWednesdays = utcWednesday.range;
var utcThursdays = utcThursday.range;
var utcFridays = utcFriday.range;
var utcSaturdays = utcSaturday.range;

// node_modules/@nivo/core/node_modules/d3-time/src/utcMonth.js
var utcMonth = newInterval(function(date) {
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
}, function(date, step) {
  date.setUTCMonth(date.getUTCMonth() + step);
}, function(start2, end) {
  return end.getUTCMonth() - start2.getUTCMonth() + (end.getUTCFullYear() - start2.getUTCFullYear()) * 12;
}, function(date) {
  return date.getUTCMonth();
});
var utcMonth_default = utcMonth;
var utcMonths = utcMonth.range;

// node_modules/@nivo/core/node_modules/d3-time/src/utcYear.js
var utcYear = newInterval(function(date) {
  date.setUTCMonth(0, 1);
  date.setUTCHours(0, 0, 0, 0);
}, function(date, step) {
  date.setUTCFullYear(date.getUTCFullYear() + step);
}, function(start2, end) {
  return end.getUTCFullYear() - start2.getUTCFullYear();
}, function(date) {
  return date.getUTCFullYear();
});
utcYear.every = function(k2) {
  return !isFinite(k2 = Math.floor(k2)) || !(k2 > 0) ? null : newInterval(function(date) {
    date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k2) * k2);
    date.setUTCMonth(0, 1);
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCFullYear(date.getUTCFullYear() + step * k2);
  });
};
var utcYear_default = utcYear;
var utcYears = utcYear.range;

// node_modules/@nivo/core/node_modules/d3-array/src/ascending.js
function ascending_default2(a4, b4) {
  return a4 < b4 ? -1 : a4 > b4 ? 1 : a4 >= b4 ? 0 : NaN;
}

// node_modules/@nivo/core/node_modules/d3-array/src/bisector.js
function bisector_default(f2) {
  let delta = f2;
  let compare = f2;
  if (f2.length === 1) {
    delta = (d4, x2) => f2(d4) - x2;
    compare = ascendingComparator(f2);
  }
  function left(a4, x2, lo, hi) {
    if (lo == null) lo = 0;
    if (hi == null) hi = a4.length;
    while (lo < hi) {
      const mid = lo + hi >>> 1;
      if (compare(a4[mid], x2) < 0) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }
  function right(a4, x2, lo, hi) {
    if (lo == null) lo = 0;
    if (hi == null) hi = a4.length;
    while (lo < hi) {
      const mid = lo + hi >>> 1;
      if (compare(a4[mid], x2) > 0) hi = mid;
      else lo = mid + 1;
    }
    return lo;
  }
  function center(a4, x2, lo, hi) {
    if (lo == null) lo = 0;
    if (hi == null) hi = a4.length;
    const i5 = left(a4, x2, lo, hi - 1);
    return i5 > lo && delta(a4[i5 - 1], x2) > -delta(a4[i5], x2) ? i5 - 1 : i5;
  }
  return { left, center, right };
}
function ascendingComparator(f2) {
  return (d4, x2) => ascending_default2(f2(d4), x2);
}

// node_modules/@nivo/core/node_modules/d3-array/src/number.js
function number_default(x2) {
  return x2 === null ? NaN : +x2;
}

// node_modules/@nivo/core/node_modules/d3-array/src/bisect.js
var ascendingBisect = bisector_default(ascending_default2);
var bisectRight = ascendingBisect.right;
var bisectLeft = ascendingBisect.left;
var bisectCenter = bisector_default(number_default).center;

// node_modules/@nivo/core/node_modules/d3-array/src/array.js
var array = Array.prototype;
var slice = array.slice;
var map2 = array.map;

// node_modules/@nivo/core/node_modules/d3-array/src/ticks.js
var e10 = Math.sqrt(50);
var e5 = Math.sqrt(10);
var e22 = Math.sqrt(2);
function tickStep(start2, stop2, count2) {
  var step0 = Math.abs(stop2 - start2) / Math.max(0, count2), step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)), error = step0 / step1;
  if (error >= e10) step1 *= 10;
  else if (error >= e5) step1 *= 5;
  else if (error >= e22) step1 *= 2;
  return stop2 < start2 ? -step1 : step1;
}

// node_modules/@nivo/core/node_modules/d3-array/src/shuffle.js
var shuffle_default = shuffler(Math.random);
function shuffler(random) {
  return function shuffle(array2, i0 = 0, i1 = array2.length) {
    let m3 = i1 - (i0 = +i0);
    while (m3) {
      const i5 = random() * m3-- | 0, t5 = array2[m3 + i0];
      array2[m3 + i0] = array2[i5 + i0];
      array2[i5 + i0] = t5;
    }
    return array2;
  };
}

// node_modules/@nivo/core/node_modules/d3-time/src/ticks.js
function ticker(year2, month2, week, day2, hour2, minute2) {
  const tickIntervals = [
    [second_default, 1, durationSecond],
    [second_default, 5, 5 * durationSecond],
    [second_default, 15, 15 * durationSecond],
    [second_default, 30, 30 * durationSecond],
    [minute2, 1, durationMinute],
    [minute2, 5, 5 * durationMinute],
    [minute2, 15, 15 * durationMinute],
    [minute2, 30, 30 * durationMinute],
    [hour2, 1, durationHour],
    [hour2, 3, 3 * durationHour],
    [hour2, 6, 6 * durationHour],
    [hour2, 12, 12 * durationHour],
    [day2, 1, durationDay],
    [day2, 2, 2 * durationDay],
    [week, 1, durationWeek],
    [month2, 1, durationMonth],
    [month2, 3, 3 * durationMonth],
    [year2, 1, durationYear]
  ];
  function ticks(start2, stop2, count2) {
    const reverse2 = stop2 < start2;
    if (reverse2) [start2, stop2] = [stop2, start2];
    const interval = count2 && typeof count2.range === "function" ? count2 : tickInterval(start2, stop2, count2);
    const ticks2 = interval ? interval.range(start2, +stop2 + 1) : [];
    return reverse2 ? ticks2.reverse() : ticks2;
  }
  function tickInterval(start2, stop2, count2) {
    const target = Math.abs(stop2 - start2) / count2;
    const i5 = bisector_default(([, , step2]) => step2).right(tickIntervals, target);
    if (i5 === tickIntervals.length) return year2.every(tickStep(start2 / durationYear, stop2 / durationYear, count2));
    if (i5 === 0) return millisecond_default.every(Math.max(tickStep(start2, stop2, count2), 1));
    const [t5, step] = tickIntervals[target / tickIntervals[i5 - 1][2] < tickIntervals[i5][2] / target ? i5 - 1 : i5];
    return t5.every(step);
  }
  return [ticks, tickInterval];
}
var [utcTicks, utcTickInterval] = ticker(utcYear_default, utcMonth_default, utcSunday, utcDay_default, utcHour_default, utcMinute_default);
var [timeTicks, timeTickInterval] = ticker(year_default, month_default, sunday, day_default, hour_default, minute_default);

// node_modules/@nivo/core/node_modules/d3-time-format/src/locale.js
function localDate(d4) {
  if (0 <= d4.y && d4.y < 100) {
    var date = new Date(-1, d4.m, d4.d, d4.H, d4.M, d4.S, d4.L);
    date.setFullYear(d4.y);
    return date;
  }
  return new Date(d4.y, d4.m, d4.d, d4.H, d4.M, d4.S, d4.L);
}
function utcDate(d4) {
  if (0 <= d4.y && d4.y < 100) {
    var date = new Date(Date.UTC(-1, d4.m, d4.d, d4.H, d4.M, d4.S, d4.L));
    date.setUTCFullYear(d4.y);
    return date;
  }
  return new Date(Date.UTC(d4.y, d4.m, d4.d, d4.H, d4.M, d4.S, d4.L));
}
function newDate(y3, m3, d4) {
  return { y: y3, m: m3, d: d4, H: 0, M: 0, S: 0, L: 0 };
}
function formatLocale(locale3) {
  var locale_dateTime = locale3.dateTime, locale_date = locale3.date, locale_time = locale3.time, locale_periods = locale3.periods, locale_weekdays = locale3.days, locale_shortWeekdays = locale3.shortDays, locale_months = locale3.months, locale_shortMonths = locale3.shortMonths;
  var periodRe = formatRe(locale_periods), periodLookup = formatLookup(locale_periods), weekdayRe = formatRe(locale_weekdays), weekdayLookup = formatLookup(locale_weekdays), shortWeekdayRe = formatRe(locale_shortWeekdays), shortWeekdayLookup = formatLookup(locale_shortWeekdays), monthRe = formatRe(locale_months), monthLookup = formatLookup(locale_months), shortMonthRe = formatRe(locale_shortMonths), shortMonthLookup = formatLookup(locale_shortMonths);
  var formats = {
    "a": formatShortWeekday,
    "A": formatWeekday,
    "b": formatShortMonth,
    "B": formatMonth,
    "c": null,
    "d": formatDayOfMonth,
    "e": formatDayOfMonth,
    "f": formatMicroseconds,
    "g": formatYearISO,
    "G": formatFullYearISO,
    "H": formatHour24,
    "I": formatHour12,
    "j": formatDayOfYear,
    "L": formatMilliseconds,
    "m": formatMonthNumber,
    "M": formatMinutes,
    "p": formatPeriod,
    "q": formatQuarter,
    "Q": formatUnixTimestamp,
    "s": formatUnixTimestampSeconds,
    "S": formatSeconds,
    "u": formatWeekdayNumberMonday,
    "U": formatWeekNumberSunday,
    "V": formatWeekNumberISO,
    "w": formatWeekdayNumberSunday,
    "W": formatWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatYear,
    "Y": formatFullYear,
    "Z": formatZone,
    "%": formatLiteralPercent
  };
  var utcFormats = {
    "a": formatUTCShortWeekday,
    "A": formatUTCWeekday,
    "b": formatUTCShortMonth,
    "B": formatUTCMonth,
    "c": null,
    "d": formatUTCDayOfMonth,
    "e": formatUTCDayOfMonth,
    "f": formatUTCMicroseconds,
    "g": formatUTCYearISO,
    "G": formatUTCFullYearISO,
    "H": formatUTCHour24,
    "I": formatUTCHour12,
    "j": formatUTCDayOfYear,
    "L": formatUTCMilliseconds,
    "m": formatUTCMonthNumber,
    "M": formatUTCMinutes,
    "p": formatUTCPeriod,
    "q": formatUTCQuarter,
    "Q": formatUnixTimestamp,
    "s": formatUnixTimestampSeconds,
    "S": formatUTCSeconds,
    "u": formatUTCWeekdayNumberMonday,
    "U": formatUTCWeekNumberSunday,
    "V": formatUTCWeekNumberISO,
    "w": formatUTCWeekdayNumberSunday,
    "W": formatUTCWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatUTCYear,
    "Y": formatUTCFullYear,
    "Z": formatUTCZone,
    "%": formatLiteralPercent
  };
  var parses = {
    "a": parseShortWeekday,
    "A": parseWeekday,
    "b": parseShortMonth,
    "B": parseMonth,
    "c": parseLocaleDateTime,
    "d": parseDayOfMonth,
    "e": parseDayOfMonth,
    "f": parseMicroseconds,
    "g": parseYear,
    "G": parseFullYear,
    "H": parseHour24,
    "I": parseHour24,
    "j": parseDayOfYear,
    "L": parseMilliseconds,
    "m": parseMonthNumber,
    "M": parseMinutes,
    "p": parsePeriod,
    "q": parseQuarter,
    "Q": parseUnixTimestamp,
    "s": parseUnixTimestampSeconds,
    "S": parseSeconds,
    "u": parseWeekdayNumberMonday,
    "U": parseWeekNumberSunday,
    "V": parseWeekNumberISO,
    "w": parseWeekdayNumberSunday,
    "W": parseWeekNumberMonday,
    "x": parseLocaleDate,
    "X": parseLocaleTime,
    "y": parseYear,
    "Y": parseFullYear,
    "Z": parseZone,
    "%": parseLiteralPercent
  };
  formats.x = newFormat(locale_date, formats);
  formats.X = newFormat(locale_time, formats);
  formats.c = newFormat(locale_dateTime, formats);
  utcFormats.x = newFormat(locale_date, utcFormats);
  utcFormats.X = newFormat(locale_time, utcFormats);
  utcFormats.c = newFormat(locale_dateTime, utcFormats);
  function newFormat(specifier, formats2) {
    return function(date) {
      var string = [], i5 = -1, j3 = 0, n6 = specifier.length, c9, pad2, format2;
      if (!(date instanceof Date)) date = /* @__PURE__ */ new Date(+date);
      while (++i5 < n6) {
        if (specifier.charCodeAt(i5) === 37) {
          string.push(specifier.slice(j3, i5));
          if ((pad2 = pads[c9 = specifier.charAt(++i5)]) != null) c9 = specifier.charAt(++i5);
          else pad2 = c9 === "e" ? " " : "0";
          if (format2 = formats2[c9]) c9 = format2(date, pad2);
          string.push(c9);
          j3 = i5 + 1;
        }
      }
      string.push(specifier.slice(j3, i5));
      return string.join("");
    };
  }
  function newParse(specifier, Z) {
    return function(string) {
      var d4 = newDate(1900, void 0, 1), i5 = parseSpecifier(d4, specifier, string += "", 0), week, day2;
      if (i5 != string.length) return null;
      if ("Q" in d4) return new Date(d4.Q);
      if ("s" in d4) return new Date(d4.s * 1e3 + ("L" in d4 ? d4.L : 0));
      if (Z && !("Z" in d4)) d4.Z = 0;
      if ("p" in d4) d4.H = d4.H % 12 + d4.p * 12;
      if (d4.m === void 0) d4.m = "q" in d4 ? d4.q : 0;
      if ("V" in d4) {
        if (d4.V < 1 || d4.V > 53) return null;
        if (!("w" in d4)) d4.w = 1;
        if ("Z" in d4) {
          week = utcDate(newDate(d4.y, 0, 1)), day2 = week.getUTCDay();
          week = day2 > 4 || day2 === 0 ? utcMonday.ceil(week) : utcMonday(week);
          week = utcDay_default.offset(week, (d4.V - 1) * 7);
          d4.y = week.getUTCFullYear();
          d4.m = week.getUTCMonth();
          d4.d = week.getUTCDate() + (d4.w + 6) % 7;
        } else {
          week = localDate(newDate(d4.y, 0, 1)), day2 = week.getDay();
          week = day2 > 4 || day2 === 0 ? monday.ceil(week) : monday(week);
          week = day_default.offset(week, (d4.V - 1) * 7);
          d4.y = week.getFullYear();
          d4.m = week.getMonth();
          d4.d = week.getDate() + (d4.w + 6) % 7;
        }
      } else if ("W" in d4 || "U" in d4) {
        if (!("w" in d4)) d4.w = "u" in d4 ? d4.u % 7 : "W" in d4 ? 1 : 0;
        day2 = "Z" in d4 ? utcDate(newDate(d4.y, 0, 1)).getUTCDay() : localDate(newDate(d4.y, 0, 1)).getDay();
        d4.m = 0;
        d4.d = "W" in d4 ? (d4.w + 6) % 7 + d4.W * 7 - (day2 + 5) % 7 : d4.w + d4.U * 7 - (day2 + 6) % 7;
      }
      if ("Z" in d4) {
        d4.H += d4.Z / 100 | 0;
        d4.M += d4.Z % 100;
        return utcDate(d4);
      }
      return localDate(d4);
    };
  }
  function parseSpecifier(d4, specifier, string, j3) {
    var i5 = 0, n6 = specifier.length, m3 = string.length, c9, parse;
    while (i5 < n6) {
      if (j3 >= m3) return -1;
      c9 = specifier.charCodeAt(i5++);
      if (c9 === 37) {
        c9 = specifier.charAt(i5++);
        parse = parses[c9 in pads ? specifier.charAt(i5++) : c9];
        if (!parse || (j3 = parse(d4, string, j3)) < 0) return -1;
      } else if (c9 != string.charCodeAt(j3++)) {
        return -1;
      }
    }
    return j3;
  }
  function parsePeriod(d4, string, i5) {
    var n6 = periodRe.exec(string.slice(i5));
    return n6 ? (d4.p = periodLookup.get(n6[0].toLowerCase()), i5 + n6[0].length) : -1;
  }
  function parseShortWeekday(d4, string, i5) {
    var n6 = shortWeekdayRe.exec(string.slice(i5));
    return n6 ? (d4.w = shortWeekdayLookup.get(n6[0].toLowerCase()), i5 + n6[0].length) : -1;
  }
  function parseWeekday(d4, string, i5) {
    var n6 = weekdayRe.exec(string.slice(i5));
    return n6 ? (d4.w = weekdayLookup.get(n6[0].toLowerCase()), i5 + n6[0].length) : -1;
  }
  function parseShortMonth(d4, string, i5) {
    var n6 = shortMonthRe.exec(string.slice(i5));
    return n6 ? (d4.m = shortMonthLookup.get(n6[0].toLowerCase()), i5 + n6[0].length) : -1;
  }
  function parseMonth(d4, string, i5) {
    var n6 = monthRe.exec(string.slice(i5));
    return n6 ? (d4.m = monthLookup.get(n6[0].toLowerCase()), i5 + n6[0].length) : -1;
  }
  function parseLocaleDateTime(d4, string, i5) {
    return parseSpecifier(d4, locale_dateTime, string, i5);
  }
  function parseLocaleDate(d4, string, i5) {
    return parseSpecifier(d4, locale_date, string, i5);
  }
  function parseLocaleTime(d4, string, i5) {
    return parseSpecifier(d4, locale_time, string, i5);
  }
  function formatShortWeekday(d4) {
    return locale_shortWeekdays[d4.getDay()];
  }
  function formatWeekday(d4) {
    return locale_weekdays[d4.getDay()];
  }
  function formatShortMonth(d4) {
    return locale_shortMonths[d4.getMonth()];
  }
  function formatMonth(d4) {
    return locale_months[d4.getMonth()];
  }
  function formatPeriod(d4) {
    return locale_periods[+(d4.getHours() >= 12)];
  }
  function formatQuarter(d4) {
    return 1 + ~~(d4.getMonth() / 3);
  }
  function formatUTCShortWeekday(d4) {
    return locale_shortWeekdays[d4.getUTCDay()];
  }
  function formatUTCWeekday(d4) {
    return locale_weekdays[d4.getUTCDay()];
  }
  function formatUTCShortMonth(d4) {
    return locale_shortMonths[d4.getUTCMonth()];
  }
  function formatUTCMonth(d4) {
    return locale_months[d4.getUTCMonth()];
  }
  function formatUTCPeriod(d4) {
    return locale_periods[+(d4.getUTCHours() >= 12)];
  }
  function formatUTCQuarter(d4) {
    return 1 + ~~(d4.getUTCMonth() / 3);
  }
  return {
    format: function(specifier) {
      var f2 = newFormat(specifier += "", formats);
      f2.toString = function() {
        return specifier;
      };
      return f2;
    },
    parse: function(specifier) {
      var p3 = newParse(specifier += "", false);
      p3.toString = function() {
        return specifier;
      };
      return p3;
    },
    utcFormat: function(specifier) {
      var f2 = newFormat(specifier += "", utcFormats);
      f2.toString = function() {
        return specifier;
      };
      return f2;
    },
    utcParse: function(specifier) {
      var p3 = newParse(specifier += "", true);
      p3.toString = function() {
        return specifier;
      };
      return p3;
    }
  };
}
var pads = { "-": "", "_": " ", "0": "0" };
var numberRe = /^\s*\d+/;
var percentRe = /^%/;
var requoteRe = /[\\^$*+?|[\]().{}]/g;
function pad(value, fill, width) {
  var sign = value < 0 ? "-" : "", string = (sign ? -value : value) + "", length = string.length;
  return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
}
function requote(s4) {
  return s4.replace(requoteRe, "\\$&");
}
function formatRe(names) {
  return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
}
function formatLookup(names) {
  return new Map(names.map((name, i5) => [name.toLowerCase(), i5]));
}
function parseWeekdayNumberSunday(d4, string, i5) {
  var n6 = numberRe.exec(string.slice(i5, i5 + 1));
  return n6 ? (d4.w = +n6[0], i5 + n6[0].length) : -1;
}
function parseWeekdayNumberMonday(d4, string, i5) {
  var n6 = numberRe.exec(string.slice(i5, i5 + 1));
  return n6 ? (d4.u = +n6[0], i5 + n6[0].length) : -1;
}
function parseWeekNumberSunday(d4, string, i5) {
  var n6 = numberRe.exec(string.slice(i5, i5 + 2));
  return n6 ? (d4.U = +n6[0], i5 + n6[0].length) : -1;
}
function parseWeekNumberISO(d4, string, i5) {
  var n6 = numberRe.exec(string.slice(i5, i5 + 2));
  return n6 ? (d4.V = +n6[0], i5 + n6[0].length) : -1;
}
function parseWeekNumberMonday(d4, string, i5) {
  var n6 = numberRe.exec(string.slice(i5, i5 + 2));
  return n6 ? (d4.W = +n6[0], i5 + n6[0].length) : -1;
}
function parseFullYear(d4, string, i5) {
  var n6 = numberRe.exec(string.slice(i5, i5 + 4));
  return n6 ? (d4.y = +n6[0], i5 + n6[0].length) : -1;
}
function parseYear(d4, string, i5) {
  var n6 = numberRe.exec(string.slice(i5, i5 + 2));
  return n6 ? (d4.y = +n6[0] + (+n6[0] > 68 ? 1900 : 2e3), i5 + n6[0].length) : -1;
}
function parseZone(d4, string, i5) {
  var n6 = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i5, i5 + 6));
  return n6 ? (d4.Z = n6[1] ? 0 : -(n6[2] + (n6[3] || "00")), i5 + n6[0].length) : -1;
}
function parseQuarter(d4, string, i5) {
  var n6 = numberRe.exec(string.slice(i5, i5 + 1));
  return n6 ? (d4.q = n6[0] * 3 - 3, i5 + n6[0].length) : -1;
}
function parseMonthNumber(d4, string, i5) {
  var n6 = numberRe.exec(string.slice(i5, i5 + 2));
  return n6 ? (d4.m = n6[0] - 1, i5 + n6[0].length) : -1;
}
function parseDayOfMonth(d4, string, i5) {
  var n6 = numberRe.exec(string.slice(i5, i5 + 2));
  return n6 ? (d4.d = +n6[0], i5 + n6[0].length) : -1;
}
function parseDayOfYear(d4, string, i5) {
  var n6 = numberRe.exec(string.slice(i5, i5 + 3));
  return n6 ? (d4.m = 0, d4.d = +n6[0], i5 + n6[0].length) : -1;
}
function parseHour24(d4, string, i5) {
  var n6 = numberRe.exec(string.slice(i5, i5 + 2));
  return n6 ? (d4.H = +n6[0], i5 + n6[0].length) : -1;
}
function parseMinutes(d4, string, i5) {
  var n6 = numberRe.exec(string.slice(i5, i5 + 2));
  return n6 ? (d4.M = +n6[0], i5 + n6[0].length) : -1;
}
function parseSeconds(d4, string, i5) {
  var n6 = numberRe.exec(string.slice(i5, i5 + 2));
  return n6 ? (d4.S = +n6[0], i5 + n6[0].length) : -1;
}
function parseMilliseconds(d4, string, i5) {
  var n6 = numberRe.exec(string.slice(i5, i5 + 3));
  return n6 ? (d4.L = +n6[0], i5 + n6[0].length) : -1;
}
function parseMicroseconds(d4, string, i5) {
  var n6 = numberRe.exec(string.slice(i5, i5 + 6));
  return n6 ? (d4.L = Math.floor(n6[0] / 1e3), i5 + n6[0].length) : -1;
}
function parseLiteralPercent(d4, string, i5) {
  var n6 = percentRe.exec(string.slice(i5, i5 + 1));
  return n6 ? i5 + n6[0].length : -1;
}
function parseUnixTimestamp(d4, string, i5) {
  var n6 = numberRe.exec(string.slice(i5));
  return n6 ? (d4.Q = +n6[0], i5 + n6[0].length) : -1;
}
function parseUnixTimestampSeconds(d4, string, i5) {
  var n6 = numberRe.exec(string.slice(i5));
  return n6 ? (d4.s = +n6[0], i5 + n6[0].length) : -1;
}
function formatDayOfMonth(d4, p3) {
  return pad(d4.getDate(), p3, 2);
}
function formatHour24(d4, p3) {
  return pad(d4.getHours(), p3, 2);
}
function formatHour12(d4, p3) {
  return pad(d4.getHours() % 12 || 12, p3, 2);
}
function formatDayOfYear(d4, p3) {
  return pad(1 + day_default.count(year_default(d4), d4), p3, 3);
}
function formatMilliseconds(d4, p3) {
  return pad(d4.getMilliseconds(), p3, 3);
}
function formatMicroseconds(d4, p3) {
  return formatMilliseconds(d4, p3) + "000";
}
function formatMonthNumber(d4, p3) {
  return pad(d4.getMonth() + 1, p3, 2);
}
function formatMinutes(d4, p3) {
  return pad(d4.getMinutes(), p3, 2);
}
function formatSeconds(d4, p3) {
  return pad(d4.getSeconds(), p3, 2);
}
function formatWeekdayNumberMonday(d4) {
  var day2 = d4.getDay();
  return day2 === 0 ? 7 : day2;
}
function formatWeekNumberSunday(d4, p3) {
  return pad(sunday.count(year_default(d4) - 1, d4), p3, 2);
}
function dISO(d4) {
  var day2 = d4.getDay();
  return day2 >= 4 || day2 === 0 ? thursday(d4) : thursday.ceil(d4);
}
function formatWeekNumberISO(d4, p3) {
  d4 = dISO(d4);
  return pad(thursday.count(year_default(d4), d4) + (year_default(d4).getDay() === 4), p3, 2);
}
function formatWeekdayNumberSunday(d4) {
  return d4.getDay();
}
function formatWeekNumberMonday(d4, p3) {
  return pad(monday.count(year_default(d4) - 1, d4), p3, 2);
}
function formatYear(d4, p3) {
  return pad(d4.getFullYear() % 100, p3, 2);
}
function formatYearISO(d4, p3) {
  d4 = dISO(d4);
  return pad(d4.getFullYear() % 100, p3, 2);
}
function formatFullYear(d4, p3) {
  return pad(d4.getFullYear() % 1e4, p3, 4);
}
function formatFullYearISO(d4, p3) {
  var day2 = d4.getDay();
  d4 = day2 >= 4 || day2 === 0 ? thursday(d4) : thursday.ceil(d4);
  return pad(d4.getFullYear() % 1e4, p3, 4);
}
function formatZone(d4) {
  var z4 = d4.getTimezoneOffset();
  return (z4 > 0 ? "-" : (z4 *= -1, "+")) + pad(z4 / 60 | 0, "0", 2) + pad(z4 % 60, "0", 2);
}
function formatUTCDayOfMonth(d4, p3) {
  return pad(d4.getUTCDate(), p3, 2);
}
function formatUTCHour24(d4, p3) {
  return pad(d4.getUTCHours(), p3, 2);
}
function formatUTCHour12(d4, p3) {
  return pad(d4.getUTCHours() % 12 || 12, p3, 2);
}
function formatUTCDayOfYear(d4, p3) {
  return pad(1 + utcDay_default.count(utcYear_default(d4), d4), p3, 3);
}
function formatUTCMilliseconds(d4, p3) {
  return pad(d4.getUTCMilliseconds(), p3, 3);
}
function formatUTCMicroseconds(d4, p3) {
  return formatUTCMilliseconds(d4, p3) + "000";
}
function formatUTCMonthNumber(d4, p3) {
  return pad(d4.getUTCMonth() + 1, p3, 2);
}
function formatUTCMinutes(d4, p3) {
  return pad(d4.getUTCMinutes(), p3, 2);
}
function formatUTCSeconds(d4, p3) {
  return pad(d4.getUTCSeconds(), p3, 2);
}
function formatUTCWeekdayNumberMonday(d4) {
  var dow = d4.getUTCDay();
  return dow === 0 ? 7 : dow;
}
function formatUTCWeekNumberSunday(d4, p3) {
  return pad(utcSunday.count(utcYear_default(d4) - 1, d4), p3, 2);
}
function UTCdISO(d4) {
  var day2 = d4.getUTCDay();
  return day2 >= 4 || day2 === 0 ? utcThursday(d4) : utcThursday.ceil(d4);
}
function formatUTCWeekNumberISO(d4, p3) {
  d4 = UTCdISO(d4);
  return pad(utcThursday.count(utcYear_default(d4), d4) + (utcYear_default(d4).getUTCDay() === 4), p3, 2);
}
function formatUTCWeekdayNumberSunday(d4) {
  return d4.getUTCDay();
}
function formatUTCWeekNumberMonday(d4, p3) {
  return pad(utcMonday.count(utcYear_default(d4) - 1, d4), p3, 2);
}
function formatUTCYear(d4, p3) {
  return pad(d4.getUTCFullYear() % 100, p3, 2);
}
function formatUTCYearISO(d4, p3) {
  d4 = UTCdISO(d4);
  return pad(d4.getUTCFullYear() % 100, p3, 2);
}
function formatUTCFullYear(d4, p3) {
  return pad(d4.getUTCFullYear() % 1e4, p3, 4);
}
function formatUTCFullYearISO(d4, p3) {
  var day2 = d4.getUTCDay();
  d4 = day2 >= 4 || day2 === 0 ? utcThursday(d4) : utcThursday.ceil(d4);
  return pad(d4.getUTCFullYear() % 1e4, p3, 4);
}
function formatUTCZone() {
  return "+0000";
}
function formatLiteralPercent() {
  return "%";
}
function formatUnixTimestamp(d4) {
  return +d4;
}
function formatUnixTimestampSeconds(d4) {
  return Math.floor(+d4 / 1e3);
}

// node_modules/@nivo/core/node_modules/d3-time-format/src/defaultLocale.js
var locale2;
var timeFormat;
var timeParse;
var utcFormat;
var utcParse;
defaultLocale2({
  dateTime: "%x, %X",
  date: "%-m/%-d/%Y",
  time: "%-I:%M:%S %p",
  periods: ["AM", "PM"],
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});
function defaultLocale2(definition) {
  locale2 = formatLocale(definition);
  timeFormat = locale2.format;
  timeParse = locale2.parse;
  utcFormat = locale2.utcFormat;
  utcParse = locale2.utcParse;
  return locale2;
}

// node_modules/@nivo/core/node_modules/d3-time-format/src/isoFormat.js
var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";
function formatIsoNative(date) {
  return date.toISOString();
}
var formatIso = Date.prototype.toISOString ? formatIsoNative : utcFormat(isoSpecifier);

// node_modules/@nivo/core/node_modules/d3-time-format/src/isoParse.js
function parseIsoNative(string) {
  var date = new Date(string);
  return isNaN(date) ? null : date;
}
var parseIso = +/* @__PURE__ */ new Date("2000-01-01T00:00:00.000Z") ? parseIsoNative : utcParse(isoSpecifier);

// node_modules/@nivo/core/dist/nivo-core.mjs
var import_get2 = __toESM(require_get(), 1);
var import_isPlainObject = __toESM(require_isPlainObject(), 1);
var import_pick = __toESM(require_pick(), 1);
var import_isEqual = __toESM(require_isEqual(), 1);
var import_set3 = __toESM(require_set(), 1);
var Sr = (0, import_react18.createContext)();
var Yr = { animate: true, config: "default" };
var qr = function(e7) {
  var t5 = e7.children, n6 = e7.animate, o5 = void 0 === n6 || n6, i5 = e7.config, a4 = void 0 === i5 ? "default" : i5, l4 = (0, import_react18.useMemo)((function() {
    var e8 = (0, import_isString.default)(a4) ? config[a4] : a4;
    return { animate: o5, config: e8 };
  }), [o5, a4]);
  return (0, import_jsx_runtime2.jsx)(Sr.Provider, { value: l4, children: t5 });
};
var Dr = function() {
  return (0, import_react18.useContext)(Sr);
};
var Er = function(e7) {
  var r5 = e7.children, t5 = e7.condition, o5 = e7.wrapper;
  return t5 ? (0, import_react18.cloneElement)(o5, {}, r5) : r5;
};
var Ur = { position: "relative" };
var Fr = function(e7) {
  var r5 = e7.children, t5 = e7.theme, n6 = e7.renderWrapper, i5 = void 0 === n6 || n6, a4 = e7.isInteractive, l4 = void 0 === a4 || a4, d4 = e7.animate, u4 = e7.motionConfig, c9 = (0, import_react18.useRef)(null);
  return (0, import_jsx_runtime2.jsx)(z, { theme: t5, children: (0, import_jsx_runtime2.jsx)(qr, { animate: d4, config: u4, children: (0, import_jsx_runtime2.jsx)(W2, { container: c9, children: (0, import_jsx_runtime2.jsxs)(Er, { condition: i5, wrapper: (0, import_jsx_runtime2.jsx)("div", { style: Ur, ref: c9 }), children: [r5, l4 && (0, import_jsx_runtime2.jsx)(M2, {})] }) }) }) });
};
var Kr = function(e7, r5) {
  return e7.width === r5.width && e7.height === r5.height;
};
var Nr = function(e7) {
  var r5 = e7.children, t5 = e7.width, n6 = e7.height, o5 = e7.onResize, i5 = e7.debounceResize, l4 = a({ width: t5, height: n6 }, i5, { equalityFn: Kr })[0];
  return (0, import_react18.useEffect)((function() {
    null == o5 || o5(l4);
  }), [l4, o5]), (0, import_jsx_runtime2.jsx)(import_jsx_runtime2.Fragment, { children: r5(l4) });
};
var $r = function(e7) {
  var r5 = e7.children, t5 = e7.defaultWidth, n6 = e7.defaultHeight, o5 = e7.onResize, i5 = e7.debounceResize, a4 = void 0 === i5 ? 0 : i5;
  return (0, import_jsx_runtime2.jsx)(AutoSizer, { defaultWidth: t5, defaultHeight: n6, children: function(e8) {
    var t6 = e8.width, n7 = e8.height;
    return (0, import_jsx_runtime2.jsx)(Nr, { width: t6, height: n7, onResize: o5, debounceResize: a4, children: r5 });
  } });
};
function Jr(e7, r5) {
  (null == r5 || r5 > e7.length) && (r5 = e7.length);
  for (var t5 = 0, n6 = Array(r5); t5 < r5; t5++) n6[t5] = e7[t5];
  return n6;
}
function Qr(e7, r5) {
  var t5 = "undefined" != typeof Symbol && e7[Symbol.iterator] || e7["@@iterator"];
  if (t5) return (t5 = t5.call(e7)).next.bind(t5);
  if (Array.isArray(e7) || (t5 = (function(e8, r6) {
    if (e8) {
      if ("string" == typeof e8) return Jr(e8, r6);
      var t6 = {}.toString.call(e8).slice(8, -1);
      return "Object" === t6 && e8.constructor && (t6 = e8.constructor.name), "Map" === t6 || "Set" === t6 ? Array.from(e8) : "Arguments" === t6 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t6) ? Jr(e8, r6) : void 0;
    }
  })(e7)) || r5 && e7 && "number" == typeof e7.length) {
    t5 && (e7 = t5);
    var n6 = 0;
    return function() {
      return n6 >= e7.length ? { done: true } : { done: false, value: e7[n6++] };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Vr() {
  return Vr = Object.assign ? Object.assign.bind() : function(e7) {
    for (var r5 = 1; r5 < arguments.length; r5++) {
      var t5 = arguments[r5];
      for (var n6 in t5) ({}).hasOwnProperty.call(t5, n6) && (e7[n6] = t5[n6]);
    }
    return e7;
  }, Vr.apply(null, arguments);
}
function Zr(e7, r5) {
  if (null == e7) return {};
  var t5 = {};
  for (var n6 in e7) if ({}.hasOwnProperty.call(e7, n6)) {
    if (-1 !== r5.indexOf(n6)) continue;
    t5[n6] = e7[n6];
  }
  return t5;
}
var rt = ["id", "colors"];
var tt = function(e7) {
  var r5 = e7.id, t5 = e7.colors, n6 = Zr(e7, rt);
  return (0, import_jsx_runtime2.jsx)("linearGradient", Vr({ id: r5, x1: 0, x2: 0, y1: 0, y2: 1 }, n6, { children: t5.map((function(e8) {
    var r6 = e8.offset, t6 = e8.color, n7 = e8.opacity;
    return (0, import_jsx_runtime2.jsx)("stop", { offset: r6 + "%", stopColor: t6, stopOpacity: void 0 !== n7 ? n7 : 1 }, r6);
  })) }));
};
var ot = { linearGradient: tt };
var it = { color: "#000000", background: "#ffffff", size: 4, padding: 4, stagger: false };
var at = (0, import_react18.memo)((function(e7) {
  var r5 = e7.id, t5 = e7.background, n6 = void 0 === t5 ? it.background : t5, o5 = e7.color, i5 = void 0 === o5 ? it.color : o5, a4 = e7.size, l4 = void 0 === a4 ? it.size : a4, d4 = e7.padding, u4 = void 0 === d4 ? it.padding : d4, c9 = e7.stagger, s4 = void 0 === c9 ? it.stagger : c9, f2 = l4 + u4, h2 = l4 / 2, p3 = u4 / 2;
  return true === s4 && (f2 = 2 * l4 + 2 * u4), (0, import_jsx_runtime2.jsxs)("pattern", { id: r5, width: f2, height: f2, patternUnits: "userSpaceOnUse", children: [(0, import_jsx_runtime2.jsx)("rect", { width: f2, height: f2, fill: n6 }), (0, import_jsx_runtime2.jsx)("circle", { cx: p3 + h2, cy: p3 + h2, r: h2, fill: i5 }), s4 && (0, import_jsx_runtime2.jsx)("circle", { cx: 1.5 * u4 + l4 + h2, cy: 1.5 * u4 + l4 + h2, r: h2, fill: i5 })] });
}));
var dt = 2 * Math.PI;
var ut = function(e7) {
  return e7 * Math.PI / 180;
};
var ct = function(e7) {
  return 180 * e7 / Math.PI;
};
var ft = function(e7, r5) {
  return { x: Math.cos(e7) * r5, y: Math.sin(e7) * r5 };
};
var ht = function(e7) {
  var r5 = e7 % 360;
  return r5 < 0 && (r5 += 360), r5;
};
var mt = { spacing: 5, rotation: 0, background: "#000000", color: "#ffffff", lineWidth: 2 };
var vt = (0, import_react18.memo)((function(e7) {
  var r5 = e7.id, t5 = e7.spacing, n6 = void 0 === t5 ? mt.spacing : t5, o5 = e7.rotation, i5 = void 0 === o5 ? mt.rotation : o5, a4 = e7.background, l4 = void 0 === a4 ? mt.background : a4, d4 = e7.color, u4 = void 0 === d4 ? mt.color : d4, c9 = e7.lineWidth, s4 = void 0 === c9 ? mt.lineWidth : c9, f2 = Math.round(i5) % 360, h2 = Math.abs(n6);
  f2 > 180 ? f2 -= 360 : f2 > 90 ? f2 -= 180 : f2 < -180 ? f2 += 360 : f2 < -90 && (f2 += 180);
  var p3, g2 = h2, b4 = h2;
  return 0 === f2 ? p3 = "\n                M 0 0 L " + g2 + " 0\n                M 0 " + b4 + " L " + g2 + " " + b4 + "\n            " : 90 === f2 ? p3 = "\n                M 0 0 L 0 " + b4 + "\n                M " + g2 + " 0 L " + g2 + " " + b4 + "\n            " : (g2 = Math.abs(h2 / Math.sin(ut(f2))), b4 = h2 / Math.sin(ut(90 - f2)), p3 = f2 > 0 ? "\n                    M 0 " + -b4 + " L " + 2 * g2 + " " + b4 + "\n                    M " + -g2 + " " + -b4 + " L " + g2 + " " + b4 + "\n                    M " + -g2 + " 0 L " + g2 + " " + 2 * b4 + "\n                " : "\n                    M " + -g2 + " " + b4 + " L " + g2 + " " + -b4 + "\n                    M " + -g2 + " " + 2 * b4 + " L " + 2 * g2 + " " + -b4 + "\n                    M 0 " + 2 * b4 + " L " + 2 * g2 + " 0\n                "), (0, import_jsx_runtime2.jsxs)("pattern", { id: r5, width: g2, height: b4, patternUnits: "userSpaceOnUse", children: [(0, import_jsx_runtime2.jsx)("rect", { width: g2, height: b4, fill: l4, stroke: "rgba(255, 0, 0, 0.1)", strokeWidth: 0 }), (0, import_jsx_runtime2.jsx)("path", { d: p3, strokeWidth: s4, stroke: u4, strokeLinecap: "square" })] });
}));
var _t = { color: "#000000", background: "#ffffff", size: 4, padding: 4, stagger: false };
var wt = (0, import_react18.memo)((function(e7) {
  var r5 = e7.id, t5 = e7.color, n6 = void 0 === t5 ? _t.color : t5, o5 = e7.background, i5 = void 0 === o5 ? _t.background : o5, a4 = e7.size, l4 = void 0 === a4 ? _t.size : a4, d4 = e7.padding, u4 = void 0 === d4 ? _t.padding : d4, c9 = e7.stagger, s4 = void 0 === c9 ? _t.stagger : c9, f2 = l4 + u4, h2 = u4 / 2;
  return true === s4 && (f2 = 2 * l4 + 2 * u4), (0, import_jsx_runtime2.jsxs)("pattern", { id: r5, width: f2, height: f2, patternUnits: "userSpaceOnUse", children: [(0, import_jsx_runtime2.jsx)("rect", { width: f2, height: f2, fill: i5 }), (0, import_jsx_runtime2.jsx)("rect", { x: h2, y: h2, width: l4, height: l4, fill: n6 }), s4 && (0, import_jsx_runtime2.jsx)("rect", { x: 1.5 * u4 + l4, y: 1.5 * u4 + l4, width: l4, height: l4, fill: n6 })] });
}));
var xt = { patternDots: at, patternLines: vt, patternSquares: wt };
var Ot = ["type"];
var zt = Vr({}, ot, xt);
var Mt = (0, import_react18.memo)((function(e7) {
  var r5 = e7.defs;
  return !r5 || r5.length < 1 ? null : (0, import_jsx_runtime2.jsx)("defs", { "aria-hidden": true, children: r5.map((function(e8) {
    var r6 = e8.type, t5 = Zr(e8, Ot);
    return zt[r6] ? (0, import_react18.createElement)(zt[r6], Vr({ key: t5.id }, t5)) : null;
  })) });
}));
var Rt = (0, import_react18.forwardRef)((function(e7, r5) {
  var t5 = e7.width, n6 = e7.height, o5 = e7.margin, i5 = e7.defs, a4 = e7.children, l4 = e7.role, d4 = e7.ariaLabel, u4 = e7.ariaLabelledBy, c9 = e7.ariaDescribedBy, s4 = e7.isFocusable, f2 = M();
  return (0, import_jsx_runtime2.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", width: t5, height: n6, role: l4, "aria-label": d4, "aria-labelledby": u4, "aria-describedby": c9, focusable: s4, tabIndex: s4 ? 0 : void 0, ref: r5, children: [(0, import_jsx_runtime2.jsx)(Mt, { defs: i5 }), (0, import_jsx_runtime2.jsx)("rect", { width: t5, height: n6, fill: f2.background }), (0, import_jsx_runtime2.jsx)("g", { transform: "translate(" + o5.left + "," + o5.top + ")", children: a4 })] });
}));
var jt = (0, import_react18.memo)((function(e7) {
  var r5 = e7.size, t5 = e7.color, n6 = e7.borderWidth, o5 = e7.borderColor;
  return (0, import_jsx_runtime2.jsx)("circle", { r: r5 / 2, fill: t5, stroke: o5, strokeWidth: n6, style: { pointerEvents: "none" } });
}));
var Ct = (0, import_react18.memo)((function(e7) {
  var r5 = e7.x, t5 = e7.y, n6 = e7.symbol, o5 = void 0 === n6 ? jt : n6, a4 = e7.size, l4 = e7.datum, u4 = e7.color, c9 = e7.borderWidth, s4 = e7.borderColor, f2 = e7.label, h2 = e7.labelTextAnchor, p3 = void 0 === h2 ? "middle" : h2, g2 = e7.labelYOffset, b4 = void 0 === g2 ? -12 : g2, m3 = e7.ariaLabel, _2 = e7.ariaLabelledBy, w2 = e7.ariaDescribedBy, O3 = e7.ariaHidden, R2 = e7.ariaDisabled, j3 = e7.isFocusable, C3 = void 0 !== j3 && j3, B = e7.tabIndex, P3 = void 0 === B ? 0 : B, W3 = e7.onFocus, G = e7.onBlur, I = e7.testId, A2 = M(), L2 = Dr(), S2 = L2.animate, Y = L2.config, q = useSpring({ transform: "translate(" + r5 + ", " + t5 + ")", config: Y, immediate: !S2 }), D = (0, import_react18.useCallback)((function(e8) {
    null == W3 || W3(l4, e8);
  }), [W3, l4]), E2 = (0, import_react18.useCallback)((function(e8) {
    null == G || G(l4, e8);
  }), [G, l4]);
  return (0, import_jsx_runtime2.jsxs)(animated.g, { transform: q.transform, style: { pointerEvents: "none" }, focusable: C3, tabIndex: C3 ? P3 : void 0, "aria-label": m3, "aria-labelledby": _2, "aria-describedby": w2, "aria-disabled": R2, "aria-hidden": O3, onFocus: C3 && W3 ? D : void 0, onBlur: C3 && G ? E2 : void 0, "data-testid": I, children: [(0, import_react18.createElement)(o5, { size: a4, color: u4, datum: l4, borderWidth: c9, borderColor: s4 }), f2 && (0, import_jsx_runtime2.jsx)("text", { textAnchor: p3, y: b4, style: b(A2.dots.text), children: f2 })] });
}));
var Bt = (0, import_react18.memo)((function(e7) {
  var r5 = e7.width, t5 = e7.height, n6 = e7.axis, o5 = e7.scale, i5 = e7.value, a4 = e7.lineStyle, l4 = e7.textStyle, d4 = e7.legend, u4 = e7.legendNode, c9 = e7.legendPosition, s4 = void 0 === c9 ? "top-right" : c9, f2 = e7.legendOffsetX, h2 = void 0 === f2 ? 14 : f2, p3 = e7.legendOffsetY, g2 = void 0 === p3 ? 14 : p3, b4 = e7.legendOrientation, m3 = void 0 === b4 ? "horizontal" : b4, y3 = M(), _2 = 0, w2 = 0, k2 = 0, x2 = 0;
  if ("y" === n6 ? (k2 = o5(i5), w2 = r5) : (_2 = o5(i5), x2 = t5), d4 && !u4) {
    var O3 = (function(e8) {
      var r6 = e8.axis, t6 = e8.width, n7 = e8.height, o6 = e8.position, i6 = e8.offsetX, a5 = e8.offsetY, l5 = e8.orientation, d5 = 0, u5 = 0, c10 = "vertical" === l5 ? -90 : 0, s5 = "start";
      if ("x" === r6) switch (o6) {
        case "top-left":
          d5 = -i6, u5 = a5, s5 = "end";
          break;
        case "top":
          u5 = -a5, s5 = "horizontal" === l5 ? "middle" : "start";
          break;
        case "top-right":
          d5 = i6, u5 = a5, s5 = "horizontal" === l5 ? "start" : "end";
          break;
        case "right":
          d5 = i6, u5 = n7 / 2, s5 = "horizontal" === l5 ? "start" : "middle";
          break;
        case "bottom-right":
          d5 = i6, u5 = n7 - a5, s5 = "start";
          break;
        case "bottom":
          u5 = n7 + a5, s5 = "horizontal" === l5 ? "middle" : "end";
          break;
        case "bottom-left":
          u5 = n7 - a5, d5 = -i6, s5 = "horizontal" === l5 ? "end" : "start";
          break;
        case "left":
          d5 = -i6, u5 = n7 / 2, s5 = "horizontal" === l5 ? "end" : "middle";
      }
      else switch (o6) {
        case "top-left":
          d5 = i6, u5 = -a5, s5 = "start";
          break;
        case "top":
          d5 = t6 / 2, u5 = -a5, s5 = "horizontal" === l5 ? "middle" : "start";
          break;
        case "top-right":
          d5 = t6 - i6, u5 = -a5, s5 = "horizontal" === l5 ? "end" : "start";
          break;
        case "right":
          d5 = t6 + i6, s5 = "horizontal" === l5 ? "start" : "middle";
          break;
        case "bottom-right":
          d5 = t6 - i6, u5 = a5, s5 = "end";
          break;
        case "bottom":
          d5 = t6 / 2, u5 = a5, s5 = "horizontal" === l5 ? "middle" : "end";
          break;
        case "bottom-left":
          d5 = i6, u5 = a5, s5 = "horizontal" === l5 ? "start" : "end";
          break;
        case "left":
          d5 = -i6, s5 = "horizontal" === l5 ? "end" : "middle";
      }
      return { x: d5, y: u5, rotation: c10, textAnchor: s5 };
    })({ axis: n6, width: r5, height: t5, position: s4, offsetX: h2, offsetY: g2, orientation: m3 });
    u4 = (0, import_jsx_runtime2.jsx)("text", { transform: "translate(" + O3.x + ", " + O3.y + ") rotate(" + O3.rotation + ")", textAnchor: O3.textAnchor, dominantBaseline: "central", style: l4, children: d4 });
  }
  return (0, import_jsx_runtime2.jsxs)("g", { transform: "translate(" + _2 + ", " + k2 + ")", children: [(0, import_jsx_runtime2.jsx)("line", { x1: 0, x2: w2, y1: 0, y2: x2, stroke: y3.markers.lineColor, strokeWidth: y3.markers.lineStrokeWidth, style: a4 }), u4] });
}));
var Pt = (0, import_react18.memo)((function(e7) {
  var r5 = e7.markers, t5 = e7.width, n6 = e7.height, o5 = e7.xScale, i5 = e7.yScale;
  return r5 && 0 !== r5.length ? r5.map((function(e8, r6) {
    return (0, import_jsx_runtime2.jsx)(Bt, Vr({}, e8, { width: t5, height: n6, scale: "y" === e8.axis ? i5 : o5 }), r6);
  })) : null;
}));
var It = function(e7) {
  var t5 = Dr(), n6 = t5.animate, i5 = t5.config, l4 = (function(e8) {
    var r5 = (0, import_react18.useRef)();
    return (0, import_react18.useEffect)((function() {
      r5.current = e8;
    }), [e8]), r5.current;
  })(e7), d4 = (0, import_react18.useMemo)((function() {
    return string_default(l4, e7);
  }), [l4, e7]), u4 = useSpring({ from: { value: 0 }, to: { value: 1 }, reset: true, config: i5, immediate: !n6 }).value;
  return to2(u4, d4);
};
var At = (0, import_react18.createContext)(void 0);
var Lt = { basis: basis_default, basisClosed: basisClosed_default, basisOpen: basisOpen_default, bundle: bundle_default, cardinal: cardinal_default, cardinalClosed: cardinalClosed_default, cardinalOpen: cardinalOpen_default, catmullRom: catmullRom_default, catmullRomClosed: catmullRomClosed_default, catmullRomOpen: catmullRomOpen_default, linear: linear_default, linearClosed: linearClosed_default, monotoneX, monotoneY, natural: natural_default, step: step_default, stepAfter, stepBefore };
var St = Object.keys(Lt);
var Yt = St.filter((function(e7) {
  return e7.endsWith("Closed");
}));
var qt = (0, import_without.default)(St, "bundle", "basisClosed", "basisOpen", "cardinalClosed", "cardinalOpen", "catmullRomClosed", "catmullRomOpen", "linearClosed");
var Dt = (0, import_without.default)(St, "bundle", "basisClosed", "basisOpen", "cardinalClosed", "cardinalOpen", "catmullRomClosed", "catmullRomOpen", "linearClosed");
var Ut = { ascending: ascending_default, descending: descending_default, insideOut: insideOut_default, none: none_default2, reverse: reverse_default };
var Ft = Object.keys(Ut);
var Ht = { expand: expand_default, diverging: diverging_default, none: none_default, silhouette: silhouette_default, wiggle: wiggle_default };
var Xt = Object.keys(Ht);
var Jt = { nivo: ["#d76445", "#f47560", "#e8c1a0", "#97e3d5", "#61cdbb", "#00b0a7"], BrBG: (0, import_last.default)(scheme), PRGn: (0, import_last.default)(scheme2), PiYG: (0, import_last.default)(scheme3), PuOr: (0, import_last.default)(scheme4), RdBu: (0, import_last.default)(scheme5), RdGy: (0, import_last.default)(scheme6), RdYlBu: (0, import_last.default)(scheme7), RdYlGn: (0, import_last.default)(scheme8), spectral: (0, import_last.default)(scheme9), blues: (0, import_last.default)(scheme22), greens: (0, import_last.default)(scheme23), greys: (0, import_last.default)(scheme24), oranges: (0, import_last.default)(scheme27), purples: (0, import_last.default)(scheme25), reds: (0, import_last.default)(scheme26), BuGn: (0, import_last.default)(scheme10), BuPu: (0, import_last.default)(scheme11), GnBu: (0, import_last.default)(scheme12), OrRd: (0, import_last.default)(scheme13), PuBuGn: (0, import_last.default)(scheme14), PuBu: (0, import_last.default)(scheme15), PuRd: (0, import_last.default)(scheme16), RdPu: (0, import_last.default)(scheme17), YlGnBu: (0, import_last.default)(scheme18), YlGn: (0, import_last.default)(scheme19), YlOrBr: (0, import_last.default)(scheme20), YlOrRd: (0, import_last.default)(scheme21) };
var Qt = Object.keys(Jt);
var Zt = { nivo: ["#e8c1a0", "#f47560", "#f1e15b", "#e8a838", "#61cdbb", "#97e3d5"], category10: category10_default, accent: Accent_default, dark2: Dark2_default, paired: Paired_default, pastel1: Pastel1_default, pastel2: Pastel2_default, set1: Set1_default, set2: Set2_default, set3: Set3_default, brown_blueGreen: (0, import_last.default)(scheme), purpleRed_green: (0, import_last.default)(scheme2), pink_yellowGreen: (0, import_last.default)(scheme3), purple_orange: (0, import_last.default)(scheme4), red_blue: (0, import_last.default)(scheme5), red_grey: (0, import_last.default)(scheme6), red_yellow_blue: (0, import_last.default)(scheme7), red_yellow_green: (0, import_last.default)(scheme8), spectral: (0, import_last.default)(scheme9), blues: (0, import_last.default)(scheme22), greens: (0, import_last.default)(scheme23), greys: (0, import_last.default)(scheme24), oranges: (0, import_last.default)(scheme27), purples: (0, import_last.default)(scheme25), reds: (0, import_last.default)(scheme26), blue_green: (0, import_last.default)(scheme10), blue_purple: (0, import_last.default)(scheme11), green_blue: (0, import_last.default)(scheme12), orange_red: (0, import_last.default)(scheme13), purple_blue_green: (0, import_last.default)(scheme14), purple_blue: (0, import_last.default)(scheme15), purple_red: (0, import_last.default)(scheme16), red_purple: (0, import_last.default)(scheme17), yellow_green_blue: (0, import_last.default)(scheme18), yellow_green: (0, import_last.default)(scheme19), yellow_orange_brown: (0, import_last.default)(scheme20), yellow_orange_red: (0, import_last.default)(scheme21) };
var dn = ordinal(Set3_default);
var un = { top: 0, right: 0, bottom: 0, left: 0 };
var cn = function(e7, t5, n6) {
  return void 0 === n6 && (n6 = {}), (0, import_react18.useMemo)((function() {
    var r5 = Vr({}, un, n6);
    return { margin: r5, innerWidth: e7 - r5.left - r5.right, innerHeight: t5 - r5.top - r5.bottom, outerWidth: e7, outerHeight: t5 };
  }), [e7, t5, n6]);
};
var sn = function() {
  var e7 = (0, import_react18.useRef)(null), r5 = (0, import_react18.useState)({ left: 0, top: 0, width: 0, height: 0 }), t5 = r5[0], n6 = r5[1], i5 = (0, import_react18.useState)((function() {
    return "undefined" == typeof ResizeObserver ? null : new ResizeObserver((function(e8) {
      var r6 = e8[0];
      return n6(r6.contentRect);
    }));
  }))[0];
  return (0, import_react18.useEffect)((function() {
    return e7.current && null !== i5 && i5.observe(e7.current), function() {
      null !== i5 && i5.disconnect();
    };
  }), [i5]), [e7, t5];
};
var fn = function(e7) {
  return "function" == typeof e7 ? e7 : "string" == typeof e7 ? 0 === e7.indexOf("time:") ? timeFormat(e7.slice("5")) : format(e7) : function(e8) {
    return "" + e8;
  };
};
var hn = function(e7) {
  return (0, import_react18.useMemo)((function() {
    return fn(e7);
  }), [e7]);
};
var gn = function(e7) {
  return (0, import_isFunction.default)(e7) ? e7 : function(r5) {
    return (0, import_get2.default)(r5, e7);
  };
};
var bn = function(e7) {
  return (0, import_react18.useMemo)((function() {
    return gn(e7);
  }), [e7]);
};
var vn = function(e7, r5, t5) {
  var n6 = r5.width - e7.width, o5 = r5.height - e7.height, i5 = 0, a4 = 0;
  return "center" === t5 && (i5 = n6 / 2, a4 = o5 / 2), "top" === t5 && (i5 = n6 / 2), "top-right" === t5 && (i5 = n6), "right" === t5 && (i5 = n6, a4 = o5 / 2), "bottom-right" === t5 && (i5 = n6, a4 = o5), "bottom" === t5 && (i5 = n6 / 2, a4 = o5), "bottom-left" === t5 && (a4 = o5), "left" === t5 && (a4 = o5 / 2), [i5, a4];
};
var wn = function(e7, r5, t5, n6, o5, i5) {
  return e7 <= o5 && o5 <= e7 + t5 && r5 <= i5 && i5 <= r5 + n6;
};
var kn = function(e7, r5) {
  var t5, n6 = "touches" in r5 ? r5.touches[0] : r5, o5 = n6.clientX, i5 = n6.clientY, a4 = e7.getBoundingClientRect(), l4 = (t5 = void 0 !== e7.getBBox ? e7.getBBox() : { width: e7.offsetWidth || 0, height: e7.offsetHeight || 0 }).width === a4.width ? 1 : t5.width / a4.width;
  return [(o5 - a4.left) * l4, (i5 - a4.top) * l4];
};
var xn = Object.keys(ot);
var On = Object.keys(xt);
var zn = function(e7, r5, t5) {
  if ("*" === e7) return true;
  if ((0, import_isFunction.default)(e7)) return e7(r5);
  if ((0, import_isPlainObject.default)(e7)) {
    var n6 = t5 ? (0, import_get2.default)(r5, t5) : r5;
    return (0, import_isEqual.default)((0, import_pick.default)(n6, Object.keys(e7)), e7);
  }
  return false;
};
var Mn = function(e7, r5, t5, n6) {
  var o5 = void 0 === n6 ? {} : n6, i5 = o5.dataKey, a4 = o5.colorKey, l4 = void 0 === a4 ? "color" : a4, d4 = o5.targetKey, u4 = void 0 === d4 ? "fill" : d4, c9 = [], s4 = {};
  return e7.length && r5.length && (c9 = [].concat(e7), r5.forEach((function(r6) {
    for (var n7, o6 = function() {
      var t6 = n7.value, o7 = t6.id, a6 = t6.match;
      if (zn(a6, r6, i5)) {
        var d5 = e7.find((function(e8) {
          return e8.id === o7;
        }));
        if (d5) {
          if (On.includes(d5.type)) if ("inherit" === d5.background || "inherit" === d5.color) {
            var f2 = (0, import_get2.default)(r6, l4), h2 = d5.background, p3 = d5.color, g2 = o7;
            "inherit" === d5.background && (g2 = g2 + ".bg." + f2, h2 = f2), "inherit" === d5.color && (g2 = g2 + ".fg." + f2, p3 = f2), (0, import_set3.default)(r6, u4, "url(#" + g2 + ")"), s4[g2] || (c9.push(Vr({}, d5, { id: g2, background: h2, color: p3 })), s4[g2] = 1);
          } else (0, import_set3.default)(r6, u4, "url(#" + o7 + ")");
          else if (xn.includes(d5.type)) {
            if (d5.colors.map((function(e8) {
              return e8.color;
            })).includes("inherit")) {
              var b4 = (0, import_get2.default)(r6, l4), m3 = o7, v2 = Vr({}, d5, { colors: d5.colors.map((function(e8, r7) {
                return "inherit" !== e8.color ? e8 : (m3 = m3 + "." + r7 + "." + b4, Vr({}, e8, { color: "inherit" === e8.color ? b4 : e8.color }));
              })) });
              v2.id = m3, (0, import_set3.default)(r6, u4, "url(#" + m3 + ")"), s4[m3] || (c9.push(v2), s4[m3] = 1);
            } else (0, import_set3.default)(r6, u4, "url(#" + o7 + ")");
          }
        }
        return 1;
      }
    }, a5 = Qr(t5); !(n7 = a5()).done && !o6(); ) ;
  }))), c9;
};
function Rn() {
  for (var e7 = arguments.length, r5 = new Array(e7), t5 = 0; t5 < e7; t5++) r5[t5] = arguments[t5];
  return function(e8) {
    for (var t6 = 0, n6 = r5; t6 < n6.length; t6++) {
      var o5 = n6[t6];
      "function" == typeof o5 ? o5(e8) : null != o5 && (o5.current = e8);
    }
  };
}

// node_modules/@nivo/tooltip/dist/nivo-tooltip.mjs
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
function v() {
  return v = Object.assign ? Object.assign.bind() : function(t5) {
    for (var i5 = 1; i5 < arguments.length; i5++) {
      var n6 = arguments[i5];
      for (var o5 in n6) ({}).hasOwnProperty.call(n6, o5) && (t5[o5] = n6[o5]);
    }
    return t5;
  }, v.apply(null, arguments);
}
var x = ["basic", "chip", "container", "table", "tableCell", "tableCellValue"];
var m = { pointerEvents: "none", position: "absolute", zIndex: 10, top: 0, left: 0 };
var b2 = function(t5, i5) {
  return "translate(" + t5 + "px, " + i5 + "px)";
};
var g = (0, import_react19.memo)((function(t5) {
  var n6, o5 = t5.position, r5 = t5.anchor, e7 = t5.children, l4 = M(), u4 = Dr(), y3 = u4.animate, f2 = u4.config, g2 = sn(), w2 = g2[0], T2 = g2[1], C3 = (0, import_react19.useRef)(false), E2 = void 0, P3 = false, V2 = T2.width > 0 && T2.height > 0, O3 = Math.round(o5[0]), N2 = Math.round(o5[1]);
  V2 && ("top" === r5 ? (O3 -= T2.width / 2, N2 -= T2.height + 14) : "right" === r5 ? (O3 += 14, N2 -= T2.height / 2) : "bottom" === r5 ? (O3 -= T2.width / 2, N2 += 14) : "left" === r5 ? (O3 -= T2.width + 14, N2 -= T2.height / 2) : "center" === r5 && (O3 -= T2.width / 2, N2 -= T2.height / 2), E2 = { transform: b2(O3, N2) }, C3.current || (P3 = true), C3.current = [O3, N2]);
  var j3 = useSpring({ to: E2, config: f2, immediate: !y3 || P3 }), k2 = l4.tooltip;
  k2.basic, k2.chip, k2.container, k2.table, k2.tableCell, k2.tableCellValue;
  var z4 = (function(t6, i5) {
    if (null == t6) return {};
    var n7 = {};
    for (var o6 in t6) if ({}.hasOwnProperty.call(t6, o6)) {
      if (-1 !== i5.indexOf(o6)) continue;
      n7[o6] = t6[o6];
    }
    return n7;
  })(k2, x), A2 = v({}, m, z4, { transform: null != (n6 = j3.transform) ? n6 : b2(O3, N2), opacity: j3.transform ? 1 : 0 });
  return (0, import_jsx_runtime3.jsx)(animated.div, { ref: w2, style: A2, children: e7 });
}));
g.displayName = "TooltipWrapper";
var w = (0, import_react19.memo)((function(t5) {
  var i5 = t5.size, n6 = void 0 === i5 ? 12 : i5, o5 = t5.color, r5 = t5.style;
  return (0, import_jsx_runtime3.jsx)("span", { style: v({ display: "block", width: n6, height: n6, background: o5 }, void 0 === r5 ? {} : r5) });
}));
var T = (0, import_react19.memo)((function(t5) {
  var i5, n6 = t5.id, o5 = t5.value, r5 = t5.format, e7 = t5.enableChip, l4 = void 0 !== e7 && e7, a4 = t5.color, c9 = t5.renderContent, s4 = M(), h2 = hn(r5);
  if ("function" == typeof c9) i5 = c9();
  else {
    var f2 = o5;
    void 0 !== h2 && void 0 !== f2 && (f2 = h2(f2)), i5 = (0, import_jsx_runtime3.jsxs)("div", { style: s4.tooltip.basic, children: [l4 && (0, import_jsx_runtime3.jsx)(w, { color: a4, style: s4.tooltip.chip }), void 0 !== f2 ? (0, import_jsx_runtime3.jsxs)("span", { children: [n6, ": ", (0, import_jsx_runtime3.jsx)("strong", { children: "" + f2 })] }) : n6] });
  }
  return (0, import_jsx_runtime3.jsx)("div", { style: s4.tooltip.container, role: "tooltip", children: i5 });
}));
var C2 = { width: "100%", borderCollapse: "collapse" };
var E = (0, import_react19.memo)((function(t5) {
  var i5, n6 = t5.title, o5 = t5.rows, r5 = void 0 === o5 ? [] : o5, e7 = t5.renderContent, l4 = M();
  return r5.length ? (i5 = "function" == typeof e7 ? e7() : (0, import_jsx_runtime3.jsxs)("div", { children: [n6 && n6, (0, import_jsx_runtime3.jsx)("table", { style: v({}, C2, l4.tooltip.table), children: (0, import_jsx_runtime3.jsx)("tbody", { children: r5.map((function(t6, i6) {
    return (0, import_jsx_runtime3.jsx)("tr", { children: t6.map((function(t7, i7) {
      return (0, import_jsx_runtime3.jsx)("td", { style: l4.tooltip.tableCell, children: t7 }, i7);
    })) }, i6);
  })) }) })] }), (0, import_jsx_runtime3.jsx)("div", { style: l4.tooltip.container, children: i5 })) : null;
}));
E.displayName = "TableTooltip";
var P2 = (0, import_react19.memo)((function(t5) {
  var i5 = t5.x0, o5 = t5.x1, r5 = t5.y0, e7 = t5.y1, l4 = M(), h2 = Dr(), u4 = h2.animate, y3 = h2.config, f2 = (0, import_react19.useMemo)((function() {
    return v({}, l4.crosshair.line, { pointerEvents: "none" });
  }), [l4.crosshair.line]), x2 = useSpring({ x1: i5, x2: o5, y1: r5, y2: e7, config: y3, immediate: !u4 });
  return (0, import_jsx_runtime3.jsx)(animated.line, v({}, x2, { fill: "none", style: f2 }));
}));
P2.displayName = "CrosshairLine";
var V = (0, import_react19.memo)((function(t5) {
  var i5, n6, o5 = t5.width, r5 = t5.height, e7 = t5.type, l4 = t5.x, a4 = t5.y;
  return "cross" === e7 ? (i5 = { x0: l4, x1: l4, y0: 0, y1: r5 }, n6 = { x0: 0, x1: o5, y0: a4, y1: a4 }) : "top-left" === e7 ? (i5 = { x0: l4, x1: l4, y0: 0, y1: a4 }, n6 = { x0: 0, x1: l4, y0: a4, y1: a4 }) : "top" === e7 ? i5 = { x0: l4, x1: l4, y0: 0, y1: a4 } : "top-right" === e7 ? (i5 = { x0: l4, x1: l4, y0: 0, y1: a4 }, n6 = { x0: l4, x1: o5, y0: a4, y1: a4 }) : "right" === e7 ? n6 = { x0: l4, x1: o5, y0: a4, y1: a4 } : "bottom-right" === e7 ? (i5 = { x0: l4, x1: l4, y0: a4, y1: r5 }, n6 = { x0: l4, x1: o5, y0: a4, y1: a4 }) : "bottom" === e7 ? i5 = { x0: l4, x1: l4, y0: a4, y1: r5 } : "bottom-left" === e7 ? (i5 = { x0: l4, x1: l4, y0: a4, y1: r5 }, n6 = { x0: 0, x1: l4, y0: a4, y1: a4 }) : "left" === e7 ? n6 = { x0: 0, x1: l4, y0: a4, y1: a4 } : "x" === e7 ? i5 = { x0: l4, x1: l4, y0: 0, y1: r5 } : "y" === e7 && (n6 = { x0: 0, x1: o5, y0: a4, y1: a4 }), (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [i5 && (0, import_jsx_runtime3.jsx)(P2, { x0: i5.x0, x1: i5.x1, y0: i5.y0, y1: i5.y1 }), n6 && (0, import_jsx_runtime3.jsx)(P2, { x0: n6.x0, x1: n6.x1, y0: n6.y0, y1: n6.y1 })] });
}));
V.displayName = "Crosshair";
var O2 = (0, import_react19.createContext)({ showTooltipAt: function() {
}, showTooltipFromEvent: function() {
}, hideTooltip: function() {
} });
var N = { isVisible: false, position: [null, null], content: null, anchor: null };
var j2 = (0, import_react19.createContext)(N);
var k = function(t5) {
  var i5 = (0, import_react19.useState)(N), o5 = i5[0], l4 = i5[1], a4 = (0, import_react19.useCallback)((function(t6, i6, n6) {
    var o6 = i6[0], r5 = i6[1];
    void 0 === n6 && (n6 = "top"), l4({ isVisible: true, position: [o6, r5], anchor: n6, content: t6 });
  }), [l4]), c9 = (0, import_react19.useCallback)((function(i6, n6, o6) {
    void 0 === o6 && (o6 = "top");
    var r5 = t5.current.getBoundingClientRect(), e7 = t5.current.offsetWidth, a5 = e7 === r5.width ? 1 : e7 / r5.width, c10 = "touches" in n6 ? n6.touches[0] : n6, s5 = c10.clientX, h2 = c10.clientY, u4 = (s5 - r5.left) * a5, d4 = (h2 - r5.top) * a5;
    "left" !== o6 && "right" !== o6 || (o6 = u4 < r5.width / 2 ? "right" : "left"), l4({ isVisible: true, position: [u4, d4], anchor: o6, content: i6 });
  }), [t5, l4]), s4 = (0, import_react19.useCallback)((function() {
    l4(N);
  }), [l4]);
  return { actions: (0, import_react19.useMemo)((function() {
    return { showTooltipAt: a4, showTooltipFromEvent: c9, hideTooltip: s4 };
  }), [a4, c9, s4]), state: o5 };
};
var z3 = function() {
  var t5 = (0, import_react19.useContext)(O2);
  if (void 0 === t5) throw new Error("useTooltip must be used within a TooltipProvider");
  return t5;
};
var A = function() {
  var t5 = (0, import_react19.useContext)(j2);
  if (void 0 === t5) throw new Error("useTooltipState must be used within a TooltipProvider");
  return t5;
};
var F = function(t5) {
  return t5.isVisible;
};
var M2 = function() {
  var t5 = A();
  return F(t5) ? (0, import_jsx_runtime3.jsx)(g, { position: t5.position, anchor: t5.anchor, children: t5.content }) : null;
};
var W2 = function(t5) {
  var i5 = t5.container, n6 = t5.children, o5 = k(i5), r5 = o5.actions, e7 = o5.state;
  return (0, import_jsx_runtime3.jsx)(O2.Provider, { value: r5, children: (0, import_jsx_runtime3.jsx)(j2.Provider, { value: e7, children: n6 }) });
};

// node_modules/@nivo/colors/dist/nivo-colors.mjs
var import_react20 = __toESM(require_react(), 1);
var import_get3 = __toESM(require_get(), 1);
var import_isPlainObject2 = __toESM(require_isPlainObject(), 1);
function Se(e7, r5) {
  (null == r5 || r5 > e7.length) && (r5 = e7.length);
  for (var n6 = 0, t5 = Array(r5); n6 < r5; n6++) t5[n6] = e7[n6];
  return t5;
}
function qe(e7, r5) {
  var n6 = "undefined" != typeof Symbol && e7[Symbol.iterator] || e7["@@iterator"];
  if (n6) return (n6 = n6.call(e7)).next.bind(n6);
  if (Array.isArray(e7) || (n6 = (function(e8, r6) {
    if (e8) {
      if ("string" == typeof e8) return Se(e8, r6);
      var n7 = {}.toString.call(e8).slice(8, -1);
      return "Object" === n7 && e8.constructor && (n7 = e8.constructor.name), "Map" === n7 || "Set" === n7 ? Array.from(e8) : "Arguments" === n7 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n7) ? Se(e8, r6) : void 0;
    }
  })(e7)) || r5 && e7 && "number" == typeof e7.length) {
    n6 && (e7 = n6);
    var t5 = 0;
    return function() {
      return t5 >= e7.length ? { done: true } : { done: false, value: e7[t5++] };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Ce() {
  return Ce = Object.assign ? Object.assign.bind() : function(e7) {
    for (var r5 = 1; r5 < arguments.length; r5++) {
      var n6 = arguments[r5];
      for (var t5 in n6) ({}).hasOwnProperty.call(n6, t5) && (e7[t5] = n6[t5]);
    }
    return e7;
  }, Ce.apply(null, arguments);
}
var Ge = { nivo: ["#e8c1a0", "#f47560", "#f1e15b", "#e8a838", "#61cdbb", "#97e3d5"], category10: category10_default, accent: Accent_default, dark2: Dark2_default, paired: Paired_default, pastel1: Pastel1_default, pastel2: Pastel2_default, set1: Set1_default, set2: Set2_default, set3: Set3_default, tableau10: Tableau10_default };
var Ve = Object.keys(Ge);
var Pe = { brown_blueGreen: scheme, purpleRed_green: scheme2, pink_yellowGreen: scheme3, purple_orange: scheme4, red_blue: scheme5, red_grey: scheme6, red_yellow_blue: scheme7, red_yellow_green: scheme8, spectral: scheme9 };
var Re = Object.keys(Pe);
var Ue = { brown_blueGreen: BrBG_default, purpleRed_green: PRGn_default, pink_yellowGreen: PiYG_default, purple_orange: PuOr_default, red_blue: RdBu_default, red_grey: RdGy_default, red_yellow_blue: RdYlBu_default, red_yellow_green: RdYlGn_default, spectral: Spectral_default };
var De = { blues: scheme22, greens: scheme23, greys: scheme24, oranges: scheme27, purples: scheme25, reds: scheme26, blue_green: scheme10, blue_purple: scheme11, green_blue: scheme12, orange_red: scheme13, purple_blue_green: scheme14, purple_blue: scheme15, purple_red: scheme16, red_purple: scheme17, yellow_green_blue: scheme18, yellow_green: scheme19, yellow_orange_brown: scheme20, yellow_orange_red: scheme21 };
var Me = Object.keys(De);
var Te = { blues: Blues_default, greens: Greens_default, greys: Greys_default, oranges: Oranges_default, purples: Purples_default, reds: Reds_default, turbo: turbo_default, viridis: viridis_default, inferno, magma, plasma, cividis: cividis_default, warm, cool, cubehelixDefault: cubehelix_default, blue_green: BuGn_default, blue_purple: BuPu_default, green_blue: GnBu_default, orange_red: OrRd_default, purple_blue_green: PuBuGn_default, purple_blue: PuBu_default, purple_red: PuRd_default, red_purple: RdPu_default, yellow_green_blue: YlGnBu_default, yellow_green: YlGn_default, yellow_orange_brown: YlOrBr_default, yellow_orange_red: YlOrRd_default };
var $e = Ce({}, Ge, Pe, De);
var Be = Object.keys($e);
var Fe = function(e7) {
  return Ve.includes(e7);
};
var He = function(e7) {
  return Re.includes(e7);
};
var Je = function(e7) {
  return Me.includes(e7);
};
var Ke = { rainbow: rainbow_default, sinebow: sinebow_default };
var Le = Ce({}, Ue, Te, Ke);
var Ne = Object.keys(Le);
var Qe = function(e7) {
  return void 0 !== e7.theme;
};
var We = function(e7) {
  return void 0 !== e7.from;
};
var Xe = function(e7, r5) {
  if ("function" == typeof e7) return e7;
  if ((0, import_isPlainObject2.default)(e7)) {
    if (Qe(e7)) {
      if (void 0 === r5) throw new Error("Unable to use color from theme as no theme was provided");
      var n6 = (0, import_get3.default)(r5, e7.theme);
      if (void 0 === n6) throw new Error("Color from theme is undefined at path: '" + e7.theme + "'");
      return function() {
        return n6;
      };
    }
    if (We(e7)) {
      var t5 = function(r6) {
        return (0, import_get3.default)(r6, e7.from);
      };
      if (Array.isArray(e7.modifiers)) {
        for (var o5, i5 = [], u4 = function() {
          var e8 = o5.value, r6 = e8[0], n7 = e8[1];
          if ("brighter" === r6) i5.push((function(e9) {
            return e9.brighter(n7);
          }));
          else if ("darker" === r6) i5.push((function(e9) {
            return e9.darker(n7);
          }));
          else {
            if ("opacity" !== r6) throw new Error("Invalid color modifier: '" + r6 + "', must be one of: 'brighter', 'darker', 'opacity'");
            i5.push((function(e9) {
              return e9.opacity = n7, e9;
            }));
          }
        }, l4 = qe(e7.modifiers); !(o5 = l4()).done; ) u4();
        return 0 === i5.length ? t5 : function(e8) {
          return i5.reduce((function(e9, r6) {
            return r6(e9);
          }), rgb(t5(e8))).toString();
        };
      }
      return t5;
    }
    throw new Error("Invalid color spec, you should either specify 'theme' or 'from' when using a config object");
  }
  return function() {
    return e7;
  };
};
var Ye = function(e7, r5) {
  return (0, import_react20.useMemo)((function() {
    return Xe(e7, r5);
  }), [e7, r5]);
};
var gr = function(e7, r5) {
  if ("function" == typeof e7) return e7;
  var n6 = "function" == typeof r5 ? r5 : function(e8) {
    return (0, import_get3.default)(e8, r5);
  };
  if (Array.isArray(e7)) {
    var t5 = ordinal(e7), o5 = function(e8) {
      return t5(n6(e8));
    };
    return o5.scale = t5, o5;
  }
  if ((0, import_isPlainObject2.default)(e7)) {
    if ((function(e8) {
      return void 0 !== e8.datum;
    })(e7)) return function(r6) {
      return (0, import_get3.default)(r6, e7.datum);
    };
    if ((function(e8) {
      return void 0 !== e8.scheme;
    })(e7)) {
      if (Fe(e7.scheme)) {
        var i5 = ordinal($e[e7.scheme]), u4 = function(e8) {
          return i5(n6(e8));
        };
        return u4.scale = i5, u4;
      }
      if (He(e7.scheme)) {
        if (void 0 !== e7.size && (e7.size < 3 || e7.size > 11)) throw new Error("Invalid size '" + e7.size + "' for diverging color scheme '" + e7.scheme + "', must be between 3~11");
        var l4 = ordinal($e[e7.scheme][e7.size || 11]), a4 = function(e8) {
          return l4(n6(e8));
        };
        return a4.scale = l4, a4;
      }
      if (Je(e7.scheme)) {
        if (void 0 !== e7.size && (e7.size < 3 || e7.size > 9)) throw new Error("Invalid size '" + e7.size + "' for sequential color scheme '" + e7.scheme + "', must be between 3~9");
        var c9 = ordinal($e[e7.scheme][e7.size || 9]), s4 = function(e8) {
          return c9(n6(e8));
        };
        return s4.scale = c9, s4;
      }
    }
    throw new Error("Invalid colors, when using an object, you should either pass a 'datum' or a 'scheme' property");
  }
  return function() {
    return e7;
  };
};
var hr = function(e7, r5) {
  return (0, import_react20.useMemo)((function() {
    return gr(e7, r5);
  }), [e7, r5]);
};

// node_modules/@nivo/text/dist/nivo-text.mjs
var import_jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
var a3 = function(t5, e7) {
  t5.font = (e7.fontWeight ? e7.fontWeight + " " : "") + e7.fontSize + "px " + e7.fontFamily;
};
var d3 = function(t5, e7, o5, n6, r5) {
  void 0 === n6 && (n6 = 0), void 0 === r5 && (r5 = 0), e7.outlineWidth > 0 && (t5.strokeStyle = e7.outlineColor, t5.lineWidth = 2 * e7.outlineWidth, t5.lineJoin = "round", t5.strokeText(o5, n6, r5)), t5.fillStyle = e7.fill, t5.fillText(o5, n6, r5);
};
function p2() {
  return p2 = Object.assign ? Object.assign.bind() : function(t5) {
    for (var e7 = 1; e7 < arguments.length; e7++) {
      var o5 = arguments[e7];
      for (var n6 in o5) ({}).hasOwnProperty.call(o5, n6) && (t5[n6] = o5[n6]);
    }
    return t5;
  }, p2.apply(null, arguments);
}
function s3(t5, e7) {
  if (null == t5) return {};
  var o5 = {};
  for (var n6 in t5) if ({}.hasOwnProperty.call(t5, n6)) {
    if (-1 !== e7.indexOf(n6)) continue;
    o5[n6] = t5[n6];
  }
  return o5;
}
var h = ["style", "children"];
var m2 = ["outlineWidth", "outlineColor", "outlineOpacity"];
var b3 = function(r5) {
  var i5 = r5.style, l4 = r5.children, c9 = s3(r5, h), f2 = i5.outlineWidth, u4 = i5.outlineColor, a4 = i5.outlineOpacity, d4 = s3(i5, m2);
  return (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [f2 > 0 && (0, import_jsx_runtime4.jsx)(animated.text, p2({}, c9, { style: p2({}, d4, { strokeWidth: 2 * f2, stroke: u4, strokeOpacity: a4, strokeLinejoin: "round" }), children: l4 })), (0, import_jsx_runtime4.jsx)(animated.text, p2({}, c9, { style: d4, children: l4 }))] });
};

export {
  useSprings,
  useSpring,
  useTransition,
  to2 as to,
  animated,
  M,
  w,
  T,
  z3 as z,
  Yr,
  Dr,
  Fr,
  $r,
  ut,
  ct,
  ft,
  ht,
  Rt,
  It,
  cn,
  hn,
  bn,
  vn,
  wn,
  kn,
  Mn,
  Rn,
  Ye,
  hr,
  a3 as a,
  d3 as d,
  b3 as b
};
//# sourceMappingURL=chunk-43PHYVSV.js.map
