"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _express = require("express");

var _protein = _interopRequireDefault(require("../models/protein"));

var _nucleotide = _interopRequireDefault(require("../models/nucleotide"));

var ruta = (0, _express.Router)();
/*
|--------------------------------------------------------------------------
| Buscar secuencias anotadas por texto libre
|--------------------------------------------------------------------------
*/

ruta.get('/search/:text', /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var _text, resultados;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _text = req.params.text;
            _context.next = 4;
            return _protein["default"].find({
              $or: [{
                id: {
                  $regex: _text,
                  $options: 'i'
                }
              }, {
                desc: {
                  $regex: _text,
                  $options: 'i'
                }
              }, {
                preferred_name: {
                  $regex: _text,
                  $options: 'i'
                }
              }, {
                funcional_COG: {
                  $regex: _text,
                  $options: 'i'
                }
              }, {
                KEGG_pathway: {
                  $regex: _text,
                  $options: 'i'
                }
              }]
            });

          case 4:
            resultados = _context.sent;

            if (resultados.length > 0) {
              res.json({
                resultados: resultados,
                cantidad: resultados.length,
                status: "success",
                message: "".concat(_text, " encontrado")
              });
            } else {
              res.json({
                resultados: resultados,
                cantidad: resultados.length,
                status: "success",
                message: "No se encontro ".concat(_text)
              });
            }

            _context.next = 11;
            break;

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](0);
            res.status(500).json({
              status: "failed",
              message: "Error buscando ".concat(text)
            });

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 8]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
/*
|--------------------------------------------------------------------------
| Obteber secuencia X
|--------------------------------------------------------------------------
*/

ruta.get('/:id', /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var _id, seq;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _id = req.params.id;
            _context2.next = 4;
            return _protein["default"].findOne({
              id: _id
            });

          case 4:
            seq = _context2.sent;
            res.json({
              status: "success",
              message: "secuencia: ".concat(_id),
              seq: seq
            });
            _context2.next = 11;
            break;

          case 8:
            _context2.prev = 8;
            _context2.t0 = _context2["catch"](0);
            res.status(500).json({
              status: "failed",
              message: "Error al obtener".concat(id),
              error: _context2.t0
            });

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 8]]);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
ruta.get('/nucl/:id', /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var _id2, seq;

    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _id2 = req.params.id;
            _context3.next = 4;
            return _nucleotide["default"].findOne({
              id: _id2
            }, {
              sequence: 1
            });

          case 4:
            seq = _context3.sent;
            res.json({
              status: "success",
              message: "secuencia: ".concat(_id2),
              seq: seq
            });
            _context3.next = 11;
            break;

          case 8:
            _context3.prev = 8;
            _context3.t0 = _context3["catch"](0);
            res.status(500).json({
              status: "failed",
              message: "Error al obtener".concat(id),
              error: _context3.t0
            });

          case 11:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 8]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
var _default = ruta;
exports["default"] = _default;
//# sourceMappingURL=sequence.js.map