export interface LenientimeLike {
  readonly hour?:         number
  readonly hours?:        number
  readonly minute?:       number
  readonly minutes?:      number
  readonly second?:       number
  readonly seconds?:      number
  readonly millisecond?:  number
  readonly milliseconds?: number
  readonly am?:           boolean
  readonly pm?:           boolean
}

const    SECOND_IN_MILLISECONDS = 1000
const    MINUTE_IN_MILLISECONDS = SECOND_IN_MILLISECONDS * 60
const      HOUR_IN_MILLISECONDS = MINUTE_IN_MILLISECONDS * 60
const  HALF_DAY_IN_MILLISECONDS =   HOUR_IN_MILLISECONDS * 12
const       DAY_IN_MILLISECONDS =   HOUR_IN_MILLISECONDS * 24

export default class Lenientime {
  public static INVALID  = new Lenientime(NaN)
  public static ZERO     = new Lenientime(0)

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
    }
    return undefined
  }
  public static totalMillisecondsOf(time: LenientimeLike) {
    if (time instanceof Lenientime) {
      return time._totalMilliseconds
    }
    const totalMilliseconds = Lenientime.normalizeMillisecondsInOneDay(
      Lenientime.firstNumberOf(time.  hour, time.  hours, 0)! *   HOUR_IN_MILLISECONDS +
      Lenientime.firstNumberOf(time.minute, time.minutes, 0)! * MINUTE_IN_MILLISECONDS +
      Lenientime.firstNumberOf(time.second, time.seconds, 0)! * SECOND_IN_MILLISECONDS +
      Lenientime.firstNumberOf(time.millisecond, time.milliseconds, 0)!
    )
    if ((time.am === true || time.pm === false) && totalMilliseconds >= HALF_DAY_IN_MILLISECONDS) {
      return totalMilliseconds - HALF_DAY_IN_MILLISECONDS
    }
    if ((time.pm === true || time.am === false) && totalMilliseconds < HALF_DAY_IN_MILLISECONDS) {
      return totalMilliseconds + HALF_DAY_IN_MILLISECONDS
    }
    return totalMilliseconds
  }

  public static normalizeMillisecondsInOneDay(milliseconds: number) {
    const value = Math.floor(milliseconds) % DAY_IN_MILLISECONDS
    return value >= 0 ? value : value + DAY_IN_MILLISECONDS
  }

  public static of(hmsaOrMilliseconds: number | LenientimeLike) {
    if (typeof hmsaOrMilliseconds === 'number') {
      return new Lenientime(Lenientime.normalizeMillisecondsInOneDay(hmsaOrMilliseconds))
    } else if (hmsaOrMilliseconds && typeof hmsaOrMilliseconds === 'object') {
      return new Lenientime(Lenientime.totalMillisecondsOf(hmsaOrMilliseconds))
    } else {
      return Lenientime.INVALID
    }
  }

  public static now() {
    return Lenientime.of(Date.now())
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
      s.match(/^([0-9]*\.[0-9]*)()()(am|pm)?$/i) ||

      // simple integer: complete colons
      //  1           -> 01:00:00.000
      //  12          -> 12:00:00.000
      //  123         -> 01:23:00.000
      //  1234        -> 12:34:00.000
      //  12345       -> 01:23:45.000
      //  123456      -> 12:34:56.000
      //  123456am    -> 00:34:56.000
      s.match(/^([0-9]{1,2})([0-9]{2})?([0-9]{2})?(am|pm)?$/i) ||

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
      s.match(/^([+-]?[0-9]*\.?[0-9]*):([+-]?[0-9]*\.?[0-9]*)(?::([+-]?[0-9]*\.?[0-9]*))?(am|pm)?$/i)
    if (match) {
      return Lenientime.of({
        hour:   match[1] ? parseFloat(match[1]) : 0,
        minute: match[2] ? parseFloat(match[2]) : 0,
        second: match[3] ? parseFloat(match[3]) : 0,
        am:     match[4] ? match[4].toLowerCase() === 'am' ? true : false : undefined,
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
      hour:        Lenientime.firstNumberOf(time.  hour, time.  hours, this.  hour),
      minute:      Lenientime.firstNumberOf(time.minute, time.minutes, this.minute),
      second:      Lenientime.firstNumberOf(time.second, time.seconds, this.second),
      millisecond: Lenientime.firstNumberOf(time.millisecond, time.milliseconds, this.millisecond),
      am:          time.am === true || time.pm === false || undefined,
    })
  }

  public plus(time: LenientimeLike) {
    const totalMilliseconds = Lenientime.totalMillisecondsOf(time)
    return totalMilliseconds === 0 ? this : Lenientime.of(this._totalMilliseconds + totalMilliseconds)
  }

  public minus(time: LenientimeLike) {
    const totalSeconds = Lenientime.totalMillisecondsOf(time)
    return totalSeconds === 0 ? this : Lenientime.of(this.totalSeconds - totalSeconds)
  }

  public equals(time: LenientimeLike) {
    return this.compareTo(time) === 0
  }

  public compareTo(time: LenientimeLike) {
    return this._totalMilliseconds - Lenientime.totalMillisecondsOf(time)
  }

  public isBefore(another: LenientimeLike) {
    return this.compareTo(another) < 0
  }

  public isBeforeOrEqual(another: LenientimeLike) {
    return this.compareTo(another) <= 0
  }

  public isAfter(another: LenientimeLike) {
    return this.compareTo(another) > 0
  }

  public isAfterOrEqual(another: LenientimeLike) {
    return this.compareTo(another) >= 0
  }

  public isBetweenExclusive(start: LenientimeLike, end: LenientimeLike) {
    return this.isAfter(start) && this.isBefore(end)
  }

  public isBetweenInclusive(min: LenientimeLike, max: LenientimeLike) {
    return this.isAfterOrEqual(min) && this.isBeforeOrEqual(max)
  }
}
