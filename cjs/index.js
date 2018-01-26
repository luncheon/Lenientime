"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("./core");
function lenientime(source) {
    return core_1.Lenientime.of(source);
}
exports.default = lenientime;
lenientime.prototype = core_1.Lenientime.prototype;
