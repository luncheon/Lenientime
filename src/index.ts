import { Lenientime, LenientimeParsable } from './lenientime'

export default function lenientime(source?: LenientimeParsable): Lenientime {
  return Lenientime.of(source)
}

lenientime.prototype = Lenientime.prototype
