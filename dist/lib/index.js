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
      var config, applicationId, host, port, keys, filesDest, filesSrc, cwd, params, applicationTypes, languageSpecifications, sourceMaps, areSubscribersOrdered, useRecommendedOrder, accessKey, secretKey, client, _filesSrc, i, l, _zip, removeSourceRes, hadNoSources, addApplicationSourceRes, $set, updateApplicationRes, createApplicationProtectionRes, protectionId, sources, errors, download;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              config = typeof configPathOrObject === 'string' ? require(configPathOrObject) : configPathOrObject;
              applicationId = config.applicationId, host = config.host, port = config.port, keys = config.keys, filesDest = config.filesDest, filesSrc = config.filesSrc, cwd = config.cwd, params = config.params, applicationTypes = config.applicationTypes, languageSpecifications = config.languageSpecifications, sourceMaps = config.sourceMaps, areSubscribersOrdered = config.areSubscribersOrdered, useRecommendedOrder = config.useRecommendedOrder;
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
              return _this.createApplicationProtection(client, applicationId);

            case 40:
              createApplicationProtectionRes = _context.sent;

              errorHandler(createApplicationProtectionRes);

              protectionId = createApplicationProtectionRes.data.createApplicationProtection._id;
              _context.next = 45;
              return _this.pollProtection(client, applicationId, protectionId);

            case 45:
              sources = _context.sent;
              errors = [];

              sources.forEach(function (s) {
                if (s.errorMessages && s.errorMessages.length > 0) {
                  errors.push.apply(errors, _toConsumableArray(s.errorMessages.map(function (e) {
                    return _extends({
                      filename: s.filename
                    }, e);
                  })));
                }
              });

              errors.forEach(function (e) {
                return console.error('Non-fatal error: "' + e.message + '" in ' + e.filename);
              });

              _context.next = 51;
              return _this.downloadApplicationProtection(client, protectionId);

            case 51:
              download = _context.sent;

              errorHandler(download);
              (0, _zip2.unzip)(download, filesDest || destCallback);
              console.log(protectionId);

            case 55:
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
                  var applicationProtection, state, url;
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

                          if (state !== 'finished' && state !== 'errored') {
                            setTimeout(poll, 500);
                          } else if (state === 'errored') {
                            url = 'https://app.jscrambler.com/app/' + applicationId + '/protections/' + protectionId;

                            deferred.reject('Protection failed. For more information visit: ' + url);
                          } else {
                            deferred.resolve(applicationProtection.data.applicationProtection.sources);
                          }

                        case 10:
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
  createApplicationProtection: function createApplicationProtection(client, applicationId, fragments) {
    var _this25 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee26() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee26$(_context26) {
        while (1) {
          switch (_context26.prev = _context26.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.createApplicationProtection)(applicationId, fragments), responseHandler(deferred));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvaW5kZXguanMiXSwibmFtZXMiOlsiQ2xpZW50IiwiY29uZmlnIiwiZ2VuZXJhdGVTaWduZWRQYXJhbXMiLCJwcm90ZWN0QW5kRG93bmxvYWQiLCJjb25maWdQYXRoT3JPYmplY3QiLCJkZXN0Q2FsbGJhY2siLCJyZXF1aXJlIiwiYXBwbGljYXRpb25JZCIsImhvc3QiLCJwb3J0Iiwia2V5cyIsImZpbGVzRGVzdCIsImZpbGVzU3JjIiwiY3dkIiwicGFyYW1zIiwiYXBwbGljYXRpb25UeXBlcyIsImxhbmd1YWdlU3BlY2lmaWNhdGlvbnMiLCJzb3VyY2VNYXBzIiwiYXJlU3Vic2NyaWJlcnNPcmRlcmVkIiwidXNlUmVjb21tZW5kZWRPcmRlciIsImFjY2Vzc0tleSIsInNlY3JldEtleSIsImNsaWVudCIsIkVycm9yIiwibGVuZ3RoIiwiX2ZpbGVzU3JjIiwiaSIsImwiLCJjb25jYXQiLCJzeW5jIiwiZG90IiwicHVzaCIsIl96aXAiLCJyZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24iLCJyZW1vdmVTb3VyY2VSZXMiLCJlcnJvcnMiLCJoYWROb1NvdXJjZXMiLCJmb3JFYWNoIiwiZXJyb3IiLCJtZXNzYWdlIiwiYWRkQXBwbGljYXRpb25Tb3VyY2UiLCJjb250ZW50IiwiZ2VuZXJhdGUiLCJ0eXBlIiwiZmlsZW5hbWUiLCJleHRlbnNpb24iLCJhZGRBcHBsaWNhdGlvblNvdXJjZVJlcyIsImVycm9ySGFuZGxlciIsIiRzZXQiLCJfaWQiLCJPYmplY3QiLCJwYXJhbWV0ZXJzIiwiSlNPTiIsInN0cmluZ2lmeSIsIm5vcm1hbGl6ZVBhcmFtZXRlcnMiLCJBcnJheSIsImlzQXJyYXkiLCJ1bmRlZmluZWQiLCJ1cGRhdGVBcHBsaWNhdGlvbiIsInVwZGF0ZUFwcGxpY2F0aW9uUmVzIiwiY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uIiwiY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uUmVzIiwicHJvdGVjdGlvbklkIiwiZGF0YSIsInBvbGxQcm90ZWN0aW9uIiwic291cmNlcyIsInMiLCJlcnJvck1lc3NhZ2VzIiwibWFwIiwiZSIsImNvbnNvbGUiLCJkb3dubG9hZEFwcGxpY2F0aW9uUHJvdGVjdGlvbiIsImRvd25sb2FkIiwibG9nIiwiZG93bmxvYWRTb3VyY2VNYXBzIiwiY29uZmlncyIsImRvd25sb2FkU291cmNlTWFwc1JlcXVlc3QiLCJkZWZlcnJlZCIsImRlZmVyIiwicG9sbCIsImdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbiIsImFwcGxpY2F0aW9uUHJvdGVjdGlvbiIsInN0YXRlIiwic2V0VGltZW91dCIsInVybCIsInJlamVjdCIsInJlc29sdmUiLCJwcm9taXNlIiwiY3JlYXRlQXBwbGljYXRpb24iLCJmcmFnbWVudHMiLCJwb3N0IiwicmVzcG9uc2VIYW5kbGVyIiwiZHVwbGljYXRlQXBwbGljYXRpb24iLCJyZW1vdmVBcHBsaWNhdGlvbiIsImlkIiwicmVtb3ZlUHJvdGVjdGlvbiIsImFwcElkIiwiY2FuY2VsUHJvdGVjdGlvbiIsImFwcGxpY2F0aW9uIiwidW5sb2NrQXBwbGljYXRpb24iLCJnZXRBcHBsaWNhdGlvbiIsImdldCIsImdldEFwcGxpY2F0aW9uU291cmNlIiwic291cmNlSWQiLCJsaW1pdHMiLCJnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zIiwiZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50IiwiY3JlYXRlVGVtcGxhdGUiLCJ0ZW1wbGF0ZSIsInJlbW92ZVRlbXBsYXRlIiwiZ2V0VGVtcGxhdGVzIiwiZ2V0QXBwbGljYXRpb25zIiwiYXBwbGljYXRpb25Tb3VyY2UiLCJhZGRBcHBsaWNhdGlvblNvdXJjZUZyb21VUkwiLCJnZXRGaWxlRnJvbVVybCIsInRoZW4iLCJmaWxlIiwidXBkYXRlQXBwbGljYXRpb25Tb3VyY2UiLCJhcHBseVRlbXBsYXRlIiwidGVtcGxhdGVJZCIsInVwZGF0ZVRlbXBsYXRlIiwicmVzIiwiYmFzZW5hbWUiLCJleHRuYW1lIiwic3Vic3RyIiwiY2F0Y2giLCJlcnIi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bXBvcnQgZ2xvYiBmcm9tICdnbG9iJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHJlcXVlc3QgZnJvbSAnYXhpb3MnO1xuaW1wb3J0IFEgZnJvbSAncSc7XG5cbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IGdlbmVyYXRlU2lnbmVkUGFyYW1zIGZyb20gJy4vZ2VuZXJhdGUtc2lnbmVkLXBhcmFtcyc7XG5pbXBvcnQgSlNjcmFtYmxlckNsaWVudCBmcm9tICcuL2NsaWVudCc7XG5pbXBvcnQge1xuICBhZGRBcHBsaWNhdGlvblNvdXJjZSxcbiAgY3JlYXRlQXBwbGljYXRpb24sXG4gIHJlbW92ZUFwcGxpY2F0aW9uLFxuICB1cGRhdGVBcHBsaWNhdGlvbixcbiAgdXBkYXRlQXBwbGljYXRpb25Tb3VyY2UsXG4gIHJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbixcbiAgY3JlYXRlVGVtcGxhdGUsXG4gIHJlbW92ZVRlbXBsYXRlLFxuICB1cGRhdGVUZW1wbGF0ZSxcbiAgY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uLFxuICByZW1vdmVQcm90ZWN0aW9uLFxuICBjYW5jZWxQcm90ZWN0aW9uLFxuICBkdXBsaWNhdGVBcHBsaWNhdGlvbixcbiAgdW5sb2NrQXBwbGljYXRpb24sXG4gIGFwcGx5VGVtcGxhdGVcbn0gZnJvbSAnLi9tdXRhdGlvbnMnO1xuaW1wb3J0IHtcbiAgZ2V0QXBwbGljYXRpb24sXG4gIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnMsXG4gIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudCxcbiAgZ2V0QXBwbGljYXRpb25zLFxuICBnZXRBcHBsaWNhdGlvblNvdXJjZSxcbiAgZ2V0VGVtcGxhdGVzLFxuICBnZXRQcm90ZWN0aW9uXG59IGZyb20gJy4vcXVlcmllcyc7XG5pbXBvcnQge1xuICB6aXAsXG4gIHVuemlwXG59IGZyb20gJy4vemlwJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBDbGllbnQ6IEpTY3JhbWJsZXJDbGllbnQsXG4gIGNvbmZpZyxcbiAgZ2VuZXJhdGVTaWduZWRQYXJhbXMsXG4gIC8vIFRoaXMgbWV0aG9kIGlzIGEgc2hvcnRjdXQgbWV0aG9kIHRoYXQgYWNjZXB0cyBhbiBvYmplY3Qgd2l0aCBldmVyeXRoaW5nIG5lZWRlZFxuICAvLyBmb3IgdGhlIGVudGlyZSBwcm9jZXNzIG9mIHJlcXVlc3RpbmcgYW4gYXBwbGljYXRpb24gcHJvdGVjdGlvbiBhbmQgZG93bmxvYWRpbmdcbiAgLy8gdGhhdCBzYW1lIHByb3RlY3Rpb24gd2hlbiB0aGUgc2FtZSBlbmRzLlxuICAvL1xuICAvLyBgY29uZmlnUGF0aE9yT2JqZWN0YCBjYW4gYmUgYSBwYXRoIHRvIGEgSlNPTiBvciBkaXJlY3RseSBhbiBvYmplY3QgY29udGFpbmluZ1xuICAvLyB0aGUgZm9sbG93aW5nIHN0cnVjdHVyZTpcbiAgLy9cbiAgLy8gYGBganNvblxuICAvLyB7XG4gIC8vICAgXCJrZXlzXCI6IHtcbiAgLy8gICAgIFwiYWNjZXNzS2V5XCI6IFwiXCIsXG4gIC8vICAgICBcInNlY3JldEtleVwiOiBcIlwiXG4gIC8vICAgfSxcbiAgLy8gICBcImFwcGxpY2F0aW9uSWRcIjogXCJcIixcbiAgLy8gICBcImZpbGVzRGVzdFwiOiBcIlwiXG4gIC8vIH1cbiAgLy8gYGBgXG4gIC8vXG4gIC8vIEFsc28gdGhlIGZvbGxvd2luZyBvcHRpb25hbCBwYXJhbWV0ZXJzIGFyZSBhY2NlcHRlZDpcbiAgLy9cbiAgLy8gYGBganNvblxuICAvLyB7XG4gIC8vICAgXCJmaWxlc1NyY1wiOiBbXCJcIl0sXG4gIC8vICAgXCJwYXJhbXNcIjoge30sXG4gIC8vICAgXCJjd2RcIjogXCJcIixcbiAgLy8gICBcImhvc3RcIjogXCJhcGkuanNjcmFtYmxlci5jb21cIixcbiAgLy8gICBcInBvcnRcIjogXCI0NDNcIlxuICAvLyB9XG4gIC8vIGBgYFxuICAvL1xuICAvLyBgZmlsZXNTcmNgIHN1cHBvcnRzIGdsb2IgcGF0dGVybnMsIGFuZCBpZiBpdCdzIHByb3ZpZGVkIGl0IHdpbGwgcmVwbGFjZSB0aGVcbiAgLy8gZW50aXJlIGFwcGxpY2F0aW9uIHNvdXJjZXMuXG4gIC8vXG4gIC8vIGBwYXJhbXNgIGlmIHByb3ZpZGVkIHdpbGwgcmVwbGFjZSBhbGwgdGhlIGFwcGxpY2F0aW9uIHRyYW5zZm9ybWF0aW9uIHBhcmFtZXRlcnMuXG4gIC8vXG4gIC8vIGBjd2RgIGFsbG93cyB5b3UgdG8gc2V0IHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IHRvIHJlc29sdmUgcHJvYmxlbXMgd2l0aFxuICAvLyByZWxhdGl2ZSBwYXRocyB3aXRoIHlvdXIgYGZpbGVzU3JjYCBpcyBvdXRzaWRlIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LlxuICAvL1xuICAvLyBGaW5hbGx5LCBgaG9zdGAgYW5kIGBwb3J0YCBjYW4gYmUgb3ZlcnJpZGRlbiBpZiB5b3UgdG8gZW5nYWdlIHdpdGggYSBkaWZmZXJlbnRcbiAgLy8gZW5kcG9pbnQgdGhhbiB0aGUgZGVmYXVsdCBvbmUsIHVzZWZ1bCBpZiB5b3UncmUgcnVubmluZyBhbiBlbnRlcnByaXNlIHZlcnNpb24gb2ZcbiAgLy8gSnNjcmFtYmxlciBvciBpZiB5b3UncmUgcHJvdmlkZWQgYWNjZXNzIHRvIGJldGEgZmVhdHVyZXMgb2Ygb3VyIHByb2R1Y3QuXG4gIC8vXG4gIGFzeW5jIHByb3RlY3RBbmREb3dubG9hZCAoY29uZmlnUGF0aE9yT2JqZWN0LCBkZXN0Q2FsbGJhY2spIHtcbiAgICBjb25zdCBjb25maWcgPSB0eXBlb2YgY29uZmlnUGF0aE9yT2JqZWN0ID09PSAnc3RyaW5nJyA/XG4gICAgICByZXF1aXJlKGNvbmZpZ1BhdGhPck9iamVjdCkgOiBjb25maWdQYXRoT3JPYmplY3Q7XG5cbiAgICBjb25zdCB7XG4gICAgICBhcHBsaWNhdGlvbklkLFxuICAgICAgaG9zdCxcbiAgICAgIHBvcnQsXG4gICAgICBrZXlzLFxuICAgICAgZmlsZXNEZXN0LFxuICAgICAgZmlsZXNTcmMsXG4gICAgICBjd2QsXG4gICAgICBwYXJhbXMsXG4gICAgICBhcHBsaWNhdGlvblR5cGVzLFxuICAgICAgbGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucyxcbiAgICAgIHNvdXJjZU1hcHMsXG4gICAgICBhcmVTdWJzY3JpYmVyc09yZGVyZWQsXG4gICAgICB1c2VSZWNvbW1lbmRlZE9yZGVyXG4gICAgfSA9IGNvbmZpZztcblxuICAgIGNvbnN0IHtcbiAgICAgIGFjY2Vzc0tleSxcbiAgICAgIHNlY3JldEtleVxuICAgIH0gPSBrZXlzO1xuXG4gICAgY29uc3QgY2xpZW50ID0gbmV3IHRoaXMuQ2xpZW50KHtcbiAgICAgIGFjY2Vzc0tleSxcbiAgICAgIHNlY3JldEtleSxcbiAgICAgIGhvc3QsXG4gICAgICBwb3J0XG4gICAgfSk7XG5cbiAgICBpZiAoIWFwcGxpY2F0aW9uSWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKmFwcGxpY2F0aW9uSWQqIG5vdCBwcm92aWRlZCcpO1xuICAgIH1cblxuICAgIGlmICghZmlsZXNEZXN0ICYmICFkZXN0Q2FsbGJhY2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKmZpbGVzRGVzdCogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgaWYgKGZpbGVzU3JjICYmIGZpbGVzU3JjLmxlbmd0aCkge1xuICAgICAgbGV0IF9maWxlc1NyYyA9IFtdO1xuICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBmaWxlc1NyYy5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBmaWxlc1NyY1tpXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAvLyBUT0RPIFJlcGxhY2UgYGdsb2Iuc3luY2Agd2l0aCBhc3luYyB2ZXJzaW9uXG4gICAgICAgICAgX2ZpbGVzU3JjID0gX2ZpbGVzU3JjLmNvbmNhdChnbG9iLnN5bmMoZmlsZXNTcmNbaV0sIHtcbiAgICAgICAgICAgIGRvdDogdHJ1ZVxuICAgICAgICAgIH0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfZmlsZXNTcmMucHVzaChmaWxlc1NyY1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgX3ppcCA9IGF3YWl0IHppcChfZmlsZXNTcmMsIGN3ZCk7XG5cbiAgICAgIGNvbnN0IHJlbW92ZVNvdXJjZVJlcyA9IGF3YWl0IHRoaXMucmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uKGNsaWVudCwgJycsIGFwcGxpY2F0aW9uSWQpO1xuICAgICAgaWYgKHJlbW92ZVNvdXJjZVJlcy5lcnJvcnMpIHtcbiAgICAgICAgLy8gVE9ETyBJbXBsZW1lbnQgZXJyb3IgY29kZXMgb3IgZml4IHRoaXMgaXMgb24gdGhlIHNlcnZpY2VzXG4gICAgICAgIHZhciBoYWROb1NvdXJjZXMgPSBmYWxzZTtcbiAgICAgICAgcmVtb3ZlU291cmNlUmVzLmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvci5tZXNzYWdlID09PSAnQXBwbGljYXRpb24gU291cmNlIHdpdGggdGhlIGdpdmVuIElEIGRvZXMgbm90IGV4aXN0Jykge1xuICAgICAgICAgICAgaGFkTm9Tb3VyY2VzID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIWhhZE5vU291cmNlcykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZW1vdmVTb3VyY2VSZXMuZXJyb3JzWzBdLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFkZEFwcGxpY2F0aW9uU291cmNlUmVzID0gYXdhaXQgdGhpcy5hZGRBcHBsaWNhdGlvblNvdXJjZShjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHtcbiAgICAgICAgY29udGVudDogX3ppcC5nZW5lcmF0ZSh7XG4gICAgICAgICAgdHlwZTogJ2Jhc2U2NCdcbiAgICAgICAgfSksXG4gICAgICAgIGZpbGVuYW1lOiAnYXBwbGljYXRpb24uemlwJyxcbiAgICAgICAgZXh0ZW5zaW9uOiAnemlwJ1xuICAgICAgfSk7XG4gICAgICBlcnJvckhhbmRsZXIoYWRkQXBwbGljYXRpb25Tb3VyY2VSZXMpO1xuICAgIH1cblxuICAgIGNvbnN0ICRzZXQgPSB7XG4gICAgICBfaWQ6IGFwcGxpY2F0aW9uSWRcbiAgICB9O1xuXG4gICAgaWYgKHBhcmFtcyAmJiBPYmplY3Qua2V5cyhwYXJhbXMpLmxlbmd0aCkge1xuICAgICAgJHNldC5wYXJhbWV0ZXJzID0gSlNPTi5zdHJpbmdpZnkobm9ybWFsaXplUGFyYW1ldGVycyhwYXJhbXMpKTtcbiAgICAgICRzZXQuYXJlU3Vic2NyaWJlcnNPcmRlcmVkID0gQXJyYXkuaXNBcnJheShwYXJhbXMpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYXJlU3Vic2NyaWJlcnNPcmRlcmVkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgJHNldC5hcmVTdWJzY3JpYmVyc09yZGVyZWQgPSBhcmVTdWJzY3JpYmVyc09yZGVyZWQ7XG4gICAgfVxuXG4gICAgaWYgKGFwcGxpY2F0aW9uVHlwZXMpIHtcbiAgICAgICRzZXQuYXBwbGljYXRpb25UeXBlcyA9IGFwcGxpY2F0aW9uVHlwZXM7XG4gICAgfVxuXG4gICAgaWYgKHVzZVJlY29tbWVuZGVkT3JkZXIpIHtcbiAgICAgICRzZXQudXNlUmVjb21tZW5kZWRPcmRlciA9IHVzZVJlY29tbWVuZGVkT3JkZXI7XG4gICAgfVxuXG4gICAgaWYgKGxhbmd1YWdlU3BlY2lmaWNhdGlvbnMpIHtcbiAgICAgICRzZXQubGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucyA9IGxhbmd1YWdlU3BlY2lmaWNhdGlvbnM7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBzb3VyY2VNYXBzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICRzZXQuc291cmNlTWFwcyA9IEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcHMpO1xuICAgIH1cblxuICAgIGlmICgkc2V0LnBhcmFtZXRlcnMgfHwgJHNldC5hcHBsaWNhdGlvblR5cGVzIHx8ICRzZXQubGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucyB8fFxuICAgICAgdHlwZW9mICRzZXQuYXJlU3Vic2NyaWJlcnNPcmRlcmVkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc3QgdXBkYXRlQXBwbGljYXRpb25SZXMgPSBhd2FpdCB0aGlzLnVwZGF0ZUFwcGxpY2F0aW9uKGNsaWVudCwgJHNldCk7XG4gICAgICBlcnJvckhhbmRsZXIodXBkYXRlQXBwbGljYXRpb25SZXMpO1xuICAgIH1cblxuICAgIGNvbnN0IGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcyA9IGF3YWl0IHRoaXMuY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uKGNsaWVudCwgYXBwbGljYXRpb25JZCk7XG4gICAgZXJyb3JIYW5kbGVyKGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcyk7XG5cbiAgICBjb25zdCBwcm90ZWN0aW9uSWQgPSBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb25SZXMuZGF0YS5jcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24uX2lkO1xuICAgIGNvbnN0IHNvdXJjZXMgPSBhd2FpdCB0aGlzLnBvbGxQcm90ZWN0aW9uKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkKTtcblxuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIHNvdXJjZXMuZm9yRWFjaChzID0+IHtcbiAgICAgIGlmIChzLmVycm9yTWVzc2FnZXMgJiYgcy5lcnJvck1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZXJyb3JzLnB1c2goLi4ucy5lcnJvck1lc3NhZ2VzLm1hcChlID0+ICh7XG4gICAgICAgICAgZmlsZW5hbWU6IHMuZmlsZW5hbWUsXG4gICAgICAgICAgLi4uZVxuICAgICAgICB9KSkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZXJyb3JzLmZvckVhY2goZSA9PiBjb25zb2xlLmVycm9yKGBOb24tZmF0YWwgZXJyb3I6IFwiJHtlLm1lc3NhZ2V9XCIgaW4gJHtlLmZpbGVuYW1lfWApKTtcblxuICAgIGNvbnN0IGRvd25sb2FkID0gYXdhaXQgdGhpcy5kb3dubG9hZEFwcGxpY2F0aW9uUHJvdGVjdGlvbihjbGllbnQsIHByb3RlY3Rpb25JZCk7XG4gICAgZXJyb3JIYW5kbGVyKGRvd25sb2FkKTtcbiAgICB1bnppcChkb3dubG9hZCwgZmlsZXNEZXN0IHx8IGRlc3RDYWxsYmFjayk7XG4gICAgY29uc29sZS5sb2cocHJvdGVjdGlvbklkKTtcbiAgfSxcblxuICBhc3luYyBkb3dubG9hZFNvdXJjZU1hcHMgKGNvbmZpZ3MsIGRlc3RDYWxsYmFjaykge1xuICAgIGNvbnN0IHtcbiAgICAgIGtleXMsXG4gICAgICBob3N0LFxuICAgICAgcG9ydCxcbiAgICAgIGZpbGVzRGVzdCxcbiAgICAgIGZpbGVzU3JjLFxuICAgICAgcHJvdGVjdGlvbklkXG4gICAgfSA9IGNvbmZpZ3M7XG5cbiAgICBjb25zdCB7XG4gICAgICBhY2Nlc3NLZXksXG4gICAgICBzZWNyZXRLZXlcbiAgICB9ID0ga2V5cztcblxuICAgIGNvbnN0IGNsaWVudCA9IG5ldyB0aGlzLkNsaWVudCh7XG4gICAgICBhY2Nlc3NLZXksXG4gICAgICBzZWNyZXRLZXksXG4gICAgICBob3N0LFxuICAgICAgcG9ydFxuICAgIH0pO1xuXG4gICAgaWYgKCFmaWxlc0Rlc3QgJiYgIWRlc3RDYWxsYmFjaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXF1aXJlZCAqZmlsZXNEZXN0KiBub3QgcHJvdmlkZWQnKTtcbiAgICB9XG5cbiAgICBpZiAoIXByb3RlY3Rpb25JZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXF1aXJlZCAqcHJvdGVjdGlvbklkKiBub3QgcHJvdmlkZWQnKTtcbiAgICB9XG5cblxuICAgIGlmIChmaWxlc1NyYykge1xuICAgICAgY29uc29sZS5sb2coJ1tXYXJuaW5nXSBJZ25vcmluZyBzb3VyY2VzIHN1cHBsaWVkLiBEb3dubG9hZGluZyBzb3VyY2UgbWFwcyBvZiBnaXZlbiBwcm90ZWN0aW9uJyk7XG4gICAgfVxuICAgIGxldCBkb3dubG9hZDtcbiAgICB0cnkge1xuICAgICAgZG93bmxvYWQgPSBhd2FpdCB0aGlzLmRvd25sb2FkU291cmNlTWFwc1JlcXVlc3QoY2xpZW50LCBwcm90ZWN0aW9uSWQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGVycm9ySGFuZGxlcihlKTtcbiAgICB9XG4gICAgdW56aXAoZG93bmxvYWQsIGZpbGVzRGVzdCB8fCBkZXN0Q2FsbGJhY2spO1xuICB9LFxuXG4gIGFzeW5jIHBvbGxQcm90ZWN0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHByb3RlY3Rpb25JZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuXG4gICAgY29uc3QgcG9sbCA9IGFzeW5jKCkgPT4ge1xuICAgICAgY29uc3QgYXBwbGljYXRpb25Qcm90ZWN0aW9uID0gYXdhaXQgdGhpcy5nZXRBcHBsaWNhdGlvblByb3RlY3Rpb24oY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQpO1xuICAgICAgaWYgKGFwcGxpY2F0aW9uUHJvdGVjdGlvbi5lcnJvcnMpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIHBvbGxpbmcgcHJvdGVjdGlvbicsIGFwcGxpY2F0aW9uUHJvdGVjdGlvbi5lcnJvcnMpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIHBvbGxpbmcgcHJvdGVjdGlvbicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBhcHBsaWNhdGlvblByb3RlY3Rpb24uZGF0YS5hcHBsaWNhdGlvblByb3RlY3Rpb24uc3RhdGU7XG4gICAgICAgIGlmIChzdGF0ZSAhPT0gJ2ZpbmlzaGVkJyAmJiBzdGF0ZSAhPT0gJ2Vycm9yZWQnKSB7XG4gICAgICAgICAgc2V0VGltZW91dChwb2xsLCA1MDApO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSAnZXJyb3JlZCcpIHtcbiAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcHAuanNjcmFtYmxlci5jb20vYXBwLyR7YXBwbGljYXRpb25JZH0vcHJvdGVjdGlvbnMvJHtwcm90ZWN0aW9uSWR9YDtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoYFByb3RlY3Rpb24gZmFpbGVkLiBGb3IgbW9yZSBpbmZvcm1hdGlvbiB2aXNpdDogJHt1cmx9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShhcHBsaWNhdGlvblByb3RlY3Rpb24uZGF0YS5hcHBsaWNhdGlvblByb3RlY3Rpb24uc291cmNlcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcG9sbCgpO1xuXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGNyZWF0ZUFwcGxpY2F0aW9uIChjbGllbnQsIGRhdGEsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBjcmVhdGVBcHBsaWNhdGlvbihkYXRhLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZHVwbGljYXRlQXBwbGljYXRpb24gKGNsaWVudCwgZGF0YSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGR1cGxpY2F0ZUFwcGxpY2F0aW9uKGRhdGEsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyByZW1vdmVBcHBsaWNhdGlvbiAoY2xpZW50LCBpZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCByZW1vdmVBcHBsaWNhdGlvbihpZCksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyByZW1vdmVQcm90ZWN0aW9uIChjbGllbnQsIGlkLCBhcHBJZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHJlbW92ZVByb3RlY3Rpb24oaWQsIGFwcElkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgY2FuY2VsUHJvdGVjdGlvbiAoY2xpZW50LCBpZCwgYXBwSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBjYW5jZWxQcm90ZWN0aW9uKGlkLCBhcHBJZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHVwZGF0ZUFwcGxpY2F0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgdXBkYXRlQXBwbGljYXRpb24oYXBwbGljYXRpb24sIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyB1bmxvY2tBcHBsaWNhdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbiwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHVubG9ja0FwcGxpY2F0aW9uKGFwcGxpY2F0aW9uLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb24oYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uU291cmNlIChjbGllbnQsIHNvdXJjZUlkLCBmcmFnbWVudHMsIGxpbWl0cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9uU291cmNlKHNvdXJjZUlkLCBmcmFnbWVudHMsIGxpbWl0cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHBhcmFtcywgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9ucyhhcHBsaWNhdGlvbklkLCBwYXJhbXMsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zQ291bnQgKGNsaWVudCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50KGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBjcmVhdGVUZW1wbGF0ZSAoY2xpZW50LCB0ZW1wbGF0ZSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGNyZWF0ZVRlbXBsYXRlKHRlbXBsYXRlLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgcmVtb3ZlVGVtcGxhdGUgKGNsaWVudCwgaWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgcmVtb3ZlVGVtcGxhdGUoaWQpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0VGVtcGxhdGVzIChjbGllbnQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldFRlbXBsYXRlcyhmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25zIChjbGllbnQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9ucyhmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgYWRkQXBwbGljYXRpb25Tb3VyY2UgKGNsaWVudCwgYXBwbGljYXRpb25JZCwgYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBhZGRBcHBsaWNhdGlvblNvdXJjZShhcHBsaWNhdGlvbklkLCBhcHBsaWNhdGlvblNvdXJjZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGFkZEFwcGxpY2F0aW9uU291cmNlRnJvbVVSTCAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCB1cmwsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIHJldHVybiBnZXRGaWxlRnJvbVVybChjbGllbnQsIHVybClcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBhZGRBcHBsaWNhdGlvblNvdXJjZShhcHBsaWNhdGlvbklkLCBmaWxlLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICB9KTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgdXBkYXRlQXBwbGljYXRpb25Tb3VyY2UgKGNsaWVudCwgYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCB1cGRhdGVBcHBsaWNhdGlvblNvdXJjZShhcHBsaWNhdGlvblNvdXJjZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbiAoY2xpZW50LCBzb3VyY2VJZCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbihzb3VyY2VJZCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGFwcGx5VGVtcGxhdGUgKGNsaWVudCwgdGVtcGxhdGVJZCwgYXBwSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBhcHBseVRlbXBsYXRlKHRlbXBsYXRlSWQsIGFwcElkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgdXBkYXRlVGVtcGxhdGUgKGNsaWVudCwgdGVtcGxhdGUsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCB1cGRhdGVUZW1wbGF0ZSh0ZW1wbGF0ZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uKGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRQcm90ZWN0aW9uKGFwcGxpY2F0aW9uSWQsIHByb3RlY3Rpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGRvd25sb2FkU291cmNlTWFwc1JlcXVlc3QgKGNsaWVudCwgcHJvdGVjdGlvbklkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldChgL2FwcGxpY2F0aW9uL3NvdXJjZU1hcHMvJHtwcm90ZWN0aW9uSWR9YCwgbnVsbCwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSwgZmFsc2UpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBkb3dubG9hZEFwcGxpY2F0aW9uUHJvdGVjdGlvbiAoY2xpZW50LCBwcm90ZWN0aW9uSWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KGAvYXBwbGljYXRpb24vZG93bmxvYWQvJHtwcm90ZWN0aW9uSWR9YCwgbnVsbCwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSwgZmFsc2UpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9XG59O1xuXG5mdW5jdGlvbiBnZXRGaWxlRnJvbVVybCAoY2xpZW50LCB1cmwpIHtcbiAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gIHZhciBmaWxlO1xuICByZXF1ZXN0LmdldCh1cmwpXG4gICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgZmlsZSA9IHtcbiAgICAgICAgY29udGVudDogcmVzLmRhdGEsXG4gICAgICAgIGZpbGVuYW1lOiBwYXRoLmJhc2VuYW1lKHVybCksXG4gICAgICAgIGV4dGVuc2lvbjogcGF0aC5leHRuYW1lKHVybCkuc3Vic3RyKDEpXG4gICAgICB9O1xuICAgICAgZGVmZXJyZWQucmVzb2x2ZShmaWxlKTtcbiAgICB9KVxuICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcbiAgICB9KTtcbiAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cbmZ1bmN0aW9uIHJlc3BvbnNlSGFuZGxlciAoZGVmZXJyZWQpIHtcbiAgcmV0dXJuIChlcnIsIHJlcykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYm9keSA9IHJlcy5kYXRhO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPj0gNDAwKSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGJvZHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYm9keSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChib2R5KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGVycm9ySGFuZGxlciAocmVzKSB7XG4gIGlmIChyZXMuZXJyb3JzICYmIHJlcy5lcnJvcnMubGVuZ3RoKSB7XG4gICAgcmVzLmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLm1lc3NhZ2UpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKHJlcy5tZXNzYWdlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKHJlcy5tZXNzYWdlKTtcbiAgfVxuXG4gIHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVBhcmFtZXRlcnMgKHBhcmFtZXRlcnMpIHtcbiAgdmFyIHJlc3VsdDtcblxuICBpZiAoIUFycmF5LmlzQXJyYXkocGFyYW1ldGVycykpIHtcbiAgICByZXN1bHQgPSBbXTtcbiAgICBPYmplY3Qua2V5cyhwYXJhbWV0ZXJzKS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIG9wdGlvbnM6IHBhcmFtZXRlcnNbbmFtZV1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9IHBhcmFtZXRlcnM7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuIl19
