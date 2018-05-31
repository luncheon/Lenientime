import { limit, padStart } from './utils';
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
export function format(template, time) {
    return String(template).replace(tokenPattern(), function (token) { return token[0] === '\\' ? token[1] : time[token]; });
}
export function tokenAt(template, value, position) {
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
export function tokenizeTemplate(template) {
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
