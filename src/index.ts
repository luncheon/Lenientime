export interface LenientimeLike {
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
  readonly am?:           boolean
  readonly pm?:           boolean
  readonly a?:            'am' | 'pm' | 'AM' | 'PM' | '--'
}

export type LenientimeParsable = Lenientime | LenientimeLike | number | number[] | string

const    SECOND_IN_MILLISECONDS = 1000
const    MINUTE_IN_MILLISECONDS = SECOND_IN_MILLISECONDS * 60
const      HOUR_IN_MILLISECONDS = MINUTE_IN_MILLISECONDS * 60
const  HALF_DAY_IN_MILLISECONDS =   HOUR_IN_MILLISECONDS * 12
const       DAY_IN_MILLISECONDS =   HOUR_IN_MILLISECONDS * 24

export default class Lenientime implements LenientimeLike {
  public static INVALID  = new Lenientime(NaN)
  public static ZERO     = new Lenientime(0)

  public static of(source: LenientimeParsable): Lenientime {
    if (source instanceof Lenientime) {
      return source
    } else if (typeof source === 'number') {
      return new Lenientime(Lenientime._normalizeMillisecondsInOneDay(source))
    } else if (typeof source === 'string') {
      return Lenientime.parse(source)
    } else if (source && typeof source === 'object') {
      return new Lenientime(Lenientime._totalMillisecondsOf(source))
    } else {
      return Lenientime.INVALID
    }
  }

  public static now() {
    return Lenientime.of(Date.now())
  }

  public static min(...times: LenientimeParsable[]): Lenientime
  public static min() {
    return this.reduce(arguments, (min, current) => min.invalid || current.isBefore(min) ? current : min)
  }

  public static max(...times: LenientimeParsable[]): Lenientime
  public static max() {
    return this.reduce(arguments, (max, current) => max.invalid || current.isAfter(max) ? current : max)
  }

  public static reduce<TLenientimeArrayLike extends ArrayLike<LenientimeParsable>>(
    source: TLenientimeArrayLike,
    callback: (previousValue: Lenientime, currentValue: Lenientime, currentIndex: number, source: TLenientimeArrayLike) => Lenientime,
    initialValue = Lenientime.INVALID
  ) {
    let result = initialValue
    for (let i = 0, len = source.length; i < len; i++) {
      const current = Lenientime.of(source[i])
      if (current.valid) {
        result = callback(result, current, i, source)
      }
    }
    return result
  }

  public static padStart(source: any, maxLength: number, pad?: string) {
    source = String(source)
    if (!maxLength || !isFinite(maxLength) || source.length >= maxLength) {
      return source
    }
    return Lenientime._pad(maxLength - source.length, pad) + source
  }

  public static padEnd(source: any, maxLength: number, pad?: string) {
    source = String(source)
    if (!maxLength || !isFinite(maxLength) || source.length >= maxLength) {
      return source
    }
    return source + Lenientime._pad(maxLength - source.length, pad)
  }

  public static _pad(padLength: number, pad?: string) {
    pad = pad === undefined || pad === null || pad === '' ? ' ' : String(pad)
    let paddings = pad
    while (paddings.length < padLength) {
      paddings += pad
    }
    return paddings.substr(0, padLength)
  }

  public static firstNumberOf(...args: (any | undefined)[]) {
    for (const value of args) {
      if (typeof value === 'number') {
        return value
      }
      if (typeof value === 'string') {
        const parsed = parseFloat(value)
        if (isFinite(parsed)) {
          return parsed
        }
      }
    }
    return undefined
  }

  public static _totalMillisecondsOf(time: LenientimeParsable) {
    if (time instanceof Lenientime) {
      return (time as Lenientime)._totalMilliseconds
    }
    if (typeof time === 'number') {
      return time
    }
    if (typeof time === 'string') {
      return Lenientime.parse(time)._totalMilliseconds
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
      const totalMilliseconds = Lenientime._normalizeMillisecondsInOneDay(
        Lenientime.firstNumberOf(time.h, time.  hour, time.  hours, 0)! *   HOUR_IN_MILLISECONDS +
        Lenientime.firstNumberOf(time.m, time.minute, time.minutes, 0)! * MINUTE_IN_MILLISECONDS +
        Lenientime.firstNumberOf(time.s, time.second, time.seconds, 0)! * SECOND_IN_MILLISECONDS +
        Lenientime.firstNumberOf(time.ms, time.S, time.millisecond, time.milliseconds, 0)!
      )
      const a = String(time.a).toLowerCase()
      if ((time.am === true || time.pm === false || a === 'am') && totalMilliseconds >= HALF_DAY_IN_MILLISECONDS) {
        return totalMilliseconds - HALF_DAY_IN_MILLISECONDS
      }
      if ((time.pm === true || time.am === false || a === 'pm') && totalMilliseconds < HALF_DAY_IN_MILLISECONDS) {
        return totalMilliseconds + HALF_DAY_IN_MILLISECONDS
      }
      return totalMilliseconds
    }
    return NaN
  }

  public static _normalizeMillisecondsInOneDay(milliseconds: number) {
    const value = Math.floor(milliseconds) % DAY_IN_MILLISECONDS
    return value >= 0 ? value : value + DAY_IN_MILLISECONDS
  }

  public static parse(s: string) {
    s = s && String(s)
      .replace(/\s/g, '')
      // fullwidth -> halfwidth
      .replace(/[\uff00-\uffef]/g, token => String.fromCharCode(token.charCodeAt(0) - 0xfee0))
    if (!s) {
      return Lenientime.ZERO
    }
    const match =
      // simple decimal: assume as hour
      s.match(/^([0-9]*\.[0-9]*)()()()(am|pm)?$/i) ||

      // simple integer: complete colons
      //  1           -> 01:00:00.000
      //  12          -> 12:00:00.000
      //  123         -> 01:23:00.000
      //  1234        -> 12:34:00.000
      //  12345       -> 01:23:45.000
      //  123456      -> 12:34:56.000
      //  1234567     -> 12:34:56.700
      //  12345678    -> 12:34:56.780
      //  123456789   -> 12:34:56.789
      //  1pm         -> 13:00:00.000
      //  123456am    -> 00:34:56.000
      s.match(/^([0-9]{1,2})([0-9]{2})?([0-9]{2})?([0-9]*)(am|pm)?$/i) ||

      // colons included: split parts
      //  1:          -> 01:00:00.000
      //  12:         -> 12:00:00.000
      //  123:        -> 03:00:00.000
      //  1.5:        -> 01:30:00.000
      //  -1:         -> 23:00:00.000
      //  12:34:56pm  -> 12:34:56.000
      //  11:23:45pm  -> 23:23:45.000
      //  12:34:56    -> 12:34:56.000
      //  12:34:      -> 12:34:00.000
      //  12:34       -> 12:34:00.000
      //  1234:       -> 12:34:00.000
      //  12::        -> 12:00:00.000
      //  12:         -> 12:00:00.000
      s.match(/^([+-]?[0-9]*\.?[0-9]*):([+-]?[0-9]*\.?[0-9]*)(?::([+-]?[0-9]*\.?[0-9]*))?()(am|pm)?$/i)
    if (match) {
      return Lenientime.of({
        h:  match[1] ? parseFloat(match[1]) : 0,
        m:  match[2] ? parseFloat(match[2]) : 0,
        s:  match[3] ? parseFloat(match[3]) : 0,
        ms: match[4] ? parseFloat('0.' + match[4]) * 1000 : 0,
        am: match[5] ? match[5].toLowerCase() === 'am' ? true : false : undefined,
      })
    }
    return Lenientime.INVALID
  }

  private constructor(private _totalMilliseconds: number) {
  }

  get hour():         number { return Math.floor(this._totalMilliseconds / HOUR_IN_MILLISECONDS) }
  get hour12():       number { return (this.hour + 11) % 12 + 1 }
  get minute():       number { return Math.floor(this._totalMilliseconds % HOUR_IN_MILLISECONDS / MINUTE_IN_MILLISECONDS) }
  get second():       number { return Math.floor(this._totalMilliseconds % MINUTE_IN_MILLISECONDS / SECOND_IN_MILLISECONDS) }
  get millisecond():  number { return this._totalMilliseconds % SECOND_IN_MILLISECONDS }
  get am():          boolean { return this.hour < 12 }
  get pm():          boolean { return this.hour >= 12 }

  get hours()        { return this.hour }
  get hours12()      { return this.hour12 }
  get minutes()      { return this.minute }
  get seconds()      { return this.second }
  get milliseconds() { return this.millisecond }

  get H()   { return this.invalid ? '-'   : String(this.hour) }
  get h()   { return this.invalid ? '-'   : String(this.hour12) }
  get k()   { return this.invalid ? '-'   : String((this.hour + 23) % 24 + 1) }
  get m()   { return this.invalid ? '-'   : String(this.minute) }
  get s()   { return this.invalid ? '-'   : String(this.second) }
  get S()   { return this.invalid ? '-'   : String(Math.floor(this.millisecond / 100)) }
  get SS()  { return this.invalid ? '--'  : String(Lenientime.padEnd(Math.floor(this.millisecond / 10), 2, '0')) }
  get SSS() { return this.invalid ? '---' : String(Lenientime.padEnd(this.millisecond, 3, '0')) }

  get a()   { return this.invalid ? '--'   : this.am ? 'am' : 'pm' }
  get A()   { return this.invalid ? '--'   : this.am ? 'AM' : 'PM' }
  get aa()  { return this.invalid ? '----' : this.am ? 'a.m.' : 'p.m.' }
  get AA()  { return this.invalid ? '----' : this.am ? 'A.M.' : 'P.M.' }

  get HH()  { return this.invalid ? '--'   : Lenientime.padStart(this.H, 2, '0') }
  get _H()  { return this.invalid ? '--'   : Lenientime.padStart(this.H, 2, ' ') }
  get hh()  { return this.invalid ? '--'   : Lenientime.padStart(this.h, 2, '0') }
  get _h()  { return this.invalid ? '--'   : Lenientime.padStart(this.h, 2, ' ') }
  get kk()  { return this.invalid ? '--'   : Lenientime.padStart(this.k, 2, '0') }
  get _k()  { return this.invalid ? '--'   : Lenientime.padStart(this.k, 2, ' ') }
  get mm()  { return this.invalid ? '--'   : Lenientime.padStart(this.m, 2, '0') }
  get _m()  { return this.invalid ? '--'   : Lenientime.padStart(this.m, 2, ' ') }
  get ss()  { return this.invalid ? '--'   : Lenientime.padStart(this.s, 2, '0') }
  get _s()  { return this.invalid ? '--'   : Lenientime.padStart(this.s, 2, ' ') }

  get HHmm()      { return this.HH     + ':' + this.mm }
  get HHmmss()    { return this.HHmm   + ':' + this.ss }
  get HHmmssSSS() { return this.HHmmss + '.' + this.SSS }

  get totalMilliseconds() { return this._totalMilliseconds }
  get totalSeconds()      { return Math.floor(this._totalMilliseconds / SECOND_IN_MILLISECONDS) }
  get totalMinutes()      { return Math.floor(this._totalMilliseconds / MINUTE_IN_MILLISECONDS) }

  get valid() { return 0 <= this._totalMilliseconds && this._totalMilliseconds < DAY_IN_MILLISECONDS }
  get invalid() { return !this.valid }

  get startOfHour()   { return Lenientime.of(this._totalMilliseconds - this._totalMilliseconds % HOUR_IN_MILLISECONDS) }
  get startOfMinute() { return Lenientime.of(this._totalMilliseconds - this._totalMilliseconds % MINUTE_IN_MILLISECONDS) }
  get startOfSecond() { return Lenientime.of(this._totalMilliseconds - this._totalMilliseconds % SECOND_IN_MILLISECONDS) }

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
      h:  Lenientime.firstNumberOf(time.h, time.  hour, time.  hours, this.  hour),
      m:  Lenientime.firstNumberOf(time.m, time.minute, time.minutes, this.minute),
      s:  Lenientime.firstNumberOf(time.s, time.second, time.seconds, this.second),
      ms: Lenientime.firstNumberOf(time.ms, time.S, time.millisecond, time.milliseconds, this.millisecond),
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
