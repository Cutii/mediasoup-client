'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bowser = require('bowser');

var _bowser2 = _interopRequireDefault(_bowser);

var _Logger = require('./Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _Chrome = require('./handlers/Chrome55');

var _Chrome2 = _interopRequireDefault(_Chrome);

var _Chrome3 = require('./handlers/Chrome67');

var _Chrome4 = _interopRequireDefault(_Chrome3);

var _Safari = require('./handlers/Safari11');

var _Safari2 = _interopRequireDefault(_Safari);

var _Firefox = require('./handlers/Firefox50');

var _Firefox2 = _interopRequireDefault(_Firefox);

var _Firefox3 = require('./handlers/Firefox59');

var _Firefox4 = _interopRequireDefault(_Firefox3);

var _Edge = require('./handlers/Edge11');

var _Edge2 = _interopRequireDefault(_Edge);

var _ReactNative = require('./handlers/ReactNative');

var _ReactNative2 = _interopRequireDefault(_ReactNative);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var logger = new _Logger2.default('Device');

/**
 * Class with static members representing the underlying device or browser.
 */

var Device = function () {
	function Device() {
		_classCallCheck(this, Device);
	}

	_createClass(Device, null, [{
		key: 'getFlag',

		/**
   * Get the device flag.
   *
   * @return {String}
   */
		value: function getFlag() {
			if (!Device._detected) Device._detect();

			return Device._flag;
		}

		/**
   * Get the device name.
   *
   * @return {String}
   */

	}, {
		key: 'getName',
		value: function getName() {
			if (!Device._detected) Device._detect();

			return Device._name;
		}

		/**
   * Get the device version.
   *
   * @return {String}
   */

	}, {
		key: 'getVersion',
		value: function getVersion() {
			if (!Device._detected) Device._detect();

			return Device._version;
		}

		/**
   * Get the bowser module Object.
   *
   * @return {Object}
   */

	}, {
		key: 'getBowser',
		value: function getBowser() {
			if (!Device._detected) Device._detect();

			return Device._bowser;
		}

		/**
   * Whether this device is supported.
   *
   * @return {Boolean}
   */

	}, {
		key: 'isSupported',
		value: function isSupported() {
			if (!Device._detected) Device._detect();

			return Boolean(Device._handlerClass);
		}

		/**
   * Returns a suitable WebRTC handler class.
   *
   * @type {Class}
   */

	}, {
		key: '_detect',


		/**
   * Detects the current device/browser.
   *
   * @private
   */
		value: function _detect() {
			Device._detected = true;

			// If this is React-Native manually fill data.
			if (global.navigator && global.navigator.product === 'ReactNative') {
				Device._flag = 'react-native';
				Device._name = 'ReactNative';
				Device._version = undefined; // NOTE: No idea how to know it.
				Device._bowser = {};
				Device._handlerClass = _ReactNative2.default;
			}
			// If this is a browser use bowser module detection.
			else if (global.navigator && typeof global.navigator.userAgent === 'string') {
					var ua = global.navigator.userAgent;
					var browser = _bowser2.default.detect(ua);

					Device._flag = undefined;
					Device._name = browser.name || undefined;
					Device._version = browser.version || undefined;
					Device._bowser = browser;
					Device._handlerClass = null;

					// Chrome, Chromium (desktop and mobile).
					if (_bowser2.default.check({ chrome: '67', chromium: '67' }, true, ua)) {
						Device._flag = 'chrome';
						Device._handlerClass = _Chrome4.default;
					} else if (_bowser2.default.check({ chrome: '55', chromium: '55' }, true, ua)) {
						Device._flag = 'chrome';
						Device._handlerClass = _Chrome2.default;
					}
					// Firefox (desktop and mobile).
					else if (_bowser2.default.check({ firefox: '59' }, true, ua)) {
							Device._flag = 'firefox';
							Device._handlerClass = _Firefox4.default;
						} else if (_bowser2.default.check({ firefox: '50' }, true, ua)) {
							Device._flag = 'firefox';
							Device._handlerClass = _Firefox2.default;
						}
						// Safari (desktop and mobile).
						else if (_bowser2.default.check({ safari: '11' }, true, ua)) {
								Device._flag = 'safari';
								Device._handlerClass = _Safari2.default;
							}
							// Edge (desktop).
							else if (_bowser2.default.check({ msedge: '11' }, true, ua)) {
									Device._flag = 'msedge';
									Device._handlerClass = _Edge2.default;
								}
					// Opera (desktop and mobile).
					if (_bowser2.default.check({ opera: '44' }, true, ua)) {
						Device._flag = 'opera';
						Device._handlerClass = _Chrome2.default;
					}

					if (Device.isSupported()) {
						logger.debug('browser supported [flag:%s, name:"%s", version:%s, handler:%s]', Device._flag, Device._name, Device._version, Device._handlerClass.tag);
					} else {
						logger.warn('browser not supported [name:%s, version:%s]', Device._name, Device._version);
					}
				}
				// Otherwise fail.
				else {
						logger.warn('device not supported');
					}
		}
	}, {
		key: 'Handler',
		get: function get() {
			if (!Device._detected) Device._detect();

			return Device._handlerClass;
		}
	}]);

	return Device;
}();

// Initialized flag.
// @type {Boolean}


exports.default = Device;
Device._detected = false;

// Device flag.
// @type {String}
Device._flag = undefined;

// Device name.
// @type {String}
Device._name = undefined;

// Device version.
// @type {String}
Device._version = undefined;

// bowser module Object.
// @type {Object}
Device._bowser = undefined;

// WebRTC hander for this device.
// @type {Class}
Device._handlerClass = null;