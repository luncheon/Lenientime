(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.lenientime = factory());
}(this, (function () { 'use strict';

  function padStart(source, minLength, pad) {
      source = String(source);
      if (!minLength || !isFinite(minLength) || source.length >= minLength) {
          return source;
      }
      return _pad(minLength - source.length, pad) + source;
  }
  function padEnd(source, minLength, pad) {
      source = String(source);
      if (!minLength || !isFinite(minLength) || source.length >= minLength) {
          return source;
      }
      return source + _pad(minLength - source.length, pad);
  }
  function _pad(padLength, pad) {
      pad = pad === undefined || pad === null || pad === '' ? ' ' : String(pad);
      var paddings = pad;
      while (paddings.length < padLength) {
          paddings += pad;
      }
      return paddings.substr(0, padLength);
  }
  function firstFiniteNumberOf() {
      for (var i = 0, len = arguments.length; i < len; ++i) {
          var value = arguments[i];
          if (typeof value === 'number') {
              return value;
          }
          if (typeof value === 'string') {
              var parsed = parseFloat(value);
              if (isFinite(parsed)) {
                  return parsed;
              }
          }
      }
      return undefined;
  }
  var SECOND_IN_MILLISECONDS = 1000;
  var MINUTE_IN_MILLISECONDS = SECOND_IN_MILLISECONDS * 60;
  var HOUR_IN_MILLISECONDS = MINUTE_IN_MILLISECONDS * 60;
  var HALF_DAY_IN_MILLISECONDS = HOUR_IN_MILLISECONDS * 12;
  var DAY_IN_MILLISECONDS = HOUR_IN_MILLISECONDS * 24;
  function now() {
      return (Date.now() - new Date().getTimezoneOffset() * MINUTE_IN_MILLISECONDS) % DAY_IN_MILLISECONDS;
  }
  function normalizeMillisecondsInOneDay(milliseconds) {
      var value = Math.floor(milliseconds) % DAY_IN_MILLISECONDS;
      return value >= 0 ? value : value + DAY_IN_MILLISECONDS;
  }
  function am(milliseconds) {
      return milliseconds >= HALF_DAY_IN_MILLISECONDS ? milliseconds - HALF_DAY_IN_MILLISECONDS : milliseconds;
  }
  function pm(milliseconds) {
      return milliseconds < HALF_DAY_IN_MILLISECONDS ? milliseconds + HALF_DAY_IN_MILLISECONDS : milliseconds;
  }
  function ampm(milliseconds, a) {
      milliseconds = normalizeMillisecondsInOneDay(milliseconds);
      switch (a && String(a)[0].toLowerCase()) {
          case 'a': return am(milliseconds);
          case 'p': return pm(milliseconds);
          default: return milliseconds;
      }
  }
  function limit(value, min, max, cyclic) {
      if (cyclic) {
          ++max;
          value = (value - min) % (max - min);
          return value < 0 ? value + max : value + min;
      }
      else {
          return value < min ? min : value > max ? max : value;
      }
  }

  function parseIntoMilliseconds(time) {
      switch (typeof time) {
          case 'number':
              return normalizeMillisecondsInOneDay(time);
          case 'string':
              return parseString(time);
          case 'object':
              if (time) {
                  return parseLenientimeLike(time instanceof Array ? { h: time[0], m: time[1], s: time[2], S: time[3] } : time);
              }
      }
      return NaN;
  }
  function parseLenientimeLike(time) {
      if (typeof time.totalMilliseconds === 'number') {
          return normalizeMillisecondsInOneDay(time.totalMilliseconds);
      }
      var totalMilliseconds = firstFiniteNumberOf(time.h, time.hour, time.hours, 0) * HOUR_IN_MILLISECONDS
          + firstFiniteNumberOf(time.m, time.minute, time.minutes, 0) * MINUTE_IN_MILLISECONDS
          + firstFiniteNumberOf(time.s, time.second, time.seconds, 0) * SECOND_IN_MILLISECONDS
          + firstFiniteNumberOf(time.S, time.millisecond, time.milliseconds, 0);
      if ((time.am === true || time.pm === false)) {
          return am(totalMilliseconds);
      }
      if ((time.pm === true || time.am === false)) {
          return pm(totalMilliseconds);
      }
      return ampm(totalMilliseconds, time.a);
  }
  function parseString(s) {
      s = s && String(s)
          // fullwidth -> halfwidth
          .replace(/[\uff00-\uffef]/g, function (token) { return String.fromCharCode(token.charCodeAt(0) - 0xfee0); })
          .replace(/\s/g, '')
          .replace(/(a|p)\.?m?\.?$/i, function ($0, $1) { return $1.toLowerCase(); });
      if (!s) {
          return 0;
      }
      if (s.toLowerCase() === 'now') {
          return now();
      }
      var match = 
      // simple integer: complete colons
      //  1           -> 01:00:00.000
      //  12          -> 12:00:00.000
      //  123         -> 01:23:00.000
      //  1234        -> 12:34:00.000
      //  12345       -> 01:23:45.000
      //  123456      -> 12:34:56.000
      //  1234567     -> 12:34:56.700
      //  12345678    -> 12:34:56.780
      //  123456789   -> 12:34:56.789
      //  1pm         -> 13:00:00.000
      //  123456am    -> 00:34:56.000
      s.match(/^([+-]?[0-9]{1,2})(?:([0-9]{2})(?:([0-9]{2})([0-9]*))?)?(a|p)?$/i) ||
          // simple decimal: assume as hour
          s.match(/^([+-]?[0-9]*\.[0-9]*)()()()(a|p)?$/i) ||
          // colons included: split parts
          //  1:          -> 01:00:00.000
          //  12:         -> 12:00:00.000
          //  123:        -> 03:00:00.000
          //  1.5:        -> 01:30:00.000
          //  -1:         -> 23:00:00.000
          //  12:34:56pm  -> 12:34:56.000
          //  11:23:45pm  -> 23:23:45.000
          //  12:34:56    -> 12:34:56.000
          //  12:34:      -> 12:34:00.000
          //  12:34       -> 12:34:00.000
          //  1234:       -> 12:34:00.000
          //  12::        -> 12:00:00.000
          //  12:         -> 12:00:00.000
          s.match(/^([+-]?[0-9]*\.?[0-9]*):([+-]?[0-9]*\.?[0-9]*)(?::([+-]?[0-9]*\.?[0-9]*))?()(a|p)?$/i);
      return match
          ? ampm((match[1] ? parseFloat(match[1]) * HOUR_IN_MILLISECONDS : 0)
              + (match[2] ? parseFloat(match[2]) * MINUTE_IN_MILLISECONDS : 0)
              + (match[3] ? parseFloat(match[3]) * SECOND_IN_MILLISECONDS : 0)
              + (match[4] ? parseFloat('0.' + match[4]) * 1000 : 0), match[5])
          : NaN;
  }

  function tokenPattern() {
      return /\\.|HH?|hh?|kk?|mm?|ss?|S{1,3}|AA?|aa?|_H|_h|_k|_m|_s/g;
  }
  var adjusters = {
      H: tokenAdjuster(0, 23),
      HH: tokenAdjuster(0, 23, 2, '0'),
      _H: tokenAdjuster(0, 23, 2),
      h: tokenAdjuster(1, 12),
      hh: tokenAdjuster(1, 12, 2, '0'),
      _h: tokenAdjuster(1, 12, 2),
      k: tokenAdjuster(0, 11),
      kk: tokenAdjuster(0, 11, 2, '0'),
      _k: tokenAdjuster(0, 23, 2),
      m: tokenAdjuster(0, 59),
      mm: tokenAdjuster(0, 59, 2, '0'),
      _m: tokenAdjuster(0, 59, 2),
      s: tokenAdjuster(0, 59),
      ss: tokenAdjuster(0, 59, 2, '0'),
      _s: tokenAdjuster(0, 59, 2),
      S: tokenAdjuster(0, 9),
      SS: tokenAdjuster(0, 99, 2, '0'),
      SSS: tokenAdjuster(0, 999, 3, '0'),
      a: function (value) { return function (amount) { return value === 'pm' ? 'am' : 'pm'; }; },
      A: function (value) { return function (amount) { return value === 'PM' ? 'AM' : 'PM'; }; },
      aa: function (value) { return function (amount) { return value === 'p.m.' ? 'a.m.' : 'p.m.'; }; },
      AA: function (value) { return function (amount) { return value === 'P.M.' ? 'A.M.' : 'P.M.'; }; },
  };
  function tokenAdjuster(min, max, length, pad) {
      if (length === void 0) { length = 1; }
      return function (value) { return function (amount, cyclic) {
          var adjusted = limit(parseInt(value, 10) + amount, min, max, cyclic);
          return isNaN(adjusted) ? undefined : padStart(adjusted, length, pad);
      }; };
  }
  function format(template, time) {
      return String(template).replace(tokenPattern(), function (token) { return token[0] === '\\' ? token[1] : time[token]; });
  }
  function tokenAt(template, value, position) {
      var tokens = tokenizeTemplate(template);
      var offset = 0;
      var previuosLastIndex = 0;
      for (var i = 0; i < tokens.length; ++i) {
          var token = tokens[i];
          if (token.literal) {
              var index = value.indexOf(token.property, offset);
              if (index === -1 || index >= position) {
                  if (i === 0) {
                      return;
                  }
                  var _value = value.slice(previuosLastIndex, index);
                  var property = tokens[i - 1].property;
                  return { property: property, index: previuosLastIndex, value: _value, adjust: adjusters[property](_value) };
              }
              else {
                  previuosLastIndex = offset = index + token.property.length;
              }
          }
          else if (token.property[0] === '_' && value[offset] === ' ') {
              ++offset;
          }
      }
      var lastToken = tokens[tokens.length - 1];
      if (lastToken && !lastToken.literal) {
          var _value = value.slice(offset);
          var property = lastToken.property;
          return { property: property, index: offset, value: _value, adjust: adjusters[property](_value) };
      }
      return;
  }
  function tokenizeTemplate(template) {
      var pattern = tokenPattern();
      var tokens = [];
      var previousLastIndex = 0;
      var match;
      while (match = pattern.exec(template)) { // tslint:disable-line:no-conditional-assignment
          var index = match.index;
          var lastIndex = pattern.lastIndex;
          if (previousLastIndex !== index) {
              tokens.push({ index: previousLastIndex, property: template.slice(previousLastIndex, index), literal: true });
          }
          if (match[0][0] === '\\') {
              tokens.push({ index: index, property: match[0].slice(1), literal: true });
          }
          else {
              tokens.push({ index: index, property: match[0], literal: false });
          }
          previousLastIndex = lastIndex;
      }
      if (previousLastIndex < template.length) {
          tokens.push({ index: previousLastIndex, property: template.slice(previousLastIndex), literal: true });
      }
      return tokens;
  }

  var Lenientime = /** @class */ (function () {
      function Lenientime(_totalMilliseconds) {
          this._totalMilliseconds = _totalMilliseconds;
      }
      Object.defineProperty(Lenientime.prototype, "hour", {
          /** Numeric hour in 24-hour clock: [0..23] */
          get: function () { return Math.floor(this._totalMilliseconds / HOUR_IN_MILLISECONDS); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "hour12", {
          /** Numeric hour in 1-based 12-hour clock: [1..12] */
          get: function () { return (this.hour + 11) % 12 + 1; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "minute", {
          /** Numeric minute: [0..59] */
          get: function () { return Math.floor(this._totalMilliseconds % HOUR_IN_MILLISECONDS / MINUTE_IN_MILLISECONDS); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "second", {
          /** Numeric second: [0..59] */
          get: function () { return Math.floor(this._totalMilliseconds % MINUTE_IN_MILLISECONDS / SECOND_IN_MILLISECONDS); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "millisecond", {
          /** Numeric millisecond: [0..999] */
          get: function () { return this._totalMilliseconds % SECOND_IN_MILLISECONDS; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "am", {
          get: function () { return this.hour < 12; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "pm", {
          get: function () { return this.hour >= 12; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "hours", {
          /** Alias for [[hour]] */
          get: function () { return this.hour; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "hours12", {
          /** Alias for [[hour12]] */
          get: function () { return this.hour12; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "minutes", {
          /** Alias for [[minute]] */
          get: function () { return this.minute; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "seconds", {
          /** Alias for [[second]] */
          get: function () { return this.second; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "milliseconds", {
          /** Alias for [[millisecond]] */
          get: function () { return this.millisecond; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "H", {
          /** Hour string in 24-hour notation without padding: ["0".."23"] | "-" */
          get: function () { return this.invalid ? '-' : String(this.hour); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "h", {
          /** Hour string in 1-based 12-hour notation without padding: ["1".."12"] | "-" */
          get: function () { return this.invalid ? '-' : String(this.hour12); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "k", {
          /** Hour string in 1-based 24-hour notation without padding: ["1".."24"] | "-" */
          get: function () { return this.invalid ? '-' : String((this.hour + 23) % 24 + 1); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "m", {
          /** Minute string without padding: ["0".."59"] | "-" */
          get: function () { return this.invalid ? '-' : String(this.minute); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "s", {
          /** Second string without padding: ["0".."59"] | "-" */
          get: function () { return this.invalid ? '-' : String(this.second); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "S", {
          /** 1 fractional digit string of second: ["0".."9"] | "-" */
          get: function () { return this.invalid ? '-' : String(Math.floor(this.millisecond / 100)); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "SS", {
          /** 2 fractional digits string of second: ["00".."99"] | "--" */
          get: function () { return this.invalid ? '--' : padEnd(Math.floor(this.millisecond / 10), 2, '0'); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "SSS", {
          /** 3 fractional digits string of second: ["000".."999"] | "---" */
          get: function () { return this.invalid ? '---' : padEnd(this.millisecond, 3, '0'); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "a", {
          /** "am" | "pm" | "--" */
          get: function () { return this.invalid ? '--' : this.am ? 'am' : 'pm'; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "A", {
          /** "AM" | "PM" | "--" */
          get: function () { return this.invalid ? '--' : this.am ? 'AM' : 'PM'; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "aa", {
          /** "a.m." | "p.m." | "----" */
          get: function () { return this.invalid ? '----' : this.am ? 'a.m.' : 'p.m.'; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "AA", {
          /** "A.M." | "P.M." | "----" */
          get: function () { return this.invalid ? '----' : this.am ? 'A.M.' : 'P.M.'; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "HH", {
          /** Hour string in 24-hour notation with zero padding: ["00".."23"] | "--" */
          get: function () { return this.invalid ? '--' : padStart(this.H, 2, '0'); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "_H", {
          /** Hour string in 24-hour notation with space padding: [" 0".."23"] | "--" */
          get: function () { return this.invalid ? '--' : padStart(this.H, 2, ' '); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "hh", {
          /** Hour string in 1-based 12-hour notation with zero padding: ["01".."12"] | "--" */
          get: function () { return this.invalid ? '--' : padStart(this.h, 2, '0'); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "_h", {
          /** hour string in 1-based 12-hour notation with space padding: [" 1".."12"] | "--" */
          get: function () { return this.invalid ? '--' : padStart(this.h, 2, ' '); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "kk", {
          /** Hour string in 1-based 24-hour notation with zero padding: ["01".."24"] | "--" */
          get: function () { return this.invalid ? '--' : padStart(this.k, 2, '0'); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "_k", {
          /** Hour string in 1-based 24-hour notation with space padding: [" 1".."24"] | "--" */
          get: function () { return this.invalid ? '--' : padStart(this.k, 2, ' '); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "mm", {
          /** Minute string with zero padding: ["00".."59"] | "--" */
          get: function () { return this.invalid ? '--' : padStart(this.m, 2, '0'); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "_m", {
          /** Minute string with space padding: [" 0".."59"] | "--" */
          get: function () { return this.invalid ? '--' : padStart(this.m, 2, ' '); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "ss", {
          /** Second string with zero padding: ["00".."59"] | "--" */
          get: function () { return this.invalid ? '--' : padStart(this.s, 2, '0'); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "_s", {
          /** Second string with space padding: [" 0".."59"] | "--" */
          get: function () { return this.invalid ? '--' : padStart(this.s, 2, ' '); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "HHmm", {
          get: function () { return this.HH + ':' + this.mm; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "HHmmss", {
          get: function () { return this.HHmm + ':' + this.ss; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "HHmmssSSS", {
          get: function () { return this.HHmmss + '.' + this.SSS; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "totalMilliseconds", {
          get: function () { return this._totalMilliseconds; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "totalSeconds", {
          get: function () { return Math.floor(this._totalMilliseconds / SECOND_IN_MILLISECONDS); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "totalMinutes", {
          get: function () { return Math.floor(this._totalMilliseconds / MINUTE_IN_MILLISECONDS); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "valid", {
          get: function () { return 0 <= this._totalMilliseconds && this._totalMilliseconds < DAY_IN_MILLISECONDS; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "invalid", {
          get: function () { return !this.valid; },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "startOfHour", {
          get: function () { return new Lenientime(this._totalMilliseconds - this._totalMilliseconds % HOUR_IN_MILLISECONDS); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "startOfMinute", {
          get: function () { return new Lenientime(this._totalMilliseconds - this._totalMilliseconds % MINUTE_IN_MILLISECONDS); },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Lenientime.prototype, "startOfSecond", {
          get: function () { return new Lenientime(this._totalMilliseconds - this._totalMilliseconds % SECOND_IN_MILLISECONDS); },
          enumerable: true,
          configurable: true
      });
      Lenientime.prototype.ifInvalid = function (source) {
          return this.valid ? this : new Lenientime(parseIntoMilliseconds(source));
      };
      Lenientime.prototype.startOf = function (unit) {
          switch (unit) {
              case 'hour': return this.startOfHour;
              case 'minute': return this.startOfMinute;
              case 'second': return this.startOfSecond;
              default: return this;
          }
      };
      Lenientime.prototype.toString = function () {
          return this.HHmmssSSS;
      };
      Lenientime.prototype.format = function (template) {
          return format(template, this);
      };
      Lenientime.prototype.with = function (time) {
          return new Lenientime(parseIntoMilliseconds({
              h: firstFiniteNumberOf(time.h, time.hour, time.hours, this.hour),
              m: firstFiniteNumberOf(time.m, time.minute, time.minutes, this.minute),
              s: firstFiniteNumberOf(time.s, time.second, time.seconds, this.second),
              S: firstFiniteNumberOf(time.S, time.millisecond, time.milliseconds, this.millisecond),
              am: time.am === true || time.pm === false || (time.a === 'am' ? true : time.a === 'pm' ? false : undefined),
          }));
      };
      Lenientime.prototype.plus = function (time) {
          var totalMilliseconds = parseIntoMilliseconds(time);
          return totalMilliseconds === 0 ? this : new Lenientime(this._totalMilliseconds + totalMilliseconds);
      };
      Lenientime.prototype.minus = function (time) {
          var totalMilliseconds = parseIntoMilliseconds(time);
          return totalMilliseconds === 0 ? this : new Lenientime(this._totalMilliseconds - totalMilliseconds);
      };
      Lenientime.prototype.equals = function (another) {
          return this.compareTo(another) === 0;
      };
      Lenientime.prototype.compareTo = function (another) {
          return this._totalMilliseconds - parseIntoMilliseconds(another);
      };
      Lenientime.prototype.isBefore = function (another) {
          return this.compareTo(another) < 0;
      };
      Lenientime.prototype.isBeforeOrEqual = function (another) {
          return this.compareTo(another) <= 0;
      };
      Lenientime.prototype.isAfter = function (another) {
          return this.compareTo(another) > 0;
      };
      Lenientime.prototype.isAfterOrEqual = function (another) {
          return this.compareTo(another) >= 0;
      };
      Lenientime.prototype.isBetweenExclusive = function (start, end) {
          return this.isAfter(start) && this.isBefore(end);
      };
      Lenientime.prototype.isBetweenInclusive = function (min, max) {
          return this.isAfterOrEqual(min) && this.isBeforeOrEqual(max);
      };
      return Lenientime;
  }());

  var ZERO = new Lenientime(0);
  var INVALID = new Lenientime(NaN);
  var lenientime = (function (source) {
      if (source === undefined || source === null) {
          return INVALID;
      }
      else if (source instanceof Lenientime) {
          return source;
      }
      else {
          var milliseconds = parseIntoMilliseconds(source);
          return milliseconds === 0 ? ZERO : isNaN(milliseconds) ? INVALID : new Lenientime(milliseconds);
      }
  });
  lenientime.prototype = Lenientime.prototype;
  lenientime.INVALID = INVALID;
  lenientime.ZERO = ZERO;
  lenientime.now = function () { return new Lenientime(now()); };
  lenientime.min = function () { return reduce(arguments, function (min, current) { return min.invalid || current.isBefore(min) ? current : min; }); };
  lenientime.max = function () { return reduce(arguments, function (max, current) { return max.invalid || current.isAfter(max) ? current : max; }); };
  function reduce(source, callback, initialValue) {
      if (initialValue === void 0) { initialValue = INVALID; }
      var result = initialValue;
      for (var i = 0, len = source.length; i < len; ++i) {
          var current = lenientime(source[i]);
          if (current.valid) {
              result = callback(result, current, i, source);
          }
      }
      return result;
  }

  function dispatchInputEvent(inputElement) {
      var inputEvent = document.createEvent('CustomEvent');
      inputEvent.initCustomEvent('input', true, false, 'complete');
      inputElement.dispatchEvent(inputEvent);
  }

  // <input data-lenientime>
  // <input data-lenientime="HH:mm:ss.SSS" data-lenientime-adjust-on-arrow-keys="-1">
  function adjustOnArrowKeys(options) {
      var dataAttributeName = options && options.dataAttributeName || 'lenientime';
      var formatSelector = options && options.formatSelector || (function (input) { return input.dataset.lenientime; });
      var amountSelector = options && options.amountSelector || (function (input) { return parseInt(input.dataset.lenientimeAdjustOnArrowKeysAttributeName, 10); });
      addEventListener('keydown', function (event) {
          var which = event.which;
          if ((which !== 38 && which !== 40) || event.altKey || event.ctrlKey || event.metaKey) {
              return;
          }
          var input = event.target;
          var dataset = input.dataset;
          if (!(dataAttributeName in dataset)) {
              return;
          }
          event.preventDefault();
          var template = formatSelector(input) || 'HH:mm';
          var value = input.value;
          if (value) {
              // const caretPosition = input.selectionDirection === 'backward' ? input.selectionStart : input.selectionEnd
              var caretPosition = input.selectionStart;
              var token = caretPosition === null ? undefined : tokenAt(template, value, caretPosition);
              if (token) {
                  var amount = (which === 38 ? 1 : -1) * (options && options.amountSelector && options.amountSelector(input) || 1);
                  var adjustedValue = token.adjust(amount, true);
                  if (adjustedValue !== undefined) {
                      var tokenIndex = token.index;
                      input.value = value.slice(0, tokenIndex) + adjustedValue + value.slice(tokenIndex + token.value.length);
                      input.setSelectionRange(tokenIndex, tokenIndex + adjustedValue.length);
                      dispatchInputEvent(input);
                  }
              }
          }
          else {
              input.value = lenientime.ZERO.format(template);
              var token = tokenAt(template, input.value, 0);
              if (token) {
                  input.setSelectionRange(token.index, token.index + token.value.length);
              }
              dispatchInputEvent(input);
          }
      }, true);
  }

  // <input data-lenientime>
  // <input data-lenientime="HH:mm:ss.SSS">
  function complete(options) {
      var dataAttributeName = options && options.dataAttributeName || 'lenientime';
      var formatSelector = options && options.formatSelector || (function (input) { return input.dataset.lenientime; });
      addEventListener('change', function (event) {
          var input = event.target;
          var value = input.value;
          var dataset = input.dataset;
          if (value && dataAttributeName in dataset) {
              var time = lenientime(value);
              var completed = time.valid ? time.format(formatSelector(input) || 'HH:mm') : '';
              if (completed !== value) {
                  input.value = completed;
                  dispatchInputEvent(input);
              }
          }
      }, true);
  }

  adjustOnArrowKeys();
  complete();

  return lenientime;

})));
