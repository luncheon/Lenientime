import LenientimeLike from './lenientime-like'
import parseIntoMilliseconds, { LenientimeParsable } from './parse'
import { LenientimeFormattable, format } from './token'
import {
  DAY_IN_MILLISECONDS, HOUR_IN_MILLISECONDS, MINUTE_IN_MILLISECONDS, SECOND_IN_MILLISECONDS,
  am, ampm, firstFiniteNumberOf, normalizeMillisecondsInOneDay, padEnd, padStart, pm,
} from './utils'

export default class Lenientime implements LenientimeLike, LenientimeFormattable {
  constructor(private _totalMilliseconds: number) {
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
  get am():           boolean { return this.hour < 12 }
  get pm():           boolean { return this.hour >= 12 }

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
  /** Hour string in 1-based 12-hour notation without padding: ["1".."12"] | "-" */
  get h()   { return this.invalid ? '-'   : String(this.hour12) }
  /** Hour string in 1-based 24-hour notation without padding: ["1".."24"] | "-" */
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
  get a(): 'am' | 'pm' | '--' { return this.invalid ? '--'   : this.am ? 'am' : 'pm' }
  /** "AM" | "PM" | "--" */
  get A(): 'AM' | 'PM' | '--' { return this.invalid ? '--'   : this.am ? 'AM' : 'PM' }
  /** "a.m." | "p.m." | "----" */
  get aa(): 'a.m.' | 'p.m.' | '----' { return this.invalid ? '----' : this.am ? 'a.m.' : 'p.m.' }
  /** "A.M." | "P.M." | "----" */
  get AA(): 'A.M.' | 'P.M.' | '----' { return this.invalid ? '----' : this.am ? 'A.M.' : 'P.M.' }

  /** Hour string in 24-hour notation with zero padding: ["00".."23"] | "--" */
  get HH()  { return this.invalid ? '--'   : padStart(this.H, 2, '0') }
  /** Hour string in 24-hour notation with space padding: [" 0".."23"] | "--" */
  get _H()  { return this.invalid ? '--'   : padStart(this.H, 2, ' ') }
  /** Hour string in 1-based 12-hour notation with zero padding: ["01".."12"] | "--" */
  get hh()  { return this.invalid ? '--'   : padStart(this.h, 2, '0') }
  /** hour string in 1-based 12-hour notation with space padding: [" 1".."12"] | "--" */
  get _h()  { return this.invalid ? '--'   : padStart(this.h, 2, ' ') }
  /** Hour string in 1-based 24-hour notation with zero padding: ["01".."24"] | "--" */
  get kk()  { return this.invalid ? '--'   : padStart(this.k, 2, '0') }
  /** Hour string in 1-based 24-hour notation with space padding: [" 1".."24"] | "--" */
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

  get startOfHour()       { return new Lenientime(this._totalMilliseconds - this._totalMilliseconds % HOUR_IN_MILLISECONDS) }
  get startOfMinute()     { return new Lenientime(this._totalMilliseconds - this._totalMilliseconds % MINUTE_IN_MILLISECONDS) }
  get startOfSecond()     { return new Lenientime(this._totalMilliseconds - this._totalMilliseconds % SECOND_IN_MILLISECONDS) }

  public ifInvalid(source: LenientimeParsable) {
    return this.valid ? this : new Lenientime(parseIntoMilliseconds(source))
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
    return format(template, this)
  }

  public with(time: Partial<LenientimeLike>) {
    return new Lenientime(parseIntoMilliseconds({
      h:  firstFiniteNumberOf(time.h, time.hour,        time.hours,         this.hour),
      m:  firstFiniteNumberOf(time.m, time.minute,      time.minutes,       this.minute),
      s:  firstFiniteNumberOf(time.s, time.second,      time.seconds,       this.second),
      S:  firstFiniteNumberOf(time.S, time.millisecond, time.milliseconds,  this.millisecond),
      am: time.am === true || time.pm === false || (time.a === 'am' ? true : time.a === 'pm' ? false : undefined),
    }))
  }

  public plus(time: LenientimeParsable) {
    const totalMilliseconds = parseIntoMilliseconds(time)
    return totalMilliseconds === 0 ? this : new Lenientime(this._totalMilliseconds + totalMilliseconds)
  }

  public minus(time: LenientimeParsable) {
    const totalMilliseconds = parseIntoMilliseconds(time)
    return totalMilliseconds === 0 ? this : new Lenientime(this._totalMilliseconds - totalMilliseconds)
  }

  public equals(another: LenientimeParsable) {
    return this.compareTo(another) === 0
  }

  public compareTo(another: LenientimeParsable) {
    return this._totalMilliseconds - parseIntoMilliseconds(another)
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
