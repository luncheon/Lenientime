import lenientime from './'

window.addEventListener('change', event => {
  const input = event.target as HTMLInputElement
  const value = input.value
  const dataset = input.dataset
  if (value && 'lenientimeComplete' in dataset) {
    const time = lenientime(value)
    input.value = time.valid ? time.format(dataset.lenientimeComplete || 'HH:mm') : ''
  }
}, true)
