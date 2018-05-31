export default function dispatchInputEvent(inputElement) {
    var inputEvent = document.createEvent('CustomEvent');
    inputEvent.initCustomEvent('input', true, false, 'complete');
    inputElement.dispatchEvent(inputEvent);
}
