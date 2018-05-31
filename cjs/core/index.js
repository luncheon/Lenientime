"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lenientime_1 = require("./lenientime");
var parse_1 = require("./parse");
var utils_1 = require("./utils");
var ZERO = new lenientime_1.default(0);
var INVALID = new lenientime_1.default(NaN);
var lenientime = (function (source) {
    if (source === undefined || source === null) {
        return INVALID;
    }
    else if (source instanceof lenientime_1.default) {
        return source;
    }
    else {
        var milliseconds = parse_1.default(source);
        return milliseconds === 0 ? ZERO : isNaN(milliseconds) ? INVALID : new lenientime_1.default(milliseconds);
    }
});
lenientime.prototype = lenientime_1.default.prototype;
lenientime.INVALID = INVALID;
lenientime.ZERO = ZERO;
lenientime.now = function () { return new lenientime_1.default(utils_1.now()); };
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
exports.default = lenientime;
