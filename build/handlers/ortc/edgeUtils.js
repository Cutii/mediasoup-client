'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getCapabilities = getCapabilities;
exports.mangleRtpParameters = mangleRtpParameters;

var _utils = require('../../utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Normalize Edge's RTCRtpReceiver.getCapabilities() to produce a full
 * compliant ORTC RTCRtpCapabilities.
 *
 * @return {RTCRtpCapabilities}
 */
function getCapabilities() {
	var nativeCaps = RTCRtpReceiver.getCapabilities();
	var caps = utils.clone(nativeCaps);

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = caps.codecs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var codec = _step.value;

			// Rename numChannels to channels.
			codec.channels = codec.numChannels;
			delete codec.numChannels;

			// Normalize channels.
			if (codec.kind !== 'audio') delete codec.channels;else if (!codec.channels) codec.channels = 1;

			// Add mimeType.
			codec.mimeType = codec.kind + '/' + codec.name;

			// NOTE: Edge sets some numeric parameters as String rather than Number. Fix them.
			if (codec.parameters) {
				var parameters = codec.parameters;

				if (parameters.apt) parameters.apt = Number(parameters.apt);

				if (parameters['packetization-mode']) parameters['packetization-mode'] = Number(parameters['packetization-mode']);
			}

			// Delete emty parameter String in rtcpFeedback.
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = (codec.rtcpFeedback || [])[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var feedback = _step2.value;

					if (!feedback.parameter) delete feedback.parameter;
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	return caps;
}

/**
 * Generate RTCRtpParameters as Edge like them.
 *
 * @param  {RTCRtpParameters} rtpParameters
 * @return {RTCRtpParameters}
 */
/* global RTCRtpReceiver */

function mangleRtpParameters(rtpParameters) {
	var params = utils.clone(rtpParameters);

	var _iteratorNormalCompletion3 = true;
	var _didIteratorError3 = false;
	var _iteratorError3 = undefined;

	try {
		for (var _iterator3 = params.codecs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
			var codec = _step3.value;

			// Rename channels to numChannels.
			if (codec.channels) {
				codec.numChannels = codec.channels;
				delete codec.channels;
			}

			// Remove mimeType.
			delete codec.mimeType;
		}
	} catch (err) {
		_didIteratorError3 = true;
		_iteratorError3 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion3 && _iterator3.return) {
				_iterator3.return();
			}
		} finally {
			if (_didIteratorError3) {
				throw _iteratorError3;
			}
		}
	}

	return params;
}