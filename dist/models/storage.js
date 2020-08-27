"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = require("mongoose");

var storageSchema = new _mongoose.Schema({
  user: {
    type: _mongoose.Schema.ObjectId,
    ref: 'User'
  },
  filename: {
    type: String
  },
  path: {
    type: String
  },
  description: {
    type: String
  },
  category: {
    type: String,
    "enum": ["fastq", "fasta", "csv"]
  },
  type: {
    type: String,
    "default": "uploaded",
    "enum": ['uploaded', 'result']
  }
}, {
  timestamps: true
});
var Storage = (0, _mongoose.model)('Storage', storageSchema);
var _default = Storage;
exports["default"] = _default;
//# sourceMappingURL=storage.js.map