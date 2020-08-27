"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _morgan = _interopRequireDefault(require("morgan"));

var _helmet = _interopRequireDefault(require("helmet"));

var _cors = _interopRequireDefault(require("cors"));

var _connectHistoryApiFallback = _interopRequireDefault(require("connect-history-api-fallback"));

var _path = _interopRequireDefault(require("path"));

var _routes = _interopRequireDefault(require("./routes"));

var _expressFileupload = _interopRequireDefault(require("express-fileupload"));

var app = (0, _express["default"])(); //middllewares

app.use((0, _morgan["default"])('tiny'));
app.use(_express["default"].json());
app.use((0, _cors["default"])());
app.use((0, _helmet["default"])());
app.use(_express["default"].urlencoded({
  extended: false
}));
app.use((0, _expressFileupload["default"])()); //Rutas

app.use('/api', _routes["default"]); //Archivos estaticos

app.use((0, _connectHistoryApiFallback["default"])());
app.use(_express["default"]["static"](_path["default"].join(__dirname, '/public'))); //Database

var database = 'red_genomica';
var url = 'mongodb://localhost:27017/' + database;
var option = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
};

_mongoose["default"].connect(url, option).then(function () {
  return console.log("conenctado a base de datos ".concat(database));
})["catch"](function (e) {
  return console.log(e);
});

process.env.PORT = process.env.PORT || 3000;
app.listen(process.env.PORT, function () {
  console.log('Sirviendo en puerto ', process.env.PORT);
});
//# sourceMappingURL=index.js.map