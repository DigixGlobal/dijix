'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _extends3 = require('babel-runtime/helpers/extends');

var _extends4 = _interopRequireDefault(_extends3);

require('isomorphic-fetch');

var _ipfs = require('./ipfs');

var _ipfs2 = _interopRequireDefault(_ipfs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* globals fetch */
var pluginKeys = ['populated', 'created', 'uploaded', 'fetched', 'read', 'ipfsHashAdded'];

var endPoints = typeof window === 'undefined' ? {
  ipfsEndpoint: 'http://localhost:5001',
  httpEndpoint: 'http://localhost:8080/ipfs'
} : {
  ipfsEndpoint: 'https://ipfs.infura.io:5001',
  httpEndpoint: 'https://ipfs.infura.io/ipfs'
};

var defaultConfig = (0, _extends4.default)({}, endPoints, {
  concurrency: 10
});

var Dijix = function () {
  function Dijix(config) {
    (0, _classCallCheck3.default)(this, Dijix);

    this.setConfig(config);
  }

  (0, _createClass3.default)(Dijix, [{
    key: 'setConfig',
    value: function setConfig() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var plugins = _ref.plugins,
          types = _ref.types,
          config = (0, _objectWithoutProperties3.default)(_ref, ['plugins', 'types']);

      this.config = (0, _extends4.default)({}, this.config || defaultConfig, config);
      if (!this.ipfs && this.config.ipfsEndpoint || config.ipfsEndpoint) {
        this.ipfs = new _ipfs2.default(this);
      }
      if (plugins) {
        this.registerPlugins(plugins);
      }
      if (types) {
        this.registerTypes(types);
      }
    }
  }, {
    key: 'registerPlugins',
    value: function registerPlugins(plugins) {
      var _this = this;

      if (!Array.isArray(plugins)) {
        throw new Error('Plugins must be an array');
      }
      if (this.plugins) {
        throw new Error('Plugins already defined');
      }
      this.plugins = {};
      plugins.forEach(function (p) {
        return pluginKeys.forEach(function (k) {
          if (p[k]) {
            _this.plugins[k] = (_this.plugins[k] || []).concat([function () {
              return p[k].apply(p, arguments);
            }]);
          }
        });
      });
    }
  }, {
    key: 'registerTypes',
    value: function registerTypes(types) {
      if (!Array.isArray(types)) {
        throw new Error('Invalid Types');
      }
      types.forEach(function (t) {
        if (!t.type) {
          throw new Error('Invalid type ' + t + '\')');
        }
      });
      this.types = types.reduce(function (o, t) {
        return (0, _extends4.default)({}, o, (0, _defineProperty3.default)({}, t.type, t));
      }, this.types || {});
    }
  }, {
    key: 'populateHeaders',
    value: function populateHeaders(type) {
      return {
        type: type,
        created: new Date().getTime(),
        schema: this.types[type].schema || '0.0.1'
      };
    }
  }, {
    key: 'creationPipeline',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(payload, type) {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt('return', type.creationPipeline ? type.creationPipeline(payload, this) : {});

              case 1:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function creationPipeline(_x4, _x5) {
        return _ref2.apply(this, arguments);
      }

      return creationPipeline;
    }()
  }, {
    key: 'readPipeline',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(dijixObject, opts) {
        var type;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                type = dijixObject.type && this.types[dijixObject.type];
                return _context2.abrupt('return', type.readPipeline ? type.readPipeline(dijixObject, this, opts) : dijixObject);

              case 2:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function readPipeline(_x6, _x7) {
        return _ref3.apply(this, arguments);
      }

      return readPipeline;
    }()
  }, {
    key: 'emit',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(stage) {
        var _this2 = this;

        var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var plugins;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                plugins = this.plugins && this.plugins[stage];

                if (!(!plugins || plugins.length === 0)) {
                  _context4.next = 3;
                  break;
                }

                return _context4.abrupt('return', payload);

              case 3:
                return _context4.abrupt('return', plugins.reduce(function () {
                  var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(obj, plugin) {
                    return _regenerator2.default.wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            return _context3.abrupt('return', plugin(obj, _this2) || obj);

                          case 1:
                          case 'end':
                            return _context3.stop();
                        }
                      }
                    }, _callee3, _this2);
                  }));

                  return function (_x10, _x11) {
                    return _ref5.apply(this, arguments);
                  };
                }(), payload));

              case 4:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function emit(_x8) {
        return _ref4.apply(this, arguments);
      }

      return emit;
    }()
  }, {
    key: 'create',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(typeName, payload) {
        var type, dijixObject;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (this.types) {
                  _context5.next = 2;
                  break;
                }

                throw new Error('Not initialized!');

              case 2:
                type = this.types[typeName];

                if (type) {
                  _context5.next = 5;
                  break;
                }

                throw new Error('Type does not exist: ' + typeName);

              case 5:
                _context5.next = 7;
                return this.emit('populated', this.populateHeaders(typeName));

              case 7:
                dijixObject = _context5.sent;
                _context5.t0 = this;
                _context5.t1 = _extends4.default;
                _context5.t2 = {};
                _context5.t3 = dijixObject;
                _context5.next = 14;
                return this.creationPipeline(payload, type);

              case 14:
                _context5.t4 = _context5.sent;
                _context5.t5 = {
                  data: _context5.t4
                };
                _context5.t6 = (0, _context5.t1)(_context5.t2, _context5.t3, _context5.t5);
                _context5.next = 19;
                return _context5.t0.emit.call(_context5.t0, 'created', _context5.t6);

              case 19:
                dijixObject = _context5.sent;
                _context5.t7 = this;
                _context5.t8 = _extends4.default;
                _context5.t9 = {};
                _context5.t10 = dijixObject;
                _context5.next = 26;
                return this.ipfs.put(dijixObject);

              case 26:
                _context5.t11 = _context5.sent;
                _context5.t12 = {
                  ipfsHash: _context5.t11
                };
                _context5.t13 = (0, _context5.t8)(_context5.t9, _context5.t10, _context5.t12);
                return _context5.abrupt('return', _context5.t7.emit.call(_context5.t7, 'uploaded', _context5.t13));

              case 30:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function create(_x12, _x13) {
        return _ref6.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: 'fetch',
    value: function (_fetch) {
      function fetch(_x, _x2) {
        return _fetch.apply(this, arguments);
      }

      fetch.toString = function () {
        return _fetch.toString();
      };

      return fetch;
    }(function () {
      var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(ipfsHash, opts) {
        var body, json, dijixObject;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return fetch(this.config.httpEndpoint + '/' + ipfsHash);

              case 2:
                body = _context6.sent;
                _context6.next = 5;
                return body.json();

              case 5:
                json = _context6.sent;
                _context6.next = 8;
                return this.emit('fetched', json);

              case 8:
                dijixObject = _context6.sent;
                _context6.t0 = this;
                _context6.next = 12;
                return this.readPipeline(dijixObject, opts);

              case 12:
                _context6.t1 = _context6.sent;
                return _context6.abrupt('return', _context6.t0.emit.call(_context6.t0, 'read', _context6.t1));

              case 14:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      return function (_x14, _x15) {
        return _ref7.apply(this, arguments);
      };
    }())
  }]);
  return Dijix;
}();

exports.default = Dijix;