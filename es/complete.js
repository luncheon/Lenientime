import lenientime from './';
window.addEventListener('change', function (event) {
    var input = event.target;
    var value = input.value;
    var dataset = input.dataset;
    if (value && 'lenientimeComplete' in dataset) {
        var time = lenientime(value);
        input.value = time.valid ? time.format(dataset.lenientimeComplete || dataset.lenientimeFormat || 'HH:mm') : '';
    }
}, true);
