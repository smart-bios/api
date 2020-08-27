"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = require("mongoose");

var nucleotideSchema = new _mongoose.Schema({
  id: {
    type: String,
    required: [true, "El titulo es necesario"]
  },
  genome: {
    type: _mongoose.Schema.ObjectId,
    ref: 'Genome',
    required: true
  },
  sequence: {
    type: String,
    required: [true, "El titulo es necesario"]
  },
  legth: {
    type: Number
  },
  desc: {
    type: String
  }
}, {
  timestamps: true
});
var Nucleotide = (0, _mongoose.model)('Nucleotide', nucleotideSchema);
var _default = Nucleotide;
exports["default"] = _default;
//# sourceMappingURL=nucleotide.js.map