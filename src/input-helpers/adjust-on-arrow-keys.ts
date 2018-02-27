import lenientime from '../core'
import { findToken } from '../core/token'
import dispatchInputEvent from './dispatch-input-event'

// <input data-lenientime>
// <input data-lenientime="HH:mm:ss.SSS">
// <input data-lenientime-adjust-on-arrow-keys>
// <input data-lenientime-adjust-on-arrow-keys data-lenientime-format="HH:mm:ss.SSS">
// <input data-lenientime-adjust-on-arrow-keys="-1" data-lenientime-format="HH:mm:ss.SSS">
window.addEventListener('keydown', event => {
  const which = event.which
  if ((which !== 38 && which !== 40) || event.altKey || event.ctrlKey || event.metaKey) {
    return
  }

  const input = event.target as HTMLInputElement
  const dataset = input.dataset
  if (!('lenientimeAdjustOnArrowKeys' in dataset || 'lenientime' in dataset)) {
    return
  }

  event.preventDefault()

  const template = dataset.lenientimeFormat || dataset.lenientime || 'HH:mm'
  const value = input.value
  if (value) {
    // const caretPosition = input.selectionDirection === 'backward' ? input.selectionStart : input.selectionEnd
    const caretPosition = input.selectionStart
    const token = findToken(template, value, caretPosition)
    if (token) {
      const amount = (which === 38 ? 1 : -1) * (parseFloat(dataset.lenientimeAdjustOnArrowKeys!) || 1)
      const adjustedValue = token.adjust(amount, true)
      if (adjustedValue !== undefined) {
        const tokenIndex = token.index
        input.value = value.slice(0, tokenIndex) + adjustedValue + value.slice(tokenIndex + token.value.length)
        input.setSelectionRange(tokenIndex, tokenIndex + adjustedValue.length)
        dispatchInputEvent(input)
      }
    }
  } else {
    input.value = lenientime.ZERO.format(template)
    const token = findToken(template, input.value, 0)
    if (token) {
      input.setSelectionRange(token.index, token.index + token.value.length)
    }
    dispatchInputEvent(input)
  }
}, true)
