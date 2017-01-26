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
      var config, applicationId, host, port, keys, filesDest, filesSrc, cwd, params, applicationTypes, languageSpecifications, sourceMaps, areSubscribersOrdered, useRecommendedOrder, accessKey, secretKey, client, _filesSrc, i, l, _zip, removeSourceRes, hadNoSources, addApplicationSourceRes, $set, updateApplicationRes, createApplicationProtectionRes, protectionId, download;

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
              return _this.createApplicationProtection(client, applicationId);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvaW5kZXguanMiXSwibmFtZXMiOlsiQ2xpZW50IiwiY29uZmlnIiwiZ2VuZXJhdGVTaWduZWRQYXJhbXMiLCJwcm90ZWN0QW5kRG93bmxvYWQiLCJjb25maWdQYXRoT3JPYmplY3QiLCJkZXN0Q2FsbGJhY2siLCJyZXF1aXJlIiwiYXBwbGljYXRpb25JZCIsImhvc3QiLCJwb3J0Iiwia2V5cyIsImZpbGVzRGVzdCIsImZpbGVzU3JjIiwiY3dkIiwicGFyYW1zIiwiYXBwbGljYXRpb25UeXBlcyIsImxhbmd1YWdlU3BlY2lmaWNhdGlvbnMiLCJzb3VyY2VNYXBzIiwiYXJlU3Vic2NyaWJlcnNPcmRlcmVkIiwidXNlUmVjb21tZW5kZWRPcmRlciIsImFjY2Vzc0tleSIsInNlY3JldEtleSIsImNsaWVudCIsIkVycm9yIiwibGVuZ3RoIiwiX2ZpbGVzU3JjIiwiaSIsImwiLCJjb25jYXQiLCJzeW5jIiwiZG90IiwicHVzaCIsIl96aXAiLCJyZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24iLCJyZW1vdmVTb3VyY2VSZXMiLCJlcnJvcnMiLCJoYWROb1NvdXJjZXMiLCJmb3JFYWNoIiwiZXJyb3IiLCJtZXNzYWdlIiwiYWRkQXBwbGljYXRpb25Tb3VyY2UiLCJjb250ZW50IiwiZ2VuZXJhdGUiLCJ0eXBlIiwiZmlsZW5hbWUiLCJleHRlbnNpb24iLCJhZGRBcHBsaWNhdGlvblNvdXJjZVJlcyIsImVycm9ySGFuZGxlciIsIiRzZXQiLCJfaWQiLCJPYmplY3QiLCJwYXJhbWV0ZXJzIiwiSlNPTiIsInN0cmluZ2lmeSIsIm5vcm1hbGl6ZVBhcmFtZXRlcnMiLCJBcnJheSIsImlzQXJyYXkiLCJ1bmRlZmluZWQiLCJ1cGRhdGVBcHBsaWNhdGlvbiIsInVwZGF0ZUFwcGxpY2F0aW9uUmVzIiwiY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uIiwiY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uUmVzIiwicHJvdGVjdGlvbklkIiwiZGF0YSIsInBvbGxQcm90ZWN0aW9uIiwiZG93bmxvYWRBcHBsaWNhdGlvblByb3RlY3Rpb24iLCJkb3dubG9hZCIsImNvbnNvbGUiLCJsb2ciLCJkb3dubG9hZFNvdXJjZU1hcHMiLCJjb25maWdzIiwiZG93bmxvYWRTb3VyY2VNYXBzUmVxdWVzdCIsImRlZmVycmVkIiwiZGVmZXIiLCJwb2xsIiwiZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uIiwiYXBwbGljYXRpb25Qcm90ZWN0aW9uIiwic3RhdGUiLCJzZXRUaW1lb3V0IiwidXJsIiwicmVqZWN0IiwicmVzb2x2ZSIsInByb21pc2UiLCJjcmVhdGVBcHBsaWNhdGlvbiIsImZyYWdtZW50cyIsInBvc3QiLCJyZXNwb25zZUhhbmRsZXIiLCJkdXBsaWNhdGVBcHBsaWNhdGlvbiIsInJlbW92ZUFwcGxpY2F0aW9uIiwiaWQiLCJyZW1vdmVQcm90ZWN0aW9uIiwiYXBwSWQiLCJjYW5jZWxQcm90ZWN0aW9uIiwiYXBwbGljYXRpb24iLCJ1bmxvY2tBcHBsaWNhdGlvbiIsImdldEFwcGxpY2F0aW9uIiwiZ2V0IiwiZ2V0QXBwbGljYXRpb25Tb3VyY2UiLCJzb3VyY2VJZCIsImxpbWl0cyIsImdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnMiLCJnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zQ291bnQiLCJjcmVhdGVUZW1wbGF0ZSIsInRlbXBsYXRlIiwicmVtb3ZlVGVtcGxhdGUiLCJnZXRUZW1wbGF0ZXMiLCJnZXRBcHBsaWNhdGlvbnMiLCJhcHBsaWNhdGlvblNvdXJjZSIsImFkZEFwcGxpY2F0aW9uU291cmNlRnJvbVVSTCIsImdldEZpbGVGcm9tVXJsIiwidGhlbiIsImZpbGUiLCJ1cGRhdGVBcHBsaWNhdGlvblNvdXJjZSIsImFwcGx5VGVtcGxhdGUiLCJ0ZW1wbGF0ZUlkIiwidXBkYXRlVGVtcGxhdGUiLCJyZXMiLCJiYXNlbmFtZSIsImV4dG5hbWUiLCJzdWJzdHIiLCJjYXRjaCIsImVyciIsImJvZHkiLCJzdGF0dXMiLCJleCIsInJlc3VsdCIsIm5hbWUiLCJv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QUFULENBQThCSCxVQUE5QixFQUEwQztBQUN4QyxNQUFJMEUsTUFBSjs7QUFFQSxNQUFJLENBQUN0RSxNQUFNQyxPQUFOLENBQWNMLFVBQWQsQ0FBTCxFQUFnQztBQUM5QjBFLGFBQVMsRUFBVDtBQUNBM0UsV0FBT3hDLElBQVAsQ0FBWXlDLFVBQVosRUFBd0JkLE9BQXhCLENBQWdDLFVBQUN5RixJQUFELEVBQVU7QUFDeENELGFBQU85RixJQUFQLENBQVk7QUFDVitGLGtCQURVO0FBRVZDLGlCQUFTNUUsV0FBVzJFLElBQVg7QUFGQyxPQUFaO0FBSUQsS0FMRDtBQU1ELEdBUkQsTUFRTztBQUNMRCxhQUFTMUUsVUFBVDtBQUNEOztBQUVELFNBQU8wRSxNQUFQO0FBQ0QiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ2JhYmVsLXBvbHlmaWxsJztcblxuaW1wb3J0IGdsb2IgZnJvbSAnZ2xvYic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCByZXF1ZXN0IGZyb20gJ2F4aW9zJztcbmltcG9ydCBRIGZyb20gJ3EnO1xuXG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJztcbmltcG9ydCBnZW5lcmF0ZVNpZ25lZFBhcmFtcyBmcm9tICcuL2dlbmVyYXRlLXNpZ25lZC1wYXJhbXMnO1xuaW1wb3J0IEpTY3JhbWJsZXJDbGllbnQgZnJvbSAnLi9jbGllbnQnO1xuaW1wb3J0IHtcbiAgYWRkQXBwbGljYXRpb25Tb3VyY2UsXG4gIGNyZWF0ZUFwcGxpY2F0aW9uLFxuICByZW1vdmVBcHBsaWNhdGlvbixcbiAgdXBkYXRlQXBwbGljYXRpb24sXG4gIHVwZGF0ZUFwcGxpY2F0aW9uU291cmNlLFxuICByZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24sXG4gIGNyZWF0ZVRlbXBsYXRlLFxuICByZW1vdmVUZW1wbGF0ZSxcbiAgdXBkYXRlVGVtcGxhdGUsXG4gIGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbixcbiAgcmVtb3ZlUHJvdGVjdGlvbixcbiAgY2FuY2VsUHJvdGVjdGlvbixcbiAgZHVwbGljYXRlQXBwbGljYXRpb24sXG4gIHVubG9ja0FwcGxpY2F0aW9uLFxuICBhcHBseVRlbXBsYXRlXG59IGZyb20gJy4vbXV0YXRpb25zJztcbmltcG9ydCB7XG4gIGdldEFwcGxpY2F0aW9uLFxuICBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zLFxuICBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zQ291bnQsXG4gIGdldEFwcGxpY2F0aW9ucyxcbiAgZ2V0QXBwbGljYXRpb25Tb3VyY2UsXG4gIGdldFRlbXBsYXRlcyxcbiAgZ2V0UHJvdGVjdGlvblxufSBmcm9tICcuL3F1ZXJpZXMnO1xuaW1wb3J0IHtcbiAgemlwLFxuICB1bnppcFxufSBmcm9tICcuL3ppcCc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgQ2xpZW50OiBKU2NyYW1ibGVyQ2xpZW50LFxuICBjb25maWcsXG4gIGdlbmVyYXRlU2lnbmVkUGFyYW1zLFxuICAvLyBUaGlzIG1ldGhvZCBpcyBhIHNob3J0Y3V0IG1ldGhvZCB0aGF0IGFjY2VwdHMgYW4gb2JqZWN0IHdpdGggZXZlcnl0aGluZyBuZWVkZWRcbiAgLy8gZm9yIHRoZSBlbnRpcmUgcHJvY2VzcyBvZiByZXF1ZXN0aW5nIGFuIGFwcGxpY2F0aW9uIHByb3RlY3Rpb24gYW5kIGRvd25sb2FkaW5nXG4gIC8vIHRoYXQgc2FtZSBwcm90ZWN0aW9uIHdoZW4gdGhlIHNhbWUgZW5kcy5cbiAgLy9cbiAgLy8gYGNvbmZpZ1BhdGhPck9iamVjdGAgY2FuIGJlIGEgcGF0aCB0byBhIEpTT04gb3IgZGlyZWN0bHkgYW4gb2JqZWN0IGNvbnRhaW5pbmdcbiAgLy8gdGhlIGZvbGxvd2luZyBzdHJ1Y3R1cmU6XG4gIC8vXG4gIC8vIGBgYGpzb25cbiAgLy8ge1xuICAvLyAgIFwia2V5c1wiOiB7XG4gIC8vICAgICBcImFjY2Vzc0tleVwiOiBcIlwiLFxuICAvLyAgICAgXCJzZWNyZXRLZXlcIjogXCJcIlxuICAvLyAgIH0sXG4gIC8vICAgXCJhcHBsaWNhdGlvbklkXCI6IFwiXCIsXG4gIC8vICAgXCJmaWxlc0Rlc3RcIjogXCJcIlxuICAvLyB9XG4gIC8vIGBgYFxuICAvL1xuICAvLyBBbHNvIHRoZSBmb2xsb3dpbmcgb3B0aW9uYWwgcGFyYW1ldGVycyBhcmUgYWNjZXB0ZWQ6XG4gIC8vXG4gIC8vIGBgYGpzb25cbiAgLy8ge1xuICAvLyAgIFwiZmlsZXNTcmNcIjogW1wiXCJdLFxuICAvLyAgIFwicGFyYW1zXCI6IHt9LFxuICAvLyAgIFwiY3dkXCI6IFwiXCIsXG4gIC8vICAgXCJob3N0XCI6IFwiYXBpLmpzY3JhbWJsZXIuY29tXCIsXG4gIC8vICAgXCJwb3J0XCI6IFwiNDQzXCJcbiAgLy8gfVxuICAvLyBgYGBcbiAgLy9cbiAgLy8gYGZpbGVzU3JjYCBzdXBwb3J0cyBnbG9iIHBhdHRlcm5zLCBhbmQgaWYgaXQncyBwcm92aWRlZCBpdCB3aWxsIHJlcGxhY2UgdGhlXG4gIC8vIGVudGlyZSBhcHBsaWNhdGlvbiBzb3VyY2VzLlxuICAvL1xuICAvLyBgcGFyYW1zYCBpZiBwcm92aWRlZCB3aWxsIHJlcGxhY2UgYWxsIHRoZSBhcHBsaWNhdGlvbiB0cmFuc2Zvcm1hdGlvbiBwYXJhbWV0ZXJzLlxuICAvL1xuICAvLyBgY3dkYCBhbGxvd3MgeW91IHRvIHNldCB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSB0byByZXNvbHZlIHByb2JsZW1zIHdpdGhcbiAgLy8gcmVsYXRpdmUgcGF0aHMgd2l0aCB5b3VyIGBmaWxlc1NyY2AgaXMgb3V0c2lkZSB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS5cbiAgLy9cbiAgLy8gRmluYWxseSwgYGhvc3RgIGFuZCBgcG9ydGAgY2FuIGJlIG92ZXJyaWRkZW4gaWYgeW91IHRvIGVuZ2FnZSB3aXRoIGEgZGlmZmVyZW50XG4gIC8vIGVuZHBvaW50IHRoYW4gdGhlIGRlZmF1bHQgb25lLCB1c2VmdWwgaWYgeW91J3JlIHJ1bm5pbmcgYW4gZW50ZXJwcmlzZSB2ZXJzaW9uIG9mXG4gIC8vIEpzY3JhbWJsZXIgb3IgaWYgeW91J3JlIHByb3ZpZGVkIGFjY2VzcyB0byBiZXRhIGZlYXR1cmVzIG9mIG91ciBwcm9kdWN0LlxuICAvL1xuICBhc3luYyBwcm90ZWN0QW5kRG93bmxvYWQgKGNvbmZpZ1BhdGhPck9iamVjdCwgZGVzdENhbGxiYWNrKSB7XG4gICAgY29uc3QgY29uZmlnID0gdHlwZW9mIGNvbmZpZ1BhdGhPck9iamVjdCA9PT0gJ3N0cmluZycgP1xuICAgICAgcmVxdWlyZShjb25maWdQYXRoT3JPYmplY3QpIDogY29uZmlnUGF0aE9yT2JqZWN0O1xuXG4gICAgY29uc3Qge1xuICAgICAgYXBwbGljYXRpb25JZCxcbiAgICAgIGhvc3QsXG4gICAgICBwb3J0LFxuICAgICAga2V5cyxcbiAgICAgIGZpbGVzRGVzdCxcbiAgICAgIGZpbGVzU3JjLFxuICAgICAgY3dkLFxuICAgICAgcGFyYW1zLFxuICAgICAgYXBwbGljYXRpb25UeXBlcyxcbiAgICAgIGxhbmd1YWdlU3BlY2lmaWNhdGlvbnMsXG4gICAgICBzb3VyY2VNYXBzLFxuICAgICAgYXJlU3Vic2NyaWJlcnNPcmRlcmVkLFxuICAgICAgdXNlUmVjb21tZW5kZWRPcmRlclxuICAgIH0gPSBjb25maWc7XG5cbiAgICBjb25zdCB7XG4gICAgICBhY2Nlc3NLZXksXG4gICAgICBzZWNyZXRLZXlcbiAgICB9ID0ga2V5cztcblxuICAgIGNvbnN0IGNsaWVudCA9IG5ldyB0aGlzLkNsaWVudCh7XG4gICAgICBhY2Nlc3NLZXksXG4gICAgICBzZWNyZXRLZXksXG4gICAgICBob3N0LFxuICAgICAgcG9ydFxuICAgIH0pO1xuXG4gICAgaWYgKCFhcHBsaWNhdGlvbklkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlcXVpcmVkICphcHBsaWNhdGlvbklkKiBub3QgcHJvdmlkZWQnKTtcbiAgICB9XG5cbiAgICBpZiAoIWZpbGVzRGVzdCAmJiAhZGVzdENhbGxiYWNrKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlcXVpcmVkICpmaWxlc0Rlc3QqIG5vdCBwcm92aWRlZCcpO1xuICAgIH1cblxuICAgIGlmIChmaWxlc1NyYyAmJiBmaWxlc1NyYy5sZW5ndGgpIHtcbiAgICAgIGxldCBfZmlsZXNTcmMgPSBbXTtcbiAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gZmlsZXNTcmMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZmlsZXNTcmNbaV0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgLy8gVE9ETyBSZXBsYWNlIGBnbG9iLnN5bmNgIHdpdGggYXN5bmMgdmVyc2lvblxuICAgICAgICAgIF9maWxlc1NyYyA9IF9maWxlc1NyYy5jb25jYXQoZ2xvYi5zeW5jKGZpbGVzU3JjW2ldLCB7ZG90OiB0cnVlfSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9maWxlc1NyYy5wdXNoKGZpbGVzU3JjW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBfemlwID0gYXdhaXQgemlwKF9maWxlc1NyYywgY3dkKTtcblxuICAgICAgY29uc3QgcmVtb3ZlU291cmNlUmVzID0gYXdhaXQgdGhpcy5yZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24oY2xpZW50LCAnJywgYXBwbGljYXRpb25JZCk7XG4gICAgICBpZiAocmVtb3ZlU291cmNlUmVzLmVycm9ycykge1xuICAgICAgICAvLyBUT0RPIEltcGxlbWVudCBlcnJvciBjb2RlcyBvciBmaXggdGhpcyBpcyBvbiB0aGUgc2VydmljZXNcbiAgICAgICAgdmFyIGhhZE5vU291cmNlcyA9IGZhbHNlO1xuICAgICAgICByZW1vdmVTb3VyY2VSZXMuZXJyb3JzLmZvckVhY2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgaWYgKGVycm9yLm1lc3NhZ2UgPT09ICdBcHBsaWNhdGlvbiBTb3VyY2Ugd2l0aCB0aGUgZ2l2ZW4gSUQgZG9lcyBub3QgZXhpc3QnKSB7XG4gICAgICAgICAgICBoYWROb1NvdXJjZXMgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghaGFkTm9Tb3VyY2VzKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlbW92ZVNvdXJjZVJlcy5lcnJvcnNbMF0ubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgYWRkQXBwbGljYXRpb25Tb3VyY2VSZXMgPSBhd2FpdCB0aGlzLmFkZEFwcGxpY2F0aW9uU291cmNlKGNsaWVudCwgYXBwbGljYXRpb25JZCwge1xuICAgICAgICBjb250ZW50OiBfemlwLmdlbmVyYXRlKHt0eXBlOiAnYmFzZTY0J30pLFxuICAgICAgICBmaWxlbmFtZTogJ2FwcGxpY2F0aW9uLnppcCcsXG4gICAgICAgIGV4dGVuc2lvbjogJ3ppcCdcbiAgICAgIH0pO1xuICAgICAgZXJyb3JIYW5kbGVyKGFkZEFwcGxpY2F0aW9uU291cmNlUmVzKTtcbiAgICB9XG5cbiAgICBjb25zdCAkc2V0ID0ge1xuICAgICAgX2lkOiBhcHBsaWNhdGlvbklkXG4gICAgfTtcblxuICAgIGlmIChwYXJhbXMgJiYgT2JqZWN0LmtleXMocGFyYW1zKS5sZW5ndGgpIHtcbiAgICAgICRzZXQucGFyYW1ldGVycyA9IEpTT04uc3RyaW5naWZ5KG5vcm1hbGl6ZVBhcmFtZXRlcnMocGFyYW1zKSk7XG4gICAgICAkc2V0LmFyZVN1YnNjcmliZXJzT3JkZXJlZCA9IEFycmF5LmlzQXJyYXkocGFyYW1zKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGFyZVN1YnNjcmliZXJzT3JkZXJlZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICRzZXQuYXJlU3Vic2NyaWJlcnNPcmRlcmVkID0gYXJlU3Vic2NyaWJlcnNPcmRlcmVkO1xuICAgIH1cblxuICAgIGlmIChhcHBsaWNhdGlvblR5cGVzKSB7XG4gICAgICAkc2V0LmFwcGxpY2F0aW9uVHlwZXMgPSBhcHBsaWNhdGlvblR5cGVzO1xuICAgIH1cblxuICAgIGlmICh1c2VSZWNvbW1lbmRlZE9yZGVyKSB7XG4gICAgICAkc2V0LnVzZVJlY29tbWVuZGVkT3JkZXIgPSB1c2VSZWNvbW1lbmRlZE9yZGVyO1xuICAgIH1cblxuICAgIGlmIChsYW5ndWFnZVNwZWNpZmljYXRpb25zKSB7XG4gICAgICAkc2V0Lmxhbmd1YWdlU3BlY2lmaWNhdGlvbnMgPSBsYW5ndWFnZVNwZWNpZmljYXRpb25zO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygc291cmNlTWFwcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAkc2V0LnNvdXJjZU1hcHMgPSBKU09OLnN0cmluZ2lmeShzb3VyY2VNYXBzKTtcbiAgICB9XG5cbiAgICBpZiAoJHNldC5wYXJhbWV0ZXJzIHx8ICRzZXQuYXBwbGljYXRpb25UeXBlcyB8fCAkc2V0Lmxhbmd1YWdlU3BlY2lmaWNhdGlvbnMgfHxcbiAgICAgICAgdHlwZW9mICRzZXQuYXJlU3Vic2NyaWJlcnNPcmRlcmVkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc3QgdXBkYXRlQXBwbGljYXRpb25SZXMgPSBhd2FpdCB0aGlzLnVwZGF0ZUFwcGxpY2F0aW9uKGNsaWVudCwgJHNldCk7XG4gICAgICBlcnJvckhhbmRsZXIodXBkYXRlQXBwbGljYXRpb25SZXMpO1xuICAgIH1cblxuICAgIGNvbnN0IGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcyA9IGF3YWl0IHRoaXMuY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uKGNsaWVudCwgYXBwbGljYXRpb25JZCk7XG4gICAgZXJyb3JIYW5kbGVyKGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcyk7XG5cbiAgICBjb25zdCBwcm90ZWN0aW9uSWQgPSBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb25SZXMuZGF0YS5jcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24uX2lkO1xuICAgIGF3YWl0IHRoaXMucG9sbFByb3RlY3Rpb24oY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQpO1xuXG4gICAgY29uc3QgZG93bmxvYWQgPSBhd2FpdCB0aGlzLmRvd25sb2FkQXBwbGljYXRpb25Qcm90ZWN0aW9uKGNsaWVudCwgcHJvdGVjdGlvbklkKTtcbiAgICBlcnJvckhhbmRsZXIoZG93bmxvYWQpO1xuICAgIHVuemlwKGRvd25sb2FkLCBmaWxlc0Rlc3QgfHwgZGVzdENhbGxiYWNrKTtcbiAgICBjb25zb2xlLmxvZyhwcm90ZWN0aW9uSWQpO1xuICB9LFxuXG4gIGFzeW5jIGRvd25sb2FkU291cmNlTWFwcyAoY29uZmlncywgZGVzdENhbGxiYWNrKSB7XG4gICAgY29uc3Qge1xuICAgICAga2V5cyxcbiAgICAgIGhvc3QsXG4gICAgICBwb3J0LFxuICAgICAgZmlsZXNEZXN0LFxuICAgICAgZmlsZXNTcmMsXG4gICAgICBwcm90ZWN0aW9uSWRcbiAgICB9ID0gY29uZmlncztcblxuICAgIGNvbnN0IHtcbiAgICAgIGFjY2Vzc0tleSxcbiAgICAgIHNlY3JldEtleVxuICAgIH0gPSBrZXlzO1xuXG4gICAgY29uc3QgY2xpZW50ID0gbmV3IHRoaXMuQ2xpZW50KHtcbiAgICAgIGFjY2Vzc0tleSxcbiAgICAgIHNlY3JldEtleSxcbiAgICAgIGhvc3QsXG4gICAgICBwb3J0XG4gICAgfSk7XG5cbiAgICBpZiAoIWZpbGVzRGVzdCAmJiAhZGVzdENhbGxiYWNrKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlcXVpcmVkICpmaWxlc0Rlc3QqIG5vdCBwcm92aWRlZCcpO1xuICAgIH1cblxuICAgIGlmICghcHJvdGVjdGlvbklkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlcXVpcmVkICpwcm90ZWN0aW9uSWQqIG5vdCBwcm92aWRlZCcpO1xuICAgIH1cblxuXG4gICAgaWYgKGZpbGVzU3JjKSB7XG4gICAgICBjb25zb2xlLmxvZygnW1dhcm5pbmddIElnbm9yaW5nIHNvdXJjZXMgc3VwcGxpZWQuIERvd25sb2FkaW5nIHNvdXJjZSBtYXBzIG9mIGdpdmVuIHByb3RlY3Rpb24nKTtcbiAgICB9XG4gICAgbGV0IGRvd25sb2FkO1xuICAgIHRyeSB7XG4gICAgICBkb3dubG9hZCA9IGF3YWl0IHRoaXMuZG93bmxvYWRTb3VyY2VNYXBzUmVxdWVzdChjbGllbnQsIHByb3RlY3Rpb25JZCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZXJyb3JIYW5kbGVyKGUpO1xuICAgIH1cbiAgICB1bnppcChkb3dubG9hZCwgZmlsZXNEZXN0IHx8IGRlc3RDYWxsYmFjayk7XG4gIH0sXG5cbiAgYXN5bmMgcG9sbFByb3RlY3Rpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cbiAgICBjb25zdCBwb2xsID0gYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgYXBwbGljYXRpb25Qcm90ZWN0aW9uID0gYXdhaXQgdGhpcy5nZXRBcHBsaWNhdGlvblByb3RlY3Rpb24oY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQpO1xuICAgICAgaWYgKGFwcGxpY2F0aW9uUHJvdGVjdGlvbi5lcnJvcnMpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIHBvbGxpbmcgcHJvdGVjdGlvbicsIGFwcGxpY2F0aW9uUHJvdGVjdGlvbi5lcnJvcnMpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIHBvbGxpbmcgcHJvdGVjdGlvbicpO1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ0Vycm9yIHBvbGxpbmcgcHJvdGVjdGlvbicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBhcHBsaWNhdGlvblByb3RlY3Rpb24uZGF0YS5hcHBsaWNhdGlvblByb3RlY3Rpb24uc3RhdGU7XG4gICAgICAgIGlmIChzdGF0ZSAhPT0gJ2ZpbmlzaGVkJyAmJiBzdGF0ZSAhPT0gJ2Vycm9yZWQnKSB7XG4gICAgICAgICAgc2V0VGltZW91dChwb2xsLCA1MDApO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSAnZXJyb3JlZCcpIHtcbiAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcHAuanNjcmFtYmxlci5jb20vYXBwLyR7YXBwbGljYXRpb25JZH0vcHJvdGVjdGlvbnMvJHtwcm90ZWN0aW9uSWR9YDtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoYFByb3RlY3Rpb24gZmFpbGVkLiBGb3IgbW9yZSBpbmZvcm1hdGlvbiB2aXNpdDogJHt1cmx9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHBvbGwoKTtcblxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBjcmVhdGVBcHBsaWNhdGlvbiAoY2xpZW50LCBkYXRhLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgY3JlYXRlQXBwbGljYXRpb24oZGF0YSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGR1cGxpY2F0ZUFwcGxpY2F0aW9uIChjbGllbnQsIGRhdGEsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBkdXBsaWNhdGVBcHBsaWNhdGlvbihkYXRhLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgcmVtb3ZlQXBwbGljYXRpb24gKGNsaWVudCwgaWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgcmVtb3ZlQXBwbGljYXRpb24oaWQpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgcmVtb3ZlUHJvdGVjdGlvbiAoY2xpZW50LCBpZCwgYXBwSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCByZW1vdmVQcm90ZWN0aW9uKGlkLCBhcHBJZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGNhbmNlbFByb3RlY3Rpb24gKGNsaWVudCwgaWQsIGFwcElkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgY2FuY2VsUHJvdGVjdGlvbihpZCwgYXBwSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyB1cGRhdGVBcHBsaWNhdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbiwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHVwZGF0ZUFwcGxpY2F0aW9uKGFwcGxpY2F0aW9uLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgdW5sb2NrQXBwbGljYXRpb24gKGNsaWVudCwgYXBwbGljYXRpb24sIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCB1bmxvY2tBcHBsaWNhdGlvbihhcHBsaWNhdGlvbiwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9uKGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblNvdXJjZSAoY2xpZW50LCBzb3VyY2VJZCwgZnJhZ21lbnRzLCBsaW1pdHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvblNvdXJjZShzb3VyY2VJZCwgZnJhZ21lbnRzLCBsaW1pdHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9ucyAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwYXJhbXMsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnMoYXBwbGljYXRpb25JZCwgcGFyYW1zLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50IChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudChhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgY3JlYXRlVGVtcGxhdGUgKGNsaWVudCwgdGVtcGxhdGUsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBjcmVhdGVUZW1wbGF0ZSh0ZW1wbGF0ZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHJlbW92ZVRlbXBsYXRlIChjbGllbnQsIGlkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHJlbW92ZVRlbXBsYXRlKGlkKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldFRlbXBsYXRlcyAoY2xpZW50LCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRUZW1wbGF0ZXMoZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9ucyAoY2xpZW50LCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvbnMoZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGFkZEFwcGxpY2F0aW9uU291cmNlIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIGFwcGxpY2F0aW9uU291cmNlLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgYWRkQXBwbGljYXRpb25Tb3VyY2UoYXBwbGljYXRpb25JZCwgYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBhZGRBcHBsaWNhdGlvblNvdXJjZUZyb21VUkwgKGNsaWVudCwgYXBwbGljYXRpb25JZCwgdXJsLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICByZXR1cm4gZ2V0RmlsZUZyb21VcmwoY2xpZW50LCB1cmwpXG4gICAgICAudGhlbihmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBhZGRBcHBsaWNhdGlvblNvdXJjZShhcHBsaWNhdGlvbklkLCBmaWxlLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICB9KTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgdXBkYXRlQXBwbGljYXRpb25Tb3VyY2UgKGNsaWVudCwgYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCB1cGRhdGVBcHBsaWNhdGlvblNvdXJjZShhcHBsaWNhdGlvblNvdXJjZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbiAoY2xpZW50LCBzb3VyY2VJZCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbihzb3VyY2VJZCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGFwcGx5VGVtcGxhdGUgKGNsaWVudCwgdGVtcGxhdGVJZCwgYXBwSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBhcHBseVRlbXBsYXRlKHRlbXBsYXRlSWQsIGFwcElkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgdXBkYXRlVGVtcGxhdGUgKGNsaWVudCwgdGVtcGxhdGUsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCB1cGRhdGVUZW1wbGF0ZSh0ZW1wbGF0ZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uKGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRQcm90ZWN0aW9uKGFwcGxpY2F0aW9uSWQsIHByb3RlY3Rpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGRvd25sb2FkU291cmNlTWFwc1JlcXVlc3QgKGNsaWVudCwgcHJvdGVjdGlvbklkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldChgL2FwcGxpY2F0aW9uL3NvdXJjZU1hcHMvJHtwcm90ZWN0aW9uSWR9YCwgbnVsbCwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSwgZmFsc2UpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBkb3dubG9hZEFwcGxpY2F0aW9uUHJvdGVjdGlvbiAoY2xpZW50LCBwcm90ZWN0aW9uSWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KGAvYXBwbGljYXRpb24vZG93bmxvYWQvJHtwcm90ZWN0aW9uSWR9YCwgbnVsbCwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSwgZmFsc2UpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9XG59O1xuXG5mdW5jdGlvbiBnZXRGaWxlRnJvbVVybCAoY2xpZW50LCB1cmwpIHtcbiAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gIHZhciBmaWxlO1xuICByZXF1ZXN0LmdldCh1cmwpXG4gICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgZmlsZSA9IHtcbiAgICAgICAgY29udGVudDogcmVzLmRhdGEsXG4gICAgICAgIGZpbGVuYW1lOiBwYXRoLmJhc2VuYW1lKHVybCksXG4gICAgICAgIGV4dGVuc2lvbjogcGF0aC5leHRuYW1lKHVybCkuc3Vic3RyKDEpXG4gICAgICB9O1xuICAgICAgZGVmZXJyZWQucmVzb2x2ZShmaWxlKTtcbiAgICB9KVxuICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcbiAgICB9KTtcbiAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cbmZ1bmN0aW9uIHJlc3BvbnNlSGFuZGxlciAoZGVmZXJyZWQpIHtcbiAgcmV0dXJuIChlcnIsIHJlcykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYm9keSA9IHJlcy5kYXRhO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPj0gNDAwKSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGJvZHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYm9keSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChib2R5KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGVycm9ySGFuZGxlciAocmVzKSB7XG4gIGlmIChyZXMuZXJyb3JzICYmIHJlcy5lcnJvcnMubGVuZ3RoKSB7XG4gICAgcmVzLmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLm1lc3NhZ2UpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKHJlcy5tZXNzYWdlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKHJlcy5tZXNzYWdlKTtcbiAgfVxuXG4gIHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVBhcmFtZXRlcnMgKHBhcmFtZXRlcnMpIHtcbiAgdmFyIHJlc3VsdDtcblxuICBpZiAoIUFycmF5LmlzQXJyYXkocGFyYW1ldGVycykpIHtcbiAgICByZXN1bHQgPSBbXTtcbiAgICBPYmplY3Qua2V5cyhwYXJhbWV0ZXJzKS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIG9wdGlvbnM6IHBhcmFtZXRlcnNbbmFtZV1cbiAgICAgIH0pXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gcGFyYW1ldGVycztcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG4iXX0=
