import lenientime from '../core'
import dispatchInputEvent from './dispatch-input-event'

// <input data-lenientime>
// <input data-lenientime="HH:mm:ss.SSS">
export default function complete(options?: {
  dataAttributeName?: string
  formatSelector?: (input: HTMLInputElement) => string | undefined
}) {
  const dataAttributeName = options && options.dataAttributeName || 'lenientime'
  const formatSelector = options && options.formatSelector || ((input: HTMLInputElement) => input.dataset.lenientime)
  addEventListener('change', event => {
    const input = event.target as HTMLInputElement
    const value = input.value
    const dataset = input.dataset
    if (value && dataAttributeName in dataset) {
      const time = lenientime(value)
      const completed = time.valid ? time.format(formatSelector(input) || 'HH:mm') : ''
      if (completed !== value) {
        input.value = completed
        dispatchInputEvent(input)
      }
    }
  }, true)
}
