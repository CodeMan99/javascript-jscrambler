'use strict';

var _lodash = require('lodash.clone');

var _lodash2 = _interopRequireDefault(_lodash);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _lodash3 = require('lodash.defaults');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.keys');

var _lodash6 = _interopRequireDefault(_lodash5);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _generateSignedParams = require('./generate-signed-params');

var _generateSignedParams2 = _interopRequireDefault(_generateSignedParams);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = !!process.env.DEBUG;

/**
 * @class JScramblerClient
 * @param {Object} options
 * @param {String} options.accessKey
 * @param {String} options.secretKey
 * @param {String} [options.host=api.jscrambler.com]
 * @param {String} [options.port=443]
 * @author José Magalhães (magalhas@gmail.com)
 * @license MIT <http://opensource.org/licenses/MIT>
 */
function JScramblerClient(options) {
  // Sluggish hack for backwards compatibility
  if (options && !options.keys && (options.accessKey || options.secretKey)) {
    options.keys = {};
    options.keys.accessKey = options.accessKey;
    options.keys.secretKey = options.secretKey;
  }

  options.keys = (0, _lodash4.default)(options.keys || {}, _config2.default.keys);

  /**
   * @member
   */
  this.options = (0, _lodash4.default)(options || {}, _config2.default);
}
/**
 * Delete request.
 * @param {String} path
 * @param {Object} params
 * @param {Callback} callback
 */
JScramblerClient.prototype.delete = function (path, params, callback) {
  return this.request('DELETE', path, params, callback);
};
/**
 * Get request.
 * @param {String} path
 * @param {Object} params
 * @param {Callback} callback
 */
JScramblerClient.prototype.get = function (path, params, callback) {
  var isJSON = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

  return this.request('GET', path, params, callback, isJSON);
};
/**
 * HTTP request.
 * @param {String} method
 * @param {String} path
 * @param {Object} params
 * @param {Callback} callback
 */
JScramblerClient.prototype.request = function (method, path) {
  var params = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var callback = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
  var isJSON = arguments.length <= 4 || arguments[4] === undefined ? true : arguments[4];

  var signedData;

  if (this.token) {
    params.token = this.token;
  } else {
    if (!this.options.keys.accessKey) {
      throw new Error('Required *accessKey* not provided');
    }

    if (!this.options.keys.secretKey) {
      throw new Error('Required *secretKey* not provided');
    }
  }

  var _keys = (0, _lodash6.default)(params);
  for (var i = 0, l = _keys.length; i < l; i++) {
    if (params[_keys[i]] instanceof Array) {
      params[_keys[i]] = params[_keys[i]].join(',');
    }
  }

  // If post sign data and set the request as multipart
  if (this.options.keys.accessKey && this.options.keys.secretKey) {
    signedData = (0, _generateSignedParams2.default)(method, path, this.options.host, this.options.keys, params);
  } else {
    signedData = params;
  }

  // Format URL
  var protocol = this.options.port === 443 ? 'https' : 'http';

  var formatedUrl = _url2.default.format({
    hostname: this.options.host,
    port: this.options.port,
    protocol: protocol
  }) + path;

  var data,
      settings = {};

  if (!isJSON) {
    settings.responseType = 'arraybuffer';
  }

  var promise;

  if (method === 'GET' || method === 'DELETE') {
    settings.params = signedData;
    promise = _axios2.default[method.toLowerCase()](formatedUrl, settings);
  } else {
    data = signedData;
    promise = _axios2.default[method.toLowerCase()](formatedUrl, data, settings);
  }

  return promise.then(function (res) {
    return callback(null, res);
  }).catch(function (error) {
    return callback(error);
  });
};
/**
 * Post request.
 * @param {String} path
 * @param {Object} params
 * @param {Callback} callback
 */
JScramblerClient.prototype.post = function (path, params, callback) {
  return this.request('POST', path, params, callback);
};

exports = module.exports = JScramblerClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvY2xpZW50LmpzIl0sIm5hbWVzIjpbImRlYnVnIiwicHJvY2VzcyIsImVudiIsIkRFQlVHIiwiSlNjcmFtYmxlckNsaWVudCIsIm9wdGlvbnMiLCJrZXlzIiwiYWNjZXNzS2V5Iiwic2VjcmV0S2V5IiwicHJvdG90eXBlIiwiZGVsZXRlIiwicGF0aCIsInBhcmFtcyIsImNhbGxiYWNrIiwicmVxdWVzdCIsImdldCIsImlzSlNPTiIsIm1ldGhvZCIsInNpZ25lZERhdGEiLCJ0b2tlbiIsIkVycm9yIiwiX2tleXMiLCJpIiwibCIsImxlbmd0aCIsIkFycmF5Iiwiam9pbiIsImhvc3QiLCJwcm90b2NvbCIsInBvcnQiLCJmb3JtYXRlZFVybCIsImZvcm1hdCIsImhvc3RuYW1lIiwiZGF0YSIsInNldHRpbmdzIiwicmVzcG9uc2VUeXBlIiwicHJvbWlzZSIsInRvTG93ZXJDYXNlIiwidGhlbiIsInJlcyIsImNhdGNoIiwiZXJyb3IiLCJwb3N0IiwiZXhwb3J0cyIsIm1vZHVsZSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxRQUFRLENBQUMsQ0FBQ0MsUUFBUUMsR0FBUixDQUFZQyxLQUE1Qjs7QUFFQTs7Ozs7Ozs7OztBQVVBLFNBQVNDLGdCQUFULENBQTJCQyxPQUEzQixFQUFvQztBQUNsQztBQUNBLE1BQUlBLFdBQVcsQ0FBQ0EsUUFBUUMsSUFBcEIsS0FBNkJELFFBQVFFLFNBQVIsSUFBcUJGLFFBQVFHLFNBQTFELENBQUosRUFBMEU7QUFDeEVILFlBQVFDLElBQVIsR0FBZSxFQUFmO0FBQ0FELFlBQVFDLElBQVIsQ0FBYUMsU0FBYixHQUF5QkYsUUFBUUUsU0FBakM7QUFDQUYsWUFBUUMsSUFBUixDQUFhRSxTQUFiLEdBQXlCSCxRQUFRRyxTQUFqQztBQUNEOztBQUVESCxVQUFRQyxJQUFSLEdBQWUsc0JBQVNE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QUFTQyxZQUFULEdBQXdCLGFBQXhCO0FBQ0Q7O0FBRUQsTUFBSUMsT0FBSjs7QUFFQSxNQUFJbkIsV0FBVyxLQUFYLElBQW9CQSxXQUFXLFFBQW5DLEVBQTZDO0FBQzNDaUIsYUFBU3RCLE1BQVQsR0FBa0JNLFVBQWxCO0FBQ0FrQixjQUFVLGdCQUFRbkIsT0FBT29CLFdBQVAsRUFBUixFQUE4QlAsV0FBOUIsRUFBMkNJLFFBQTNDLENBQVY7QUFDRCxHQUhELE1BR087QUFDTEQsV0FBT2YsVUFBUDtBQUNBa0IsY0FBVSxnQkFBUW5CLE9BQU9vQixXQUFQLEVBQVIsRUFBOEJQLFdBQTlCLEVBQTJDRyxJQUEzQyxFQUFpREMsUUFBakQsQ0FBVjtBQUNEOztBQUVELFNBQU9FLFFBQ0pFLElBREksQ0FDQyxVQUFDQyxHQUFEO0FBQUEsV0FBUzFCLFNBQVMsSUFBVCxFQUFlMEIsR0FBZixDQUFUO0FBQUEsR0FERCxFQUVKQyxLQUZJLENBRUUsVUFBQ0MsS0FBRDtBQUFBLFdBQVc1QixTQUFTNEIsS0FBVCxDQUFYO0FBQUEsR0FGRixDQUFQO0FBR0QsQ0F6REQ7QUEwREE7Ozs7OztBQU1BckMsaUJBQWlCSyxTQUFqQixDQUEyQmlDLElBQTNCLEdBQWtDLFVBQVUvQixJQUFWLEVBQWdCQyxNQUFoQixFQUF3QkMsUUFBeEIsRUFBa0M7QUFDbEUsU0FBTyxLQUFLQyxPQUFMLENBQWEsTUFBYixFQUFxQkgsSUFBckIsRUFBMkJDLE1BQTNCLEVBQW1DQyxRQUFuQyxDQUFQO0FBQ0QsQ0FGRDs7QUFJQThCLFVBQVVDLE9BQU9ELE9BQVAsR0FBaUJ2QyxnQkFBM0IiLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNsb25lIGZyb20gJ2xvZGFzaC5jbG9uZSc7XG5pbXBvcnQgY3J5cHRvIGZyb20gJ2NyeXB0byc7XG5pbXBvcnQgZGVmYXVsdHMgZnJvbSAnbG9kYXNoLmRlZmF1bHRzJztcbmltcG9ydCBrZXlzIGZyb20gJ2xvZGFzaC5rZXlzJztcbmltcG9ydCByZXF1ZXN0IGZyb20gJ2F4aW9zJztcbmltcG9ydCB1cmwgZnJvbSAndXJsJztcblxuaW1wb3J0IGNmZyBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgZ2VuZXJhdGVTaWduZWRQYXJhbXMgZnJvbSAnLi9nZW5lcmF0ZS1zaWduZWQtcGFyYW1zJztcblxuY29uc3QgZGVidWcgPSAhIXByb2Nlc3MuZW52LkRFQlVHO1xuXG4vKipcbiAqIEBjbGFzcyBKU2NyYW1ibGVyQ2xpZW50XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMuYWNjZXNzS2V5XG4gKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5zZWNyZXRLZXlcbiAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5ob3N0PWFwaS5qc2NyYW1ibGVyLmNvbV1cbiAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5wb3J0PTQ0M11cbiAqIEBhdXRob3IgSm9zw6kgTWFnYWxow6NlcyAobWFnYWxoYXNAZ21haWwuY29tKVxuICogQGxpY2Vuc2UgTUlUIDxodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUPlxuICovXG5mdW5jdGlvbiBKU2NyYW1ibGVyQ2xpZW50IChvcHRpb25zKSB7XG4gIC8vIFNsdWdnaXNoIGhhY2sgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG4gIGlmIChvcHRpb25zICYmICFvcHRpb25zLmtleXMgJiYgKG9wdGlvbnMuYWNjZXNzS2V5IHx8IG9wdGlvbnMuc2VjcmV0S2V5KSkge1xuICAgIG9wdGlvbnMua2V5cyA9IHt9O1xuICAgIG9wdGlvbnMua2V5cy5hY2Nlc3NLZXkgPSBvcHRpb25zLmFjY2Vzc0tleTtcbiAgICBvcHRpb25zLmtleXMuc2VjcmV0S2V5ID0gb3B0aW9ucy5zZWNyZXRLZXk7XG4gIH1cblxuICBvcHRpb25zLmtleXMgPSBkZWZhdWx0cyhvcHRpb25zLmtleXMgfHwge30sIGNmZy5rZXlzKTtcblxuICAvKipcbiAgICogQG1lbWJlclxuICAgKi9cbiAgdGhpcy5vcHRpb25zID0gZGVmYXVsdHMob3B0aW9ucyB8fCB7fSwgY2ZnKTtcbn1cbi8qKlxuICogRGVsZXRlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICogQHBhcmFtIHtPYmplY3R9IHBhcmFtc1xuICogQHBhcmFtIHtDYWxsYmFja30gY2FsbGJhY2tcbiAqL1xuSlNjcmFtYmxlckNsaWVudC5wcm90b3R5cGUuZGVsZXRlID0gZnVuY3Rpb24gKHBhdGgsIHBhcmFtcywgY2FsbGJhY2spIHtcbiAgcmV0dXJuIHRoaXMucmVxdWVzdCgnREVMRVRFJywgcGF0aCwgcGFyYW1zLCBjYWxsYmFjayk7XG59O1xuLyoqXG4gKiBHZXQgcmVxdWVzdC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXG4gKiBAcGFyYW0ge0NhbGxiYWNrfSBjYWxsYmFja1xuICovXG5KU2NyYW1ibGVyQ2xpZW50LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAocGF0aCwgcGFyYW1zLCBjYWxsYmFjaywgaXNKU09OID0gdHJ1ZSkge1xuICByZXR1cm4gdGhpcy5yZXF1ZXN0KCdHRVQnLCBwYXRoLCBwYXJhbXMsIGNhbGxiYWNrLCBpc0pTT04pO1xufTtcbi8qKlxuICogSFRUUCByZXF1ZXN0LlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcbiAqIEBwYXJhbSB7Q2FsbGJhY2t9IGNhbGxiYWNrXG4gKi9cbkpTY3JhbWJsZXJDbGllbnQucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiAobWV0aG9kLCBwYXRoLCBwYXJhbXMgPSB7fSwgY2FsbGJhY2sgPSBudWxsLCBpc0pTT04gPSB0cnVlKSB7XG4gIHZhciBzaWduZWREYXRhO1xuXG4gIGlmICh0aGlzLnRva2VuKSB7XG4gICAgcGFyYW1zLnRva2VuID0gdGhpcy50b2tlbjtcbiAgfSBlbHNlIHtcbiAgICBpZiAoIXRoaXMub3B0aW9ucy5rZXlzLmFjY2Vzc0tleSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXF1aXJlZCAqYWNjZXNzS2V5KiBub3QgcHJvdmlkZWQnKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5rZXlzLnNlY3JldEtleSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXF1aXJlZCAqc2VjcmV0S2V5KiBub3QgcHJvdmlkZWQnKTtcbiAgICB9XG4gIH1cblxuICB2YXIgX2tleXMgPSBrZXlzKHBhcmFtcyk7XG4gIGZvciAodmFyIGkgPSAwLCBsID0gX2tleXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgaWYocGFyYW1zW19rZXlzW2ldXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBwYXJhbXNbX2tleXNbaV1dID0gcGFyYW1zW19rZXlzW2ldXS5qb2luKCcsJyk7XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgcG9zdCBzaWduIGRhdGEgYW5kIHNldCB0aGUgcmVxdWVzdCBhcyBtdWx0aXBhcnRcbiAgaWYgKHRoaXMub3B0aW9ucy5rZXlzLmFjY2Vzc0tleSAmJiB0aGlzLm9wdGlvbnMua2V5cy5zZWNyZXRLZXkpIHtcbiAgICBzaWduZWREYXRhID0gZ2VuZXJhdGVTaWduZWRQYXJhbXMobWV0aG9kLCBwYXRoLCB0aGlzLm9wdGlvbnMuaG9zdCwgdGhpcy5vcHRpb25zLmtleXMsIHBhcmFtcyk7XG4gIH0gZWxzZSB7XG4gICAgc2lnbmVkRGF0YSA9IHBhcmFtcztcbiAgfVxuXG4gIC8vIEZvcm1hdCBVUkxcbiAgdmFyIHByb3RvY29sID0gdGhpcy5vcHRpb25zLnBvcnQgPT09IDQ0MyA/ICdodHRwcycgOiAnaHR0cCc7XG5cbiAgdmFyIGZvcm1hdGVkVXJsID0gdXJsLmZvcm1hdCh7XG4gICAgaG9zdG5hbWU6IHRoaXMub3B0aW9ucy5ob3N0LFxuICAgIHBvcnQ6IHRoaXMub3B0aW9ucy5wb3J0LFxuICAgIHByb3RvY29sOiBwcm90b2NvbFxuICB9KSArIHBhdGg7XG5cbiAgdmFyIGRhdGEsIHNldHRpbmdzID0ge307XG5cbiAgaWYgKCFpc0pTT04pIHtcbiAgICBzZXR0aW5ncy5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuICB9XG5cbiAgdmFyIHByb21pc2U7XG5cbiAgaWYgKG1ldGhvZCA9PT0gJ0dFVCcgfHwgbWV0aG9kID09PSAnREVMRVRFJykge1xuICAgIHNldHRpbmdzLnBhcmFtcyA9IHNpZ25lZERhdGE7XG4gICAgcHJvbWlzZSA9IHJlcXVlc3RbbWV0aG9kLnRvTG93ZXJDYXNlKCldKGZvcm1hdGVkVXJsLCBzZXR0aW5ncyk7XG4gIH0gZWxzZSB7XG4gICAgZGF0YSA9IHNpZ25lZERhdGE7XG4gICAgcHJvbWlzZSA9IHJlcXVlc3RbbWV0aG9kLnRvTG93ZXJDYXNlKCldKGZvcm1hdGVkVXJsLCBkYXRhLCBzZXR0aW5ncyk7XG4gIH1cblxuICByZXR1cm4gcHJvbWlzZVxuICAgIC50aGVuKChyZXMpID0+IGNhbGxiYWNrKG51bGwsIHJlcykpXG4gICAgLmNhdGNoKChlcnJvcikgPT4gY2FsbGJhY2soZXJyb3IpKTtcbn07XG4vKipcbiAqIFBvc3QgcmVxdWVzdC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXG4gKiBAcGFyYW0ge0NhbGxiYWNrfSBjYWxsYmFja1xuICovXG5KU2NyYW1ibGVyQ2xpZW50LnByb3RvdHlwZS5wb3N0ID0gZnVuY3Rpb24gKHBhdGgsIHBhcmFtcywgY2FsbGJhY2spIHtcbiAgcmV0dXJuIHRoaXMucmVxdWVzdCgnUE9TVCcsIHBhdGgsIHBhcmFtcywgY2FsbGJhY2spO1xufTtcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gSlNjcmFtYmxlckNsaWVudDtcbiJdfQ==
