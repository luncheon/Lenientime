"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("../core");
var token_1 = require("../core/token");
var dispatch_input_event_1 = require("./dispatch-input-event");
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
            var token = caretPosition === null ? undefined : token_1.tokenAt(template, value, caretPosition);
            if (token) {
                var amount = (which === 38 ? 1 : -1) * (options && options.amountSelector && options.amountSelector(input) || 1);
                var adjustedValue = token.adjust(amount, true);
                if (adjustedValue !== undefined) {
                    var tokenIndex = token.index;
                    input.value = value.slice(0, tokenIndex) + adjustedValue + value.slice(tokenIndex + token.value.length);
                    input.setSelectionRange(tokenIndex, tokenIndex + adjustedValue.length);
                    dispatch_input_event_1.default(input);
                }
            }
        }
        else {
            input.value = core_1.default.ZERO.format(template);
            var token = token_1.tokenAt(template, input.value, 0);
            if (token) {
                input.setSelectionRange(token.index, token.index + token.value.length);
            }
            dispatch_input_event_1.default(input);
        }
    }, true);
}
exports.default = adjustOnArrowKeys;
