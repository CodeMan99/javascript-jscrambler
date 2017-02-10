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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvaW5kZXguanMiXSwibmFtZXMiOlsiQ2xpZW50IiwiY29uZmlnIiwiZ2VuZXJhdGVTaWduZWRQYXJhbXMiLCJwcm90ZWN0QW5kRG93bmxvYWQiLCJjb25maWdQYXRoT3JPYmplY3QiLCJkZXN0Q2FsbGJhY2siLCJyZXF1aXJlIiwiYXBwbGljYXRpb25JZCIsImhvc3QiLCJwb3J0Iiwia2V5cyIsImZpbGVzRGVzdCIsImZpbGVzU3JjIiwiY3dkIiwicGFyYW1zIiwiYXBwbGljYXRpb25UeXBlcyIsImxhbmd1YWdlU3BlY2lmaWNhdGlvbnMiLCJzb3VyY2VNYXBzIiwicmFuZG9taXphdGlvblNlZWQiLCJhcmVTdWJzY3JpYmVyc09yZGVyZWQiLCJ1c2VSZWNvbW1lbmRlZE9yZGVyIiwiYmFpbCIsImFjY2Vzc0tleSIsInNlY3JldEtleSIsImNsaWVudCIsIkVycm9yIiwibGVuZ3RoIiwiX2ZpbGVzU3JjIiwiaSIsImwiLCJjb25jYXQiLCJzeW5jIiwiZG90IiwicHVzaCIsIl96aXAiLCJyZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24iLCJyZW1vdmVTb3VyY2VSZXMiLCJlcnJvcnMiLCJoYWROb1NvdXJjZXMiLCJmb3JFYWNoIiwiZXJyb3IiLCJtZXNzYWdlIiwiYWRkQXBwbGljYXRpb25Tb3VyY2UiLCJjb250ZW50IiwiZ2VuZXJhdGUiLCJ0eXBlIiwiZmlsZW5hbWUiLCJleHRlbnNpb24iLCJhZGRBcHBsaWNhdGlvblNvdXJjZVJlcyIsImVycm9ySGFuZGxlciIsIiRzZXQiLCJfaWQiLCJPYmplY3QiLCJwYXJhbWV0ZXJzIiwiSlNPTiIsInN0cmluZ2lmeSIsIm5vcm1hbGl6ZVBhcmFtZXRlcnMiLCJBcnJheSIsImlzQXJyYXkiLCJ1bmRlZmluZWQiLCJ1cGRhdGVBcHBsaWNhdGlvbiIsInVwZGF0ZUFwcGxpY2F0aW9uUmVzIiwiY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uIiwiY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uUmVzIiwicHJvdGVjdGlvbklkIiwiZGF0YSIsInBvbGxQcm90ZWN0aW9uIiwicHJvdGVjdGlvbiIsInNvdXJjZXMiLCJzIiwiZXJyb3JNZXNzYWdlcyIsIm1hcCIsImUiLCJjb25zb2xlIiwic3RhdGUiLCJsaW5lIiwiZG93bmxvYWRBcHBsaWNhdGlvblByb3RlY3Rpb24iLCJkb3dubG9hZCIsImxvZyIsImRvd25sb2FkU291cmNlTWFwcyIsImNvbmZpZ3MiLCJkb3dubG9hZFNvdXJjZU1hcHNSZXF1ZXN0IiwiZGVmZXJyZWQiLCJkZWZlciIsInBvbGwiLCJnZXRBcHBsaWNhdGlvblByb3RlY3Rpb24iLCJhcHBsaWNhdGlvblByb3RlY3Rpb24iLCJzZXRUaW1lb3V0IiwidXJsIiwicmVqZWN0IiwicmVzb2x2ZSIsInByb21pc2UiLCJjcmVhdGVBcHBsaWNhdGlvbiIsImZyYWdtZW50cyIsInBvc3QiLCJyZXNwb25zZUhhbmRsZXIiLCJkdXBsaWNhdGVBcHBsaWNhdGlvbiIsInJlbW92ZUFwcGxpY2F0aW9uIiwiaWQiLCJyZW1vdmVQcm90ZWN0aW9uIiwiYXBwSWQiLCJjYW5jZWxQcm90ZWN0aW9uIiwiYXBwbGljYXRpb24iLCJ1bmxvY2tBcHBsaWNhdGlvbiIsImdldEFwcGxpY2F0aW9uIiwiZ2V0IiwiZ2V0QXBwbGljYXRpb25Tb3VyY2UiLCJzb3VyY2VJZCIsImxpbWl0cyIsImdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnMiLCJnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zQ291bnQiLCJjcmVhdGVUZW1wbGF0ZSIsInRlbXBsYXRlIiwicmVtb3ZlVGVtcGxhdGUiLCJnZXRUZW1wbGF0ZXMiLCJnZXRBcHBsaWNhdGlvbnMiLCJhcHBsaWNhdGlvblNvdXJjZSIsImFkZEFwcGxpY2F0aW9uU291cmNlRnJvbVVSTCIsImdldEZpbGVGcm9tVXJsIiwidGhlbiIsImZpbGUiLCJ1cGRhdGVBcHBsaWNhdGlvblNvdXJjZSIsImFwcGx5VGVtcGxhdGUiLCJ0ZW1wbGF0ZUlkIiwidXBkYXRlVGVtcGxhdGUiLCJyZXMiLCJiYXNlbmFtZSIsImV4dG5hbWUiLCJzdWJzdHIiLCJjYXRjaCIsImVyciIsImJvZHkiLCJzdGF0dXMiLCJleCIsInJlc3VsdCIsIm5hbWUiLCJvcHRpb25zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFpQkE7O0FBU0E7Ozs7Ozs7O2tCQUtlO0FBQ2JBLDBCQURhO0FBRWJDLDBCQUZhO0FBR2JDLHNEQUhhO0FBSWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ01DLG9CQTlDTyw4QkE4Q2FDLGtCQTlDYixFQThDaUNDLFlBOUNqQyxFQThDK0M7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ3BESixvQkFEb0QsR0FDM0MsT0FBT0csa0JBQVAsS0FBOEIsUUFBOUIsR0FDYkUsUUFBUUYsa0JBQVIsQ0FEYSxHQUNpQkEsa0JBRjBCO0FBS3hERywyQkFMd0QsR0FvQnRETixNQXBCc0QsQ0FLeERNLGFBTHdELEVBTXhEQyxJQU53RCxHQW9CdERQLE1BcEJzRCxDQU14RE8sSUFOd0QsRUFPeERDLElBUHdELEdBb0J0RFIsTUFwQnNELENBT3hEUSxJQVB3RCxFQVF4REMsSUFSd0QsR0FvQnREVCxNQXBCc0QsQ0FReERTLElBUndELEVBU3hEQyxTQVR3RCxHQW9CdERWLE1BcEJzRCxDQVN4RFUsU0FUd0QsRUFVeERDLFFBVndELEdBb0J0RFgsTUFwQnNELENBVXhEVyxRQVZ3RCxFQVd4REMsR0FYd0QsR0FvQnREWixNQXBCc0QsQ0FXeERZLEdBWHdELEVBWXhEQyxNQVp3RCxHQW9CdERiLE1BcEJzRCxDQVl4RGEsTUFad0QsRUFheERDLGdCQWJ3RCxHQW9CdERkLE1BcEJzRCxDQWF4RGMsZ0JBYndELEVBY3hEQyxzQkFkd0QsR0FvQnREZixNQXBCc0QsQ0FjeERlLHNCQWR3RCxFQWV4REMsVUFmd0QsR0FvQnREaEIsTUFwQnNELENBZXhEZ0IsVUFmd0QsRUFnQnhEQyxpQkFoQndELEdBb0J0RGpCLE1BcEJzRCxDQWdCeERpQixpQkFoQndELEVBaUJ4REMscUJBakJ3RCxHQW9CdERsQixNQXBCc0QsQ0FpQnhEa0IscUJBakJ3RCxFQWtCeERDLG1CQWxCd0QsR0FvQnREbkIsTUFwQnNELENBa0J4RG1CLG1CQWxCd0QsRUFtQnhEQyxJQW5Cd0QsR0FvQnREcEIsTUFwQnNELENBbUJ4RG9CLElBbkJ3RDtBQXVCeERDLHVCQXZCd0QsR0F5QnREWixJQXpCc0QsQ0F1QnhEWSxTQXZCd0QsRUF3QnhEQyxTQXhCd0QsR0F5QnREYixJQXpCc0QsQ0F3QnhEYSxTQXhCd0Q7QUEyQnBEQyxvQkEzQm9ELEdBMkIzQyxJQUFJLE1BQUt4QixNQUFULENBQWdCO0FBQzdCc0Isb0NBRDZCO0FBRTdCQyxvQ0FGNkI7QUFHN0JmLDBCQUg2QjtBQUk3QkM7QUFKNkIsZUFBaEIsQ0EzQjJDOztBQUFBLGtCQWtDckRGLGFBbENxRDtBQUFBO0FBQUE7QUFBQTs7QUFBQSxvQkFtQ2xELElBQUlrQixLQUFKLENBQVUsdUNBQVYsQ0FuQ2tEOztBQUFBO0FBQUEsb0JBc0N0RCxDQUFDZCxTQUFELElBQWMsQ0FBQ04sWUF0Q3VDO0FBQUE7QUFBQTtBQUFBOztBQUFBLG9CQXVDbEQsSUFBSW9CLEtBQUosQ0FBVSxtQ0FBVixDQXZDa0Q7O0FBQUE7QUFBQSxvQkEwQ3REYixZQUFZQSxTQUFTYyxNQTFDaUM7QUFBQTtBQUFBO0FBQUE7O0FBMkNwREMsdUJBM0NvRCxHQTJDeEMsRUEzQ3dDOztBQTRDeEQsbUJBQVNDLENBQVQsR0FBYSxDQUFiLEVBQWdCQyxDQUFoQixHQUFvQmpCLFNBQVNjLE1BQTdCLEVBQXFDRSxJQUFJQyxDQUF6QyxFQUE0QyxFQUFFRCxDQUE5QyxFQUFpRDtBQUMvQyxvQkFBSSxPQUFPaEIsU0FBU2dCLENBQVQsQ0FBUCxLQUF1QixRQUEzQixFQUFxQztBQUNuQztBQUNBRCw4QkFBWUEsVUFBVUcsTUFBVixDQUFpQixlQUFLQyxJQUFMLENBQVVuQixTQUFTZ0IsQ0FBVCxDQUFWLEVBQXVCO0FBQ2xESSx5QkFBSztBQUQ2QyxtQkFBdkIsQ0FBakIsQ0FBWjtBQUdELGlCQUxELE1BS087QUFDTEwsNEJBQVVNLElBQVYsQ0FBZXJCLFNBQVNnQixDQUFULENBQWY7QUFDRDtBQUNGOztBQXJEdUQ7QUFBQSxxQkF1RHJDLGVBQUlELFNBQUosRUFBZWQsR0FBZixDQXZEcUM7O0FBQUE7QUF1RGxEcUIsa0JBdkRrRDtBQUFBO0FBQUEscUJBeUQxQixNQUFLQywyQkFBTCxDQUFpQ1gsTUFBakMsRUFBeUMsRUFBekMsRUFBNkNqQixhQUE3QyxDQXpEMEI7O0FBQUE7QUF5RGxENkIsNkJBekRrRDs7QUFBQSxtQkEwRHBEQSxnQkFBZ0JDLE1BMURvQztBQUFBO0FBQUE7QUFBQTs7QUEyRHREO0FBQ0lDLDBCQTVEa0QsR0E0RG5DLEtBNURtQzs7QUE2RHRERiw4QkFBZ0JDLE1BQWhCLENBQXVCRSxPQUF2QixDQUErQixVQUFVQyxLQUFWLEVBQWlCO0FBQzlDLG9CQUFJQSxNQUFNQyxPQUFOLEtBQWtCLHFEQUF0QixFQUE2RTtBQUMzRUgsaUNBQWUsSUFBZjtBQUNEO0FBQ0YsZUFKRDs7QUE3RHNELGtCQWtFakRBLFlBbEVpRDtBQUFBO0FBQUE7QUFBQTs7QUFBQSxvQkFtRTlDLElBQUliLEtBQUosQ0FBVVcsZ0JBQWdCQyxNQUFoQixDQUF1QixDQUF2QixFQUEwQkksT0FBcEMsQ0FuRThDOztBQUFBO0FBQUE7QUFBQSxxQkF1RWxCLE1BQUtDLG9CQUFMLENBQTBCbEIsTUFBMUIsRUFBa0NqQixhQUFsQyxFQUFpRDtBQUNyRm9DLHlCQUFTVCxLQUFLVSxRQUFMLENBQWM7QUFDckJDLHdCQUFNO0FBRGUsaUJBQWQsQ0FENEU7QUFJckZDLDBCQUFVLGlCQUoyRTtBQUtyRkMsMkJBQVc7QUFMMEUsZUFBakQsQ0F2RWtCOztBQUFBO0FBdUVsREMscUNBdkVrRDs7QUE4RXhEQywyQkFBYUQsdUJBQWI7O0FBOUV3RDtBQWlGcERFLGtCQWpGb0QsR0FpRjdDO0FBQ1hDLHFCQUFLNUM7QUFETSxlQWpGNkM7OztBQXFGMUQsa0JBQUlPLFVBQVVzQyxPQUFPMUMsSUFBUCxDQUFZSSxNQUFaLEVBQW9CWSxNQUFsQyxFQUEwQztBQUN4Q3dCLHFCQUFLRyxVQUFMLEdBQWtCQyxLQUFLQyxTQUFMLENBQWVDLG9CQUFvQjFDLE1BQXBCLENBQWYsQ0FBbEI7QUFDQW9DLHFCQUFLL0IscUJBQUwsR0FBNkJzQyxNQUFNQyxPQUFOLENBQWM1QyxNQUFkLENBQTdCO0FBQ0Q7O0FBRUQsa0JBQUksT0FBT0sscUJBQVAsS0FBaUMsV0FBckMsRUFBa0Q7QUFDaEQrQixxQkFBSy9CLHFCQUFMLEdBQTZCQSxxQkFBN0I7QUFDRDs7QUFFRCxrQkFBSUosZ0JBQUosRUFBc0I7QUFDcEJtQyxxQkFBS25DLGdCQUFMLEdBQXdCQSxnQkFBeEI7QUFDRDs7QUFFRCxrQkFBSUssbUJBQUosRUFBeUI7QUFDdkI4QixxQkFBSzlCLG1CQUFMLEdBQTJCQSxtQkFBM0I7QUFDRDs7QUFFRCxrQkFBSUosc0JBQUosRUFBNEI7QUFDMUJrQyxxQkFBS2xDLHNCQUFMLEdBQThCQSxzQkFBOUI7QUFDRDs7QUFFRCxrQkFBSSxRQUFPQyxVQUFQLHlDQUFPQSxVQUFQLE9BQXNCMEMsU0FBMUIsRUFBcUM7QUFDbkNULHFCQUFLakMsVUFBTCxHQUFrQnFDLEtBQUtDLFNBQUwsQ0FBZXRDLFVBQWYsQ0FBbEI7QUFDRDs7QUE1R3lELG9CQThHdERpQyxLQUFLRyxVQUFMLElBQW1CSCxLQUFLbkMsZ0JBQXhCLElBQTRDbUMsS0FBS2xDLHNCQUFqRCxJQUNGLE9BQU9rQyxLQUFLL0IscUJBQVosS0FBc0MsV0EvR2tCO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEscUJBZ0hyQixNQUFLeUMsaUJBQUwsQ0FBdUJwQyxNQUF2QixFQUErQjBCLElBQS9CLENBaEhxQjs7QUFBQTtBQWdIbERXLGtDQWhIa0Q7O0FBaUh4RFosMkJBQWFZLG9CQUFiOztBQWpId0Q7QUFBQTtBQUFBLHFCQW9IYixNQUFLQywyQkFBTCxDQUFpQ3RDLE1BQWpDLEVBQXlDakIsYUFBekMsRUFBd0RvRCxTQUF4RCxFQUFtRXRDLElBQW5FLEVBQXlFSCxpQkFBekUsQ0FwSGE7O0FBQUE7QUFvSHBENkMsNENBcEhvRDs7QUFxSDFEZCwyQkFBYWMsOEJBQWI7O0FBRU1DLDBCQXZIb0QsR0F1SHJDRCwrQkFBK0JFLElBQS9CLENBQW9DSCwyQkFBcEMsQ0FBZ0VYLEdBdkgzQjtBQUFBO0FBQUEscUJBd0hqQyxNQUFLZSxjQUFMLENBQW9CMUMsTUFBcEIsRUFBNEJqQixhQUE1QixFQUEyQ3lELFlBQTNDLENBeEhpQzs7QUFBQTtBQXdIcERHLHdCQXhIb0Q7QUEwSHBEOUIsb0JBMUhvRCxHQTBIM0MsRUExSDJDOztBQTJIMUQ4Qix5QkFBV0MsT0FBWCxDQUFtQjdCLE9BQW5CLENBQTJCLGFBQUs7QUFDOUIsb0JBQUk4QixFQUFFQyxhQUFGLElBQW1CRCxFQUFFQyxhQUFGLENBQWdCNUMsTUFBaEIsR0FBeUIsQ0FBaEQsRUFBbUQ7QUFDakRXLHlCQUFPSixJQUFQLGtDQUFlb0MsRUFBRUMsYUFBRixDQUFnQkMsR0FBaEIsQ0FBb0I7QUFBQTtBQUNqQ3pCLGdDQUFVdUIsRUFBRXZCO0FBRHFCLHVCQUU5QjBCLENBRjhCO0FBQUEsbUJBQXBCLENBQWY7QUFJRDtBQUNGLGVBUEQ7O0FBM0gwRCxvQkFvSXRELENBQUNuRCxJQUFELElBQVNnQixPQUFPWCxNQUFQLEdBQWdCLENBcEk2QjtBQUFBO0FBQUE7QUFBQTs7QUFxSXhEVyxxQkFBT0UsT0FBUCxDQUFlO0FBQUEsdUJBQUtrQyxRQUFRakMsS0FBUix3QkFBbUNnQyxFQUFFL0IsT0FBckMsYUFBb0QrQixFQUFFMUIsUUFBdEQsQ0FBTDtBQUFBLGVBQWY7QUFySXdEO0FBQUE7O0FBQUE7QUFBQSxvQkFzSS9DekIsUUFBUThDLFdBQVdPLEtBQVgsS0FBcUIsU0F0SWtCO0FBQUE7QUFBQTtBQUFBOztBQXVJeERyQyxxQkFBT0UsT0FBUCxDQUFlO0FBQUEsdUJBQUtrQyxRQUFRakMsS0FBUixjQUF5QmdDLEVBQUUvQixPQUEzQixhQUEwQytCLEVBQUUxQixRQUE1QyxJQUF1RDBCLEVBQUVHLElBQUYsU0FBYUgsRUFBRUcsSUFBZixHQUF3QixFQUEvRSxFQUFMO0FBQUEsZUFBZjtBQXZJd0Qsb0JBd0lsRCxJQUFJbEQsS0FBSixDQUFVLHdCQUFWLENBeElrRDs7QUFBQTtBQUFBO0FBQUEscUJBMkluQyxNQUFLbUQsNkJBQUwsQ0FBbUNwRCxNQUFuQyxFQUEyQ3dDLFlBQTNDLENBM0ltQzs7QUFBQTtBQTJJcERhLHNCQTNJb0Q7O0FBNEkxRDVCLDJCQUFhNEIsUUFBYjtBQUNBLCtCQUFNQSxRQUFOLEVBQWdCbEUsYUFBYU4sWUFBN0I7QUFDQW9FLHNCQUFRSyxHQUFSLENBQVlkLFlBQVo7O0FBOUkwRDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQStJM0QsR0E3TFk7QUErTFBlLG9CQS9MTyw4QkErTGFDLE9BL0xiLEVBK0xzQjNFLFlBL0x0QixFQStMb0M7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFFN0NLLGtCQUY2QyxHQVEzQ3NFLE9BUjJDLENBRTdDdEUsSUFGNkMsRUFHN0NGLElBSDZDLEdBUTNDd0UsT0FSMkMsQ0FHN0N4RSxJQUg2QyxFQUk3Q0MsSUFKNkMsR0FRM0N1RSxPQVIyQyxDQUk3Q3ZFLElBSjZDLEVBSzdDRSxTQUw2QyxHQVEzQ3FFLE9BUjJDLENBSzdDckUsU0FMNkMsRUFNN0NDLFFBTjZDLEdBUTNDb0UsT0FSMkMsQ0FNN0NwRSxRQU42QyxFQU83Q29ELFlBUDZDLEdBUTNDZ0IsT0FSMkMsQ0FPN0NoQixZQVA2QztBQVc3QzFDLHVCQVg2QyxHQWEzQ1osSUFiMkMsQ0FXN0NZLFNBWDZDLEVBWTdDQyxTQVo2QyxHQWEzQ2IsSUFiMkMsQ0FZN0NhLFNBWjZDO0FBZXpDQyxvQkFmeUMsR0FlaEMsSUFBSSxPQUFLeEIsTUFBVCxDQUFnQjtBQUM3QnNCLG9DQUQ2QjtBQUU3QkMsb0NBRjZCO0FBRzdCZiwwQkFINkI7QUFJN0JDO0FBSjZCLGVBQWhCLENBZmdDOztBQUFBLG9CQXNCM0MsQ0FBQ0UsU0FBRCxJQUFjLENBQUNOLFlBdEI0QjtBQUFBO0FBQUE7QUFBQTs7QUFBQSxvQkF1QnZDLElBQUlvQixLQUFKLENBQVUsbUNBQVYsQ0F2QnVDOztBQUFBO0FBQUEsa0JBMEIxQ3VDLFlBMUIwQztBQUFBO0FBQUE7QUFBQTs7QUFBQSxvQkEyQnZDLElBQUl2QyxLQUFKLENBQVUsc0NBQVYsQ0EzQnVDOztBQUFBOztBQStCL0Msa0JBQUliLFFBQUosRUFBYztBQUNaNkQsd0JBQVFLLEdBQVIsQ0FBWSxrRkFBWjtBQUNEO0FBQ0dELHNCQWxDMkM7QUFBQTtBQUFBO0FBQUEscUJBb0M1QixPQUFLSSx5QkFBTCxDQUErQnpELE1BQS9CLEVBQXVDd0MsWUFBdkMsQ0FwQzRCOztBQUFBO0FBb0M3Q2Esc0JBcEM2QztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQXNDN0M1Qjs7QUF0QzZDO0FBd0MvQywrQkFBTTRCLFFBQU4sRUFBZ0JsRSxhQUFhTixZQUE3Qjs7QUF4QytDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBeUNoRCxHQXhPWTtBQTBPUDZELGdCQTFPTywwQkEwT1MxQyxNQTFPVCxFQTBPaUJqQixhQTFPakIsRUEwT2dDeUQsWUExT2hDLEVBME84QztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNuRGtCLHNCQURtRCxHQUN4QyxZQUFFQyxLQUFGLEVBRHdDOztBQUduREMsa0JBSG1EO0FBQUEscUVBRzVDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUNBQ3lCLE9BQUtDLHdCQUFMLENBQThCN0QsTUFBOUIsRUFBc0NqQixhQUF0QyxFQUFxRHlELFlBQXJELENBRHpCOztBQUFBO0FBQ0xzQiwrQ0FESzs7QUFBQSwrQkFFUEEsc0JBQXNCakQsTUFGZjtBQUFBO0FBQUE7QUFBQTs7QUFHVG9DLGtDQUFRSyxHQUFSLENBQVksMEJBQVosRUFBd0NRLHNCQUFzQmpELE1BQTlEO0FBSFMsZ0NBSUgsSUFBSVosS0FBSixDQUFVLDBCQUFWLENBSkc7O0FBQUE7QUFNSGlELCtCQU5HLEdBTUtZLHNCQUFzQnJCLElBQXRCLENBQTJCcUIscUJBQTNCLENBQWlEWixLQU50RDtBQU9IckQsOEJBUEcsR0FPSWlFLHNCQUFzQnJCLElBQXRCLENBQTJCcUIscUJBQTNCLENBQWlEakUsSUFQckQ7O0FBUVQsOEJBQUlxRCxVQUFVLFVBQVYsSUFBd0JBLFVBQVUsU0FBdEMsRUFBaUQ7QUFDL0NhLHVDQUFXSCxJQUFYLEVBQWlCLEdBQWpCO0FBQ0QsMkJBRkQsTUFFTyxJQUFJVixVQUFVLFNBQVYsSUFBdUIsQ0FBQ3JELElBQTVCLEVBQWtDO0FBQ2pDbUUsK0JBRGlDLHVDQUNPakYsYUFEUCxxQkFDb0N5RCxZQURwQzs7QUFFdkNrQixxQ0FBU08sTUFBVCxxREFBa0VELEdBQWxFO0FBQ0QsMkJBSE0sTUFHQTtBQUNMTixxQ0FBU1EsT0FBVCxDQUFpQkosc0JBQXNCckIsSUFBdEIsQ0FBMkJxQixxQkFBNUM7QUFDRDs7QUFmUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFINEM7O0FBQUEsZ0NBR25ERixJQUhtRDtBQUFBO0FBQUE7QUFBQTs7QUFzQnpEQTs7QUF0QnlELGdEQXdCbERGLFNBQVNTLE9BeEJ5Qzs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQXlCMUQsR0FuUVk7O0FBb1FiO0FBQ01DLG1CQXJRTyw2QkFxUVlwRSxNQXJRWixFQXFRb0J5QyxJQXJRcEIsRUFxUTBCNEIsU0FyUTFCLEVBcVFxQztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUMxQ1gsc0JBRDBDLEdBQy9CLFlBQUVDLEtBQUYsRUFEK0I7O0FBRWhEM0QscUJBQU9zRSxJQUFQLENBQVksY0FBWixFQUE0QixrQ0FBa0I3QixJQUFsQixFQUF3QjRCLFNBQXhCLENBQTVCLEVBQWdFRSxnQkFBZ0JiLFFBQWhCLENBQWhFO0FBRmdELGdEQUd6Q0EsU0FBU1MsT0FIZ0M7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJakQsR0F6UVk7O0FBMFFiO0FBQ01LLHNCQTNRTyxnQ0EyUWV4RSxNQTNRZixFQTJRdUJ5QyxJQTNRdkIsRUEyUTZCNEIsU0EzUTdCLEVBMlF3QztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUM3Q1gsc0JBRDZDLEdBQ2xDLFlBQUVDLEtBQUYsRUFEa0M7O0FBRW5EM0QscUJBQU9zRSxJQUFQLENBQVksY0FBWixFQUE0QixxQ0FBcUI3QixJQUFyQixFQUEyQjRCLFNBQTNCLENBQTVCLEVBQW1FRSxnQkFBZ0JiLFFBQWhCLENBQW5FO0FBRm1ELGdEQUc1Q0EsU0FBU1MsT0FIbUM7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJcEQsR0EvUVk7O0FBZ1JiO0FBQ01NLG1CQWpSTyw2QkFpUll6RSxNQWpSWixFQWlSb0IwRSxFQWpScEIsRUFpUndCO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQzdCaEIsc0JBRDZCLEdBQ2xCLFlBQUVDLEtBQUYsRUFEa0I7O0FBRW5DM0QscUJBQU9zRSxJQUFQLENBQVksY0FBWixFQUE0QixrQ0FBa0JJLEVBQWxCLENBQTVCLEVBQW1ESCxnQkFBZ0JiLFFBQWhCLENBQW5EO0FBRm1DLGdEQUc1QkEsU0FBU1MsT0FIbUI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJcEMsR0FyUlk7O0FBc1JiO0FBQ01RLGtCQXZSTyw0QkF1UlczRSxNQXZSWCxFQXVSbUIwRSxFQXZSbkIsRUF1UnVCRSxLQXZSdkIsRUF1UjhCUCxTQXZSOUIsRUF1UnlDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQzlDWCxzQkFEOEMsR0FDbkMsWUFBRUMsS0FBRixFQURtQzs7QUFFcEQzRCxxQkFBT3NFLElBQVAsQ0FBWSxjQUFaLEVBQTRCLGlDQUFpQkksRUFBakIsRUFBcUJFLEtBQXJCLEVBQTRCUCxTQUE1QixDQUE1QixFQUFvRUUsZ0JBQWdCYixRQUFoQixDQUFwRTtBQUZvRCxnREFHN0NBLFNBQVNTLE9BSG9DOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSXJELEdBM1JZOztBQTRSYjtBQUNNVSxrQkE3Uk8sNEJBNlJXN0UsTUE3UlgsRUE2Um1CMEUsRUE3Um5CLEVBNlJ1QkUsS0E3UnZCLEVBNlI4QlAsU0E3UjlCLEVBNlJ5QztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUM5Q1gsc0JBRDhDLEdBQ25DLFlBQUVDLEtBQUYsRUFEbUM7O0FBRXBEM0QscUJBQU9zRSxJQUFQLENBQVksY0FBWixFQUE0QixpQ0FBaUJJLEVBQWpCLEVBQXFCRSxLQUFyQixFQUE0QlAsU0FBNUIsQ0FBNUIsRUFBb0VFLGdCQUFnQmIsUUFBaEIsQ0FBcEU7QUFGb0QsZ0RBRzdDQSxTQUFTUyxPQUhvQzs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUlyRCxHQWpTWTs7QUFrU2I7QUFDTS9CLG1CQW5TTyw2QkFtU1lwQyxNQW5TWixFQW1Tb0I4RSxXQW5TcEIsRUFtU2lDVCxTQW5TakMsRUFtUzRDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ2pEWCxzQkFEaUQsR0FDdEMsWUFBRUMsS0FBRixFQURzQzs7QUFFdkQzRCxxQkFBT3NFLElBQVAsQ0FBWSxjQUFaLEVBQTRCLGtDQUFrQlEsV0FBbEIsRUFBK0JULFNBQS9CLENBQTVCLEVBQXVFRSxnQkFBZ0JiLFFBQWhCLENBQXZFO0FBRnVELGlEQUdoREEsU0FBU1MsT0FIdUM7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJeEQsR0F2U1k7O0FBd1NiO0FBQ01ZLG1CQXpTTyw2QkF5U1kvRSxNQXpTWixFQXlTb0I4RSxXQXpTcEIsRUF5U2lDVCxTQXpTakMsRUF5UzRDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ2pEWCxzQkFEaUQsR0FDdEMsWUFBRUMsS0FBRixFQURzQzs7QUFFdkQzRCxxQkFBT3NFLElBQVAsQ0FBWSxjQUFaLEVBQTRCLGtDQUFrQlEsV0FBbEIsRUFBK0JULFNBQS9CLENBQTVCLEVBQXVFRSxnQkFBZ0JiLFFBQWhCLENBQXZFO0FBRnVELGlEQUdoREEsU0FBU1MsT0FIdUM7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJeEQsR0E3U1k7O0FBOFNiO0FBQ01hLGdCQS9TTywwQkErU1NoRixNQS9TVCxFQStTaUJqQixhQS9TakIsRUErU2dDc0YsU0EvU2hDLEVBK1MyQztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNoRFgsc0JBRGdELEdBQ3JDLFlBQUVDLEtBQUYsRUFEcUM7O0FBRXREM0QscUJBQU9pRixHQUFQLENBQVcsY0FBWCxFQUEyQiw2QkFBZWxHLGFBQWYsRUFBOEJzRixTQUE5QixDQUEzQixFQUFxRUUsZ0JBQWdCYixRQUFoQixDQUFyRTtBQUZzRCxpREFHL0NBLFNBQVNTLE9BSHNDOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSXZELEdBblRZOztBQW9UYjtBQUNNZSxzQkFyVE8sZ0NBcVRlbEYsTUFyVGYsRUFxVHVCbUYsUUFyVHZCLEVBcVRpQ2QsU0FyVGpDLEVBcVQ0Q2UsTUFyVDVDLEVBcVRvRDtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUN6RDFCLHNCQUR5RCxHQUM5QyxZQUFFQyxLQUFGLEVBRDhDOztBQUUvRDNELHFCQUFPaUYsR0FBUCxDQUFXLGNBQVgsRUFBMkIsbUNBQXFCRSxRQUFyQixFQUErQmQsU0FBL0IsRUFBMENlLE1BQTFDLENBQTNCLEVBQThFYixnQkFBZ0JiLFFBQWhCLENBQTlFO0FBRitELGlEQUd4REEsU0FBU1MsT0FIK0M7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJaEUsR0F6VFk7O0FBMFRiO0FBQ01rQiwyQkEzVE8scUNBMlRvQnJGLE1BM1RwQixFQTJUNEJqQixhQTNUNUIsRUEyVDJDTyxNQTNUM0MsRUEyVG1EK0UsU0EzVG5ELEVBMlQ4RDtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNuRVgsc0JBRG1FLEdBQ3hELFlBQUVDLEtBQUYsRUFEd0Q7O0FBRXpFM0QscUJBQU9pRixHQUFQLENBQVcsY0FBWCxFQUEyQix3Q0FBMEJsRyxhQUExQixFQUF5Q08sTUFBekMsRUFBaUQrRSxTQUFqRCxDQUEzQixFQUF3RkUsZ0JBQWdCYixRQUFoQixDQUF4RjtBQUZ5RSxpREFHbEVBLFNBQVNTLE9BSHlEOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSTFFLEdBL1RZOztBQWdVYjtBQUNNbUIsZ0NBalVPLDBDQWlVeUJ0RixNQWpVekIsRUFpVWlDakIsYUFqVWpDLEVBaVVnRHNGLFNBalVoRCxFQWlVMkQ7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDaEVYLHNCQURnRSxHQUNyRCxZQUFFQyxLQUFGLEVBRHFEOztBQUV0RTNELHFCQUFPaUYsR0FBUCxDQUFXLGNBQVgsRUFBMkIsNkNBQStCbEcsYUFBL0IsRUFBOENzRixTQUE5QyxDQUEzQixFQUFxRkUsZ0JBQWdCYixRQUFoQixDQUFyRjtBQUZzRSxpREFHL0RBLFNBQVNTLE9BSHNEOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSXZFLEdBclVZOztBQXNVYjtBQUNNb0IsZ0JBdlVPLDBCQXVVU3ZGLE1BdlVULEVBdVVpQndGLFFBdlVqQixFQXVVMkJuQixTQXZVM0IsRUF1VXNDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQzNDWCxzQkFEMkMsR0FDaEMsWUFBRUMsS0FBRixFQURnQzs7QUFFakQzRCxxQkFBT3NFLElBQVAsQ0FBWSxjQUFaLEVBQTRCLCtCQUFla0IsUUFBZixFQUF5Qm5CLFNBQXpCLENBQTVCLEVBQWlFRSxnQkFBZ0JiLFFBQWhCLENBQWpFO0FBRmlELGlEQUcxQ0EsU0FBU1MsT0FIaUM7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJbEQsR0EzVVk7O0FBNFViO0FBQ01zQixnQkE3VU8sMEJBNlVTekYsTUE3VVQsRUE2VWlCMEUsRUE3VWpCLEVBNlVxQjtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUMxQmhCLHNCQUQwQixHQUNmLFlBQUVDLEtBQUYsRUFEZTs7QUFFaEMzRCxxQkFBT3NFLElBQVAsQ0FBWSxjQUFaLEVBQTRCLCtCQUFlSSxFQUFmLENBQTVCLEVBQWdESCxnQkFBZ0JiLFFBQWhCLENBQWhEO0FBRmdDLGlEQUd6QkEsU0FBU1MsT0FIZ0I7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJakMsR0FqVlk7O0FBa1ZiO0FBQ011QixjQW5WTyx3QkFtVk8xRixNQW5WUCxFQW1WZXFFLFNBblZmLEVBbVYwQjtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUMvQlgsc0JBRCtCLEdBQ3BCLFlBQUVDLEtBQUYsRUFEb0I7O0FBRXJDM0QscUJBQU9pRixHQUFQLENBQVcsY0FBWCxFQUEyQiwyQkFBYVosU0FBYixDQUEzQixFQUFvREUsZ0JBQWdCYixRQUFoQixDQUFwRDtBQUZxQyxpREFHOUJBLFNBQVNTLE9BSHFCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSXRDLEdBdlZZOztBQXdWYjtBQUNNd0IsaUJBelZPLDJCQXlWVTNGLE1BelZWLEVBeVZrQnFFLFNBelZsQixFQXlWNkI7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDbENYLHNCQURrQyxHQUN2QixZQUFFQyxLQUFGLEVBRHVCOztBQUV4QzNELHFCQUFPaUYsR0FBUCxDQUFXLGNBQVgsRUFBMkIsOEJBQWdCWixTQUFoQixDQUEzQixFQUF1REUsZ0JBQWdCYixRQUFoQixDQUF2RDtBQUZ3QyxpREFHakNBLFNBQVNTLE9BSHdCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSXpDLEdBN1ZZOztBQThWYjtBQUNNakQsc0JBL1ZPLGdDQStWZWxCLE1BL1ZmLEVBK1Z1QmpCLGFBL1Z2QixFQStWc0M2RyxpQkEvVnRDLEVBK1Z5RHZCLFNBL1Z6RCxFQStWb0U7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDekVYLHNCQUR5RSxHQUM5RCxZQUFFQyxLQUFGLEVBRDhEOztBQUUvRTNELHFCQUFPc0UsSUFBUCxDQUFZLGNBQVosRUFBNEIscUNBQXFCdkYsYUFBckIsRUFBb0M2RyxpQkFBcEMsRUFBdUR2QixTQUF2RCxDQUE1QixFQUErRkUsZ0JBQWdCYixRQUFoQixDQUEvRjtBQUYrRSxpREFHeEVBLFNBQVNTLE9BSCtEOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSWhGLEdBbldZOztBQW9XYjtBQUNNMEIsNkJBcldPLHVDQXFXc0I3RixNQXJXdEIsRUFxVzhCakIsYUFyVzlCLEVBcVc2Q2lGLEdBclc3QyxFQXFXa0RLLFNBcldsRCxFQXFXNkQ7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDbEVYLHNCQURrRSxHQUN2RCxZQUFFQyxLQUFGLEVBRHVEO0FBQUEsaURBRWpFbUMsZUFBZTlGLE1BQWYsRUFBdUJnRSxHQUF2QixFQUNKK0IsSUFESSxDQUNDLFVBQVVDLElBQVYsRUFBZ0I7QUFDcEJoRyx1QkFBT3NFLElBQVAsQ0FBWSxjQUFaLEVBQTRCLHFDQUFxQnZGLGFBQXJCLEVBQW9DaUgsSUFBcEMsRUFBMEMzQixTQUExQyxDQUE1QixFQUFrRkUsZ0JBQWdCYixRQUFoQixDQUFsRjtBQUNBLHVCQUFPQSxTQUFTUyxPQUFoQjtBQUNELGVBSkksQ0FGaUU7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFPekUsR0E1V1k7O0FBNldiO0FBQ004Qix5QkE5V08sbUNBOFdrQmpHLE1BOVdsQixFQThXMEI0RixpQkE5VzFCLEVBOFc2Q3ZCLFNBOVc3QyxFQThXd0Q7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDN0RYLHNCQUQ2RCxHQUNsRCxZQUFFQyxLQUFGLEVBRGtEOztBQUVuRTNELHFCQUFPc0UsSUFBUCxDQUFZLGNBQVosRUFBNEIsd0NBQXdCc0IsaUJBQXhCLEVBQTJDdkIsU0FBM0MsQ0FBNUIsRUFBbUZFLGdCQUFnQmIsUUFBaEIsQ0FBbkY7QUFGbUUsaURBRzVEQSxTQUFTUyxPQUhtRDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUlwRSxHQWxYWTs7QUFtWGI7QUFDTXhELDZCQXBYTyx1Q0FvWHNCWCxNQXBYdEIsRUFvWDhCbUYsUUFwWDlCLEVBb1h3Q3BHLGFBcFh4QyxFQW9YdURzRixTQXBYdkQsRUFvWGtFO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ3ZFWCxzQkFEdUUsR0FDNUQsWUFBRUMsS0FBRixFQUQ0RDs7QUFFN0UzRCxxQkFBT3NFLElBQVAsQ0FBWSxjQUFaLEVBQTRCLDRDQUE0QmEsUUFBNUIsRUFBc0NwRyxhQUF0QyxFQUFxRHNGLFNBQXJELENBQTVCLEVBQTZGRSxnQkFBZ0JiLFFBQWhCLENBQTdGO0FBRjZFLGlEQUd0RUEsU0FBU1MsT0FINkQ7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJOUUsR0F4WFk7O0FBeVhiO0FBQ00rQixlQTFYTyx5QkEwWFFsRyxNQTFYUixFQTBYZ0JtRyxVQTFYaEIsRUEwWDRCdkIsS0ExWDVCLEVBMFhtQ1AsU0ExWG5DLEVBMFg4QztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNuRFgsc0JBRG1ELEdBQ3hDLFlBQUVDLEtBQUYsRUFEd0M7O0FBRXpEM0QscUJBQU9zRSxJQUFQLENBQVksY0FBWixFQUE0Qiw4QkFBYzZCLFVBQWQsRUFBMEJ2QixLQUExQixFQUFpQ1AsU0FBakMsQ0FBNUIsRUFBeUVFLGdCQUFnQmIsUUFBaEIsQ0FBekU7QUFGeUQsaURBR2xEQSxTQUFTUyxPQUh5Qzs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUkxRCxHQTlYWTs7QUErWGI7QUFDTWlDLGdCQWhZTywwQkFnWVNwRyxNQWhZVCxFQWdZaUJ3RixRQWhZakIsRUFnWTJCbkIsU0FoWTNCLEVBZ1lzQztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUMzQ1gsc0JBRDJDLEdBQ2hDLFlBQUVDLEtBQUYsRUFEZ0M7O0FBRWpEM0QscUJBQU9zRSxJQUFQLENBQVksY0FBWixFQUE0QiwrQkFBZWtCLFFBQWYsRUFBeUJuQixTQUF6QixDQUE1QixFQUFpRUUsZ0JBQWdCYixRQUFoQixDQUFqRTtBQUZpRCxpREFHMUNBLFNBQVNTLE9BSGlDOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSWxELEdBcFlZOztBQXFZYjtBQUNNN0IsNkJBdFlPLHVDQXNZc0J0QyxNQXRZdEIsRUFzWThCakIsYUF0WTlCLEVBc1k2Q3NGLFNBdFk3QyxFQXNZd0R4RSxJQXRZeEQsRUFzWThESCxpQkF0WTlELEVBc1lpRjtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUN0RmdFLHNCQURzRixHQUMzRSxZQUFFQyxLQUFGLEVBRDJFOztBQUU1RjNELHFCQUFPc0UsSUFBUCxDQUFZLGNBQVosRUFBNEIsNENBQTRCdkYsYUFBNUIsRUFBMkNzRixTQUEzQyxFQUFzRHhFLElBQXRELEVBQTRESCxpQkFBNUQsQ0FBNUIsRUFBNEc2RSxnQkFBZ0JiLFFBQWhCLENBQTVHO0FBRjRGLGlEQUdyRkEsU0FBU1MsT0FINEU7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJN0YsR0ExWVk7O0FBMlliO0FBQ01OLDBCQTVZTyxvQ0E0WW1CN0QsTUE1WW5CLEVBNFkyQmpCLGFBNVkzQixFQTRZMEN5RCxZQTVZMUMsRUE0WXdENkIsU0E1WXhELEVBNFltRTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUN4RVgsc0JBRHdFLEdBQzdELFlBQUVDLEtBQUYsRUFENkQ7O0FBRTlFM0QscUJBQU9pRixHQUFQLENBQVcsY0FBWCxFQUEyQiw0QkFBY2xHLGFBQWQsRUFBNkJ5RCxZQUE3QixFQUEyQzZCLFNBQTNDLENBQTNCLEVBQWtGRSxnQkFBZ0JiLFFBQWhCLENBQWxGO0FBRjhFLGlEQUd2RUEsU0FBU1MsT0FIOEQ7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJL0UsR0FoWlk7O0FBaVpiO0FBQ01WLDJCQWxaTyxxQ0FrWm9CekQsTUFsWnBCLEVBa1o0QndDLFlBbFo1QixFQWtaMEM7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDL0NrQixzQkFEK0MsR0FDcEMsWUFBRUMsS0FBRixFQURvQzs7QUFFckQzRCxxQkFBT2lGLEdBQVAsOEJBQXNDekMsWUFBdEMsRUFBc0QsSUFBdEQsRUFBNEQrQixnQkFBZ0JiLFFBQWhCLENBQTVELEVBQXVGLEtBQXZGO0FBRnFELGlEQUc5Q0EsU0FBU1MsT0FIcUM7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJdEQsR0F0Wlk7O0FBdVpiO0FBQ01mLCtCQXhaTyx5Q0F3WndCcEQsTUF4WnhCLEVBd1pnQ3dDLFlBeFpoQyxFQXdaOEM7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDbkRrQixzQkFEbUQsR0FDeEMsWUFBRUMsS0FBRixFQUR3Qzs7QUFFekQzRCxxQkFBT2lGLEdBQVAsNEJBQW9DekMsWUFBcEMsRUFBb0QsSUFBcEQsRUFBMEQrQixnQkFBZ0JiLFFBQWhCLENBQTFELEVBQXFGLEtBQXJGO0FBRnlELGlEQUdsREEsU0FBU1MsT0FIeUM7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJMUQ7QUE1WlksQzs7O0FBK1pmLFNBQVMyQixjQUFULENBQXlCOUYsTUFBekIsRUFBaUNnRSxHQUFqQyxFQUFzQztBQUNwQyxNQUFNTixXQUFXLFlBQUVDLEtBQUYsRUFBakI7QUFDQSxNQUFJcUMsSUFBSjtBQUNBLGtCQUFRZixHQUFSLENBQVlqQixHQUFaLEVBQ0crQixJQURILENBQ1EsVUFBQ00sR0FBRCxFQUFTO0FBQ2JMLFdBQU87QUFDTDdFLGVBQVNrRixJQUFJNUQsSUFEUjtBQUVMbkIsZ0JBQVUsZUFBS2dGLFFBQUwsQ0FBY3RDLEdBQWQsQ0FGTDtBQUdMekMsaUJBQVcsZUFBS2dGLE9BQUwsQ0FBYXZDLEdBQWIsRUFBa0J3QyxNQUFsQixDQUF5QixDQUF6QjtBQUhOLEtBQVA7QUFLQTlDLGFBQVNRLE9BQVQsQ0FBaUI4QixJQUFqQjtBQUNELEdBUkgsRUFTR1MsS0FUSCxDQVNTLFVBQUNDLEdBQUQsRUFBUztBQUNkaEQsYUFBU08sTUFBVCxDQUFnQnlDLEdBQWhCO0FBQ0QsR0FYSDtBQVlBLFNBQU9oRCxTQUFTUyxPQUFoQjtBQUNEOztBQUVELFNBQVNJLGVBQVQsQ0FBMEJiLFFBQTFCLEVBQW9DO0FBQ2xDLFNBQU8sVUFBQ2dELEdBQUQsRUFBTUwsR0FBTixFQUFjO0FBQ25CLFFBQUlLLEdBQUosRUFBUztBQUNQaEQsZUFBU08sTUFBVCxDQUFnQnlDLEdBQWhCO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsVUFBSUMsT0FBT04sSUFBSTVELElBQWY7QUFDQSxVQUFJO0FBQ0YsWUFBSTRELElBQUlPLE1BQUosSUFBYyxHQUFsQixFQUF1QjtBQUNyQmxELG1CQUFTTyxNQUFULENBQWdCMEMsSUFBaEI7QUFDRCxTQUZELE1BRU87QUFDTGpELG1CQUFTUSxPQUFULENBQWlCeUMsSUFBakI7QUFDRDtBQUNGLE9BTkQsQ0FNRSxPQUFPRSxFQUFQLEVBQVc7QUFDWG5ELGlCQUFTTyxNQUFULENBQWdCMEMsSUFBaEI7QUFDRDtBQUNGO0FBQ0YsR0FmRDtBQWdCRDs7QUFFRCxTQUFTbEYsWUFBVCxDQUF1QjRFLEdBQXZCLEVBQTRCO0FBQzFCLE1BQUlBLElBQUl4RixNQUFKLElBQWN3RixJQUFJeEYsTUFBSixDQUFXWCxNQUE3QixFQUFxQztBQUNuQ21HLFFBQUl4RixNQUFKLENBQVdFLE9BQVgsQ0FBbUIsVUFBVUMsS0FBVixFQUFpQjtBQUNsQyxZQUFNLElBQUlmLEtBQUosQ0FBVWUsTUFBTUMsT0FBaEIsQ0FBTjtBQUNELEtBRkQ7QUFHRDs7QUFFRCxNQUFJb0YsSUFBSXBGLE9BQVIsRUFBaUI7QUFDZixVQUFNLElBQUloQixLQUFKLENBQVVvRyxJQUFJcEYsT0FBZCxDQUFOO0FBQ0Q7O0FBRUQsU0FBT29GLEdBQVA7QUFDRDs7QUFFRCxTQUFTckUsbUJBQVQsQ0FBOEJILFVBQTlCLEVBQTBDO0FBQ3hDLE1BQUlpRixNQUFKOztBQUVBLE1BQUksQ0FBQzdFLE1BQU1DLE9BQU4sQ0FBY0wsVUFBZCxDQUFMLEVBQWdDO0FBQzlCaUYsYUFBUyxFQUFUO0FBQ0FsRixXQUFPMUMsSUFBUCxDQUFZMkMsVUFBWixFQUF3QmQsT0FBeEIsQ0FBZ0MsVUFBQ2dHLElBQUQsRUFBVTtBQUN4Q0QsYUFBT3JHLElBQVAsQ0FBWTtBQUNWc0csa0JBRFU7QUFFVkMsaUJBQVNuRixXQUFXa0YsSUFBWDtBQUZDLE9BQVo7QUFJRCxLQUxEO0FBTUQsR0FSRCxNQVFPO0FBQ0xELGFBQVNqRixVQUFUO0FBQ0Q7O0FBRUQsU0FBT2lGLE1BQVA7QUFDRCIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnYmFiZWwtcG9seWZpbGwnO1xuXG5pbXBvcnQgZ2xvYiBmcm9tICdnbG9iJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHJlcXVlc3QgZnJvbSAnYXhpb3MnO1xuaW1wb3J0IFEgZnJvbSAncSc7XG5cbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IGdlbmVyYXRlU2lnbmVkUGFyYW1zIGZyb20gJy4vZ2VuZXJhdGUtc2lnbmVkLXBhcmFtcyc7XG5pbXBvcnQgSlNjcmFtYmxlckNsaWVudCBmcm9tICcuL2NsaWVudCc7XG5pbXBvcnQge1xuICBhZGRBcHBsaWNhdGlvblNvdXJjZSxcbiAgY3JlYXRlQXBwbGljYXRpb24sXG4gIHJlbW92ZUFwcGxpY2F0aW9uLFxuICB1cGRhdGVBcHBsaWNhdGlvbixcbiAgdXBkYXRlQXBwbGljYXRpb25Tb3VyY2UsXG4gIHJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbixcbiAgY3JlYXRlVGVtcGxhdGUsXG4gIHJlbW92ZVRlbXBsYXRlLFxuICB1cGRhdGVUZW1wbGF0ZSxcbiAgY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uLFxuICByZW1vdmVQcm90ZWN0aW9uLFxuICBjYW5jZWxQcm90ZWN0aW9uLFxuICBkdXBsaWNhdGVBcHBsaWNhdGlvbixcbiAgdW5sb2NrQXBwbGljYXRpb24sXG4gIGFwcGx5VGVtcGxhdGVcbn0gZnJvbSAnLi9tdXRhdGlvbnMnO1xuaW1wb3J0IHtcbiAgZ2V0QXBwbGljYXRpb24sXG4gIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnMsXG4gIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudCxcbiAgZ2V0QXBwbGljYXRpb25zLFxuICBnZXRBcHBsaWNhdGlvblNvdXJjZSxcbiAgZ2V0VGVtcGxhdGVzLFxuICBnZXRQcm90ZWN0aW9uXG59IGZyb20gJy4vcXVlcmllcyc7XG5pbXBvcnQge1xuICB6aXAsXG4gIHVuemlwXG59IGZyb20gJy4vemlwJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBDbGllbnQ6IEpTY3JhbWJsZXJDbGllbnQsXG4gIGNvbmZpZyxcbiAgZ2VuZXJhdGVTaWduZWRQYXJhbXMsXG4gIC8vIFRoaXMgbWV0aG9kIGlzIGEgc2hvcnRjdXQgbWV0aG9kIHRoYXQgYWNjZXB0cyBhbiBvYmplY3Qgd2l0aCBldmVyeXRoaW5nIG5lZWRlZFxuICAvLyBmb3IgdGhlIGVudGlyZSBwcm9jZXNzIG9mIHJlcXVlc3RpbmcgYW4gYXBwbGljYXRpb24gcHJvdGVjdGlvbiBhbmQgZG93bmxvYWRpbmdcbiAgLy8gdGhhdCBzYW1lIHByb3RlY3Rpb24gd2hlbiB0aGUgc2FtZSBlbmRzLlxuICAvL1xuICAvLyBgY29uZmlnUGF0aE9yT2JqZWN0YCBjYW4gYmUgYSBwYXRoIHRvIGEgSlNPTiBvciBkaXJlY3RseSBhbiBvYmplY3QgY29udGFpbmluZ1xuICAvLyB0aGUgZm9sbG93aW5nIHN0cnVjdHVyZTpcbiAgLy9cbiAgLy8gYGBganNvblxuICAvLyB7XG4gIC8vICAgXCJrZXlzXCI6IHtcbiAgLy8gICAgIFwiYWNjZXNzS2V5XCI6IFwiXCIsXG4gIC8vICAgICBcInNlY3JldEtleVwiOiBcIlwiXG4gIC8vICAgfSxcbiAgLy8gICBcImFwcGxpY2F0aW9uSWRcIjogXCJcIixcbiAgLy8gICBcImZpbGVzRGVzdFwiOiBcIlwiXG4gIC8vIH1cbiAgLy8gYGBgXG4gIC8vXG4gIC8vIEFsc28gdGhlIGZvbGxvd2luZyBvcHRpb25hbCBwYXJhbWV0ZXJzIGFyZSBhY2NlcHRlZDpcbiAgLy9cbiAgLy8gYGBganNvblxuICAvLyB7XG4gIC8vICAgXCJmaWxlc1NyY1wiOiBbXCJcIl0sXG4gIC8vICAgXCJwYXJhbXNcIjoge30sXG4gIC8vICAgXCJjd2RcIjogXCJcIixcbiAgLy8gICBcImhvc3RcIjogXCJhcGkuanNjcmFtYmxlci5jb21cIixcbiAgLy8gICBcInBvcnRcIjogXCI0NDNcIlxuICAvLyB9XG4gIC8vIGBgYFxuICAvL1xuICAvLyBgZmlsZXNTcmNgIHN1cHBvcnRzIGdsb2IgcGF0dGVybnMsIGFuZCBpZiBpdCdzIHByb3ZpZGVkIGl0IHdpbGwgcmVwbGFjZSB0aGVcbiAgLy8gZW50aXJlIGFwcGxpY2F0aW9uIHNvdXJjZXMuXG4gIC8vXG4gIC8vIGBwYXJhbXNgIGlmIHByb3ZpZGVkIHdpbGwgcmVwbGFjZSBhbGwgdGhlIGFwcGxpY2F0aW9uIHRyYW5zZm9ybWF0aW9uIHBhcmFtZXRlcnMuXG4gIC8vXG4gIC8vIGBjd2RgIGFsbG93cyB5b3UgdG8gc2V0IHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IHRvIHJlc29sdmUgcHJvYmxlbXMgd2l0aFxuICAvLyByZWxhdGl2ZSBwYXRocyB3aXRoIHlvdXIgYGZpbGVzU3JjYCBpcyBvdXRzaWRlIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LlxuICAvL1xuICAvLyBGaW5hbGx5LCBgaG9zdGAgYW5kIGBwb3J0YCBjYW4gYmUgb3ZlcnJpZGRlbiBpZiB5b3UgdG8gZW5nYWdlIHdpdGggYSBkaWZmZXJlbnRcbiAgLy8gZW5kcG9pbnQgdGhhbiB0aGUgZGVmYXVsdCBvbmUsIHVzZWZ1bCBpZiB5b3UncmUgcnVubmluZyBhbiBlbnRlcnByaXNlIHZlcnNpb24gb2ZcbiAgLy8gSnNjcmFtYmxlciBvciBpZiB5b3UncmUgcHJvdmlkZWQgYWNjZXNzIHRvIGJldGEgZmVhdHVyZXMgb2Ygb3VyIHByb2R1Y3QuXG4gIC8vXG4gIGFzeW5jIHByb3RlY3RBbmREb3dubG9hZCAoY29uZmlnUGF0aE9yT2JqZWN0LCBkZXN0Q2FsbGJhY2spIHtcbiAgICBjb25zdCBjb25maWcgPSB0eXBlb2YgY29uZmlnUGF0aE9yT2JqZWN0ID09PSAnc3RyaW5nJyA/XG4gICAgICByZXF1aXJlKGNvbmZpZ1BhdGhPck9iamVjdCkgOiBjb25maWdQYXRoT3JPYmplY3Q7XG5cbiAgICBjb25zdCB7XG4gICAgICBhcHBsaWNhdGlvbklkLFxuICAgICAgaG9zdCxcbiAgICAgIHBvcnQsXG4gICAgICBrZXlzLFxuICAgICAgZmlsZXNEZXN0LFxuICAgICAgZmlsZXNTcmMsXG4gICAgICBjd2QsXG4gICAgICBwYXJhbXMsXG4gICAgICBhcHBsaWNhdGlvblR5cGVzLFxuICAgICAgbGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucyxcbiAgICAgIHNvdXJjZU1hcHMsXG4gICAgICByYW5kb21pemF0aW9uU2VlZCxcbiAgICAgIGFyZVN1YnNjcmliZXJzT3JkZXJlZCxcbiAgICAgIHVzZVJlY29tbWVuZGVkT3JkZXIsXG4gICAgICBiYWlsXG4gICAgfSA9IGNvbmZpZztcblxuICAgIGNvbnN0IHtcbiAgICAgIGFjY2Vzc0tleSxcbiAgICAgIHNlY3JldEtleVxuICAgIH0gPSBrZXlzO1xuXG4gICAgY29uc3QgY2xpZW50ID0gbmV3IHRoaXMuQ2xpZW50KHtcbiAgICAgIGFjY2Vzc0tleSxcbiAgICAgIHNlY3JldEtleSxcbiAgICAgIGhvc3QsXG4gICAgICBwb3J0XG4gICAgfSk7XG5cbiAgICBpZiAoIWFwcGxpY2F0aW9uSWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKmFwcGxpY2F0aW9uSWQqIG5vdCBwcm92aWRlZCcpO1xuICAgIH1cblxuICAgIGlmICghZmlsZXNEZXN0ICYmICFkZXN0Q2FsbGJhY2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKmZpbGVzRGVzdCogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgaWYgKGZpbGVzU3JjICYmIGZpbGVzU3JjLmxlbmd0aCkge1xuICAgICAgbGV0IF9maWxlc1NyYyA9IFtdO1xuICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBmaWxlc1NyYy5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBmaWxlc1NyY1tpXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAvLyBUT0RPIFJlcGxhY2UgYGdsb2Iuc3luY2Agd2l0aCBhc3luYyB2ZXJzaW9uXG4gICAgICAgICAgX2ZpbGVzU3JjID0gX2ZpbGVzU3JjLmNvbmNhdChnbG9iLnN5bmMoZmlsZXNTcmNbaV0sIHtcbiAgICAgICAgICAgIGRvdDogdHJ1ZVxuICAgICAgICAgIH0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfZmlsZXNTcmMucHVzaChmaWxlc1NyY1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgX3ppcCA9IGF3YWl0IHppcChfZmlsZXNTcmMsIGN3ZCk7XG5cbiAgICAgIGNvbnN0IHJlbW92ZVNvdXJjZVJlcyA9IGF3YWl0IHRoaXMucmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uKGNsaWVudCwgJycsIGFwcGxpY2F0aW9uSWQpO1xuICAgICAgaWYgKHJlbW92ZVNvdXJjZVJlcy5lcnJvcnMpIHtcbiAgICAgICAgLy8gVE9ETyBJbXBsZW1lbnQgZXJyb3IgY29kZXMgb3IgZml4IHRoaXMgaXMgb24gdGhlIHNlcnZpY2VzXG4gICAgICAgIHZhciBoYWROb1NvdXJjZXMgPSBmYWxzZTtcbiAgICAgICAgcmVtb3ZlU291cmNlUmVzLmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvci5tZXNzYWdlID09PSAnQXBwbGljYXRpb24gU291cmNlIHdpdGggdGhlIGdpdmVuIElEIGRvZXMgbm90IGV4aXN0Jykge1xuICAgICAgICAgICAgaGFkTm9Tb3VyY2VzID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIWhhZE5vU291cmNlcykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZW1vdmVTb3VyY2VSZXMuZXJyb3JzWzBdLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFkZEFwcGxpY2F0aW9uU291cmNlUmVzID0gYXdhaXQgdGhpcy5hZGRBcHBsaWNhdGlvblNvdXJjZShjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHtcbiAgICAgICAgY29udGVudDogX3ppcC5nZW5lcmF0ZSh7XG4gICAgICAgICAgdHlwZTogJ2Jhc2U2NCdcbiAgICAgICAgfSksXG4gICAgICAgIGZpbGVuYW1lOiAnYXBwbGljYXRpb24uemlwJyxcbiAgICAgICAgZXh0ZW5zaW9uOiAnemlwJ1xuICAgICAgfSk7XG4gICAgICBlcnJvckhhbmRsZXIoYWRkQXBwbGljYXRpb25Tb3VyY2VSZXMpO1xuICAgIH1cblxuICAgIGNvbnN0ICRzZXQgPSB7XG4gICAgICBfaWQ6IGFwcGxpY2F0aW9uSWRcbiAgICB9O1xuXG4gICAgaWYgKHBhcmFtcyAmJiBPYmplY3Qua2V5cyhwYXJhbXMpLmxlbmd0aCkge1xuICAgICAgJHNldC5wYXJhbWV0ZXJzID0gSlNPTi5zdHJpbmdpZnkobm9ybWFsaXplUGFyYW1ldGVycyhwYXJhbXMpKTtcbiAgICAgICRzZXQuYXJlU3Vic2NyaWJlcnNPcmRlcmVkID0gQXJyYXkuaXNBcnJheShwYXJhbXMpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYXJlU3Vic2NyaWJlcnNPcmRlcmVkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgJHNldC5hcmVTdWJzY3JpYmVyc09yZGVyZWQgPSBhcmVTdWJzY3JpYmVyc09yZGVyZWQ7XG4gICAgfVxuXG4gICAgaWYgKGFwcGxpY2F0aW9uVHlwZXMpIHtcbiAgICAgICRzZXQuYXBwbGljYXRpb25UeXBlcyA9IGFwcGxpY2F0aW9uVHlwZXM7XG4gICAgfVxuXG4gICAgaWYgKHVzZVJlY29tbWVuZGVkT3JkZXIpIHtcbiAgICAgICRzZXQudXNlUmVjb21tZW5kZWRPcmRlciA9IHVzZVJlY29tbWVuZGVkT3JkZXI7XG4gICAgfVxuXG4gICAgaWYgKGxhbmd1YWdlU3BlY2lmaWNhdGlvbnMpIHtcbiAgICAgICRzZXQubGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucyA9IGxhbmd1YWdlU3BlY2lmaWNhdGlvbnM7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBzb3VyY2VNYXBzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICRzZXQuc291cmNlTWFwcyA9IEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcHMpO1xuICAgIH1cblxuICAgIGlmICgkc2V0LnBhcmFtZXRlcnMgfHwgJHNldC5hcHBsaWNhdGlvblR5cGVzIHx8ICRzZXQubGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucyB8fFxuICAgICAgdHlwZW9mICRzZXQuYXJlU3Vic2NyaWJlcnNPcmRlcmVkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc3QgdXBkYXRlQXBwbGljYXRpb25SZXMgPSBhd2FpdCB0aGlzLnVwZGF0ZUFwcGxpY2F0aW9uKGNsaWVudCwgJHNldCk7XG4gICAgICBlcnJvckhhbmRsZXIodXBkYXRlQXBwbGljYXRpb25SZXMpO1xuICAgIH1cblxuICAgIGNvbnN0IGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcyA9IGF3YWl0IHRoaXMuY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uKGNsaWVudCwgYXBwbGljYXRpb25JZCwgdW5kZWZpbmVkLCBiYWlsLCByYW5kb21pemF0aW9uU2VlZCk7XG4gICAgZXJyb3JIYW5kbGVyKGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcyk7XG5cbiAgICBjb25zdCBwcm90ZWN0aW9uSWQgPSBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb25SZXMuZGF0YS5jcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24uX2lkO1xuICAgIGNvbnN0IHByb3RlY3Rpb24gPSBhd2FpdCB0aGlzLnBvbGxQcm90ZWN0aW9uKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkKTtcblxuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIHByb3RlY3Rpb24uc291cmNlcy5mb3JFYWNoKHMgPT4ge1xuICAgICAgaWYgKHMuZXJyb3JNZXNzYWdlcyAmJiBzLmVycm9yTWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBlcnJvcnMucHVzaCguLi5zLmVycm9yTWVzc2FnZXMubWFwKGUgPT4gKHtcbiAgICAgICAgICBmaWxlbmFtZTogcy5maWxlbmFtZSxcbiAgICAgICAgICAuLi5lXG4gICAgICAgIH0pKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoIWJhaWwgJiYgZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIGVycm9ycy5mb3JFYWNoKGUgPT4gY29uc29sZS5lcnJvcihgTm9uLWZhdGFsIGVycm9yOiBcIiR7ZS5tZXNzYWdlfVwiIGluICR7ZS5maWxlbmFtZX1gKSk7XG4gICAgfSBlbHNlIGlmIChiYWlsICYmIHByb3RlY3Rpb24uc3RhdGUgPT09ICdlcnJvcmVkJykge1xuICAgICAgZXJyb3JzLmZvckVhY2goZSA9PiBjb25zb2xlLmVycm9yKGBFcnJvcjogXCIke2UubWVzc2FnZX1cIiBpbiAke2UuZmlsZW5hbWV9JHtlLmxpbmUgPyBgOiR7ZS5saW5lfWAgOiAnJ31gKSk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhcnNpbmcgZXJyb3JzIG9jdXJyZWQnKTtcbiAgICB9XG5cbiAgICBjb25zdCBkb3dubG9hZCA9IGF3YWl0IHRoaXMuZG93bmxvYWRBcHBsaWNhdGlvblByb3RlY3Rpb24oY2xpZW50LCBwcm90ZWN0aW9uSWQpO1xuICAgIGVycm9ySGFuZGxlcihkb3dubG9hZCk7XG4gICAgdW56aXAoZG93bmxvYWQsIGZpbGVzRGVzdCB8fCBkZXN0Q2FsbGJhY2spO1xuICAgIGNvbnNvbGUubG9nKHByb3RlY3Rpb25JZCk7XG4gIH0sXG5cbiAgYXN5bmMgZG93bmxvYWRTb3VyY2VNYXBzIChjb25maWdzLCBkZXN0Q2FsbGJhY2spIHtcbiAgICBjb25zdCB7XG4gICAgICBrZXlzLFxuICAgICAgaG9zdCxcbiAgICAgIHBvcnQsXG4gICAgICBmaWxlc0Rlc3QsXG4gICAgICBmaWxlc1NyYyxcbiAgICAgIHByb3RlY3Rpb25JZFxuICAgIH0gPSBjb25maWdzO1xuXG4gICAgY29uc3Qge1xuICAgICAgYWNjZXNzS2V5LFxuICAgICAgc2VjcmV0S2V5XG4gICAgfSA9IGtleXM7XG5cbiAgICBjb25zdCBjbGllbnQgPSBuZXcgdGhpcy5DbGllbnQoe1xuICAgICAgYWNjZXNzS2V5LFxuICAgICAgc2VjcmV0S2V5LFxuICAgICAgaG9zdCxcbiAgICAgIHBvcnRcbiAgICB9KTtcblxuICAgIGlmICghZmlsZXNEZXN0ICYmICFkZXN0Q2FsbGJhY2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKmZpbGVzRGVzdCogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgaWYgKCFwcm90ZWN0aW9uSWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKnByb3RlY3Rpb25JZCogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG5cbiAgICBpZiAoZmlsZXNTcmMpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdbV2FybmluZ10gSWdub3Jpbmcgc291cmNlcyBzdXBwbGllZC4gRG93bmxvYWRpbmcgc291cmNlIG1hcHMgb2YgZ2l2ZW4gcHJvdGVjdGlvbicpO1xuICAgIH1cbiAgICBsZXQgZG93bmxvYWQ7XG4gICAgdHJ5IHtcbiAgICAgIGRvd25sb2FkID0gYXdhaXQgdGhpcy5kb3dubG9hZFNvdXJjZU1hcHNSZXF1ZXN0KGNsaWVudCwgcHJvdGVjdGlvbklkKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBlcnJvckhhbmRsZXIoZSk7XG4gICAgfVxuICAgIHVuemlwKGRvd25sb2FkLCBmaWxlc0Rlc3QgfHwgZGVzdENhbGxiYWNrKTtcbiAgfSxcblxuICBhc3luYyBwb2xsUHJvdGVjdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcblxuICAgIGNvbnN0IHBvbGwgPSBhc3luYygpID0+IHtcbiAgICAgIGNvbnN0IGFwcGxpY2F0aW9uUHJvdGVjdGlvbiA9IGF3YWl0IHRoaXMuZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkKTtcbiAgICAgIGlmIChhcHBsaWNhdGlvblByb3RlY3Rpb24uZXJyb3JzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdFcnJvciBwb2xsaW5nIHByb3RlY3Rpb24nLCBhcHBsaWNhdGlvblByb3RlY3Rpb24uZXJyb3JzKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciBwb2xsaW5nIHByb3RlY3Rpb24nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gYXBwbGljYXRpb25Qcm90ZWN0aW9uLmRhdGEuYXBwbGljYXRpb25Qcm90ZWN0aW9uLnN0YXRlO1xuICAgICAgICBjb25zdCBiYWlsID0gYXBwbGljYXRpb25Qcm90ZWN0aW9uLmRhdGEuYXBwbGljYXRpb25Qcm90ZWN0aW9uLmJhaWw7XG4gICAgICAgIGlmIChzdGF0ZSAhPT0gJ2ZpbmlzaGVkJyAmJiBzdGF0ZSAhPT0gJ2Vycm9yZWQnKSB7XG4gICAgICAgICAgc2V0VGltZW91dChwb2xsLCA1MDApO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSAnZXJyb3JlZCcgJiYgIWJhaWwpIHtcbiAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcHAuanNjcmFtYmxlci5jb20vYXBwLyR7YXBwbGljYXRpb25JZH0vcHJvdGVjdGlvbnMvJHtwcm90ZWN0aW9uSWR9YDtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoYFByb3RlY3Rpb24gZmFpbGVkLiBGb3IgbW9yZSBpbmZvcm1hdGlvbiB2aXNpdDogJHt1cmx9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShhcHBsaWNhdGlvblByb3RlY3Rpb24uZGF0YS5hcHBsaWNhdGlvblByb3RlY3Rpb24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHBvbGwoKTtcblxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBjcmVhdGVBcHBsaWNhdGlvbiAoY2xpZW50LCBkYXRhLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgY3JlYXRlQXBwbGljYXRpb24oZGF0YSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGR1cGxpY2F0ZUFwcGxpY2F0aW9uIChjbGllbnQsIGRhdGEsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBkdXBsaWNhdGVBcHBsaWNhdGlvbihkYXRhLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgcmVtb3ZlQXBwbGljYXRpb24gKGNsaWVudCwgaWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgcmVtb3ZlQXBwbGljYXRpb24oaWQpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgcmVtb3ZlUHJvdGVjdGlvbiAoY2xpZW50LCBpZCwgYXBwSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCByZW1vdmVQcm90ZWN0aW9uKGlkLCBhcHBJZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGNhbmNlbFByb3RlY3Rpb24gKGNsaWVudCwgaWQsIGFwcElkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgY2FuY2VsUHJvdGVjdGlvbihpZCwgYXBwSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyB1cGRhdGVBcHBsaWNhdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbiwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHVwZGF0ZUFwcGxpY2F0aW9uKGFwcGxpY2F0aW9uLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgdW5sb2NrQXBwbGljYXRpb24gKGNsaWVudCwgYXBwbGljYXRpb24sIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCB1bmxvY2tBcHBsaWNhdGlvbihhcHBsaWNhdGlvbiwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9uKGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblNvdXJjZSAoY2xpZW50LCBzb3VyY2VJZCwgZnJhZ21lbnRzLCBsaW1pdHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvblNvdXJjZShzb3VyY2VJZCwgZnJhZ21lbnRzLCBsaW1pdHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9ucyAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwYXJhbXMsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnMoYXBwbGljYXRpb25JZCwgcGFyYW1zLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50IChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudChhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgY3JlYXRlVGVtcGxhdGUgKGNsaWVudCwgdGVtcGxhdGUsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBjcmVhdGVUZW1wbGF0ZSh0ZW1wbGF0ZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHJlbW92ZVRlbXBsYXRlIChjbGllbnQsIGlkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHJlbW92ZVRlbXBsYXRlKGlkKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldFRlbXBsYXRlcyAoY2xpZW50LCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRUZW1wbGF0ZXMoZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9ucyAoY2xpZW50LCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvbnMoZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGFkZEFwcGxpY2F0aW9uU291cmNlIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIGFwcGxpY2F0aW9uU291cmNlLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgYWRkQXBwbGljYXRpb25Tb3VyY2UoYXBwbGljYXRpb25JZCwgYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBhZGRBcHBsaWNhdGlvblNvdXJjZUZyb21VUkwgKGNsaWVudCwgYXBwbGljYXRpb25JZCwgdXJsLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICByZXR1cm4gZ2V0RmlsZUZyb21VcmwoY2xpZW50LCB1cmwpXG4gICAgICAudGhlbihmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgYWRkQXBwbGljYXRpb25Tb3VyY2UoYXBwbGljYXRpb25JZCwgZmlsZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgfSk7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHVwZGF0ZUFwcGxpY2F0aW9uU291cmNlIChjbGllbnQsIGFwcGxpY2F0aW9uU291cmNlLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgdXBkYXRlQXBwbGljYXRpb25Tb3VyY2UoYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyByZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24gKGNsaWVudCwgc291cmNlSWQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCByZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24oc291cmNlSWQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBhcHBseVRlbXBsYXRlIChjbGllbnQsIHRlbXBsYXRlSWQsIGFwcElkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgYXBwbHlUZW1wbGF0ZSh0ZW1wbGF0ZUlkLCBhcHBJZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHVwZGF0ZVRlbXBsYXRlIChjbGllbnQsIHRlbXBsYXRlLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgdXBkYXRlVGVtcGxhdGUodGVtcGxhdGUsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzLCBiYWlsLCByYW5kb21pemF0aW9uU2VlZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24oYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzLCBiYWlsLCByYW5kb21pemF0aW9uU2VlZCksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRQcm90ZWN0aW9uKGFwcGxpY2F0aW9uSWQsIHByb3RlY3Rpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGRvd25sb2FkU291cmNlTWFwc1JlcXVlc3QgKGNsaWVudCwgcHJvdGVjdGlvbklkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldChgL2FwcGxpY2F0aW9uL3NvdXJjZU1hcHMvJHtwcm90ZWN0aW9uSWR9YCwgbnVsbCwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSwgZmFsc2UpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBkb3dubG9hZEFwcGxpY2F0aW9uUHJvdGVjdGlvbiAoY2xpZW50LCBwcm90ZWN0aW9uSWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KGAvYXBwbGljYXRpb24vZG93bmxvYWQvJHtwcm90ZWN0aW9uSWR9YCwgbnVsbCwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSwgZmFsc2UpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9XG59O1xuXG5mdW5jdGlvbiBnZXRGaWxlRnJvbVVybCAoY2xpZW50LCB1cmwpIHtcbiAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gIHZhciBmaWxlO1xuICByZXF1ZXN0LmdldCh1cmwpXG4gICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgZmlsZSA9IHtcbiAgICAgICAgY29udGVudDogcmVzLmRhdGEsXG4gICAgICAgIGZpbGVuYW1lOiBwYXRoLmJhc2VuYW1lKHVybCksXG4gICAgICAgIGV4dGVuc2lvbjogcGF0aC5leHRuYW1lKHVybCkuc3Vic3RyKDEpXG4gICAgICB9O1xuICAgICAgZGVmZXJyZWQucmVzb2x2ZShmaWxlKTtcbiAgICB9KVxuICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcbiAgICB9KTtcbiAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cbmZ1bmN0aW9uIHJlc3BvbnNlSGFuZGxlciAoZGVmZXJyZWQpIHtcbiAgcmV0dXJuIChlcnIsIHJlcykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYm9keSA9IHJlcy5kYXRhO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPj0gNDAwKSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGJvZHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYm9keSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChib2R5KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGVycm9ySGFuZGxlciAocmVzKSB7XG4gIGlmIChyZXMuZXJyb3JzICYmIHJlcy5lcnJvcnMubGVuZ3RoKSB7XG4gICAgcmVzLmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLm1lc3NhZ2UpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKHJlcy5tZXNzYWdlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKHJlcy5tZXNzYWdlKTtcbiAgfVxuXG4gIHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVBhcmFtZXRlcnMgKHBhcmFtZXRlcnMpIHtcbiAgdmFyIHJlc3VsdDtcblxuICBpZiAoIUFycmF5LmlzQXJyYXkocGFyYW1ldGVycykpIHtcbiAgICByZXN1bHQgPSBbXTtcbiAgICBPYmplY3Qua2V5cyhwYXJhbWV0ZXJzKS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIG9wdGlvbnM6IHBhcmFtZXRlcnNbbmFtZV1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9IHBhcmFtZXRlcnM7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuIl19
