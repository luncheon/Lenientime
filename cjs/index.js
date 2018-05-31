"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("./core");
exports.default = core_1.default;
var adjust_on_arrow_keys_1 = require("./input-helpers/adjust-on-arrow-keys");
var complete_1 = require("./input-helpers/complete");
adjust_on_arrow_keys_1.default();
complete_1.default();
