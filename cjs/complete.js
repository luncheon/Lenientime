"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require("./");
window.addEventListener('change', function (event) {
    var input = event.target;
    var value = input.value;
    var dataset = input.dataset;
    if (value && 'lenientimeComplete' in dataset) {
        var time = _1.default(value);
        input.value = time.valid ? time.format(dataset.lenientimeComplete || dataset.lenientimeFormat || 'HH:mm') : '';
    }
}, true);
