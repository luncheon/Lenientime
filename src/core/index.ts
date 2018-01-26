import parse from './parse'
import {
  DAY_IN_MILLISECONDS, HOUR_IN_MILLISECONDS, MINUTE_IN_MILLISECONDS, SECOND_IN_MILLISECONDS,
  am, ampm, firstNumberOf, normalizeMillisecondsInOneDay, padEnd, padStart, pm,
} from './utils'

export default interface LenientimeLike {
  readonly h?:            string | number
  readonly hour?:         string | number
  readonly hours?:        string | number
  readonly m?:            string | number
  readonly minute?:       string | number
  readonly minutes?:      string | number
  readonly s?:            string | number
  readonly second?:       string | number
  readonly seconds?:      string | number
  readonly S?:            string | number
  readonly ms?:           string | number
  readonly millisecond?:  string | number
  readonly milliseconds?: string | number
  readonly a?:            'am' | 'pm' | 'AM' | 'PM' | '--'
  readonly am?:           boolean
  readonly pm?:           boolean
}

export type LenientimeParsable = LenientimeLike | number | number[] | string

export class Lenientime implements LenientimeLike {
  public static INVALID  = new Lenientime(NaN)
  public static ZERO     = new Lenientime(0)

  public static of(source?: LenientimeParsable): Lenientime {
    if (source === undefined || source === null) {
      return Lenientime.now()
    } else if (source instanceof Lenientime) {
      return source
    } else {
      const milliseconds = Lenientime._totalMillisecondsOf(source)
      return milliseconds === 0 ? Lenientime.ZERO : new Lenientime(milliseconds)
    }
  }

  public static now() {
    return new Lenientime(Date.now())
  }

  public static min(...times: LenientimeParsable[]): Lenientime
  public static min() {
    return this.reduce(arguments, (min, current) => min.invalid || current.isBefore(min) ? current : min)
  }

  public static max(...times: LenientimeParsable[]): Lenientime
  public static max() {
    return this.reduce(arguments, (max, current) => max.invalid || current.isAfter(max) ? current : max)
  }

  private static _totalMillisecondsOf(time: LenientimeParsable) {
    if (time instanceof Lenientime) {
      return time._totalMilliseconds
    }
    if (typeof time === 'number') {
      return normalizeMillisecondsInOneDay(time)
    }
    if (typeof time === 'string') {
      return parse(time)
    }
    if (time instanceof Array) {
      time = {
        h:  time[0],
        m:  time[1],
        s:  time[2],
        ms: time[3],
      }
    }
    if (time && typeof time === 'object') {
      const totalMilliseconds =
          firstNumberOf(time.h, time.  hour, time.  hours, 0)! *   HOUR_IN_MILLISECONDS
        + firstNumberOf(time.m, time.minute, time.minutes, 0)! * MINUTE_IN_MILLISECONDS
        + firstNumberOf(time.s, time.second, time.seconds, 0)! * SECOND_IN_MILLISECONDS
        + firstNumberOf(time.ms, time.S, time.millisecond, time.milliseconds, 0)!
      if ((time.am === true || time.pm === false)) {
        return am(totalMilliseconds)
      }
      if ((time.pm === true || time.am === false)) {
        return pm(totalMilliseconds)
      }
      return ampm(totalMilliseconds, time.a)
    }
    return NaN
  }

  private static reduce<TLenientimeArrayLike extends ArrayLike<LenientimeParsable>>(
    source: TLenientimeArrayLike,
    callback: (previousValue: Lenientime, currentValue: Lenientime, currentIndex: number, source: TLenientimeArrayLike) => Lenientime,
    initialValue = Lenientime.INVALID
  ) {
    let result = initialValue
    for (let i = 0, len = source.length; i < len; ++i) {
      const current = Lenientime.of(source[i])
      if (current.valid) {
        result = callback(result, current, i, source)
      }
    }
    return result
  }

  private constructor(private _totalMilliseconds: number) {
  }

  /** Numeric hour in 24-hour clock: [0..23] */
  get hour():         number { return Math.floor(this._totalMilliseconds / HOUR_IN_MILLISECONDS) }
  /** Numeric hour in 1-based 12-hour clock: [1..12] */
  get hour12():       number { return (this.hour + 11) % 12 + 1 }
  /** Numeric minute: [0..59] */
  get minute():       number { return Math.floor(this._totalMilliseconds % HOUR_IN_MILLISECONDS / MINUTE_IN_MILLISECONDS) }
  /** Numeric second: [0..59] */
  get second():       number { return Math.floor(this._totalMilliseconds % MINUTE_IN_MILLISECONDS / SECOND_IN_MILLISECONDS) }
  /** Numeric millisecond: [0..999] */
  get millisecond():  number { return this._totalMilliseconds % SECOND_IN_MILLISECONDS }
  get am():          boolean { return this.hour < 12 }
  get pm():          boolean { return this.hour >= 12 }

  /** Alias for [[hour]] */
  get hours()        { return this.hour }
  /** Alias for [[hour12]] */
  get hours12()      { return this.hour12 }
  /** Alias for [[minute]] */
  get minutes()      { return this.minute }
  /** Alias for [[second]] */
  get seconds()      { return this.second }
  /** Alias for [[millisecond]] */
  get milliseconds() { return this.millisecond }

  /** Hour string in 24-hour notation without padding: ["0".."23"] | "-" */
  get H()   { return this.invalid ? '-'   : String(this.hour) }
  /** Hour string in 1-based-12-hour notation without padding: ["1".."12"] | "-" */
  get h()   { return this.invalid ? '-'   : String(this.hour12) }
  /** Hour string in 0-based-12-hour notation without padding: ["0".."11"] | "-" */
  get k()   { return this.invalid ? '-'   : String((this.hour + 23) % 24 + 1) }
  /** Minute string without padding: ["0".."59"] | "-" */
  get m()   { return this.invalid ? '-'   : String(this.minute) }
  /** Second string without padding: ["0".."59"] | "-" */
  get s()   { return this.invalid ? '-'   : String(this.second) }
  /** 1 fractional digit string of second: ["0".."9"] | "-" */
  get S()   { return this.invalid ? '-'   : String(Math.floor(this.millisecond / 100)) }
  /** 2 fractional digits string of second: ["00".."99"] | "--" */
  get SS()  { return this.invalid ? '--'  : padEnd(Math.floor(this.millisecond / 10), 2, '0') }
  /** 3 fractional digits string of second: ["000".."999"] | "---" */
  get SSS() { return this.invalid ? '---' : padEnd(this.millisecond, 3, '0') }

  /** "am" | "pm" | "--" */
  get a()   { return this.invalid ? '--'   : this.am ? 'am' : 'pm' }
  /** "AM" | "PM" | "--" */
  get A()   { return this.invalid ? '--'   : this.am ? 'AM' : 'PM' }
  /** "a.m." | "p.m." | "----" */
  get aa()  { return this.invalid ? '----' : this.am ? 'a.m.' : 'p.m.' }
  /** "A.M." | "P.M." | "----" */
  get AA()  { return this.invalid ? '----' : this.am ? 'A.M.' : 'P.M.' }

  /** Hour string in 24-hour notation with zero padding: ["00".."23"] | "--" */
  get HH()  { return this.invalid ? '--'   : padStart(this.H, 2, '0') }
  /** Hour string in 24-hour notation with space padding: [" 0".."23"] | "--" */
  get _H()  { return this.invalid ? '--'   : padStart(this.H, 2, ' ') }
  /** Hour string in 1-based 12-hour notation with zero padding: ["01".."12"] | "--" */
  get hh()  { return this.invalid ? '--'   : padStart(this.h, 2, '0') }
  /** hour string in 1-based 12-hour notation with space padding: [" 1".."12"] | "--" */
  get _h()  { return this.invalid ? '--'   : padStart(this.h, 2, ' ') }
  /** Hour string in 0-based 12-hour notation with zero padding: ["00".."11"] | "--" */
  get kk()  { return this.invalid ? '--'   : padStart(this.k, 2, '0') }
  /** Hour string in 0-based 12-hour notation with space padding: [" 0".."11"] | "--" */
  get _k()  { return this.invalid ? '--'   : padStart(this.k, 2, ' ') }
  /** Minute string with zero padding: ["00".."59"] | "--" */
  get mm()  { return this.invalid ? '--'   : padStart(this.m, 2, '0') }
  /** Minute string with space padding: [" 0".."59"] | "--" */
  get _m()  { return this.invalid ? '--'   : padStart(this.m, 2, ' ') }
  /** Second string with zero padding: ["00".."59"] | "--" */
  get ss()  { return this.invalid ? '--'   : padStart(this.s, 2, '0') }
  /** Second string with space padding: [" 0".."59"] | "--" */
  get _s()  { return this.invalid ? '--'   : padStart(this.s, 2, ' ') }

  get HHmm()              { return this.HH     + ':' + this.mm }
  get HHmmss()            { return this.HHmm   + ':' + this.ss }
  get HHmmssSSS()         { return this.HHmmss + '.' + this.SSS }

  get totalMilliseconds() { return this._totalMilliseconds }
  get totalSeconds()      { return Math.floor(this._totalMilliseconds / SECOND_IN_MILLISECONDS) }
  get totalMinutes()      { return Math.floor(this._totalMilliseconds / MINUTE_IN_MILLISECONDS) }

  get valid()             { return 0 <= this._totalMilliseconds && this._totalMilliseconds < DAY_IN_MILLISECONDS }
  get invalid()           { return !this.valid }

  get startOfHour()       { return Lenientime.of(this._totalMilliseconds - this._totalMilliseconds % HOUR_IN_MILLISECONDS) }
  get startOfMinute()     { return Lenientime.of(this._totalMilliseconds - this._totalMilliseconds % MINUTE_IN_MILLISECONDS) }
  get startOfSecond()     { return Lenientime.of(this._totalMilliseconds - this._totalMilliseconds % SECOND_IN_MILLISECONDS) }

  public ifInvalid(source: LenientimeParsable) {
    return this.valid ? this : Lenientime.of(source)
  }

  public startOf(unit: 'hour' | 'minute' | 'second') {
    switch (unit) {
      case 'hour':   return this.startOfHour
      case 'minute': return this.startOfMinute
      case 'second': return this.startOfSecond
      default:       return this
    }
  }

  public toString() {
    return this.HHmmssSSS
  }

  public format(template: string) {
    return String(template).replace(
      /\\.|HH?|hh?|kk?|mm?|ss?|S{1,3}|AA?|aa?|_H|_h|_k|_m|_s/g,
      token => token[0] === '\\' ? token[1] : this[token as keyof this]
    )
  }

  public with(time: LenientimeLike) {
    return Lenientime.of({
      h:  firstNumberOf(time.h, time.  hour, time.  hours, this.  hour),
      m:  firstNumberOf(time.m, time.minute, time.minutes, this.minute),
      s:  firstNumberOf(time.s, time.second, time.seconds, this.second),
      ms: firstNumberOf(time.ms, time.S, time.millisecond, time.milliseconds, this.millisecond),
      am: time.am === true || time.pm === false || (time.a === 'am' ? true : time.a === 'pm' ? false : undefined),
    })
  }

  public plus(time: LenientimeParsable) {
    const totalMilliseconds = Lenientime._totalMillisecondsOf(time)
    return totalMilliseconds === 0 ? this : Lenientime.of(this._totalMilliseconds + totalMilliseconds)
  }

  public minus(time: LenientimeParsable) {
    const totalMilliseconds = Lenientime._totalMillisecondsOf(time)
    return totalMilliseconds === 0 ? this : Lenientime.of(this._totalMilliseconds - totalMilliseconds)
  }

  public equals(another: LenientimeParsable) {
    return this.compareTo(another) === 0
  }

  public compareTo(another: LenientimeParsable) {
    return this._totalMilliseconds - Lenientime._totalMillisecondsOf(another)
  }

  public isBefore(another: LenientimeParsable) {
    return this.compareTo(another) < 0
  }

  public isBeforeOrEqual(another: LenientimeParsable) {
    return this.compareTo(another) <= 0
  }

  public isAfter(another: LenientimeParsable) {
    return this.compareTo(another) > 0
  }

  public isAfterOrEqual(another: LenientimeParsable) {
    return this.compareTo(another) >= 0
  }

  public isBetweenExclusive(start: LenientimeParsable, end: LenientimeParsable) {
    return this.isAfter(start) && this.isBefore(end)
  }

  public isBetweenInclusive(min: LenientimeParsable, max: LenientimeParsable) {
    return this.isAfterOrEqual(min) && this.isBeforeOrEqual(max)
  }
}
