"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _user = _interopRequireDefault(require("./user"));

var _file = _interopRequireDefault(require("./file"));

var _tools = _interopRequireDefault(require("./tools"));

var _sequence = _interopRequireDefault(require("./sequence"));

var _genomes = _interopRequireDefault(require("./genomes"));

var ruta = _express["default"].Router();

ruta.use('/user', _user["default"]);
ruta.use('/storage', _file["default"]);
ruta.use('/tools', _tools["default"]);
ruta.use('/seq', _sequence["default"]);
ruta.use('/genome', _genomes["default"]);
var _default = ruta;
exports["default"] = _default;
//# sourceMappingURL=index.js.map