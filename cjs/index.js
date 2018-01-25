"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lenientime_1 = require("./lenientime");
function lenientime(source) {
    return lenientime_1.Lenientime.of(source);
}
exports.default = lenientime;
lenientime.prototype = lenientime_1.Lenientime.prototype;
