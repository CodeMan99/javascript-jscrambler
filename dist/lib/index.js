'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

require('babel-polyfill');

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _generateSignedParams = require('./generate-signed-params');

var _generateSignedParams2 = _interopRequireDefault(_generateSignedParams);

var _client = require('./client');

var _client2 = _interopRequireDefault(_client);

var _mutations = require('./mutations');

var _queries = require('./queries');

var _zip2 = require('./zip');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = {
  Client: _client2.default,
  config: _config2.default,
  generateSignedParams: _generateSignedParams2.default,
  // This method is a shortcut method that accepts an object with everything needed
  // for the entire process of requesting an application protection and downloading
  // that same protection when the same ends.
  //
  // `configPathOrObject` can be a path to a JSON or directly an object containing
  // the following structure:
  //
  // ```json
  // {
  //   "keys": {
  //     "accessKey": "",
  //     "secretKey": ""
  //   },
  //   "applicationId": "",
  //   "filesDest": ""
  // }
  // ```
  //
  // Also the following optional parameters are accepted:
  //
  // ```json
  // {
  //   "filesSrc": [""],
  //   "params": {},
  //   "cwd": "",
  //   "host": "api.jscrambler.com",
  //   "port": "443"
  // }
  // ```
  //
  // `filesSrc` supports glob patterns, and if it's provided it will replace the
  // entire application sources.
  //
  // `params` if provided will replace all the application transformation parameters.
  //
  // `cwd` allows you to set the current working directory to resolve problems with
  // relative paths with your `filesSrc` is outside the current working directory.
  //
  // Finally, `host` and `port` can be overridden if you to engage with a different
  // endpoint than the default one, useful if you're running an enterprise version of
  // Jscrambler or if you're provided access to beta features of our product.
  //
  protectAndDownload: function protectAndDownload(configPathOrObject, destCallback) {
    var _this = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
      var config, applicationId, host, port, keys, filesDest, filesSrc, cwd, params, applicationTypes, languageSpecifications, sourceMaps, areSubscribersOrdered, useRecommendedOrder, bail, accessKey, secretKey, client, _filesSrc, i, l, _zip, removeSourceRes, hadNoSources, addApplicationSourceRes, $set, updateApplicationRes, createApplicationProtectionRes, protectionId, protection, errors, download;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              config = typeof configPathOrObject === 'string' ? require(configPathOrObject) : configPathOrObject;
              applicationId = config.applicationId, host = config.host, port = config.port, keys = config.keys, filesDest = config.filesDest, filesSrc = config.filesSrc, cwd = config.cwd, params = config.params, applicationTypes = config.applicationTypes, languageSpecifications = config.languageSpecifications, sourceMaps = config.sourceMaps, areSubscribersOrdered = config.areSubscribersOrdered, useRecommendedOrder = config.useRecommendedOrder, bail = config.bail;
              accessKey = keys.accessKey, secretKey = keys.secretKey;
              client = new _this.Client({
                accessKey: accessKey,
                secretKey: secretKey,
                host: host,
                port: port
              });

              if (applicationId) {
                _context.next = 6;
                break;
              }

              throw new Error('Required *applicationId* not provided');

            case 6:
              if (!(!filesDest && !destCallback)) {
                _context.next = 8;
                break;
              }

              throw new Error('Required *filesDest* not provided');

            case 8:
              if (!(filesSrc && filesSrc.length)) {
                _context.next = 26;
                break;
              }

              _filesSrc = [];

              for (i = 0, l = filesSrc.length; i < l; ++i) {
                if (typeof filesSrc[i] === 'string') {
                  // TODO Replace `glob.sync` with async version
                  _filesSrc = _filesSrc.concat(_glob2.default.sync(filesSrc[i], {
                    dot: true
                  }));
                } else {
                  _filesSrc.push(filesSrc[i]);
                }
              }

              _context.next = 13;
              return (0, _zip2.zip)(_filesSrc, cwd);

            case 13:
              _zip = _context.sent;
              _context.next = 16;
              return _this.removeSourceFromApplication(client, '', applicationId);

            case 16:
              removeSourceRes = _context.sent;

              if (!removeSourceRes.errors) {
                _context.next = 22;
                break;
              }

              // TODO Implement error codes or fix this is on the services
              hadNoSources = false;

              removeSourceRes.errors.forEach(function (error) {
                if (error.message === 'Application Source with the given ID does not exist') {
                  hadNoSources = true;
                }
              });

              if (hadNoSources) {
                _context.next = 22;
                break;
              }

              throw new Error(removeSourceRes.errors[0].message);

            case 22:
              _context.next = 24;
              return _this.addApplicationSource(client, applicationId, {
                content: _zip.generate({
                  type: 'base64'
                }),
                filename: 'application.zip',
                extension: 'zip'
              });

            case 24:
              addApplicationSourceRes = _context.sent;

              errorHandler(addApplicationSourceRes);

            case 26:
              $set = {
                _id: applicationId
              };


              if (params && Object.keys(params).length) {
                $set.parameters = JSON.stringify(normalizeParameters(params));
                $set.areSubscribersOrdered = Array.isArray(params);
              }

              if (typeof areSubscribersOrdered !== 'undefined') {
                $set.areSubscribersOrdered = areSubscribersOrdered;
              }

              if (applicationTypes) {
                $set.applicationTypes = applicationTypes;
              }

              if (useRecommendedOrder) {
                $set.useRecommendedOrder = useRecommendedOrder;
              }

              if (languageSpecifications) {
                $set.languageSpecifications = languageSpecifications;
              }

              if ((typeof sourceMaps === 'undefined' ? 'undefined' : _typeof(sourceMaps)) !== undefined) {
                $set.sourceMaps = JSON.stringify(sourceMaps);
              }

              if (!($set.parameters || $set.applicationTypes || $set.languageSpecifications || typeof $set.areSubscribersOrdered !== 'undefined')) {
                _context.next = 38;
                break;
              }

              _context.next = 36;
              return _this.updateApplication(client, $set);

            case 36:
              updateApplicationRes = _context.sent;

              errorHandler(updateApplicationRes);

            case 38:
              _context.next = 40;
              return _this.createApplicationProtection(client, applicationId, bail);

            case 40:
              createApplicationProtectionRes = _context.sent;

              errorHandler(createApplicationProtectionRes);

              protectionId = createApplicationProtectionRes.data.createApplicationProtection._id;
              _context.next = 45;
              return _this.pollProtection(client, applicationId, protectionId);

            case 45:
              protection = _context.sent;
              errors = [];

              protection.sources.forEach(function (s) {
                if (s.errorMessages && s.errorMessages.length > 0) {
                  errors.push.apply(errors, _toConsumableArray(s.errorMessages.map(function (e) {
                    return _extends({
                      filename: s.filename
                    }, e);
                  })));
                }
              });

              if (!(!bail && errors.length > 0)) {
                _context.next = 52;
                break;
              }

              errors.forEach(function (e) {
                return console.error('Non-fatal error: "' + e.message + '" in ' + e.filename);
              });
              _context.next = 55;
              break;

            case 52:
              if (!(bail && protection.state === 'errored')) {
                _context.next = 55;
                break;
              }

              errors.forEach(function (e) {
                return console.error('Error: "' + e.message + '" in ' + e.filename + (e.line ? ':' + e.line : ''));
              });
              throw new Error('Parsing errors ocurred');

            case 55:
              _context.next = 57;
              return _this.downloadApplicationProtection(client, protectionId);

            case 57:
              download = _context.sent;

              errorHandler(download);
              (0, _zip2.unzip)(download, filesDest || destCallback);
              console.log(protectionId);

            case 61:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }))();
  },
  downloadSourceMaps: function downloadSourceMaps(configs, destCallback) {
    var _this2 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
      var keys, host, port, filesDest, filesSrc, protectionId, accessKey, secretKey, client, download;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              keys = configs.keys, host = configs.host, port = configs.port, filesDest = configs.filesDest, filesSrc = configs.filesSrc, protectionId = configs.protectionId;
              accessKey = keys.accessKey, secretKey = keys.secretKey;
              client = new _this2.Client({
                accessKey: accessKey,
                secretKey: secretKey,
                host: host,
                port: port
              });

              if (!(!filesDest && !destCallback)) {
                _context2.next = 5;
                break;
              }

              throw new Error('Required *filesDest* not provided');

            case 5:
              if (protectionId) {
                _context2.next = 7;
                break;
              }

              throw new Error('Required *protectionId* not provided');

            case 7:

              if (filesSrc) {
                console.log('[Warning] Ignoring sources supplied. Downloading source maps of given protection');
              }
              download = void 0;
              _context2.prev = 9;
              _context2.next = 12;
              return _this2.downloadSourceMapsRequest(client, protectionId);

            case 12:
              download = _context2.sent;
              _context2.next = 18;
              break;

            case 15:
              _context2.prev = 15;
              _context2.t0 = _context2['catch'](9);

              errorHandler(_context2.t0);

            case 18:
              (0, _zip2.unzip)(download, filesDest || destCallback);

            case 19:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this2, [[9, 15]]);
    }))();
  },
  pollProtection: function pollProtection(client, applicationId, protectionId) {
    var _this3 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
      var deferred, poll;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              deferred = _q2.default.defer();

              poll = function () {
                var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
                  var applicationProtection, state, bail, url;
                  return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                      switch (_context3.prev = _context3.next) {
                        case 0:
                          _context3.next = 2;
                          return _this3.getApplicationProtection(client, applicationId, protectionId);

                        case 2:
                          applicationProtection = _context3.sent;

                          if (!applicationProtection.errors) {
                            _context3.next = 8;
                            break;
                          }

                          console.log('Error polling protection', applicationProtection.errors);
                          throw new Error('Error polling protection');

                        case 8:
                          state = applicationProtection.data.applicationProtection.state;
                          bail = applicationProtection.data.applicationProtection.bail;

                          if (state !== 'finished' && state !== 'errored') {
                            setTimeout(poll, 500);
                          } else if (state === 'errored' && !bail) {
                            url = 'https://app.jscrambler.com/app/' + applicationId + '/protections/' + protectionId;

                            deferred.reject('Protection failed. For more information visit: ' + url);
                          } else {
                            deferred.resolve(applicationProtection.data.applicationProtection);
                          }

                        case 11:
                        case 'end':
                          return _context3.stop();
                      }
                    }
                  }, _callee3, _this3);
                }));

                return function poll() {
                  return _ref.apply(this, arguments);
                };
              }();

              poll();

              return _context4.abrupt('return', deferred.promise);

            case 4:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this3);
    }))();
  },

  //
  createApplication: function createApplication(client, data, fragments) {
    var _this4 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.createApplication)(data, fragments), responseHandler(deferred));
              return _context5.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, _this4);
    }))();
  },

  //
  duplicateApplication: function duplicateApplication(client, data, fragments) {
    var _this5 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.duplicateApplication)(data, fragments), responseHandler(deferred));
              return _context6.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, _this5);
    }))();
  },

  //
  removeApplication: function removeApplication(client, id) {
    var _this6 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee7() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.removeApplication)(id), responseHandler(deferred));
              return _context7.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, _this6);
    }))();
  },

  //
  removeProtection: function removeProtection(client, id, appId, fragments) {
    var _this7 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee8() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.removeProtection)(id, appId, fragments), responseHandler(deferred));
              return _context8.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, _this7);
    }))();
  },

  //
  cancelProtection: function cancelProtection(client, id, appId, fragments) {
    var _this8 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee9() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.cancelProtection)(id, appId, fragments), responseHandler(deferred));
              return _context9.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context9.stop();
          }
        }
      }, _callee9, _this8);
    }))();
  },

  //
  updateApplication: function updateApplication(client, application, fragments) {
    var _this9 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee10() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.updateApplication)(application, fragments), responseHandler(deferred));
              return _context10.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context10.stop();
          }
        }
      }, _callee10, _this9);
    }))();
  },

  //
  unlockApplication: function unlockApplication(client, application, fragments) {
    var _this10 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee11() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.unlockApplication)(application, fragments), responseHandler(deferred));
              return _context11.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context11.stop();
          }
        }
      }, _callee11, _this10);
    }))();
  },

  //
  getApplication: function getApplication(client, applicationId, fragments) {
    var _this11 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee12() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application', (0, _queries.getApplication)(applicationId, fragments), responseHandler(deferred));
              return _context12.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context12.stop();
          }
        }
      }, _callee12, _this11);
    }))();
  },

  //
  getApplicationSource: function getApplicationSource(client, sourceId, fragments, limits) {
    var _this12 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee13() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application', (0, _queries.getApplicationSource)(sourceId, fragments, limits), responseHandler(deferred));
              return _context13.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context13.stop();
          }
        }
      }, _callee13, _this12);
    }))();
  },

  //
  getApplicationProtections: function getApplicationProtections(client, applicationId, params, fragments) {
    var _this13 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee14() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee14$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application', (0, _queries.getApplicationProtections)(applicationId, params, fragments), responseHandler(deferred));
              return _context14.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context14.stop();
          }
        }
      }, _callee14, _this13);
    }))();
  },

  //
  getApplicationProtectionsCount: function getApplicationProtectionsCount(client, applicationId, fragments) {
    var _this14 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee15() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee15$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application', (0, _queries.getApplicationProtectionsCount)(applicationId, fragments), responseHandler(deferred));
              return _context15.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context15.stop();
          }
        }
      }, _callee15, _this14);
    }))();
  },

  //
  createTemplate: function createTemplate(client, template, fragments) {
    var _this15 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee16() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee16$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.createTemplate)(template, fragments), responseHandler(deferred));
              return _context16.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context16.stop();
          }
        }
      }, _callee16, _this15);
    }))();
  },

  //
  removeTemplate: function removeTemplate(client, id) {
    var _this16 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee17() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee17$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.removeTemplate)(id), responseHandler(deferred));
              return _context17.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context17.stop();
          }
        }
      }, _callee17, _this16);
    }))();
  },

  //
  getTemplates: function getTemplates(client, fragments) {
    var _this17 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee18() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee18$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application', (0, _queries.getTemplates)(fragments), responseHandler(deferred));
              return _context18.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context18.stop();
          }
        }
      }, _callee18, _this17);
    }))();
  },

  //
  getApplications: function getApplications(client, fragments) {
    var _this18 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee19() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee19$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application', (0, _queries.getApplications)(fragments), responseHandler(deferred));
              return _context19.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context19.stop();
          }
        }
      }, _callee19, _this18);
    }))();
  },

  //
  addApplicationSource: function addApplicationSource(client, applicationId, applicationSource, fragments) {
    var _this19 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee20() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee20$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.addApplicationSource)(applicationId, applicationSource, fragments), responseHandler(deferred));
              return _context20.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context20.stop();
          }
        }
      }, _callee20, _this19);
    }))();
  },

  //
  addApplicationSourceFromURL: function addApplicationSourceFromURL(client, applicationId, url, fragments) {
    var _this20 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee21() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee21$(_context21) {
        while (1) {
          switch (_context21.prev = _context21.next) {
            case 0:
              deferred = _q2.default.defer();
              return _context21.abrupt('return', getFileFromUrl(client, url).then(function (file) {
                client.post('/application', (0, _mutations.addApplicationSource)(applicationId, file, fragments), responseHandler(deferred));
                return deferred.promise;
              }));

            case 2:
            case 'end':
              return _context21.stop();
          }
        }
      }, _callee21, _this20);
    }))();
  },

  //
  updateApplicationSource: function updateApplicationSource(client, applicationSource, fragments) {
    var _this21 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee22() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee22$(_context22) {
        while (1) {
          switch (_context22.prev = _context22.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.updateApplicationSource)(applicationSource, fragments), responseHandler(deferred));
              return _context22.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context22.stop();
          }
        }
      }, _callee22, _this21);
    }))();
  },

  //
  removeSourceFromApplication: function removeSourceFromApplication(client, sourceId, applicationId, fragments) {
    var _this22 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee23() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee23$(_context23) {
        while (1) {
          switch (_context23.prev = _context23.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.removeSourceFromApplication)(sourceId, applicationId, fragments), responseHandler(deferred));
              return _context23.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context23.stop();
          }
        }
      }, _callee23, _this22);
    }))();
  },

  //
  applyTemplate: function applyTemplate(client, templateId, appId, fragments) {
    var _this23 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee24() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee24$(_context24) {
        while (1) {
          switch (_context24.prev = _context24.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.applyTemplate)(templateId, appId, fragments), responseHandler(deferred));
              return _context24.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context24.stop();
          }
        }
      }, _callee24, _this23);
    }))();
  },

  //
  updateTemplate: function updateTemplate(client, template, fragments) {
    var _this24 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee25() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee25$(_context25) {
        while (1) {
          switch (_context25.prev = _context25.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.updateTemplate)(template, fragments), responseHandler(deferred));
              return _context25.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context25.stop();
          }
        }
      }, _callee25, _this24);
    }))();
  },

  //
  createApplicationProtection: function createApplicationProtection(client, applicationId, bail, fragments) {
    var _this25 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee26() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee26$(_context26) {
        while (1) {
          switch (_context26.prev = _context26.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.createApplicationProtection)(applicationId, bail, fragments), responseHandler(deferred));
              return _context26.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context26.stop();
          }
        }
      }, _callee26, _this25);
    }))();
  },

  //
  getApplicationProtection: function getApplicationProtection(client, applicationId, protectionId, fragments) {
    var _this26 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee27() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee27$(_context27) {
        while (1) {
          switch (_context27.prev = _context27.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application', (0, _queries.getProtection)(applicationId, protectionId, fragments), responseHandler(deferred));
              return _context27.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context27.stop();
          }
        }
      }, _callee27, _this26);
    }))();
  },

  //
  downloadSourceMapsRequest: function downloadSourceMapsRequest(client, protectionId) {
    var _this27 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee28() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee28$(_context28) {
        while (1) {
          switch (_context28.prev = _context28.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application/sourceMaps/' + protectionId, null, responseHandler(deferred), false);
              return _context28.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context28.stop();
          }
        }
      }, _callee28, _this27);
    }))();
  },

  //
  downloadApplicationProtection: function downloadApplicationProtection(client, protectionId) {
    var _this28 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee29() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee29$(_context29) {
        while (1) {
          switch (_context29.prev = _context29.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application/download/' + protectionId, null, responseHandler(deferred), false);
              return _context29.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context29.stop();
          }
        }
      }, _callee29, _this28);
    }))();
  }
};


function getFileFromUrl(client, url) {
  var deferred = _q2.default.defer();
  var file;
  _axios2.default.get(url).then(function (res) {
    file = {
      content: res.data,
      filename: _path2.default.basename(url),
      extension: _path2.default.extname(url).substr(1)
    };
    deferred.resolve(file);
  }).catch(function (err) {
    deferred.reject(err);
  });
  return deferred.promise;
}

function responseHandler(deferred) {
  return function (err, res) {
    if (err) {
      deferred.reject(err);
    } else {
      var body = res.data;
      try {
        if (res.status >= 400) {
          deferred.reject(body);
        } else {
          deferred.resolve(body);
        }
      } catch (ex) {
        deferred.reject(body);
      }
    }
  };
}

function errorHandler(res) {
  if (res.errors && res.errors.length) {
    res.errors.forEach(function (error) {
      throw new Error(error.message);
    });
  }

  if (res.message) {
    throw new Error(res.message);
  }

  return res;
}

function normalizeParameters(parameters) {
  var result;

  if (!Array.isArray(parameters)) {
    result = [];
    Object.keys(parameters).forEach(function (name) {
      result.push({
        name: name,
        options: parameters[name]
      });
    });
  } else {
    result = parameters;
  }

  return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvaW5kZXguanMiXSwibmFtZXMiOlsiQ2xpZW50IiwiY29uZmlnIiwiZ2VuZXJhdGVTaWduZWRQYXJhbXMiLCJwcm90ZWN0QW5kRG93bmxvYWQiLCJjb25maWdQYXRoT3JPYmplY3QiLCJkZXN0Q2FsbGJhY2siLCJyZXF1aXJlIiwiYXBwbGljYXRpb25JZCIsImhvc3QiLCJwb3J0Iiwia2V5cyIsImZpbGVzRGVzdCIsImZpbGVzU3JjIiwiY3dkIiwicGFyYW1zIiwiYXBwbGljYXRpb25UeXBlcyIsImxhbmd1YWdlU3BlY2lmaWNhdGlvbnMiLCJzb3VyY2VNYXBzIiwiYXJlU3Vic2NyaWJlcnNPcmRlcmVkIiwidXNlUmVjb21tZW5kZWRPcmRlciIsImJhaWwiLCJhY2Nlc3NLZXkiLCJzZWNyZXRLZXkiLCJjbGllbnQiLCJFcnJvciIsImxlbmd0aCIsIl9maWxlc1NyYyIsImkiLCJsIiwiY29uY2F0Iiwic3luYyIsImRvdCIsInB1c2giLCJfemlwIiwicmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uIiwicmVtb3ZlU291cmNlUmVzIiwiZXJyb3JzIiwiaGFkTm9Tb3VyY2VzIiwiZm9yRWFjaCIsImVycm9yIiwibWVzc2FnZSIsImFkZEFwcGxpY2F0aW9uU291cmNlIiwiY29udGVudCIsImdlbmVyYXRlIiwidHlwZSIsImZpbGVuYW1lIiwiZXh0ZW5zaW9uIiwiYWRkQXBwbGljYXRpb25Tb3VyY2VSZXMiLCJlcnJvckhhbmRsZXIiLCIkc2V0IiwiX2lkIiwiT2JqZWN0IiwicGFyYW1ldGVycyIsIkpTT04iLCJzdHJpbmdpZnkiLCJub3JtYWxpemVQYXJhbWV0ZXJzIiwiQXJyYXkiLCJpc0FycmF5IiwidW5kZWZpbmVkIiwidXBkYXRlQXBwbGljYXRpb24iLCJ1cGRhdGVBcHBsaWNhdGlvblJlcyIsImNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbiIsImNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcyIsInByb3RlY3Rpb25JZCIsImRhdGEiLCJwb2xsUHJvdGVjdGlvbiIsInByb3RlY3Rpb24iLCJzb3VyY2VzIiwicyIsImVycm9yTWVzc2FnZXMiLCJtYXAiLCJlIiwiY29uc29sZSIsInN0YXRlIiwibGluZSIsImRvd25sb2FkQXBwbGljYXRpb25Qcm90ZWN0aW9uIiwiZG93bmxvYWQiLCJsb2ciLCJkb3dubG9hZFNvdXJjZU1hcHMiLCJjb25maWdzIiwiZG93bmxvYWRTb3VyY2VNYXBzUmVxdWVzdCIsImRlZmVycmVkIiwiZGVmZXIiLCJwb2xsIiwiZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uIiwiYXBwbGljYXRpb25Qcm90ZWN0aW9uIiwic2V0VGltZW91dCIsInVybCIsInJlamVjdCIsInJlc29sdmUiLCJwcm9taXNlIiwiY3JlYXRlQXBwbGljYXRpb24iLCJmcmFnbWVudHMiLCJwb3N0IiwicmVzcG9uc2VIYW5kbGVyIiwiZHVwbGljYXRlQXBwbGljYXRpb24iLCJyZW1vdmVBcHBsaWNhdGlvbiIsImlkIiwicmVtb3ZlUHJvdGVjdGlvbiIsImFwcElkIiwiY2FuY2VsUHJvdGVjdGlvbiIsImFwcGxpY2F0aW9uIiwidW5sb2NrQXBwbGljYXRpb24iLCJnZXRBcHBsaWNhdGlvbiIsImdldCIsImdldEFwcGxpY2F0aW9uU291cmNlIiwic291cmNlSWQiLCJsaW1pdHMiLCJnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zIiwiZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50IiwiY3JlYXRlVGVtcGxhdGUiLCJ0ZW1wbGF0ZSIsInJlbW92ZVRlbXBsYXRlIiwiZ2V0VGVtcGxhdGVzIiwiZ2V0QXBwbGljYXRpb25zIiwiYXBwbGljYXRpb25Tb3VyY2UiLCJhZGRBcHBsaWNhdGlvblNvdXJjZUZyb21VUkwiLCJnZXRGaWxlRnJvbVVybCIsInRoZW4iLCJmaWxlIiwidXBkYXRlQXBwbGljYXRpb25Tb3VyY2UiLCJhcHBseVRlbXBsYXRlIiwidGVtcGxhdGVJZCIsInVwZGF0ZVRlbXBsYXRlIiwicmVzIiwiYmFzZW5hbWUiLCJleHRuYW1lIiwic3Vic3RyIiwiY2F0Y2giLCJlcnIiLCJib2R5Iiwic3RhdHVzIiwiZXgiLCJyZXN1bHQiLCJuYW1lIiwib3B0aW9ucyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBaUJBOztBQVNBOzs7Ozs7OztrQkFLZTtBQUNiQSwwQkFEYTtBQUViQywwQkFGYTtBQUdiQyxzREFIYTtBQUliO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNNQyxvQkE5Q08sOEJBOENhQyxrQkE5Q2IsRUE4Q2lDQyxZQTlDakMsRUE4QytDO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNwREosb0JBRG9ELEdBQzNDLE9BQU9HLGtCQUFQLEtBQThCLFFBQTlCLEdBQ2JFLFFBQVFGLGtCQUFSLENBRGEsR0FDaUJBLGtCQUYwQjtBQUt4REcsMkJBTHdELEdBbUJ0RE4sTUFuQnNELENBS3hETSxhQUx3RCxFQU14REMsSUFOd0QsR0FtQnREUCxNQW5Cc0QsQ0FNeERPLElBTndELEVBT3hEQyxJQVB3RCxHQW1CdERSLE1BbkJzRCxDQU94RFEsSUFQd0QsRUFReERDLElBUndELEdBbUJ0RFQsTUFuQnNELENBUXhEUyxJQVJ3RCxFQVN4REMsU0FUd0QsR0FtQnREVixNQW5Cc0QsQ0FTeERVLFNBVHdELEVBVXhEQyxRQVZ3RCxHQW1CdERYLE1BbkJzRCxDQVV4RFcsUUFWd0QsRUFXeERDLEdBWHdELEdBbUJ0RFosTUFuQnNELENBV3hEWSxHQVh3RCxFQVl4REMs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LEVBQWlCO0FBQ2xDLFlBQU0sSUFBSWYsS0FBSixDQUFVZSxNQUFNQyxPQUFoQixDQUFOO0FBQ0QsS0FGRDtBQUdEOztBQUVELE1BQUlvRixJQUFJcEYsT0FBUixFQUFpQjtBQUNmLFVBQU0sSUFBSWhCLEtBQUosQ0FBVW9HLElBQUlwRixPQUFkLENBQU47QUFDRDs7QUFFRCxTQUFPb0YsR0FBUDtBQUNEOztBQUVELFNBQVNyRSxtQkFBVCxDQUE4QkgsVUFBOUIsRUFBMEM7QUFDeEMsTUFBSWlGLE1BQUo7O0FBRUEsTUFBSSxDQUFDN0UsTUFBTUMsT0FBTixDQUFjTCxVQUFkLENBQUwsRUFBZ0M7QUFDOUJpRixhQUFTLEVBQVQ7QUFDQWxGLFdBQU96QyxJQUFQLENBQVkwQyxVQUFaLEVBQXdCZCxPQUF4QixDQUFnQyxVQUFDZ0csSUFBRCxFQUFVO0FBQ3hDRCxhQUFPckcsSUFBUCxDQUFZO0FBQ1ZzRyxrQkFEVTtBQUVWQyxpQkFBU25GLFdBQVdrRixJQUFYO0FBRkMsT0FBWjtBQUlELEtBTEQ7QUFNRCxHQVJELE1BUU87QUFDTEQsYUFBU2pGLFVBQVQ7QUFDRDs7QUFFRCxTQUFPaUYsTUFBUDtBQUNEIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICdiYWJlbC1wb2x5ZmlsbCc7XG5cbmltcG9ydCBnbG9iIGZyb20gJ2dsb2InO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgcmVxdWVzdCBmcm9tICdheGlvcyc7XG5pbXBvcnQgUSBmcm9tICdxJztcblxuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgZ2VuZXJhdGVTaWduZWRQYXJhbXMgZnJvbSAnLi9nZW5lcmF0ZS1zaWduZWQtcGFyYW1zJztcbmltcG9ydCBKU2NyYW1ibGVyQ2xpZW50IGZyb20gJy4vY2xpZW50JztcbmltcG9ydCB7XG4gIGFkZEFwcGxpY2F0aW9uU291cmNlLFxuICBjcmVhdGVBcHBsaWNhdGlvbixcbiAgcmVtb3ZlQXBwbGljYXRpb24sXG4gIHVwZGF0ZUFwcGxpY2F0aW9uLFxuICB1cGRhdGVBcHBsaWNhdGlvblNvdXJjZSxcbiAgcmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uLFxuICBjcmVhdGVUZW1wbGF0ZSxcbiAgcmVtb3ZlVGVtcGxhdGUsXG4gIHVwZGF0ZVRlbXBsYXRlLFxuICBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24sXG4gIHJlbW92ZVByb3RlY3Rpb24sXG4gIGNhbmNlbFByb3RlY3Rpb24sXG4gIGR1cGxpY2F0ZUFwcGxpY2F0aW9uLFxuICB1bmxvY2tBcHBsaWNhdGlvbixcbiAgYXBwbHlUZW1wbGF0ZVxufSBmcm9tICcuL211dGF0aW9ucyc7XG5pbXBvcnQge1xuICBnZXRBcHBsaWNhdGlvbixcbiAgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9ucyxcbiAgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50LFxuICBnZXRBcHBsaWNhdGlvbnMsXG4gIGdldEFwcGxpY2F0aW9uU291cmNlLFxuICBnZXRUZW1wbGF0ZXMsXG4gIGdldFByb3RlY3Rpb25cbn0gZnJvbSAnLi9xdWVyaWVzJztcbmltcG9ydCB7XG4gIHppcCxcbiAgdW56aXBcbn0gZnJvbSAnLi96aXAnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIENsaWVudDogSlNjcmFtYmxlckNsaWVudCxcbiAgY29uZmlnLFxuICBnZW5lcmF0ZVNpZ25lZFBhcmFtcyxcbiAgLy8gVGhpcyBtZXRob2QgaXMgYSBzaG9ydGN1dCBtZXRob2QgdGhhdCBhY2NlcHRzIGFuIG9iamVjdCB3aXRoIGV2ZXJ5dGhpbmcgbmVlZGVkXG4gIC8vIGZvciB0aGUgZW50aXJlIHByb2Nlc3Mgb2YgcmVxdWVzdGluZyBhbiBhcHBsaWNhdGlvbiBwcm90ZWN0aW9uIGFuZCBkb3dubG9hZGluZ1xuICAvLyB0aGF0IHNhbWUgcHJvdGVjdGlvbiB3aGVuIHRoZSBzYW1lIGVuZHMuXG4gIC8vXG4gIC8vIGBjb25maWdQYXRoT3JPYmplY3RgIGNhbiBiZSBhIHBhdGggdG8gYSBKU09OIG9yIGRpcmVjdGx5IGFuIG9iamVjdCBjb250YWluaW5nXG4gIC8vIHRoZSBmb2xsb3dpbmcgc3RydWN0dXJlOlxuICAvL1xuICAvLyBgYGBqc29uXG4gIC8vIHtcbiAgLy8gICBcImtleXNcIjoge1xuICAvLyAgICAgXCJhY2Nlc3NLZXlcIjogXCJcIixcbiAgLy8gICAgIFwic2VjcmV0S2V5XCI6IFwiXCJcbiAgLy8gICB9LFxuICAvLyAgIFwiYXBwbGljYXRpb25JZFwiOiBcIlwiLFxuICAvLyAgIFwiZmlsZXNEZXN0XCI6IFwiXCJcbiAgLy8gfVxuICAvLyBgYGBcbiAgLy9cbiAgLy8gQWxzbyB0aGUgZm9sbG93aW5nIG9wdGlvbmFsIHBhcmFtZXRlcnMgYXJlIGFjY2VwdGVkOlxuICAvL1xuICAvLyBgYGBqc29uXG4gIC8vIHtcbiAgLy8gICBcImZpbGVzU3JjXCI6IFtcIlwiXSxcbiAgLy8gICBcInBhcmFtc1wiOiB7fSxcbiAgLy8gICBcImN3ZFwiOiBcIlwiLFxuICAvLyAgIFwiaG9zdFwiOiBcImFwaS5qc2NyYW1ibGVyLmNvbVwiLFxuICAvLyAgIFwicG9ydFwiOiBcIjQ0M1wiXG4gIC8vIH1cbiAgLy8gYGBgXG4gIC8vXG4gIC8vIGBmaWxlc1NyY2Agc3VwcG9ydHMgZ2xvYiBwYXR0ZXJucywgYW5kIGlmIGl0J3MgcHJvdmlkZWQgaXQgd2lsbCByZXBsYWNlIHRoZVxuICAvLyBlbnRpcmUgYXBwbGljYXRpb24gc291cmNlcy5cbiAgLy9cbiAgLy8gYHBhcmFtc2AgaWYgcHJvdmlkZWQgd2lsbCByZXBsYWNlIGFsbCB0aGUgYXBwbGljYXRpb24gdHJhbnNmb3JtYXRpb24gcGFyYW1ldGVycy5cbiAgLy9cbiAgLy8gYGN3ZGAgYWxsb3dzIHlvdSB0byBzZXQgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgdG8gcmVzb2x2ZSBwcm9ibGVtcyB3aXRoXG4gIC8vIHJlbGF0aXZlIHBhdGhzIHdpdGggeW91ciBgZmlsZXNTcmNgIGlzIG91dHNpZGUgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuXG4gIC8vXG4gIC8vIEZpbmFsbHksIGBob3N0YCBhbmQgYHBvcnRgIGNhbiBiZSBvdmVycmlkZGVuIGlmIHlvdSB0byBlbmdhZ2Ugd2l0aCBhIGRpZmZlcmVudFxuICAvLyBlbmRwb2ludCB0aGFuIHRoZSBkZWZhdWx0IG9uZSwgdXNlZnVsIGlmIHlvdSdyZSBydW5uaW5nIGFuIGVudGVycHJpc2UgdmVyc2lvbiBvZlxuICAvLyBKc2NyYW1ibGVyIG9yIGlmIHlvdSdyZSBwcm92aWRlZCBhY2Nlc3MgdG8gYmV0YSBmZWF0dXJlcyBvZiBvdXIgcHJvZHVjdC5cbiAgLy9cbiAgYXN5bmMgcHJvdGVjdEFuZERvd25sb2FkIChjb25maWdQYXRoT3JPYmplY3QsIGRlc3RDYWxsYmFjaykge1xuICAgIGNvbnN0IGNvbmZpZyA9IHR5cGVvZiBjb25maWdQYXRoT3JPYmplY3QgPT09ICdzdHJpbmcnID9cbiAgICAgIHJlcXVpcmUoY29uZmlnUGF0aE9yT2JqZWN0KSA6IGNvbmZpZ1BhdGhPck9iamVjdDtcblxuICAgIGNvbnN0IHtcbiAgICAgIGFwcGxpY2F0aW9uSWQsXG4gICAgICBob3N0LFxuICAgICAgcG9ydCxcbiAgICAgIGtleXMsXG4gICAgICBmaWxlc0Rlc3QsXG4gICAgICBmaWxlc1NyYyxcbiAgICAgIGN3ZCxcbiAgICAgIHBhcmFtcyxcbiAgICAgIGFwcGxpY2F0aW9uVHlwZXMsXG4gICAgICBsYW5ndWFnZVNwZWNpZmljYXRpb25zLFxuICAgICAgc291cmNlTWFwcyxcbiAgICAgIGFyZVN1YnNjcmliZXJzT3JkZXJlZCxcbiAgICAgIHVzZVJlY29tbWVuZGVkT3JkZXIsXG4gICAgICBiYWlsXG4gICAgfSA9IGNvbmZpZztcblxuICAgIGNvbnN0IHtcbiAgICAgIGFjY2Vzc0tleSxcbiAgICAgIHNlY3JldEtleVxuICAgIH0gPSBrZXlzO1xuXG4gICAgY29uc3QgY2xpZW50ID0gbmV3IHRoaXMuQ2xpZW50KHtcbiAgICAgIGFjY2Vzc0tleSxcbiAgICAgIHNlY3JldEtleSxcbiAgICAgIGhvc3QsXG4gICAgICBwb3J0XG4gICAgfSk7XG5cbiAgICBpZiAoIWFwcGxpY2F0aW9uSWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKmFwcGxpY2F0aW9uSWQqIG5vdCBwcm92aWRlZCcpO1xuICAgIH1cblxuICAgIGlmICghZmlsZXNEZXN0ICYmICFkZXN0Q2FsbGJhY2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKmZpbGVzRGVzdCogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgaWYgKGZpbGVzU3JjICYmIGZpbGVzU3JjLmxlbmd0aCkge1xuICAgICAgbGV0IF9maWxlc1NyYyA9IFtdO1xuICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBmaWxlc1NyYy5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBmaWxlc1NyY1tpXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAvLyBUT0RPIFJlcGxhY2UgYGdsb2Iuc3luY2Agd2l0aCBhc3luYyB2ZXJzaW9uXG4gICAgICAgICAgX2ZpbGVzU3JjID0gX2ZpbGVzU3JjLmNvbmNhdChnbG9iLnN5bmMoZmlsZXNTcmNbaV0sIHtcbiAgICAgICAgICAgIGRvdDogdHJ1ZVxuICAgICAgICAgIH0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfZmlsZXNTcmMucHVzaChmaWxlc1NyY1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgX3ppcCA9IGF3YWl0IHppcChfZmlsZXNTcmMsIGN3ZCk7XG5cbiAgICAgIGNvbnN0IHJlbW92ZVNvdXJjZVJlcyA9IGF3YWl0IHRoaXMucmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uKGNsaWVudCwgJycsIGFwcGxpY2F0aW9uSWQpO1xuICAgICAgaWYgKHJlbW92ZVNvdXJjZVJlcy5lcnJvcnMpIHtcbiAgICAgICAgLy8gVE9ETyBJbXBsZW1lbnQgZXJyb3IgY29kZXMgb3IgZml4IHRoaXMgaXMgb24gdGhlIHNlcnZpY2VzXG4gICAgICAgIHZhciBoYWROb1NvdXJjZXMgPSBmYWxzZTtcbiAgICAgICAgcmVtb3ZlU291cmNlUmVzLmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvci5tZXNzYWdlID09PSAnQXBwbGljYXRpb24gU291cmNlIHdpdGggdGhlIGdpdmVuIElEIGRvZXMgbm90IGV4aXN0Jykge1xuICAgICAgICAgICAgaGFkTm9Tb3VyY2VzID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIWhhZE5vU291cmNlcykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZW1vdmVTb3VyY2VSZXMuZXJyb3JzWzBdLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFkZEFwcGxpY2F0aW9uU291cmNlUmVzID0gYXdhaXQgdGhpcy5hZGRBcHBsaWNhdGlvblNvdXJjZShjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHtcbiAgICAgICAgY29udGVudDogX3ppcC5nZW5lcmF0ZSh7XG4gICAgICAgICAgdHlwZTogJ2Jhc2U2NCdcbiAgICAgICAgfSksXG4gICAgICAgIGZpbGVuYW1lOiAnYXBwbGljYXRpb24uemlwJyxcbiAgICAgICAgZXh0ZW5zaW9uOiAnemlwJ1xuICAgICAgfSk7XG4gICAgICBlcnJvckhhbmRsZXIoYWRkQXBwbGljYXRpb25Tb3VyY2VSZXMpO1xuICAgIH1cblxuICAgIGNvbnN0ICRzZXQgPSB7XG4gICAgICBfaWQ6IGFwcGxpY2F0aW9uSWRcbiAgICB9O1xuXG4gICAgaWYgKHBhcmFtcyAmJiBPYmplY3Qua2V5cyhwYXJhbXMpLmxlbmd0aCkge1xuICAgICAgJHNldC5wYXJhbWV0ZXJzID0gSlNPTi5zdHJpbmdpZnkobm9ybWFsaXplUGFyYW1ldGVycyhwYXJhbXMpKTtcbiAgICAgICRzZXQuYXJlU3Vic2NyaWJlcnNPcmRlcmVkID0gQXJyYXkuaXNBcnJheShwYXJhbXMpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYXJlU3Vic2NyaWJlcnNPcmRlcmVkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgJHNldC5hcmVTdWJzY3JpYmVyc09yZGVyZWQgPSBhcmVTdWJzY3JpYmVyc09yZGVyZWQ7XG4gICAgfVxuXG4gICAgaWYgKGFwcGxpY2F0aW9uVHlwZXMpIHtcbiAgICAgICRzZXQuYXBwbGljYXRpb25UeXBlcyA9IGFwcGxpY2F0aW9uVHlwZXM7XG4gICAgfVxuXG4gICAgaWYgKHVzZVJlY29tbWVuZGVkT3JkZXIpIHtcbiAgICAgICRzZXQudXNlUmVjb21tZW5kZWRPcmRlciA9IHVzZVJlY29tbWVuZGVkT3JkZXI7XG4gICAgfVxuXG4gICAgaWYgKGxhbmd1YWdlU3BlY2lmaWNhdGlvbnMpIHtcbiAgICAgICRzZXQubGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucyA9IGxhbmd1YWdlU3BlY2lmaWNhdGlvbnM7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBzb3VyY2VNYXBzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICRzZXQuc291cmNlTWFwcyA9IEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcHMpO1xuICAgIH1cblxuICAgIGlmICgkc2V0LnBhcmFtZXRlcnMgfHwgJHNldC5hcHBsaWNhdGlvblR5cGVzIHx8ICRzZXQubGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucyB8fFxuICAgICAgdHlwZW9mICRzZXQuYXJlU3Vic2NyaWJlcnNPcmRlcmVkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc3QgdXBkYXRlQXBwbGljYXRpb25SZXMgPSBhd2FpdCB0aGlzLnVwZGF0ZUFwcGxpY2F0aW9uKGNsaWVudCwgJHNldCk7XG4gICAgICBlcnJvckhhbmRsZXIodXBkYXRlQXBwbGljYXRpb25SZXMpO1xuICAgIH1cblxuICAgIGNvbnN0IGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcyA9IGF3YWl0IHRoaXMuY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uKGNsaWVudCwgYXBwbGljYXRpb25JZCwgYmFpbCk7XG4gICAgZXJyb3JIYW5kbGVyKGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcyk7XG5cbiAgICBjb25zdCBwcm90ZWN0aW9uSWQgPSBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb25SZXMuZGF0YS5jcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24uX2lkO1xuICAgIGNvbnN0IHByb3RlY3Rpb24gPSBhd2FpdCB0aGlzLnBvbGxQcm90ZWN0aW9uKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkKTtcblxuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIHByb3RlY3Rpb24uc291cmNlcy5mb3JFYWNoKHMgPT4ge1xuICAgICAgaWYgKHMuZXJyb3JNZXNzYWdlcyAmJiBzLmVycm9yTWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBlcnJvcnMucHVzaCguLi5zLmVycm9yTWVzc2FnZXMubWFwKGUgPT4gKHtcbiAgICAgICAgICBmaWxlbmFtZTogcy5maWxlbmFtZSxcbiAgICAgICAgICAuLi5lXG4gICAgICAgIH0pKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoIWJhaWwgJiYgZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIGVycm9ycy5mb3JFYWNoKGUgPT4gY29uc29sZS5lcnJvcihgTm9uLWZhdGFsIGVycm9yOiBcIiR7ZS5tZXNzYWdlfVwiIGluICR7ZS5maWxlbmFtZX1gKSk7XG4gICAgfSBlbHNlIGlmIChiYWlsICYmIHByb3RlY3Rpb24uc3RhdGUgPT09ICdlcnJvcmVkJykge1xuICAgICAgZXJyb3JzLmZvckVhY2goZSA9PiBjb25zb2xlLmVycm9yKGBFcnJvcjogXCIke2UubWVzc2FnZX1cIiBpbiAke2UuZmlsZW5hbWV9JHtlLmxpbmUgPyBgOiR7ZS5saW5lfWAgOiAnJ31gKSk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhcnNpbmcgZXJyb3JzIG9jdXJyZWQnKTtcbiAgICB9XG5cbiAgICBjb25zdCBkb3dubG9hZCA9IGF3YWl0IHRoaXMuZG93bmxvYWRBcHBsaWNhdGlvblByb3RlY3Rpb24oY2xpZW50LCBwcm90ZWN0aW9uSWQpO1xuICAgIGVycm9ySGFuZGxlcihkb3dubG9hZCk7XG4gICAgdW56aXAoZG93bmxvYWQsIGZpbGVzRGVzdCB8fCBkZXN0Q2FsbGJhY2spO1xuICAgIGNvbnNvbGUubG9nKHByb3RlY3Rpb25JZCk7XG4gIH0sXG5cbiAgYXN5bmMgZG93bmxvYWRTb3VyY2VNYXBzIChjb25maWdzLCBkZXN0Q2FsbGJhY2spIHtcbiAgICBjb25zdCB7XG4gICAgICBrZXlzLFxuICAgICAgaG9zdCxcbiAgICAgIHBvcnQsXG4gICAgICBmaWxlc0Rlc3QsXG4gICAgICBmaWxlc1NyYyxcbiAgICAgIHByb3RlY3Rpb25JZFxuICAgIH0gPSBjb25maWdzO1xuXG4gICAgY29uc3Qge1xuICAgICAgYWNjZXNzS2V5LFxuICAgICAgc2VjcmV0S2V5XG4gICAgfSA9IGtleXM7XG5cbiAgICBjb25zdCBjbGllbnQgPSBuZXcgdGhpcy5DbGllbnQoe1xuICAgICAgYWNjZXNzS2V5LFxuICAgICAgc2VjcmV0S2V5LFxuICAgICAgaG9zdCxcbiAgICAgIHBvcnRcbiAgICB9KTtcblxuICAgIGlmICghZmlsZXNEZXN0ICYmICFkZXN0Q2FsbGJhY2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKmZpbGVzRGVzdCogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgaWYgKCFwcm90ZWN0aW9uSWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKnByb3RlY3Rpb25JZCogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG5cbiAgICBpZiAoZmlsZXNTcmMpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdbV2FybmluZ10gSWdub3Jpbmcgc291cmNlcyBzdXBwbGllZC4gRG93bmxvYWRpbmcgc291cmNlIG1hcHMgb2YgZ2l2ZW4gcHJvdGVjdGlvbicpO1xuICAgIH1cbiAgICBsZXQgZG93bmxvYWQ7XG4gICAgdHJ5IHtcbiAgICAgIGRvd25sb2FkID0gYXdhaXQgdGhpcy5kb3dubG9hZFNvdXJjZU1hcHNSZXF1ZXN0KGNsaWVudCwgcHJvdGVjdGlvbklkKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBlcnJvckhhbmRsZXIoZSk7XG4gICAgfVxuICAgIHVuemlwKGRvd25sb2FkLCBmaWxlc0Rlc3QgfHwgZGVzdENhbGxiYWNrKTtcbiAgfSxcblxuICBhc3luYyBwb2xsUHJvdGVjdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcblxuICAgIGNvbnN0IHBvbGwgPSBhc3luYygpID0+IHtcbiAgICAgIGNvbnN0IGFwcGxpY2F0aW9uUHJvdGVjdGlvbiA9IGF3YWl0IHRoaXMuZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkKTtcbiAgICAgIGlmIChhcHBsaWNhdGlvblByb3RlY3Rpb24uZXJyb3JzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdFcnJvciBwb2xsaW5nIHByb3RlY3Rpb24nLCBhcHBsaWNhdGlvblByb3RlY3Rpb24uZXJyb3JzKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciBwb2xsaW5nIHByb3RlY3Rpb24nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gYXBwbGljYXRpb25Qcm90ZWN0aW9uLmRhdGEuYXBwbGljYXRpb25Qcm90ZWN0aW9uLnN0YXRlO1xuICAgICAgICBjb25zdCBiYWlsID0gYXBwbGljYXRpb25Qcm90ZWN0aW9uLmRhdGEuYXBwbGljYXRpb25Qcm90ZWN0aW9uLmJhaWw7XG4gICAgICAgIGlmIChzdGF0ZSAhPT0gJ2ZpbmlzaGVkJyAmJiBzdGF0ZSAhPT0gJ2Vycm9yZWQnKSB7XG4gICAgICAgICAgc2V0VGltZW91dChwb2xsLCA1MDApO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSAnZXJyb3JlZCcgJiYgIWJhaWwpIHtcbiAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcHAuanNjcmFtYmxlci5jb20vYXBwLyR7YXBwbGljYXRpb25JZH0vcHJvdGVjdGlvbnMvJHtwcm90ZWN0aW9uSWR9YDtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoYFByb3RlY3Rpb24gZmFpbGVkLiBGb3IgbW9yZSBpbmZvcm1hdGlvbiB2aXNpdDogJHt1cmx9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShhcHBsaWNhdGlvblByb3RlY3Rpb24uZGF0YS5hcHBsaWNhdGlvblByb3RlY3Rpb24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHBvbGwoKTtcblxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBjcmVhdGVBcHBsaWNhdGlvbiAoY2xpZW50LCBkYXRhLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgY3JlYXRlQXBwbGljYXRpb24oZGF0YSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGR1cGxpY2F0ZUFwcGxpY2F0aW9uIChjbGllbnQsIGRhdGEsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBkdXBsaWNhdGVBcHBsaWNhdGlvbihkYXRhLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgcmVtb3ZlQXBwbGljYXRpb24gKGNsaWVudCwgaWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgcmVtb3ZlQXBwbGljYXRpb24oaWQpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgcmVtb3ZlUHJvdGVjdGlvbiAoY2xpZW50LCBpZCwgYXBwSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCByZW1vdmVQcm90ZWN0aW9uKGlkLCBhcHBJZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGNhbmNlbFByb3RlY3Rpb24gKGNsaWVudCwgaWQsIGFwcElkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgY2FuY2VsUHJvdGVjdGlvbihpZCwgYXBwSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyB1cGRhdGVBcHBsaWNhdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbiwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHVwZGF0ZUFwcGxpY2F0aW9uKGFwcGxpY2F0aW9uLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgdW5sb2NrQXBwbGljYXRpb24gKGNsaWVudCwgYXBwbGljYXRpb24sIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCB1bmxvY2tBcHBsaWNhdGlvbihhcHBsaWNhdGlvbiwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9uKGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblNvdXJjZSAoY2xpZW50LCBzb3VyY2VJZCwgZnJhZ21lbnRzLCBsaW1pdHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvblNvdXJjZShzb3VyY2VJZCwgZnJhZ21lbnRzLCBsaW1pdHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9ucyAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwYXJhbXMsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnMoYXBwbGljYXRpb25JZCwgcGFyYW1zLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50IChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudChhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgY3JlYXRlVGVtcGxhdGUgKGNsaWVudCwgdGVtcGxhdGUsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBjcmVhdGVUZW1wbGF0ZSh0ZW1wbGF0ZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHJlbW92ZVRlbXBsYXRlIChjbGllbnQsIGlkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHJlbW92ZVRlbXBsYXRlKGlkKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldFRlbXBsYXRlcyAoY2xpZW50LCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRUZW1wbGF0ZXMoZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9ucyAoY2xpZW50LCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvbnMoZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGFkZEFwcGxpY2F0aW9uU291cmNlIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIGFwcGxpY2F0aW9uU291cmNlLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgYWRkQXBwbGljYXRpb25Tb3VyY2UoYXBwbGljYXRpb25JZCwgYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBhZGRBcHBsaWNhdGlvblNvdXJjZUZyb21VUkwgKGNsaWVudCwgYXBwbGljYXRpb25JZCwgdXJsLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICByZXR1cm4gZ2V0RmlsZUZyb21VcmwoY2xpZW50LCB1cmwpXG4gICAgICAudGhlbihmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgYWRkQXBwbGljYXRpb25Tb3VyY2UoYXBwbGljYXRpb25JZCwgZmlsZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgfSk7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHVwZGF0ZUFwcGxpY2F0aW9uU291cmNlIChjbGllbnQsIGFwcGxpY2F0aW9uU291cmNlLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgdXBkYXRlQXBwbGljYXRpb25Tb3VyY2UoYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyByZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24gKGNsaWVudCwgc291cmNlSWQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCByZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24oc291cmNlSWQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBhcHBseVRlbXBsYXRlIChjbGllbnQsIHRlbXBsYXRlSWQsIGFwcElkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgYXBwbHlUZW1wbGF0ZSh0ZW1wbGF0ZUlkLCBhcHBJZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHVwZGF0ZVRlbXBsYXRlIChjbGllbnQsIHRlbXBsYXRlLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgdXBkYXRlVGVtcGxhdGUodGVtcGxhdGUsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgYmFpbCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbihhcHBsaWNhdGlvbklkLCBiYWlsLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHByb3RlY3Rpb25JZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0UHJvdGVjdGlvbihhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBkb3dubG9hZFNvdXJjZU1hcHNSZXF1ZXN0IChjbGllbnQsIHByb3RlY3Rpb25JZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoYC9hcHBsaWNhdGlvbi9zb3VyY2VNYXBzLyR7cHJvdGVjdGlvbklkfWAsIG51bGwsIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCksIGZhbHNlKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZG93bmxvYWRBcHBsaWNhdGlvblByb3RlY3Rpb24gKGNsaWVudCwgcHJvdGVjdGlvbklkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldChgL2FwcGxpY2F0aW9uL2Rvd25sb2FkLyR7cHJvdGVjdGlvbklkfWAsIG51bGwsIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCksIGZhbHNlKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZ2V0RmlsZUZyb21VcmwgKGNsaWVudCwgdXJsKSB7XG4gIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICB2YXIgZmlsZTtcbiAgcmVxdWVzdC5nZXQodXJsKVxuICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgIGZpbGUgPSB7XG4gICAgICAgIGNvbnRlbnQ6IHJlcy5kYXRhLFxuICAgICAgICBmaWxlbmFtZTogcGF0aC5iYXNlbmFtZSh1cmwpLFxuICAgICAgICBleHRlbnNpb246IHBhdGguZXh0bmFtZSh1cmwpLnN1YnN0cigxKVxuICAgICAgfTtcbiAgICAgIGRlZmVycmVkLnJlc29sdmUoZmlsZSk7XG4gICAgfSlcbiAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgZGVmZXJyZWQucmVqZWN0KGVycik7XG4gICAgfSk7XG4gIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufVxuXG5mdW5jdGlvbiByZXNwb25zZUhhbmRsZXIgKGRlZmVycmVkKSB7XG4gIHJldHVybiAoZXJyLCByZXMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGJvZHkgPSByZXMuZGF0YTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChyZXMuc3RhdHVzID49IDQwMCkge1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdChib2R5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGJvZHkpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoYm9keSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBlcnJvckhhbmRsZXIgKHJlcykge1xuICBpZiAocmVzLmVycm9ycyAmJiByZXMuZXJyb3JzLmxlbmd0aCkge1xuICAgIHJlcy5lcnJvcnMuZm9yRWFjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvci5tZXNzYWdlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChyZXMubWVzc2FnZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihyZXMubWVzc2FnZSk7XG4gIH1cblxuICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVQYXJhbWV0ZXJzIChwYXJhbWV0ZXJzKSB7XG4gIHZhciByZXN1bHQ7XG5cbiAgaWYgKCFBcnJheS5pc0FycmF5KHBhcmFtZXRlcnMpKSB7XG4gICAgcmVzdWx0ID0gW107XG4gICAgT2JqZWN0LmtleXMocGFyYW1ldGVycykuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICBuYW1lLFxuICAgICAgICBvcHRpb25zOiBwYXJhbWV0ZXJzW25hbWVdXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSBwYXJhbWV0ZXJzO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdfQ==
