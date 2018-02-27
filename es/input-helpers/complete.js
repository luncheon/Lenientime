import lenientime from '../core';
import dispatchInputEvent from './dispatch-input-event';
// <input data-lenientime>
// <input data-lenientime data-lenientime-format="HH:mm:ss.SSS">
// <input data-lenientime-complete>
// <input data-lenientime-complete data-lenientime-format="HH:mm:ss.SSS">
window.addEventListener('change', function (event) {
    var input = event.target;
    var value = input.value;
    var dataset = input.dataset;
    if (value && ('lenientimeComplete' in dataset || 'lenientime' in dataset)) {
        var time = lenientime(value);
        var completed = time.valid ? time.format(dataset.lenientimeFormat || dataset.lenientime || 'HH:mm') : '';
        if (completed !== value) {
            input.value = completed;
            dispatchInputEvent(input);
        }
    }
}, true);
