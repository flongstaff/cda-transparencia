import {
  M,
  a,
  b,
  d
} from "./chunk-43PHYVSV.js";
import {
  require_jsx_runtime
} from "./chunk-32NEGIXE.js";
import {
  require_react
} from "./chunk-65KY755N.js";
import {
  __toESM
} from "./chunk-V4OQ3NZ2.js";

// node_modules/@nivo/legends/dist/nivo-legends.mjs
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var l = __toESM(require_react(), 1);
var import_react = __toESM(require_react(), 1);
var v = function(e2) {
  var i = e2.x, n = e2.y, o = e2.size, r = e2.fill, l2 = e2.opacity, a3 = void 0 === l2 ? 1 : l2, c2 = e2.borderWidth, s2 = void 0 === c2 ? 0 : c2, d3 = e2.borderColor;
  return (0, import_jsx_runtime.jsx)("circle", { r: o / 2, cx: i + o / 2, cy: n + o / 2, fill: r, opacity: a3, strokeWidth: s2, stroke: void 0 === d3 ? "transparent" : d3, style: { pointerEvents: "none" } });
};
var u = function(e2) {
  var i = e2.x, n = e2.y, o = e2.size, r = e2.fill, l2 = e2.opacity, a3 = void 0 === l2 ? 1 : l2, c2 = e2.borderWidth, s2 = void 0 === c2 ? 0 : c2, d3 = e2.borderColor;
  return (0, import_jsx_runtime.jsx)("g", { transform: "translate(" + i + "," + n + ")", children: (0, import_jsx_runtime.jsx)("path", { d: "\n                    M" + o / 2 + " 0\n                    L" + 0.8 * o + " " + o / 2 + "\n                    L" + o / 2 + " " + o + "\n                    L" + 0.2 * o + " " + o / 2 + "\n                    L" + o / 2 + " 0\n                ", fill: r, opacity: a3, strokeWidth: s2, stroke: void 0 === d3 ? "transparent" : d3, style: { pointerEvents: "none" } }) });
};
var p = function(e2) {
  var i = e2.x, n = e2.y, o = e2.size, r = e2.fill, l2 = e2.opacity, a3 = void 0 === l2 ? 1 : l2, c2 = e2.borderWidth, s2 = void 0 === c2 ? 0 : c2, d3 = e2.borderColor;
  return (0, import_jsx_runtime.jsx)("rect", { x: i, y: n, fill: r, opacity: a3, strokeWidth: s2, stroke: void 0 === d3 ? "transparent" : d3, width: o, height: o, style: { pointerEvents: "none" } });
};
var y = function(e2) {
  var i = e2.x, n = e2.y, o = e2.size, r = e2.fill, l2 = e2.opacity, a3 = void 0 === l2 ? 1 : l2, c2 = e2.borderWidth, s2 = void 0 === c2 ? 0 : c2, d3 = e2.borderColor;
  return (0, import_jsx_runtime.jsx)("g", { transform: "translate(" + i + "," + n + ")", children: (0, import_jsx_runtime.jsx)("path", { d: "\n                M" + o / 2 + " 0\n                L" + o + " " + o + "\n                L0 " + o + "\n                L" + o / 2 + " 0\n            ", fill: r, opacity: a3, strokeWidth: s2, stroke: void 0 === d3 ? "transparent" : d3, style: { pointerEvents: "none" } }) });
};
function b2() {
  return b2 = Object.assign ? Object.assign.bind() : function(t2) {
    for (var e2 = 1; e2 < arguments.length; e2++) {
      var i = arguments[e2];
      for (var n in i) ({}).hasOwnProperty.call(i, n) && (t2[n] = i[n]);
    }
    return t2;
  }, b2.apply(null, arguments);
}
var k = { translateX: 0, translateY: 0, padding: 0, itemsSpacing: 0, itemDirection: "left-to-right", justify: false, symbolShape: "square", symbolSize: 16, symbolSpacing: 8 };
var S = { top: 0, right: 0, bottom: 0, left: 0 };
var A = function(t2) {
  var e2, i = t2.direction, n = t2.itemsSpacing, o = t2.padding, r = t2.itemCount, l2 = t2.itemWidth, a3 = t2.itemHeight;
  if ("number" != typeof o && ("object" != typeof (e2 = o) || Array.isArray(e2) || null === e2)) throw new Error("Invalid property padding, must be one of: number, object");
  var c2 = "number" == typeof o ? { top: o, right: o, bottom: o, left: o } : b2({}, S, o), s2 = c2.left + c2.right, d3 = c2.top + c2.bottom, h = l2 + s2, g = a3 + d3, m = (r - 1) * n;
  return "row" === i ? h = l2 * r + m + s2 : "column" === i && (g = a3 * r + m + d3), { width: h, height: g, padding: c2 };
};
var C = function(t2) {
  var e2 = t2.anchor, i = t2.translateX, n = t2.translateY, o = t2.containerWidth, r = t2.containerHeight, l2 = t2.width, a3 = t2.height, c2 = i, s2 = n;
  switch (e2) {
    case "top":
      c2 += (o - l2) / 2;
      break;
    case "top-right":
      c2 += o - l2;
      break;
    case "right":
      c2 += o - l2, s2 += (r - a3) / 2;
      break;
    case "bottom-right":
      c2 += o - l2, s2 += r - a3;
      break;
    case "bottom":
      c2 += (o - l2) / 2, s2 += r - a3;
      break;
    case "bottom-left":
      s2 += r - a3;
      break;
    case "left":
      s2 += (r - a3) / 2;
      break;
    case "center":
      c2 += (o - l2) / 2, s2 += (r - a3) / 2;
  }
  return { x: c2, y: s2 };
};
var z = function(t2) {
  var e2, i, n, o, r, l2, a3 = t2.direction, c2 = t2.justify, s2 = t2.symbolSize, d3 = t2.symbolSpacing, h = t2.width, g = t2.height;
  switch (a3) {
    case "left-to-right":
      e2 = 0, i = (g - s2) / 2, o = g / 2, l2 = "central", c2 ? (n = h, r = "end") : (n = s2 + d3, r = "start");
      break;
    case "right-to-left":
      e2 = h - s2, i = (g - s2) / 2, o = g / 2, l2 = "central", c2 ? (n = 0, r = "start") : (n = h - s2 - d3, r = "end");
      break;
    case "top-to-bottom":
      e2 = (h - s2) / 2, i = 0, n = h / 2, r = "middle", c2 ? (o = g, l2 = "alphabetic") : (o = s2 + d3, l2 = "text-before-edge");
      break;
    case "bottom-to-top":
      e2 = (h - s2) / 2, i = g - s2, n = h / 2, r = "middle", c2 ? (o = 0, l2 = "text-before-edge") : (o = g - s2 - d3, l2 = "alphabetic");
  }
  return { symbolX: e2, symbolY: i, labelX: n, labelY: o, labelAnchor: r, labelAlignment: l2 };
};
var O = { circle: v, diamond: u, square: p, triangle: y };
var B = function(i) {
  var n, o, r, a3, d3, m, f, v2, u2, p2, y2, x = i.x, S2 = i.y, A2 = i.width, C2 = i.height, W = i.data, w = i.direction, X = void 0 === w ? k.itemDirection : w, Y = i.justify, B2 = void 0 === Y ? k.justify : Y, H2 = i.textColor, E2 = i.background, j2 = void 0 === E2 ? "transparent" : E2, L2 = i.opacity, M2 = void 0 === L2 ? 1 : L2, P = i.symbolShape, F = void 0 === P ? k.symbolShape : P, T = i.symbolSize, V = void 0 === T ? k.symbolSize : T, D = i.symbolSpacing, R = void 0 === D ? k.symbolSpacing : D, q = i.symbolBorderWidth, G = void 0 === q ? 0 : q, I = i.symbolBorderColor, _ = void 0 === I ? "transparent" : I, J = i.onClick, K = i.onMouseEnter, N = i.onMouseLeave, Q = i.toggleSerie, U = i.effects, Z = (0, import_react.useState)({}), $ = Z[0], tt = Z[1], et = M(), it = (0, import_react.useCallback)((function(t2) {
    if (U) {
      var e2 = U.filter((function(t3) {
        return "hover" === t3.on;
      })).reduce((function(t3, e3) {
        return b2({}, t3, e3.style);
      }), {});
      tt(e2);
    }
    null == K || K(W, t2);
  }), [K, W, U]), nt = (0, import_react.useCallback)((function(t2) {
    if (U) {
      var e2 = U.filter((function(t3) {
        return "hover" !== t3.on;
      })).reduce((function(t3, e3) {
        return b2({}, t3, e3.style);
      }), {});
      tt(e2);
    }
    null == N || N(W, t2);
  }), [N, W, U]), ot = z({ direction: X, justify: B2, symbolSize: null != (n = $.symbolSize) ? n : V, symbolSpacing: R, width: A2, height: C2 }), rt = ot.symbolX, lt = ot.symbolY, at = ot.labelX, ct = ot.labelY, st = ot.labelAnchor, dt = ot.labelAlignment, ht = [J, K, N, Q].some((function(t2) {
    return void 0 !== t2;
  })), gt = "function" == typeof F ? F : O[F];
  return (0, import_jsx_runtime.jsxs)("g", { transform: "translate(" + x + "," + S2 + ")", style: { opacity: null != (o = $.itemOpacity) ? o : M2 }, children: [(0, import_jsx_runtime.jsx)("rect", { width: A2, height: C2, fill: null != (r = $.itemBackground) ? r : j2, style: { cursor: ht ? "pointer" : "auto" }, onClick: function(t2) {
    null == J || J(W, t2), null == Q || Q(W.id);
  }, onMouseEnter: it, onMouseLeave: nt }), l.createElement(gt, b2({ id: W.id, x: rt, y: lt, size: null != (a3 = $.symbolSize) ? a3 : V, fill: null != (d3 = null != (m = W.fill) ? m : W.color) ? d3 : "black", borderWidth: null != (f = $.symbolBorderWidth) ? f : G, borderColor: null != (v2 = $.symbolBorderColor) ? v2 : _ }, W.hidden ? et.legends.hidden.symbol : void 0)), (0, import_jsx_runtime.jsx)(b, { textAnchor: st, style: b2({}, et.legends.text, { fill: null != (u2 = null != (p2 = null != (y2 = $.itemTextColor) ? y2 : H2) ? p2 : et.legends.text.fill) ? u2 : "black", dominantBaseline: dt, pointerEvents: "none", userSelect: "none" }, W.hidden ? et.legends.hidden.text : void 0), x: at, y: ct, children: W.label })] });
};
var H = function(e2) {
  var i = e2.data, n = e2.x, o = e2.y, r = e2.direction, l2 = e2.padding, a3 = void 0 === l2 ? k.padding : l2, c2 = e2.justify, s2 = e2.effects, d3 = e2.itemWidth, h = e2.itemHeight, g = e2.itemDirection, m = void 0 === g ? k.itemDirection : g, f = e2.itemsSpacing, v2 = void 0 === f ? k.itemsSpacing : f, u2 = e2.itemTextColor, p2 = e2.itemBackground, y2 = void 0 === p2 ? "transparent" : p2, b3 = e2.itemOpacity, x = void 0 === b3 ? 1 : b3, S2 = e2.symbolShape, C2 = e2.symbolSize, z2 = e2.symbolSpacing, W = e2.symbolBorderWidth, w = e2.symbolBorderColor, X = e2.onClick, Y = e2.onMouseEnter, O2 = e2.onMouseLeave, H2 = e2.toggleSerie, E2 = A({ itemCount: i.length, itemWidth: d3, itemHeight: h, itemsSpacing: v2, direction: r, padding: a3 }).padding, j2 = "row" === r ? d3 + v2 : 0, L2 = "column" === r ? h + v2 : 0;
  return (0, import_jsx_runtime.jsx)("g", { transform: "translate(" + n + "," + o + ")", children: i.map((function(e3, i2) {
    return (0, import_jsx_runtime.jsx)(B, { data: e3, x: i2 * j2 + E2.left, y: i2 * L2 + E2.top, width: d3, height: h, direction: m, justify: c2, effects: s2, textColor: u2, background: y2, opacity: x, symbolShape: S2, symbolSize: C2, symbolSpacing: z2, symbolBorderWidth: W, symbolBorderColor: w, onClick: X, onMouseEnter: Y, onMouseLeave: O2, toggleSerie: H2 }, i2);
  })) });
};
var E = function(e2) {
  var i = e2.data, n = e2.containerWidth, o = e2.containerHeight, r = e2.translateX, l2 = void 0 === r ? k.translateX : r, a3 = e2.translateY, c2 = void 0 === a3 ? k.translateY : a3, s2 = e2.anchor, d3 = e2.direction, h = e2.padding, g = void 0 === h ? k.padding : h, m = e2.justify, f = e2.itemsSpacing, v2 = void 0 === f ? k.itemsSpacing : f, u2 = e2.itemWidth, p2 = e2.itemHeight, y2 = e2.itemDirection, b3 = e2.itemTextColor, x = e2.itemBackground, S2 = e2.itemOpacity, z2 = e2.symbolShape, W = e2.symbolSize, w = e2.symbolSpacing, X = e2.symbolBorderWidth, Y = e2.symbolBorderColor, O2 = e2.onClick, B2 = e2.onMouseEnter, E2 = e2.onMouseLeave, j2 = e2.toggleSerie, L2 = e2.effects, M2 = A({ itemCount: i.length, itemsSpacing: v2, itemWidth: u2, itemHeight: p2, direction: d3, padding: g }), P = M2.width, F = M2.height, T = C({ anchor: s2, translateX: l2, translateY: c2, containerWidth: n, containerHeight: o, width: P, height: F }), V = T.x, D = T.y;
  return (0, import_jsx_runtime.jsx)(H, { data: i, x: V, y: D, direction: d3, padding: g, justify: m, effects: L2, itemsSpacing: v2, itemWidth: u2, itemHeight: p2, itemDirection: y2, itemTextColor: b3, itemBackground: x, itemOpacity: S2, symbolShape: z2, symbolSize: W, symbolSpacing: w, symbolBorderWidth: X, symbolBorderColor: Y, onClick: O2, onMouseEnter: B2, onMouseLeave: E2, toggleSerie: "boolean" == typeof j2 ? void 0 : j2 });
};
var j = { start: "left", middle: "center", end: "right" };
var L = function(t2, e2) {
  var i = e2.data, n = e2.containerWidth, o = e2.containerHeight, r = e2.translateX, l2 = void 0 === r ? 0 : r, a3 = e2.translateY, c2 = void 0 === a3 ? 0 : a3, s2 = e2.anchor, d3 = e2.direction, h = e2.padding, g = void 0 === h ? 0 : h, v2 = e2.justify, u2 = void 0 !== v2 && v2, p2 = e2.itemsSpacing, y2 = void 0 === p2 ? 0 : p2, k2 = e2.itemWidth, x = e2.itemHeight, S2 = e2.itemDirection, W = void 0 === S2 ? "left-to-right" : S2, w = e2.itemTextColor, X = e2.symbolSize, Y = void 0 === X ? 16 : X, O2 = e2.symbolSpacing, B2 = void 0 === O2 ? 8 : O2, H2 = e2.theme, E2 = A({ itemCount: i.length, itemWidth: k2, itemHeight: x, itemsSpacing: y2, direction: d3, padding: g }), L2 = E2.width, M2 = E2.height, P = E2.padding, F = C({ anchor: s2, translateX: l2, translateY: c2, containerWidth: n, containerHeight: o, width: L2, height: M2 }), T = F.x, V = F.y, D = "row" === d3 ? k2 + y2 : 0, R = "column" === d3 ? x + y2 : 0;
  t2.save(), t2.translate(T, V), a(t2, H2.legends.text), i.forEach((function(e3, i2) {
    var n2, o2 = i2 * D + P.left, r2 = i2 * R + P.top, l3 = z({ direction: W, justify: u2, symbolSize: Y, symbolSpacing: B2, width: k2, height: x }), a4 = l3.symbolX, c3 = l3.symbolY, s3 = l3.labelX, d4 = l3.labelY, h2 = l3.labelAnchor, g2 = l3.labelAlignment;
    t2.fillStyle = null != (n2 = e3.color) ? n2 : "black", t2.fillRect(o2 + a4, r2 + c3, Y, Y), t2.textAlign = j[h2], "central" === g2 && (t2.textBaseline = "middle"), d(t2, b2({}, H2.legends.text, { fill: null != w ? w : H2.legends.text.fill }), String(e3.label), o2 + s3, r2 + d4);
  })), t2.restore();
};

export {
  E,
  L
};
//# sourceMappingURL=chunk-VUB3VYAZ.js.map
