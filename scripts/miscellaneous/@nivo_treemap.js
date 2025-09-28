import {
  require_upperFirst
} from "./chunk-WAM7ZGQ7.js";
import {
  require_cloneDeep
} from "./chunk-PFEGGXKE.js";
import {
  require_omit
} from "./chunk-TXS7J2AQ.js";
import "./chunk-SPG5J3R6.js";
import {
  $r,
  Dr,
  Fr,
  M,
  Mn,
  Rn,
  Rt,
  T,
  Ye,
  a,
  animated,
  b,
  bn,
  cn,
  d,
  hn,
  hr,
  kn,
  to,
  useTransition,
  ut,
  wn,
  z
} from "./chunk-43PHYVSV.js";
import {
  require_toString
} from "./chunk-DRX7DPCE.js";
import {
  require_jsx_runtime
} from "./chunk-32NEGIXE.js";
import "./chunk-E5ODL3YF.js";
import {
  require_react
} from "./chunk-65KY755N.js";
import {
  __commonJS,
  __toESM
} from "./chunk-V4OQ3NZ2.js";

// node_modules/lodash/_arrayReduce.js
var require_arrayReduce = __commonJS({
  "node_modules/lodash/_arrayReduce.js"(exports, module) {
    function arrayReduce(array, iteratee, accumulator, initAccum) {
      var index = -1, length = array == null ? 0 : array.length;
      if (initAccum && length) {
        accumulator = array[++index];
      }
      while (++index < length) {
        accumulator = iteratee(accumulator, array[index], index, array);
      }
      return accumulator;
    }
    module.exports = arrayReduce;
  }
});

// node_modules/lodash/_basePropertyOf.js
var require_basePropertyOf = __commonJS({
  "node_modules/lodash/_basePropertyOf.js"(exports, module) {
    function basePropertyOf(object) {
      return function(key) {
        return object == null ? void 0 : object[key];
      };
    }
    module.exports = basePropertyOf;
  }
});

// node_modules/lodash/_deburrLetter.js
var require_deburrLetter = __commonJS({
  "node_modules/lodash/_deburrLetter.js"(exports, module) {
    var basePropertyOf = require_basePropertyOf();
    var deburredLetters = {
      // Latin-1 Supplement block.
      "À": "A",
      "Á": "A",
      "Â": "A",
      "Ã": "A",
      "Ä": "A",
      "Å": "A",
      "à": "a",
      "á": "a",
      "â": "a",
      "ã": "a",
      "ä": "a",
      "å": "a",
      "Ç": "C",
      "ç": "c",
      "Ð": "D",
      "ð": "d",
      "È": "E",
      "É": "E",
      "Ê": "E",
      "Ë": "E",
      "è": "e",
      "é": "e",
      "ê": "e",
      "ë": "e",
      "Ì": "I",
      "Í": "I",
      "Î": "I",
      "Ï": "I",
      "ì": "i",
      "í": "i",
      "î": "i",
      "ï": "i",
      "Ñ": "N",
      "ñ": "n",
      "Ò": "O",
      "Ó": "O",
      "Ô": "O",
      "Õ": "O",
      "Ö": "O",
      "Ø": "O",
      "ò": "o",
      "ó": "o",
      "ô": "o",
      "õ": "o",
      "ö": "o",
      "ø": "o",
      "Ù": "U",
      "Ú": "U",
      "Û": "U",
      "Ü": "U",
      "ù": "u",
      "ú": "u",
      "û": "u",
      "ü": "u",
      "Ý": "Y",
      "ý": "y",
      "ÿ": "y",
      "Æ": "Ae",
      "æ": "ae",
      "Þ": "Th",
      "þ": "th",
      "ß": "ss",
      // Latin Extended-A block.
      "Ā": "A",
      "Ă": "A",
      "Ą": "A",
      "ā": "a",
      "ă": "a",
      "ą": "a",
      "Ć": "C",
      "Ĉ": "C",
      "Ċ": "C",
      "Č": "C",
      "ć": "c",
      "ĉ": "c",
      "ċ": "c",
      "č": "c",
      "Ď": "D",
      "Đ": "D",
      "ď": "d",
      "đ": "d",
      "Ē": "E",
      "Ĕ": "E",
      "Ė": "E",
      "Ę": "E",
      "Ě": "E",
      "ē": "e",
      "ĕ": "e",
      "ė": "e",
      "ę": "e",
      "ě": "e",
      "Ĝ": "G",
      "Ğ": "G",
      "Ġ": "G",
      "Ģ": "G",
      "ĝ": "g",
      "ğ": "g",
      "ġ": "g",
      "ģ": "g",
      "Ĥ": "H",
      "Ħ": "H",
      "ĥ": "h",
      "ħ": "h",
      "Ĩ": "I",
      "Ī": "I",
      "Ĭ": "I",
      "Į": "I",
      "İ": "I",
      "ĩ": "i",
      "ī": "i",
      "ĭ": "i",
      "į": "i",
      "ı": "i",
      "Ĵ": "J",
      "ĵ": "j",
      "Ķ": "K",
      "ķ": "k",
      "ĸ": "k",
      "Ĺ": "L",
      "Ļ": "L",
      "Ľ": "L",
      "Ŀ": "L",
      "Ł": "L",
      "ĺ": "l",
      "ļ": "l",
      "ľ": "l",
      "ŀ": "l",
      "ł": "l",
      "Ń": "N",
      "Ņ": "N",
      "Ň": "N",
      "Ŋ": "N",
      "ń": "n",
      "ņ": "n",
      "ň": "n",
      "ŋ": "n",
      "Ō": "O",
      "Ŏ": "O",
      "Ő": "O",
      "ō": "o",
      "ŏ": "o",
      "ő": "o",
      "Ŕ": "R",
      "Ŗ": "R",
      "Ř": "R",
      "ŕ": "r",
      "ŗ": "r",
      "ř": "r",
      "Ś": "S",
      "Ŝ": "S",
      "Ş": "S",
      "Š": "S",
      "ś": "s",
      "ŝ": "s",
      "ş": "s",
      "š": "s",
      "Ţ": "T",
      "Ť": "T",
      "Ŧ": "T",
      "ţ": "t",
      "ť": "t",
      "ŧ": "t",
      "Ũ": "U",
      "Ū": "U",
      "Ŭ": "U",
      "Ů": "U",
      "Ű": "U",
      "Ų": "U",
      "ũ": "u",
      "ū": "u",
      "ŭ": "u",
      "ů": "u",
      "ű": "u",
      "ų": "u",
      "Ŵ": "W",
      "ŵ": "w",
      "Ŷ": "Y",
      "ŷ": "y",
      "Ÿ": "Y",
      "Ź": "Z",
      "Ż": "Z",
      "Ž": "Z",
      "ź": "z",
      "ż": "z",
      "ž": "z",
      "Ĳ": "IJ",
      "ĳ": "ij",
      "Œ": "Oe",
      "œ": "oe",
      "ŉ": "'n",
      "ſ": "s"
    };
    var deburrLetter = basePropertyOf(deburredLetters);
    module.exports = deburrLetter;
  }
});

// node_modules/lodash/deburr.js
var require_deburr = __commonJS({
  "node_modules/lodash/deburr.js"(exports, module) {
    var deburrLetter = require_deburrLetter();
    var toString = require_toString();
    var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
    var rsComboMarksRange = "\\u0300-\\u036f";
    var reComboHalfMarksRange = "\\ufe20-\\ufe2f";
    var rsComboSymbolsRange = "\\u20d0-\\u20ff";
    var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
    var rsCombo = "[" + rsComboRange + "]";
    var reComboMark = RegExp(rsCombo, "g");
    function deburr(string) {
      string = toString(string);
      return string && string.replace(reLatin, deburrLetter).replace(reComboMark, "");
    }
    module.exports = deburr;
  }
});

// node_modules/lodash/_asciiWords.js
var require_asciiWords = __commonJS({
  "node_modules/lodash/_asciiWords.js"(exports, module) {
    var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
    function asciiWords(string) {
      return string.match(reAsciiWord) || [];
    }
    module.exports = asciiWords;
  }
});

// node_modules/lodash/_hasUnicodeWord.js
var require_hasUnicodeWord = __commonJS({
  "node_modules/lodash/_hasUnicodeWord.js"(exports, module) {
    var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
    function hasUnicodeWord(string) {
      return reHasUnicodeWord.test(string);
    }
    module.exports = hasUnicodeWord;
  }
});

// node_modules/lodash/_unicodeWords.js
var require_unicodeWords = __commonJS({
  "node_modules/lodash/_unicodeWords.js"(exports, module) {
    var rsAstralRange = "\\ud800-\\udfff";
    var rsComboMarksRange = "\\u0300-\\u036f";
    var reComboHalfMarksRange = "\\ufe20-\\ufe2f";
    var rsComboSymbolsRange = "\\u20d0-\\u20ff";
    var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
    var rsDingbatRange = "\\u2700-\\u27bf";
    var rsLowerRange = "a-z\\xdf-\\xf6\\xf8-\\xff";
    var rsMathOpRange = "\\xac\\xb1\\xd7\\xf7";
    var rsNonCharRange = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf";
    var rsPunctuationRange = "\\u2000-\\u206f";
    var rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000";
    var rsUpperRange = "A-Z\\xc0-\\xd6\\xd8-\\xde";
    var rsVarRange = "\\ufe0e\\ufe0f";
    var rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
    var rsApos = "['’]";
    var rsBreak = "[" + rsBreakRange + "]";
    var rsCombo = "[" + rsComboRange + "]";
    var rsDigits = "\\d+";
    var rsDingbat = "[" + rsDingbatRange + "]";
    var rsLower = "[" + rsLowerRange + "]";
    var rsMisc = "[^" + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + "]";
    var rsFitz = "\\ud83c[\\udffb-\\udfff]";
    var rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")";
    var rsNonAstral = "[^" + rsAstralRange + "]";
    var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
    var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
    var rsUpper = "[" + rsUpperRange + "]";
    var rsZWJ = "\\u200d";
    var rsMiscLower = "(?:" + rsLower + "|" + rsMisc + ")";
    var rsMiscUpper = "(?:" + rsUpper + "|" + rsMisc + ")";
    var rsOptContrLower = "(?:" + rsApos + "(?:d|ll|m|re|s|t|ve))?";
    var rsOptContrUpper = "(?:" + rsApos + "(?:D|LL|M|RE|S|T|VE))?";
    var reOptMod = rsModifier + "?";
    var rsOptVar = "[" + rsVarRange + "]?";
    var rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*";
    var rsOrdLower = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])";
    var rsOrdUpper = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])";
    var rsSeq = rsOptVar + reOptMod + rsOptJoin;
    var rsEmoji = "(?:" + [rsDingbat, rsRegional, rsSurrPair].join("|") + ")" + rsSeq;
    var reUnicodeWord = RegExp([
      rsUpper + "?" + rsLower + "+" + rsOptContrLower + "(?=" + [rsBreak, rsUpper, "$"].join("|") + ")",
      rsMiscUpper + "+" + rsOptContrUpper + "(?=" + [rsBreak, rsUpper + rsMiscLower, "$"].join("|") + ")",
      rsUpper + "?" + rsMiscLower + "+" + rsOptContrLower,
      rsUpper + "+" + rsOptContrUpper,
      rsOrdUpper,
      rsOrdLower,
      rsDigits,
      rsEmoji
    ].join("|"), "g");
    function unicodeWords(string) {
      return string.match(reUnicodeWord) || [];
    }
    module.exports = unicodeWords;
  }
});

// node_modules/lodash/words.js
var require_words = __commonJS({
  "node_modules/lodash/words.js"(exports, module) {
    var asciiWords = require_asciiWords();
    var hasUnicodeWord = require_hasUnicodeWord();
    var toString = require_toString();
    var unicodeWords = require_unicodeWords();
    function words(string, pattern, guard) {
      string = toString(string);
      pattern = guard ? void 0 : pattern;
      if (pattern === void 0) {
        return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
      }
      return string.match(pattern) || [];
    }
    module.exports = words;
  }
});

// node_modules/lodash/_createCompounder.js
var require_createCompounder = __commonJS({
  "node_modules/lodash/_createCompounder.js"(exports, module) {
    var arrayReduce = require_arrayReduce();
    var deburr = require_deburr();
    var words = require_words();
    var rsApos = "['’]";
    var reApos = RegExp(rsApos, "g");
    function createCompounder(callback) {
      return function(string) {
        return arrayReduce(words(deburr(string).replace(reApos, "")), callback, "");
      };
    }
    module.exports = createCompounder;
  }
});

// node_modules/lodash/startCase.js
var require_startCase = __commonJS({
  "node_modules/lodash/startCase.js"(exports, module) {
    var createCompounder = require_createCompounder();
    var upperFirst = require_upperFirst();
    var startCase = createCompounder(function(result, word, index) {
      return result + (index ? " " : "") + upperFirst(word);
    });
    module.exports = startCase;
  }
});

// node_modules/@nivo/treemap/dist/nivo-treemap.mjs
var import_react = __toESM(require_react(), 1);
var import_omit = __toESM(require_omit(), 1);
var import_cloneDeep = __toESM(require_cloneDeep(), 1);
var import_startCase = __toESM(require_startCase(), 1);

// node_modules/d3-hierarchy/src/hierarchy/count.js
function count(node) {
  var sum = 0, children = node.children, i2 = children && children.length;
  if (!i2) sum = 1;
  else while (--i2 >= 0) sum += children[i2].value;
  node.value = sum;
}
function count_default() {
  return this.eachAfter(count);
}

// node_modules/d3-hierarchy/src/hierarchy/each.js
function each_default(callback, that) {
  let index = -1;
  for (const node of this) {
    callback.call(that, node, ++index, this);
  }
  return this;
}

// node_modules/d3-hierarchy/src/hierarchy/eachBefore.js
function eachBefore_default(callback, that) {
  var node = this, nodes = [node], children, i2, index = -1;
  while (node = nodes.pop()) {
    callback.call(that, node, ++index, this);
    if (children = node.children) {
      for (i2 = children.length - 1; i2 >= 0; --i2) {
        nodes.push(children[i2]);
      }
    }
  }
  return this;
}

// node_modules/d3-hierarchy/src/hierarchy/eachAfter.js
function eachAfter_default(callback, that) {
  var node = this, nodes = [node], next = [], children, i2, n2, index = -1;
  while (node = nodes.pop()) {
    next.push(node);
    if (children = node.children) {
      for (i2 = 0, n2 = children.length; i2 < n2; ++i2) {
        nodes.push(children[i2]);
      }
    }
  }
  while (node = next.pop()) {
    callback.call(that, node, ++index, this);
  }
  return this;
}

// node_modules/d3-hierarchy/src/hierarchy/find.js
function find_default(callback, that) {
  let index = -1;
  for (const node of this) {
    if (callback.call(that, node, ++index, this)) {
      return node;
    }
  }
}

// node_modules/d3-hierarchy/src/hierarchy/sum.js
function sum_default(value) {
  return this.eachAfter(function(node) {
    var sum = +value(node.data) || 0, children = node.children, i2 = children && children.length;
    while (--i2 >= 0) sum += children[i2].value;
    node.value = sum;
  });
}

// node_modules/d3-hierarchy/src/hierarchy/sort.js
function sort_default(compare) {
  return this.eachBefore(function(node) {
    if (node.children) {
      node.children.sort(compare);
    }
  });
}

// node_modules/d3-hierarchy/src/hierarchy/path.js
function path_default(end) {
  var start = this, ancestor = leastCommonAncestor(start, end), nodes = [start];
  while (start !== ancestor) {
    start = start.parent;
    nodes.push(start);
  }
  var k = nodes.length;
  while (end !== ancestor) {
    nodes.splice(k, 0, end);
    end = end.parent;
  }
  return nodes;
}
function leastCommonAncestor(a3, b2) {
  if (a3 === b2) return a3;
  var aNodes = a3.ancestors(), bNodes = b2.ancestors(), c = null;
  a3 = aNodes.pop();
  b2 = bNodes.pop();
  while (a3 === b2) {
    c = a3;
    a3 = aNodes.pop();
    b2 = bNodes.pop();
  }
  return c;
}

// node_modules/d3-hierarchy/src/hierarchy/ancestors.js
function ancestors_default() {
  var node = this, nodes = [node];
  while (node = node.parent) {
    nodes.push(node);
  }
  return nodes;
}

// node_modules/d3-hierarchy/src/hierarchy/descendants.js
function descendants_default() {
  return Array.from(this);
}

// node_modules/d3-hierarchy/src/hierarchy/leaves.js
function leaves_default() {
  var leaves = [];
  this.eachBefore(function(node) {
    if (!node.children) {
      leaves.push(node);
    }
  });
  return leaves;
}

// node_modules/d3-hierarchy/src/hierarchy/links.js
function links_default() {
  var root = this, links = [];
  root.each(function(node) {
    if (node !== root) {
      links.push({ source: node.parent, target: node });
    }
  });
  return links;
}

// node_modules/d3-hierarchy/src/hierarchy/iterator.js
function* iterator_default() {
  var node = this, current, next = [node], children, i2, n2;
  do {
    current = next.reverse(), next = [];
    while (node = current.pop()) {
      yield node;
      if (children = node.children) {
        for (i2 = 0, n2 = children.length; i2 < n2; ++i2) {
          next.push(children[i2]);
        }
      }
    }
  } while (next.length);
}

// node_modules/d3-hierarchy/src/hierarchy/index.js
function hierarchy(data, children) {
  if (data instanceof Map) {
    data = [void 0, data];
    if (children === void 0) children = mapChildren;
  } else if (children === void 0) {
    children = objectChildren;
  }
  var root = new Node(data), node, nodes = [root], child, childs, i2, n2;
  while (node = nodes.pop()) {
    if ((childs = children(node.data)) && (n2 = (childs = Array.from(childs)).length)) {
      node.children = childs;
      for (i2 = n2 - 1; i2 >= 0; --i2) {
        nodes.push(child = childs[i2] = new Node(childs[i2]));
        child.parent = node;
        child.depth = node.depth + 1;
      }
    }
  }
  return root.eachBefore(computeHeight);
}
function node_copy() {
  return hierarchy(this).eachBefore(copyData);
}
function objectChildren(d2) {
  return d2.children;
}
function mapChildren(d2) {
  return Array.isArray(d2) ? d2[1] : null;
}
function copyData(node) {
  if (node.data.value !== void 0) node.value = node.data.value;
  node.data = node.data.data;
}
function computeHeight(node) {
  var height = 0;
  do
    node.height = height;
  while ((node = node.parent) && node.height < ++height);
}
function Node(data) {
  this.data = data;
  this.depth = this.height = 0;
  this.parent = null;
}
Node.prototype = hierarchy.prototype = {
  constructor: Node,
  count: count_default,
  each: each_default,
  eachAfter: eachAfter_default,
  eachBefore: eachBefore_default,
  find: find_default,
  sum: sum_default,
  sort: sort_default,
  path: path_default,
  ancestors: ancestors_default,
  descendants: descendants_default,
  leaves: leaves_default,
  links: links_default,
  copy: node_copy,
  [Symbol.iterator]: iterator_default
};

// node_modules/d3-hierarchy/src/accessors.js
function required(f) {
  if (typeof f !== "function") throw new Error();
  return f;
}

// node_modules/d3-hierarchy/src/constant.js
function constantZero() {
  return 0;
}
function constant_default(x2) {
  return function() {
    return x2;
  };
}

// node_modules/d3-hierarchy/src/treemap/round.js
function round_default(node) {
  node.x0 = Math.round(node.x0);
  node.y0 = Math.round(node.y0);
  node.x1 = Math.round(node.x1);
  node.y1 = Math.round(node.y1);
}

// node_modules/d3-hierarchy/src/treemap/dice.js
function dice_default(parent, x0, y0, x1, y1) {
  var nodes = parent.children, node, i2 = -1, n2 = nodes.length, k = parent.value && (x1 - x0) / parent.value;
  while (++i2 < n2) {
    node = nodes[i2], node.y0 = y0, node.y1 = y1;
    node.x0 = x0, node.x1 = x0 += node.value * k;
  }
}

// node_modules/d3-hierarchy/src/tree.js
function TreeNode(node, i2) {
  this._ = node;
  this.parent = null;
  this.children = null;
  this.A = null;
  this.a = this;
  this.z = 0;
  this.m = 0;
  this.c = 0;
  this.s = 0;
  this.t = null;
  this.i = i2;
}
TreeNode.prototype = Object.create(Node.prototype);

// node_modules/d3-hierarchy/src/treemap/slice.js
function slice_default(parent, x0, y0, x1, y1) {
  var nodes = parent.children, node, i2 = -1, n2 = nodes.length, k = parent.value && (y1 - y0) / parent.value;
  while (++i2 < n2) {
    node = nodes[i2], node.x0 = x0, node.x1 = x1;
    node.y0 = y0, node.y1 = y0 += node.value * k;
  }
}

// node_modules/d3-hierarchy/src/treemap/squarify.js
var phi = (1 + Math.sqrt(5)) / 2;
function squarifyRatio(ratio, parent, x0, y0, x1, y1) {
  var rows = [], nodes = parent.children, row, nodeValue, i0 = 0, i1 = 0, n2 = nodes.length, dx, dy, value = parent.value, sumValue, minValue, maxValue, newRatio, minRatio, alpha, beta;
  while (i0 < n2) {
    dx = x1 - x0, dy = y1 - y0;
    do
      sumValue = nodes[i1++].value;
    while (!sumValue && i1 < n2);
    minValue = maxValue = sumValue;
    alpha = Math.max(dy / dx, dx / dy) / (value * ratio);
    beta = sumValue * sumValue * alpha;
    minRatio = Math.max(maxValue / beta, beta / minValue);
    for (; i1 < n2; ++i1) {
      sumValue += nodeValue = nodes[i1].value;
      if (nodeValue < minValue) minValue = nodeValue;
      if (nodeValue > maxValue) maxValue = nodeValue;
      beta = sumValue * sumValue * alpha;
      newRatio = Math.max(maxValue / beta, beta / minValue);
      if (newRatio > minRatio) {
        sumValue -= nodeValue;
        break;
      }
      minRatio = newRatio;
    }
    rows.push(row = { value: sumValue, dice: dx < dy, children: nodes.slice(i0, i1) });
    if (row.dice) dice_default(row, x0, y0, x1, value ? y0 += dy * sumValue / value : y1);
    else slice_default(row, x0, y0, value ? x0 += dx * sumValue / value : x1, y1);
    value -= sumValue, i0 = i1;
  }
  return rows;
}
var squarify_default = (function custom(ratio) {
  function squarify(parent, x0, y0, x1, y1) {
    squarifyRatio(ratio, parent, x0, y0, x1, y1);
  }
  squarify.ratio = function(x2) {
    return custom((x2 = +x2) > 1 ? x2 : 1);
  };
  return squarify;
})(phi);

// node_modules/d3-hierarchy/src/treemap/index.js
function treemap_default() {
  var tile = squarify_default, round = false, dx = 1, dy = 1, paddingStack = [0], paddingInner = constantZero, paddingTop = constantZero, paddingRight = constantZero, paddingBottom = constantZero, paddingLeft = constantZero;
  function treemap(root) {
    root.x0 = root.y0 = 0;
    root.x1 = dx;
    root.y1 = dy;
    root.eachBefore(positionNode);
    paddingStack = [0];
    if (round) root.eachBefore(round_default);
    return root;
  }
  function positionNode(node) {
    var p = paddingStack[node.depth], x0 = node.x0 + p, y0 = node.y0 + p, x1 = node.x1 - p, y1 = node.y1 - p;
    if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
    if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
    node.x0 = x0;
    node.y0 = y0;
    node.x1 = x1;
    node.y1 = y1;
    if (node.children) {
      p = paddingStack[node.depth + 1] = paddingInner(node) / 2;
      x0 += paddingLeft(node) - p;
      y0 += paddingTop(node) - p;
      x1 -= paddingRight(node) - p;
      y1 -= paddingBottom(node) - p;
      if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
      if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
      tile(node, x0, y0, x1, y1);
    }
  }
  treemap.round = function(x2) {
    return arguments.length ? (round = !!x2, treemap) : round;
  };
  treemap.size = function(x2) {
    return arguments.length ? (dx = +x2[0], dy = +x2[1], treemap) : [dx, dy];
  };
  treemap.tile = function(x2) {
    return arguments.length ? (tile = required(x2), treemap) : tile;
  };
  treemap.padding = function(x2) {
    return arguments.length ? treemap.paddingInner(x2).paddingOuter(x2) : treemap.paddingInner();
  };
  treemap.paddingInner = function(x2) {
    return arguments.length ? (paddingInner = typeof x2 === "function" ? x2 : constant_default(+x2), treemap) : paddingInner;
  };
  treemap.paddingOuter = function(x2) {
    return arguments.length ? treemap.paddingTop(x2).paddingRight(x2).paddingBottom(x2).paddingLeft(x2) : treemap.paddingTop();
  };
  treemap.paddingTop = function(x2) {
    return arguments.length ? (paddingTop = typeof x2 === "function" ? x2 : constant_default(+x2), treemap) : paddingTop;
  };
  treemap.paddingRight = function(x2) {
    return arguments.length ? (paddingRight = typeof x2 === "function" ? x2 : constant_default(+x2), treemap) : paddingRight;
  };
  treemap.paddingBottom = function(x2) {
    return arguments.length ? (paddingBottom = typeof x2 === "function" ? x2 : constant_default(+x2), treemap) : paddingBottom;
  };
  treemap.paddingLeft = function(x2) {
    return arguments.length ? (paddingLeft = typeof x2 === "function" ? x2 : constant_default(+x2), treemap) : paddingLeft;
  };
  return treemap;
}

// node_modules/d3-hierarchy/src/treemap/binary.js
function binary_default(parent, x0, y0, x1, y1) {
  var nodes = parent.children, i2, n2 = nodes.length, sum, sums = new Array(n2 + 1);
  for (sums[0] = sum = i2 = 0; i2 < n2; ++i2) {
    sums[i2 + 1] = sum += nodes[i2].value;
  }
  partition(0, n2, parent.value, x0, y0, x1, y1);
  function partition(i3, j, value, x02, y02, x12, y12) {
    if (i3 >= j - 1) {
      var node = nodes[i3];
      node.x0 = x02, node.y0 = y02;
      node.x1 = x12, node.y1 = y12;
      return;
    }
    var valueOffset = sums[i3], valueTarget = value / 2 + valueOffset, k = i3 + 1, hi = j - 1;
    while (k < hi) {
      var mid = k + hi >>> 1;
      if (sums[mid] < valueTarget) k = mid + 1;
      else hi = mid;
    }
    if (valueTarget - sums[k - 1] < sums[k] - valueTarget && i3 + 1 < k) --k;
    var valueLeft = sums[k] - valueOffset, valueRight = value - valueLeft;
    if (x12 - x02 > y12 - y02) {
      var xk = value ? (x02 * valueRight + x12 * valueLeft) / value : x12;
      partition(i3, k, valueLeft, x02, y02, xk, y12);
      partition(k, j, valueRight, xk, y02, x12, y12);
    } else {
      var yk = value ? (y02 * valueRight + y12 * valueLeft) / value : y12;
      partition(i3, k, valueLeft, x02, y02, x12, yk);
      partition(k, j, valueRight, x02, yk, x12, y12);
    }
  }
}

// node_modules/d3-hierarchy/src/treemap/sliceDice.js
function sliceDice_default(parent, x0, y0, x1, y1) {
  (parent.depth & 1 ? slice_default : dice_default)(parent, x0, y0, x1, y1);
}

// node_modules/d3-hierarchy/src/treemap/resquarify.js
var resquarify_default = (function custom2(ratio) {
  function resquarify(parent, x0, y0, x1, y1) {
    if ((rows = parent._squarify) && rows.ratio === ratio) {
      var rows, row, nodes, i2, j = -1, n2, m = rows.length, value = parent.value;
      while (++j < m) {
        row = rows[j], nodes = row.children;
        for (i2 = row.value = 0, n2 = nodes.length; i2 < n2; ++i2) row.value += nodes[i2].value;
        if (row.dice) dice_default(row, x0, y0, x1, value ? y0 += (y1 - y0) * row.value / value : y1);
        else slice_default(row, x0, y0, value ? x0 += (x1 - x0) * row.value / value : x1, y1);
        value -= row.value;
      }
    } else {
      parent._squarify = rows = squarifyRatio(ratio, parent, x0, y0, x1, y1);
      rows.ratio = ratio;
    }
  }
  resquarify.ratio = function(x2) {
    return custom2((x2 = +x2) > 1 ? x2 : 1);
  };
  return resquarify;
})(phi);

// node_modules/@nivo/treemap/dist/nivo-treemap.mjs
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function A() {
  return A = Object.assign ? Object.assign.bind() : function(e2) {
    for (var t2 = 1; t2 < arguments.length; t2++) {
      var o2 = arguments[t2];
      for (var n2 in o2) ({}).hasOwnProperty.call(o2, n2) && (e2[n2] = o2[n2]);
    }
    return e2;
  }, A.apply(null, arguments);
}
function G(e2, t2) {
  if (null == e2) return {};
  var o2 = {};
  for (var n2 in e2) if ({}.hasOwnProperty.call(e2, n2)) {
    if (-1 !== t2.indexOf(n2)) continue;
    o2[n2] = e2[n2];
  }
  return o2;
}
var J = function(e2, t2) {
  return to([e2, t2], (function(e3, t3) {
    return "translate(" + e3 + "," + t3 + ")";
  }));
};
var K = function(e2, t2) {
  return to([e2, t2], (function(e3, t3) {
    return "translate(" + e3 + "px, " + t3 + "px)";
  }));
};
var N = function(e2, t2, o2) {
  return to([e2, t2, o2], (function(e3, t3, o3) {
    return "translate(" + e3 + "," + t3 + ") rotate(" + o3 + ")";
  }));
};
var Q = function(e2, t2, o2) {
  return to([e2, t2, o2], (function(e3, t3, o3) {
    return "translate(" + e3 + "px," + t3 + "px) rotate(" + o3 + "deg)";
  }));
};
var U = function(e2, t2, o2) {
  return to([e2, t2, o2], (function(e3, t3, o3) {
    return "translate(" + (e3 - (0 === o3 ? 0 : 5)) + "px," + (t3 - (0 === o3 ? 5 : 0)) + "px) rotate(" + o3 + "deg)";
  }));
};
var Z = (0, import_react.memo)((function(e2) {
  var t2 = e2.node, o2 = e2.animatedProps, n2 = e2.borderWidth, i2 = e2.enableLabel, a3 = e2.enableParentLabel, r2 = e2.labelSkipSize, l2 = M(), d2 = i2 && t2.isLeaf && (0 === r2 || Math.min(t2.width, t2.height) > r2), b2 = a3 && t2.isParent;
  return (0, import_jsx_runtime.jsxs)(animated.g, { transform: J(o2.x, o2.y), children: [(0, import_jsx_runtime.jsx)(animated.rect, { "data-testid": "node." + t2.id, width: to(o2.width, (function(e3) {
    return Math.max(e3, 0);
  })), height: to(o2.height, (function(e3) {
    return Math.max(e3, 0);
  })), fill: t2.fill ? t2.fill : o2.color, strokeWidth: n2, stroke: t2.borderColor, fillOpacity: t2.opacity, onMouseEnter: t2.onMouseEnter, onMouseMove: t2.onMouseMove, onMouseLeave: t2.onMouseLeave, onClick: t2.onClick }), d2 && (0, import_jsx_runtime.jsx)(b, { "data-testid": "label." + t2.id, textAnchor: "middle", dominantBaseline: "central", style: A({}, l2.labels.text, { fill: t2.labelTextColor, pointerEvents: "none" }), fillOpacity: o2.labelOpacity, transform: N(o2.labelX, o2.labelY, o2.labelRotation), children: t2.label }), b2 && (0, import_jsx_runtime.jsx)(b, { "data-testid": "parentLabel." + t2.id, dominantBaseline: "central", style: A({}, l2.labels.text, { fill: t2.parentLabelTextColor, pointerEvents: "none" }), fillOpacity: o2.parentLabelOpacity, transform: N(o2.parentLabelX, o2.parentLabelY, o2.parentLabelRotation), children: t2.parentLabel })] });
}));
var $ = (0, import_react.memo)((function(e2) {
  var t2 = e2.node;
  return (0, import_jsx_runtime.jsx)(T, { id: t2.id, value: t2.formattedValue, enableChip: true, color: t2.color });
}));
var _ = (0, import_react.memo)((function(e2) {
  var t2 = e2.node, o2 = e2.animatedProps, n2 = e2.borderWidth, i2 = e2.enableLabel, a3 = e2.enableParentLabel, r2 = e2.labelSkipSize, l2 = M(), d2 = i2 && t2.isLeaf && (0 === r2 || Math.min(t2.width, t2.height) > r2), b2 = a3 && t2.isParent;
  return (0, import_jsx_runtime.jsxs)(animated.div, { "data-testid": "node." + t2.id, id: t2.path.replace(/[^\w]/gi, "-"), style: { boxSizing: "border-box", position: "absolute", top: 0, left: 0, transform: K(o2.x, o2.y), width: o2.width, height: o2.height, borderWidth: n2, borderStyle: "solid", borderColor: t2.borderColor, overflow: "hidden" }, children: [(0, import_jsx_runtime.jsx)(animated.div, { style: { boxSizing: "border-box", position: "absolute", top: 0, left: 0, opacity: t2.opacity, width: o2.width, height: o2.height, background: o2.color }, onMouseEnter: t2.onMouseEnter, onMouseMove: t2.onMouseMove, onMouseLeave: t2.onMouseLeave, onClick: t2.onClick }), d2 && (0, import_jsx_runtime.jsx)(animated.span, { "data-testid": "label." + t2.id, style: A({}, l2.labels.text, { position: "absolute", display: "flex", top: -5, left: -5, width: 10, height: 10, justifyContent: "center", alignItems: "center", whiteSpace: "nowrap", color: t2.labelTextColor, transformOrigin: "center center", transform: Q(o2.labelX, o2.labelY, o2.labelRotation), opacity: o2.labelOpacity, pointerEvents: "none" }), children: t2.label }), b2 && (0, import_jsx_runtime.jsx)(animated.span, { "data-testid": "parentLabel." + t2.id, style: A({}, l2.labels.text, { position: "absolute", display: "flex", justifyContent: "flex-start", alignItems: "center", whiteSpace: "nowrap", width: 10, height: 10, color: t2.parentLabelTextColor, transformOrigin: "top left", transform: U(o2.parentLabelX, o2.parentLabelY, o2.parentLabelRotation), opacity: o2.parentLabelOpacity, pointerEvents: "none" }), children: t2.parentLabel })] });
}));
var ee = { layers: ["nodes"], identity: "id", value: "value", tile: "squarify", leavesOnly: false, innerPadding: 0, outerPadding: 0, colors: { scheme: "nivo" }, colorBy: "pathComponents.1", nodeOpacity: 0.33, enableLabel: true, label: "formattedValue", labelSkipSize: 0, labelTextColor: { from: "color", modifiers: [["darker", 1]] }, orientLabel: true, enableParentLabel: true, parentLabel: "id", parentLabelSize: 20, parentLabelPosition: "top", parentLabelPadding: 6, parentLabelTextColor: { from: "color", modifiers: [["darker", 1]] }, borderWidth: 1, borderColor: { from: "color", modifiers: [["darker", 1]] }, isInteractive: true, tooltip: $, role: "img", animate: true, motionConfig: "gentle" };
var te = A({}, ee, { nodeComponent: Z, defs: [], fill: [] });
var oe = A({}, ee, { nodeComponent: _ });
var ne = A({}, ee, { pixelRatio: "undefined" != typeof window && window.devicePixelRatio || 1 });
var ie = { binary: binary_default, dice: dice_default, slice: slice_default, sliceDice: sliceDice_default, squarify: squarify_default };
var ae = function(e2) {
  var o2 = e2.root, n2 = e2.getValue;
  return (0, import_react.useMemo)((function() {
    return hierarchy(o2).sum(n2);
  }), [o2, n2]);
};
var re = function(e2) {
  var o2 = e2.data, n2 = e2.width, i2 = e2.height, a3 = e2.identity, r2 = void 0 === a3 ? ee.identity : a3, l2 = e2.value, u = void 0 === l2 ? ee.value : l2, s = e2.valueFormat, c = e2.leavesOnly, p = void 0 === c ? ee.leavesOnly : c, v = e2.tile, h = void 0 === v ? ee.tile : v, f = e2.innerPadding, L = void 0 === f ? ee.innerPadding : f, g = e2.outerPadding, m = void 0 === g ? ee.outerPadding : g, P = e2.label, w = void 0 === P ? ee.label : P, M2 = e2.orientLabel, R = void 0 === M2 ? ee.orientLabel : M2, S = e2.enableParentLabel, O = void 0 === S ? ee.enableParentLabel : S, I = e2.parentLabel, B = void 0 === I ? ee.parentLabel : I, E = e2.parentLabelSize, H = void 0 === E ? ee.parentLabelSize : E, X = e2.parentLabelPosition, Y = void 0 === X ? ee.parentLabelPosition : X, F = e2.parentLabelPadding, j = void 0 === F ? ee.parentLabelPadding : F, D2 = e2.colors, V2 = void 0 === D2 ? ee.colors : D2, q2 = e2.colorBy, G2 = void 0 === q2 ? ee.colorBy : q2, J2 = e2.nodeOpacity, K2 = void 0 === J2 ? ee.nodeOpacity : J2, N2 = e2.borderColor, Q2 = void 0 === N2 ? ee.borderColor : N2, U2 = e2.labelTextColor, Z2 = void 0 === U2 ? ee.labelTextColor : U2, $2 = e2.parentLabelTextColor, _2 = void 0 === $2 ? ee.parentLabelTextColor : $2, te2 = bn(r2), oe2 = bn(u), ne2 = hn(s), re2 = bn(w), le2 = bn(B), de2 = (function(e3) {
    var o3 = e3.width, n3 = e3.height, i3 = e3.tile, a4 = e3.innerPadding, r3 = e3.outerPadding, l3 = e3.enableParentLabel, d2 = e3.parentLabelSize, b2 = e3.parentLabelPosition, u2 = e3.leavesOnly;
    return (0, import_react.useMemo)((function() {
      var e4 = treemap_default().size([o3, n3]).tile(ie[i3]).round(true).paddingInner(a4).paddingOuter(r3);
      if (l3 && !u2) {
        var t2 = d2 + 2 * r3;
        e4["padding" + (0, import_startCase.default)(b2)](t2);
      }
      return e4;
    }), [o3, n3, i3, a4, r3, l3, d2, b2, u2]);
  })({ width: n2, height: i2, tile: h, innerPadding: L, outerPadding: m, enableParentLabel: O, parentLabelSize: H, parentLabelPosition: Y, leavesOnly: p }), be2 = ae({ root: o2, getValue: oe2 }), ue2 = (0, import_react.useMemo)((function() {
    var e3 = (0, import_cloneDeep.default)(be2);
    return de2(e3), p ? e3.leaves() : e3.descendants();
  }), [be2, de2, p]), se2 = (0, import_react.useMemo)((function() {
    return ue2.map((function(e3) {
      var t2 = (function(e4, t3) {
        var o4 = e4.ancestors().map((function(e5) {
          return t3(e5.data);
        })).reverse();
        return { path: o4.join("."), pathComponents: o4 };
      })(e3, te2), o3 = t2.path, n3 = t2.pathComponents, i3 = { id: te2(e3.data), path: o3, pathComponents: n3, data: (0, import_omit.default)(e3.data, "children"), x: e3.x0, y: e3.y0, width: e3.x1 - e3.x0, height: e3.y1 - e3.y0, value: e3.value, formattedValue: ne2(e3.value), treeDepth: e3.depth, treeHeight: e3.height, isParent: e3.height > 0, isLeaf: 0 === e3.height, parentLabelX: 0, parentLabelY: 0, parentLabelRotation: 0 };
      return i3.labelRotation = R && i3.height > i3.width ? -90 : 0, "top" === Y && (i3.parentLabelX = m + j, i3.parentLabelY = m + H / 2), "right" === Y && (i3.parentLabelX = i3.width - m - H / 2, i3.parentLabelY = i3.height - m - j, i3.parentLabelRotation = -90), "bottom" === Y && (i3.parentLabelX = m + j, i3.parentLabelY = i3.height - m - H / 2), "left" === Y && (i3.parentLabelX = m + H / 2, i3.parentLabelY = i3.height - m - j, i3.parentLabelRotation = -90), i3.label = re2(i3), i3.parentLabel = le2(i3), i3;
    }));
  }), [ue2, te2, ne2, re2, R, le2, H, Y, j, m]), ce2 = M(), pe2 = hr(V2, G2), ve2 = Ye(Q2, ce2), he2 = Ye(Z2, ce2), fe2 = Ye(_2, ce2), Le2 = (0, import_react.useMemo)((function() {
    return se2.map((function(e3) {
      var t2 = A({}, e3, { color: pe2(e3), opacity: K2 });
      return t2.borderColor = ve2(t2), t2.labelTextColor = he2(t2), t2.parentLabelTextColor = fe2(t2), t2;
    }));
  }), [se2, pe2, K2, ve2, he2, fe2]);
  return { hierarchy: be2, nodes: Le2, layout: de2 };
};
var le = function(e2) {
  var o2 = e2.nodes;
  return (0, import_react.useMemo)((function() {
    return { nodes: o2 };
  }), [o2]);
};
var de = function(e2) {
  return { x: e2.x, y: e2.y, width: e2.width, height: e2.height, color: e2.color, labelX: e2.width / 2, labelY: e2.height / 2, labelRotation: e2.labelRotation, labelOpacity: 1, parentLabelX: e2.parentLabelX, parentLabelY: e2.parentLabelY, parentLabelRotation: e2.parentLabelRotation, parentLabelOpacity: 1 };
};
var be = function(e2) {
  return { x: e2.x + e2.width / 2, y: e2.y + e2.height / 2, width: 0, height: 0, color: e2.color, labelX: 0, labelY: 0, labelRotation: e2.labelRotation, labelOpacity: 0, parentLabelX: 0, parentLabelY: 0, parentLabelRotation: e2.parentLabelRotation, parentLabelOpacity: 0 };
};
var ue = (0, import_react.memo)((function(e2) {
  var i2 = e2.nodes, a3 = e2.nodeComponent, r2 = e2.borderWidth, l2 = e2.enableLabel, d2 = e2.labelSkipSize, b2 = e2.enableParentLabel, s = (function(e3, i3) {
    var a4 = i3.isInteractive, r3 = i3.onMouseEnter, l3 = i3.onMouseMove, d3 = i3.onMouseLeave, b3 = i3.onClick, u = i3.tooltip, s2 = z(), c2 = s2.showTooltipFromEvent, p2 = s2.hideTooltip, v2 = (0, import_react.useCallback)((function(e4, t2) {
      c2((0, import_react.createElement)(u, { node: e4 }), t2, "left");
    }), [c2, u]), h2 = (0, import_react.useCallback)((function(e4, t2) {
      v2(e4, t2), null == r3 || r3(e4, t2);
    }), [r3, v2]), f = (0, import_react.useCallback)((function(e4, t2) {
      v2(e4, t2), null == l3 || l3(e4, t2);
    }), [l3, v2]), L = (0, import_react.useCallback)((function(e4, t2) {
      p2(), null == d3 || d3(e4, t2);
    }), [d3, p2]), g = (0, import_react.useCallback)((function(e4, t2) {
      null == b3 || b3(e4, t2);
    }), [b3]);
    return (0, import_react.useMemo)((function() {
      return e3.map((function(e4) {
        return a4 ? A({}, e4, { onMouseEnter: function(t2) {
          return h2(e4, t2);
        }, onMouseMove: function(t2) {
          return f(e4, t2);
        }, onMouseLeave: function(t2) {
          return L(e4, t2);
        }, onClick: function(t2) {
          return g(e4, t2);
        } }) : e4;
      }));
    }), [a4, e3, h2, f, L, g]);
  })(i2, { isInteractive: e2.isInteractive, onMouseEnter: e2.onMouseEnter, onMouseMove: e2.onMouseMove, onMouseLeave: e2.onMouseLeave, onClick: e2.onClick, tooltip: e2.tooltip }), c = Dr(), p = c.animate, v = c.config, h = useTransition(s, { keys: function(e3) {
    return e3.path;
  }, initial: de, from: be, enter: de, update: de, leave: be, config: v, immediate: !p });
  return (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: h((function(e3, t2) {
    return (0, import_react.createElement)(a3, { key: t2.path, node: t2, animatedProps: e3, borderWidth: r2, enableLabel: l2, labelSkipSize: d2, enableParentLabel: b2 });
  })) });
}));
var se = ["isInteractive", "animate", "motionConfig", "theme", "renderWrapper"];
var ce = function(e2) {
  var t2 = e2.data, o2 = e2.identity, i2 = void 0 === o2 ? te.identity : o2, r2 = e2.value, l2 = void 0 === r2 ? te.value : r2, d2 = e2.valueFormat, b2 = e2.tile, u = void 0 === b2 ? te.tile : b2, s = e2.nodeComponent, h = void 0 === s ? te.nodeComponent : s, f = e2.innerPadding, L = void 0 === f ? te.innerPadding : f, g = e2.outerPadding, m = void 0 === g ? te.outerPadding : g, y2 = e2.leavesOnly, C2 = void 0 === y2 ? te.leavesOnly : y2, x2 = e2.width, P = e2.height, w = e2.margin, M2 = e2.layers, R = void 0 === M2 ? te.layers : M2, S = e2.colors, z2 = void 0 === S ? te.colors : S, O = e2.colorBy, W = void 0 === O ? te.colorBy : O, k = e2.nodeOpacity, T2 = void 0 === k ? te.nodeOpacity : k, I = e2.borderWidth, B = void 0 === I ? te.borderWidth : I, E = e2.borderColor, H = void 0 === E ? te.borderColor : E, X = e2.defs, Y = void 0 === X ? te.defs : X, F = e2.fill, j = void 0 === F ? te.fill : F, D2 = e2.enableLabel, q2 = void 0 === D2 ? te.enableLabel : D2, A2 = e2.label, G2 = void 0 === A2 ? te.label : A2, J2 = e2.labelTextColor, K2 = void 0 === J2 ? te.labelTextColor : J2, N2 = e2.orientLabel, Q2 = void 0 === N2 ? te.orientLabel : N2, U2 = e2.labelSkipSize, Z2 = void 0 === U2 ? te.labelSkipSize : U2, $2 = e2.enableParentLabel, _2 = void 0 === $2 ? te.enableParentLabel : $2, ee2 = e2.parentLabel, oe2 = void 0 === ee2 ? te.parentLabel : ee2, ne2 = e2.parentLabelSize, ie2 = void 0 === ne2 ? te.parentLabelSize : ne2, ae2 = e2.parentLabelPosition, de2 = void 0 === ae2 ? te.parentLabelPosition : ae2, be2 = e2.parentLabelPadding, se2 = void 0 === be2 ? te.parentLabelPadding : be2, ce2 = e2.parentLabelTextColor, pe2 = void 0 === ce2 ? te.parentLabelTextColor : ce2, ve2 = e2.isInteractive, he2 = void 0 === ve2 ? te.isInteractive : ve2, fe2 = e2.onMouseEnter, Le2 = e2.onMouseMove, ge2 = e2.onMouseLeave, me2 = e2.onClick, ye2 = e2.tooltip, Ce2 = void 0 === ye2 ? te.tooltip : ye2, xe2 = e2.role, Pe2 = e2.ariaLabel, we2 = e2.ariaLabelledBy, Me2 = e2.ariaDescribedBy, Re2 = e2.forwardedRef, Se = cn(x2, P, w), ze = Se.margin, Oe = Se.innerWidth, We = Se.innerHeight, ke = Se.outerWidth, Te = Se.outerHeight, Ie = re({ data: t2, identity: i2, value: l2, valueFormat: d2, leavesOnly: C2, width: Oe, height: We, tile: u, innerPadding: L, outerPadding: m, colors: z2, colorBy: W, nodeOpacity: T2, borderColor: H, label: G2, labelTextColor: K2, orientLabel: Q2, enableParentLabel: _2, parentLabel: oe2, parentLabelSize: ie2, parentLabelPosition: de2, parentLabelPadding: se2, parentLabelTextColor: pe2 }).nodes, Be = { nodes: null };
  R.includes("nodes") && (Be.nodes = (0, import_jsx_runtime.jsx)(ue, { nodes: Ie, nodeComponent: h, borderWidth: B, enableLabel: q2, labelSkipSize: Z2, enableParentLabel: _2, isInteractive: he2, onMouseEnter: fe2, onMouseMove: Le2, onMouseLeave: ge2, onClick: me2, tooltip: Ce2 }, "nodes"));
  var Ee = le({ nodes: Ie }), He = Mn(Y, Ie, j);
  return (0, import_jsx_runtime.jsx)(Rt, { width: ke, height: Te, margin: ze, defs: He, role: xe2, ariaLabel: Pe2, ariaLabelledBy: we2, ariaDescribedBy: Me2, ref: Re2, children: R.map((function(e3, t3) {
    var o3;
    return "function" == typeof e3 ? (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: (0, import_react.createElement)(e3, Ee) }, t3) : null != (o3 = null == Be ? void 0 : Be[e3]) ? o3 : null;
  })) });
};
var pe = (0, import_react.forwardRef)((function(e2, t2) {
  var o2 = e2.isInteractive, n2 = void 0 === o2 ? te.isInteractive : o2, i2 = e2.animate, a3 = void 0 === i2 ? te.animate : i2, r2 = e2.motionConfig, l2 = void 0 === r2 ? te.motionConfig : r2, d2 = e2.theme, b2 = e2.renderWrapper, u = G(e2, se);
  return (0, import_jsx_runtime.jsx)(Fr, { animate: a3, isInteractive: n2, motionConfig: l2, renderWrapper: b2, theme: d2, children: (0, import_jsx_runtime.jsx)(ce, A({}, u, { isInteractive: n2, forwardedRef: t2 })) });
}));
var ve = ["defaultWidth", "defaultHeight", "onResize", "debounceResize"];
var he = (0, import_react.forwardRef)((function(e2, t2) {
  var o2 = e2.defaultWidth, n2 = e2.defaultHeight, i2 = e2.onResize, a3 = e2.debounceResize, r2 = G(e2, ve);
  return (0, import_jsx_runtime.jsx)($r, { defaultWidth: o2, defaultHeight: n2, onResize: i2, debounceResize: a3, children: function(e3) {
    var o3 = e3.width, n3 = e3.height;
    return (0, import_jsx_runtime.jsx)(pe, A({}, r2, { width: o3, height: n3, ref: t2 }));
  } });
}));
var fe = ["isInteractive", "animate", "motionConfig", "theme", "renderWrapper"];
var Le = function(e2) {
  var t2 = e2.data, o2 = e2.identity, i2 = void 0 === o2 ? oe.identity : o2, r2 = e2.value, l2 = void 0 === r2 ? oe.value : r2, d2 = e2.tile, b2 = void 0 === d2 ? oe.tile : d2, u = e2.nodeComponent, s = void 0 === u ? oe.nodeComponent : u, p = e2.valueFormat, v = e2.innerPadding, h = void 0 === v ? oe.innerPadding : v, f = e2.outerPadding, L = void 0 === f ? oe.outerPadding : f, g = e2.leavesOnly, m = void 0 === g ? oe.leavesOnly : g, y2 = e2.width, C2 = e2.height, x2 = e2.margin, P = e2.layers, w = void 0 === P ? te.layers : P, M2 = e2.colors, R = void 0 === M2 ? oe.colors : M2, S = e2.colorBy, z2 = void 0 === S ? oe.colorBy : S, O = e2.nodeOpacity, W = void 0 === O ? oe.nodeOpacity : O, k = e2.borderWidth, T2 = void 0 === k ? oe.borderWidth : k, I = e2.borderColor, B = void 0 === I ? oe.borderColor : I, E = e2.enableLabel, H = void 0 === E ? oe.enableLabel : E, X = e2.label, Y = void 0 === X ? oe.label : X, F = e2.labelTextColor, j = void 0 === F ? oe.labelTextColor : F, D2 = e2.orientLabel, q2 = void 0 === D2 ? oe.orientLabel : D2, A2 = e2.labelSkipSize, G2 = void 0 === A2 ? oe.labelSkipSize : A2, J2 = e2.enableParentLabel, K2 = void 0 === J2 ? oe.enableParentLabel : J2, N2 = e2.parentLabel, Q2 = void 0 === N2 ? oe.parentLabel : N2, U2 = e2.parentLabelSize, Z2 = void 0 === U2 ? oe.parentLabelSize : U2, $2 = e2.parentLabelPosition, _2 = void 0 === $2 ? oe.parentLabelPosition : $2, ee2 = e2.parentLabelPadding, ne2 = void 0 === ee2 ? oe.parentLabelPadding : ee2, ie2 = e2.parentLabelTextColor, ae2 = void 0 === ie2 ? oe.parentLabelTextColor : ie2, de2 = e2.isInteractive, be2 = void 0 === de2 ? oe.isInteractive : de2, se2 = e2.onMouseEnter, ce2 = e2.onMouseMove, pe2 = e2.onMouseLeave, ve2 = e2.onClick, he2 = e2.tooltip, fe2 = void 0 === he2 ? oe.tooltip : he2, Le2 = e2.role, ge2 = e2.ariaLabel, me2 = e2.ariaLabelledBy, ye2 = e2.ariaDescribedBy, Ce2 = e2.forwardedRef, xe2 = cn(y2, C2, x2), Pe2 = xe2.margin, we2 = xe2.innerWidth, Me2 = xe2.innerHeight, Re2 = xe2.outerWidth, Se = xe2.outerHeight, ze = re({ data: t2, identity: i2, value: l2, valueFormat: p, leavesOnly: m, width: we2, height: Me2, tile: b2, innerPadding: h, outerPadding: L, colors: R, colorBy: z2, nodeOpacity: W, borderColor: B, label: Y, labelTextColor: j, orientLabel: q2, enableParentLabel: K2, parentLabel: Q2, parentLabelSize: Z2, parentLabelPosition: _2, parentLabelPadding: ne2, parentLabelTextColor: ae2 }).nodes, Oe = { nodes: null };
  w.includes("nodes") && (Oe.nodes = (0, import_jsx_runtime.jsx)(ue, { nodes: ze, nodeComponent: s, borderWidth: T2, enableLabel: H, labelSkipSize: G2, enableParentLabel: K2, isInteractive: be2, onMouseEnter: se2, onMouseMove: ce2, onMouseLeave: pe2, onClick: ve2, tooltip: fe2 }, "nodes"));
  var We = le({ nodes: ze });
  return (0, import_jsx_runtime.jsx)("div", { role: Le2, "aria-label": ge2, "aria-labelledby": me2, "aria-describedby": ye2, style: { position: "relative", width: Re2, height: Se }, ref: Ce2, children: (0, import_jsx_runtime.jsx)("div", { style: { position: "absolute", top: Pe2.top, left: Pe2.left }, children: w.map((function(e3, t3) {
    var o3;
    return "function" == typeof e3 ? (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: (0, import_react.createElement)(e3, We) }, t3) : null != (o3 = null == Oe ? void 0 : Oe[e3]) ? o3 : null;
  })) }) });
};
var ge = (0, import_react.forwardRef)((function(e2, t2) {
  var o2 = e2.isInteractive, n2 = void 0 === o2 ? oe.isInteractive : o2, i2 = e2.animate, a3 = void 0 === i2 ? oe.animate : i2, r2 = e2.motionConfig, l2 = void 0 === r2 ? oe.motionConfig : r2, d2 = e2.theme, b2 = e2.renderWrapper, u = G(e2, fe);
  return (0, import_jsx_runtime.jsx)(Fr, { animate: a3, isInteractive: n2, motionConfig: l2, renderWrapper: b2, theme: d2, children: (0, import_jsx_runtime.jsx)(Le, A({}, u, { isInteractive: n2, forwardedRef: t2 })) });
}));
var me = ["defaultWidth", "defaultHeight", "onResize", "debounceResize"];
var ye = (0, import_react.forwardRef)((function(e2, t2) {
  var o2 = e2.defaultWidth, n2 = e2.defaultHeight, i2 = e2.onResize, a3 = e2.debounceResize, r2 = G(e2, me);
  return (0, import_jsx_runtime.jsx)($r, { defaultWidth: o2, defaultHeight: n2, onResize: i2, debounceResize: a3, children: function(e3) {
    var o3 = e3.width, n3 = e3.height;
    return (0, import_jsx_runtime.jsx)(ge, A({}, r2, { width: o3, height: n3, ref: t2 }));
  } });
}));
var Ce = ["theme", "isInteractive", "animate", "motionConfig", "renderWrapper"];
var xe = function(e2, t2, o2, n2) {
  return e2.find((function(e3) {
    return wn(e3.x + t2.left, e3.y + t2.top, e3.width, e3.height, o2, n2);
  }));
};
var Pe = function(e2) {
  var t2 = e2.data, i2 = e2.identity, a3 = void 0 === i2 ? ne.identity : i2, d2 = e2.value, b2 = void 0 === d2 ? ne.identity : d2, u = e2.tile, s = void 0 === u ? ne.tile : u, p = e2.valueFormat, v = e2.innerPadding, h = void 0 === v ? ne.innerPadding : v, m = e2.outerPadding, y2 = void 0 === m ? ne.outerPadding : m, C2 = e2.leavesOnly, x2 = void 0 === C2 ? ne.leavesOnly : C2, P = e2.width, w = e2.height, M2 = e2.margin, R = e2.colors, S = void 0 === R ? ne.colors : R, z2 = e2.colorBy, O = void 0 === z2 ? ne.colorBy : z2, k = e2.nodeOpacity, T2 = void 0 === k ? ne.nodeOpacity : k, I = e2.borderWidth, E = void 0 === I ? ne.borderWidth : I, H = e2.borderColor, X = void 0 === H ? ne.borderColor : H, Y = e2.enableLabel, D2 = void 0 === Y ? ne.enableLabel : Y, q2 = e2.label, G2 = void 0 === q2 ? ne.label : q2, J2 = e2.labelTextColor, K2 = void 0 === J2 ? ne.labelTextColor : J2, N2 = e2.orientLabel, Q2 = void 0 === N2 ? ne.orientLabel : N2, U2 = e2.labelSkipSize, Z2 = void 0 === U2 ? ne.labelSkipSize : U2, $2 = e2.isInteractive, _2 = void 0 === $2 ? ne.isInteractive : $2, ee2 = e2.onMouseMove, te2 = e2.onClick, oe2 = e2.tooltip, ie2 = void 0 === oe2 ? ne.tooltip : oe2, ae2 = e2.pixelRatio, le2 = void 0 === ae2 ? ne.pixelRatio : ae2, de2 = e2.role, be2 = e2.ariaLabel, ue2 = e2.ariaLabelledBy, se2 = e2.ariaDescribedBy, ce2 = e2.forwardedRef, pe2 = (0, import_react.useRef)(null), ve2 = cn(P, w, M2), he2 = ve2.margin, fe2 = ve2.innerWidth, Le2 = ve2.innerHeight, ge2 = ve2.outerWidth, me2 = ve2.outerHeight, ye2 = re({ data: t2, identity: a3, value: b2, valueFormat: p, leavesOnly: x2, width: fe2, height: Le2, tile: s, innerPadding: h, outerPadding: y2, colors: S, colorBy: O, nodeOpacity: T2, borderColor: X, label: G2, labelTextColor: K2, orientLabel: Q2, enableParentLabel: false }).nodes, Ce2 = M();
  (0, import_react.useEffect)((function() {
    if (null !== pe2.current) {
      var e3 = pe2.current.getContext("2d");
      null !== e3 && (pe2.current.width = ge2 * le2, pe2.current.height = me2 * le2, e3.scale(le2, le2), e3.fillStyle = Ce2.background, e3.fillRect(0, 0, ge2, me2), e3.translate(he2.left, he2.top), ye2.forEach((function(t3) {
        e3.fillStyle = t3.color, e3.fillRect(t3.x, t3.y, t3.width, t3.height), E > 0 && (e3.strokeStyle = t3.borderColor, e3.lineWidth = E, e3.strokeRect(t3.x, t3.y, t3.width, t3.height));
      })), D2 && (e3.textAlign = "center", e3.textBaseline = "middle", a(e3, Ce2.labels.text), ye2.forEach((function(t3) {
        if (t3.isLeaf && (0 === Z2 || Math.min(t3.width, t3.height) > Z2)) {
          var o2 = Q2 && t3.height > t3.width;
          e3.save(), e3.translate(t3.x + t3.width / 2, t3.y + t3.height / 2), e3.rotate(ut(o2 ? -90 : 0)), d(e3, A({}, Ce2.labels.text, { fill: t3.labelTextColor }), String(t3.label)), e3.restore();
        }
      }))));
    }
  }), [pe2, ye2, ge2, me2, fe2, Le2, he2, E, D2, Q2, Z2, Ce2, le2]);
  var Pe2 = z(), we2 = Pe2.showTooltipFromEvent, Me2 = Pe2.hideTooltip, Re2 = (0, import_react.useCallback)((function(e3) {
    if (null !== pe2.current) {
      var t3 = kn(pe2.current, e3), o2 = t3[0], i3 = t3[1], a4 = xe(ye2, he2, o2, i3);
      void 0 !== a4 ? (we2((0, import_react.createElement)(ie2, { node: a4 }), e3, "left"), null == ee2 || ee2(a4, e3)) : Me2();
    }
  }), [pe2, ye2, he2, we2, Me2, ie2, ee2]), Se = (0, import_react.useCallback)((function() {
    Me2();
  }), [Me2]), ze = (0, import_react.useCallback)((function(e3) {
    if (null !== pe2.current) {
      var t3 = kn(pe2.current, e3), o2 = t3[0], n2 = t3[1], i3 = xe(ye2, he2, o2, n2);
      void 0 !== i3 && (null == te2 || te2(i3, e3));
    }
  }), [pe2, ye2, he2, te2]);
  return (0, import_jsx_runtime.jsx)("canvas", { ref: Rn(pe2, ce2), width: ge2 * le2, height: me2 * le2, style: { width: ge2, height: me2 }, onMouseEnter: _2 ? Re2 : void 0, onMouseMove: _2 ? Re2 : void 0, onMouseLeave: _2 ? Se : void 0, onClick: _2 ? ze : void 0, role: de2, "aria-label": be2, "aria-labelledby": ue2, "aria-describedby": se2 });
};
var we = (0, import_react.forwardRef)((function(e2, t2) {
  var o2 = e2.theme, n2 = e2.isInteractive, i2 = void 0 === n2 ? ne.isInteractive : n2, a3 = e2.animate, r2 = void 0 === a3 ? ne.animate : a3, l2 = e2.motionConfig, d2 = void 0 === l2 ? ne.motionConfig : l2, b2 = e2.renderWrapper, u = G(e2, Ce);
  return (0, import_jsx_runtime.jsx)(Fr, { isInteractive: i2, animate: r2, motionConfig: d2, theme: o2, renderWrapper: b2, children: (0, import_jsx_runtime.jsx)(Pe, A({}, u, { isInteractive: i2, forwardedRef: t2 })) });
}));
var Me = ["defaultWidth", "defaultHeight", "onResize", "debounceResize"];
var Re = (0, import_react.forwardRef)((function(e2, t2) {
  var o2 = e2.defaultWidth, n2 = e2.defaultHeight, i2 = e2.onResize, a3 = e2.debounceResize, r2 = G(e2, Me);
  return (0, import_jsx_runtime.jsx)($r, { defaultWidth: o2, defaultHeight: n2, onResize: i2, debounceResize: a3, children: function(e3) {
    var o3 = e3.width, n3 = e3.height;
    return (0, import_jsx_runtime.jsx)(we, A({}, r2, { width: o3, height: n3, ref: t2 }));
  } });
}));
export {
  he as ResponsiveTreeMap,
  Re as ResponsiveTreeMapCanvas,
  ye as ResponsiveTreeMapHtml,
  pe as TreeMap,
  we as TreeMapCanvas,
  ge as TreeMapHtml,
  ne as canvasDefaultProps,
  ee as commonDefaultProps,
  oe as htmlDefaultProps,
  Q as htmlLabelTransform,
  K as htmlNodeTransform,
  U as htmlParentLabelTransform,
  te as svgDefaultProps,
  N as svgLabelTransform,
  J as svgNodeTransform,
  ie as tileByType
};
//# sourceMappingURL=@nivo_treemap.js.map
