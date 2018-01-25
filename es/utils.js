export function padStart(source, maxLength, pad) {
    source = String(source);
    if (!maxLength || !isFinite(maxLength) || source.length >= maxLength) {
        return source;
    }
    return _pad(maxLength - source.length, pad) + source;
}
export function padEnd(source, maxLength, pad) {
    source = String(source);
    if (!maxLength || !isFinite(maxLength) || source.length >= maxLength) {
        return source;
    }
    return source + _pad(maxLength - source.length, pad);
}
function _pad(padLength, pad) {
    pad = pad === undefined || pad === null || pad === '' ? ' ' : String(pad);
    var paddings = pad;
    while (paddings.length < padLength) {
        paddings += pad;
    }
    return paddings.substr(0, padLength);
}
export function firstNumberOf() {
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
export var SECOND_IN_MILLISECONDS = 1000;
export var MINUTE_IN_MILLISECONDS = SECOND_IN_MILLISECONDS * 60;
export var HOUR_IN_MILLISECONDS = MINUTE_IN_MILLISECONDS * 60;
export var HALF_DAY_IN_MILLISECONDS = HOUR_IN_MILLISECONDS * 12;
export var DAY_IN_MILLISECONDS = HOUR_IN_MILLISECONDS * 24;
export function normalizeMillisecondsInOneDay(milliseconds) {
    var value = Math.floor(milliseconds) % DAY_IN_MILLISECONDS;
    return value >= 0 ? value : value + DAY_IN_MILLISECONDS;
}
export function am(milliseconds) {
    return milliseconds >= HALF_DAY_IN_MILLISECONDS ? milliseconds - HALF_DAY_IN_MILLISECONDS : milliseconds;
}
export function pm(milliseconds) {
    return milliseconds < HALF_DAY_IN_MILLISECONDS ? milliseconds + HALF_DAY_IN_MILLISECONDS : milliseconds;
}
export function ampm(milliseconds, a) {
    milliseconds = normalizeMillisecondsInOneDay(milliseconds);
    switch (String(a).toLowerCase()) {
        case 'am': return am(milliseconds);
        case 'pm': return pm(milliseconds);
        default: return milliseconds;
    }
}
