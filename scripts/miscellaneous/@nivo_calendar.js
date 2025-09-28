import {
  require_range
} from "./chunk-FT3TJI2B.js";
import {
  E,
  L
} from "./chunk-VUB3VYAZ.js";
import {
  $r,
  Fr,
  M,
  Rn,
  Rt,
  T,
  a,
  b,
  cn,
  d,
  hn,
  kn,
  ut,
  vn,
  wn,
  z
} from "./chunk-43PHYVSV.js";
import {
  quantize,
  require_baseGetTag,
  require_baseUnary,
  require_isObjectLike,
  require_memoize,
  require_nodeUtil
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

// node_modules/lodash/_baseIsDate.js
var require_baseIsDate = __commonJS({
  "node_modules/lodash/_baseIsDate.js"(exports, module) {
    var baseGetTag = require_baseGetTag();
    var isObjectLike = require_isObjectLike();
    var dateTag = "[object Date]";
    function baseIsDate(value) {
      return isObjectLike(value) && baseGetTag(value) == dateTag;
    }
    module.exports = baseIsDate;
  }
});

// node_modules/lodash/isDate.js
var require_isDate = __commonJS({
  "node_modules/lodash/isDate.js"(exports, module) {
    var baseIsDate = require_baseIsDate();
    var baseUnary = require_baseUnary();
    var nodeUtil = require_nodeUtil();
    var nodeIsDate = nodeUtil && nodeUtil.isDate;
    var isDate = nodeIsDate ? baseUnary(nodeIsDate) : baseIsDate;
    module.exports = isDate;
  }
});

// node_modules/@nivo/calendar/dist/nivo-calendar.mjs
var e = __toESM(require_react(), 1);
var import_react = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);

// node_modules/@nivo/calendar/node_modules/d3-time/src/interval.js
var t0 = /* @__PURE__ */ new Date();
var t1 = /* @__PURE__ */ new Date();
function newInterval(floori, offseti, count, field) {
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
  interval.range = function(start, stop, step) {
    var range = [], previous;
    start = interval.ceil(start);
    step = step == null ? 1 : Math.floor(step);
    if (!(start < stop) || !(step > 0)) return range;
    do
      range.push(previous = /* @__PURE__ */ new Date(+start)), offseti(start, step), floori(start);
    while (previous < start && start < stop);
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
  if (count) {
    interval.count = function(start, end) {
      t0.setTime(+start), t1.setTime(+end);
      floori(t0), floori(t1);
      return Math.floor(count(t0, t1));
    };
    interval.every = function(step) {
      step = Math.floor(step);
      return !isFinite(step) || !(step > 0) ? null : !(step > 1) ? interval : interval.filter(field ? function(d3) {
        return field(d3) % step === 0;
      } : function(d3) {
        return interval.count(0, d3) % step === 0;
      });
    };
  }
  return interval;
}

// node_modules/@nivo/calendar/node_modules/d3-time/src/millisecond.js
var millisecond = newInterval(function() {
}, function(date, step) {
  date.setTime(+date + step);
}, function(start, end) {
  return end - start;
});
millisecond.every = function(k2) {
  k2 = Math.floor(k2);
  if (!isFinite(k2) || !(k2 > 0)) return null;
  if (!(k2 > 1)) return millisecond;
  return newInterval(function(date) {
    date.setTime(Math.floor(date / k2) * k2);
  }, function(date, step) {
    date.setTime(+date + step * k2);
  }, function(start, end) {
    return (end - start) / k2;
  });
};
var milliseconds = millisecond.range;

// node_modules/@nivo/calendar/node_modules/d3-time/src/duration.js
var durationSecond = 1e3;
var durationMinute = 6e4;
var durationHour = 36e5;
var durationDay = 864e5;
var durationWeek = 6048e5;

// node_modules/@nivo/calendar/node_modules/d3-time/src/second.js
var second = newInterval(function(date) {
  date.setTime(date - date.getMilliseconds());
}, function(date, step) {
  date.setTime(+date + step * durationSecond);
}, function(start, end) {
  return (end - start) / durationSecond;
}, function(date) {
  return date.getUTCSeconds();
});
var seconds = second.range;

// node_modules/@nivo/calendar/node_modules/d3-time/src/minute.js
var minute = newInterval(function(date) {
  date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond);
}, function(date, step) {
  date.setTime(+date + step * durationMinute);
}, function(start, end) {
  return (end - start) / durationMinute;
}, function(date) {
  return date.getMinutes();
});
var minutes = minute.range;

// node_modules/@nivo/calendar/node_modules/d3-time/src/hour.js
var hour = newInterval(function(date) {
  date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond - date.getMinutes() * durationMinute);
}, function(date, step) {
  date.setTime(+date + step * durationHour);
}, function(start, end) {
  return (end - start) / durationHour;
}, function(date) {
  return date.getHours();
});
var hours = hour.range;

// node_modules/@nivo/calendar/node_modules/d3-time/src/day.js
var day = newInterval(function(date) {
  date.setHours(0, 0, 0, 0);
}, function(date, step) {
  date.setDate(date.getDate() + step);
}, function(start, end) {
  return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay;
}, function(date) {
  return date.getDate() - 1;
});
var day_default = day;
var days = day.range;

// node_modules/@nivo/calendar/node_modules/d3-time/src/week.js
function weekday(i2) {
  return newInterval(function(date) {
    date.setDate(date.getDate() - (date.getDay() + 7 - i2) % 7);
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setDate(date.getDate() + step * 7);
  }, function(start, end) {
    return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
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

// node_modules/@nivo/calendar/node_modules/d3-time/src/month.js
var month = newInterval(function(date) {
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
}, function(date, step) {
  date.setMonth(date.getMonth() + step);
}, function(start, end) {
  return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
}, function(date) {
  return date.getMonth();
});
var months = month.range;

// node_modules/@nivo/calendar/node_modules/d3-time/src/year.js
var year = newInterval(function(date) {
  date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);
}, function(date, step) {
  date.setFullYear(date.getFullYear() + step);
}, function(start, end) {
  return end.getFullYear() - start.getFullYear();
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

// node_modules/@nivo/calendar/node_modules/d3-time/src/utcMinute.js
var utcMinute = newInterval(function(date) {
  date.setUTCSeconds(0, 0);
}, function(date, step) {
  date.setTime(+date + step * durationMinute);
}, function(start, end) {
  return (end - start) / durationMinute;
}, function(date) {
  return date.getUTCMinutes();
});
var utcMinutes = utcMinute.range;

// node_modules/@nivo/calendar/node_modules/d3-time/src/utcHour.js
var utcHour = newInterval(function(date) {
  date.setUTCMinutes(0, 0, 0);
}, function(date, step) {
  date.setTime(+date + step * durationHour);
}, function(start, end) {
  return (end - start) / durationHour;
}, function(date) {
  return date.getUTCHours();
});
var utcHours = utcHour.range;

// node_modules/@nivo/calendar/node_modules/d3-time/src/utcDay.js
var utcDay = newInterval(function(date) {
  date.setUTCHours(0, 0, 0, 0);
}, function(date, step) {
  date.setUTCDate(date.getUTCDate() + step);
}, function(start, end) {
  return (end - start) / durationDay;
}, function(date) {
  return date.getUTCDate() - 1;
});
var utcDay_default = utcDay;
var utcDays = utcDay.range;

// node_modules/@nivo/calendar/node_modules/d3-time/src/utcWeek.js
function utcWeekday(i2) {
  return newInterval(function(date) {
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i2) % 7);
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCDate(date.getUTCDate() + step * 7);
  }, function(start, end) {
    return (end - start) / durationWeek;
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

// node_modules/@nivo/calendar/node_modules/d3-time/src/utcMonth.js
var utcMonth = newInterval(function(date) {
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
}, function(date, step) {
  date.setUTCMonth(date.getUTCMonth() + step);
}, function(start, end) {
  return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
}, function(date) {
  return date.getUTCMonth();
});
var utcMonths = utcMonth.range;

// node_modules/@nivo/calendar/node_modules/d3-time/src/utcYear.js
var utcYear = newInterval(function(date) {
  date.setUTCMonth(0, 1);
  date.setUTCHours(0, 0, 0, 0);
}, function(date, step) {
  date.setUTCFullYear(date.getUTCFullYear() + step);
}, function(start, end) {
  return end.getUTCFullYear() - start.getUTCFullYear();
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

// node_modules/@nivo/calendar/node_modules/d3-time-format/src/locale.js
function localDate(d3) {
  if (0 <= d3.y && d3.y < 100) {
    var date = new Date(-1, d3.m, d3.d, d3.H, d3.M, d3.S, d3.L);
    date.setFullYear(d3.y);
    return date;
  }
  return new Date(d3.y, d3.m, d3.d, d3.H, d3.M, d3.S, d3.L);
}
function utcDate(d3) {
  if (0 <= d3.y && d3.y < 100) {
    var date = new Date(Date.UTC(-1, d3.m, d3.d, d3.H, d3.M, d3.S, d3.L));
    date.setUTCFullYear(d3.y);
    return date;
  }
  return new Date(Date.UTC(d3.y, d3.m, d3.d, d3.H, d3.M, d3.S, d3.L));
}
function newDate(y, m, d3) {
  return { y, m, d: d3, H: 0, M: 0, S: 0, L: 0 };
}
function formatLocale(locale2) {
  var locale_dateTime = locale2.dateTime, locale_date = locale2.date, locale_time = locale2.time, locale_periods = locale2.periods, locale_weekdays = locale2.days, locale_shortWeekdays = locale2.shortDays, locale_months = locale2.months, locale_shortMonths = locale2.shortMonths;
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
      var string = [], i2 = -1, j = 0, n2 = specifier.length, c, pad2, format;
      if (!(date instanceof Date)) date = /* @__PURE__ */ new Date(+date);
      while (++i2 < n2) {
        if (specifier.charCodeAt(i2) === 37) {
          string.push(specifier.slice(j, i2));
          if ((pad2 = pads[c = specifier.charAt(++i2)]) != null) c = specifier.charAt(++i2);
          else pad2 = c === "e" ? " " : "0";
          if (format = formats2[c]) c = format(date, pad2);
          string.push(c);
          j = i2 + 1;
        }
      }
      string.push(specifier.slice(j, i2));
      return string.join("");
    };
  }
  function newParse(specifier, Z) {
    return function(string) {
      var d3 = newDate(1900, void 0, 1), i2 = parseSpecifier(d3, specifier, string += "", 0), week, day2;
      if (i2 != string.length) return null;
      if ("Q" in d3) return new Date(d3.Q);
      if ("s" in d3) return new Date(d3.s * 1e3 + ("L" in d3 ? d3.L : 0));
      if (Z && !("Z" in d3)) d3.Z = 0;
      if ("p" in d3) d3.H = d3.H % 12 + d3.p * 12;
      if (d3.m === void 0) d3.m = "q" in d3 ? d3.q : 0;
      if ("V" in d3) {
        if (d3.V < 1 || d3.V > 53) return null;
        if (!("w" in d3)) d3.w = 1;
        if ("Z" in d3) {
          week = utcDate(newDate(d3.y, 0, 1)), day2 = week.getUTCDay();
          week = day2 > 4 || day2 === 0 ? utcMonday.ceil(week) : utcMonday(week);
          week = utcDay_default.offset(week, (d3.V - 1) * 7);
          d3.y = week.getUTCFullYear();
          d3.m = week.getUTCMonth();
          d3.d = week.getUTCDate() + (d3.w + 6) % 7;
        } else {
          week = localDate(newDate(d3.y, 0, 1)), day2 = week.getDay();
          week = day2 > 4 || day2 === 0 ? monday.ceil(week) : monday(week);
          week = day_default.offset(week, (d3.V - 1) * 7);
          d3.y = week.getFullYear();
          d3.m = week.getMonth();
          d3.d = week.getDate() + (d3.w + 6) % 7;
        }
      } else if ("W" in d3 || "U" in d3) {
        if (!("w" in d3)) d3.w = "u" in d3 ? d3.u % 7 : "W" in d3 ? 1 : 0;
        day2 = "Z" in d3 ? utcDate(newDate(d3.y, 0, 1)).getUTCDay() : localDate(newDate(d3.y, 0, 1)).getDay();
        d3.m = 0;
        d3.d = "W" in d3 ? (d3.w + 6) % 7 + d3.W * 7 - (day2 + 5) % 7 : d3.w + d3.U * 7 - (day2 + 6) % 7;
      }
      if ("Z" in d3) {
        d3.H += d3.Z / 100 | 0;
        d3.M += d3.Z % 100;
        return utcDate(d3);
      }
      return localDate(d3);
    };
  }
  function parseSpecifier(d3, specifier, string, j) {
    var i2 = 0, n2 = specifier.length, m = string.length, c, parse;
    while (i2 < n2) {
      if (j >= m) return -1;
      c = specifier.charCodeAt(i2++);
      if (c === 37) {
        c = specifier.charAt(i2++);
        parse = parses[c in pads ? specifier.charAt(i2++) : c];
        if (!parse || (j = parse(d3, string, j)) < 0) return -1;
      } else if (c != string.charCodeAt(j++)) {
        return -1;
      }
    }
    return j;
  }
  function parsePeriod(d3, string, i2) {
    var n2 = periodRe.exec(string.slice(i2));
    return n2 ? (d3.p = periodLookup.get(n2[0].toLowerCase()), i2 + n2[0].length) : -1;
  }
  function parseShortWeekday(d3, string, i2) {
    var n2 = shortWeekdayRe.exec(string.slice(i2));
    return n2 ? (d3.w = shortWeekdayLookup.get(n2[0].toLowerCase()), i2 + n2[0].length) : -1;
  }
  function parseWeekday(d3, string, i2) {
    var n2 = weekdayRe.exec(string.slice(i2));
    return n2 ? (d3.w = weekdayLookup.get(n2[0].toLowerCase()), i2 + n2[0].length) : -1;
  }
  function parseShortMonth(d3, string, i2) {
    var n2 = shortMonthRe.exec(string.slice(i2));
    return n2 ? (d3.m = shortMonthLookup.get(n2[0].toLowerCase()), i2 + n2[0].length) : -1;
  }
  function parseMonth(d3, string, i2) {
    var n2 = monthRe.exec(string.slice(i2));
    return n2 ? (d3.m = monthLookup.get(n2[0].toLowerCase()), i2 + n2[0].length) : -1;
  }
  function parseLocaleDateTime(d3, string, i2) {
    return parseSpecifier(d3, locale_dateTime, string, i2);
  }
  function parseLocaleDate(d3, string, i2) {
    return parseSpecifier(d3, locale_date, string, i2);
  }
  function parseLocaleTime(d3, string, i2) {
    return parseSpecifier(d3, locale_time, string, i2);
  }
  function formatShortWeekday(d3) {
    return locale_shortWeekdays[d3.getDay()];
  }
  function formatWeekday(d3) {
    return locale_weekdays[d3.getDay()];
  }
  function formatShortMonth(d3) {
    return locale_shortMonths[d3.getMonth()];
  }
  function formatMonth(d3) {
    return locale_months[d3.getMonth()];
  }
  function formatPeriod(d3) {
    return locale_periods[+(d3.getHours() >= 12)];
  }
  function formatQuarter(d3) {
    return 1 + ~~(d3.getMonth() / 3);
  }
  function formatUTCShortWeekday(d3) {
    return locale_shortWeekdays[d3.getUTCDay()];
  }
  function formatUTCWeekday(d3) {
    return locale_weekdays[d3.getUTCDay()];
  }
  function formatUTCShortMonth(d3) {
    return locale_shortMonths[d3.getUTCMonth()];
  }
  function formatUTCMonth(d3) {
    return locale_months[d3.getUTCMonth()];
  }
  function formatUTCPeriod(d3) {
    return locale_periods[+(d3.getUTCHours() >= 12)];
  }
  function formatUTCQuarter(d3) {
    return 1 + ~~(d3.getUTCMonth() / 3);
  }
  return {
    format: function(specifier) {
      var f = newFormat(specifier += "", formats);
      f.toString = function() {
        return specifier;
      };
      return f;
    },
    parse: function(specifier) {
      var p = newParse(specifier += "", false);
      p.toString = function() {
        return specifier;
      };
      return p;
    },
    utcFormat: function(specifier) {
      var f = newFormat(specifier += "", utcFormats);
      f.toString = function() {
        return specifier;
      };
      return f;
    },
    utcParse: function(specifier) {
      var p = newParse(specifier += "", true);
      p.toString = function() {
        return specifier;
      };
      return p;
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
function requote(s) {
  return s.replace(requoteRe, "\\$&");
}
function formatRe(names) {
  return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
}
function formatLookup(names) {
  return new Map(names.map((name, i2) => [name.toLowerCase(), i2]));
}
function parseWeekdayNumberSunday(d3, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 1));
  return n2 ? (d3.w = +n2[0], i2 + n2[0].length) : -1;
}
function parseWeekdayNumberMonday(d3, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 1));
  return n2 ? (d3.u = +n2[0], i2 + n2[0].length) : -1;
}
function parseWeekNumberSunday(d3, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 2));
  return n2 ? (d3.U = +n2[0], i2 + n2[0].length) : -1;
}
function parseWeekNumberISO(d3, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 2));
  return n2 ? (d3.V = +n2[0], i2 + n2[0].length) : -1;
}
function parseWeekNumberMonday(d3, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 2));
  return n2 ? (d3.W = +n2[0], i2 + n2[0].length) : -1;
}
function parseFullYear(d3, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 4));
  return n2 ? (d3.y = +n2[0], i2 + n2[0].length) : -1;
}
function parseYear(d3, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 2));
  return n2 ? (d3.y = +n2[0] + (+n2[0] > 68 ? 1900 : 2e3), i2 + n2[0].length) : -1;
}
function parseZone(d3, string, i2) {
  var n2 = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i2, i2 + 6));
  return n2 ? (d3.Z = n2[1] ? 0 : -(n2[2] + (n2[3] || "00")), i2 + n2[0].length) : -1;
}
function parseQuarter(d3, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 1));
  return n2 ? (d3.q = n2[0] * 3 - 3, i2 + n2[0].length) : -1;
}
function parseMonthNumber(d3, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 2));
  return n2 ? (d3.m = n2[0] - 1, i2 + n2[0].length) : -1;
}
function parseDayOfMonth(d3, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 2));
  return n2 ? (d3.d = +n2[0], i2 + n2[0].length) : -1;
}
function parseDayOfYear(d3, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 3));
  return n2 ? (d3.m = 0, d3.d = +n2[0], i2 + n2[0].length) : -1;
}
function parseHour24(d3, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 2));
  return n2 ? (d3.H = +n2[0], i2 + n2[0].length) : -1;
}
function parseMinutes(d3, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 2));
  return n2 ? (d3.M = +n2[0], i2 + n2[0].length) : -1;
}
function parseSeconds(d3, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 2));
  return n2 ? (d3.S = +n2[0], i2 + n2[0].length) : -1;
}
function parseMilliseconds(d3, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 3));
  return n2 ? (d3.L = +n2[0], i2 + n2[0].length) : -1;
}
function parseMicroseconds(d3, string, i2) {
  var n2 = numberRe.exec(string.slice(i2, i2 + 6));
  return n2 ? (d3.L = Math.floor(n2[0] / 1e3), i2 + n2[0].length) : -1;
}
function parseLiteralPercent(d3, string, i2) {
  var n2 = percentRe.exec(string.slice(i2, i2 + 1));
  return n2 ? i2 + n2[0].length : -1;
}
function parseUnixTimestamp(d3, string, i2) {
  var n2 = numberRe.exec(string.slice(i2));
  return n2 ? (d3.Q = +n2[0], i2 + n2[0].length) : -1;
}
function parseUnixTimestampSeconds(d3, string, i2) {
  var n2 = numberRe.exec(string.slice(i2));
  return n2 ? (d3.s = +n2[0], i2 + n2[0].length) : -1;
}
function formatDayOfMonth(d3, p) {
  return pad(d3.getDate(), p, 2);
}
function formatHour24(d3, p) {
  return pad(d3.getHours(), p, 2);
}
function formatHour12(d3, p) {
  return pad(d3.getHours() % 12 || 12, p, 2);
}
function formatDayOfYear(d3, p) {
  return pad(1 + day_default.count(year_default(d3), d3), p, 3);
}
function formatMilliseconds(d3, p) {
  return pad(d3.getMilliseconds(), p, 3);
}
function formatMicroseconds(d3, p) {
  return formatMilliseconds(d3, p) + "000";
}
function formatMonthNumber(d3, p) {
  return pad(d3.getMonth() + 1, p, 2);
}
function formatMinutes(d3, p) {
  return pad(d3.getMinutes(), p, 2);
}
function formatSeconds(d3, p) {
  return pad(d3.getSeconds(), p, 2);
}
function formatWeekdayNumberMonday(d3) {
  var day2 = d3.getDay();
  return day2 === 0 ? 7 : day2;
}
function formatWeekNumberSunday(d3, p) {
  return pad(sunday.count(year_default(d3) - 1, d3), p, 2);
}
function dISO(d3) {
  var day2 = d3.getDay();
  return day2 >= 4 || day2 === 0 ? thursday(d3) : thursday.ceil(d3);
}
function formatWeekNumberISO(d3, p) {
  d3 = dISO(d3);
  return pad(thursday.count(year_default(d3), d3) + (year_default(d3).getDay() === 4), p, 2);
}
function formatWeekdayNumberSunday(d3) {
  return d3.getDay();
}
function formatWeekNumberMonday(d3, p) {
  return pad(monday.count(year_default(d3) - 1, d3), p, 2);
}
function formatYear(d3, p) {
  return pad(d3.getFullYear() % 100, p, 2);
}
function formatYearISO(d3, p) {
  d3 = dISO(d3);
  return pad(d3.getFullYear() % 100, p, 2);
}
function formatFullYear(d3, p) {
  return pad(d3.getFullYear() % 1e4, p, 4);
}
function formatFullYearISO(d3, p) {
  var day2 = d3.getDay();
  d3 = day2 >= 4 || day2 === 0 ? thursday(d3) : thursday.ceil(d3);
  return pad(d3.getFullYear() % 1e4, p, 4);
}
function formatZone(d3) {
  var z3 = d3.getTimezoneOffset();
  return (z3 > 0 ? "-" : (z3 *= -1, "+")) + pad(z3 / 60 | 0, "0", 2) + pad(z3 % 60, "0", 2);
}
function formatUTCDayOfMonth(d3, p) {
  return pad(d3.getUTCDate(), p, 2);
}
function formatUTCHour24(d3, p) {
  return pad(d3.getUTCHours(), p, 2);
}
function formatUTCHour12(d3, p) {
  return pad(d3.getUTCHours() % 12 || 12, p, 2);
}
function formatUTCDayOfYear(d3, p) {
  return pad(1 + utcDay_default.count(utcYear_default(d3), d3), p, 3);
}
function formatUTCMilliseconds(d3, p) {
  return pad(d3.getUTCMilliseconds(), p, 3);
}
function formatUTCMicroseconds(d3, p) {
  return formatUTCMilliseconds(d3, p) + "000";
}
function formatUTCMonthNumber(d3, p) {
  return pad(d3.getUTCMonth() + 1, p, 2);
}
function formatUTCMinutes(d3, p) {
  return pad(d3.getUTCMinutes(), p, 2);
}
function formatUTCSeconds(d3, p) {
  return pad(d3.getUTCSeconds(), p, 2);
}
function formatUTCWeekdayNumberMonday(d3) {
  var dow = d3.getUTCDay();
  return dow === 0 ? 7 : dow;
}
function formatUTCWeekNumberSunday(d3, p) {
  return pad(utcSunday.count(utcYear_default(d3) - 1, d3), p, 2);
}
function UTCdISO(d3) {
  var day2 = d3.getUTCDay();
  return day2 >= 4 || day2 === 0 ? utcThursday(d3) : utcThursday.ceil(d3);
}
function formatUTCWeekNumberISO(d3, p) {
  d3 = UTCdISO(d3);
  return pad(utcThursday.count(utcYear_default(d3), d3) + (utcYear_default(d3).getUTCDay() === 4), p, 2);
}
function formatUTCWeekdayNumberSunday(d3) {
  return d3.getUTCDay();
}
function formatUTCWeekNumberMonday(d3, p) {
  return pad(utcMonday.count(utcYear_default(d3) - 1, d3), p, 2);
}
function formatUTCYear(d3, p) {
  return pad(d3.getUTCFullYear() % 100, p, 2);
}
function formatUTCYearISO(d3, p) {
  d3 = UTCdISO(d3);
  return pad(d3.getUTCFullYear() % 100, p, 2);
}
function formatUTCFullYear(d3, p) {
  return pad(d3.getUTCFullYear() % 1e4, p, 4);
}
function formatUTCFullYearISO(d3, p) {
  var day2 = d3.getUTCDay();
  d3 = day2 >= 4 || day2 === 0 ? utcThursday(d3) : utcThursday.ceil(d3);
  return pad(d3.getUTCFullYear() % 1e4, p, 4);
}
function formatUTCZone() {
  return "+0000";
}
function formatLiteralPercent() {
  return "%";
}
function formatUnixTimestamp(d3) {
  return +d3;
}
function formatUnixTimestampSeconds(d3) {
  return Math.floor(+d3 / 1e3);
}

// node_modules/@nivo/calendar/node_modules/d3-time-format/src/defaultLocale.js
var locale;
var timeFormat;
var timeParse;
var utcFormat;
var utcParse;
defaultLocale({
  dateTime: "%x, %X",
  date: "%-m/%-d/%Y",
  time: "%-I:%M:%S %p",
  periods: ["AM", "PM"],
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});
function defaultLocale(definition) {
  locale = formatLocale(definition);
  timeFormat = locale.format;
  timeParse = locale.parse;
  utcFormat = locale.utcFormat;
  utcParse = locale.utcParse;
  return locale;
}

// node_modules/@nivo/calendar/node_modules/d3-time-format/src/isoFormat.js
var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";
function formatIsoNative(date) {
  return date.toISOString();
}
var formatIso = Date.prototype.toISOString ? formatIsoNative : utcFormat(isoSpecifier);

// node_modules/@nivo/calendar/node_modules/d3-time-format/src/isoParse.js
function parseIsoNative(string) {
  var date = new Date(string);
  return isNaN(date) ? null : date;
}
var parseIso = +/* @__PURE__ */ new Date("2000-01-01T00:00:00.000Z") ? parseIsoNative : utcParse(isoSpecifier);

// node_modules/@nivo/calendar/dist/nivo-calendar.mjs
var import_isDate = __toESM(require_isDate(), 1);
var import_memoize = __toESM(require_memoize(), 1);
var import_range = __toESM(require_range(), 1);
function J() {
  return J = Object.assign ? Object.assign.bind() : function(e2) {
    for (var t2 = 1; t2 < arguments.length; t2++) {
      var o2 = arguments[t2];
      for (var n2 in o2) ({}).hasOwnProperty.call(o2, n2) && (e2[n2] = o2[n2]);
    }
    return e2;
  }, J.apply(null, arguments);
}
function K(e2, t2) {
  if (null == e2) return {};
  var o2 = {};
  for (var n2 in e2) if ({}.hasOwnProperty.call(e2, n2)) {
    if (-1 !== t2.indexOf(n2)) continue;
    o2[n2] = e2[n2];
  }
  return o2;
}
var Q;
var U = (0, import_react.memo)((function(e2) {
  var t2 = e2.years, o2 = e2.legend, n2 = e2.theme;
  return (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: t2.map((function(e3) {
    return (0, import_jsx_runtime.jsx)(b, { transform: "translate(" + e3.x + "," + e3.y + ") rotate(" + e3.rotation + ")", textAnchor: "middle", style: n2.labels.text, children: o2(e3.year) }, e3.year);
  })) });
}));
var $ = (0, import_react.memo)((function(e2) {
  var t2 = e2.path, o2 = e2.borderWidth, n2 = e2.borderColor;
  return (0, import_jsx_runtime.jsx)("path", { d: t2, style: { fill: "none", strokeWidth: o2, stroke: n2, pointerEvents: "none" } });
}));
var _ = (0, import_react.memo)((function(e2) {
  var t2 = e2.months, o2 = e2.legend, n2 = e2.theme;
  return (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: t2.map((function(e3) {
    return (0, import_jsx_runtime.jsx)(b, { transform: "translate(" + e3.x + "," + e3.y + ") rotate(" + e3.rotation + ")", textAnchor: "middle", style: n2.labels.text, children: o2(e3.year, e3.month, e3.date) }, e3.date.toString() + ".legend");
  })) });
}));
var ee = (0, import_react.memo)((function(t2) {
  var n2 = t2.data, i2 = t2.x, r2 = t2.y, a3 = t2.size, d3 = t2.color, l2 = t2.borderWidth, c = t2.borderColor, h = t2.isInteractive, u = t2.tooltip, s = t2.onMouseEnter, f = t2.onMouseMove, g = t2.onMouseLeave, v = t2.onClick, m = t2.formatValue, y = z(), p = y.showTooltipFromEvent, b2 = y.hideTooltip, x = (0, import_react.useCallback)((function(t3) {
    if ("value" in n2) {
      var o2 = J({}, n2, { value: m(n2.value), data: J({}, n2.data) });
      p(e.createElement(u, J({}, o2)), t3), null == s || s(n2, t3);
    }
  }), [p, u, n2, s, m]), w = (0, import_react.useCallback)((function(t3) {
    if ("value" in n2) {
      var o2 = J({}, n2, { value: m(n2.value), data: J({}, n2.data) });
      p(e.createElement(u, J({}, o2)), t3), null == f || f(n2, t3);
    }
  }), [p, u, n2, f, m]), S = (0, import_react.useCallback)((function(e2) {
    "value" in n2 && (b2(), null == g || g(n2, e2));
  }), [b2, n2, g]), W = (0, import_react.useCallback)((function(e2) {
    return null == v ? void 0 : v(n2, e2);
  }), [n2, v]);
  return (0, import_jsx_runtime.jsx)("rect", { x: i2, y: r2, width: a3, height: a3, style: { fill: d3, strokeWidth: l2, stroke: c }, onMouseEnter: h ? x : void 0, onMouseMove: h ? w : void 0, onMouseLeave: h ? S : void 0, onClick: h ? W : void 0 });
}));
var te = (0, import_react.memo)((function(e2) {
  var t2 = e2.value, o2 = e2.day, n2 = e2.color;
  return void 0 === t2 || isNaN(Number(t2)) ? null : (0, import_jsx_runtime.jsx)(T, { id: o2, value: t2, color: n2, enableChip: true });
}));
var oe = timeFormat("%b");
var ne = { colors: ["#61cdbb", "#97e3d5", "#e8c1a0", "#f47560"], align: "center", direction: "horizontal", emptyColor: "#fff", minValue: 0, maxValue: "auto", yearSpacing: 30, yearLegend: function(e2) {
  return e2;
}, yearLegendPosition: "before", yearLegendOffset: 10, monthBorderWidth: 2, monthBorderColor: "#000", monthSpacing: 0, monthLegend: function(e2, t2, o2) {
  return oe(o2);
}, monthLegendPosition: "before", monthLegendOffset: 10, daySpacing: 0, dayBorderWidth: 1, dayBorderColor: "#000", isInteractive: true, legends: [], tooltip: te };
var ie = J({}, ne, { role: "img" });
var re = J({}, ne, { pixelRatio: "undefined" != typeof window && null != (Q = window.devicePixelRatio) ? Q : 1 });
var ae = J({}, ie, { dayBorderColor: "#fff", dayRadius: 0, square: true, weekdayLegendOffset: 75, firstWeekday: "sunday", weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] });
var de = function(e2, t2, o2) {
  var n2 = e2.map((function(e3) {
    return e3.value;
  }));
  return ["auto" === t2 ? Math.min.apply(Math, n2) : t2, "auto" === o2 ? Math.max.apply(Math, n2) : o2];
};
var le = (0, import_memoize.default)((function(e2) {
  var t2, o2 = e2.date, n2 = e2.cellSize, i2 = e2.yearIndex, r2 = e2.yearSpacing, a3 = e2.monthSpacing, d3 = e2.daySpacing, l2 = e2.direction, c = e2.originX, h = e2.originY, u = new Date(o2.getFullYear(), o2.getMonth() + 1, 0), s = sunday.count(year_default(o2), o2), f = sunday.count(year_default(u), u), g = o2.getDay(), v = u.getDay(), m = c, y = h, p = i2 * (7 * (n2 + d3) + r2), b2 = o2.getMonth() * a3;
  "horizontal" === l2 ? (y += p, m += b2) : (y += b2, m += p);
  var x = { x: m, y, width: 0, height: 0 };
  return "horizontal" === l2 ? (t2 = ["M" + (m + (s + 1) * (n2 + d3)) + "," + (y + g * (n2 + d3)), "H" + (m + s * (n2 + d3)) + "V" + (y + 7 * (n2 + d3)), "H" + (m + f * (n2 + d3)) + "V" + (y + (v + 1) * (n2 + d3)), "H" + (m + (f + 1) * (n2 + d3)) + "V" + y, "H" + (m + (s + 1) * (n2 + d3)) + "Z"].join(""), x.x = m + s * (n2 + d3), x.width = m + (f + 1) * (n2 + d3) - x.x, x.height = 7 * (n2 + d3)) : (t2 = ["M" + (m + g * (n2 + d3)) + "," + (y + (s + 1) * (n2 + d3)), "H" + m + "V" + (y + (f + 1) * (n2 + d3)), "H" + (m + (v + 1) * (n2 + d3)) + "V" + (y + f * (n2 + d3)), "H" + (m + 7 * (n2 + d3)) + "V" + (y + s * (n2 + d3)), "H" + (m + g * (n2 + d3)) + "Z"].join(""), x.y = y + s * (n2 + d3), x.width = 7 * (n2 + d3), x.height = y + (f + 1) * (n2 + d3) - x.y), { path: t2, bbox: x };
}), (function(e2) {
  var t2 = e2.date, o2 = e2.cellSize, n2 = e2.yearIndex, i2 = e2.yearSpacing, r2 = e2.monthSpacing, a3 = e2.daySpacing, d3 = e2.direction, l2 = e2.originX, c = e2.originY;
  return t2.toString() + "." + o2 + "." + n2 + "." + i2 + "." + r2 + "." + a3 + "." + d3 + "." + l2 + "." + c;
}));
var ce = timeFormat("%Y-%m-%d");
var he = function(e2) {
  var t2, o2 = e2.width, n2 = e2.height, i2 = e2.from, r2 = e2.to, a3 = e2.direction, d3 = e2.yearSpacing, l2 = e2.monthSpacing, h = e2.daySpacing, u = e2.align, s = (0, import_isDate.default)(i2) ? i2 : new Date(i2), f = (0, import_isDate.default)(r2) ? r2 : new Date(r2), g = (0, import_range.default)(s.getFullYear(), f.getFullYear() + 1), v = Math.max.apply(Math, g.map((function(e3) {
    return sundays(new Date(e3, 0, 1), new Date(e3 + 1, 0, 1)).length;
  }))) + 1, m = (function(e3) {
    var t3, o3, n3 = e3.width, i3 = e3.height, r3 = e3.direction, a4 = e3.yearRange, d4 = e3.yearSpacing, l3 = e3.monthSpacing, c = e3.daySpacing, h2 = e3.maxWeeks;
    return "horizontal" === r3 ? (t3 = (n3 - 12 * l3 - c * h2) / h2, o3 = (i3 - (a4.length - 1) * d4 - a4.length * (8 * c)) / (7 * a4.length)) : (t3 = (n3 - (a4.length - 1) * d4 - a4.length * (8 * c)) / (7 * a4.length), o3 = (i3 - 12 * l3 - c * h2) / h2), Math.min(t3, o3);
  })({ width: o2, height: n2, direction: a3, yearRange: g, yearSpacing: d3, monthSpacing: l2, daySpacing: h, maxWeeks: v }), y = m * v + h * v + 12 * l2, p = 7 * (m + h) * g.length + d3 * (g.length - 1), b2 = "horizontal" === a3 ? y : p, x = "horizontal" === a3 ? p : y, w = vn({ x: 0, y: 0, width: b2, height: x }, { x: 0, y: 0, width: o2, height: n2 }, u), S = w[0], W = w[1];
  t2 = "horizontal" === a3 ? /* @__PURE__ */ (function(e3, t3, o3, n3) {
    return function(i3, r3, a4, d4) {
      return { x: i3 + sunday.count(year_default(a4), a4) * (e3 + n3) + n3 / 2 + a4.getMonth() * o3, y: r3 + a4.getDay() * (e3 + n3) + n3 / 2 + d4 * (t3 + 7 * (e3 + n3)) };
    };
  })(m, d3, l2, h) : /* @__PURE__ */ (function(e3, t3, o3, n3) {
    return function(i3, r3, a4, d4) {
      var l3 = sunday.count(year_default(a4), a4);
      return { x: i3 + a4.getDay() * (e3 + n3) + n3 / 2 + d4 * (t3 + 7 * (e3 + n3)), y: r3 + l3 * (e3 + n3) + n3 / 2 + a4.getMonth() * o3 };
    };
  })(m, d3, l2, h);
  var L2 = [], k2 = [], M3 = [];
  return g.forEach((function(e3, o3) {
    var n3 = new Date(e3, 0, 1), i3 = new Date(e3 + 1, 0, 1);
    M3 = M3.concat(days(n3, i3).map((function(e4) {
      return J({ date: e4, day: ce(e4), size: m }, t2(S, W, e4, o3));
    })));
    var r3 = months(n3, i3).map((function(e4) {
      return J({ date: e4, year: e4.getFullYear(), month: e4.getMonth() }, le({ originX: S, originY: W, date: e4, direction: a3, yearIndex: o3, yearSpacing: d3, monthSpacing: l2, daySpacing: h, cellSize: m }));
    }));
    k2 = k2.concat(r3), L2.push({ year: e3, bbox: { x: r3[0].bbox.x, y: r3[0].bbox.y, width: r3[11].bbox.x - r3[0].bbox.x + r3[11].bbox.width, height: r3[11].bbox.y - r3[0].bbox.y + r3[11].bbox.height } });
  })), { years: L2, months: k2, days: M3, cellSize: m, calendarWidth: b2, calendarHeight: x, originX: S, originY: W };
};
var ue = function(e2) {
  var t2 = e2.days, o2 = e2.data, n2 = e2.colorScale, i2 = e2.emptyColor;
  return t2.map((function(e3) {
    var t3 = o2.find((function(t4) {
      return t4.day === e3.day;
    }));
    return J({}, e3, t3 ? { color: n2(t3.value), data: t3, value: t3.value } : { color: i2 });
  }));
};
var se = function(e2) {
  var t2 = e2.years, o2 = e2.direction, n2 = e2.position, i2 = e2.offset;
  return t2.map((function(e3) {
    var t3 = 0, r2 = 0, a3 = 0;
    return "horizontal" === o2 && "before" === n2 ? (t3 = e3.bbox.x - i2, r2 = e3.bbox.y + e3.bbox.height / 2, a3 = -90) : "horizontal" === o2 && "after" === n2 ? (t3 = e3.bbox.x + e3.bbox.width + i2, r2 = e3.bbox.y + e3.bbox.height / 2, a3 = -90) : "vertical" === o2 && "before" === n2 ? (t3 = e3.bbox.x + e3.bbox.width / 2, r2 = e3.bbox.y - i2) : (t3 = e3.bbox.x + e3.bbox.width / 2, r2 = e3.bbox.y + e3.bbox.height + i2), J({}, e3, { x: t3, y: r2, rotation: a3 });
  }));
};
var fe = function(e2) {
  var t2 = e2.months, o2 = e2.direction, n2 = e2.position, i2 = e2.offset;
  return t2.map((function(e3) {
    var t3 = 0, r2 = 0, a3 = 0;
    return "horizontal" === o2 && "before" === n2 ? (t3 = e3.bbox.x + e3.bbox.width / 2, r2 = e3.bbox.y - i2) : "horizontal" === o2 && "after" === n2 ? (t3 = e3.bbox.x + e3.bbox.width / 2, r2 = e3.bbox.y + e3.bbox.height + i2) : "vertical" === o2 && "before" === n2 ? (t3 = e3.bbox.x - i2, r2 = e3.bbox.y + e3.bbox.height / 2, a3 = -90) : (t3 = e3.bbox.x + e3.bbox.width + i2, r2 = e3.bbox.y + e3.bbox.height / 2, a3 = -90), J({}, e3, { x: t3, y: r2, rotation: a3 });
  }));
};
var ge = function(e2) {
  var t2 = e2.width, o2 = e2.height, i2 = e2.from, r2 = e2.to, a3 = e2.direction, d3 = e2.yearSpacing, l2 = e2.monthSpacing, c = e2.daySpacing, h = e2.align;
  return (0, import_react.useMemo)((function() {
    return he({ width: t2, height: o2, from: i2, to: r2, direction: a3, yearSpacing: d3, monthSpacing: l2, daySpacing: c, align: h });
  }), [t2, o2, i2, r2, a3, d3, l2, c, h]);
};
var ve = function(e2) {
  var t2 = e2.data, o2 = e2.minValue, i2 = e2.maxValue, r2 = e2.colors, a3 = e2.colorScale;
  return (0, import_react.useMemo)((function() {
    if (a3) return a3;
    var e3 = de(t2, o2, i2);
    return quantize().domain(e3).range(r2);
  }), [t2, o2, i2, r2, a3]);
};
var me = function(e2) {
  var t2 = e2.years, o2 = e2.direction, i2 = e2.yearLegendPosition, r2 = e2.yearLegendOffset;
  return (0, import_react.useMemo)((function() {
    return se({ years: t2, direction: o2, position: i2, offset: r2 });
  }), [t2, o2, i2, r2]);
};
var ye = function(e2) {
  var t2 = e2.months, o2 = e2.direction, i2 = e2.monthLegendPosition, r2 = e2.monthLegendOffset;
  return (0, import_react.useMemo)((function() {
    return fe({ months: t2, direction: o2, position: i2, offset: r2 });
  }), [t2, o2, i2, r2]);
};
var pe = function(e2) {
  var t2 = e2.days, o2 = e2.data, i2 = e2.colorScale, r2 = e2.emptyColor;
  return (0, import_react.useMemo)((function() {
    return ue({ days: t2, data: o2, colorScale: i2, emptyColor: r2 });
  }), [t2, o2, i2, r2]);
};
var be = ["months", "years"];
var xe = ["isInteractive", "renderWrapper", "theme"];
var we = function(e2) {
  var t2 = e2.margin, o2 = e2.width, n2 = e2.height, i2 = e2.align, r2 = void 0 === i2 ? ie.align : i2, a3 = e2.colors, d3 = void 0 === a3 ? ie.colors : a3, l2 = e2.colorScale, c = e2.data, h = e2.direction, g = void 0 === h ? ie.direction : h, v = e2.emptyColor, m = void 0 === v ? ie.emptyColor : v, y = e2.from, p = e2.to, w = e2.minValue, S = void 0 === w ? ie.minValue : w, W = e2.maxValue, L2 = void 0 === W ? ie.maxValue : W, M3 = e2.valueFormat, C = e2.legendFormat, R = e2.yearLegend, H = void 0 === R ? ie.yearLegend : R, V = e2.yearLegendOffset, O2 = void 0 === V ? ie.yearLegendOffset : V, I2 = e2.yearLegendPosition, D2 = void 0 === I2 ? ie.yearLegendPosition : I2, P = e2.yearSpacing, B = void 0 === P ? ie.yearSpacing : P, E2 = e2.monthBorderColor, F = void 0 === E2 ? ie.monthBorderColor : E2, T2 = e2.monthBorderWidth, Y = void 0 === T2 ? ie.monthBorderWidth : T2, j = e2.monthLegend, q = void 0 === j ? ie.monthLegend : j, A = e2.monthLegendOffset, X = void 0 === A ? ie.monthLegendOffset : A, N = e2.monthLegendPosition, Z = void 0 === N ? ie.monthLegendPosition : N, G = e2.monthSpacing, Q2 = void 0 === G ? ie.monthSpacing : G, te2 = e2.dayBorderColor, oe2 = void 0 === te2 ? ie.dayBorderColor : te2, ne2 = e2.dayBorderWidth, re2 = void 0 === ne2 ? ie.dayBorderWidth : ne2, ae2 = e2.daySpacing, de2 = void 0 === ae2 ? ie.daySpacing : ae2, le2 = e2.isInteractive, ce2 = void 0 === le2 ? ie.isInteractive : le2, he2 = e2.tooltip, ue2 = void 0 === he2 ? ie.tooltip : he2, se2 = e2.onClick, fe2 = e2.onMouseEnter, xe2 = e2.onMouseLeave, we2 = e2.onMouseMove, Se2 = e2.legends, We2 = void 0 === Se2 ? ie.legends : Se2, Le2 = e2.role, ke2 = void 0 === Le2 ? ie.role : Le2, Me2 = e2.forwardedRef, ze2 = M(), Ce2 = cn(o2, n2, t2), Re2 = Ce2.margin, He2 = Ce2.innerWidth, Ve2 = Ce2.innerHeight, Oe2 = Ce2.outerWidth, Ie2 = Ce2.outerHeight, De2 = ge({ width: He2, height: Ve2, from: y, to: p, direction: g, yearSpacing: B, monthSpacing: Q2, daySpacing: de2, align: r2 }), Pe2 = De2.months, Be2 = De2.years, Ee2 = K(De2, be), Fe2 = ve({ data: c, minValue: S, maxValue: L2, colors: d3, colorScale: l2 }), Te2 = ye({ months: Pe2, direction: g, monthLegendPosition: Z, monthLegendOffset: X }), Ye2 = me({ years: Be2, direction: g, yearLegendPosition: D2, yearLegendOffset: O2 }), je2 = pe({ days: Ee2.days, data: c, colorScale: Fe2, emptyColor: m }), qe2 = hn(C), Ae2 = hn(M3);
  return (0, import_jsx_runtime.jsxs)(Rt, { width: Oe2, height: Ie2, margin: Re2, role: ke2, ref: Me2, children: [je2.map((function(e3) {
    return (0, import_jsx_runtime.jsx)(ee, { data: e3, x: e3.x, y: e3.y, size: e3.size, color: e3.color, borderWidth: re2, borderColor: oe2, onMouseEnter: fe2, onMouseLeave: xe2, onMouseMove: we2, isInteractive: ce2, tooltip: ue2, onClick: se2, formatValue: Ae2 }, e3.date.toString());
  })), Pe2.map((function(e3) {
    return (0, import_jsx_runtime.jsx)($, { path: e3.path, borderWidth: Y, borderColor: F }, e3.date.toString());
  })), (0, import_jsx_runtime.jsx)(_, { months: Te2, legend: q, theme: ze2 }), (0, import_jsx_runtime.jsx)(U, { years: Ye2, legend: H, theme: ze2 }), We2.map((function(e3, t3) {
    var i3 = Fe2.ticks(e3.itemCount).map((function(e4) {
      return { id: e4, label: qe2(e4), color: Fe2(e4) };
    }));
    return (0, import_jsx_runtime.jsx)(E, J({}, e3, { containerWidth: o2, containerHeight: n2, data: i3 }), t3);
  }))] });
};
var Se = (0, import_react.forwardRef)((function(e2, t2) {
  var o2 = e2.isInteractive, n2 = void 0 === o2 ? ie.isInteractive : o2, i2 = e2.renderWrapper, r2 = e2.theme, a3 = K(e2, xe);
  return (0, import_jsx_runtime.jsx)(Fr, { isInteractive: n2, renderWrapper: i2, theme: r2, children: (0, import_jsx_runtime.jsx)(we, J({ isInteractive: n2 }, a3, { forwardedRef: t2 })) });
}));
var We = timeFormat("%Y-%m-%d");
var Le = function(e2) {
  var t2, o2, n2 = e2.direction, i2 = e2.daySpacing, r2 = e2.offset, a3 = e2.square, d3 = e2.totalDays, l2 = e2.width, c = e2.height;
  "horizontal" === n2 ? (l2 -= r2, t2 = 7, o2 = Math.ceil(d3 / 7)) : (c -= r2, o2 = 7, t2 = Math.ceil(d3 / 7));
  var h = (c - i2 * (t2 + 1)) / t2, u = (l2 - i2 * (o2 + 1)) / o2, s = Math.min(h, u);
  return { columns: o2, rows: t2, cellHeight: a3 ? s : h, cellWidth: a3 ? s : u };
};
var ke = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function Me(e2) {
  return ke.findIndex((function(t2) {
    return t2.toLowerCase() === e2;
  }));
}
var ze = function(e2, t2) {
  var o2 = e2.getDay() - Me(t2);
  return [0, 1, 2, 3, 4, 5, 6].slice(o2)[0];
};
function Ce(e2) {
  var t2 = e2.startDate, o2 = e2.date, n2 = e2.direction, i2 = e2.firstWeekday, r2 = (function(e3) {
    return [sunday, monday, tuesday, wednesday, thursday, friday, saturday][Me(e3)];
  })(i2), a3 = r2.count(t2, o2), d3 = o2.getMonth(), l2 = o2.getFullYear(), c = 0, h = 0;
  return "horizontal" === n2 ? (c = a3, h = ze(o2, i2)) : (c = ze(o2, i2), h = a3), { currentColumn: c, year: l2, currentRow: h, firstWeek: a3, month: d3, date: o2 };
}
var Re = function(e2) {
  var t2 = e2.direction, o2 = e2.colorScale, n2 = e2.emptyColor, i2 = e2.from, r2 = e2.to, a3 = e2.data, d3 = e2.cellWidth, l2 = e2.cellHeight, c = e2.daySpacing, h = e2.offset, u = e2.firstWeekday, s = c, f = c;
  "horizontal" === t2 ? s += h : f += h;
  var g = i2 || a3[0].date, v = r2 || a3[a3.length - 1].date, m = (0, import_isDate.default)(g) ? g : new Date(g), y = (0, import_isDate.default)(v) ? v : new Date(v);
  return days(m, y).map((function(e3) {
    return { date: e3, day: We(e3) };
  })).map((function(e3) {
    var i3 = a3.find((function(t3) {
      return t3.day === e3.day;
    })), r3 = Ce({ startDate: m, date: e3.date, direction: t2, firstWeekday: u }), h2 = r3.currentColumn, g2 = r3.currentRow, v2 = r3.firstWeek, y2 = r3.year, p = r3.month, b2 = r3.date, x = { x: s + c * h2 + d3 * h2, y: f + c * g2 + l2 * g2 };
    return i3 ? J({}, i3, { coordinates: x, firstWeek: v2, month: p, year: y2, date: b2, color: o2(i3.value), width: d3, height: l2 }) : J({}, e3, { coordinates: x, firstWeek: v2, month: p, year: y2, date: b2, color: n2, width: d3, height: l2 });
  }));
};
var He = function(e2) {
  var t2, o2, n2 = e2.cellHeight, i2 = e2.cellWidth, r2 = e2.direction, a3 = e2.daySpacing, d3 = e2.ticks, l2 = void 0 === d3 ? [1, 3, 5] : d3, c = e2.firstWeekday, h = e2.arrayOfWeekdays, u = i2 + a3, s = n2 + a3, f = (t2 = void 0 === h ? ke : h, o2 = Me(c), t2.length && o2 ? (o2 %= t2.length, t2.slice(o2, t2.length).concat(t2.slice(0, o2))) : t2);
  return l2.map((function(e3) {
    return { value: f[e3], rotation: "horizontal" === r2 ? 0 : -90, y: "horizontal" === r2 ? s * (e3 + 1) - s / 3 : 0, x: "horizontal" === r2 ? 0 : u * (e3 + 1) - u / 3 };
  }));
};
var Ve = function(e2) {
  var t2 = e2.direction, o2 = e2.daySpacing, n2 = e2.days, i2 = e2.cellHeight, r2 = e2.cellWidth;
  return n2.reduce((function(e3, n3) {
    if (e3.weeks.length === n3.firstWeek || !e3.weeks.length && 1 === n3.firstWeek) {
      e3.weeks.push(n3);
      var a3 = n3.year + "-" + n3.month;
      if (Object.keys(e3.months).includes(a3)) "horizontal" === t2 ? e3.months[a3].bbox.width = (n3.firstWeek - e3.months[a3].firstWeek) * (r2 + o2) : e3.months[a3].bbox.height = (n3.firstWeek - e3.months[a3].firstWeek) * (i2 + o2);
      else {
        var d3 = { x: 0, y: 0, width: 0, height: 0 };
        "horizontal" === t2 ? (d3.x = n3.coordinates.x - o2, d3.height = i2 + o2, d3.width = r2 + 2 * o2) : (d3.y = n3.coordinates.y - o2, d3.height = i2 + 2 * o2, d3.width = r2 + 2 * o2), e3.months[a3] = { date: n3.date, bbox: d3, firstWeek: n3.firstWeek, month: 0, year: 0 };
      }
    }
    return e3;
  }), { months: {}, weeks: [] });
};
var Oe = function(e2) {
  var t2, o2, n2 = e2.from, i2 = e2.to, r2 = e2.data;
  return t2 = n2 ? (0, import_isDate.default)(n2) ? n2 : new Date(n2) : r2[0].date, o2 = n2 && i2 ? (0, import_isDate.default)(i2) ? i2 : new Date(i2) : r2[r2.length - 1].date, t2.getDay() + day_default.count(t2, o2);
};
var Ie = (0, import_react.memo)((function(e2) {
  var t2 = e2.data, n2 = e2.x, i2 = e2.ry, a3 = void 0 === i2 ? 5 : i2, d3 = e2.rx, l2 = void 0 === d3 ? 5 : d3, c = e2.y, h = e2.width, u = e2.height, s = e2.color, f = e2.borderWidth, g = e2.borderColor, v = e2.isInteractive, m = e2.tooltip, y = e2.onMouseEnter, p = e2.onMouseMove, b2 = e2.onMouseLeave, x = e2.onClick, w = e2.formatValue, S = z(), W = S.showTooltipFromEvent, L2 = S.hideTooltip, M3 = (0, import_react.useCallback)((function(e3) {
    if ("value" in t2) {
      var o2 = J({}, t2, { value: w(t2.value) });
      W((0, import_react.createElement)(m, J({}, o2)), e3), null == y || y(t2, e3);
    }
  }), [W, m, t2, y, w]), z3 = (0, import_react.useCallback)((function(e3) {
    if ("value" in t2) {
      var o2 = J({}, t2, { value: w(t2.value) });
      W((0, import_react.createElement)(m, J({}, o2)), e3), null == p || p(t2, e3);
    }
  }), [W, m, t2, p, w]), R = (0, import_react.useCallback)((function(e3) {
    "value" in t2 && (L2(), null == b2 || b2(t2, e3));
  }), [L2, t2, b2]), H = (0, import_react.useCallback)((function(e3) {
    return null == x ? void 0 : x(t2, e3);
  }), [t2, x]);
  return (0, import_jsx_runtime.jsx)("rect", { x: n2, y: c, rx: l2, ry: a3, width: h, height: u, style: { fill: s, strokeWidth: f, stroke: g }, onMouseEnter: v ? M3 : void 0, onMouseMove: v ? z3 : void 0, onMouseLeave: v ? R : void 0, onClick: v ? H : void 0 });
}));
var De = ["isInteractive", "renderWrapper", "theme"];
var Pe = function(e2) {
  var t2 = e2.margin, o2 = e2.width, i2 = e2.height, r2 = e2.square, a3 = void 0 === r2 ? ae.square : r2, d3 = e2.colors, l2 = void 0 === d3 ? ae.colors : d3, c = e2.colorScale, h = e2.emptyColor, g = void 0 === h ? ae.emptyColor : h, v = e2.from, m = e2.to, y = e2.data, p = e2.direction, w = void 0 === p ? ae.direction : p, W = e2.minValue, L2 = void 0 === W ? ae.minValue : W, M3 = e2.maxValue, C = void 0 === M3 ? ae.maxValue : M3, R = e2.valueFormat, H = e2.legendFormat, V = e2.monthLegend, O2 = void 0 === V ? ae.monthLegend : V, I2 = e2.monthLegendOffset, D2 = void 0 === I2 ? ae.monthLegendOffset : I2, P = e2.monthLegendPosition, B = void 0 === P ? ae.monthLegendPosition : P, E2 = e2.weekdayLegendOffset, F = void 0 === E2 ? ae.weekdayLegendOffset : E2, T2 = e2.weekdayTicks, Y = e2.weekdays, j = void 0 === Y ? ae.weekdays : Y, q = e2.dayBorderColor, A = void 0 === q ? ae.dayBorderColor : q, X = e2.dayBorderWidth, N = void 0 === X ? ae.dayBorderWidth : X, Z = e2.daySpacing, G = void 0 === Z ? ae.daySpacing : Z, K2 = e2.dayRadius, Q2 = void 0 === K2 ? ae.dayRadius : K2, U2 = e2.isInteractive, $2 = void 0 === U2 ? ae.isInteractive : U2, ee2 = e2.tooltip, te2 = void 0 === ee2 ? ae.tooltip : ee2, oe2 = e2.onClick, ne2 = e2.onMouseEnter, ie2 = e2.onMouseLeave, re2 = e2.onMouseMove, de2 = e2.legends, le2 = void 0 === de2 ? ae.legends : de2, ce2 = e2.role, he2 = void 0 === ce2 ? ae.role : ce2, ue2 = e2.firstWeekday, se2 = void 0 === ue2 ? ae.firstWeekday : ue2, fe2 = e2.forwardedRef, ge2 = cn(o2, i2, t2), me2 = ge2.margin, pe2 = ge2.innerWidth, be2 = ge2.innerHeight, xe2 = ge2.outerWidth, we2 = ge2.outerHeight, Se2 = (0, import_react.useMemo)((function() {
    return y.map((function(e3) {
      return J({}, e3, { date: /* @__PURE__ */ new Date(e3.day + "T00:00:00") });
    })).sort((function(e3, t3) {
      return e3.day.localeCompare(t3.day);
    }));
  }), [y]), We2 = M(), ke2 = ve({ data: Se2, minValue: L2, maxValue: C, colors: l2, colorScale: c }), Me2 = Oe({ from: v, to: m, data: Se2 }), ze2 = Le({ square: a3, offset: F, totalDays: Me2, width: pe2, height: be2, daySpacing: G, direction: w }), Ce2 = ze2.cellHeight, De2 = ze2.cellWidth, Pe2 = Re({ offset: F, colorScale: ke2, emptyColor: g, cellHeight: Ce2, cellWidth: De2, from: v, to: m, data: Se2, direction: w, daySpacing: G, firstWeekday: se2 }), Be2 = Object.values(Ve({ daySpacing: G, direction: w, cellHeight: Ce2, cellWidth: De2, days: Pe2 }).months), Ee2 = He({ direction: w, cellHeight: Ce2, cellWidth: De2, daySpacing: G, ticks: T2, firstWeekday: se2, arrayOfWeekdays: j }), Fe2 = ye({ months: Be2, direction: w, monthLegendPosition: B, monthLegendOffset: D2 }), Te2 = hn(R), Ye2 = hn(H);
  return (0, import_jsx_runtime.jsxs)(Rt, { width: xe2, height: we2, margin: me2, role: he2, ref: fe2, children: [Ee2.map((function(e3) {
    return (0, import_jsx_runtime.jsx)(b, { transform: "translate(" + e3.x + "," + e3.y + ") rotate(" + e3.rotation + ")", textAnchor: "left", style: We2.labels.text, children: e3.value }, e3.value + "-" + e3.x + "-" + e3.y);
  })), Pe2.map((function(e3) {
    return (0, import_jsx_runtime.jsx)(Ie, { data: e3, x: e3.coordinates.x, rx: Q2, y: e3.coordinates.y, ry: Q2, width: De2, height: Ce2, color: e3.color, borderWidth: N, borderColor: A, onMouseEnter: ne2, onMouseLeave: ie2, onMouseMove: re2, isInteractive: $2, tooltip: te2, onClick: oe2, formatValue: Te2 }, e3.date.toString());
  })), (0, import_jsx_runtime.jsx)(_, { months: Fe2, legend: O2, theme: We2 }), le2.map((function(e3, t3) {
    var n2 = ke2.ticks(e3.itemCount).map((function(e4) {
      return { id: e4, label: Ye2(e4), color: ke2(e4) };
    }));
    return (0, import_jsx_runtime.jsx)(E, J({}, e3, { containerWidth: o2, containerHeight: i2, data: n2 }), t3);
  }))] });
};
var Be = (0, import_react.forwardRef)((function(e2, t2) {
  var o2 = e2.isInteractive, n2 = void 0 === o2 ? ae.isInteractive : o2, i2 = e2.renderWrapper, r2 = e2.theme, a3 = K(e2, De);
  return (0, import_jsx_runtime.jsx)(Fr, { isInteractive: n2, renderWrapper: i2, theme: r2, children: (0, import_jsx_runtime.jsx)(Pe, J({ isInteractive: n2 }, a3, { forwardedRef: t2 })) });
}));
var Ee = ["defaultWidth", "defaultHeight", "onResize", "debounceResize"];
var Fe = (0, import_react.forwardRef)((function(e2, t2) {
  var o2 = e2.defaultWidth, n2 = e2.defaultHeight, i2 = e2.onResize, r2 = e2.debounceResize, a3 = K(e2, Ee);
  return (0, import_jsx_runtime.jsx)($r, { defaultWidth: o2, defaultHeight: n2, onResize: i2, debounceResize: r2, children: function(e3) {
    var o3 = e3.width, n3 = e3.height;
    return (0, import_jsx_runtime.jsx)(Be, J({ width: o3, height: n3 }, a3, { ref: t2 }));
  } });
}));
var Te = ["defaultWidth", "defaultHeight", "onResize", "debounceResize"];
var Ye = (0, import_react.forwardRef)((function(e2, t2) {
  var o2 = e2.defaultWidth, n2 = e2.defaultHeight, i2 = e2.onResize, r2 = e2.debounceResize, a3 = K(e2, Te);
  return (0, import_jsx_runtime.jsx)($r, { defaultWidth: o2, defaultHeight: n2, onResize: i2, debounceResize: r2, children: function(e3) {
    var o3 = e3.width, n3 = e3.height;
    return (0, import_jsx_runtime.jsx)(Se, J({ width: o3, height: n3 }, a3, { ref: t2 }));
  } });
}));
var je = ["months", "years"];
var qe = ["isInteractive", "renderWrapper", "theme"];
var Ae = function(e2, t2, o2, n2, i2, r2) {
  var a3 = kn(t2, e2), d3 = a3[0], l2 = a3[1];
  return o2.find((function(e3) {
    return "value" in e3 && wn(e3.x + r2.left - i2 / 2, e3.y + r2.top - i2 / 2, n2 + i2, n2 + i2, d3, l2);
  }));
};
var Xe = (0, import_react.memo)((function(t2) {
  var n2 = t2.margin, i2 = t2.width, r2 = t2.height, c = t2.pixelRatio, h = void 0 === c ? re.pixelRatio : c, f = t2.align, g = void 0 === f ? re.align : f, y = t2.colors, p = void 0 === y ? re.colors : y, x = t2.colorScale, S = t2.data, M3 = t2.direction, z3 = void 0 === M3 ? re.direction : M3, R = t2.emptyColor, H = void 0 === R ? re.emptyColor : R, V = t2.from, O2 = t2.to, I2 = t2.minValue, D2 = void 0 === I2 ? re.minValue : I2, P = t2.maxValue, B = void 0 === P ? re.maxValue : P, E2 = t2.valueFormat, F = t2.legendFormat, T2 = t2.yearLegend, Y = void 0 === T2 ? re.yearLegend : T2, j = t2.yearLegendOffset, q = void 0 === j ? re.yearLegendOffset : j, A = t2.yearLegendPosition, X = void 0 === A ? re.yearLegendPosition : A, N = t2.yearSpacing, Z = void 0 === N ? re.yearSpacing : N, G = t2.monthLegend, Q2 = void 0 === G ? re.monthLegend : G, U2 = t2.monthLegendOffset, $2 = void 0 === U2 ? re.monthLegendOffset : U2, _2 = t2.monthLegendPosition, ee2 = void 0 === _2 ? re.monthLegendPosition : _2, te2 = t2.monthSpacing, oe2 = void 0 === te2 ? re.monthSpacing : te2, ne2 = t2.dayBorderColor, ie2 = void 0 === ne2 ? re.dayBorderColor : ne2, ae2 = t2.dayBorderWidth, de2 = void 0 === ae2 ? re.dayBorderWidth : ae2, le2 = t2.daySpacing, ce2 = void 0 === le2 ? re.daySpacing : le2, he2 = t2.isInteractive, ue2 = void 0 === he2 ? re.isInteractive : he2, se2 = t2.tooltip, fe2 = void 0 === se2 ? re.tooltip : se2, be2 = t2.onClick, xe2 = t2.onMouseEnter, we2 = t2.onMouseLeave, Se2 = t2.onMouseMove, We2 = t2.legends, Le2 = void 0 === We2 ? re.legends : We2, ke2 = t2.forwardedRef, Me2 = (0, import_react.useRef)(null), ze2 = cn(i2, r2, n2), Ce2 = ze2.innerWidth, Re2 = ze2.innerHeight, He2 = ze2.outerWidth, Ve2 = ze2.outerHeight, Oe2 = ze2.margin, Ie2 = ge({ width: Ce2, height: Re2, from: V, to: O2, direction: z3, yearSpacing: Z, monthSpacing: oe2, daySpacing: ce2, align: g }), De2 = Ie2.months, Pe2 = Ie2.years, Be2 = K(Ie2, je), Ee2 = ve({ data: S, minValue: D2, maxValue: B, colors: p, colorScale: x }), Fe2 = ye({ months: De2, direction: z3, monthLegendPosition: ee2, monthLegendOffset: $2 }), Te2 = me({ years: Pe2, direction: z3, yearLegendPosition: X, yearLegendOffset: q }), Ye2 = pe({ days: Be2.days, data: S, colorScale: Ee2, emptyColor: H }), qe2 = (0, import_react.useState)(null), Xe2 = qe2[0], Ne2 = qe2[1], Ze2 = M(), Ge2 = hn(E2), Je = hn(F), Ke = z(), Qe = Ke.showTooltipFromEvent, Ue = Ke.hideTooltip;
  (0, import_react.useEffect)((function() {
    if (Me2.current) {
      Me2.current.width = He2 * h, Me2.current.height = Ve2 * h;
      var e2 = Me2.current.getContext("2d");
      e2 && (e2.scale(h, h), e2.fillStyle = Ze2.background, e2.fillRect(0, 0, He2, Ve2), e2.translate(Oe2.left, Oe2.top), Ye2.forEach((function(t3) {
        e2.fillStyle = t3.color, de2 > 0 && (e2.strokeStyle = ie2, e2.lineWidth = de2), e2.beginPath(), e2.rect(t3.x, t3.y, t3.size, t3.size), e2.fill(), de2 > 0 && e2.stroke();
      })), e2.textAlign = "center", e2.textBaseline = "middle", a(e2, Ze2.labels.text), Fe2.forEach((function(t3) {
        e2.save(), e2.translate(t3.x, t3.y), e2.rotate(ut(t3.rotation)), d(e2, Ze2.labels.text, String(Q2(t3.year, t3.month, t3.date))), e2.restore();
      })), Te2.forEach((function(t3) {
        e2.save(), e2.translate(t3.x, t3.y), e2.rotate(ut(t3.rotation)), d(e2, Ze2.labels.text, String(Y(t3.year))), e2.restore();
      })), Le2.forEach((function(t3) {
        var o2 = Ee2.ticks(t3.itemCount).map((function(e3) {
          return { id: e3, label: Je(e3), color: Ee2(e3) };
        }));
        L(e2, J({}, t3, { data: o2, containerWidth: Ce2, containerHeight: Re2, theme: Ze2 }));
      })));
    }
  }), [Me2, Re2, Ce2, He2, Ve2, h, Oe2, Ye2, ie2, de2, x, Y, Te2, Q2, Fe2, Le2, Ze2, Je, Ee2]);
  var $e = (0, import_react.useCallback)((function(t3) {
    if (Me2.current) {
      var o2 = Ae(t3, Me2.current, Ye2, Ye2[0].size, de2, Oe2);
      if (o2) {
        if (Ne2(o2), !("value" in o2)) return;
        var n3 = J({}, o2, { value: Ge2(o2.value), data: J({}, o2.data) });
        Qe(e.createElement(fe2, J({}, n3)), t3), Xe2 || null == xe2 || xe2(o2, t3), null == Se2 || Se2(o2, t3), Xe2 && (null == we2 || we2(o2, t3));
      } else Ue(), o2 && (null == we2 || we2(o2, t3));
    }
  }), [Me2, Xe2, Oe2, Ye2, Ne2, Ge2, de2, Qe, Ue, xe2, Se2, we2, fe2]), _e = (0, import_react.useCallback)((function() {
    Ne2(null), Ue();
  }), [Ne2, Ue]), et = (0, import_react.useCallback)((function(e2) {
    if (be2 && Me2.current) {
      var t3 = Ae(e2, Me2.current, Ye2, Ye2[0].size, ce2, Oe2);
      t3 && be2(t3, e2);
    }
  }), [Me2, ce2, Oe2, Ye2, be2]);
  return (0, import_jsx_runtime.jsx)("canvas", { ref: Rn(Me2, ke2), width: He2 * h, height: Ve2 * h, style: { width: He2, height: Ve2 }, onMouseEnter: ue2 ? $e : void 0, onMouseMove: ue2 ? $e : void 0, onMouseLeave: ue2 ? _e : void 0, onClick: ue2 ? et : void 0 });
}));
var Ne = (0, import_react.forwardRef)((function(e2, t2) {
  var o2 = e2.isInteractive, n2 = void 0 === o2 ? re.isInteractive : o2, i2 = e2.renderWrapper, r2 = e2.theme, a3 = K(e2, qe);
  return (0, import_jsx_runtime.jsx)(Fr, { isInteractive: n2, renderWrapper: i2, theme: r2, children: (0, import_jsx_runtime.jsx)(Xe, J({ isInteractive: n2 }, a3, { forwardedRef: t2 })) });
}));
var Ze = ["defaultWidth", "defaultHeight", "onResize", "debounceResize"];
var Ge = (0, import_react.forwardRef)((function(e2, t2) {
  var o2 = e2.defaultWidth, n2 = e2.defaultHeight, i2 = e2.onResize, r2 = e2.debounceResize, a3 = K(e2, Ze);
  return (0, import_jsx_runtime.jsx)($r, { defaultWidth: o2, defaultHeight: n2, onResize: i2, debounceResize: r2, children: function(e3) {
    var o3 = e3.width, n3 = e3.height;
    return (0, import_jsx_runtime.jsx)(Ne, J({ width: o3, height: n3 }, a3, { ref: t2 }));
  } });
}));
export {
  ke as ARRAY_OF_WEEKDAYS,
  Se as Calendar,
  Ne as CalendarCanvas,
  Ye as ResponsiveCalendar,
  Ge as ResponsiveCalendarCanvas,
  Fe as ResponsiveTimeRange,
  Be as TimeRange,
  ue as bindDaysData,
  re as calendarCanvasDefaultProps,
  ie as calendarDefaultProps,
  Re as computeCellPositions,
  Le as computeCellSize,
  de as computeDomain,
  he as computeLayout,
  fe as computeMonthLegendPositions,
  Ve as computeMonthLegends,
  Oe as computeTotalDays,
  He as computeWeekdays,
  se as computeYearLegendPositions,
  ze as getDayIndex,
  Me as getFirstWeekdayIndex,
  ae as timeRangeDefaultProps,
  ge as useCalendarLayout,
  ve as useColorScale,
  pe as useDays,
  ye as useMonthLegends,
  me as useYearLegends
};
//# sourceMappingURL=@nivo_calendar.js.map
