"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lenientime_1 = require("./lenientime");
var utils_1 = require("./utils");
function parseIntoMilliseconds(time) {
    switch (typeof time) {
        case 'number':
            return utils_1.normalizeMillisecondsInOneDay(time);
        case 'string':
            return parseString(time);
        case 'object':
            if (time) {
                return parseLenientimeLike(time instanceof Array ? { h: time[0], m: time[1], s: time[2], S: time[3] } : time);
            }
    }
    return NaN;
}
exports.default = parseIntoMilliseconds;
function parseLenientimeLike(time) {
    if (time instanceof lenientime_1.default) {
        return time.totalMilliseconds;
    }
    var totalMilliseconds = utils_1.firstFiniteNumberOf(time.h, time.hour, time.hours, 0) * utils_1.HOUR_IN_MILLISECONDS
        + utils_1.firstFiniteNumberOf(time.m, time.minute, time.minutes, 0) * utils_1.MINUTE_IN_MILLISECONDS
        + utils_1.firstFiniteNumberOf(time.s, time.second, time.seconds, 0) * utils_1.SECOND_IN_MILLISECONDS
        + utils_1.firstFiniteNumberOf(time.S, time.millisecond, time.milliseconds, 0);
    if ((time.am === true || time.pm === false)) {
        return utils_1.am(totalMilliseconds);
    }
    if ((time.pm === true || time.am === false)) {
        return utils_1.pm(totalMilliseconds);
    }
    return utils_1.ampm(totalMilliseconds, time.a);
}
function parseString(s) {
    s = s && String(s)
        .replace(/[\uff00-\uffef]/g, function (token) { return String.fromCharCode(token.charCodeAt(0) - 0xfee0); })
        .replace(/\s/g, '')
        .replace(/(a|p)\.?m?\.?$/i, function ($0, $1) { return $1.toLowerCase(); });
    if (!s) {
        return 0;
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
        ? utils_1.ampm((match[1] ? parseFloat(match[1]) * utils_1.HOUR_IN_MILLISECONDS : 0)
            + (match[2] ? parseFloat(match[2]) * utils_1.MINUTE_IN_MILLISECONDS : 0)
            + (match[3] ? parseFloat(match[3]) * utils_1.SECOND_IN_MILLISECONDS : 0)
            + (match[4] ? parseFloat('0.' + match[4]) * 1000 : 0), match[5])
        : NaN;
}
