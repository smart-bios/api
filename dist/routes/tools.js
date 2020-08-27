"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _express = require("express");

var _biotools = _interopRequireDefault(require("../services/biotools"));

var ruta = (0, _express.Router)();
/*
|--------------------------------------------------------------------------
| blast
|--------------------------------------------------------------------------
*/

ruta.post('/blast', function (req, res) {
  var params = {
    type_blast: req.body.type,
    query: req.body.seq,
    database: req.body.db,
    max_target_seqs: req.body.max_target_seqs
  };

  try {
    _biotools["default"].blast(params, function (err, output) {
      if (err) {
        return res.json({
          error: err
        });
      }

      res.json({
        status: 'success',
        message: 'Loading..',
        blast: output
      });
    });
  } catch (error) {
    res.status(500).json({
      status: 'failed',
      error: error
    });
  }
});
/*
|--------------------------------------------------------------------------
| In silico PCR
|--------------------------------------------------------------------------
*/

ruta.post('/in_silico_pcr', function (req, res) {
  var params = {
    input: "/srv/ftp/Pseudomonas/".concat(req.body.seq, "/").concat(req.body.seq).concat(req.body.target),
    forward: req.body.forward,
    reverse: req.body.reverse
  };

  try {
    _biotools["default"].in_silico_pcr(params, function (err, result, amplicons) {
      if (err) {
        return res.json({
          error: err
        });
      }

      res.json({
        status: 'success',
        result: result,
        amplicons: amplicons
      });
    });
  } catch (error) {
    res.status(500).json({
      status: 'failed',
      error: error
    });
  }
});
/*
|--------------------------------------------------------------------------
| Fastqc
|--------------------------------------------------------------------------
*/

ruta.post('/fastqc', /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            try {
              _biotools["default"].fastqc(req.body, function (err, result) {
                if (err) {
                  res.json({
                    status: 'failed',
                    message: 'Fastqc failed',
                    error: err
                  });
                }

                res.json({
                  status: 'success',
                  message: 'Fastqc complete',
                  result: result
                });
              });
            } catch (error) {
              res.status(500).json({
                status: 'failed',
                error: error
              });
            }

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
var _default = ruta;
exports["default"] = _default;
//# sourceMappingURL=tools.js.map