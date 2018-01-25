"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
function default_1(s) {
    s = s && String(s)
        .replace(/\s/g, '')
        .replace(/[\uff00-\uffef]/g, function (token) { return String.fromCharCode(token.charCodeAt(0) - 0xfee0); });
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
    s.match(/^([0-9]{1,2})(?:([0-9]{2})(?:([0-9]{2})([0-9]*))?)?(am|pm)?$/i) ||
        // simple decimal: assume as hour
        s.match(/^([0-9]*\.[0-9]*)()()()(am|pm)?$/i) ||
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
        s.match(/^([+-]?[0-9]*\.?[0-9]*):([+-]?[0-9]*\.?[0-9]*)(?::([+-]?[0-9]*\.?[0-9]*))?()(am|pm)?$/i);
    return match
        ? utils_1.ampm((match[1] ? parseFloat(match[1]) * utils_1.HOUR_IN_MILLISECONDS : 0)
            + (match[2] ? parseFloat(match[2]) * utils_1.MINUTE_IN_MILLISECONDS : 0)
            + (match[3] ? parseFloat(match[3]) * utils_1.SECOND_IN_MILLISECONDS : 0)
            + (match[4] ? parseFloat('0.' + match[4]) * 1000 : 0), match[5])
        : NaN;
}
exports.default = default_1;
