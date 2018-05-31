import LenientimeLike from './lenientime-like';
export declare type LenientimeParsable = Partial<LenientimeLike> | number | number[] | string;
export default function parseIntoMilliseconds(time: LenientimeParsable): number;
