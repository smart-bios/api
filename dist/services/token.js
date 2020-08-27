"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _user = _interopRequireDefault(require("../models/user"));

process.env.SECRET_KEY = "australopitecus";
var _default = {
  /*
  |--------------------------------------------------------------------------
  | Generar token para usuario logeado
  | --------------------------------------------------------------------------
  |
   */
  encode: function encode(payload) {
    var token = _jsonwebtoken["default"].sign(payload, process.env.SECRET_KEY, {
      expiresIn: 60 * 60 * 24 // expires in 24 hours

    });

    return token;
  },

  /*
  |--------------------------------------------------------------------------
  | Decodificar el token
  | --------------------------------------------------------------------------
  |
   */
  decode: function () {
    var _decode = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(token) {
      var _jwt$verify, _id, user;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _jwt$verify = _jsonwebtoken["default"].verify(token, process.env.SECRET_KEY), _id = _jwt$verify._id;
              _context.next = 4;
              return _user["default"].findOne({
                _id: _id,
                state: true
              });

            case 4:
              user = _context.sent;

              if (!user) {
                _context.next = 9;
                break;
              }

              return _context.abrupt("return", user);

            case 9:
              return _context.abrupt("return", false);

            case 10:
              _context.next = 15;
              break;

            case 12:
              _context.prev = 12;
              _context.t0 = _context["catch"](0);
              return _context.abrupt("return", false);

            case 15:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 12]]);
    }));

    function decode(_x) {
      return _decode.apply(this, arguments);
    }

    return decode;
  }()
};
exports["default"] = _default;
//# sourceMappingURL=token.js.map