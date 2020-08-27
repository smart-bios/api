"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = require("mongoose");

var referenceSchema = new _mongoose.Schema({
  ref: {
    type: String
  },
  taxonomy: {
    type: String
  },
  path: {
    type: String
  },
  index: {
    type: String
  }
}, {
  timestamps: true
});
var Reference = (0, _mongoose.model)('Referencia', referenceSchema);
var _default = Reference;
exports["default"] = _default;
//# sourceMappingURL=reference.js.map