import { Lenientime } from './core';
export default function lenientime(source) {
    return Lenientime.of(source);
}
lenientime.prototype = Lenientime.prototype;
