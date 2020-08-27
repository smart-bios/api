"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _express = require("express");

var _storage = _interopRequireDefault(require("../models/storage"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var ruta = (0, _express.Router)();
var extensions = ['fasta', 'faa', 'ffn', 'fna', 'fa', 'fastq', 'fq', 'gz', 'tsv', 'cvs'];
/*
|--------------------------------------------------------------------------
| Upload file whith express-fileupload 
|--------------------------------------------------------------------------
*/

ruta.post('/upload', function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(406).json({
      status: 'failed',
      message: 'No files were uploaded.'
    });
  }

  var sampleFile = req.files.file;
  var file_name = sampleFile.name.split('.');
  var extension = file_name[file_name.length - 1];

  if (extensions.indexOf(extension) < 0) {
    res.status(400).json({
      status: 'failed',
      message: 'La extension del archivo no es valida'
    });
  }

  var upload = {
    user: req.body.id,
    filename: sampleFile.name,
    path: "storage/".concat(req.body.id, "/").concat(sampleFile.name),
    description: req.body.description,
    category: req.body.category
  };
  sampleFile.mv(upload.path, function (err) {
    if (err) {
      return res.status(500).json({
        status: 'failes',
        message: 'No se pudo subier el archivo',
        err: err
      });
    }

    _storage["default"].create(upload, function (err, result) {
      res.json({
        status: 'success',
        message: 'Archivo recibido',
        result: result
      });
    });
  });
});
/*
|--------------------------------------------------------------------------
| List all files 
|--------------------------------------------------------------------------
*/

ruta.get("/list/:id", /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var _id, result;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _id = req.params.id;
            _context.next = 4;
            return _storage["default"].find({
              user: _id
            });

          case 4:
            result = _context.sent;
            res.json({
              status: 'success',
              files: result
            });
            _context.next = 11;
            break;

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](0);
            res.json({
              status: 'failed',
              error: _context.t0
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
| List files by category 
|--------------------------------------------------------------------------
*/

ruta.post("/list", /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var result;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return _storage["default"].find({
              user: req.body.user,
              category: req.body.category
            });

          case 3:
            result = _context2.sent;
            res.json({
              status: 'success',
              result: result
            });
            _context2.next = 10;
            break;

          case 7:
            _context2.prev = 7;
            _context2.t0 = _context2["catch"](0);
            res.json({
              status: 'failed',
              error: _context2.t0
            });

          case 10:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 7]]);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
/*
|--------------------------------------------------------------------------
| Delete file
|--------------------------------------------------------------------------
*/

ruta["delete"]('/delete/:id', /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var _id, file, name;

    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _id = req.params.id;
            _context3.next = 3;
            return _storage["default"].findOne({
              _id: _id
            });

          case 3:
            file = _context3.sent;
            _context3.next = 6;
            return _storage["default"].findByIdAndDelete({
              _id: _id
            });

          case 6:
            name = _context3.sent;

            _fs["default"].unlink(file.path, function (err) {
              if (err) {
                return res.json({
                  status: 'failed',
                  err: err
                });
              }

              res.json({
                status: 'success',
                path: name.file_name
              });
            });

          case 8:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
/*
|--------------------------------------------------------------------------
| Download file
|--------------------------------------------------------------------------
*/

ruta.get('/download/:id', /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var _id;

    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _id = req.params.id;

            _storage["default"].findOne({
              _id: _id
            }, function (err, file) {
              if (err) {
                res.status(406).json({
                  status: 'failed',
                  err: err
                });
              }

              res.setHeader('Content-Disposition', 'attachment');
              res.header("Cache-Control", "no-cache, no-store, must-revalidate");
              res.header("Pragma", "no-cache");
              res.header("Expires", 0);

              var file_path = _path["default"].join(__dirname, "../../".concat(file.path));

              res.download(file_path, function (err) {
                if (err) {
                  res.status(406).json({
                    status: 'failed',
                    err: err
                  });
                }

                console.log('Your file has been downloaded!');
              });
            });

          case 2:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}());
var _default = ruta;
exports["default"] = _default;
//# sourceMappingURL=file.js.map