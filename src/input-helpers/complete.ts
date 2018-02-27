import lenientime from '../core'
import dispatchInputEvent from './dispatch-input-event'

// <input data-lenientime>
// <input data-lenientime data-lenientime-format="HH:mm:ss.SSS">
// <input data-lenientime-complete>
// <input data-lenientime-complete data-lenientime-format="HH:mm:ss.SSS">
export default function complete(options?: { dataAttributeName?: string }) {
  const dataAttributeName = options && options.dataAttributeName || 'lenientime'
  const completeAttributeName = dataAttributeName + 'Complete'
  const formatAttributeName = dataAttributeName + 'Format'
  addEventListener('change', event => {
    const input = event.target as HTMLInputElement
    const value = input.value
    const dataset = input.dataset
    if (value && (completeAttributeName in dataset || dataAttributeName in dataset)) {
      const time = lenientime(value)
      const completed = time.valid ? time.format(dataset[formatAttributeName] || dataset[dataAttributeName] || 'HH:mm') : ''
      if (completed !== value) {
        input.value = completed
        dispatchInputEvent(input)
      }
    }
  }, true)
}
