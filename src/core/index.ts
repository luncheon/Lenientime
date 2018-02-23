import Lenientime from './lenientime'
import parseIntoMilliseconds, { LenientimeParsable } from './parse'
import { now } from './utils'

const ZERO = new Lenientime(0)
const INVALID = new Lenientime(NaN)

// tslint:disable-next-line:class-name
interface lenientime {
  (source?: LenientimeParsable): Lenientime
  INVALID: Lenientime
  ZERO: Lenientime
  now(): Lenientime
  min(...times: LenientimeParsable[]): Lenientime
  max(...times: LenientimeParsable[]): Lenientime
}

const lenientime: lenientime = ((source?: LenientimeParsable) => {
  if (source === undefined || source === null) {
    return INVALID
  } else if (source instanceof Lenientime) {
    return source
  } else {
    const milliseconds = parseIntoMilliseconds(source)
    return milliseconds === 0 ? ZERO : isNaN(milliseconds) ? INVALID : new Lenientime(milliseconds)
  }
}) as any

lenientime.prototype = Lenientime.prototype
lenientime.INVALID = INVALID
lenientime.ZERO = ZERO
lenientime.now = () => new Lenientime(now())
lenientime.min = function () { return reduce(arguments, (min, current) => min.invalid || current.isBefore(min) ? current : min) }
lenientime.max = function () { return reduce(arguments, (max, current) => max.invalid || current.isAfter(max) ? current : max) }

function reduce<TLenientimeArrayLike extends ArrayLike<LenientimeParsable>>(
  source: TLenientimeArrayLike,
  callback: (previousValue: Lenientime, currentValue: Lenientime, currentIndex: number, source: TLenientimeArrayLike) => Lenientime,
  initialValue = INVALID
) {
  let result = initialValue
  for (let i = 0, len = source.length; i < len; ++i) {
    const current = lenientime(source[i])
    if (current.valid) {
      result = callback(result, current, i, source)
    }
  }
  return result
}

export default lenientime
