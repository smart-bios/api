"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = require("mongoose");

var genomeSchema = new _mongoose.Schema({
  organismo: {
    type: String
  },
  name: {
    type: String,
    required: true
  },
  tipo: {
    types: String
  },
  description: {
    type: String
  },
  method: {
    type: String,
    "default": 'Illumina PE'
  },
  version: {
    type: String,
    "default": 'v1.0'
  },
  level: {
    type: String,
    "default": 'contig',
    "enum": ['contig', 'scaffold', 'complete']
  },
  contig: {
    type: Number,
    required: true
  },
  size: {
    type: String
  },
  cds: {
    type: String
  },
  genes: {
    type: String
  },
  rRNA: {
    type: String
  },
  tRNA: {
    type: String
  }
}, {
  timestamps: true
});
var Genome = (0, _mongoose.model)('Genome', genomeSchema);
var _default = Genome;
exports["default"] = _default;
//# sourceMappingURL=genome.js.map