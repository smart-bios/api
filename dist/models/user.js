"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = require("mongoose");

var roles = {
  values: ['ADMIN_ROLE', 'USER_ROLE'],
  message: '{VALUE}, rol no valido'
};
var userSchema = new _mongoose.Schema({
  username: {
    type: String,
    required: [true, "El nombre es necesario"]
  },
  email: {
    type: String,
    required: [true, "El email es necesario"],
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    "default": 'USER_ROLE',
    "enum": roles
  },
  state: {
    type: Boolean,
    "default": true
  }
}, {
  timestamps: true
});
var User = (0, _mongoose.model)('User', userSchema);
var _default = User;
exports["default"] = _default;
//# sourceMappingURL=user.js.map