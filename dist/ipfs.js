'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _ipfsApi = require('ipfs-api');

var _ipfsApi2 = _interopRequireDefault(_ipfsApi);

var _awaiting = require('awaiting');

var a = _interopRequireWildcard(_awaiting);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function itemToBuffer(item) {
  if (Buffer.isBuffer(item)) {
    return item;
  }
  if (typeof item === 'string') {
    return Buffer.from(item);
  }
  return Buffer.from((0, _stringify2.default)(item));
}

var Ipfs = function () {
  function Ipfs(dijix) {
    (0, _classCallCheck3.default)(this, Ipfs);
    var _dijix$config = dijix.config,
        ipfsEndpoint = _dijix$config.ipfsEndpoint,
        concurrency = _dijix$config.concurrency;

    try {
      var _ipfsEndpoint$split = ipfsEndpoint.split('://'),
          _ipfsEndpoint$split2 = (0, _slicedToArray3.default)(_ipfsEndpoint$split, 2),
          protocol = _ipfsEndpoint$split2[0],
          endpoint = _ipfsEndpoint$split2[1];

      var _endpoint$split = endpoint.split(':'),
          _endpoint$split2 = (0, _slicedToArray3.default)(_endpoint$split, 2),
          host = _endpoint$split2[0],
          port = _endpoint$split2[1];

      this.dijix = dijix;
      this.ipfs = new _ipfsApi2.default({ host: host, port: port, protocol: protocol });
      this.concurrency = concurrency || 10;
    } catch (e) {
      throw new Error('Invalid IPFS endpoint: ' + ipfsEndpoint);
    }
  }

  (0, _createClass3.default)(Ipfs, [{
    key: 'add',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(item) {
        var buffer, res, hash;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                buffer = itemToBuffer(item);
                _context.next = 3;
                return a.callback(this.ipfs.add, buffer);

              case 3:
                res = _context.sent;
                hash = res[0].hash;

                this.dijix.emit('ipfsHashAdded', hash);
                return _context.abrupt('return', hash);

              case 7:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function add(_x) {
        return _ref.apply(this, arguments);
      }

      return add;
    }()
  }, {
    key: 'put',
    value: function put(items) {
      var _this = this;

      if (Array.isArray(items)) {
        return a.map(items, this.concurrency, function (i) {
          return _this.add(i);
        });
      }
      return this.add(items);
    }
  }]);
  return Ipfs;
}();

exports.default = Ipfs;