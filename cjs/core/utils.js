"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function padStart(source, minLength, pad) {
    source = String(source);
    if (!minLength || !isFinite(minLength) || source.length >= minLength) {
        return source;
    }
    return _pad(minLength - source.length, pad) + source;
}
exports.padStart = padStart;
function padEnd(source, minLength, pad) {
    source = String(source);
    if (!minLength || !isFinite(minLength) || source.length >= minLength) {
        return source;
    }
    return source + _pad(minLength - source.length, pad);
}
exports.padEnd = padEnd;
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
exports.firstFiniteNumberOf = firstFiniteNumberOf;
exports.SECOND_IN_MILLISECONDS = 1000;
exports.MINUTE_IN_MILLISECONDS = exports.SECOND_IN_MILLISECONDS * 60;
exports.HOUR_IN_MILLISECONDS = exports.MINUTE_IN_MILLISECONDS * 60;
exports.HALF_DAY_IN_MILLISECONDS = exports.HOUR_IN_MILLISECONDS * 12;
exports.DAY_IN_MILLISECONDS = exports.HOUR_IN_MILLISECONDS * 24;
function now() {
    return (Date.now() - new Date().getTimezoneOffset() * exports.MINUTE_IN_MILLISECONDS) % exports.DAY_IN_MILLISECONDS;
}
exports.now = now;
function normalizeMillisecondsInOneDay(milliseconds) {
    var value = Math.floor(milliseconds) % exports.DAY_IN_MILLISECONDS;
    return value >= 0 ? value : value + exports.DAY_IN_MILLISECONDS;
}
exports.normalizeMillisecondsInOneDay = normalizeMillisecondsInOneDay;
function am(milliseconds) {
    return milliseconds >= exports.HALF_DAY_IN_MILLISECONDS ? milliseconds - exports.HALF_DAY_IN_MILLISECONDS : milliseconds;
}
exports.am = am;
function pm(milliseconds) {
    return milliseconds < exports.HALF_DAY_IN_MILLISECONDS ? milliseconds + exports.HALF_DAY_IN_MILLISECONDS : milliseconds;
}
exports.pm = pm;
function ampm(milliseconds, a) {
    milliseconds = normalizeMillisecondsInOneDay(milliseconds);
    switch (a && String(a)[0].toLowerCase()) {
        case 'a': return am(milliseconds);
        case 'p': return pm(milliseconds);
        default: return milliseconds;
    }
}
exports.ampm = ampm;
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
exports.limit = limit;
