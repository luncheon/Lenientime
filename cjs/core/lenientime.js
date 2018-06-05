"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parse_1 = require("./parse");
var token_1 = require("./token");
var utils_1 = require("./utils");
var Lenientime = /** @class */ (function () {
    function Lenientime(_totalMilliseconds) {
        this._totalMilliseconds = _totalMilliseconds;
    }
    Object.defineProperty(Lenientime.prototype, "hour", {
        /** Numeric hour in 24-hour clock: [0..23] */
        get: function () { return Math.floor(this._totalMilliseconds / utils_1.HOUR_IN_MILLISECONDS); },
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
        get: function () { return Math.floor(this._totalMilliseconds % utils_1.HOUR_IN_MILLISECONDS / utils_1.MINUTE_IN_MILLISECONDS); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "second", {
        /** Numeric second: [0..59] */
        get: function () { return Math.floor(this._totalMilliseconds % utils_1.MINUTE_IN_MILLISECONDS / utils_1.SECOND_IN_MILLISECONDS); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "millisecond", {
        /** Numeric millisecond: [0..999] */
        get: function () { return this._totalMilliseconds % utils_1.SECOND_IN_MILLISECONDS; },
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
        get: function () { return this.invalid ? '--' : utils_1.padEnd(Math.floor(this.millisecond / 10), 2, '0'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "SSS", {
        /** 3 fractional digits string of second: ["000".."999"] | "---" */
        get: function () { return this.invalid ? '---' : utils_1.padEnd(this.millisecond, 3, '0'); },
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
        get: function () { return this.invalid ? '--' : utils_1.padStart(this.H, 2, '0'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "_H", {
        /** Hour string in 24-hour notation with space padding: [" 0".."23"] | "--" */
        get: function () { return this.invalid ? '--' : utils_1.padStart(this.H, 2, ' '); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "hh", {
        /** Hour string in 1-based 12-hour notation with zero padding: ["01".."12"] | "--" */
        get: function () { return this.invalid ? '--' : utils_1.padStart(this.h, 2, '0'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "_h", {
        /** hour string in 1-based 12-hour notation with space padding: [" 1".."12"] | "--" */
        get: function () { return this.invalid ? '--' : utils_1.padStart(this.h, 2, ' '); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "kk", {
        /** Hour string in 1-based 24-hour notation with zero padding: ["01".."24"] | "--" */
        get: function () { return this.invalid ? '--' : utils_1.padStart(this.k, 2, '0'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "_k", {
        /** Hour string in 1-based 24-hour notation with space padding: [" 1".."24"] | "--" */
        get: function () { return this.invalid ? '--' : utils_1.padStart(this.k, 2, ' '); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "mm", {
        /** Minute string with zero padding: ["00".."59"] | "--" */
        get: function () { return this.invalid ? '--' : utils_1.padStart(this.m, 2, '0'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "_m", {
        /** Minute string with space padding: [" 0".."59"] | "--" */
        get: function () { return this.invalid ? '--' : utils_1.padStart(this.m, 2, ' '); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "ss", {
        /** Second string with zero padding: ["00".."59"] | "--" */
        get: function () { return this.invalid ? '--' : utils_1.padStart(this.s, 2, '0'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "_s", {
        /** Second string with space padding: [" 0".."59"] | "--" */
        get: function () { return this.invalid ? '--' : utils_1.padStart(this.s, 2, ' '); },
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
        get: function () { return Math.floor(this._totalMilliseconds / utils_1.SECOND_IN_MILLISECONDS); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "totalMinutes", {
        get: function () { return Math.floor(this._totalMilliseconds / utils_1.MINUTE_IN_MILLISECONDS); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "valid", {
        get: function () { return 0 <= this._totalMilliseconds && this._totalMilliseconds < utils_1.DAY_IN_MILLISECONDS; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "invalid", {
        get: function () { return !this.valid; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "startOfHour", {
        get: function () { return new Lenientime(this._totalMilliseconds - this._totalMilliseconds % utils_1.HOUR_IN_MILLISECONDS); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "startOfMinute", {
        get: function () { return new Lenientime(this._totalMilliseconds - this._totalMilliseconds % utils_1.MINUTE_IN_MILLISECONDS); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "startOfSecond", {
        get: function () { return new Lenientime(this._totalMilliseconds - this._totalMilliseconds % utils_1.SECOND_IN_MILLISECONDS); },
        enumerable: true,
        configurable: true
    });
    Lenientime.prototype.ifInvalid = function (source) {
        return this.valid ? this : new Lenientime(parse_1.default(source));
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
        return token_1.format(template, this);
    };
    Lenientime.prototype.with = function (time) {
        return new Lenientime(parse_1.default({
            h: utils_1.firstFiniteNumberOf(time.h, time.hour, time.hours, this.hour),
            m: utils_1.firstFiniteNumberOf(time.m, time.minute, time.minutes, this.minute),
            s: utils_1.firstFiniteNumberOf(time.s, time.second, time.seconds, this.second),
            S: utils_1.firstFiniteNumberOf(time.S, time.millisecond, time.milliseconds, this.millisecond),
            am: time.am === true || time.pm === false || (time.a === 'am' ? true : time.a === 'pm' ? false : undefined),
        }));
    };
    Lenientime.prototype.plus = function (time) {
        var totalMilliseconds = parse_1.default(time);
        return totalMilliseconds === 0 ? this : new Lenientime(this._totalMilliseconds + totalMilliseconds);
    };
    Lenientime.prototype.minus = function (time) {
        var totalMilliseconds = parse_1.default(time);
        return totalMilliseconds === 0 ? this : new Lenientime(this._totalMilliseconds - totalMilliseconds);
    };
    Lenientime.prototype.equals = function (another) {
        return this.compareTo(another) === 0;
    };
    Lenientime.prototype.compareTo = function (another) {
        return this._totalMilliseconds - parse_1.default(another);
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
exports.default = Lenientime;
