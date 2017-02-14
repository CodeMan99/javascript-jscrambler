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
      var config, applicationId, host, port, keys, filesDest, filesSrc, cwd, params, applicationTypes, languageSpecifications, sourceMaps, randomizationSeed, areSubscribersOrdered, useRecommendedOrder, bail, accessKey, secretKey, client, _filesSrc, i, l, _zip, removeSourceRes, hadNoSources, addApplicationSourceRes, $set, updateApplicationRes, createApplicationProtectionRes, protectionId, protection, errors, download;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              config = typeof configPathOrObject === 'string' ? require(configPathOrObject) : configPathOrObject;
              applicationId = config.applicationId, host = config.host, port = config.port, keys = config.keys, filesDest = config.filesDest, filesSrc = config.filesSrc, cwd = config.cwd, params = config.params, applicationTypes = config.applicationTypes, languageSpecifications = config.languageSpecifications, sourceMaps = config.sourceMaps, randomizationSeed = config.randomizationSeed, areSubscribersOrdered = config.areSubscribersOrdered, useRecommendedOrder = config.useRecommendedOrder, bail = config.bail;
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
              return _this.createApplicationProtection(client, applicationId, undefined, bail, randomizationSeed);

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
              throw new Error('Protection failed');

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

                          if (state !== 'finished' && state !== 'errored' && state !== 'canceled') {
                            setTimeout(poll, 500);
                          } else if (state === 'errored' && !bail) {
                            url = 'https://app.jscrambler.com/app/' + applicationId + '/protections/' + protectionId;

                            deferred.reject('Protection failed. For more information visit: ' + url);
                          } else if (state === 'canceled') {
                            deferred.reject('Protection canceled by user');
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
  createApplicationProtection: function createApplicationProtection(client, applicationId, fragments, bail, randomizationSeed) {
    var _this25 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee26() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee26$(_context26) {
        while (1) {
          switch (_context26.prev = _context26.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.createApplicationProtection)(applicationId, fragments, bail, randomizationSeed), responseHandler(deferred));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvaW5kZXguanMiXSwibmFtZXMiOlsiQ2xpZW50IiwiY29uZmlnIiwiZ2VuZXJhdGVTaWduZWRQYXJhbXMiLCJwcm90ZWN0QW5kRG93bmxvYWQiLCJjb25maWdQYXRoT3JPYmplY3QiLCJkZXN0Q2FsbGJhY2siLCJyZXF1aXJlIiwiYXBwbGljYXRpb25JZCIsImhvc3QiLCJwb3J0Iiwia2V5cyIsImZpbGVzRGVzdCIsImZpbGVzU3JjIiwiY3dkIiwicGFyYW1zIiwiYXBwbGljYXRpb25UeXBlcyIsImxhbmd1YWdlU3BlY2lmaWNhdGlvbnMiLCJzb3VyY2VNYXBzIiwicmFuZG9taXphdGlvblNlZWQiLCJhcmVTdWJzY3JpYmVyc09yZGVyZWQiLCJ1c2VSZWNvbW1lbmRlZE9yZGVyIiwiYmFpbCIsImFjY2Vzc0tleSIsInNlY3JldEtleSIsImNsaWVudCIsIkVycm9yIiwibGVuZ3RoIiwiX2ZpbGVzU3JjIiwiaSIsImwiLCJjb25jYXQiLCJzeW5jIiwiZG90IiwicHVzaCIsIl96aXAiLCJyZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24iLCJyZW1vdmVTb3VyY2VSZXMiLCJlcnJvcnMiLCJoYWROb1NvdXJjZXMiLCJmb3JFYWNoIiwiZXJyb3IiLCJtZXNzYWdlIiwiYWRkQXBwbGljYXRpb25Tb3VyY2UiLCJjb250ZW50IiwiZ2VuZXJhdGUiLCJ0eXBlIiwiZmlsZW5hbWUiLCJleHRlbnNpb24iLCJhZGRBcHBsaWNhdGlvblNvdXJjZVJlcyIsImVycm9ySGFuZGxlciIsIiRzZXQiLCJfaWQiLCJPYmplY3QiLCJwYXJhbWV0ZXJzIiwiSlNPTiIsInN0cmluZ2lmeSIsIm5vcm1hbGl6ZVBhcmFtZXRlcnMiLCJBcnJheSIsImlzQXJyYXkiLCJ1bmRlZmluZWQiLCJ1cGRhdGVBcHBsaWNhdGlvbiIsInVwZGF0ZUFwcGxpY2F0aW9uUmVzIiwiY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uIiwiY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uUmVzIiwicHJvdGVjdGlvbklkIiwiZGF0YSIsInBvbGxQcm90ZWN0aW9uIiwicHJvdGVjdGlvbiIsInNvdXJjZXMiLCJzIiwiZXJyb3JNZXNzYWdlcyIsIm1hcCIsImUiLCJjb25zb2xlIiwic3RhdGUiLCJsaW5lIiwiZG93bmxvYWRBcHBsaWNhdGlvblByb3RlY3Rpb24iLCJkb3dubG9hZCIsImxvZyIsImRvd25sb2FkU291cmNlTWFwcyIsImNvbmZpZ3MiLCJkb3dubG9hZFNvdXJjZU1hcHNSZXF1ZXN0IiwiZGVmZXJyZWQiLCJkZWZlciIsInBvbGwiLCJnZXRBcHBsaWNhdGlvblByb3RlY3Rpb24iLCJhcHBsaWNhdGlvblByb3RlY3Rpb24iLCJzZXRUaW1lb3V0IiwidXJsIiwicmVqZWN0IiwicmVzb2x2ZSIsInByb21pc2UiLCJjcmVhdGVBcHBsaWNhdGlvbiIsImZyYWdtZW50cyIsInBvc3QiLCJyZXNwb25zZUhhbmRsZXIiLCJkdXBsaWNhdGVBcHBsaWNhdGlvbiIsInJlbW92ZUFwcGxpY2F0aW9uIiwiaWQiLCJyZW1vdmVQcm90ZWN0aW9uIiwiYXBwSWQiLCJjYW5jZWxQcm90ZWN0aW9uIiwiYXBwbGljYXRpb24iLCJ1bmxvY2tBcHBsaWNhdGlvbiIsImdldEFwcGxpY2F0aW9uIiwiZ2V0IiwiZ2V0QXBwbGljYXRpb25Tb3VyY2UiLCJzb3VyY2VJZCIsImxpbWl0cyIsImdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnMiLCJnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zQ291bnQiLCJjcmVhdGVUZW1wbGF0ZSIsInRlbXBsYXRlIiwicmVtb3ZlVGVtcGxhdGUiLCJnZXRUZW1wbGF0ZXMiLCJnZXRBcHBsaWNhdGlvbnMiLCJhcHBsaWNhdGlvblNvdXJjZSIsImFkZEFwcGxpY2F0aW9uU291cmNlRnJvbVVSTCIsImdldEZpbGVGcm9tVXJsIiwidGhlbiIsImZpbGUiLCJ1cGRhdGVBcHBsaWNhdGlvblNvdXJjZSIsImFwcGx5VGVtcGxhdGUiLCJ0ZW1wbGF0ZUlkIiwidXBkYXRlVGVtcGxhdGUiLCJyZXMiLCJiYXNlbmFtZSIsImV4dG5hbWUiLCJzdWJzdHIiLCJjYXRjaCIsImVyciIsImJvZHkiLCJzdGF0dXMiLCJleCIsInJlc3VsdCIsIm5hbWUiLCJvcHRpb25zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFpQkE7O0FBU0E7Ozs7Ozs7O2tCQUtlO0FBQ2JBLDBCQURhO0FBRWJDLDBCQUZhO0FBR2JDLHNEQUhhO0FBSWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ01DLG9CQTlDTyw4QkE4Q2FDLGtCQTlDYixFQThDaUNDLFlBOUNqQyxFQThDK0M7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ3BESixvQkFEb0QsR0FDM0MsT0FBT0csa0JBQVAsS0FBOEIsUUFBOUIsR0FDYkUsUUFBUUYsa0JBQVIsQ0FEYSxHQUNpQkEsa0JBRjBCO0FBS3hERywyQkFMd0QsR0FvQnRETixNQXBCc0QsQ0FLeERNLGFBTHdELEVBTXhEQyxJQU53RCxHQW9CdERQLE1BcEJzRCxDQU14RE8sSUFOd0QsRUFPeERDLElBUHdELEdBb0J0RFIsTUFwQnNELENBT3hEUSxJQVB3RCxFQVF4REMsSUFSd0QsR0FvQnREVCxNQXBCc0QsQ0FReERTLElBUndELEVBU3hEQyxTQVR3RCxHQW9CdERWLE1BcEJzRCxDQVN4RFUsU0FUd0QsRUFVeERDLFFBVndELEdBb0J0RFgsTUFwQnNELENBVXhEVyxRQVZ3RCxFQVd4REMsR0FYd0QsR0FvQnREWixNQXBCc0Qs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QU1FLE9BQU9FLEVBQVAsRUFBVztBQUNYbkQsaUJBQVNPLE1BQVQsQ0FBZ0IwQyxJQUFoQjtBQUNEO0FBQ0Y7QUFDRixHQWZEO0FBZ0JEOztBQUVELFNBQVNsRixZQUFULENBQXVCNEUsR0FBdkIsRUFBNEI7QUFDMUIsTUFBSUEsSUFBSXhGLE1BQUosSUFBY3dGLElBQUl4RixNQUFKLENBQVdYLE1BQTdCLEVBQXFDO0FBQ25DbUcsUUFBSXhGLE1BQUosQ0FBV0UsT0FBWCxDQUFtQixVQUFVQyxLQUFWLEVBQWlCO0FBQ2xDLFlBQU0sSUFBSWYsS0FBSixDQUFVZSxNQUFNQyxPQUFoQixDQUFOO0FBQ0QsS0FGRDtBQUdEOztBQUVELE1BQUlvRixJQUFJcEYsT0FBUixFQUFpQjtBQUNmLFVBQU0sSUFBSWhCLEtBQUosQ0FBVW9HLElBQUlwRixPQUFkLENBQU47QUFDRDs7QUFFRCxTQUFPb0YsR0FBUDtBQUNEOztBQUVELFNBQVNyRSxtQkFBVCxDQUE4QkgsVUFBOUIsRUFBMEM7QUFDeEMsTUFBSWlGLE1BQUo7O0FBRUEsTUFBSSxDQUFDN0UsTUFBTUMsT0FBTixDQUFjTCxVQUFkLENBQUwsRUFBZ0M7QUFDOUJpRixhQUFTLEVBQVQ7QUFDQWxGLFdBQU8xQyxJQUFQLENBQVkyQyxVQUFaLEVBQXdCZCxPQUF4QixDQUFnQyxVQUFDZ0csSUFBRCxFQUFVO0FBQ3hDRCxhQUFPckcsSUFBUCxDQUFZO0FBQ1ZzRyxrQkFEVTtBQUVWQyxpQkFBU25GLFdBQVdrRixJQUFYO0FBRkMsT0FBWjtBQUlELEtBTEQ7QUFNRCxHQVJELE1BUU87QUFDTEQsYUFBU2pGLFVBQVQ7QUFDRDs7QUFFRCxTQUFPaUYsTUFBUDtBQUNEIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICdiYWJlbC1wb2x5ZmlsbCc7XG5cbmltcG9ydCBnbG9iIGZyb20gJ2dsb2InO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgcmVxdWVzdCBmcm9tICdheGlvcyc7XG5pbXBvcnQgUSBmcm9tICdxJztcblxuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgZ2VuZXJhdGVTaWduZWRQYXJhbXMgZnJvbSAnLi9nZW5lcmF0ZS1zaWduZWQtcGFyYW1zJztcbmltcG9ydCBKU2NyYW1ibGVyQ2xpZW50IGZyb20gJy4vY2xpZW50JztcbmltcG9ydCB7XG4gIGFkZEFwcGxpY2F0aW9uU291cmNlLFxuICBjcmVhdGVBcHBsaWNhdGlvbixcbiAgcmVtb3ZlQXBwbGljYXRpb24sXG4gIHVwZGF0ZUFwcGxpY2F0aW9uLFxuICB1cGRhdGVBcHBsaWNhdGlvblNvdXJjZSxcbiAgcmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uLFxuICBjcmVhdGVUZW1wbGF0ZSxcbiAgcmVtb3ZlVGVtcGxhdGUsXG4gIHVwZGF0ZVRlbXBsYXRlLFxuICBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24sXG4gIHJlbW92ZVByb3RlY3Rpb24sXG4gIGNhbmNlbFByb3RlY3Rpb24sXG4gIGR1cGxpY2F0ZUFwcGxpY2F0aW9uLFxuICB1bmxvY2tBcHBsaWNhdGlvbixcbiAgYXBwbHlUZW1wbGF0ZVxufSBmcm9tICcuL211dGF0aW9ucyc7XG5pbXBvcnQge1xuICBnZXRBcHBsaWNhdGlvbixcbiAgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9ucyxcbiAgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50LFxuICBnZXRBcHBsaWNhdGlvbnMsXG4gIGdldEFwcGxpY2F0aW9uU291cmNlLFxuICBnZXRUZW1wbGF0ZXMsXG4gIGdldFByb3RlY3Rpb25cbn0gZnJvbSAnLi9xdWVyaWVzJztcbmltcG9ydCB7XG4gIHppcCxcbiAgdW56aXBcbn0gZnJvbSAnLi96aXAnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIENsaWVudDogSlNjcmFtYmxlckNsaWVudCxcbiAgY29uZmlnLFxuICBnZW5lcmF0ZVNpZ25lZFBhcmFtcyxcbiAgLy8gVGhpcyBtZXRob2QgaXMgYSBzaG9ydGN1dCBtZXRob2QgdGhhdCBhY2NlcHRzIGFuIG9iamVjdCB3aXRoIGV2ZXJ5dGhpbmcgbmVlZGVkXG4gIC8vIGZvciB0aGUgZW50aXJlIHByb2Nlc3Mgb2YgcmVxdWVzdGluZyBhbiBhcHBsaWNhdGlvbiBwcm90ZWN0aW9uIGFuZCBkb3dubG9hZGluZ1xuICAvLyB0aGF0IHNhbWUgcHJvdGVjdGlvbiB3aGVuIHRoZSBzYW1lIGVuZHMuXG4gIC8vXG4gIC8vIGBjb25maWdQYXRoT3JPYmplY3RgIGNhbiBiZSBhIHBhdGggdG8gYSBKU09OIG9yIGRpcmVjdGx5IGFuIG9iamVjdCBjb250YWluaW5nXG4gIC8vIHRoZSBmb2xsb3dpbmcgc3RydWN0dXJlOlxuICAvL1xuICAvLyBgYGBqc29uXG4gIC8vIHtcbiAgLy8gICBcImtleXNcIjoge1xuICAvLyAgICAgXCJhY2Nlc3NLZXlcIjogXCJcIixcbiAgLy8gICAgIFwic2VjcmV0S2V5XCI6IFwiXCJcbiAgLy8gICB9LFxuICAvLyAgIFwiYXBwbGljYXRpb25JZFwiOiBcIlwiLFxuICAvLyAgIFwiZmlsZXNEZXN0XCI6IFwiXCJcbiAgLy8gfVxuICAvLyBgYGBcbiAgLy9cbiAgLy8gQWxzbyB0aGUgZm9sbG93aW5nIG9wdGlvbmFsIHBhcmFtZXRlcnMgYXJlIGFjY2VwdGVkOlxuICAvL1xuICAvLyBgYGBqc29uXG4gIC8vIHtcbiAgLy8gICBcImZpbGVzU3JjXCI6IFtcIlwiXSxcbiAgLy8gICBcInBhcmFtc1wiOiB7fSxcbiAgLy8gICBcImN3ZFwiOiBcIlwiLFxuICAvLyAgIFwiaG9zdFwiOiBcImFwaS5qc2NyYW1ibGVyLmNvbVwiLFxuICAvLyAgIFwicG9ydFwiOiBcIjQ0M1wiXG4gIC8vIH1cbiAgLy8gYGBgXG4gIC8vXG4gIC8vIGBmaWxlc1NyY2Agc3VwcG9ydHMgZ2xvYiBwYXR0ZXJucywgYW5kIGlmIGl0J3MgcHJvdmlkZWQgaXQgd2lsbCByZXBsYWNlIHRoZVxuICAvLyBlbnRpcmUgYXBwbGljYXRpb24gc291cmNlcy5cbiAgLy9cbiAgLy8gYHBhcmFtc2AgaWYgcHJvdmlkZWQgd2lsbCByZXBsYWNlIGFsbCB0aGUgYXBwbGljYXRpb24gdHJhbnNmb3JtYXRpb24gcGFyYW1ldGVycy5cbiAgLy9cbiAgLy8gYGN3ZGAgYWxsb3dzIHlvdSB0byBzZXQgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgdG8gcmVzb2x2ZSBwcm9ibGVtcyB3aXRoXG4gIC8vIHJlbGF0aXZlIHBhdGhzIHdpdGggeW91ciBgZmlsZXNTcmNgIGlzIG91dHNpZGUgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuXG4gIC8vXG4gIC8vIEZpbmFsbHksIGBob3N0YCBhbmQgYHBvcnRgIGNhbiBiZSBvdmVycmlkZGVuIGlmIHlvdSB0byBlbmdhZ2Ugd2l0aCBhIGRpZmZlcmVudFxuICAvLyBlbmRwb2ludCB0aGFuIHRoZSBkZWZhdWx0IG9uZSwgdXNlZnVsIGlmIHlvdSdyZSBydW5uaW5nIGFuIGVudGVycHJpc2UgdmVyc2lvbiBvZlxuICAvLyBKc2NyYW1ibGVyIG9yIGlmIHlvdSdyZSBwcm92aWRlZCBhY2Nlc3MgdG8gYmV0YSBmZWF0dXJlcyBvZiBvdXIgcHJvZHVjdC5cbiAgLy9cbiAgYXN5bmMgcHJvdGVjdEFuZERvd25sb2FkIChjb25maWdQYXRoT3JPYmplY3QsIGRlc3RDYWxsYmFjaykge1xuICAgIGNvbnN0IGNvbmZpZyA9IHR5cGVvZiBjb25maWdQYXRoT3JPYmplY3QgPT09ICdzdHJpbmcnID9cbiAgICAgIHJlcXVpcmUoY29uZmlnUGF0aE9yT2JqZWN0KSA6IGNvbmZpZ1BhdGhPck9iamVjdDtcblxuICAgIGNvbnN0IHtcbiAgICAgIGFwcGxpY2F0aW9uSWQsXG4gICAgICBob3N0LFxuICAgICAgcG9ydCxcbiAgICAgIGtleXMsXG4gICAgICBmaWxlc0Rlc3QsXG4gICAgICBmaWxlc1NyYyxcbiAgICAgIGN3ZCxcbiAgICAgIHBhcmFtcyxcbiAgICAgIGFwcGxpY2F0aW9uVHlwZXMsXG4gICAgICBsYW5ndWFnZVNwZWNpZmljYXRpb25zLFxuICAgICAgc291cmNlTWFwcyxcbiAgICAgIHJhbmRvbWl6YXRpb25TZWVkLFxuICAgICAgYXJlU3Vic2NyaWJlcnNPcmRlcmVkLFxuICAgICAgdXNlUmVjb21tZW5kZWRPcmRlcixcbiAgICAgIGJhaWxcbiAgICB9ID0gY29uZmlnO1xuXG4gICAgY29uc3Qge1xuICAgICAgYWNjZXNzS2V5LFxuICAgICAgc2VjcmV0S2V5XG4gICAgfSA9IGtleXM7XG5cbiAgICBjb25zdCBjbGllbnQgPSBuZXcgdGhpcy5DbGllbnQoe1xuICAgICAgYWNjZXNzS2V5LFxuICAgICAgc2VjcmV0S2V5LFxuICAgICAgaG9zdCxcbiAgICAgIHBvcnRcbiAgICB9KTtcblxuICAgIGlmICghYXBwbGljYXRpb25JZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXF1aXJlZCAqYXBwbGljYXRpb25JZCogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgaWYgKCFmaWxlc0Rlc3QgJiYgIWRlc3RDYWxsYmFjaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXF1aXJlZCAqZmlsZXNEZXN0KiBub3QgcHJvdmlkZWQnKTtcbiAgICB9XG5cbiAgICBpZiAoZmlsZXNTcmMgJiYgZmlsZXNTcmMubGVuZ3RoKSB7XG4gICAgICBsZXQgX2ZpbGVzU3JjID0gW107XG4gICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGZpbGVzU3JjLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgICBpZiAodHlwZW9mIGZpbGVzU3JjW2ldID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIC8vIFRPRE8gUmVwbGFjZSBgZ2xvYi5zeW5jYCB3aXRoIGFzeW5jIHZlcnNpb25cbiAgICAgICAgICBfZmlsZXNTcmMgPSBfZmlsZXNTcmMuY29uY2F0KGdsb2Iuc3luYyhmaWxlc1NyY1tpXSwge1xuICAgICAgICAgICAgZG90OiB0cnVlXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9maWxlc1NyYy5wdXNoKGZpbGVzU3JjW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBfemlwID0gYXdhaXQgemlwKF9maWxlc1NyYywgY3dkKTtcblxuICAgICAgY29uc3QgcmVtb3ZlU291cmNlUmVzID0gYXdhaXQgdGhpcy5yZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24oY2xpZW50LCAnJywgYXBwbGljYXRpb25JZCk7XG4gICAgICBpZiAocmVtb3ZlU291cmNlUmVzLmVycm9ycykge1xuICAgICAgICAvLyBUT0RPIEltcGxlbWVudCBlcnJvciBjb2RlcyBvciBmaXggdGhpcyBpcyBvbiB0aGUgc2VydmljZXNcbiAgICAgICAgdmFyIGhhZE5vU291cmNlcyA9IGZhbHNlO1xuICAgICAgICByZW1vdmVTb3VyY2VSZXMuZXJyb3JzLmZvckVhY2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgaWYgKGVycm9yLm1lc3NhZ2UgPT09ICdBcHBsaWNhdGlvbiBTb3VyY2Ugd2l0aCB0aGUgZ2l2ZW4gSUQgZG9lcyBub3QgZXhpc3QnKSB7XG4gICAgICAgICAgICBoYWROb1NvdXJjZXMgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghaGFkTm9Tb3VyY2VzKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlbW92ZVNvdXJjZVJlcy5lcnJvcnNbMF0ubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgYWRkQXBwbGljYXRpb25Tb3VyY2VSZXMgPSBhd2FpdCB0aGlzLmFkZEFwcGxpY2F0aW9uU291cmNlKGNsaWVudCwgYXBwbGljYXRpb25JZCwge1xuICAgICAgICBjb250ZW50OiBfemlwLmdlbmVyYXRlKHtcbiAgICAgICAgICB0eXBlOiAnYmFzZTY0J1xuICAgICAgICB9KSxcbiAgICAgICAgZmlsZW5hbWU6ICdhcHBsaWNhdGlvbi56aXAnLFxuICAgICAgICBleHRlbnNpb246ICd6aXAnXG4gICAgICB9KTtcbiAgICAgIGVycm9ySGFuZGxlcihhZGRBcHBsaWNhdGlvblNvdXJjZVJlcyk7XG4gICAgfVxuXG4gICAgY29uc3QgJHNldCA9IHtcbiAgICAgIF9pZDogYXBwbGljYXRpb25JZFxuICAgIH07XG5cbiAgICBpZiAocGFyYW1zICYmIE9iamVjdC5rZXlzKHBhcmFtcykubGVuZ3RoKSB7XG4gICAgICAkc2V0LnBhcmFtZXRlcnMgPSBKU09OLnN0cmluZ2lmeShub3JtYWxpemVQYXJhbWV0ZXJzKHBhcmFtcykpO1xuICAgICAgJHNldC5hcmVTdWJzY3JpYmVyc09yZGVyZWQgPSBBcnJheS5pc0FycmF5KHBhcmFtcyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhcmVTdWJzY3JpYmVyc09yZGVyZWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAkc2V0LmFyZVN1YnNjcmliZXJzT3JkZXJlZCA9IGFyZVN1YnNjcmliZXJzT3JkZXJlZDtcbiAgICB9XG5cbiAgICBpZiAoYXBwbGljYXRpb25UeXBlcykge1xuICAgICAgJHNldC5hcHBsaWNhdGlvblR5cGVzID0gYXBwbGljYXRpb25UeXBlcztcbiAgICB9XG5cbiAgICBpZiAodXNlUmVjb21tZW5kZWRPcmRlcikge1xuICAgICAgJHNldC51c2VSZWNvbW1lbmRlZE9yZGVyID0gdXNlUmVjb21tZW5kZWRPcmRlcjtcbiAgICB9XG5cbiAgICBpZiAobGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucykge1xuICAgICAgJHNldC5sYW5ndWFnZVNwZWNpZmljYXRpb25zID0gbGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucztcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHNvdXJjZU1hcHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgJHNldC5zb3VyY2VNYXBzID0gSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwcyk7XG4gICAgfVxuXG4gICAgaWYgKCRzZXQucGFyYW1ldGVycyB8fCAkc2V0LmFwcGxpY2F0aW9uVHlwZXMgfHwgJHNldC5sYW5ndWFnZVNwZWNpZmljYXRpb25zIHx8XG4gICAgICB0eXBlb2YgJHNldC5hcmVTdWJzY3JpYmVyc09yZGVyZWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjb25zdCB1cGRhdGVBcHBsaWNhdGlvblJlcyA9IGF3YWl0IHRoaXMudXBkYXRlQXBwbGljYXRpb24oY2xpZW50LCAkc2V0KTtcbiAgICAgIGVycm9ySGFuZGxlcih1cGRhdGVBcHBsaWNhdGlvblJlcyk7XG4gICAgfVxuXG4gICAgY29uc3QgY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uUmVzID0gYXdhaXQgdGhpcy5jcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24oY2xpZW50LCBhcHBsaWNhdGlvbklkLCB1bmRlZmluZWQsIGJhaWwsIHJhbmRvbWl6YXRpb25TZWVkKTtcbiAgICBlcnJvckhhbmRsZXIoY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uUmVzKTtcblxuICAgIGNvbnN0IHByb3RlY3Rpb25JZCA9IGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcy5kYXRhLmNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbi5faWQ7XG4gICAgY29uc3QgcHJvdGVjdGlvbiA9IGF3YWl0IHRoaXMucG9sbFByb3RlY3Rpb24oY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQpO1xuXG4gICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgcHJvdGVjdGlvbi5zb3VyY2VzLmZvckVhY2gocyA9PiB7XG4gICAgICBpZiAocy5lcnJvck1lc3NhZ2VzICYmIHMuZXJyb3JNZXNzYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKC4uLnMuZXJyb3JNZXNzYWdlcy5tYXAoZSA9PiAoe1xuICAgICAgICAgIGZpbGVuYW1lOiBzLmZpbGVuYW1lLFxuICAgICAgICAgIC4uLmVcbiAgICAgICAgfSkpKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICghYmFpbCAmJiBlcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgZXJyb3JzLmZvckVhY2goZSA9PiBjb25zb2xlLmVycm9yKGBOb24tZmF0YWwgZXJyb3I6IFwiJHtlLm1lc3NhZ2V9XCIgaW4gJHtlLmZpbGVuYW1lfWApKTtcbiAgICB9IGVsc2UgaWYgKGJhaWwgJiYgcHJvdGVjdGlvbi5zdGF0ZSA9PT0gJ2Vycm9yZWQnKSB7XG4gICAgICBlcnJvcnMuZm9yRWFjaChlID0+IGNvbnNvbGUuZXJyb3IoYEVycm9yOiBcIiR7ZS5tZXNzYWdlfVwiIGluICR7ZS5maWxlbmFtZX0ke2UubGluZSA/IGA6JHtlLmxpbmV9YCA6ICcnfWApKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUHJvdGVjdGlvbiBmYWlsZWQnKTtcbiAgICB9XG5cbiAgICBjb25zdCBkb3dubG9hZCA9IGF3YWl0IHRoaXMuZG93bmxvYWRBcHBsaWNhdGlvblByb3RlY3Rpb24oY2xpZW50LCBwcm90ZWN0aW9uSWQpO1xuICAgIGVycm9ySGFuZGxlcihkb3dubG9hZCk7XG4gICAgdW56aXAoZG93bmxvYWQsIGZpbGVzRGVzdCB8fCBkZXN0Q2FsbGJhY2spO1xuICAgIGNvbnNvbGUubG9nKHByb3RlY3Rpb25JZCk7XG4gIH0sXG5cbiAgYXN5bmMgZG93bmxvYWRTb3VyY2VNYXBzIChjb25maWdzLCBkZXN0Q2FsbGJhY2spIHtcbiAgICBjb25zdCB7XG4gICAgICBrZXlzLFxuICAgICAgaG9zdCxcbiAgICAgIHBvcnQsXG4gICAgICBmaWxlc0Rlc3QsXG4gICAgICBmaWxlc1NyYyxcbiAgICAgIHByb3RlY3Rpb25JZFxuICAgIH0gPSBjb25maWdzO1xuXG4gICAgY29uc3Qge1xuICAgICAgYWNjZXNzS2V5LFxuICAgICAgc2VjcmV0S2V5XG4gICAgfSA9IGtleXM7XG5cbiAgICBjb25zdCBjbGllbnQgPSBuZXcgdGhpcy5DbGllbnQoe1xuICAgICAgYWNjZXNzS2V5LFxuICAgICAgc2VjcmV0S2V5LFxuICAgICAgaG9zdCxcbiAgICAgIHBvcnRcbiAgICB9KTtcblxuICAgIGlmICghZmlsZXNEZXN0ICYmICFkZXN0Q2FsbGJhY2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKmZpbGVzRGVzdCogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgaWYgKCFwcm90ZWN0aW9uSWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKnByb3RlY3Rpb25JZCogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG5cbiAgICBpZiAoZmlsZXNTcmMpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdbV2FybmluZ10gSWdub3Jpbmcgc291cmNlcyBzdXBwbGllZC4gRG93bmxvYWRpbmcgc291cmNlIG1hcHMgb2YgZ2l2ZW4gcHJvdGVjdGlvbicpO1xuICAgIH1cbiAgICBsZXQgZG93bmxvYWQ7XG4gICAgdHJ5IHtcbiAgICAgIGRvd25sb2FkID0gYXdhaXQgdGhpcy5kb3dubG9hZFNvdXJjZU1hcHNSZXF1ZXN0KGNsaWVudCwgcHJvdGVjdGlvbklkKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBlcnJvckhhbmRsZXIoZSk7XG4gICAgfVxuICAgIHVuemlwKGRvd25sb2FkLCBmaWxlc0Rlc3QgfHwgZGVzdENhbGxiYWNrKTtcbiAgfSxcblxuICBhc3luYyBwb2xsUHJvdGVjdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcblxuICAgIGNvbnN0IHBvbGwgPSBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBhcHBsaWNhdGlvblByb3RlY3Rpb24gPSBhd2FpdCB0aGlzLmdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbihjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHByb3RlY3Rpb25JZCk7XG4gICAgICBpZiAoYXBwbGljYXRpb25Qcm90ZWN0aW9uLmVycm9ycykge1xuICAgICAgICBjb25zb2xlLmxvZygnRXJyb3IgcG9sbGluZyBwcm90ZWN0aW9uJywgYXBwbGljYXRpb25Qcm90ZWN0aW9uLmVycm9ycyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3IgcG9sbGluZyBwcm90ZWN0aW9uJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IGFwcGxpY2F0aW9uUHJvdGVjdGlvbi5kYXRhLmFwcGxpY2F0aW9uUHJvdGVjdGlvbi5zdGF0ZTtcbiAgICAgICAgY29uc3QgYmFpbCA9IGFwcGxpY2F0aW9uUHJvdGVjdGlvbi5kYXRhLmFwcGxpY2F0aW9uUHJvdGVjdGlvbi5iYWlsO1xuICAgICAgICBpZiAoc3RhdGUgIT09ICdmaW5pc2hlZCcgJiYgc3RhdGUgIT09ICdlcnJvcmVkJyAmJiBzdGF0ZSAhPT0gJ2NhbmNlbGVkJykge1xuICAgICAgICAgIHNldFRpbWVvdXQocG9sbCwgNTAwKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gJ2Vycm9yZWQnICYmICFiYWlsKSB7XG4gICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vYXBwLmpzY3JhbWJsZXIuY29tL2FwcC8ke2FwcGxpY2F0aW9uSWR9L3Byb3RlY3Rpb25zLyR7cHJvdGVjdGlvbklkfWA7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGBQcm90ZWN0aW9uIGZhaWxlZC4gRm9yIG1vcmUgaW5mb3JtYXRpb24gdmlzaXQ6ICR7dXJsfWApO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSAnY2FuY2VsZWQnKSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdQcm90ZWN0aW9uIGNhbmNlbGVkIGJ5IHVzZXInKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGFwcGxpY2F0aW9uUHJvdGVjdGlvbi5kYXRhLmFwcGxpY2F0aW9uUHJvdGVjdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcG9sbCgpO1xuXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGNyZWF0ZUFwcGxpY2F0aW9uIChjbGllbnQsIGRhdGEsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBjcmVhdGVBcHBsaWNhdGlvbihkYXRhLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZHVwbGljYXRlQXBwbGljYXRpb24gKGNsaWVudCwgZGF0YSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGR1cGxpY2F0ZUFwcGxpY2F0aW9uKGRhdGEsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyByZW1vdmVBcHBsaWNhdGlvbiAoY2xpZW50LCBpZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCByZW1vdmVBcHBsaWNhdGlvbihpZCksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyByZW1vdmVQcm90ZWN0aW9uIChjbGllbnQsIGlkLCBhcHBJZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHJlbW92ZVByb3RlY3Rpb24oaWQsIGFwcElkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgY2FuY2VsUHJvdGVjdGlvbiAoY2xpZW50LCBpZCwgYXBwSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBjYW5jZWxQcm90ZWN0aW9uKGlkLCBhcHBJZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHVwZGF0ZUFwcGxpY2F0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgdXBkYXRlQXBwbGljYXRpb24oYXBwbGljYXRpb24sIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyB1bmxvY2tBcHBsaWNhdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbiwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHVubG9ja0FwcGxpY2F0aW9uKGFwcGxpY2F0aW9uLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb24oYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uU291cmNlIChjbGllbnQsIHNvdXJjZUlkLCBmcmFnbWVudHMsIGxpbWl0cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9uU291cmNlKHNvdXJjZUlkLCBmcmFnbWVudHMsIGxpbWl0cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHBhcmFtcywgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9ucyhhcHBsaWNhdGlvbklkLCBwYXJhbXMsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zQ291bnQgKGNsaWVudCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50KGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBjcmVhdGVUZW1wbGF0ZSAoY2xpZW50LCB0ZW1wbGF0ZSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGNyZWF0ZVRlbXBsYXRlKHRlbXBsYXRlLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgcmVtb3ZlVGVtcGxhdGUgKGNsaWVudCwgaWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgcmVtb3ZlVGVtcGxhdGUoaWQpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0VGVtcGxhdGVzIChjbGllbnQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldFRlbXBsYXRlcyhmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25zIChjbGllbnQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9ucyhmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgYWRkQXBwbGljYXRpb25Tb3VyY2UgKGNsaWVudCwgYXBwbGljYXRpb25JZCwgYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBhZGRBcHBsaWNhdGlvblNvdXJjZShhcHBsaWNhdGlvbklkLCBhcHBsaWNhdGlvblNvdXJjZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGFkZEFwcGxpY2F0aW9uU291cmNlRnJvbVVSTCAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCB1cmwsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIHJldHVybiBnZXRGaWxlRnJvbVVybChjbGllbnQsIHVybClcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBhZGRBcHBsaWNhdGlvblNvdXJjZShhcHBsaWNhdGlvbklkLCBmaWxlLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICB9KTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgdXBkYXRlQXBwbGljYXRpb25Tb3VyY2UgKGNsaWVudCwgYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCB1cGRhdGVBcHBsaWNhdGlvblNvdXJjZShhcHBsaWNhdGlvblNvdXJjZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbiAoY2xpZW50LCBzb3VyY2VJZCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbihzb3VyY2VJZCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGFwcGx5VGVtcGxhdGUgKGNsaWVudCwgdGVtcGxhdGVJZCwgYXBwSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBhcHBseVRlbXBsYXRlKHRlbXBsYXRlSWQsIGFwcElkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgdXBkYXRlVGVtcGxhdGUgKGNsaWVudCwgdGVtcGxhdGUsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCB1cGRhdGVUZW1wbGF0ZSh0ZW1wbGF0ZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMsIGJhaWwsIHJhbmRvbWl6YXRpb25TZWVkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbihhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMsIGJhaWwsIHJhbmRvbWl6YXRpb25TZWVkKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldFByb3RlY3Rpb24oYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZG93bmxvYWRTb3VyY2VNYXBzUmVxdWVzdCAoY2xpZW50LCBwcm90ZWN0aW9uSWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KGAvYXBwbGljYXRpb24vc291cmNlTWFwcy8ke3Byb3RlY3Rpb25JZH1gLCBudWxsLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpLCBmYWxzZSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGRvd25sb2FkQXBwbGljYXRpb25Qcm90ZWN0aW9uIChjbGllbnQsIHByb3RlY3Rpb25JZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoYC9hcHBsaWNhdGlvbi9kb3dubG9hZC8ke3Byb3RlY3Rpb25JZH1gLCBudWxsLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpLCBmYWxzZSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGdldEZpbGVGcm9tVXJsIChjbGllbnQsIHVybCkge1xuICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgdmFyIGZpbGU7XG4gIHJlcXVlc3QuZ2V0KHVybClcbiAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICBmaWxlID0ge1xuICAgICAgICBjb250ZW50OiByZXMuZGF0YSxcbiAgICAgICAgZmlsZW5hbWU6IHBhdGguYmFzZW5hbWUodXJsKSxcbiAgICAgICAgZXh0ZW5zaW9uOiBwYXRoLmV4dG5hbWUodXJsKS5zdWJzdHIoMSlcbiAgICAgIH07XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGZpbGUpO1xuICAgIH0pXG4gICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xuICAgIH0pO1xuICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxuZnVuY3Rpb24gcmVzcG9uc2VIYW5kbGVyIChkZWZlcnJlZCkge1xuICByZXR1cm4gKGVyciwgcmVzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgZGVmZXJyZWQucmVqZWN0KGVycik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBib2R5ID0gcmVzLmRhdGE7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAocmVzLnN0YXR1cyA+PSA0MDApIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoYm9keSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShib2R5KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGJvZHkpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZXJyb3JIYW5kbGVyIChyZXMpIHtcbiAgaWYgKHJlcy5lcnJvcnMgJiYgcmVzLmVycm9ycy5sZW5ndGgpIHtcbiAgICByZXMuZXJyb3JzLmZvckVhY2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSk7XG4gICAgfSk7XG4gIH1cblxuICBpZiAocmVzLm1lc3NhZ2UpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IocmVzLm1lc3NhZ2UpO1xuICB9XG5cbiAgcmV0dXJuIHJlcztcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplUGFyYW1ldGVycyAocGFyYW1ldGVycykge1xuICB2YXIgcmVzdWx0O1xuXG4gIGlmICghQXJyYXkuaXNBcnJheShwYXJhbWV0ZXJzKSkge1xuICAgIHJlc3VsdCA9IFtdO1xuICAgIE9iamVjdC5rZXlzKHBhcmFtZXRlcnMpLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgb3B0aW9uczogcGFyYW1ldGVyc1tuYW1lXVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gcGFyYW1ldGVycztcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG4iXX0=
