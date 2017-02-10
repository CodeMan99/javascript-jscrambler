'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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
      var config, applicationId, host, port, keys, filesDest, filesSrc, cwd, params, applicationTypes, languageSpecifications, sourceMaps, randomizationSeed, areSubscribersOrdered, useRecommendedOrder, accessKey, secretKey, client, _filesSrc, i, l, _zip, removeSourceRes, hadNoSources, addApplicationSourceRes, $set, updateApplicationRes, createApplicationProtectionRes, protectionId, download;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              config = typeof configPathOrObject === 'string' ? require(configPathOrObject) : configPathOrObject;
              applicationId = config.applicationId, host = config.host, port = config.port, keys = config.keys, filesDest = config.filesDest, filesSrc = config.filesSrc, cwd = config.cwd, params = config.params, applicationTypes = config.applicationTypes, languageSpecifications = config.languageSpecifications, sourceMaps = config.sourceMaps, randomizationSeed = config.randomizationSeed, areSubscribersOrdered = config.areSubscribersOrdered, useRecommendedOrder = config.useRecommendedOrder;
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
                  _filesSrc = _filesSrc.concat(_glob2.default.sync(filesSrc[i], { dot: true }));
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
                content: _zip.generate({ type: 'base64' }),
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
              return _this.createApplicationProtection(client, applicationId, undefined, randomizationSeed);

            case 40:
              createApplicationProtectionRes = _context.sent;

              errorHandler(createApplicationProtectionRes);

              protectionId = createApplicationProtectionRes.data.createApplicationProtection._id;
              _context.next = 45;
              return _this.pollProtection(client, applicationId, protectionId);

            case 45:
              _context.next = 47;
              return _this.downloadApplicationProtection(client, protectionId);

            case 47:
              download = _context.sent;

              errorHandler(download);
              (0, _zip2.unzip)(download, filesDest || destCallback);
              console.log(protectionId);

            case 51:
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
                            _context3.next = 9;
                            break;
                          }

                          console.log('Error polling protection', applicationProtection.errors);
                          throw new Error('Error polling protection');

                        case 9:
                          state = applicationProtection.data.applicationProtection.state;

                          if (state !== 'finished' && state !== 'errored') {
                            setTimeout(poll, 500);
                          } else if (state === 'errored') {
                            url = 'https://app.jscrambler.com/app/' + applicationId + '/protections/' + protectionId;

                            deferred.reject('Protection failed. For more information visit: ' + url);
                          } else {
                            deferred.resolve();
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
  createApplicationProtection: function createApplicationProtection(client, applicationId, fragments, randomizationSeed) {
    var _this25 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee26() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee26$(_context26) {
        while (1) {
          switch (_context26.prev = _context26.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.createApplicationProtection)(applicationId, fragments, randomizationSeed), responseHandler(deferred));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvaW5kZXguanMiXSwibmFtZXMiOlsiQ2xpZW50IiwiY29uZmlnIiwiZ2VuZXJhdGVTaWduZWRQYXJhbXMiLCJwcm90ZWN0QW5kRG93bmxvYWQiLCJjb25maWdQYXRoT3JPYmplY3QiLCJkZXN0Q2FsbGJhY2siLCJyZXF1aXJlIiwiYXBwbGljYXRpb25JZCIsImhvc3QiLCJwb3J0Iiwia2V5cyIsImZpbGVzRGVzdCIsImZpbGVzU3JjIiwiY3dkIiwicGFyYW1zIiwiYXBwbGljYXRpb25UeXBlcyIsImxhbmd1YWdlU3BlY2lmaWNhdGlvbnMiLCJzb3VyY2VNYXBzIiwicmFuZG9taXphdGlvblNlZWQiLCJhcmVTdWJzY3JpYmVyc09yZGVyZWQiLCJ1c2VSZWNvbW1lbmRlZE9yZGVyIiwiYWNjZXNzS2V5Iiwic2VjcmV0S2V5IiwiY2xpZW50IiwiRXJyb3IiLCJsZW5ndGgiLCJfZmlsZXNTcmMiLCJpIiwibCIsImNvbmNhdCIsInN5bmMiLCJkb3QiLCJwdXNoIiwiX3ppcCIsInJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbiIsInJlbW92ZVNvdXJjZVJlcyIsImVycm9ycyIsImhhZE5vU291cmNlcyIsImZvckVhY2giLCJlcnJvciIsIm1lc3NhZ2UiLCJhZGRBcHBsaWNhdGlvblNvdXJjZSIsImNvbnRlbnQiLCJnZW5lcmF0ZSIsInR5cGUiLCJmaWxlbmFtZSIsImV4dGVuc2lvbiIsImFkZEFwcGxpY2F0aW9uU291cmNlUmVzIiwiZXJyb3JIYW5kbGVyIiwiJHNldCIsIl9pZCIsIk9iamVjdCIsInBhcmFtZXRlcnMiLCJKU09OIiwic3RyaW5naWZ5Iiwibm9ybWFsaXplUGFyYW1ldGVycyIsIkFycmF5IiwiaXNBcnJheSIsInVuZGVmaW5lZCIsInVwZGF0ZUFwcGxpY2F0aW9uIiwidXBkYXRlQXBwbGljYXRpb25SZXMiLCJjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24iLCJjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb25SZXMiLCJwcm90ZWN0aW9uSWQiLCJkYXRhIiwicG9sbFByb3RlY3Rpb24iLCJkb3dubG9hZEFwcGxpY2F0aW9uUHJvdGVjdGlvbiIsImRvd25sb2FkIiwiY29uc29sZSIsImxvZyIsImRvd25sb2FkU291cmNlTWFwcyIsImNvbmZpZ3MiLCJkb3dubG9hZFNvdXJjZU1hcHNSZXF1ZXN0IiwiZGVmZXJyZWQiLCJkZWZlciIsInBvbGwiLCJnZXRBcHBsaWNhdGlvblByb3RlY3Rpb24iLCJhcHBsaWNhdGlvblByb3RlY3Rpb24iLCJzdGF0ZSIsInNldFRpbWVvdXQiLCJ1cmwiLCJyZWplY3QiLCJyZXNvbHZlIiwicHJvbWlzZSIsImNyZWF0ZUFwcGxpY2F0aW9uIiwiZnJhZ21lbnRzIiwicG9zdCIsInJlc3BvbnNlSGFuZGxlciIsImR1cGxpY2F0ZUFwcGxpY2F0aW9uIiwicmVtb3ZlQXBwbGljYXRpb24iLCJpZCIsInJlbW92ZVByb3RlY3Rpb24iLCJhcHBJZCIsImNhbmNlbFByb3RlY3Rpb24iLCJhcHBsaWNhdGlvbiIsInVubG9ja0FwcGxpY2F0aW9uIiwiZ2V0QXBwbGljYXRpb24iLCJnZXQiLCJnZXRBcHBsaWNhdGlvblNvdXJjZSIsInNvdXJjZUlkIiwibGltaXRzIiwiZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9ucyIsImdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudCIsImNyZWF0ZVRlbXBsYXRlIiwidGVtcGxhdGUiLCJyZW1vdmVUZW1wbGF0ZSIsImdldFRlbXBsYXRlcyIsImdldEFwcGxpY2F0aW9ucyIsImFwcGxpY2F0aW9uU291cmNlIiwiYWRkQXBwbGljYXRpb25Tb3VyY2VGcm9tVVJMIiwiZ2V0RmlsZUZyb21VcmwiLCJ0aGVuIiwiZmlsZSIsInVwZGF0ZUFwcGxpY2F0aW9uU291cmNlIiwiYXBwbHlUZW1wbGF0ZSIsInRlbXBsYXRlSWQiLCJ1cGRhdGVUZW1wbGF0ZSIsInJlcyIsImJhc2VuYW1lIiwiZXh0bmFtZSIsInN1YnN0ciIsImNhdGNoIiwiZXJyIiwiYm9keSIsInN0YXR1cyIsImV4IiwicmVzdWx0IiwibmFtZSIsIm9wdGlvbnMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFpQkE7O0FBU0E7Ozs7OztrQkFLZTtBQUNiQSwwQkFEYTtBQUViQywwQkFGYTtBQUdiQyxzREFIYTtBQUliO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNNQyxvQkE5Q08sOEJBOENhQyxrQkE5Q2IsRUE4Q2lDQyxZQTlDakMsRUE4QytDO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNwREosb0JBRG9ELEdBQzNDLE9BQU9HLGtCQUFQLEtBQThCLFFBQTlCLEdBQ2JFLFFBQVFGLGtCQUFSLENBRGEsR0FDaUJBLGtCQUYwQjtBQUt4REcsMkJBTHdELEdBbUJ0RE4sTUFuQnNELENBS3hETSxhQUx3RCxFQU14REMsSUFOd0QsR0FtQnREUCxNQW5Cc0QsQ0FNeERPLElBTndELEVBT3hEQyxJQVB3RCxHQW1CdERSLE1BbkJzRCxDQU94RFEsSUFQd0QsRUFReERDLElBUndELEdBbUJ0RFQsTUFuQnNELENBUXhEUyxJQVJ3RCxFQVN4REMsU0FUd0QsR0FtQnREVixNQW5Cc0QsQ0FTeERVLFNBVHdELEVBVXhEQyxRQVZ3RCxHQW1CdERYLE1BbkJzRCxDQVV4RFcsUUFWd0QsRUFXeERDLEdBWHdELEdBbUJ0RFosTUFuQnNELENBV3hEWSxHQVh3RCxFQVl4REMsTUFad0QsR0FtQnREYixNQW5Cc0QsQ0FZeERhLE1BWndELEVBYXhEQyxnQkFid0QsR0FtQnREZCxNQW5Cc0QsQ0FheERjLGdCQWJ3RCxFQWN4REMsc0JBZHdELEdBbUJ0RGYsTUFuQnNELENBY3hEZSxzQkFkd0QsRUFleERDLFVBZndELEdBbUJ0RGhCLE1BbkJzRCxDQWV4RGdCLFVBZndELEVBZ0J4REMsaUJBaEJ3RCxHQW1CdERqQixNQW5Cc0QsQ0FnQnhEaUIsaUJBaEJ3RCxFQWlCeERDLHFCQWpCd0QsR0FtQnREbEIsTUFuQnNELENBaUJ4RGtCLHFCQWpCd0QsRUFrQnhEQyxtQkFsQndELEdBbUJ0RG5CLE1BbkJzRCxDQWtCeERtQixtQkFsQndEO0FBc0J4REMsdUJBdEJ3RCxHQXdCdERYLElBeEJzRCxDQXNCeERXLFNBdEJ3RCxFQXVCeERDLFNBdkJ3RCxHQXdCdERaLElBeEJzRCxDQXVCeERZLFNBdkJ3RDtBQTBCcERDLG9CQTFCb0QsR0EwQjNDLElBQUksTUFBS3ZCLE1BQVQsQ0FBZ0I7QUFDN0JxQixvQ0FENkI7QUFFN0JDLG9DQUY2QjtBQUc3QmQsMEJBSDZCO0FBSTdCQztBQUo2QixlQUFoQixDQTFCMkM7O0FBQUEsa0JBaUNyREYsYUFqQ3FEO0FBQUE7QUFBQTtBQUFBOztBQUFBLG9CQWtDbEQsSUFBSWlCLEtBQUosQ0FBVSx1Q0FBVixDQWxDa0Q7O0FBQUE7QUFBQSxvQkFxQ3RELENBQUNiLFNBQUQsSUFBYyxDQUFDTixZQXJDdUM7QUFBQTtBQUFBO0FBQUE7O0FBQUEsb0JBc0NsRCxJQUFJbUIsS0FBSixDQUFVLG1DQUFWLENBdENrRDs7QUFBQTtBQUFBLG9CQXlDdERaLFlBQVlBLFNBQVNhLE1BekNpQztBQUFBO0FBQUE7QUFBQTs7QUEwQ3BEQyx1QkExQ29ELEdBMEN4QyxFQTFDd0M7O0FBMkN4RCxtQkFBU0MsQ0FBVCxHQUFhLENBQWIsRUFBZ0JDLENBQWhCLEdBQW9CaEIsU0FBU2EsTUFBN0IsRUFBcUNFLElBQUlDLENBQXpDLEVBQTRDLEVBQUVELENBQTlDLEVBQWlEO0FBQy9DLG9CQUFJLE9BQU9mLFNBQVNlLENBQVQsQ0FBUCxLQUF1QixRQUEzQixFQUFxQztBQUNuQztBQUNBRCw4QkFBWUEsVUFBVUcsTUFBVixDQUFpQixlQUFLQyxJQUFMLENBQVVsQixTQUFTZSxDQUFULENBQVYsRUFBdUIsRUFBQ0ksS0FBSyxJQUFOLEVBQXZCLENBQWpCLENBQVo7QUFDRCxpQkFIRCxNQUdPO0FBQ0xMLDRCQUFVTSxJQUFWLENBQWVwQixTQUFTZSxDQUFULENBQWY7QUFDRDtBQUNGOztBQWxEdUQ7QUFBQSxxQkFvRHJDLGVBQUlELFNBQUosRUFBZWIsR0FBZixDQXBEcUM7O0FBQUE7QUFvRGxEb0Isa0JBcERrRDtBQUFBO0FBQUEscUJBc0QxQixNQUFLQywyQkFBTCxDQUFpQ1gsTUFBakMsRUFBeUMsRUFBekMsRUFBNkNoQixhQUE3QyxDQXREMEI7O0FBQUE7QUFzRGxENEIsNkJBdERrRDs7QUFBQSxtQkF1RHBEQSxnQkFBZ0JDLE1BdkRvQztBQUFBO0FBQUE7QUFBQTs7QUF3RHREO0FBQ0lDLDBCQXpEa0QsR0F5RG5DLEtBekRtQzs7QUEwRHRERiw4QkFBZ0JDLE1BQWhCLENBQXVCRSxPQUF2QixDQUErQixVQUFVQyxLQUFWLEVBQWlCO0FBQzlDLG9CQUFJQSxNQUFNQyxPQUFOLEtBQWtCLHFEQUF0QixFQUE2RTtBQUMzRUgsaUNBQWUsSUFBZjtBQUNEO0FBQ0YsZUFKRDs7QUExRHNELGtCQStEakRBLFlBL0RpRDtBQUFBO0FBQUE7QUFBQTs7QUFBQSxvQkFnRTlDLElBQUliLEtBQUosQ0FBVVcsZ0JBQWdCQyxNQUFoQixDQUF1QixDQUF2QixFQUEwQkksT0FBcEMsQ0FoRThDOztBQUFBO0FBQUE7QUFBQSxxQkFvRWxCLE1BQUtDLG9CQUFMLENBQTBCbEIsTUFBMUIsRUFBa0NoQixhQUFsQyxFQUFpRDtBQUNyRm1DLHlCQUFTVCxLQUFLVSxRQUFMLENBQWMsRUFBQ0MsTUFBTSxRQUFQLEVBQWQsQ0FENEU7QUFFckZDLDBCQUFVLGlCQUYyRTtBQUdyRkMsMkJBQVc7QUFIMEUsZUFBakQsQ0FwRWtCOztBQUFBO0FBb0VsREMscUNBcEVrRDs7QUF5RXhEQywyQkFBYUQsdUJBQWI7O0FBekV3RDtBQTRFcERFLGtCQTVFb0QsR0E0RTdDO0FBQ1hDLHFCQUFLM0M7QUFETSxlQTVFNkM7OztBQWdGMUQsa0JBQUlPLFVBQVVxQyxPQUFPekMsSUFBUCxDQUFZSSxNQUFaLEVBQW9CVyxNQUFsQyxFQUEwQztBQUN4Q3dCLHFCQUFLRyxVQUFMLEdBQWtCQyxLQUFLQyxTQUFMLENBQWVDLG9CQUFvQnpDLE1BQXBCLENBQWYsQ0FBbEI7QUFDQW1DLHFCQUFLOUIscUJBQUwsR0FBNkJxQyxNQUFNQyxPQUFOLENBQWMzQyxNQUFkLENBQTdCO0FBQ0Q7O0FBRUQsa0JBQUksT0FBT0sscUJBQVAsS0FBaUMsV0FBckMsRUFBa0Q7QUFDaEQ4QixxQkFBSzlCLHFCQUFMLEdBQTZCQSxxQkFBN0I7QUFDRDs7QUFFRCxrQkFBSUosZ0JBQUosRUFBc0I7QUFDcEJrQyxxQkFBS2xDLGdCQUFMLEdBQXdCQSxnQkFBeEI7QUFDRDs7QUFFRCxrQkFBSUssbUJBQUosRUFBeUI7QUFDdkI2QixxQkFBSzdCLG1CQUFMLEdBQTJCQSxtQkFBM0I7QUFDRDs7QUFFRCxrQkFBSUosc0JBQUosRUFBNEI7QUFDMUJpQyxxQkFBS2pDLHNCQUFMLEdBQThCQSxzQkFBOUI7QUFDRDs7QUFFRCxrQkFBSSxRQUFPQyxVQUFQLHlDQUFPQSxVQUFQLE9BQXNCeUMsU0FBMUIsRUFBcUM7QUFDbkNULHFCQUFLaEMsVUFBTCxHQUFrQm9DLEtBQUtDLFNBQUwsQ0FBZXJDLFVBQWYsQ0FBbEI7QUFDRDs7QUF2R3lELG9CQXlHdERnQyxLQUFLRyxVQUFMLElBQW1CSCxLQUFLbEMsZ0JBQXhCLElBQTRDa0MsS0FBS2pDLHNCQUFqRCxJQUNBLE9BQU9pQyxLQUFLOUIscUJBQVosS0FBc0MsV0ExR2dCO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEscUJBMkdyQixNQUFLd0MsaUJBQUwsQ0FBdUJwQyxNQUF2QixFQUErQjBCLElBQS9CLENBM0dxQjs7QUFBQTtBQTJHbERXLGtDQTNHa0Q7O0FBNEd4RFosMkJBQWFZLG9CQUFiOztBQTVHd0Q7QUFBQTtBQUFBLHFCQStHYixNQUFLQywyQkFBTCxDQUFpQ3RDLE1BQWpDLEVBQXlDaEIsYUFBekMsRUFBd0RtRCxTQUF4RCxFQUFtRXhDLGlCQUFuRSxDQS9HYTs7QUFBQTtBQStHcEQ0Qyw0Q0EvR29EOztBQWdIMURkLDJCQUFhYyw4QkFBYjs7QUFFTUMsMEJBbEhvRCxHQWtIckNELCtCQUErQkUsSUFBL0IsQ0FBb0NILDJCQUFwQyxDQUFnRVgsR0FsSDNCO0FBQUE7QUFBQSxxQkFtSHBELE1BQUtlLGNBQUwsQ0FBb0IxQyxNQUFwQixFQUE0QmhCLGFBQTVCLEVBQTJDd0QsWUFBM0MsQ0FuSG9EOztBQUFBO0FBQUE7QUFBQSxxQkFxSG5DLE1BQUtHLDZCQUFMLENBQW1DM0MsTUFBbkMsRUFBMkN3QyxZQUEzQyxDQXJIbUM7O0FBQUE7QUFxSHBESSxzQkFySG9EOztBQXNIMURuQiwyQkFBYW1CLFFBQWI7QUFDQSwrQkFBTUEsUUFBTixFQUFnQnhELGFBQWFOLFlBQTdCO0FBQ0ErRCxzQkFBUUMsR0FBUixDQUFZTixZQUFaOztBQXhIMEQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUF5SDNELEdBdktZO0FBeUtQTyxvQkF6S08sOEJBeUthQyxPQXpLYixFQXlLc0JsRSxZQXpLdEIsRUF5S29DO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBRTdDSyxrQkFGNkMsR0FRM0M2RCxPQVIyQyxDQUU3QzdELElBRjZDLEVBRzdDRixJQUg2QyxHQVEzQytELE9BUjJDLENBRzdDL0QsSUFINkMsRUFJN0NDLElBSjZDLEdBUTNDOEQsT0FSMkMsQ0FJN0M5RCxJQUo2QyxFQUs3Q0UsU0FMNkMsR0FRM0M0RCxPQVIyQyxDQUs3QzVELFNBTDZDLEVBTTdDQyxRQU42QyxHQVEzQzJELE9BUjJDLENBTTdDM0QsUUFONkMsRUFPN0NtRCxZQVA2QyxHQVEzQ1EsT0FSMkMsQ0FPN0NSLFlBUDZDO0FBVzdDMUMsdUJBWDZDLEdBYTNDWCxJQWIyQyxDQVc3Q1csU0FYNkMsRUFZN0NDLFNBWjZDLEdBYTNDWixJQWIyQyxDQVk3Q1ksU0FaNkM7QUFlekNDLG9CQWZ5QyxHQWVoQyxJQUFJLE9BQUt2QixNQUFULENBQWdCO0FBQzdCcUIsb0NBRDZCO0FBRTdCQyxvQ0FGNkI7QUFHN0JkLDBCQUg2QjtBQUk3QkM7QUFKNkIsZUFBaEIsQ0FmZ0M7O0FBQUEsb0JBc0IzQyxDQUFDRSxTQUFELElBQWMsQ0FBQ04sWUF0QjRCO0FBQUE7QUFBQTtBQUFBOztBQUFBLG9CQXVCdkMsSUFBSW1CLEtBQUosQ0FBVSxtQ0FBVixDQXZCdUM7O0FBQUE7QUFBQSxrQkEwQjFDdUMsWUExQjBDO0FBQUE7QUFBQTtBQUFBOztBQUFBLG9CQTJCdkMsSUFBSXZDLEtBQUosQ0FBVSxzQ0FBVixDQTNCdUM7O0FBQUE7O0FBK0IvQyxrQkFBSVosUUFBSixFQUFjO0FBQ1p3RCx3QkFBUUMsR0FBUixDQUFZLGtGQUFaO0FBQ0Q7QUFDR0Ysc0JBbEMyQztBQUFBO0FBQUE7QUFBQSxxQkFvQzVCLE9BQUtLLHlCQUFMLENBQStCakQsTUFBL0IsRUFBdUN3QyxZQUF2QyxDQXBDNEI7O0FBQUE7QUFvQzdDSSxzQkFwQzZDO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBc0M3Q25COztBQXRDNkM7QUF3Qy9DLCtCQUFNbUIsUUFBTixFQUFnQnhELGFBQWFOLFlBQTdCOztBQXhDK0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUF5Q2hELEdBbE5ZO0FBb05QNEQsZ0JBcE5PLDBCQW9OUzFDLE1BcE5ULEVBb05pQmhCLGFBcE5qQixFQW9OZ0N3RCxZQXBOaEMsRUFvTjhDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ25EVSxzQkFEbUQsR0FDeEMsWUFBRUMsS0FBRixFQUR3Qzs7QUFHbkRDLGtCQUhtRDtBQUFBLHFFQUc1QztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGlDQUN5QixPQUFLQyx3QkFBTCxDQUE4QnJELE1BQTlCLEVBQXNDaEIsYUFBdEMsRUFBcUR3RCxZQUFyRCxDQUR6Qjs7QUFBQTtBQUNMYywrQ0FESzs7QUFBQSwrQkFFUEEsc0JBQXNCekMsTUFGZjtBQUFBO0FBQUE7QUFBQTs7QUFHVGdDLGtDQUFRQyxHQUFSLENBQVksMEJBQVosRUFBd0NRLHNCQUFzQnpDLE1BQTlEO0FBSFMsZ0NBSUgsSUFBSVosS0FBSixDQUFVLDBCQUFWLENBSkc7O0FBQUE7QUFPSHNELCtCQVBHLEdBT0tELHNCQUFzQmIsSUFBdEIsQ0FBMkJhLHFCQUEzQixDQUFpREMsS0FQdEQ7O0FBUVQsOEJBQUlBLFVBQVUsVUFBVixJQUF3QkEsVUFBVSxTQUF0QyxFQUFpRDtBQUMvQ0MsdUNBQVdKLElBQVgsRUFBaUIsR0FBakI7QUFDRCwyQkFGRCxNQUVPLElBQUlHLFVBQVUsU0FBZCxFQUF5QjtBQUN4QkUsK0JBRHdCLHVDQUNnQnpFLGFBRGhCLHFCQUM2Q3dELFlBRDdDOztBQUU5QlUscUNBQVNRLE1BQVQscURBQWtFRCxHQUFsRTtBQUNELDJCQUhNLE1BR0E7QUFDTFAscUNBQVNTLE9BQVQ7QUFDRDs7QUFmUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFINEM7O0FBQUEsZ0NBR25EUCxJQUhtRDtBQUFBO0FBQUE7QUFBQTs7QUFzQnpEQTs7QUF0QnlELGdEQXdCbERGLFNBQVNVLE9BeEJ5Qzs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQXlCMUQsR0E3T1k7O0FBOE9iO0FBQ01DLG1CQS9PTyw2QkErT1k3RCxNQS9PWixFQStPb0J5QyxJQS9PcEIsRUErTzBCcUIsU0EvTzFCLEVBK09xQztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUMxQ1osc0JBRDBDLEdBQy9CLFlBQUVDLEtBQUYsRUFEK0I7O0FBRWhEbkQscUJBQU8rRCxJQUFQLENBQVksY0FBWixFQUE0QixrQ0FBa0J0QixJQUFsQixFQUF3QnFCLFNBQXhCLENBQTVCLEVBQWdFRSxnQkFBZ0JkLFFBQWhCLENBQWhFO0FBRmdELGdEQUd6Q0EsU0FBU1UsT0FIZ0M7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJakQsR0FuUFk7O0FBb1BiO0FBQ01LLHNCQXJQTyxnQ0FxUGVqRSxNQXJQZixFQXFQdUJ5QyxJQXJQdkIsRUFxUDZCcUIsU0FyUDdCLEVBcVB3QztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUM3Q1osc0JBRDZDLEdBQ2xDLFlBQUVDLEtBQUYsRUFEa0M7O0FBRW5EbkQscUJBQU8rRCxJQUFQLENBQVksY0FBWixFQUE0QixxQ0FBcUJ0QixJQUFyQixFQUEyQnFCLFNBQTNCLENBQTVCLEVBQW1FRSxnQkFBZ0JkLFFBQWhCLENBQW5FO0FBRm1ELGdEQUc1Q0EsU0FBU1UsT0FIbUM7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJcEQsR0F6UFk7O0FBMFBiO0FBQ01NLG1CQTNQTyw2QkEyUFlsRSxNQTNQWixFQTJQb0JtRSxFQTNQcEIsRUEyUHdCO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQzdCakIsc0JBRDZCLEdBQ2xCLFlBQUVDLEtBQUYsRUFEa0I7O0FBRW5DbkQscUJBQU8rRCxJQUFQLENBQVksY0FBWixFQUE0QixrQ0FBa0JJLEVBQWxCLENBQTVCLEVBQW1ESCxnQkFBZ0JkLFFBQWhCLENBQW5EO0FBRm1DLGdEQUc1QkEsU0FBU1UsT0FIbUI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJcEMsR0EvUFk7O0FBZ1FiO0FBQ01RLGtCQWpRTyw0QkFpUVdwRSxNQWpRWCxFQWlRbUJtRSxFQWpRbkIsRUFpUXVCRSxLQWpRdkIsRUFpUThCUCxTQWpROUIsRUFpUXlDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQzlDWixzQkFEOEMsR0FDbkMsWUFBRUMsS0FBRixFQURtQzs7QUFFcERuRCxxQkFBTytELElBQVAsQ0FBWSxjQUFaLEVBQTRCLGlDQUFpQkksRUFBakIsRUFBcUJFLEtBQXJCLEVBQTRCUCxTQUE1QixDQUE1QixFQUFvRUUsZ0JBQWdCZCxRQUFoQixDQUFwRTtBQUZvRCxnREFHN0NBLFNBQVNVLE9BSG9DOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSXJELEdBclFZOztBQXNRYjtBQUNNVSxrQkF2UU8sNEJBdVFXdEUsTUF2UVgsRUF1UW1CbUUsRUF2UW5CLEVBdVF1QkUsS0F2UXZCLEVBdVE4QlAsU0F2UTlCLEVBdVF5QztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUM5Q1osc0JBRDhDLEdBQ25DLFlBQUVDLEtBQUYsRUFEbUM7O0FBRXBEbkQscUJBQU8rRCxJQUFQLENBQVksY0FBWixFQUE0QixpQ0FBaUJJLEVBQWpCLEVBQXFCRSxLQUFyQixFQUE0QlAsU0FBNUIsQ0FBNUIsRUFBb0VFLGdCQUFnQmQsUUFBaEIsQ0FBcEU7QUFGb0QsZ0RBRzdDQSxTQUFTVSxPQUhvQzs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUlyRCxHQTNRWTs7QUE0UWI7QUFDTXhCLG1CQTdRTyw2QkE2UVlwQyxNQTdRWixFQTZRb0J1RSxXQTdRcEIsRUE2UWlDVCxTQTdRakMsRUE2UTRDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ2pEWixzQkFEaUQsR0FDdEMsWUFBRUMsS0FBRixFQURzQzs7QUFFdkRuRCxxQkFBTytELElBQVAsQ0FBWSxjQUFaLEVBQTRCLGtDQUFrQlEsV0FBbEIsRUFBK0JULFNBQS9CLENBQTVCLEVBQXVFRSxnQkFBZ0JkLFFBQWhCLENBQXZFO0FBRnVELGlEQUdoREEsU0FBU1UsT0FIdUM7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJeEQsR0FqUlk7O0FBa1JiO0FBQ01ZLG1CQW5STyw2QkFtUll4RSxNQW5SWixFQW1Sb0J1RSxXQW5ScEIsRUFtUmlDVCxTQW5SakMsRUFtUjRDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ2pEWixzQkFEaUQsR0FDdEMsWUFBRUMsS0FBRixFQURzQzs7QUFFdkRuRCxxQkFBTytELElBQVAsQ0FBWSxjQUFaLEVBQTRCLGtDQUFrQlEsV0FBbEIsRUFBK0JULFNBQS9CLENBQTVCLEVBQXVFRSxnQkFBZ0JkLFFBQWhCLENBQXZFO0FBRnVELGlEQUdoREEsU0FBU1UsT0FIdUM7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJeEQsR0F2Ulk7O0FBd1JiO0FBQ01hLGdCQXpSTywwQkF5UlN6RSxNQXpSVCxFQXlSaUJoQixhQXpSakIsRUF5UmdDOEUsU0F6UmhDLEVBeVIyQztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNoRFosc0JBRGdELEdBQ3JDLFlBQUVDLEtBQUYsRUFEcUM7O0FBRXREbkQscUJBQU8wRSxHQUFQLENBQVcsY0FBWCxFQUEyQiw2QkFBZTFGLGFBQWYsRUFBOEI4RSxTQUE5QixDQUEzQixFQUFxRUUsZ0JBQWdCZCxRQUFoQixDQUFyRTtBQUZzRCxpREFHL0NBLFNBQVNVLE9BSHNDOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSXZELEdBN1JZOztBQThSYjtBQUNNZSxzQkEvUk8sZ0NBK1JlM0UsTUEvUmYsRUErUnVCNEUsUUEvUnZCLEVBK1JpQ2QsU0EvUmpDLEVBK1I0Q2UsTUEvUjVDLEVBK1JvRDtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUN6RDNCLHNCQUR5RCxHQUM5QyxZQUFFQyxLQUFGLEVBRDhDOztBQUUvRG5ELHFCQUFPMEUsR0FBUCxDQUFXLGNBQVgsRUFBMkIsbUNBQXFCRSxRQUFyQixFQUErQmQsU0FBL0IsRUFBMENlLE1BQTFDLENBQTNCLEVBQThFYixnQkFBZ0JkLFFBQWhCLENBQTlFO0FBRitELGlEQUd4REEsU0FBU1UsT0FIK0M7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJaEUsR0FuU1k7O0FBb1NiO0FBQ01rQiwyQkFyU08scUNBcVNvQjlFLE1BclNwQixFQXFTNEJoQixhQXJTNUIsRUFxUzJDTyxNQXJTM0MsRUFxU21EdUUsU0FyU25ELEVBcVM4RDtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNuRVosc0JBRG1FLEdBQ3hELFlBQUVDLEtBQUYsRUFEd0Q7O0FBRXpFbkQscUJBQU8wRSxHQUFQLENBQVcsY0FBWCxFQUEyQix3Q0FBMEIxRixhQUExQixFQUF5Q08sTUFBekMsRUFBaUR1RSxTQUFqRCxDQUEzQixFQUF3RkUsZ0JBQWdCZCxRQUFoQixDQUF4RjtBQUZ5RSxpREFHbEVBLFNBQVNVLE9BSHlEOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSTFFLEdBelNZOztBQTBTYjtBQUNNbUIsZ0NBM1NPLDBDQTJTeUIvRSxNQTNTekIsRUEyU2lDaEIsYUEzU2pDLEVBMlNnRDhFLFNBM1NoRCxFQTJTMkQ7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDaEVaLHNCQURnRSxHQUNyRCxZQUFFQyxLQUFGLEVBRHFEOztBQUV0RW5ELHFCQUFPMEUsR0FBUCxDQUFXLGNBQVgsRUFBMkIsNkNBQStCMUYsYUFBL0IsRUFBOEM4RSxTQUE5QyxDQUEzQixFQUFxRkUsZ0JBQWdCZCxRQUFoQixDQUFyRjtBQUZzRSxpREFHL0RBLFNBQVNVLE9BSHNEOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSXZFLEdBL1NZOztBQWdUYjtBQUNNb0IsZ0JBalRPLDBCQWlUU2hGLE1BalRULEVBaVRpQmlGLFFBalRqQixFQWlUMkJuQixTQWpUM0IsRUFpVHNDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQzNDWixzQkFEMkMsR0FDaEMsWUFBRUMsS0FBRixFQURnQzs7QUFFakRuRCxxQkFBTytELElBQVAsQ0FBWSxjQUFaLEVBQTRCLCtCQUFla0IsUUFBZixFQUF5Qm5CLFNBQXpCLENBQTVCLEVBQWlFRSxnQkFBZ0JkLFFBQWhCLENBQWpFO0FBRmlELGlEQUcxQ0EsU0FBU1UsT0FIaUM7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJbEQsR0FyVFk7O0FBc1RiO0FBQ01zQixnQkF2VE8sMEJBdVRTbEYsTUF2VFQsRUF1VGlCbUUsRUF2VGpCLEVBdVRxQjtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUMxQmpCLHNCQUQwQixHQUNmLFlBQUVDLEtBQUYsRUFEZTs7QUFFaENuRCxxQkFBTytELElBQVAsQ0FBWSxjQUFaLEVBQTRCLCtCQUFlSSxFQUFmLENBQTVCLEVBQWdESCxnQkFBZ0JkLFFBQWhCLENBQWhEO0FBRmdDLGlEQUd6QkEsU0FBU1UsT0FIZ0I7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJakMsR0EzVFk7O0FBNFRiO0FBQ011QixjQTdUTyx3QkE2VE9uRixNQTdUUCxFQTZUZThELFNBN1RmLEVBNlQwQjtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUMvQlosc0JBRCtCLEdBQ3BCLFlBQUVDLEtBQUYsRUFEb0I7O0FBRXJDbkQscUJBQU8wRSxHQUFQLENBQVcsY0FBWCxFQUEyQiwyQkFBYVosU0FBYixDQUEzQixFQUFvREUsZ0JBQWdCZCxRQUFoQixDQUFwRDtBQUZxQyxpREFHOUJBLFNBQVNVLE9BSHFCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSXRDLEdBalVZOztBQWtVYjtBQUNNd0IsaUJBblVPLDJCQW1VVXBGLE1BblVWLEVBbVVrQjhELFNBblVsQixFQW1VNkI7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDbENaLHNCQURrQyxHQUN2QixZQUFFQyxLQUFGLEVBRHVCOztBQUV4Q25ELHFCQUFPMEUsR0FBUCxDQUFXLGNBQVgsRUFBMkIsOEJBQWdCWixTQUFoQixDQUEzQixFQUF1REUsZ0JBQWdCZCxRQUFoQixDQUF2RDtBQUZ3QyxpREFHakNBLFNBQVNVLE9BSHdCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSXpDLEdBdlVZOztBQXdVYjtBQUNNMUMsc0JBelVPLGdDQXlVZWxCLE1BelVmLEVBeVV1QmhCLGFBelV2QixFQXlVc0NxRyxpQkF6VXRDLEVBeVV5RHZCLFNBelV6RCxFQXlVb0U7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDekVaLHNCQUR5RSxHQUM5RCxZQUFFQyxLQUFGLEVBRDhEOztBQUUvRW5ELHFCQUFPK0QsSUFBUCxDQUFZLGNBQVosRUFBNEIscUNBQXFCL0UsYUFBckIsRUFBb0NxRyxpQkFBcEMsRUFBdUR2QixTQUF2RCxDQUE1QixFQUErRkUsZ0JBQWdCZCxRQUFoQixDQUEvRjtBQUYrRSxpREFHeEVBLFNBQVNVLE9BSCtEOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSWhGLEdBN1VZOztBQThVYjtBQUNNMEIsNkJBL1VPLHVDQStVc0J0RixNQS9VdEIsRUErVThCaEIsYUEvVTlCLEVBK1U2Q3lFLEdBL1U3QyxFQStVa0RLLFNBL1VsRCxFQStVNkQ7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDbEVaLHNCQURrRSxHQUN2RCxZQUFFQyxLQUFGLEVBRHVEO0FBQUEsaURBRWpFb0MsZUFBZXZGLE1BQWYsRUFBdUJ5RCxHQUF2QixFQUNKK0IsSUFESSxDQUNDLFVBQVNDLElBQVQsRUFBZTtBQUNuQnpGLHVCQUFPK0QsSUFBUCxDQUFZLGNBQVosRUFBNEIscUNBQXFCL0UsYUFBckIsRUFBb0N5RyxJQUFwQyxFQUEwQzNCLFNBQTFDLENBQTVCLEVBQWtGRSxnQkFBZ0JkLFFBQWhCLENBQWxGO0FBQ0EsdUJBQU9BLFNBQVNVLE9BQWhCO0FBQ0QsZUFKSSxDQUZpRTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQU96RSxHQXRWWTs7QUF1VmI7QUFDTThCLHlCQXhWTyxtQ0F3VmtCMUYsTUF4VmxCLEVBd1YwQnFGLGlCQXhWMUIsRUF3VjZDdkIsU0F4VjdDLEVBd1Z3RDtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUM3RFosc0JBRDZELEdBQ2xELFlBQUVDLEtBQUYsRUFEa0Q7O0FBRW5FbkQscUJBQU8rRCxJQUFQLENBQVksY0FBWixFQUE0Qix3Q0FBd0JzQixpQkFBeEIsRUFBMkN2QixTQUEzQyxDQUE1QixFQUFtRkUsZ0JBQWdCZCxRQUFoQixDQUFuRjtBQUZtRSxpREFHNURBLFNBQVNVLE9BSG1EOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSXBFLEdBNVZZOztBQTZWYjtBQUNNakQsNkJBOVZPLHVDQThWc0JYLE1BOVZ0QixFQThWOEI0RSxRQTlWOUIsRUE4VndDNUYsYUE5VnhDLEVBOFZ1RDhFLFNBOVZ2RCxFQThWa0U7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDdkVaLHNCQUR1RSxHQUM1RCxZQUFFQyxLQUFGLEVBRDREOztBQUU3RW5ELHFCQUFPK0QsSUFBUCxDQUFZLGNBQVosRUFBNEIsNENBQTRCYSxRQUE1QixFQUFzQzVGLGFBQXRDLEVBQXFEOEUsU0FBckQsQ0FBNUIsRUFBNkZFLGdCQUFnQmQsUUFBaEIsQ0FBN0Y7QUFGNkUsaURBR3RFQSxTQUFTVSxPQUg2RDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUk5RSxHQWxXWTs7QUFtV2I7QUFDTStCLGVBcFdPLHlCQW9XUTNGLE1BcFdSLEVBb1dnQjRGLFVBcFdoQixFQW9XNEJ2QixLQXBXNUIsRUFvV21DUCxTQXBXbkMsRUFvVzhDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ25EWixzQkFEbUQsR0FDeEMsWUFBRUMsS0FBRixFQUR3Qzs7QUFFekRuRCxxQkFBTytELElBQVAsQ0FBWSxjQUFaLEVBQTRCLDhCQUFjNkIsVUFBZCxFQUEwQnZCLEtBQTFCLEVBQWlDUCxTQUFqQyxDQUE1QixFQUF5RUUsZ0JBQWdCZCxRQUFoQixDQUF6RTtBQUZ5RCxpREFHbERBLFNBQVNVLE9BSHlDOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSTFELEdBeFdZOztBQXlXYjtBQUNNaUMsZ0JBMVdPLDBCQTBXUzdGLE1BMVdULEVBMFdpQmlGLFFBMVdqQixFQTBXMkJuQixTQTFXM0IsRUEwV3NDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQzNDWixzQkFEMkMsR0FDaEMsWUFBRUMsS0FBRixFQURnQzs7QUFFakRuRCxxQkFBTytELElBQVAsQ0FBWSxjQUFaLEVBQTRCLCtCQUFla0IsUUFBZixFQUF5Qm5CLFNBQXpCLENBQTVCLEVBQWlFRSxnQkFBZ0JkLFFBQWhCLENBQWpFO0FBRmlELGlEQUcxQ0EsU0FBU1UsT0FIaUM7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJbEQsR0E5V1k7O0FBK1diO0FBQ010Qiw2QkFoWE8sdUNBZ1hzQnRDLE1BaFh0QixFQWdYOEJoQixhQWhYOUIsRUFnWDZDOEUsU0FoWDdDLEVBZ1h3RG5FLGlCQWhYeEQsRUFnWDJFO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ2hGdUQsc0JBRGdGLEdBQ3JFLFlBQUVDLEtBQUYsRUFEcUU7O0FBRXRGbkQscUJBQU8rRCxJQUFQLENBQVksY0FBWixFQUE0Qiw0Q0FBNEIvRSxhQUE1QixFQUEyQzhFLFNBQTNDLEVBQXNEbkUsaUJBQXRELENBQTVCLEVBQXNHcUUsZ0JBQWdCZCxRQUFoQixDQUF0RztBQUZzRixpREFHL0VBLFNBQVNVLE9BSHNFOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSXZGLEdBcFhZOztBQXFYYjtBQUNNUCwwQkF0WE8sb0NBc1htQnJELE1BdFhuQixFQXNYMkJoQixhQXRYM0IsRUFzWDBDd0QsWUF0WDFDLEVBc1h3RHNCLFNBdFh4RCxFQXNYbUU7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDeEVaLHNCQUR3RSxHQUM3RCxZQUFFQyxLQUFGLEVBRDZEOztBQUU5RW5ELHFCQUFPMEUsR0FBUCxDQUFXLGNBQVgsRUFBMkIsNEJBQWMxRixhQUFkLEVBQTZCd0QsWUFBN0IsRUFBMkNzQixTQUEzQyxDQUEzQixFQUFrRkUsZ0JBQWdCZCxRQUFoQixDQUFsRjtBQUY4RSxpREFHdkVBLFNBQVNVLE9BSDhEOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSS9FLEdBMVhZOztBQTJYYjtBQUNNWCwyQkE1WE8scUNBNFhvQmpELE1BNVhwQixFQTRYNEJ3QyxZQTVYNUIsRUE0WDBDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQy9DVSxzQkFEK0MsR0FDcEMsWUFBRUMsS0FBRixFQURvQzs7QUFFckRuRCxxQkFBTzBFLEdBQVAsOEJBQXNDbEMsWUFBdEMsRUFBc0QsSUFBdEQsRUFBNER3QixnQkFBZ0JkLFFBQWhCLENBQTVELEVBQXVGLEtBQXZGO0FBRnFELGlEQUc5Q0EsU0FBU1UsT0FIcUM7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJdEQsR0FoWVk7O0FBaVliO0FBQ01qQiwrQkFsWU8seUNBa1l3QjNDLE1BbFl4QixFQWtZZ0N3QyxZQWxZaEMsRUFrWThDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ25EVSxzQkFEbUQsR0FDeEMsWUFBRUMsS0FBRixFQUR3Qzs7QUFFekRuRCxxQkFBTzBFLEdBQVAsNEJBQW9DbEMsWUFBcEMsRUFBb0QsSUFBcEQsRUFBMER3QixnQkFBZ0JkLFFBQWhCLENBQTFELEVBQXFGLEtBQXJGO0FBRnlELGlEQUdsREEsU0FBU1UsT0FIeUM7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJMUQ7QUF0WVksQzs7O0FBeVlmLFNBQVMyQixjQUFULENBQXlCdkYsTUFBekIsRUFBaUN5RCxHQUFqQyxFQUFzQztBQUNwQyxNQUFNUCxXQUFXLFlBQUVDLEtBQUYsRUFBakI7QUFDQSxNQUFJc0MsSUFBSjtBQUNBLGtCQUFRZixHQUFSLENBQVlqQixHQUFaLEVBQ0crQixJQURILENBQ1EsVUFBQ00sR0FBRCxFQUFTO0FBQ2JMLFdBQU87QUFDTHRFLGVBQVMyRSxJQUFJckQsSUFEUjtBQUVMbkIsZ0JBQVUsZUFBS3lFLFFBQUwsQ0FBY3RDLEdBQWQsQ0FGTDtBQUdMbEMsaUJBQVcsZUFBS3lFLE9BQUwsQ0FBYXZDLEdBQWIsRUFBa0J3QyxNQUFsQixDQUF5QixDQUF6QjtBQUhOLEtBQVA7QUFLQS9DLGFBQVNTLE9BQVQsQ0FBaUI4QixJQUFqQjtBQUNELEdBUkgsRUFTR1MsS0FUSCxDQVNTLFVBQUNDLEdBQUQsRUFBUztBQUNkakQsYUFBU1EsTUFBVCxDQUFnQnlDLEdBQWhCO0FBQ0QsR0FYSDtBQVlBLFNBQU9qRCxTQUFTVSxPQUFoQjtBQUNEOztBQUVELFNBQVNJLGVBQVQsQ0FBMEJkLFFBQTFCLEVBQW9DO0FBQ2xDLFNBQU8sVUFBQ2lELEdBQUQsRUFBTUwsR0FBTixFQUFjO0FBQ25CLFFBQUlLLEdBQUosRUFBUztBQUNQakQsZUFBU1EsTUFBVCxDQUFnQnlDLEdBQWhCO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsVUFBSUMsT0FBT04sSUFBSXJELElBQWY7QUFDQSxVQUFJO0FBQ0YsWUFBSXFELElBQUlPLE1BQUosSUFBYyxHQUFsQixFQUF1QjtBQUNyQm5ELG1CQUFTUSxNQUFULENBQWdCMEMsSUFBaEI7QUFDRCxTQUZELE1BRU87QUFDTGxELG1CQUFTUyxPQUFULENBQWlCeUMsSUFBakI7QUFDRDtBQUNGLE9BTkQsQ0FNRSxPQUFPRSxFQUFQLEVBQVc7QUFDWHBELGlCQUFTUSxNQUFULENBQWdCMEMsSUFBaEI7QUFDRDtBQUNGO0FBQ0YsR0FmRDtBQWdCRDs7QUFFRCxTQUFTM0UsWUFBVCxDQUF1QnFFLEdBQXZCLEVBQTRCO0FBQzFCLE1BQUlBLElBQUlqRixNQUFKLElBQWNpRixJQUFJakYsTUFBSixDQUFXWCxNQUE3QixFQUFxQztBQUNuQzRGLFFBQUlqRixNQUFKLENBQVdFLE9BQVgsQ0FBbUIsVUFBVUMsS0FBVixFQUFpQjtBQUNsQyxZQUFNLElBQUlmLEtBQUosQ0FBVWUsTUFBTUMsT0FBaEIsQ0FBTjtBQUNELEtBRkQ7QUFHRDs7QUFFRCxNQUFJNkUsSUFBSTdFLE9BQVIsRUFBaUI7QUFDZixVQUFNLElBQUloQixLQUFKLENBQVU2RixJQUFJN0UsT0FBZCxDQUFOO0FBQ0Q7O0FBRUQsU0FBTzZFLEdBQVA7QUFDRDs7QUFFRCxTQUFTOUQsbUJBQVQsQ0FBOEJILFVBQTlCLEVBQTBDO0FBQ3hDLE1BQUkwRSxNQUFKOztBQUVBLE1BQUksQ0FBQ3RFLE1BQU1DLE9BQU4sQ0FBY0wsVUFBZCxDQUFMLEVBQWdDO0FBQzlCMEUsYUFBUyxFQUFUO0FBQ0EzRSxXQUFPekMsSUFBUCxDQUFZMEMsVUFBWixFQUF3QmQsT0FBeEIsQ0FBZ0MsVUFBQ3lGLElBQUQsRUFBVTtBQUN4Q0QsYUFBTzlGLElBQVAsQ0FBWTtBQUNWK0Ysa0JBRFU7QUFFVkMsaUJBQVM1RSxXQUFXMkUsSUFBWDtBQUZDLE9BQVo7QUFJRCxLQUxEO0FBTUQsR0FSRCxNQVFPO0FBQ0xELGFBQVMxRSxVQUFUO0FBQ0Q7O0FBRUQsU0FBTzBFLE1BQVA7QUFDRCIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnYmFiZWwtcG9seWZpbGwnO1xuXG5pbXBvcnQgZ2xvYiBmcm9tICdnbG9iJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHJlcXVlc3QgZnJvbSAnYXhpb3MnO1xuaW1wb3J0IFEgZnJvbSAncSc7XG5cbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IGdlbmVyYXRlU2lnbmVkUGFyYW1zIGZyb20gJy4vZ2VuZXJhdGUtc2lnbmVkLXBhcmFtcyc7XG5pbXBvcnQgSlNjcmFtYmxlckNsaWVudCBmcm9tICcuL2NsaWVudCc7XG5pbXBvcnQge1xuICBhZGRBcHBsaWNhdGlvblNvdXJjZSxcbiAgY3JlYXRlQXBwbGljYXRpb24sXG4gIHJlbW92ZUFwcGxpY2F0aW9uLFxuICB1cGRhdGVBcHBsaWNhdGlvbixcbiAgdXBkYXRlQXBwbGljYXRpb25Tb3VyY2UsXG4gIHJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbixcbiAgY3JlYXRlVGVtcGxhdGUsXG4gIHJlbW92ZVRlbXBsYXRlLFxuICB1cGRhdGVUZW1wbGF0ZSxcbiAgY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uLFxuICByZW1vdmVQcm90ZWN0aW9uLFxuICBjYW5jZWxQcm90ZWN0aW9uLFxuICBkdXBsaWNhdGVBcHBsaWNhdGlvbixcbiAgdW5sb2NrQXBwbGljYXRpb24sXG4gIGFwcGx5VGVtcGxhdGVcbn0gZnJvbSAnLi9tdXRhdGlvbnMnO1xuaW1wb3J0IHtcbiAgZ2V0QXBwbGljYXRpb24sXG4gIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnMsXG4gIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudCxcbiAgZ2V0QXBwbGljYXRpb25zLFxuICBnZXRBcHBsaWNhdGlvblNvdXJjZSxcbiAgZ2V0VGVtcGxhdGVzLFxuICBnZXRQcm90ZWN0aW9uXG59IGZyb20gJy4vcXVlcmllcyc7XG5pbXBvcnQge1xuICB6aXAsXG4gIHVuemlwXG59IGZyb20gJy4vemlwJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBDbGllbnQ6IEpTY3JhbWJsZXJDbGllbnQsXG4gIGNvbmZpZyxcbiAgZ2VuZXJhdGVTaWduZWRQYXJhbXMsXG4gIC8vIFRoaXMgbWV0aG9kIGlzIGEgc2hvcnRjdXQgbWV0aG9kIHRoYXQgYWNjZXB0cyBhbiBvYmplY3Qgd2l0aCBldmVyeXRoaW5nIG5lZWRlZFxuICAvLyBmb3IgdGhlIGVudGlyZSBwcm9jZXNzIG9mIHJlcXVlc3RpbmcgYW4gYXBwbGljYXRpb24gcHJvdGVjdGlvbiBhbmQgZG93bmxvYWRpbmdcbiAgLy8gdGhhdCBzYW1lIHByb3RlY3Rpb24gd2hlbiB0aGUgc2FtZSBlbmRzLlxuICAvL1xuICAvLyBgY29uZmlnUGF0aE9yT2JqZWN0YCBjYW4gYmUgYSBwYXRoIHRvIGEgSlNPTiBvciBkaXJlY3RseSBhbiBvYmplY3QgY29udGFpbmluZ1xuICAvLyB0aGUgZm9sbG93aW5nIHN0cnVjdHVyZTpcbiAgLy9cbiAgLy8gYGBganNvblxuICAvLyB7XG4gIC8vICAgXCJrZXlzXCI6IHtcbiAgLy8gICAgIFwiYWNjZXNzS2V5XCI6IFwiXCIsXG4gIC8vICAgICBcInNlY3JldEtleVwiOiBcIlwiXG4gIC8vICAgfSxcbiAgLy8gICBcImFwcGxpY2F0aW9uSWRcIjogXCJcIixcbiAgLy8gICBcImZpbGVzRGVzdFwiOiBcIlwiXG4gIC8vIH1cbiAgLy8gYGBgXG4gIC8vXG4gIC8vIEFsc28gdGhlIGZvbGxvd2luZyBvcHRpb25hbCBwYXJhbWV0ZXJzIGFyZSBhY2NlcHRlZDpcbiAgLy9cbiAgLy8gYGBganNvblxuICAvLyB7XG4gIC8vICAgXCJmaWxlc1NyY1wiOiBbXCJcIl0sXG4gIC8vICAgXCJwYXJhbXNcIjoge30sXG4gIC8vICAgXCJjd2RcIjogXCJcIixcbiAgLy8gICBcImhvc3RcIjogXCJhcGkuanNjcmFtYmxlci5jb21cIixcbiAgLy8gICBcInBvcnRcIjogXCI0NDNcIlxuICAvLyB9XG4gIC8vIGBgYFxuICAvL1xuICAvLyBgZmlsZXNTcmNgIHN1cHBvcnRzIGdsb2IgcGF0dGVybnMsIGFuZCBpZiBpdCdzIHByb3ZpZGVkIGl0IHdpbGwgcmVwbGFjZSB0aGVcbiAgLy8gZW50aXJlIGFwcGxpY2F0aW9uIHNvdXJjZXMuXG4gIC8vXG4gIC8vIGBwYXJhbXNgIGlmIHByb3ZpZGVkIHdpbGwgcmVwbGFjZSBhbGwgdGhlIGFwcGxpY2F0aW9uIHRyYW5zZm9ybWF0aW9uIHBhcmFtZXRlcnMuXG4gIC8vXG4gIC8vIGBjd2RgIGFsbG93cyB5b3UgdG8gc2V0IHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IHRvIHJlc29sdmUgcHJvYmxlbXMgd2l0aFxuICAvLyByZWxhdGl2ZSBwYXRocyB3aXRoIHlvdXIgYGZpbGVzU3JjYCBpcyBvdXRzaWRlIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LlxuICAvL1xuICAvLyBGaW5hbGx5LCBgaG9zdGAgYW5kIGBwb3J0YCBjYW4gYmUgb3ZlcnJpZGRlbiBpZiB5b3UgdG8gZW5nYWdlIHdpdGggYSBkaWZmZXJlbnRcbiAgLy8gZW5kcG9pbnQgdGhhbiB0aGUgZGVmYXVsdCBvbmUsIHVzZWZ1bCBpZiB5b3UncmUgcnVubmluZyBhbiBlbnRlcnByaXNlIHZlcnNpb24gb2ZcbiAgLy8gSnNjcmFtYmxlciBvciBpZiB5b3UncmUgcHJvdmlkZWQgYWNjZXNzIHRvIGJldGEgZmVhdHVyZXMgb2Ygb3VyIHByb2R1Y3QuXG4gIC8vXG4gIGFzeW5jIHByb3RlY3RBbmREb3dubG9hZCAoY29uZmlnUGF0aE9yT2JqZWN0LCBkZXN0Q2FsbGJhY2spIHtcbiAgICBjb25zdCBjb25maWcgPSB0eXBlb2YgY29uZmlnUGF0aE9yT2JqZWN0ID09PSAnc3RyaW5nJyA/XG4gICAgICByZXF1aXJlKGNvbmZpZ1BhdGhPck9iamVjdCkgOiBjb25maWdQYXRoT3JPYmplY3Q7XG5cbiAgICBjb25zdCB7XG4gICAgICBhcHBsaWNhdGlvbklkLFxuICAgICAgaG9zdCxcbiAgICAgIHBvcnQsXG4gICAgICBrZXlzLFxuICAgICAgZmlsZXNEZXN0LFxuICAgICAgZmlsZXNTcmMsXG4gICAgICBjd2QsXG4gICAgICBwYXJhbXMsXG4gICAgICBhcHBsaWNhdGlvblR5cGVzLFxuICAgICAgbGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucyxcbiAgICAgIHNvdXJjZU1hcHMsXG4gICAgICByYW5kb21pemF0aW9uU2VlZCxcbiAgICAgIGFyZVN1YnNjcmliZXJzT3JkZXJlZCxcbiAgICAgIHVzZVJlY29tbWVuZGVkT3JkZXJcbiAgICB9ID0gY29uZmlnO1xuXG4gICAgY29uc3Qge1xuICAgICAgYWNjZXNzS2V5LFxuICAgICAgc2VjcmV0S2V5XG4gICAgfSA9IGtleXM7XG5cbiAgICBjb25zdCBjbGllbnQgPSBuZXcgdGhpcy5DbGllbnQoe1xuICAgICAgYWNjZXNzS2V5LFxuICAgICAgc2VjcmV0S2V5LFxuICAgICAgaG9zdCxcbiAgICAgIHBvcnRcbiAgICB9KTtcblxuICAgIGlmICghYXBwbGljYXRpb25JZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXF1aXJlZCAqYXBwbGljYXRpb25JZCogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgaWYgKCFmaWxlc0Rlc3QgJiYgIWRlc3RDYWxsYmFjaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXF1aXJlZCAqZmlsZXNEZXN0KiBub3QgcHJvdmlkZWQnKTtcbiAgICB9XG5cbiAgICBpZiAoZmlsZXNTcmMgJiYgZmlsZXNTcmMubGVuZ3RoKSB7XG4gICAgICBsZXQgX2ZpbGVzU3JjID0gW107XG4gICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGZpbGVzU3JjLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgICBpZiAodHlwZW9mIGZpbGVzU3JjW2ldID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIC8vIFRPRE8gUmVwbGFjZSBgZ2xvYi5zeW5jYCB3aXRoIGFzeW5jIHZlcnNpb25cbiAgICAgICAgICBfZmlsZXNTcmMgPSBfZmlsZXNTcmMuY29uY2F0KGdsb2Iuc3luYyhmaWxlc1NyY1tpXSwge2RvdDogdHJ1ZX0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfZmlsZXNTcmMucHVzaChmaWxlc1NyY1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgX3ppcCA9IGF3YWl0IHppcChfZmlsZXNTcmMsIGN3ZCk7XG5cbiAgICAgIGNvbnN0IHJlbW92ZVNvdXJjZVJlcyA9IGF3YWl0IHRoaXMucmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uKGNsaWVudCwgJycsIGFwcGxpY2F0aW9uSWQpO1xuICAgICAgaWYgKHJlbW92ZVNvdXJjZVJlcy5lcnJvcnMpIHtcbiAgICAgICAgLy8gVE9ETyBJbXBsZW1lbnQgZXJyb3IgY29kZXMgb3IgZml4IHRoaXMgaXMgb24gdGhlIHNlcnZpY2VzXG4gICAgICAgIHZhciBoYWROb1NvdXJjZXMgPSBmYWxzZTtcbiAgICAgICAgcmVtb3ZlU291cmNlUmVzLmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvci5tZXNzYWdlID09PSAnQXBwbGljYXRpb24gU291cmNlIHdpdGggdGhlIGdpdmVuIElEIGRvZXMgbm90IGV4aXN0Jykge1xuICAgICAgICAgICAgaGFkTm9Tb3VyY2VzID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIWhhZE5vU291cmNlcykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZW1vdmVTb3VyY2VSZXMuZXJyb3JzWzBdLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFkZEFwcGxpY2F0aW9uU291cmNlUmVzID0gYXdhaXQgdGhpcy5hZGRBcHBsaWNhdGlvblNvdXJjZShjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHtcbiAgICAgICAgY29udGVudDogX3ppcC5nZW5lcmF0ZSh7dHlwZTogJ2Jhc2U2NCd9KSxcbiAgICAgICAgZmlsZW5hbWU6ICdhcHBsaWNhdGlvbi56aXAnLFxuICAgICAgICBleHRlbnNpb246ICd6aXAnXG4gICAgICB9KTtcbiAgICAgIGVycm9ySGFuZGxlcihhZGRBcHBsaWNhdGlvblNvdXJjZVJlcyk7XG4gICAgfVxuXG4gICAgY29uc3QgJHNldCA9IHtcbiAgICAgIF9pZDogYXBwbGljYXRpb25JZFxuICAgIH07XG5cbiAgICBpZiAocGFyYW1zICYmIE9iamVjdC5rZXlzKHBhcmFtcykubGVuZ3RoKSB7XG4gICAgICAkc2V0LnBhcmFtZXRlcnMgPSBKU09OLnN0cmluZ2lmeShub3JtYWxpemVQYXJhbWV0ZXJzKHBhcmFtcykpO1xuICAgICAgJHNldC5hcmVTdWJzY3JpYmVyc09yZGVyZWQgPSBBcnJheS5pc0FycmF5KHBhcmFtcyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhcmVTdWJzY3JpYmVyc09yZGVyZWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAkc2V0LmFyZVN1YnNjcmliZXJzT3JkZXJlZCA9IGFyZVN1YnNjcmliZXJzT3JkZXJlZDtcbiAgICB9XG5cbiAgICBpZiAoYXBwbGljYXRpb25UeXBlcykge1xuICAgICAgJHNldC5hcHBsaWNhdGlvblR5cGVzID0gYXBwbGljYXRpb25UeXBlcztcbiAgICB9XG5cbiAgICBpZiAodXNlUmVjb21tZW5kZWRPcmRlcikge1xuICAgICAgJHNldC51c2VSZWNvbW1lbmRlZE9yZGVyID0gdXNlUmVjb21tZW5kZWRPcmRlcjtcbiAgICB9XG5cbiAgICBpZiAobGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucykge1xuICAgICAgJHNldC5sYW5ndWFnZVNwZWNpZmljYXRpb25zID0gbGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucztcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHNvdXJjZU1hcHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgJHNldC5zb3VyY2VNYXBzID0gSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwcyk7XG4gICAgfVxuXG4gICAgaWYgKCRzZXQucGFyYW1ldGVycyB8fCAkc2V0LmFwcGxpY2F0aW9uVHlwZXMgfHwgJHNldC5sYW5ndWFnZVNwZWNpZmljYXRpb25zIHx8XG4gICAgICAgIHR5cGVvZiAkc2V0LmFyZVN1YnNjcmliZXJzT3JkZXJlZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnN0IHVwZGF0ZUFwcGxpY2F0aW9uUmVzID0gYXdhaXQgdGhpcy51cGRhdGVBcHBsaWNhdGlvbihjbGllbnQsICRzZXQpO1xuICAgICAgZXJyb3JIYW5kbGVyKHVwZGF0ZUFwcGxpY2F0aW9uUmVzKTtcbiAgICB9XG5cbiAgICBjb25zdCBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb25SZXMgPSBhd2FpdCB0aGlzLmNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbihjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHVuZGVmaW5lZCwgcmFuZG9taXphdGlvblNlZWQpO1xuICAgIGVycm9ySGFuZGxlcihjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb25SZXMpO1xuXG4gICAgY29uc3QgcHJvdGVjdGlvbklkID0gY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uUmVzLmRhdGEuY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uLl9pZDtcbiAgICBhd2FpdCB0aGlzLnBvbGxQcm90ZWN0aW9uKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkKTtcblxuICAgIGNvbnN0IGRvd25sb2FkID0gYXdhaXQgdGhpcy5kb3dubG9hZEFwcGxpY2F0aW9uUHJvdGVjdGlvbihjbGllbnQsIHByb3RlY3Rpb25JZCk7XG4gICAgZXJyb3JIYW5kbGVyKGRvd25sb2FkKTtcbiAgICB1bnppcChkb3dubG9hZCwgZmlsZXNEZXN0IHx8IGRlc3RDYWxsYmFjayk7XG4gICAgY29uc29sZS5sb2cocHJvdGVjdGlvbklkKTtcbiAgfSxcblxuICBhc3luYyBkb3dubG9hZFNvdXJjZU1hcHMgKGNvbmZpZ3MsIGRlc3RDYWxsYmFjaykge1xuICAgIGNvbnN0IHtcbiAgICAgIGtleXMsXG4gICAgICBob3N0LFxuICAgICAgcG9ydCxcbiAgICAgIGZpbGVzRGVzdCxcbiAgICAgIGZpbGVzU3JjLFxuICAgICAgcHJvdGVjdGlvbklkXG4gICAgfSA9IGNvbmZpZ3M7XG5cbiAgICBjb25zdCB7XG4gICAgICBhY2Nlc3NLZXksXG4gICAgICBzZWNyZXRLZXlcbiAgICB9ID0ga2V5cztcblxuICAgIGNvbnN0IGNsaWVudCA9IG5ldyB0aGlzLkNsaWVudCh7XG4gICAgICBhY2Nlc3NLZXksXG4gICAgICBzZWNyZXRLZXksXG4gICAgICBob3N0LFxuICAgICAgcG9ydFxuICAgIH0pO1xuXG4gICAgaWYgKCFmaWxlc0Rlc3QgJiYgIWRlc3RDYWxsYmFjaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXF1aXJlZCAqZmlsZXNEZXN0KiBub3QgcHJvdmlkZWQnKTtcbiAgICB9XG5cbiAgICBpZiAoIXByb3RlY3Rpb25JZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXF1aXJlZCAqcHJvdGVjdGlvbklkKiBub3QgcHJvdmlkZWQnKTtcbiAgICB9XG5cblxuICAgIGlmIChmaWxlc1NyYykge1xuICAgICAgY29uc29sZS5sb2coJ1tXYXJuaW5nXSBJZ25vcmluZyBzb3VyY2VzIHN1cHBsaWVkLiBEb3dubG9hZGluZyBzb3VyY2UgbWFwcyBvZiBnaXZlbiBwcm90ZWN0aW9uJyk7XG4gICAgfVxuICAgIGxldCBkb3dubG9hZDtcbiAgICB0cnkge1xuICAgICAgZG93bmxvYWQgPSBhd2FpdCB0aGlzLmRvd25sb2FkU291cmNlTWFwc1JlcXVlc3QoY2xpZW50LCBwcm90ZWN0aW9uSWQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGVycm9ySGFuZGxlcihlKTtcbiAgICB9XG4gICAgdW56aXAoZG93bmxvYWQsIGZpbGVzRGVzdCB8fCBkZXN0Q2FsbGJhY2spO1xuICB9LFxuXG4gIGFzeW5jIHBvbGxQcm90ZWN0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHByb3RlY3Rpb25JZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuXG4gICAgY29uc3QgcG9sbCA9IGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGFwcGxpY2F0aW9uUHJvdGVjdGlvbiA9IGF3YWl0IHRoaXMuZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkKTtcbiAgICAgIGlmIChhcHBsaWNhdGlvblByb3RlY3Rpb24uZXJyb3JzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdFcnJvciBwb2xsaW5nIHByb3RlY3Rpb24nLCBhcHBsaWNhdGlvblByb3RlY3Rpb24uZXJyb3JzKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciBwb2xsaW5nIHByb3RlY3Rpb24nKTtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdFcnJvciBwb2xsaW5nIHByb3RlY3Rpb24nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gYXBwbGljYXRpb25Qcm90ZWN0aW9uLmRhdGEuYXBwbGljYXRpb25Qcm90ZWN0aW9uLnN0YXRlO1xuICAgICAgICBpZiAoc3RhdGUgIT09ICdmaW5pc2hlZCcgJiYgc3RhdGUgIT09ICdlcnJvcmVkJykge1xuICAgICAgICAgIHNldFRpbWVvdXQocG9sbCwgNTAwKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gJ2Vycm9yZWQnKSB7XG4gICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vYXBwLmpzY3JhbWJsZXIuY29tL2FwcC8ke2FwcGxpY2F0aW9uSWR9L3Byb3RlY3Rpb25zLyR7cHJvdGVjdGlvbklkfWA7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGBQcm90ZWN0aW9uIGZhaWxlZC4gRm9yIG1vcmUgaW5mb3JtYXRpb24gdmlzaXQ6ICR7dXJsfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBwb2xsKCk7XG5cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgY3JlYXRlQXBwbGljYXRpb24gKGNsaWVudCwgZGF0YSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGNyZWF0ZUFwcGxpY2F0aW9uKGRhdGEsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBkdXBsaWNhdGVBcHBsaWNhdGlvbiAoY2xpZW50LCBkYXRhLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgZHVwbGljYXRlQXBwbGljYXRpb24oZGF0YSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHJlbW92ZUFwcGxpY2F0aW9uIChjbGllbnQsIGlkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHJlbW92ZUFwcGxpY2F0aW9uKGlkKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHJlbW92ZVByb3RlY3Rpb24gKGNsaWVudCwgaWQsIGFwcElkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgcmVtb3ZlUHJvdGVjdGlvbihpZCwgYXBwSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBjYW5jZWxQcm90ZWN0aW9uIChjbGllbnQsIGlkLCBhcHBJZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGNhbmNlbFByb3RlY3Rpb24oaWQsIGFwcElkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgdXBkYXRlQXBwbGljYXRpb24gKGNsaWVudCwgYXBwbGljYXRpb24sIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCB1cGRhdGVBcHBsaWNhdGlvbihhcHBsaWNhdGlvbiwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHVubG9ja0FwcGxpY2F0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgdW5sb2NrQXBwbGljYXRpb24oYXBwbGljYXRpb24sIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvbihhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25Tb3VyY2UgKGNsaWVudCwgc291cmNlSWQsIGZyYWdtZW50cywgbGltaXRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb25Tb3VyY2Uoc291cmNlSWQsIGZyYWdtZW50cywgbGltaXRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnMgKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcGFyYW1zLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zKGFwcGxpY2F0aW9uSWQsIHBhcmFtcywgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudCAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zQ291bnQoYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGNyZWF0ZVRlbXBsYXRlIChjbGllbnQsIHRlbXBsYXRlLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgY3JlYXRlVGVtcGxhdGUodGVtcGxhdGUsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyByZW1vdmVUZW1wbGF0ZSAoY2xpZW50LCBpZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCByZW1vdmVUZW1wbGF0ZShpZCksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRUZW1wbGF0ZXMgKGNsaWVudCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0VGVtcGxhdGVzKGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvbnMgKGNsaWVudCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb25zKGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBhZGRBcHBsaWNhdGlvblNvdXJjZSAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBhcHBsaWNhdGlvblNvdXJjZSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGFkZEFwcGxpY2F0aW9uU291cmNlKGFwcGxpY2F0aW9uSWQsIGFwcGxpY2F0aW9uU291cmNlLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgYWRkQXBwbGljYXRpb25Tb3VyY2VGcm9tVVJMIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHVybCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgcmV0dXJuIGdldEZpbGVGcm9tVXJsKGNsaWVudCwgdXJsKVxuICAgICAgLnRoZW4oZnVuY3Rpb24oZmlsZSkge1xuICAgICAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgYWRkQXBwbGljYXRpb25Tb3VyY2UoYXBwbGljYXRpb25JZCwgZmlsZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgfSk7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHVwZGF0ZUFwcGxpY2F0aW9uU291cmNlIChjbGllbnQsIGFwcGxpY2F0aW9uU291cmNlLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgdXBkYXRlQXBwbGljYXRpb25Tb3VyY2UoYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyByZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24gKGNsaWVudCwgc291cmNlSWQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCByZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24oc291cmNlSWQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBhcHBseVRlbXBsYXRlIChjbGllbnQsIHRlbXBsYXRlSWQsIGFwcElkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgYXBwbHlUZW1wbGF0ZSh0ZW1wbGF0ZUlkLCBhcHBJZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHVwZGF0ZVRlbXBsYXRlIChjbGllbnQsIHRlbXBsYXRlLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgdXBkYXRlVGVtcGxhdGUodGVtcGxhdGUsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzLCByYW5kb21pemF0aW9uU2VlZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24oYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzLCByYW5kb21pemF0aW9uU2VlZCksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRQcm90ZWN0aW9uKGFwcGxpY2F0aW9uSWQsIHByb3RlY3Rpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGRvd25sb2FkU291cmNlTWFwc1JlcXVlc3QgKGNsaWVudCwgcHJvdGVjdGlvbklkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldChgL2FwcGxpY2F0aW9uL3NvdXJjZU1hcHMvJHtwcm90ZWN0aW9uSWR9YCwgbnVsbCwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSwgZmFsc2UpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBkb3dubG9hZEFwcGxpY2F0aW9uUHJvdGVjdGlvbiAoY2xpZW50LCBwcm90ZWN0aW9uSWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KGAvYXBwbGljYXRpb24vZG93bmxvYWQvJHtwcm90ZWN0aW9uSWR9YCwgbnVsbCwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSwgZmFsc2UpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9XG59O1xuXG5mdW5jdGlvbiBnZXRGaWxlRnJvbVVybCAoY2xpZW50LCB1cmwpIHtcbiAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gIHZhciBmaWxlO1xuICByZXF1ZXN0LmdldCh1cmwpXG4gICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgZmlsZSA9IHtcbiAgICAgICAgY29udGVudDogcmVzLmRhdGEsXG4gICAgICAgIGZpbGVuYW1lOiBwYXRoLmJhc2VuYW1lKHVybCksXG4gICAgICAgIGV4dGVuc2lvbjogcGF0aC5leHRuYW1lKHVybCkuc3Vic3RyKDEpXG4gICAgICB9O1xuICAgICAgZGVmZXJyZWQucmVzb2x2ZShmaWxlKTtcbiAgICB9KVxuICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcbiAgICB9KTtcbiAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cbmZ1bmN0aW9uIHJlc3BvbnNlSGFuZGxlciAoZGVmZXJyZWQpIHtcbiAgcmV0dXJuIChlcnIsIHJlcykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYm9keSA9IHJlcy5kYXRhO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPj0gNDAwKSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGJvZHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYm9keSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChib2R5KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGVycm9ySGFuZGxlciAocmVzKSB7XG4gIGlmIChyZXMuZXJyb3JzICYmIHJlcy5lcnJvcnMubGVuZ3RoKSB7XG4gICAgcmVzLmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLm1lc3NhZ2UpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKHJlcy5tZXNzYWdlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKHJlcy5tZXNzYWdlKTtcbiAgfVxuXG4gIHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVBhcmFtZXRlcnMgKHBhcmFtZXRlcnMpIHtcbiAgdmFyIHJlc3VsdDtcblxuICBpZiAoIUFycmF5LmlzQXJyYXkocGFyYW1ldGVycykpIHtcbiAgICByZXN1bHQgPSBbXTtcbiAgICBPYmplY3Qua2V5cyhwYXJhbWV0ZXJzKS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIG9wdGlvbnM6IHBhcmFtZXRlcnNbbmFtZV1cbiAgICAgIH0pXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gcGFyYW1ldGVycztcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG4iXX0=
