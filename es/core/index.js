import Lenientime from './lenientime';
import parseIntoMilliseconds from './parse';
import { now } from './utils';
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
export default lenientime;
