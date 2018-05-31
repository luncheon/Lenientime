import Lenientime from './lenientime';
import { LenientimeParsable } from './parse';
interface lenientime {
    (source?: LenientimeParsable): Lenientime;
    INVALID: Lenientime;
    ZERO: Lenientime;
    now(): Lenientime;
    min(...times: LenientimeParsable[]): Lenientime;
    max(...times: LenientimeParsable[]): Lenientime;
}
declare const lenientime: lenientime;
export default lenientime;
