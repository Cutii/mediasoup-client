'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _fixBabelExtend = function (O) {
	var gPO = O.getPrototypeOf || function (o) {
		return o.__proto__;
	},
	    sPO = O.setPrototypeOf || function (o, p) {
		o.__proto__ = p;
		return o;
	},
	    construct = (typeof Reflect === 'undefined' ? 'undefined' : _typeof(Reflect)) === 'object' ? Reflect.construct : function (Parent, args, Class) {
		var Constructor,
		    a = [null];
		a.push.apply(a, args);
		Constructor = Parent.bind.apply(Parent, a);
		return sPO(new Constructor(), Class.prototype);
	};

	return function fixBabelExtend(Class) {
		var Parent = gPO(Class);
		return sPO(Class, sPO(function Super() {
			return construct(Parent, arguments, gPO(this).constructor);
		}, Parent));
	};
}(Object);

/**
 * Error produced when calling a method in an invalid state.
 */
var InvalidStateError = exports.InvalidStateError = _fixBabelExtend(function (_Error) {
	_inherits(InvalidStateError, _Error);

	function InvalidStateError(message) {
		_classCallCheck(this, InvalidStateError);

		var _this = _possibleConstructorReturn(this, (InvalidStateError.__proto__ || Object.getPrototypeOf(InvalidStateError)).call(this, message));

		_this.name = 'InvalidStateError';

		if (Error.hasOwnProperty('captureStackTrace')) // Just in V8.
			Error.captureStackTrace(_this, InvalidStateError);else _this.stack = new Error(message).stack;
		return _this;
	}

	return InvalidStateError;
}(Error));

/**
 * Error produced when a Promise is rejected due to a timeout.
 */


var TimeoutError = exports.TimeoutError = _fixBabelExtend(function (_Error2) {
	_inherits(TimeoutError, _Error2);

	function TimeoutError(message) {
		_classCallCheck(this, TimeoutError);

		var _this2 = _possibleConstructorReturn(this, (TimeoutError.__proto__ || Object.getPrototypeOf(TimeoutError)).call(this, message));

		_this2.name = 'TimeoutError';

		if (Error.hasOwnProperty('captureStackTrace')) // Just in V8.
			Error.captureStackTrace(_this2, InvalidStateError);else _this2.stack = new Error(message).stack;
		return _this2;
	}

	return TimeoutError;
}(Error));

/**
 * Error indicating not support for something.
 */


var UnsupportedError = exports.UnsupportedError = _fixBabelExtend(function (_Error3) {
	_inherits(UnsupportedError, _Error3);

	function UnsupportedError(message, data) {
		_classCallCheck(this, UnsupportedError);

		var _this3 = _possibleConstructorReturn(this, (UnsupportedError.__proto__ || Object.getPrototypeOf(UnsupportedError)).call(this, message));

		_this3.name = 'UnsupportedError';

		if (Error.hasOwnProperty('captureStackTrace')) // Just in V8.
			Error.captureStackTrace(_this3, InvalidStateError);else _this3.stack = new Error(message).stack;

		_this3.data = data;
		return _this3;
	}

	return UnsupportedError;
}(Error));