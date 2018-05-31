import lenientime from '../core';
import dispatchInputEvent from './dispatch-input-event';
// <input data-lenientime>
// <input data-lenientime="HH:mm:ss.SSS">
export default function complete(options) {
    var dataAttributeName = options && options.dataAttributeName || 'lenientime';
    var formatSelector = options && options.formatSelector || (function (input) { return input.dataset.lenientime; });
    addEventListener('change', function (event) {
        var input = event.target;
        var value = input.value;
        var dataset = input.dataset;
        if (value && dataAttributeName in dataset) {
            var time = lenientime(value);
            var completed = time.valid ? time.format(formatSelector(input) || 'HH:mm') : '';
            if (completed !== value) {
                input.value = completed;
                dispatchInputEvent(input);
            }
        }
    }, true);
}
