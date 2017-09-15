#!/usr/bin/env node
'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _getInstalledPath = require('get-installed-path');

var _getInstalledPath2 = _interopRequireDefault(_getInstalledPath);

var _ = require('../');

var _2 = _interopRequireDefault(_);

var _package = require('../../package.json');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.on('unhandledRejection', console.error);

var defaultConfig = process.env.HOME + '/.dijixrc';

var autoDetectTypes = ['dijix-image', 'dijix-pdf', 'dijix-attestation'];
// const autoDetectTypes = ['dijix-image'];

function parseConfig(str) {
  var config = void 0;
  try {
    // try parsing file content
    config = _fs2.default.existsSync(str) && JSON.parse(_fs2.default.readFileSync(str).toString());
  } catch (e) {/* ignore */}
  if (!config) {
    try {
      // try parsing the string itself
      config = JSON.parse(str);
    } catch (e) {/* ignore */}
  }
  return config || {};
}

_commander2.default.version(_package.version).usage('create <type> <src>').description('Creates a dijix object of <type> using <src> path and upload it to ipfs').option('-c, --config [string / path]', 'base config file (JSON string or path); defaults to ~/.dijixrc', defaultConfig).option('-o, --options [string / path]', 'action options file (JSON string or path)').option('-t, --types [npm_modules]', 'specify types to register (comma seperated npm module names)', function (s) {
  return s.split(',').map(function (npm) {
    return { npm: npm };
  });
}).option('-p, --plugins [npm_modules]', 'specify plugins to register (comma seperated npm module names)', function (s) {
  return s.split(',').map(function (p) {
    return p;
  });
}).action(function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(cmd, type, src) {
    var config, options, detectedTypes, typesConfig, types, dijix, obj;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            // parse the options
            config = parseConfig(_commander2.default.config);
            options = parseConfig(_commander2.default.options);

            // auto-detect types

            _context3.next = 4;
            return _promise2.default.all(autoDetectTypes.map(function () {
              var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(module) {
                return _regenerator2.default.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return (0, _getInstalledPath2.default)(module);

                      case 3:
                        _context.t0 = _context.sent;
                        return _context.abrupt('return', {
                          path: _context.t0
                        });

                      case 7:
                        _context.prev = 7;
                        _context.t1 = _context['catch'](0);
                        return _context.abrupt('return', null);

                      case 10:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, undefined, [[0, 7]]);
              }));

              return function (_x4) {
                return _ref2.apply(this, arguments);
              };
            }()));

          case 4:
            _context3.t0 = function (a) {
              return a;
            };

            detectedTypes = _context3.sent.filter(_context3.t0);

            // register passed types
            typesConfig = detectedTypes.concat((config.types || []).concat(_commander2.default.types || []));

            if (!(typesConfig.length === 0 && detectedTypes.length === 0)) {
              _context3.next = 9;
              break;
            }

            throw new Error('No dijix types set. Use -t, specify in config file, or npm i -g ' + autoDetectTypes.join(' ') + '.');

          case 9:
            _context3.next = 11;
            return _promise2.default.all(typesConfig.map(function () {
              var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_ref4) {
                var npm = _ref4.npm,
                    path = _ref4.path,
                    typeConfig = _ref4.config;
                var typePath, required, DijixType, t;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        _context2.prev = 0;
                        _context2.t0 = path;

                        if (_context2.t0) {
                          _context2.next = 6;
                          break;
                        }

                        _context2.next = 5;
                        return (0, _getInstalledPath2.default)(npm);

                      case 5:
                        _context2.t0 = _context2.sent;

                      case 6:
                        typePath = _context2.t0;
                        required = require(typePath);
                        DijixType = required.default || required;
                        t = new DijixType(typeConfig);
                        return _context2.abrupt('return', t);

                      case 13:
                        _context2.prev = 13;
                        _context2.t1 = _context2['catch'](0);
                        throw new Error('Could not find path: ' + (npm || path) + ' - ' + _context2.t1);

                      case 16:
                      case 'end':
                        return _context2.stop();
                    }
                  }
                }, _callee2, undefined, [[0, 13]]);
              }));

              return function (_x5) {
                return _ref3.apply(this, arguments);
              };
            }()));

          case 11:
            types = _context3.sent;

            // TODO register plugins...
            dijix = new _2.default((0, _extends3.default)({}, config, { types: types }));
            _context3.next = 15;
            return dijix.create(type, (0, _extends3.default)({ src: src }, options));

          case 15:
            obj = _context3.sent;

            process.stdout.write((0, _stringify2.default)(obj, null, 2));

          case 17:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}());

_commander2.default.parse(process.argv);