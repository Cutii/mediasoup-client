'use strict';
/* eslint-disable no-empty */
/* eslint-disable no-param-reassign */
/* eslint-disable default-case */

Object.defineProperty(exports, '__esModule', {
  value: true,
});

const _createClass = (function() {
  function defineProperties(target, props) {
    for (let i = 0; i < props.length; i++) {
      const descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ('value' in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

const _sdpTransform = require('sdp-transform');

const _sdpTransform2 = _interopRequireDefault(_sdpTransform);

const _Logger = require('../Logger');

const _Logger2 = _interopRequireDefault(_Logger);

const _EnhancedEventEmitter2 = require('../EnhancedEventEmitter');

const _EnhancedEventEmitter3 = _interopRequireDefault(_EnhancedEventEmitter2);

const _utils = require('../utils');

const utils = _interopRequireWildcard(_utils);

const _ortc = require('../ortc');

const ortc = _interopRequireWildcard(_ortc);

const _commonUtils = require('./sdp/commonUtils');

const sdpCommonUtils = _interopRequireWildcard(_commonUtils);

const _planBUtils = require('./sdp/planBUtils');

const sdpPlanBUtils = _interopRequireWildcard(_planBUtils);

const _RemotePlanBSdp = require('./sdp/RemotePlanBSdp');

const _RemotePlanBSdp2 = _interopRequireDefault(_RemotePlanBSdp);

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    const newObj = {};
    if (obj != null) {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          newObj[key] = obj[key];
        }
      }
    }
    newObj.default = obj;
    return newObj;
  }
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError(
      'this hasn\'t been initialised - super() hasn\'t been called'
    );
  }
  return call && (typeof call === 'object' || typeof call === 'function')
    ? call
    : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError(
      'Super expression must either be null or a function, not ' +
        typeof superClass
    );
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  });
  if (superClass) {
    Object.setPrototypeOf
      ? Object.setPrototypeOf(subClass, superClass)
      : (subClass.__proto__ = superClass);
  }
} /* eslint-disable no-empty */
/* eslint-disable no-param-reassign */
/* eslint-disable default-case */

let webrtc = {};
try {
  webrtc = require('react-native-webrtc');
} catch (err) {}

const logger = new _Logger2.default('ReactNative');

Object.assign(global, webrtc);
MediaStream.prototype.oldTrack = MediaStream.prototype.addTrack;

const Handler = (function(_EnhancedEventEmitter) {
  _inherits(Handler, _EnhancedEventEmitter);

  function Handler(direction, rtpParametersByKind, settings) {
    _classCallCheck(this, Handler);

    // RTCPeerConnection instance.
    // @type {RTCPeerConnection}
    const _this = _possibleConstructorReturn(
      this,
      (Handler.__proto__ || Object.getPrototypeOf(Handler)).call(this, logger)
    );

    _this._pc = new RTCPeerConnection({
      iceServers: settings.turnServers || [],
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    });

    const self = _this;
    MediaStream.prototype.addTrack = function(track) {
      track.streamReactTag = this.reactTag;
      this.oldAddTrack(track);
      if (!this.reactTag) {
        this.reactTag = track.streamReactTag;
        this.id = this.reactTag;
      } else {
        track.streamReactTag = this.reactTag;
      }
      if (track.remote) self._pc.addStream(this);
    };

    // Generic sending RTP parameters for audio and video.
    // @type {Object}
    _this._rtpParametersByKind = rtpParametersByKind;

    // Remote SDP handler.
    // @type {RemotePlanBSdp}
    _this._remoteSdp = new _RemotePlanBSdp2.default(
      direction,
      rtpParametersByKind
    );

    // Handle RTCPeerConnection connection status.
    _this._pc.addEventListener('iceconnectionstatechange', function() {
      switch (_this._pc.iceConnectionState) {
        case 'checking':
          _this.emit('@connectionstatechange', 'connecting');
          break;
        case 'connected':
        case 'completed':
          _this.emit('@connectionstatechange', 'connected');
          break;
        case 'failed':
          _this.emit('@connectionstatechange', 'failed');
          break;
        case 'disconnected':
          _this.emit('@connectionstatechange', 'disconnected');
          break;
        case 'closed':
          _this.emit('@connectionstatechange', 'closed');
          break;
      }
    });
    return _this;
  }

  _createClass(Handler, [
    {
      key: 'close',
      value: function close() {
        logger.debug('close()');

        // Close RTCPeerConnection.
        try {
          this._pc.close();
        } catch (error) {}
      },
    },
  ]);

  return Handler;
})(_EnhancedEventEmitter3.default);

const SendHandler = (function(_Handler) {
  _inherits(SendHandler, _Handler);

  function SendHandler(rtpParametersByKind, settings) {
    _classCallCheck(this, SendHandler);

    // Got transport local and remote parameters.
    // @type {Boolean}
    const _this2 = _possibleConstructorReturn(
      this,
      (SendHandler.__proto__ || Object.getPrototypeOf(SendHandler)).call(
        this,
        'send',
        rtpParametersByKind,
        settings
      )
    );

    _this2._transportReady = false;

    // Handled tracks.
    // @type {Set<MediaStreamTrack>}
    _this2._tracks = new Set();
    return _this2;
  }

  _createClass(SendHandler, [
    {
      key: 'addProducer',
      value: function addProducer(producer) {
        const _this3 = this;

        const track = producer.track;

        logger.debug(
          'addProducer() [id:%s, kind:%s, trackId:%s]',
          producer.id,
          producer.kind,
          track.id
        );

        if (this._tracks.has(track)) {
          return Promise.reject(new Error('track already added'));
        }

        if (!track.streamReactTag) {
          return Promise.reject(new Error('no track.streamReactTag property'));
        }

        let stream = void 0;
        let localSdpObj = void 0;

        return Promise.resolve()
          .then(function() {
            // Add the track to the Set.
            _this3._tracks.add(track);

            // Hack: Create a new stream with track.streamReactTag as id.
            stream = new MediaStream(track.streamReactTag);

            // Add the track to the stream.
            stream.addTrack(track);

            // Add the stream to the PeerConnection.
            _this3._pc.addStream(stream);

            return _this3._pc.createOffer();
          })
          .then(function(offer) {
            // If simulcast is set, mangle the offer.
            if (producer.simulcast) {
              logger.debug('addProducer() | enabling simulcast');

              const sdpObject = _sdpTransform2.default.parse(offer.sdp);

              sdpPlanBUtils.addSimulcastForTrack(sdpObject, track);

              const offerSdp = _sdpTransform2.default.write(sdpObject);

              offer = { type: 'offer', sdp: offerSdp };
            }

            logger.debug(
              'addProducer() | calling pc.setLocalDescription() [offer:%o]',
              offer
            );

            const offerDesc = new RTCSessionDescription(offer);

            return _this3._pc.setLocalDescription(offerDesc);
          })
          .then(function() {
            if (!_this3._transportReady) return _this3._setupTransport();
          })
          .then(function() {
            localSdpObj = _sdpTransform2.default.parse(
              _this3._pc.localDescription.sdp
            );

            const remoteSdp = _this3._remoteSdp.createAnswerSdp(localSdpObj);
            const answer = { type: 'answer', sdp: remoteSdp };

            logger.debug(
              'addProducer() | calling pc.setRemoteDescription() [answer:%o]',
              answer
            );

            const answerDesc = new RTCSessionDescription(answer);

            return _this3._pc.setRemoteDescription(answerDesc);
          })
          .then(function() {
            const rtpParameters = utils.clone(
              _this3._rtpParametersByKind[producer.kind]
            );

            // Fill the RTP parameters for this track.
            sdpPlanBUtils.fillRtpParametersForTrack(
              rtpParameters,
              localSdpObj,
              track
            );

            return rtpParameters;
          })
          .catch(function(error) {
            // Panic here. Try to undo things.

            _this3._tracks.delete(track);
            stream.removeTrack(track);
            _this3._pc.addStream(stream);

            throw error;
          });
      },
    },
    {
      key: 'removeProducer',
      value: function removeProducer(producer) {
        const _this4 = this;

        const track = producer.track;

        logger.debug(
          'removeProducer() [id:%s, kind:%s, trackId:%s]',
          producer.id,
          producer.kind,
          track.id
        );

        if (!track.streamReactTag) {
          return Promise.reject(new Error('no track.streamReactTag property'));
        }

        return Promise.resolve()
          .then(function() {
            // Remove the track from the Set.
            _this4._tracks.delete(track);

            // Hack: Create a new stream with track.streamReactTag as id.
            const stream = new MediaStream(track.streamReactTag);

            // Add the track to the stream.
            stream.addTrack(track);

            // Add the stream to the PeerConnection.
            _this4._pc.addStream(stream);

            return _this4._pc.createOffer();
          })
          .then(function(offer) {
            logger.debug(
              'removeProducer() | calling pc.setLocalDescription() [offer:%o]',
              offer
            );

            return _this4._pc.setLocalDescription(offer);
          })
          .catch(function(error) {
            // NOTE: If there are no sending tracks, setLocalDescription() will fail with
            // "Failed to create channels". If so, ignore it.
            if (_this4._tracks.size === 0) {
              logger.warn(
                'removeProducer() | ignoring expected error due no sending tracks: %s',
                error.toString()
              );

              return;
            }

            throw error;
          })
          .then(function() {
            if (_this4._pc.signalingState === 'stable') return;

            const localSdpObj = _sdpTransform2.default.parse(
              _this4._pc.localDescription.sdp
            );
            const remoteSdp = _this4._remoteSdp.createAnswerSdp(localSdpObj);
            const answer = { type: 'answer', sdp: remoteSdp };

            logger.debug(
              'removeProducer() | calling pc.setRemoteDescription() [answer:%o]',
              answer
            );

            const answerDesc = new RTCSessionDescription(answer);

            return _this4._pc.setRemoteDescription(answerDesc);
          });
      },
    },
    {
      key: 'replaceProducerTrack',
      value: function replaceProducerTrack(producer, track) {
        const _this5 = this;

        logger.debug(
          'replaceProducerTrack() [id:%s, kind:%s, trackId:%s]',
          producer.id,
          producer.kind,
          track.id
        );

        if (!track.streamReactTag) {
          return Promise.reject(new Error('no track.streamReactTag property'));
        }

        const oldTrack = producer.track;
        let stream = void 0;
        let localSdpObj = void 0;

        return Promise.resolve()
          .then(function() {
            // Add the new Track to the Set and remove the old one.
            _this5._tracks.add(track);
            _this5._tracks.delete(oldTrack);

            // Hack: Create a new stream with track.streamReactTag as id.
            stream = new MediaStream(track.streamReactTag);

            // Add the track to the stream and remove the old one.
            stream.addTrack(track);
            stream.removeTrack(oldTrack);

            // Add the stream to the PeerConnection.
            _this5._pc.addStream(stream);

            return _this5._pc.createOffer();
          })
          .then(function(offer) {
            // If simulcast is set, mangle the offer.
            if (producer.simulcast) {
              logger.debug('addProducer() | enabling simulcast');

              const sdpObject = _sdpTransform2.default.parse(offer.sdp);

              sdpPlanBUtils.addSimulcastForTrack(sdpObject, track);

              const offerSdp = _sdpTransform2.default.write(sdpObject);

              offer = { type: 'offer', sdp: offerSdp };
            }

            logger.debug(
              'replaceProducerTrack() | calling pc.setLocalDescription() [offer:%o]',
              offer
            );

            const offerDesc = new RTCSessionDescription(offer);

            return _this5._pc.setLocalDescription(offerDesc);
          })
          .then(function() {
            localSdpObj = _sdpTransform2.default.parse(
              _this5._pc.localDescription.sdp
            );

            const remoteSdp = _this5._remoteSdp.createAnswerSdp(localSdpObj);
            const answer = { type: 'answer', sdp: remoteSdp };

            logger.debug(
              'replaceProducerTrack() | calling pc.setRemoteDescription() [answer:%o]',
              answer
            );

            const answerDesc = new RTCSessionDescription(answer);

            return _this5._pc.setRemoteDescription(answerDesc);
          })
          .then(function() {
            const rtpParameters = utils.clone(
              _this5._rtpParametersByKind[producer.kind]
            );

            // Fill the RTP parameters for the new track.
            sdpPlanBUtils.fillRtpParametersForTrack(
              rtpParameters,
              localSdpObj,
              track
            );

            // We need to provide new RTP parameters.
            _this5.safeEmit('@needupdateproducer', producer, rtpParameters);
          })
          .catch(function(error) {
            // Panic here. Try to undo things.

            _this5._tracks.delete(track);
            stream.removeTrack(track);
            _this5._pc.addStream(stream);

            throw error;
          });
      },
    },
    {
      key: 'restartIce',
      value: function restartIce(remoteIceParameters) {
        const _this6 = this;

        logger.debug('restartIce()');

        // Provide the remote SDP handler with new remote ICE parameters.
        this._remoteSdp.updateTransportRemoteIceParameters(remoteIceParameters);

        return Promise.resolve()
          .then(function() {
            return _this6._pc.createOffer({ iceRestart: true });
          })
          .then(function(offer) {
            logger.debug(
              'restartIce() | calling pc.setLocalDescription() [offer:%o]',
              offer
            );

            return _this6._pc.setLocalDescription(offer);
          })
          .then(function() {
            const localSdpObj = _sdpTransform2.default.parse(
              _this6._pc.localDescription.sdp
            );
            const remoteSdp = _this6._remoteSdp.createAnswerSdp(localSdpObj);
            const answer = { type: 'answer', sdp: remoteSdp };

            logger.debug(
              'restartIce() | calling pc.setRemoteDescription() [answer:%o]',
              answer
            );

            const answerDesc = new RTCSessionDescription(answer);

            return _this6._pc.setRemoteDescription(answerDesc);
          });
      },
    },
    {
      key: '_setupTransport',
      value: function _setupTransport() {
        const _this7 = this;

        logger.debug('_setupTransport()');

        return Promise.resolve()
          .then(function() {
            // Get our local DTLS parameters.
            const transportLocalParameters = {};
            const sdp = _this7._pc.localDescription.sdp;
            const sdpObj = _sdpTransform2.default.parse(sdp);
            const dtlsParameters = sdpCommonUtils.extractDtlsParameters(sdpObj);

            // Let's decide that we'll be DTLS server (because we can).
            dtlsParameters.role = 'server';

            transportLocalParameters.dtlsParameters = dtlsParameters;

            // Provide the remote SDP handler with transport local parameters.
            _this7._remoteSdp.setTransportLocalParameters(
              transportLocalParameters
            );

            // We need transport remote parameters.
            return _this7.safeEmitAsPromise(
              '@needcreatetransport',
              transportLocalParameters
            );
          })
          .then(function(transportRemoteParameters) {
            // Provide the remote SDP handler with transport remote parameters.
            _this7._remoteSdp.setTransportRemoteParameters(
              transportRemoteParameters
            );

            _this7._transportReady = true;
          });
      },
    },
  ]);

  return SendHandler;
})(Handler);

const RecvHandler = (function(_Handler2) {
  _inherits(RecvHandler, _Handler2);

  function RecvHandler(rtpParametersByKind, settings) {
    _classCallCheck(this, RecvHandler);

    // Got transport remote parameters.
    // @type {Boolean}
    const _this8 = _possibleConstructorReturn(
      this,
      (RecvHandler.__proto__ || Object.getPrototypeOf(RecvHandler)).call(
        this,
        'recv',
        rtpParametersByKind,
        settings
      )
    );

    _this8._transportCreated = false;

    // Got transport local parameters.
    // @type {Boolean}
    _this8._transportUpdated = false;

    // Seen media kinds.
    // @type {Set<String>}
    _this8._kinds = new Set();

    // Map of Consumers information indexed by consumer.id.
    // - kind {String}
    // - trackId {String}
    // - ssrc {Number}
    // - rtxSsrc {Number}
    // - cname {String}
    // @type {Map<Number, Object>}
    _this8._consumerInfos = new Map();
    return _this8;
  }

  _createClass(RecvHandler, [
    {
      key: 'addConsumer',
      value: function addConsumer(consumer) {
        const _this9 = this;

        logger.debug(
          'addConsumer() [id:%s, kind:%s]',
          consumer.id,
          consumer.kind
        );

        if (this._consumerInfos.has(consumer.id)) {
          return Promise.reject(new Error('Consumer already added'));
        }

        const encoding = consumer.rtpParameters.encodings[0];
        const cname = consumer.rtpParameters.rtcp.cname;
        const consumerInfo = {
          kind: consumer.kind,
          streamId: 'recv-stream-' + consumer.id,
          trackId: 'consumer-' + consumer.kind + '-' + consumer.id,
          ssrc: encoding.ssrc,
          cname: cname,
        };

        if (encoding.rtx && encoding.rtx.ssrc) {
          consumerInfo.rtxSsrc = encoding.rtx.ssrc;
        }

        this._consumerInfos.set(consumer.id, consumerInfo);
        this._kinds.add(consumer.kind);

        return Promise.resolve()
          .then(function() {
            if (!_this9._transportCreated) return _this9._setupTransport();
          })
          .then(function() {
            const remoteSdp = _this9._remoteSdp.createOfferSdp(
              Array.from(_this9._kinds),
              Array.from(_this9._consumerInfos.values())
            );
            const offer = { type: 'offer', sdp: remoteSdp };

            logger.debug(
              'addConsumer() | calling pc.setRemoteDescription() [offer:%o]',
              offer
            );

            const offerDesc = new RTCSessionDescription(offer);

            return _this9._pc.setRemoteDescription(offerDesc);
          })
          .then(function() {
            return _this9._pc.createAnswer();
          })
          .then(function(answer) {
            logger.debug(
              'addConsumer() | calling pc.setLocalDescription() [answer:%o]',
              answer
            );

            return _this9._pc.setLocalDescription(answer);
          })
          .then(function() {
            if (!_this9._transportUpdated) return _this9._updateTransport();
          })
          .then(function() {
            const stream = _this9._pc.getRemoteStreams().find(function(s) {
              return s.id === consumerInfo.streamId;
            });
            const track = stream.getTrackById(consumerInfo.trackId);

            // Hack: Add a streamReactTag property with the reactTag of the MediaStream
            // generated by react-native-webrtc (this is needed because react-native-webrtc
            // assumes that we're gonna use the streams generated by it).
            track.streamReactTag = stream.reactTag;

            if (!track) throw new Error('remote track not found');

            return track;
          });
      },
    },
    {
      key: 'removeConsumer',
      value: function removeConsumer(consumer) {
        const _this10 = this;

        logger.debug(
          'removeConsumer() [id:%s, kind:%s]',
          consumer.id,
          consumer.kind
        );

        if (!this._consumerInfos.has(consumer.id)) {
          return Promise.reject(new Error('Consumer not found'));
        }

        this._consumerInfos.delete(consumer.id);

        return Promise.resolve()
          .then(function() {
            const remoteSdp = _this10._remoteSdp.createOfferSdp(
              Array.from(_this10._kinds),
              Array.from(_this10._consumerInfos.values())
            );
            const offer = { type: 'offer', sdp: remoteSdp };

            logger.debug(
              'removeConsumer() | calling pc.setRemoteDescription() [offer:%o]',
              offer
            );

            const offerDesc = new RTCSessionDescription(offer);

            return _this10._pc.setRemoteDescription(offerDesc);
          })
          .then(function() {
            return _this10._pc.createAnswer();
          })
          .then(function(answer) {
            logger.debug(
              'removeConsumer() | calling pc.setLocalDescription() [answer:%o]',
              answer
            );

            return _this10._pc.setLocalDescription(answer);
          });
      },
    },
    {
      key: 'restartIce',
      value: function restartIce(remoteIceParameters) {
        const _this11 = this;

        logger.debug('restartIce()');

        // Provide the remote SDP handler with new remote ICE parameters.
        this._remoteSdp.updateTransportRemoteIceParameters(remoteIceParameters);

        return Promise.resolve()
          .then(function() {
            const remoteSdp = _this11._remoteSdp.createOfferSdp(
              Array.from(_this11._kinds),
              Array.from(_this11._consumerInfos.values())
            );
            const offer = { type: 'offer', sdp: remoteSdp };

            logger.debug(
              'restartIce() | calling pc.setRemoteDescription() [offer:%o]',
              offer
            );

            const offerDesc = new RTCSessionDescription(offer);

            return _this11._pc.setRemoteDescription(offerDesc);
          })
          .then(function() {
            return _this11._pc.createAnswer();
          })
          .then(function(answer) {
            logger.debug(
              'restartIce() | calling pc.setLocalDescription() [answer:%o]',
              answer
            );

            return _this11._pc.setLocalDescription(answer);
          });
      },
    },
    {
      key: '_setupTransport',
      value: function _setupTransport() {
        const _this12 = this;

        logger.debug('_setupTransport()');

        return Promise.resolve()
          .then(function() {
            // We need transport remote parameters.
            return _this12.safeEmitAsPromise('@needcreatetransport', null);
          })
          .then(function(transportRemoteParameters) {
            // Provide the remote SDP handler with transport remote parameters.
            _this12._remoteSdp.setTransportRemoteParameters(
              transportRemoteParameters
            );

            _this12._transportCreated = true;
          });
      },
    },
    {
      key: '_updateTransport',
      value: function _updateTransport() {
        logger.debug('_updateTransport()');

        // Get our local DTLS parameters.
        // const transportLocalParameters = {};
        const sdp = this._pc.localDescription.sdp;
        const sdpObj = _sdpTransform2.default.parse(sdp);
        const dtlsParameters = sdpCommonUtils.extractDtlsParameters(sdpObj);
        const transportLocalParameters = { dtlsParameters: dtlsParameters };

        // We need to provide transport local parameters.
        this.safeEmit('@needupdatetransport', transportLocalParameters);

        this._transportUpdated = true;
      },
    },
  ]);

  return RecvHandler;
})(Handler);

const ReactNative = (function() {
  _createClass(ReactNative, null, [
    {
      key: 'getNativeRtpCapabilities',
      value: function getNativeRtpCapabilities() {
        logger.debug('getNativeRtpCapabilities()');

        const pc = new RTCPeerConnection({
          iceServers: [],
          iceTransportPolicy: 'all',
          bundlePolicy: 'max-bundle',
          rtcpMuxPolicy: 'require',
        });

        return pc
          .createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          })
          .then(function(offer) {
            try {
              pc.close();
            } catch (error) {}

            const sdpObj = _sdpTransform2.default.parse(offer.sdp);
            const nativeRtpCapabilities = sdpCommonUtils.extractRtpCapabilities(
              sdpObj
            );

            return nativeRtpCapabilities;
          })
          .catch(function(error) {
            try {
              pc.close();
            } catch (error2) {}

            throw error;
          });
      },
    },
    {
      key: 'tag',
      get: function get() {
        return 'ReactNative';
      },
    },
  ]);

  function ReactNative(direction, extendedRtpCapabilities, settings) {
    _classCallCheck(this, ReactNative);

    logger.debug(
      'constructor() [direction:%s, extendedRtpCapabilities:%o]',
      direction,
      extendedRtpCapabilities
    );

    let rtpParametersByKind = void 0;

    switch (direction) {
      case 'send': {
        rtpParametersByKind = {
          audio: ortc.getSendingRtpParameters('audio', extendedRtpCapabilities),
          video: ortc.getSendingRtpParameters('video', extendedRtpCapabilities),
        };

        return new SendHandler(rtpParametersByKind, settings);
      }
      case 'recv': {
        rtpParametersByKind = {
          audio: ortc.getReceivingFullRtpParameters(
            'audio',
            extendedRtpCapabilities
          ),
          video: ortc.getReceivingFullRtpParameters(
            'video',
            extendedRtpCapabilities
          ),
        };

        return new RecvHandler(rtpParametersByKind, settings);
      }
    }
  }

  return ReactNative;
})();

exports.default = ReactNative;
