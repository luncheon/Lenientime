var SECOND_IN_MILLISECONDS = 1000;
var MINUTE_IN_MILLISECONDS = SECOND_IN_MILLISECONDS * 60;
var HOUR_IN_MILLISECONDS = MINUTE_IN_MILLISECONDS * 60;
var HALF_DAY_IN_MILLISECONDS = HOUR_IN_MILLISECONDS * 12;
var DAY_IN_MILLISECONDS = HOUR_IN_MILLISECONDS * 24;
var Lenientime = /** @class */ (function () {
    function Lenientime(_totalMilliseconds) {
        this._totalMilliseconds = _totalMilliseconds;
    }
    Lenientime.padStart = function (source, maxLength, pad) {
        source = String(source);
        if (!maxLength || !isFinite(maxLength) || source.length >= maxLength) {
            return source;
        }
        pad = pad === undefined || pad === null || pad === '' ? ' ' : String(pad);
        var padLength = maxLength - source.length;
        var paddings = pad;
        while (paddings.length < padLength) {
            paddings += pad;
        }
        return paddings.substr(0, padLength) + source;
    };
    Lenientime.totalMillisecondsOf = function (_a) {
        var h = _a.h, m = _a.m, s = _a.s, S = _a.S, a = _a.a;
        var totalMilliseconds = Lenientime.normalizeMillisecondsInOneDay((typeof h === 'number' ? h * HOUR_IN_MILLISECONDS : 0) +
            (typeof m === 'number' ? m * MINUTE_IN_MILLISECONDS : 0) +
            (typeof s === 'number' ? s * SECOND_IN_MILLISECONDS : 0) +
            (typeof S === 'number' ? S : 0));
        a = a && String(a).toLowerCase();
        if (a === 'am' && totalMilliseconds >= HALF_DAY_IN_MILLISECONDS) {
            return totalMilliseconds - HALF_DAY_IN_MILLISECONDS;
        }
        if (a === 'pm' && totalMilliseconds < HALF_DAY_IN_MILLISECONDS) {
            return totalMilliseconds + HALF_DAY_IN_MILLISECONDS;
        }
        return totalMilliseconds;
    };
    Lenientime.normalizeMillisecondsInOneDay = function (milliseconds) {
        var value = Math.floor(milliseconds) % DAY_IN_MILLISECONDS;
        return value >= 0 ? value : value + DAY_IN_MILLISECONDS;
    };
    Lenientime.of = function (hmsaOrMilliseconds) {
        if (typeof hmsaOrMilliseconds === 'number') {
            return new Lenientime(Lenientime.normalizeMillisecondsInOneDay(hmsaOrMilliseconds));
        }
        else if (hmsaOrMilliseconds && typeof hmsaOrMilliseconds === 'object') {
            return new Lenientime(Lenientime.totalMillisecondsOf(hmsaOrMilliseconds));
        }
        else {
            return Lenientime.INVALID;
        }
    };
    Lenientime.now = function () {
        return Lenientime.of(Date.now());
    };
    Lenientime.parse = function (s) {
        s = s && String(s)
            .replace(/\s/g, '')
            .replace(/[\uff00-\uffef]/g, function (token) { return String.fromCharCode(token.charCodeAt(0) - 0xfee0); });
        if (!s) {
            return Lenientime.ZERO;
        }
        var match = 
        // simple decimal: assume as hour
        s.match(/^([0-9]*\.[0-9]*)()()(am|pm)?$/i) ||
            // simple integer: complete colons
            //  1           -> 01:00:00.000
            //  12          -> 12:00:00.000
            //  123         -> 01:23:00.000
            //  1234        -> 12:34:00.000
            //  12345       -> 01:23:45.000
            //  123456      -> 12:34:56.000
            //  123456am    -> 00:34:56.000
            s.match(/^([0-9]{1,2})([0-9]{2})?([0-9]{2})?(am|pm)?$/i) ||
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
            s.match(/^([+-]?[0-9]*\.?[0-9]*):([+-]?[0-9]*\.?[0-9]*)(?::([+-]?[0-9]*\.?[0-9]*))?(am|pm)?$/i);
        if (match) {
            return Lenientime.of({
                h: match[1] ? parseFloat(match[1]) : 0,
                m: match[2] ? parseFloat(match[2]) : 0,
                s: match[3] ? parseFloat(match[3]) : 0,
                a: match[4],
            });
        }
        return Lenientime.INVALID;
    };
    Object.defineProperty(Lenientime.prototype, "H", {
        get: function () { return Math.floor(this._totalMilliseconds / HOUR_IN_MILLISECONDS); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "h", {
        get: function () { return (this.H + 11) % 12 + 1; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "m", {
        get: function () { return Math.floor(this._totalMilliseconds % HOUR_IN_MILLISECONDS / MINUTE_IN_MILLISECONDS); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "s", {
        get: function () { return Math.floor(this._totalMilliseconds % MINUTE_IN_MILLISECONDS / SECOND_IN_MILLISECONDS); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "S", {
        get: function () { return this._totalMilliseconds % SECOND_IN_MILLISECONDS; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "a", {
        get: function () { return this.invalid ? '--' : this.H < 12 ? 'am' : 'pm'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "A", {
        get: function () { return this.invalid ? '--' : this.H < 12 ? 'AM' : 'PM'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "aa", {
        get: function () { return this.invalid ? '----' : this.H < 12 ? 'a.m.' : 'p.m.'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "AA", {
        get: function () { return this.invalid ? '----' : this.H < 12 ? 'A.M.' : 'P.M.'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "HH", {
        get: function () { return this.invalid ? '--' : Lenientime.padStart(this.H, 2, '0'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "_H", {
        get: function () { return this.invalid ? '--' : Lenientime.padStart(this.H, 2, ' '); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "hh", {
        get: function () { return this.invalid ? '--' : Lenientime.padStart(this.h, 2, '0'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "_h", {
        get: function () { return this.invalid ? '--' : Lenientime.padStart(this.h, 2, ' '); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "mm", {
        get: function () { return this.invalid ? '--' : Lenientime.padStart(this.m, 2, '0'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "_m", {
        get: function () { return this.invalid ? '--' : Lenientime.padStart(this.m, 2, ' '); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "ss", {
        get: function () { return this.invalid ? '--' : Lenientime.padStart(this.s, 2, '0'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "_s", {
        get: function () { return this.invalid ? '--' : Lenientime.padStart(this.s, 2, ' '); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lenientime.prototype, "SSS", {
        get: function () { return this.invalid ? '---' : Lenientime.padStart(this.S, 3, '0'); },
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
    Lenientime.prototype.toString = function () {
        return this.HHmmssSSS;
    };
    Lenientime.prototype.format = function (template) {
        var _this = this;
        return String(template).replace(/\\.|HH?|hh?|mm?|ss?|SSS|S|AA?|aa?|_H|_h|_m|_s/g, function (token) { return token[0] === '\\' ? token[1] : _this[token]; });
    };
    Lenientime.prototype.with = function (_a) {
        var h = _a.h, m = _a.m, s = _a.s, S = _a.S, a = _a.a;
        return Lenientime.of({
            h: typeof h === 'number' ? h : this.H,
            m: typeof m === 'number' ? m : this.m,
            s: typeof s === 'number' ? s : this.s,
            S: typeof S === 'number' ? S : this.S,
            a: a,
        });
    };
    Lenientime.prototype.plus = function (time) {
        var totalMilliseconds = Lenientime.totalMillisecondsOf(time);
        return totalMilliseconds === 0 ? this : Lenientime.of(this._totalMilliseconds + totalMilliseconds);
    };
    Lenientime.prototype.minus = function (time) {
        var totalSeconds = Lenientime.totalMillisecondsOf(time);
        return totalSeconds === 0 ? this : Lenientime.of(this.totalSeconds - totalSeconds);
    };
    Lenientime.prototype.equals = function (time) {
        return this.compareTo(time) === 0;
    };
    Lenientime.prototype.compareTo = function (time) {
        return this._totalMilliseconds - Lenientime.totalMillisecondsOf(time);
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
    Lenientime.INVALID = new Lenientime(NaN);
    Lenientime.ZERO = new Lenientime(0);
    return Lenientime;
}());
export default Lenientime;
