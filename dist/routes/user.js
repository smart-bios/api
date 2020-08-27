"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _express = require("express");

var _user = _interopRequireDefault(require("../models/user"));

var _auth = _interopRequireDefault(require("../middllewares/auth"));

var _token = _interopRequireDefault(require("../services/token"));

var _bcrypt = _interopRequireDefault(require("bcrypt"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var ruta = (0, _express.Router)();
/*
|--------------------------------------------------------------------------
| Add user
|--------------------------------------------------------------------------
*/

ruta.post('/add', _auth["default"].verifyAdministrador, /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var body, user_email, new_user;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            //ruta.post('/add', async(req, res) => {
            body = req.body;
            _context.prev = 1;
            _context.next = 4;
            return _user["default"].findOne({
              email: req.body.email
            });

          case 4:
            user_email = _context.sent;

            if (user_email) {
              _context.next = 15;
              break;
            }

            _context.next = 8;
            return _bcrypt["default"].hash(body.password, 10);

          case 8:
            body.password = _context.sent;
            _context.next = 11;
            return _user["default"].create(body);

          case 11:
            new_user = _context.sent;

            _fs["default"].mkdir(_path["default"].join(__dirname, "../../storage/".concat(new_user._id, "/fastqc")), {
              recursive: true
            }, function (err) {
              if (err) {
                res.status(500).json({
                  status: 'failed',
                  message: 'No se pudo registrar el usuario',
                  err: err
                });
              }

              res.json({
                status: 'success',
                message: 'Usuario registrado en la base de datos'
              });
            });

            _context.next = 16;
            break;

          case 15:
            res.json({
              status: 'failed',
              message: 'El email ya esta registrado en la base de datos'
            });

          case 16:
            _context.next = 21;
            break;

          case 18:
            _context.prev = 18;
            _context.t0 = _context["catch"](1);
            res.status(500).json({
              status: 'failed',
              message: 'No se a podido registrar el usuario',
              error: _context.t0
            });

          case 21:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 18]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

ruta.post('/login', /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var user, match, payload, tokenReturn;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return _user["default"].findOne({
              email: req.body.email,
              state: true
            });

          case 3:
            user = _context2.sent;

            if (!user) {
              _context2.next = 11;
              break;
            }

            _context2.next = 7;
            return _bcrypt["default"].compare(req.body.password, user.password);

          case 7:
            match = _context2.sent;

            if (match) {
              payload = {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                state: user.state
              };
              tokenReturn = _token["default"].encode(payload);
              res.status(200).json({
                status: 'success',
                token: tokenReturn
              });
            } else {
              res.status(401).json({
                status: 'failed',
                message: "Username or password is incorrect"
              });
            }

            _context2.next = 12;
            break;

          case 11:
            res.status(401).json({
              status: 'failed',
              message: 'This user does not exist!'
            });

          case 12:
            _context2.next = 17;
            break;

          case 14:
            _context2.prev = 14;
            _context2.t0 = _context2["catch"](0);
            res.status(500).json({
              status: 'failed',
              message: 'Unable to Sign In',
              error: _context2.t0
            });

          case 17:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 14]]);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
/*
|--------------------------------------------------------------------------
| Delete user
|--------------------------------------------------------------------------
*/

ruta["delete"]('/delete/:id', _auth["default"].verifyAdministrador, /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var _id, user;

    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _id = req.params.id;
            _context3.prev = 1;
            _context3.next = 4;
            return _user["default"].findByIdAndDelete({
              _id: _id
            });

          case 4:
            user = _context3.sent;

            _fs["default"].rmdir(_path["default"].join(__dirname, '../../storage/' + user._id), {
              recursive: true
            }, function (error) {
              if (error) {
                res.status(500).json({
                  status: 'failed',
                  message: 'No se puede eliminar al ususario',
                  error: error
                });
              }

              res.json({
                status: 'success',
                messague: 'usuario eliminado'
              });
            });

            _context3.next = 11;
            break;

          case 8:
            _context3.prev = 8;
            _context3.t0 = _context3["catch"](1);
            res.status(500).json({
              status: 'failed',
              message: 'No se puede eliminar al ususario',
              error: _context3.t0
            });

          case 11:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[1, 8]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
var _default = ruta;
exports["default"] = _default;
//# sourceMappingURL=user.js.map