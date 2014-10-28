//       telegram.link
//
//       Copyright 2014 Enrico Stara 'enrico.stara@gmail.com'
//       Released under the BSD-3-Clause license
//       http://telegram.link

//      HttpConnection class
//
// This class provides a HTTP transport to communicate with `Telegram` using `MTProto` protocol

// Import dependencies
var http = require('http');
var util = require('util');
var AbstractObject = require("../type-language").AbstractObject;
var logger = require('../util/logger')('net.HttpConnection');

// The constructor accepts optionally an object to specify the connection address as following:
//
//      new HttpConnection({host: "173.240.5.253", port: "443"});
//
// `localhost:80` address is used as default otherwise
function HttpConnection(options) {
    var httpPath = require('../static').telegram.httpPath;
    options = options ?
        ({
            host: (options.proxyHost || options.host || 'localhost'),
            port: (options.proxyPort || options.port || '80'),
//            path: 'http://' + (options.host || 'localhost') + ':' + (options.port || '80') + httpPath
            path: httpPath
        }) :
        ({
            path: 'http://localhost:80' + httpPath
        });
    this.options = util._extend({
        localAddress: process.env.LOCAL_ADDRESS
    }, options);
    this._config = JSON.stringify(this.options);
    if (logger.isDebugEnabled()) logger.debug('created with %s', this._config);
}

HttpConnection.prototype.connect = function (callback) {
    if (logger.isDebugEnabled()) logger.debug('connected to %s', this._config);
    this._writeBuffers = [];
    this._writeOffset = 0;
    if (callback) callback();
};

HttpConnection.prototype.write = function (data, callback) {
    this._writeBuffers.push(data);
    this._writeOffset += data.length;
    if (logger.isDebugEnabled()) logger.debug('add buffer(%s) to the write buffer queue, total length %s',
        data.length, this._writeOffset);
    if (callback) callback();
};

HttpConnection.prototype.read = function (callback) {
    var self = this;
    var options = util._extend(this.options, {
        method: (this._writeOffset === 0 ? 'GET' : 'POST')
    });
    var onError = function (e) {
        self._request.removeListener('error', arguments.callee);
        logger.error('Error %s reading from %s', e.code, self._config);
        if (callback) {
            callback(e);
        }
    };
    this._request = http.request(options, function (res) {
        if (logger.isDebugEnabled()) {
            logger.debug('reading from %s', this._config);
            logger.debug('status: ' + res.statusCode);
            logger.debug('headers: ' + JSON.stringify(res.headers));
        }
        var onData = function (data) {
            res.removeListener('data', arguments.callee);
            self._request.removeListener('error', onError);
            if (res.statusCode === 200) {
                if (callback) {
                    callback(null, data);
                }
            } else {
                if (callback) {
                    callback(data);
                }
            }
        };
        res.on('data', onData);
    }.bind(this));
    this._request.setHeader('Content-Length', this._writeOffset);
    this._request.setHeader('Connection', 'keep-alive');
    this._request.removeHeader('Content-Type');
    this._request.removeHeader('Accept');
    if (logger.isDebugEnabled()) {
        logger.debug('content-length = %s', this._request.getHeader('Content-Length'));
        logger.debug('content-type = %s', this._request.getHeader('Content-Type'));
        logger.debug('accept = %s', this._request.getHeader('Accept'));
        logger.debug('host = %s', this._request.getHeader('Host'));
        logger.debug('connection = %s', this._request.getHeader('Connection'));
    }
    this._request.on('error', onError);
    var request = Buffer.concat(this._writeBuffers);
    this._writeBuffers = [];
    this._writeOffset = 0;
    if (logger.isDebugEnabled())  logger.debug('writing request(%s) to %s', request.length, this._config);
    this._request.end(request);
};

// Call back, nothing else..
HttpConnection.prototype.close = function (callback) {
    if (callback) callback();
};

// Export the class
module.exports = exports = HttpConnection;