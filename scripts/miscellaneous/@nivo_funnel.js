import {
  require_baseEach,
  require_baseIteratee,
  require_isNumber
} from "./chunk-CTQWIACZ.js";
import {
  require_omit
} from "./chunk-TXS7J2AQ.js";
import "./chunk-SPG5J3R6.js";
import {
  $r,
  Dr,
  Fr,
  It,
  M,
  Rt,
  T,
  Ye,
  Yr,
  animated,
  b,
  cn,
  ct,
  ft,
  hn,
  hr,
  ht,
  useSpring,
  ut,
  z
} from "./chunk-43PHYVSV.js";
import {
  area_default,
  basis_default,
  line_default,
  linear,
  linear_default,
  ordinal,
  require_arrayFilter,
  require_get,
  require_isArray,
  require_isPlainObject
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

// node_modules/lodash/_baseFilter.js
var require_baseFilter = __commonJS({
  "node_modules/lodash/_baseFilter.js"(exports, module) {
    var baseEach = require_baseEach();
    function baseFilter(collection, predicate) {
      var result = [];
      baseEach(collection, function(value, index, collection2) {
        if (predicate(value, index, collection2)) {
          result.push(value);
        }
      });
      return result;
    }
    module.exports = baseFilter;
  }
});

// node_modules/lodash/filter.js
var require_filter = __commonJS({
  "node_modules/lodash/filter.js"(exports, module) {
    var arrayFilter = require_arrayFilter();
    var baseFilter = require_baseFilter();
    var baseIteratee = require_baseIteratee();
    var isArray = require_isArray();
    function filter(collection, predicate) {
      var func = isArray(collection) ? arrayFilter : baseFilter;
      return func(collection, baseIteratee(predicate, 3));
    }
    module.exports = filter;
  }
});

// node_modules/@nivo/funnel/dist/nivo-funnel.mjs
var import_react2 = __toESM(require_react(), 1);

// node_modules/@nivo/annotations/dist/nivo-annotations.mjs
var import_react = __toESM(require_react(), 1);
var import_filter = __toESM(require_filter(), 1);
var import_isNumber = __toESM(require_isNumber(), 1);
var import_omit = __toESM(require_omit(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function g() {
  return g = Object.assign ? Object.assign.bind() : function(t3) {
    for (var n3 = 1; n3 < arguments.length; n3++) {
      var i2 = arguments[n3];
      for (var o3 in i2) ({}).hasOwnProperty.call(i2, o3) && (t3[o3] = i2[o3]);
    }
    return t3;
  }, g.apply(null, arguments);
}
var k = { dotSize: 4, noteWidth: 120, noteTextOffset: 8, animate: true };
var W = function(n3) {
  var i2 = typeof n3;
  return (0, import_react.isValidElement)(n3) || "string" === i2 || "function" === i2 || "object" === i2;
};
var b2 = function(t3) {
  return "circle" === t3.type;
};
var w = function(t3) {
  return "dot" === t3.type;
};
var z2 = function(t3) {
  return "rect" === t3.type;
};
var P = function(t3) {
  var n3 = t3.data, i2 = t3.annotations, e3 = t3.getPosition, r2 = t3.getDimensions;
  return i2.reduce((function(t4, i3) {
    var s = i3.offset || 0;
    return [].concat(t4, (0, import_filter.default)(n3, i3.match).map((function(t5) {
      var n4 = e3(t5), o3 = r2(t5);
      return (b2(i3) || z2(i3)) && (o3.size = o3.size + 2 * s, o3.width = o3.width + 2 * s, o3.height = o3.height + 2 * s), g({}, (0, import_omit.default)(i3, ["match", "offset"]), n4, o3, { size: i3.size || o3.size, datum: t5 });
    })));
  }), []);
};
var C = function(t3, n3, i2, o3) {
  var e3 = Math.atan2(o3 - n3, i2 - t3);
  return ht(ct(e3));
};
var S = function(t3) {
  var n3, i2, o3 = t3.x, a2 = t3.y, r2 = t3.noteX, s = t3.noteY, h = t3.noteWidth, d = void 0 === h ? k.noteWidth : h, c = t3.noteTextOffset, f = void 0 === c ? k.noteTextOffset : c;
  if ((0, import_isNumber.default)(r2)) n3 = o3 + r2;
  else {
    if (void 0 === r2.abs) throw new Error("noteX should be either a number or an object containing an 'abs' property");
    n3 = r2.abs;
  }
  if ((0, import_isNumber.default)(s)) i2 = a2 + s;
  else {
    if (void 0 === s.abs) throw new Error("noteY should be either a number or an object containing an 'abs' property");
    i2 = s.abs;
  }
  var y = o3, x2 = a2, m2 = C(o3, a2, n3, i2);
  if (b2(t3)) {
    var p2 = ft(ut(m2), t3.size / 2);
    y += p2.x, x2 += p2.y;
  }
  if (z2(t3)) {
    var g2 = Math.round((m2 + 90) / 45) % 8;
    0 === g2 && (x2 -= t3.height / 2), 1 === g2 && (y += t3.width / 2, x2 -= t3.height / 2), 2 === g2 && (y += t3.width / 2), 3 === g2 && (y += t3.width / 2, x2 += t3.height / 2), 4 === g2 && (x2 += t3.height / 2), 5 === g2 && (y -= t3.width / 2, x2 += t3.height / 2), 6 === g2 && (y -= t3.width / 2), 7 === g2 && (y -= t3.width / 2, x2 -= t3.height / 2);
  }
  var W3 = n3, v = n3;
  return (m2 + 90) % 360 > 180 ? (W3 -= d, v -= d) : v += d, { points: [[y, x2], [n3, i2], [v, i2]], text: [W3, i2 - f], angle: m2 + 90 };
};
var O = function(t3) {
  var i2 = t3.data, o3 = t3.annotations, e3 = t3.getPosition, a2 = t3.getDimensions;
  return (0, import_react.useMemo)((function() {
    return P({ data: i2, annotations: o3, getPosition: e3, getDimensions: a2 });
  }), [i2, o3, e3, a2]);
};
var M2 = function(t3) {
  return (0, import_react.useMemo)((function() {
    return S(t3);
  }), [t3]);
};
var T2 = function(t3) {
  var n3 = t3.datum, o3 = t3.x, e3 = t3.y, r2 = t3.note, s = M(), l = Dr(), u = l.animate, d = l.config, k3 = useSpring({ x: o3, y: e3, config: d, immediate: !u });
  return "function" == typeof r2 ? (0, import_react.createElement)(r2, { x: o3, y: e3, datum: n3 }) : (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [s.annotations.text.outlineWidth > 0 && (0, import_jsx_runtime.jsx)(animated.text, { x: k3.x, y: k3.y, style: g({}, s.annotations.text, { strokeLinejoin: "round", strokeWidth: 2 * s.annotations.text.outlineWidth, stroke: s.annotations.text.outlineColor }), children: r2 }), (0, import_jsx_runtime.jsx)(animated.text, { x: k3.x, y: k3.y, style: (0, import_omit.default)(s.annotations.text, ["outlineWidth", "outlineColor"]), children: r2 })] });
};
var E = function(t3) {
  var i2 = t3.points, o3 = t3.isOutline, e3 = void 0 !== o3 && o3, a2 = M(), r2 = (0, import_react.useMemo)((function() {
    var t4 = i2[0];
    return i2.slice(1).reduce((function(t5, n3) {
      return t5 + " L" + n3[0] + "," + n3[1];
    }), "M" + t4[0] + "," + t4[1]);
  }), [i2]), s = It(r2);
  if (e3 && a2.annotations.link.outlineWidth <= 0) return null;
  var l = g({}, a2.annotations.link);
  return e3 && (l.strokeLinecap = "square", l.strokeWidth = a2.annotations.link.strokeWidth + 2 * a2.annotations.link.outlineWidth, l.stroke = a2.annotations.link.outlineColor, l.opacity = a2.annotations.link.outlineOpacity), (0, import_jsx_runtime.jsx)(animated.path, { fill: "none", d: s, style: l });
};
var I = function(t3) {
  var n3 = t3.x, i2 = t3.y, o3 = t3.size, e3 = M(), a2 = Dr(), r2 = a2.animate, s = a2.config, l = useSpring({ x: n3, y: i2, radius: o3 / 2, config: s, immediate: !r2 });
  return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [e3.annotations.outline.outlineWidth > 0 && (0, import_jsx_runtime.jsx)(animated.circle, { cx: l.x, cy: l.y, r: l.radius, style: g({}, e3.annotations.outline, { fill: "none", strokeWidth: e3.annotations.outline.strokeWidth + 2 * e3.annotations.outline.outlineWidth, stroke: e3.annotations.outline.outlineColor, opacity: e3.annotations.outline.outlineOpacity }) }), (0, import_jsx_runtime.jsx)(animated.circle, { cx: l.x, cy: l.y, r: l.radius, style: e3.annotations.outline })] });
};
var D = function(t3) {
  var n3 = t3.x, i2 = t3.y, o3 = t3.size, e3 = void 0 === o3 ? k.dotSize : o3, a2 = M(), r2 = Dr(), s = r2.animate, l = r2.config, u = useSpring({ x: n3, y: i2, radius: e3 / 2, config: l, immediate: !s });
  return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [a2.annotations.outline.outlineWidth > 0 && (0, import_jsx_runtime.jsx)(animated.circle, { cx: u.x, cy: u.y, r: u.radius, style: g({}, a2.annotations.outline, { fill: "none", strokeWidth: 2 * a2.annotations.outline.outlineWidth, stroke: a2.annotations.outline.outlineColor, opacity: a2.annotations.outline.outlineOpacity }) }), (0, import_jsx_runtime.jsx)(animated.circle, { cx: u.x, cy: u.y, r: u.radius, style: a2.annotations.symbol })] });
};
var L = function(t3) {
  var n3 = t3.x, i2 = t3.y, o3 = t3.width, e3 = t3.height, a2 = t3.borderRadius, r2 = void 0 === a2 ? 6 : a2, s = M(), l = Dr(), u = l.animate, d = l.config, k3 = useSpring({ x: n3 - o3 / 2, y: i2 - e3 / 2, width: o3, height: e3, config: d, immediate: !u });
  return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [s.annotations.outline.outlineWidth > 0 && (0, import_jsx_runtime.jsx)(animated.rect, { x: k3.x, y: k3.y, rx: r2, ry: r2, width: k3.width, height: k3.height, style: g({}, s.annotations.outline, { fill: "none", strokeWidth: s.annotations.outline.strokeWidth + 2 * s.annotations.outline.outlineWidth, stroke: s.annotations.outline.outlineColor, opacity: s.annotations.outline.outlineOpacity }) }), (0, import_jsx_runtime.jsx)(animated.rect, { x: k3.x, y: k3.y, rx: r2, ry: r2, width: k3.width, height: k3.height, style: s.annotations.outline })] });
};
var R = function(t3) {
  var n3 = t3.datum, i2 = t3.x, o3 = t3.y, e3 = t3.note, a2 = M2(t3);
  if (!W(e3)) throw new Error("note should be a valid react element");
  return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [(0, import_jsx_runtime.jsx)(E, { points: a2.points, isOutline: true }), b2(t3) && (0, import_jsx_runtime.jsx)(I, { x: i2, y: o3, size: t3.size }), w(t3) && (0, import_jsx_runtime.jsx)(D, { x: i2, y: o3, size: t3.size }), z2(t3) && (0, import_jsx_runtime.jsx)(L, { x: i2, y: o3, width: t3.width, height: t3.height, borderRadius: t3.borderRadius }), (0, import_jsx_runtime.jsx)(E, { points: a2.points }), (0, import_jsx_runtime.jsx)(T2, { datum: n3, x: a2.text[0], y: a2.text[1], note: e3 })] });
};

// node_modules/@nivo/funnel/dist/nivo-funnel.mjs
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
var import_isPlainObject = __toESM(require_isPlainObject(), 1);
var import_get = __toESM(require_get(), 1);
function k2() {
  return k2 = Object.assign ? Object.assign.bind() : function(r2) {
    for (var e3 = 1; e3 < arguments.length; e3++) {
      var t3 = arguments[e3];
      for (var o3 in t3) ({}).hasOwnProperty.call(t3, o3) && (r2[o3] = t3[o3]);
    }
    return r2;
  }, k2.apply(null, arguments);
}
function A(r2, e3) {
  if (null == r2) return {};
  var t3 = {};
  for (var o3 in r2) if ({}.hasOwnProperty.call(r2, o3)) {
    if (-1 !== e3.indexOf(o3)) continue;
    t3[o3] = r2[o3];
  }
  return t3;
}
var R2 = { layers: ["separators", "parts", "labels", "annotations"], direction: "vertical", interpolation: "smooth", spacing: 0, shapeBlending: 0.66, colors: { scheme: "nivo" }, size: void 0, fillOpacity: 1, borderWidth: 6, borderColor: { from: "color" }, borderOpacity: 0.66, enableLabel: true, labelColor: { theme: "background" }, enableBeforeSeparators: true, beforeSeparatorLength: 0, beforeSeparatorOffset: 0, enableAfterSeparators: true, afterSeparatorLength: 0, afterSeparatorOffset: 0, annotations: [], isInteractive: true, currentPartSizeExtension: 0, role: "img", animate: Yr.animate, motionConfig: Yr.config };
var j = function(r2) {
  var e3 = r2.part;
  return (0, import_jsx_runtime2.jsx)(T, { id: e3.data.label, value: e3.formattedValue, color: e3.color, enableChip: true });
};
var F = function(r2, e3) {
  var t3 = area_default();
  return "vertical" === e3 ? t3.curve("smooth" === r2 ? basis_default : linear_default).x0((function(r3) {
    return r3.x0;
  })).x1((function(r3) {
    return r3.x1;
  })).y((function(r3) {
    return r3.y;
  })) : t3.curve("smooth" === r2 ? basis_default : linear_default).y0((function(r3) {
    return r3.y0;
  })).y1((function(r3) {
    return r3.y1;
  })).x((function(r3) {
    return r3.x;
  })), [t3, line_default().defined((function(r3) {
    return null !== r3;
  })).x((function(r3) {
    return r3.x;
  })).y((function(r3) {
    return r3.y;
  })).curve("smooth" === r2 ? basis_default : linear_default)];
};
var T3 = function(r2) {
  var e3, t3, o3 = r2.data, n3 = r2.direction, a2 = r2.width, i2 = r2.height, s = r2.spacing;
  "vertical" === n3 ? (e3 = i2, t3 = a2) : (e3 = a2, t3 = i2);
  var l = (e3 - s * (o3.length - 1)) / o3.length, p2 = function(r3) {
    return s * r3 + l * r3;
  };
  p2.bandwidth = l;
  var d = o3.map((function(r3) {
    return r3.value;
  }));
  return [p2, linear().domain([0, Math.max.apply(Math, d)]).range([0, t3])];
};
var H = function(r2) {
  var e3 = r2.parts, t3 = r2.direction, o3 = r2.width, n3 = r2.height, a2 = r2.spacing, i2 = r2.enableBeforeSeparators, s = r2.beforeSeparatorOffset, l = r2.enableAfterSeparators, p2 = r2.afterSeparatorOffset, d = [], u = [], f = e3[e3.length - 1];
  if ("vertical" === t3) {
    e3.forEach((function(r3) {
      var e4 = r3.y0 - a2 / 2;
      i2 && d.push({ partId: r3.data.id, x0: 0, x1: r3.x0 - s, y0: e4, y1: e4 }), l && u.push({ partId: r3.data.id, x0: r3.x1 + p2, x1: o3, y0: e4, y1: e4 });
    }));
    var c = f.y1;
    i2 && d.push(k2({}, d[d.length - 1], { partId: "none", y0: c, y1: c })), l && u.push(k2({}, u[u.length - 1], { partId: "none", y0: c, y1: c }));
  } else if ("horizontal" === t3) {
    e3.forEach((function(r3) {
      var e4 = r3.x0 - a2 / 2;
      d.push({ partId: r3.data.id, x0: e4, x1: e4, y0: 0, y1: r3.y0 - s }), u.push({ partId: r3.data.id, x0: e4, x1: e4, y0: r3.y1 + p2, y1: n3 });
    }));
    var h = f.x1;
    d.push(k2({}, d[d.length - 1], { partId: "none", x0: h, x1: h })), u.push(k2({}, u[u.length - 1], { partId: "none", x0: h, x1: h }));
  }
  return [d, u];
};
var D2 = function(r2) {
  var e3 = r2.parts, o3 = r2.setCurrentPartId, n3 = r2.isInteractive, a2 = r2.onMouseEnter, i2 = r2.onMouseLeave, s = r2.onMouseMove, l = r2.onClick, p2 = r2.showTooltipFromEvent, d = r2.hideTooltip, u = r2.tooltip, f = void 0 === u ? j : u;
  return n3 ? e3.map((function(r3) {
    return k2({}, r3, { onMouseEnter: function(e4) {
      o3(r3.data.id), p2((0, import_react2.createElement)(f, { part: r3 }), e4), null == a2 || a2(r3, e4);
    }, onMouseLeave: function(e4) {
      o3(null), d(), null == i2 || i2(r3, e4);
    }, onMouseMove: function(e4) {
      p2((0, import_react2.createElement)(f, { part: r3 }), e4), null == s || s(r3, e4);
    }, onClick: void 0 !== l ? function(e4) {
      l(r3, e4);
    } : void 0 });
  })) : e3;
};
var V = function(r2, e3) {
  if ("function" == typeof r2) return r2;
  if (Array.isArray(r2)) {
    var t3 = ordinal(r2);
    return function(r3) {
      return Number(t3(String(r3.id)));
    };
  }
  if ((0, import_isPlainObject.default)(r2)) {
    if ((function(r3) {
      return void 0 !== r3.datum;
    })(r2)) return function(e4) {
      var t4 = (0, import_get.default)(e4, r2.datum);
      return "number" == typeof t4 ? t4 : 0;
    };
    throw new Error("Invalid size, when using an object, you should specify a 'datum' property");
  }
  return function(r3) {
    return e3(r3.value);
  };
};
var N = function(e3, t3) {
  return (0, import_react2.useMemo)((function() {
    return V(e3, t3);
  }), [e3, t3]);
};
var q = function(t3) {
  var o3, n3, a2 = t3.data, s = t3.width, l = t3.height, p2 = t3.direction, d = void 0 === p2 ? R2.direction : p2, u = t3.interpolation, f = void 0 === u ? R2.interpolation : u, c = t3.spacing, h = void 0 === c ? R2.spacing : c, v = t3.shapeBlending, y = void 0 === v ? R2.shapeBlending : v, b3 = t3.valueFormat, x2 = t3.colors, P2 = void 0 === x2 ? R2.colors : x2, C2 = t3.size, O2 = void 0 === C2 ? R2.size : C2, w3 = t3.fillOpacity, I3 = void 0 === w3 ? R2.fillOpacity : w3, L3 = t3.borderWidth, W3 = void 0 === L3 ? R2.borderWidth : L3, B2 = t3.borderColor, E2 = void 0 === B2 ? R2.borderColor : B2, z3 = t3.borderOpacity, G = void 0 === z3 ? R2.borderOpacity : z3, A2 = t3.labelColor, j2 = void 0 === A2 ? R2.labelColor : A2, V2 = t3.enableBeforeSeparators, q2 = void 0 === V2 ? R2.enableBeforeSeparators : V2, J2 = t3.beforeSeparatorLength, K2 = void 0 === J2 ? R2.beforeSeparatorLength : J2, Q2 = t3.beforeSeparatorOffset, U2 = void 0 === Q2 ? R2.beforeSeparatorOffset : Q2, X2 = t3.enableAfterSeparators, Y2 = void 0 === X2 ? R2.enableAfterSeparators : X2, Z2 = t3.afterSeparatorLength, $2 = void 0 === Z2 ? R2.afterSeparatorLength : Z2, _2 = t3.afterSeparatorOffset, rr2 = void 0 === _2 ? R2.afterSeparatorOffset : _2, er2 = t3.isInteractive, tr2 = void 0 === er2 ? R2.isInteractive : er2, or2 = t3.currentPartSizeExtension, nr = void 0 === or2 ? R2.currentPartSizeExtension : or2, ar = t3.currentBorderWidth, ir = t3.onMouseEnter, sr = t3.onMouseMove, lr = t3.onMouseLeave, pr = t3.onClick, dr = t3.tooltip, ur = M(), fr = hr(P2, "id"), cr = Ye(E2, ur), hr2 = Ye(j2, ur), vr = hn(b3), yr = (0, import_react2.useMemo)((function() {
    return F(f, d);
  }), [f, d]), br = yr[0], xr = yr[1], mr = q2 ? K2 + U2 : 0, gr = Y2 ? $2 + rr2 : 0;
  "vertical" === d ? (o3 = s - mr - gr, n3 = l) : (o3 = s, n3 = l - mr - gr);
  var Sr = (0, import_react2.useMemo)((function() {
    return T3({ data: a2, direction: d, width: o3, height: n3, spacing: h });
  }), [a2, d, o3, n3, h]), Pr = Sr[0], Cr = Sr[1], Or = N(O2, Cr), Mr = (0, import_react2.useState)(null), wr = Mr[0], Ir = Mr[1], Lr = (0, import_react2.useMemo)((function() {
    var r2 = a2.map((function(r3, e4) {
      var t4, a3, i2, s2, l2 = r3.id === wr, p3 = Or(r3);
      "vertical" === d ? (t4 = p3, a3 = Pr.bandwidth, s2 = mr + 0.5 * (o3 - t4), i2 = Pr(e4)) : (t4 = Pr.bandwidth, a3 = p3, s2 = Pr(e4), i2 = mr + 0.5 * (n3 - a3));
      var u2 = s2 + t4, f2 = s2 + 0.5 * t4, c2 = i2 + a3, h2 = i2 + 0.5 * a3, v2 = { data: r3, width: t4, height: a3, color: fr(r3), fillOpacity: I3, borderWidth: l2 && void 0 !== ar ? ar : W3, borderOpacity: G, formattedValue: vr(r3.value), isCurrent: l2, x: f2, x0: s2, x1: u2, y: h2, y0: i2, y1: c2, borderColor: "", labelColor: "", points: [], areaPoints: [], borderPoints: [] };
      return v2.borderColor = cr(v2), v2.labelColor = hr2(v2), v2;
    })), e3 = y / 2;
    return r2.forEach((function(t4, o4) {
      var n4 = r2[o4 + 1];
      if ("vertical" === d) {
        t4.points.push({ x: t4.x0, y: t4.y0 }), t4.points.push({ x: t4.x1, y: t4.y0 }), n4 ? (t4.points.push({ x: n4.x1, y: t4.y1 }), t4.points.push({ x: n4.x0, y: t4.y1 })) : (t4.points.push({ x: t4.points[1].x, y: t4.y1 }), t4.points.push({ x: t4.points[0].x, y: t4.y1 })), t4.isCurrent && (t4.points[0].x -= nr, t4.points[1].x += nr, t4.points[2].x += nr, t4.points[3].x -= nr), t4.areaPoints = [{ x: 0, x0: t4.points[0].x, x1: t4.points[1].x, y: t4.y0, y0: 0, y1: 0 }], t4.areaPoints.push(k2({}, t4.areaPoints[0], { y: t4.y0 + t4.height * e3 }));
        var a3 = { x: 0, x0: t4.points[3].x, x1: t4.points[2].x, y: t4.y1, y0: 0, y1: 0 };
        t4.areaPoints.push(k2({}, a3, { y: t4.y1 - t4.height * e3 })), t4.areaPoints.push(a3), [0, 1, 2, 3].map((function(r3) {
          t4.borderPoints.push({ x: t4.areaPoints[r3].x0, y: t4.areaPoints[r3].y });
        })), t4.borderPoints.push(null), [3, 2, 1, 0].map((function(r3) {
          t4.borderPoints.push({ x: t4.areaPoints[r3].x1, y: t4.areaPoints[r3].y });
        }));
      } else {
        t4.points.push({ x: t4.x0, y: t4.y0 }), n4 ? (t4.points.push({ x: t4.x1, y: n4.y0 }), t4.points.push({ x: t4.x1, y: n4.y1 })) : (t4.points.push({ x: t4.x1, y: t4.y0 }), t4.points.push({ x: t4.x1, y: t4.y1 })), t4.points.push({ x: t4.x0, y: t4.y1 }), t4.isCurrent && (t4.points[0].y -= nr, t4.points[1].y -= nr, t4.points[2].y += nr, t4.points[3].y += nr), t4.areaPoints = [{ x: t4.x0, x0: 0, x1: 0, y: 0, y0: t4.points[0].y, y1: t4.points[3].y }], t4.areaPoints.push(k2({}, t4.areaPoints[0], { x: t4.x0 + t4.width * e3 }));
        var i2 = { x: t4.x1, x0: 0, x1: 0, y: 0, y0: t4.points[1].y, y1: t4.points[2].y };
        t4.areaPoints.push(k2({}, i2, { x: t4.x1 - t4.width * e3 })), t4.areaPoints.push(i2), [0, 1, 2, 3].map((function(r3) {
          t4.borderPoints.push({ x: t4.areaPoints[r3].x, y: t4.areaPoints[r3].y0 });
        })), t4.borderPoints.push(null), [3, 2, 1, 0].map((function(r3) {
          t4.borderPoints.push({ x: t4.areaPoints[r3].x, y: t4.areaPoints[r3].y1 });
        }));
      }
    })), r2;
  }), [a2, d, Pr, o3, n3, mr, y, fr, vr, cr, hr2, wr, G, W3, ar, nr, I3, Or]), Wr = z(), Br = Wr.showTooltipFromEvent, Er = Wr.hideTooltip, zr = (0, import_react2.useMemo)((function() {
    return D2({ parts: Lr, setCurrentPartId: Ir, isInteractive: tr2, onMouseEnter: ir, onMouseLeave: lr, onMouseMove: sr, onClick: pr, showTooltipFromEvent: Br, hideTooltip: Er, tooltip: dr });
  }), [Lr, Ir, tr2, ir, lr, sr, pr, Br, Er, dr]), Gr = (0, import_react2.useMemo)((function() {
    return H({ parts: Lr, direction: d, width: s, height: l, spacing: h, enableBeforeSeparators: q2, beforeSeparatorOffset: U2, enableAfterSeparators: Y2, afterSeparatorOffset: rr2 });
  }), [Lr, d, s, l, h, q2, U2, Y2, rr2]), kr = Gr[0], Ar = Gr[1], Rr = (0, import_react2.useMemo)((function() {
    return { width: s, height: l, parts: zr, areaGenerator: br, borderGenerator: xr, beforeSeparators: kr, afterSeparators: Ar, setCurrentPartId: Ir };
  }), [s, l, zr, br, xr, kr, Ar, Ir]);
  return { parts: zr, areaGenerator: br, borderGenerator: xr, beforeSeparators: kr, afterSeparators: Ar, setCurrentPartId: Ir, currentPartId: wr, customLayerProps: Rr };
};
var J = function(r2, e3) {
  return O({ data: r2, annotations: e3, getPosition: function(r3) {
    return { x: r3.x, y: r3.y };
  }, getDimensions: function(r3) {
    var e4 = r3.width, t3 = r3.height;
    return { size: Math.max(e4, t3), width: e4, height: t3 };
  } });
};
var K = function(r2) {
  var e3 = r2.part, t3 = r2.areaGenerator, o3 = r2.borderGenerator, n3 = Dr(), a2 = n3.animate, i2 = n3.config, p2 = It(t3(e3.areaPoints)), d = It(o3(e3.borderPoints)), u = useSpring({ areaColor: e3.color, borderWidth: e3.borderWidth, borderColor: e3.borderColor, config: i2, immediate: !a2 });
  return (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [e3.borderWidth > 0 && (0, import_jsx_runtime2.jsx)(animated.path, { d, stroke: u.borderColor, strokeWidth: u.borderWidth, strokeOpacity: e3.borderOpacity, fill: "none" }), (0, import_jsx_runtime2.jsx)(animated.path, { d: p2, fill: u.areaColor, fillOpacity: e3.fillOpacity, onMouseEnter: e3.onMouseEnter, onMouseLeave: e3.onMouseLeave, onMouseMove: e3.onMouseMove, onClick: e3.onClick })] });
};
var Q = function(r2) {
  var e3 = r2.parts, t3 = r2.areaGenerator, o3 = r2.borderGenerator;
  return (0, import_jsx_runtime2.jsx)(import_jsx_runtime2.Fragment, { children: e3.map((function(r3) {
    return (0, import_jsx_runtime2.jsx)(K, { part: r3, areaGenerator: t3, borderGenerator: o3 }, r3.data.id);
  })) });
};
var U = function(r2) {
  var e3 = r2.part, t3 = M(), o3 = Dr(), n3 = o3.animate, a2 = o3.config, i2 = useSpring({ transform: "translate(" + e3.x + ", " + e3.y + ")", color: e3.labelColor, config: a2, immediate: !n3 });
  return (0, import_jsx_runtime2.jsx)(animated.g, { transform: i2.transform, children: (0, import_jsx_runtime2.jsx)(b, { textAnchor: "middle", dominantBaseline: "central", style: k2({}, t3.labels.text, { fill: i2.color, pointerEvents: "none" }), children: e3.formattedValue }) });
};
var X = function(r2) {
  var e3 = r2.parts;
  return (0, import_jsx_runtime2.jsx)(import_jsx_runtime2.Fragment, { children: e3.map((function(r3) {
    return (0, import_jsx_runtime2.jsx)(U, { part: r3 }, r3.data.id);
  })) });
};
var Y = function(r2) {
  var e3 = r2.separator, t3 = M(), o3 = Dr(), n3 = o3.animate, a2 = o3.config, i2 = useSpring({ x1: e3.x0, x2: e3.x1, y1: e3.y0, y2: e3.y1, config: a2, immediate: !n3 });
  return (0, import_jsx_runtime2.jsx)(animated.line, k2({ x1: i2.x1, x2: i2.x2, y1: i2.y1, y2: i2.y2, fill: "none" }, t3.grid.line));
};
var Z = function(r2) {
  var e3 = r2.beforeSeparators, t3 = r2.afterSeparators;
  return (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [e3.map((function(r3) {
    return (0, import_jsx_runtime2.jsx)(Y, { separator: r3 }, r3.partId);
  })), t3.map((function(r3) {
    return (0, import_jsx_runtime2.jsx)(Y, { separator: r3 }, r3.partId);
  }))] });
};
var $ = function(r2) {
  var e3 = r2.parts, t3 = r2.annotations, o3 = J(e3, t3);
  return (0, import_jsx_runtime2.jsx)(import_jsx_runtime2.Fragment, { children: o3.map((function(r3, e4) {
    return (0, import_jsx_runtime2.jsx)(R, k2({}, r3), e4);
  })) });
};
var _ = ["isInteractive", "animate", "motionConfig", "theme", "renderWrapper"];
var rr = function(r2) {
  var e3 = r2.data, o3 = r2.width, a2 = r2.height, i2 = r2.margin, s = r2.direction, l = void 0 === s ? R2.direction : s, p2 = r2.interpolation, f = void 0 === p2 ? R2.interpolation : p2, c = r2.spacing, h = void 0 === c ? R2.spacing : c, v = r2.shapeBlending, y = void 0 === v ? R2.shapeBlending : v, b3 = r2.valueFormat, x2 = r2.colors, m2 = void 0 === x2 ? R2.colors : x2, g2 = r2.size, S2 = void 0 === g2 ? R2.size : g2, P2 = r2.fillOpacity, C2 = void 0 === P2 ? R2.fillOpacity : P2, O2 = r2.borderWidth, M3 = void 0 === O2 ? R2.borderWidth : O2, I3 = r2.borderColor, L3 = void 0 === I3 ? R2.borderColor : I3, W3 = r2.borderOpacity, B2 = void 0 === W3 ? R2.borderOpacity : W3, E2 = r2.enableLabel, z3 = void 0 === E2 ? R2.enableLabel : E2, G = r2.labelColor, k3 = void 0 === G ? R2.labelColor : G, A2 = r2.enableBeforeSeparators, j2 = void 0 === A2 ? R2.enableBeforeSeparators : A2, F2 = r2.beforeSeparatorLength, T4 = void 0 === F2 ? R2.beforeSeparatorLength : F2, H2 = r2.beforeSeparatorOffset, D3 = void 0 === H2 ? R2.beforeSeparatorOffset : H2, V2 = r2.enableAfterSeparators, N2 = void 0 === V2 ? R2.enableAfterSeparators : V2, J2 = r2.afterSeparatorLength, K2 = void 0 === J2 ? R2.afterSeparatorLength : J2, U2 = r2.afterSeparatorOffset, Y2 = void 0 === U2 ? R2.afterSeparatorOffset : U2, _2 = r2.layers, rr2 = void 0 === _2 ? R2.layers : _2, er2 = r2.annotations, tr2 = void 0 === er2 ? R2.annotations : er2, or2 = r2.isInteractive, nr = void 0 === or2 ? R2.isInteractive : or2, ar = r2.currentPartSizeExtension, ir = void 0 === ar ? R2.currentPartSizeExtension : ar, sr = r2.currentBorderWidth, lr = r2.onMouseEnter, pr = r2.onMouseMove, dr = r2.onMouseLeave, ur = r2.onClick, fr = r2.tooltip, cr = r2.role, hr2 = void 0 === cr ? R2.role : cr, vr = r2.ariaLabel, yr = r2.ariaLabelledBy, br = r2.ariaDescribedBy, xr = r2.forwardedRef, mr = cn(o3, a2, i2), gr = mr.margin, Sr = mr.innerWidth, Pr = mr.innerHeight, Cr = mr.outerWidth, Or = mr.outerHeight, Mr = q({ data: e3, width: Sr, height: Pr, direction: l, interpolation: f, spacing: h, shapeBlending: y, valueFormat: b3, colors: m2, size: S2, fillOpacity: C2, borderWidth: M3, borderColor: L3, borderOpacity: B2, labelColor: k3, enableBeforeSeparators: j2, beforeSeparatorLength: T4, beforeSeparatorOffset: D3, enableAfterSeparators: N2, afterSeparatorLength: K2, afterSeparatorOffset: Y2, isInteractive: nr, currentPartSizeExtension: ir, currentBorderWidth: sr, onMouseEnter: lr, onMouseMove: pr, onMouseLeave: dr, onClick: ur, tooltip: fr }), wr = Mr.areaGenerator, Ir = Mr.borderGenerator, Lr = Mr.parts, Wr = Mr.beforeSeparators, Br = Mr.afterSeparators, Er = Mr.customLayerProps, zr = { separators: null, parts: null, annotations: null, labels: null };
  return rr2.includes("separators") && (zr.separators = (0, import_jsx_runtime2.jsx)(Z, { beforeSeparators: Wr, afterSeparators: Br }, "separators")), rr2.includes("parts") && (zr.parts = (0, import_jsx_runtime2.jsx)(Q, { parts: Lr, areaGenerator: wr, borderGenerator: Ir }, "parts")), null != rr2 && rr2.includes("annotations") && (zr.annotations = (0, import_jsx_runtime2.jsx)($, { parts: Lr, annotations: tr2 }, "annotations")), rr2.includes("labels") && z3 && (zr.labels = (0, import_jsx_runtime2.jsx)(X, { parts: Lr }, "labels")), (0, import_jsx_runtime2.jsx)(Rt, { width: Cr, height: Or, margin: gr, role: hr2, ariaLabel: vr, ariaLabelledBy: yr, ariaDescribedBy: br, ref: xr, children: rr2.map((function(r3, e4) {
    var o4;
    return "function" == typeof r3 ? (0, import_jsx_runtime2.jsx)(import_react2.Fragment, { children: (0, import_react2.createElement)(r3, Er) }, e4) : null != (o4 = null == zr ? void 0 : zr[r3]) ? o4 : null;
  })) });
};
var er = (0, import_react2.forwardRef)((function(r2, e3) {
  var t3 = r2.isInteractive, o3 = void 0 === t3 ? R2.isInteractive : t3, n3 = r2.animate, a2 = void 0 === n3 ? R2.animate : n3, i2 = r2.motionConfig, s = void 0 === i2 ? R2.motionConfig : i2, l = r2.theme, d = r2.renderWrapper, u = A(r2, _);
  return (0, import_jsx_runtime2.jsx)(Fr, { animate: a2, isInteractive: o3, motionConfig: s, renderWrapper: d, theme: l, children: (0, import_jsx_runtime2.jsx)(rr, k2({ isInteractive: o3 }, u, { forwardedRef: e3 })) });
}));
var tr = ["defaultWidth", "defaultHeight", "onResize", "debounceResize"];
var or = (0, import_react2.forwardRef)((function(r2, e3) {
  var t3 = r2.defaultWidth, o3 = r2.defaultHeight, n3 = r2.onResize, a2 = r2.debounceResize, i2 = A(r2, tr);
  return (0, import_jsx_runtime2.jsx)($r, { defaultWidth: t3, defaultHeight: o3, onResize: n3, debounceResize: a2, children: function(r3) {
    var t4 = r3.width, o4 = r3.height;
    return (0, import_jsx_runtime2.jsx)(er, k2({ width: t4, height: o4 }, i2, { ref: e3 }));
  } });
}));
export {
  er as Funnel,
  or as ResponsiveFunnel,
  D2 as computePartsHandlers,
  T3 as computeScales,
  H as computeSeparators,
  F as computeShapeGenerators,
  V as getSizeGenerator,
  R2 as svgDefaultProps,
  q as useFunnel,
  J as useFunnelAnnotations,
  N as useSize
};
//# sourceMappingURL=@nivo_funnel.js.map
