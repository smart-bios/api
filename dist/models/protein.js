"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = require("mongoose");

var proteinSchema = new _mongoose.Schema({
  id: {
    type: String,
    required: [true, "El titulo es necesario"]
  },
  genome: {
    type: _mongoose.Schema.ObjectId,
    ref: 'Genoma',
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
  },
  preferred_name: {
    type: String
  },
  funcional_COG: {
    type: String
  },
  GOs: {
    type: String
  },
  KEGG_ko: {
    type: String
  },
  KEGG_pathway: {
    type: String
  },
  tax_scope: {
    type: String
  },
  best_blast: {
    type: String
  }
}, {
  timestamps: true
}); //proteinaSchema.index({desc: 'text', preferred_name: 'text', GOs: 'text', KEGG_pathway: 'text', KEGG_ko: 'text'});

var Protein = (0, _mongoose.model)('Protein', proteinSchema);
var _default = Protein;
exports["default"] = _default;
//# sourceMappingURL=protein.js.map