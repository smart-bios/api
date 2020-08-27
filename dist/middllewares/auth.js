"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _token = _interopRequireDefault(require("../services/token"));

var _default = {
  /*
  |--------------------------------------------------------------------------
  | Permiso para todo los usuarios
  |--------------------------------------------------------------------------
  */
  verifyUsuario: function () {
    var _verifyUsuario = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
      var response;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (req.headers.token) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return", res.status(401).send({
                status: 'failed',
                message: 'No posee las credenciales para contiunar'
              }));

            case 2:
              _context.next = 4;
              return _token["default"].decode(req.headers.token);

            case 4:
              response = _context.sent;

              if (!(response.role === 'ADMIN_ROLE' || response.role === 'USER_ROLE')) {
                _context.next = 9;
                break;
              }

              next();
              _context.next = 10;
              break;

            case 9:
              return _context.abrupt("return", res.status(403).send({
                status: 'failed',
                message: 'No tiene los permisos necesarios'
              }));

            case 10:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    function verifyUsuario(_x, _x2, _x3) {
      return _verifyUsuario.apply(this, arguments);
    }

    return verifyUsuario;
  }(),

  /*
  |--------------------------------------------------------------------------
  | Permiso para solo administradores
  |--------------------------------------------------------------------------
  */
  verifyAdministrador: function () {
    var _verifyAdministrador = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res, next) {
      var response;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (req.headers.token) {
                _context2.next = 2;
                break;
              }

              return _context2.abrupt("return", res.status(401).send({
                status: 'failed',
                message: 'No posee las credenciales para contiunar'
              }));

            case 2:
              _context2.next = 4;
              return _token["default"].decode(req.headers.token);

            case 4:
              response = _context2.sent;

              if (!(response.role === 'ADMIN_ROLE')) {
                _context2.next = 9;
                break;
              }

              next();
              _context2.next = 10;
              break;

            case 9:
              return _context2.abrupt("return", res.status(403).send({
                status: 'failed',
                message: 'No tiene los permisos necesarios'
              }));

            case 10:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    function verifyAdministrador(_x4, _x5, _x6) {
      return _verifyAdministrador.apply(this, arguments);
    }

    return verifyAdministrador;
  }()
};
exports["default"] = _default;
//# sourceMappingURL=auth.js.map