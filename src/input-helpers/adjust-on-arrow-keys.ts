import lenientime from '../core'
import { tokenAt } from '../core/token'
import dispatchInputEvent from './dispatch-input-event'

// <input data-lenientime>
// <input data-lenientime="HH:mm:ss.SSS" data-lenientime-adjust-on-arrow-keys="-1">
export default function adjustOnArrowKeys(options?: {
  dataAttributeName?: string
  formatSelector?: (input: HTMLInputElement) => string | undefined
  amountSelector?: (input: HTMLInputElement) => number | undefined
}) {
  const dataAttributeName = options && options.dataAttributeName || 'lenientime'
  const formatSelector = options && options.formatSelector || ((input: HTMLInputElement) => input.dataset.lenientime)
  const amountSelector = options && options.amountSelector || (
    (input: HTMLInputElement) => parseInt(input.dataset.lenientimeAdjustOnArrowKeysAttributeName!, 10)
  )
  addEventListener('keydown', event => {
    const which = event.which
    if ((which !== 38 && which !== 40) || event.altKey || event.ctrlKey || event.metaKey) {
      return
    }

    const input = event.target as HTMLInputElement
    const dataset = input.dataset
    if (!(dataAttributeName in dataset)) {
      return
    }

    event.preventDefault()

    const template = formatSelector(input) || 'HH:mm'
    const value = input.value
    if (value) {
      // const caretPosition = input.selectionDirection === 'backward' ? input.selectionStart : input.selectionEnd
      const caretPosition = input.selectionStart
      const token = caretPosition === null ? undefined : tokenAt(template, value, caretPosition)
      if (token) {
        const amount = (which === 38 ? 1 : -1) * (options && options.amountSelector && options.amountSelector(input) || 1)
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
      const token = tokenAt(template, input.value, 0)
      if (token) {
        input.setSelectionRange(token.index, token.index + token.value.length)
      }
      dispatchInputEvent(input)
    }
  }, true)
}
