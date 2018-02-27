import lenientime from '../core';
import dispatchInputEvent from './dispatch-input-event';
// <input data-lenientime>
// <input data-lenientime data-lenientime-format="HH:mm:ss.SSS">
// <input data-lenientime-complete>
// <input data-lenientime-complete data-lenientime-format="HH:mm:ss.SSS">
export default function complete(options) {
    var dataAttributeName = options && options.dataAttributeName || 'lenientime';
    var completeAttributeName = dataAttributeName + 'Complete';
    var formatAttributeName = dataAttributeName + 'Format';
    addEventListener('change', function (event) {
        var input = event.target;
        var value = input.value;
        var dataset = input.dataset;
        if (value && (completeAttributeName in dataset || dataAttributeName in dataset)) {
            var time = lenientime(value);
            var completed = time.valid ? time.format(dataset[formatAttributeName] || dataset[dataAttributeName] || 'HH:mm') : '';
            if (completed !== value) {
                input.value = completed;
                dispatchInputEvent(input);
            }
        }
    }, true);
}
