"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("../core");
var token_1 = require("../core/token");
// <input data-lenientime>
// <input data-lenientime="HH:mm:ss.SSS">
// <input data-lenientime-adjust-on-arrow-keys>
// <input data-lenientime-adjust-on-arrow-keys data-lenientime-format="HH:mm:ss.SSS">
// <input data-lenientime-adjust-on-arrow-keys="-1" data-lenientime-format="HH:mm:ss.SSS">
window.addEventListener('keydown', function (event) {
    var which = event.which;
    if ((which !== 38 && which !== 40) || event.altKey || event.ctrlKey || event.metaKey) {
        return;
    }
    var input = event.target;
    var dataset = input.dataset;
    if (!('lenientimeAdjustOnArrowKeys' in dataset || 'lenientime' in dataset)) {
        return;
    }
    event.preventDefault();
    var template = dataset.lenientimeFormat || dataset.lenientime || 'HH:mm';
    var value = input.value;
    if (value) {
        // const caretPosition = input.selectionDirection === 'backward' ? input.selectionStart : input.selectionEnd
        var caretPosition = input.selectionStart;
        var token = token_1.findToken(template, value, caretPosition);
        if (token) {
            var amount = (which === 38 ? 1 : -1) * (parseFloat(dataset.lenientimeAdjustOnArrowKeys) || 1);
            var adjustedValue = token.adjust(amount, true);
            if (adjustedValue !== undefined) {
                var tokenIndex = token.index;
                input.value = value.slice(0, tokenIndex) + adjustedValue + value.slice(tokenIndex + token.value.length);
                input.setSelectionRange(tokenIndex, tokenIndex + adjustedValue.length);
            }
        }
    }
    else {
        input.value = core_1.default.ZERO.format(template);
        var token = token_1.findToken(template, input.value, 0);
        if (token) {
            input.setSelectionRange(token.index, token.index + token.value.length);
        }
    }
}, true);
