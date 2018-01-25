import { Lenientime } from './lenientime';
export default function lenientime(source) {
    return Lenientime.of(source);
}
lenientime.prototype = Lenientime.prototype;
