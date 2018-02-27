export default function dispatchInputEvent(inputElement: HTMLInputElement) {
  const inputEvent = document.createEvent('CustomEvent')
  inputEvent.initCustomEvent('input', true, false, 'complete')
  inputElement.dispatchEvent(inputEvent)
}
