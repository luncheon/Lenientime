"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("../core");
var dispatch_input_event_1 = require("./dispatch-input-event");
// <input data-lenientime>
// <input data-lenientime="HH:mm:ss.SSS">
function complete(options) {
    var dataAttributeName = options && options.dataAttributeName || 'lenientime';
    var formatSelector = options && options.formatSelector || (function (input) { return input.dataset.lenientime; });
    addEventListener('change', function (event) {
        var input = event.target;
        var value = input.value;
        var dataset = input.dataset;
        if (value && dataAttributeName in dataset) {
            var time = core_1.default(value);
            var completed = time.valid ? time.format(formatSelector(input) || 'HH:mm') : '';
            if (completed !== value) {
                input.value = completed;
                dispatch_input_event_1.default(input);
            }
        }
    }, true);
}
exports.default = complete;
