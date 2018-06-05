import LenientimeLike from './lenientime-like';
import { LenientimeParsable } from './parse';
import { LenientimeFormattable } from './token';
export default class Lenientime implements LenientimeLike, LenientimeFormattable {
    private _totalMilliseconds;
    constructor(_totalMilliseconds: number);
    /** Numeric hour in 24-hour clock: [0..23] */
    readonly hour: number;
    /** Numeric hour in 1-based 12-hour clock: [1..12] */
    readonly hour12: number;
    /** Numeric minute: [0..59] */
    readonly minute: number;
    /** Numeric second: [0..59] */
    readonly second: number;
    /** Numeric millisecond: [0..999] */
    readonly millisecond: number;
    readonly am: boolean;
    readonly pm: boolean;
    /** Alias for [[hour]] */
    readonly hours: number;
    /** Alias for [[hour12]] */
    readonly hours12: number;
    /** Alias for [[minute]] */
    readonly minutes: number;
    /** Alias for [[second]] */
    readonly seconds: number;
    /** Alias for [[millisecond]] */
    readonly milliseconds: number;
    /** Hour string in 24-hour notation without padding: ["0".."23"] | "-" */
    readonly H: string;
    /** Hour string in 1-based 12-hour notation without padding: ["1".."12"] | "-" */
    readonly h: string;
    /** Hour string in 1-based 24-hour notation without padding: ["1".."24"] | "-" */
    readonly k: string;
    /** Minute string without padding: ["0".."59"] | "-" */
    readonly m: string;
    /** Second string without padding: ["0".."59"] | "-" */
    readonly s: string;
    /** 1 fractional digit string of second: ["0".."9"] | "-" */
    readonly S: string;
    /** 2 fractional digits string of second: ["00".."99"] | "--" */
    readonly SS: any;
    /** 3 fractional digits string of second: ["000".."999"] | "---" */
    readonly SSS: any;
    /** "am" | "pm" | "--" */
    readonly a: 'am' | 'pm' | '--';
    /** "AM" | "PM" | "--" */
    readonly A: 'AM' | 'PM' | '--';
    /** "a.m." | "p.m." | "----" */
    readonly aa: 'a.m.' | 'p.m.' | '----';
    /** "A.M." | "P.M." | "----" */
    readonly AA: 'A.M.' | 'P.M.' | '----';
    /** Hour string in 24-hour notation with zero padding: ["00".."23"] | "--" */
    readonly HH: any;
    /** Hour string in 24-hour notation with space padding: [" 0".."23"] | "--" */
    readonly _H: any;
    /** Hour string in 1-based 12-hour notation with zero padding: ["01".."12"] | "--" */
    readonly hh: any;
    /** hour string in 1-based 12-hour notation with space padding: [" 1".."12"] | "--" */
    readonly _h: any;
    /** Hour string in 1-based 24-hour notation with zero padding: ["01".."24"] | "--" */
    readonly kk: any;
    /** Hour string in 1-based 24-hour notation with space padding: [" 1".."24"] | "--" */
    readonly _k: any;
    /** Minute string with zero padding: ["00".."59"] | "--" */
    readonly mm: any;
    /** Minute string with space padding: [" 0".."59"] | "--" */
    readonly _m: any;
    /** Second string with zero padding: ["00".."59"] | "--" */
    readonly ss: any;
    /** Second string with space padding: [" 0".."59"] | "--" */
    readonly _s: any;
    readonly HHmm: string;
    readonly HHmmss: string;
    readonly HHmmssSSS: string;
    readonly totalMilliseconds: number;
    readonly totalSeconds: number;
    readonly totalMinutes: number;
    readonly valid: boolean;
    readonly invalid: boolean;
    readonly startOfHour: Lenientime;
    readonly startOfMinute: Lenientime;
    readonly startOfSecond: Lenientime;
    ifInvalid(source: LenientimeParsable): Lenientime;
    startOf(unit: 'hour' | 'minute' | 'second'): Lenientime;
    toString(): string;
    format(template: string): string;
    with(time: Partial<LenientimeLike>): Lenientime;
    plus(time: LenientimeParsable): Lenientime;
    minus(time: LenientimeParsable): Lenientime;
    equals(another: LenientimeParsable): boolean;
    compareTo(another: LenientimeParsable): number;
    isBefore(another: LenientimeParsable): boolean;
    isBeforeOrEqual(another: LenientimeParsable): boolean;
    isAfter(another: LenientimeParsable): boolean;
    isAfterOrEqual(another: LenientimeParsable): boolean;
    isBetweenExclusive(start: LenientimeParsable, end: LenientimeParsable): boolean;
    isBetweenInclusive(min: LenientimeParsable, max: LenientimeParsable): boolean;
}
