"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function dispatchInputEvent(inputElement) {
    var inputEvent = document.createEvent('CustomEvent');
    inputEvent.initCustomEvent('input', true, false, 'complete');
    inputElement.dispatchEvent(inputEvent);
}
exports.default = dispatchInputEvent;
