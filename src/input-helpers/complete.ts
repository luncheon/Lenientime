import lenientime from '../core'

// <input data-lenientime>
// <input data-lenientime data-lenientime-format="HH:mm:ss.SSS">
// <input data-lenientime-complete>
// <input data-lenientime-complete data-lenientime-format="HH:mm:ss.SSS">
window.addEventListener('change', event => {
  const input = event.target as HTMLInputElement
  const value = input.value
  const dataset = input.dataset
  if (value && ('lenientimeComplete' in dataset || 'lenientime' in dataset)) {
    const time = lenientime(value)
    input.value = time.valid ? time.format(dataset.lenientimeFormat || dataset.lenientime || 'HH:mm') : ''
  }
}, true)
