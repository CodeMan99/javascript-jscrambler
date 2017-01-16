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
      var config, applicationId, host, port, keys, filesDest, filesSrc, cwd, params, applicationTypes, languageSpecifications, sourceMaps, randomizationSeed, areSubscribersOrdered, accessKey, secretKey, client, _filesSrc, i, l, _zip, removeSourceRes, hadNoSources, addApplicationSourceRes, $set, updateApplicationRes, createApplicationProtectionRes, protectionId, download;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              config = typeof configPathOrObject === 'string' ? require(configPathOrObject) : configPathOrObject;
              applicationId = config.applicationId, host = config.host, port = config.port, keys = config.keys, filesDest = config.filesDest, filesSrc = config.filesSrc, cwd = config.cwd, params = config.params, applicationTypes = config.applicationTypes, languageSpecifications = config.languageSpecifications, sourceMaps = config.sourceMaps, randomizationSeed = config.randomizationSeed, areSubscribersOrdered = config.areSubscribersOrdered;
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

              if (languageSpecifications) {
                $set.languageSpecifications = languageSpecifications;
              }

              if ((typeof sourceMaps === 'undefined' ? 'undefined' : _typeof(sourceMaps)) !== undefined) {
                $set.sourceMaps = JSON.stringify(sourceMaps);
              }

              if (!($set.parameters || $set.applicationTypes || $set.languageSpecifications || typeof $set.areSubscribersOrdered !== 'undefined')) {
                _context.next = 37;
                break;
              }

              _context.next = 35;
              return _this.updateApplication(client, $set);

            case 35:
              updateApplicationRes = _context.sent;

              errorHandler(updateApplicationRes);

            case 37:
              _context.next = 39;
              return _this.createApplicationProtection(client, applicationId, {}, randomizationSeed);

            case 39:
              createApplicationProtectionRes = _context.sent;

              errorHandler(createApplicationProtectionRes);

              protectionId = createApplicationProtectionRes.data.createApplicationProtection._id;
              _context.next = 44;
              return _this.pollProtection(client, applicationId, protectionId);

            case 44:
              _context.next = 46;
              return _this.downloadApplicationProtection(client, protectionId);

            case 46:
              download = _context.sent;

              errorHandler(download);
              (0, _zip2.unzip)(download, filesDest || destCallback);
              console.log(protectionId);

            case 50:
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvaW5kZXguanMiXSwibmFtZXMiOlsiQ2xpZW50IiwiY29uZmlnIiwiZ2VuZXJhdGVTaWduZWRQYXJhbXMiLCJwcm90ZWN0QW5kRG93bmxvYWQiLCJjb25maWdQYXRoT3JPYmplY3QiLCJkZXN0Q2FsbGJhY2siLCJyZXF1aXJlIiwiYXBwbGljYXRpb25JZCIsImhvc3QiLCJwb3J0Iiwia2V5cyIsImZpbGVzRGVzdCIsImZpbGVzU3JjIiwiY3dkIiwicGFyYW1zIiwiYXBwbGljYXRpb25UeXBlcyIsImxhbmd1YWdlU3BlY2lmaWNhdGlvbnMiLCJzb3VyY2VNYXBzIiwicmFuZG9taXphdGlvblNlZWQiLCJhcmVTdWJzY3JpYmVyc09yZGVyZWQiLCJhY2Nlc3NLZXkiLCJzZWNyZXRLZXkiLCJjbGllbnQiLCJFcnJvciIsImxlbmd0aCIsIl9maWxlc1NyYyIsImkiLCJsIiwiY29uY2F0Iiwic3luYyIsImRvdCIsInB1c2giLCJfemlwIiwicmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uIiwicmVtb3ZlU291cmNlUmVzIiwiZXJyb3JzIiwiaGFkTm9Tb3VyY2VzIiwiZm9yRWFjaCIsImVycm9yIiwibWVzc2FnZSIsImFkZEFwcGxpY2F0aW9uU291cmNlIiwiY29udGVudCIsImdlbmVyYXRlIiwidHlwZSIsImZpbGVuYW1lIiwiZXh0ZW5zaW9uIiwiYWRkQXBwbGljYXRpb25Tb3VyY2VSZXMiLCJlcnJvckhhbmRsZXIiLCIkc2V0IiwiX2lkIiwiT2JqZWN0IiwicGFyYW1ldGVycyIsIkpTT04iLCJzdHJpbmdpZnkiLCJub3JtYWxpemVQYXJhbWV0ZXJzIiwiQXJyYXkiLCJpc0FycmF5IiwidW5kZWZpbmVkIiwidXBkYXRlQXBwbGljYXRpb24iLCJ1cGRhdGVBcHBsaWNhdGlvblJlcyIsImNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbiIsImNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcyIsInByb3RlY3Rpb25JZCIsImRhdGEiLCJwb2xsUHJvdGVjdGlvbiIsImRvd25sb2FkQXBwbGljYXRpb25Qcm90ZWN0aW9uIiwiZG93bmxvYWQiLCJjb25zb2xlIiwibG9nIiwiZG93bmxvYWRTb3VyY2VNYXBzIiwiY29uZmlncyIsImRvd25sb2FkU291cmNlTWFwc1JlcXVlc3QiLCJkZWZlcnJlZCIsImRlZmVyIiwicG9sbCIsImdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbiIsImFwcGxpY2F0aW9uUHJvdGVjdGlvbiIsInN0YXRlIiwic2V0VGltZW91dCIsInVybCIsInJlamVjdCIsInJlc29sdmUiLCJwcm9taXNlIiwiY3JlYXRlQXBwbGljYXRpb24iLCJmcmFnbWVudHMiLCJwb3N0IiwicmVzcG9uc2VIYW5kbGVyIiwiZHVwbGljYXRlQXBwbGljYXRpb24iLCJyZW1vdmVBcHBsaWNhdGlvbiIsImlkIiwicmVtb3ZlUHJvdGVjdGlvbiIsImFwcElkIiwiY2FuY2VsUHJvdGVjdGlvbiIsImFwcGxpY2F0aW9uIiwidW5sb2NrQXBwbGljYXRpb24iLCJnZXRBcHBsaWNhdGlvbiIsImdldCIsImdldEFwcGxpY2F0aW9uU291cmNlIiwic291cmNlSWQiLCJsaW1pdHMiLCJnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zIiwiZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50IiwiY3JlYXRlVGVtcGxhdGUiLCJ0ZW1wbGF0ZSIsInJlbW92ZVRlbXBsYXRlIiwiZ2V0VGVtcGxhdGVzIiwiZ2V0QXBwbGljYXRpb25zIiwiYXBwbGljYXRpb25Tb3VyY2UiLCJhZGRBcHBsaWNhdGlvblNvdXJjZUZyb21VUkwiLCJnZXRGaWxlRnJvbVVybCIsInRoZW4iLCJmaWxlIiwidXBkYXRlQXBwbGljYXRpb25Tb3VyY2UiLCJhcHBseVRlbXBsYXRlIiwidGVtcGxhdGVJZCIsInVwZGF0ZVRlbXBsYXRlIiwicmVzIiwiYmFzZW5hbWUiLCJleHRuYW1lIiwic3Vic3RyIiwiY2F0Y2giLCJlcnIiLCJib2R5Iiwic3RhdHVzIiwiZXgiLCJyZXN1bHQiLCJuYW1lIiwib3B0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QkgsVUFBOUIsRUFBMEM7QUFDeEMsTUFBSTBFLE1BQUo7O0FBRUEsTUFBSSxDQUFDdEUsTUFBTUMsT0FBTixDQUFjTCxVQUFkLENBQUwsRUFBZ0M7QUFDOUIwRSxhQUFTLEVBQVQ7QUFDQTNFLFdBQU94QyxJQUFQLENBQVl5QyxVQUFaLEVBQXdCZCxPQUF4QixDQUFnQyxVQUFDeUYsSUFBRCxFQUFVO0FBQ3hDRCxhQUFPOUYsSUFBUCxDQUFZO0FBQ1YrRixrQkFEVTtBQUVWQyxpQkFBUzVFLFdBQVcyRSxJQUFYO0FBRkMsT0FBWjtBQUlELEtBTEQ7QUFNRCxHQVJELE1BUU87QUFDTEQsYUFBUzFFLFVBQVQ7QUFDRDs7QUFFRCxTQUFPMEUsTUFBUDtBQUNEIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICdiYWJlbC1wb2x5ZmlsbCc7XG5cbmltcG9ydCBnbG9iIGZyb20gJ2dsb2InO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgcmVxdWVzdCBmcm9tICdheGlvcyc7XG5pbXBvcnQgUSBmcm9tICdxJztcblxuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgZ2VuZXJhdGVTaWduZWRQYXJhbXMgZnJvbSAnLi9nZW5lcmF0ZS1zaWduZWQtcGFyYW1zJztcbmltcG9ydCBKU2NyYW1ibGVyQ2xpZW50IGZyb20gJy4vY2xpZW50JztcbmltcG9ydCB7XG4gIGFkZEFwcGxpY2F0aW9uU291cmNlLFxuICBjcmVhdGVBcHBsaWNhdGlvbixcbiAgcmVtb3ZlQXBwbGljYXRpb24sXG4gIHVwZGF0ZUFwcGxpY2F0aW9uLFxuICB1cGRhdGVBcHBsaWNhdGlvblNvdXJjZSxcbiAgcmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uLFxuICBjcmVhdGVUZW1wbGF0ZSxcbiAgcmVtb3ZlVGVtcGxhdGUsXG4gIHVwZGF0ZVRlbXBsYXRlLFxuICBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24sXG4gIHJlbW92ZVByb3RlY3Rpb24sXG4gIGNhbmNlbFByb3RlY3Rpb24sXG4gIGR1cGxpY2F0ZUFwcGxpY2F0aW9uLFxuICB1bmxvY2tBcHBsaWNhdGlvbixcbiAgYXBwbHlUZW1wbGF0ZVxufSBmcm9tICcuL211dGF0aW9ucyc7XG5pbXBvcnQge1xuICBnZXRBcHBsaWNhdGlvbixcbiAgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9ucyxcbiAgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50LFxuICBnZXRBcHBsaWNhdGlvbnMsXG4gIGdldEFwcGxpY2F0aW9uU291cmNlLFxuICBnZXRUZW1wbGF0ZXMsXG4gIGdldFByb3RlY3Rpb25cbn0gZnJvbSAnLi9xdWVyaWVzJztcbmltcG9ydCB7XG4gIHppcCxcbiAgdW56aXBcbn0gZnJvbSAnLi96aXAnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIENsaWVudDogSlNjcmFtYmxlckNsaWVudCxcbiAgY29uZmlnLFxuICBnZW5lcmF0ZVNpZ25lZFBhcmFtcyxcbiAgLy8gVGhpcyBtZXRob2QgaXMgYSBzaG9ydGN1dCBtZXRob2QgdGhhdCBhY2NlcHRzIGFuIG9iamVjdCB3aXRoIGV2ZXJ5dGhpbmcgbmVlZGVkXG4gIC8vIGZvciB0aGUgZW50aXJlIHByb2Nlc3Mgb2YgcmVxdWVzdGluZyBhbiBhcHBsaWNhdGlvbiBwcm90ZWN0aW9uIGFuZCBkb3dubG9hZGluZ1xuICAvLyB0aGF0IHNhbWUgcHJvdGVjdGlvbiB3aGVuIHRoZSBzYW1lIGVuZHMuXG4gIC8vXG4gIC8vIGBjb25maWdQYXRoT3JPYmplY3RgIGNhbiBiZSBhIHBhdGggdG8gYSBKU09OIG9yIGRpcmVjdGx5IGFuIG9iamVjdCBjb250YWluaW5nXG4gIC8vIHRoZSBmb2xsb3dpbmcgc3RydWN0dXJlOlxuICAvL1xuICAvLyBgYGBqc29uXG4gIC8vIHtcbiAgLy8gICBcImtleXNcIjoge1xuICAvLyAgICAgXCJhY2Nlc3NLZXlcIjogXCJcIixcbiAgLy8gICAgIFwic2VjcmV0S2V5XCI6IFwiXCJcbiAgLy8gICB9LFxuICAvLyAgIFwiYXBwbGljYXRpb25JZFwiOiBcIlwiLFxuICAvLyAgIFwiZmlsZXNEZXN0XCI6IFwiXCJcbiAgLy8gfVxuICAvLyBgYGBcbiAgLy9cbiAgLy8gQWxzbyB0aGUgZm9sbG93aW5nIG9wdGlvbmFsIHBhcmFtZXRlcnMgYXJlIGFjY2VwdGVkOlxuICAvL1xuICAvLyBgYGBqc29uXG4gIC8vIHtcbiAgLy8gICBcImZpbGVzU3JjXCI6IFtcIlwiXSxcbiAgLy8gICBcInBhcmFtc1wiOiB7fSxcbiAgLy8gICBcImN3ZFwiOiBcIlwiLFxuICAvLyAgIFwiaG9zdFwiOiBcImFwaS5qc2NyYW1ibGVyLmNvbVwiLFxuICAvLyAgIFwicG9ydFwiOiBcIjQ0M1wiXG4gIC8vIH1cbiAgLy8gYGBgXG4gIC8vXG4gIC8vIGBmaWxlc1NyY2Agc3VwcG9ydHMgZ2xvYiBwYXR0ZXJucywgYW5kIGlmIGl0J3MgcHJvdmlkZWQgaXQgd2lsbCByZXBsYWNlIHRoZVxuICAvLyBlbnRpcmUgYXBwbGljYXRpb24gc291cmNlcy5cbiAgLy9cbiAgLy8gYHBhcmFtc2AgaWYgcHJvdmlkZWQgd2lsbCByZXBsYWNlIGFsbCB0aGUgYXBwbGljYXRpb24gdHJhbnNmb3JtYXRpb24gcGFyYW1ldGVycy5cbiAgLy9cbiAgLy8gYGN3ZGAgYWxsb3dzIHlvdSB0byBzZXQgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgdG8gcmVzb2x2ZSBwcm9ibGVtcyB3aXRoXG4gIC8vIHJlbGF0aXZlIHBhdGhzIHdpdGggeW91ciBgZmlsZXNTcmNgIGlzIG91dHNpZGUgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuXG4gIC8vXG4gIC8vIEZpbmFsbHksIGBob3N0YCBhbmQgYHBvcnRgIGNhbiBiZSBvdmVycmlkZGVuIGlmIHlvdSB0byBlbmdhZ2Ugd2l0aCBhIGRpZmZlcmVudFxuICAvLyBlbmRwb2ludCB0aGFuIHRoZSBkZWZhdWx0IG9uZSwgdXNlZnVsIGlmIHlvdSdyZSBydW5uaW5nIGFuIGVudGVycHJpc2UgdmVyc2lvbiBvZlxuICAvLyBKc2NyYW1ibGVyIG9yIGlmIHlvdSdyZSBwcm92aWRlZCBhY2Nlc3MgdG8gYmV0YSBmZWF0dXJlcyBvZiBvdXIgcHJvZHVjdC5cbiAgLy9cbiAgYXN5bmMgcHJvdGVjdEFuZERvd25sb2FkIChjb25maWdQYXRoT3JPYmplY3QsIGRlc3RDYWxsYmFjaykge1xuICAgIGNvbnN0IGNvbmZpZyA9IHR5cGVvZiBjb25maWdQYXRoT3JPYmplY3QgPT09ICdzdHJpbmcnID9cbiAgICAgIHJlcXVpcmUoY29uZmlnUGF0aE9yT2JqZWN0KSA6IGNvbmZpZ1BhdGhPck9iamVjdDtcblxuICAgIGNvbnN0IHtcbiAgICAgIGFwcGxpY2F0aW9uSWQsXG4gICAgICBob3N0LFxuICAgICAgcG9ydCxcbiAgICAgIGtleXMsXG4gICAgICBmaWxlc0Rlc3QsXG4gICAgICBmaWxlc1NyYyxcbiAgICAgIGN3ZCxcbiAgICAgIHBhcmFtcyxcbiAgICAgIGFwcGxpY2F0aW9uVHlwZXMsXG4gICAgICBsYW5ndWFnZVNwZWNpZmljYXRpb25zLFxuICAgICAgc291cmNlTWFwcyxcbiAgICAgIHJhbmRvbWl6YXRpb25TZWVkLFxuICAgICAgYXJlU3Vic2NyaWJlcnNPcmRlcmVkXG4gICAgfSA9IGNvbmZpZztcblxuICAgIGNvbnN0IHtcbiAgICAgIGFjY2Vzc0tleSxcbiAgICAgIHNlY3JldEtleVxuICAgIH0gPSBrZXlzO1xuXG4gICAgY29uc3QgY2xpZW50ID0gbmV3IHRoaXMuQ2xpZW50KHtcbiAgICAgIGFjY2Vzc0tleSxcbiAgICAgIHNlY3JldEtleSxcbiAgICAgIGhvc3QsXG4gICAgICBwb3J0XG4gICAgfSk7XG5cbiAgICBpZiAoIWFwcGxpY2F0aW9uSWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKmFwcGxpY2F0aW9uSWQqIG5vdCBwcm92aWRlZCcpO1xuICAgIH1cblxuICAgIGlmICghZmlsZXNEZXN0ICYmICFkZXN0Q2FsbGJhY2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKmZpbGVzRGVzdCogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgaWYgKGZpbGVzU3JjICYmIGZpbGVzU3JjLmxlbmd0aCkge1xuICAgICAgbGV0IF9maWxlc1NyYyA9IFtdO1xuICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBmaWxlc1NyYy5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBmaWxlc1NyY1tpXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAvLyBUT0RPIFJlcGxhY2UgYGdsb2Iuc3luY2Agd2l0aCBhc3luYyB2ZXJzaW9uXG4gICAgICAgICAgX2ZpbGVzU3JjID0gX2ZpbGVzU3JjLmNvbmNhdChnbG9iLnN5bmMoZmlsZXNTcmNbaV0sIHtkb3Q6IHRydWV9KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX2ZpbGVzU3JjLnB1c2goZmlsZXNTcmNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IF96aXAgPSBhd2FpdCB6aXAoX2ZpbGVzU3JjLCBjd2QpO1xuXG4gICAgICBjb25zdCByZW1vdmVTb3VyY2VSZXMgPSBhd2FpdCB0aGlzLnJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbihjbGllbnQsICcnLCBhcHBsaWNhdGlvbklkKTtcbiAgICAgIGlmIChyZW1vdmVTb3VyY2VSZXMuZXJyb3JzKSB7XG4gICAgICAgIC8vIFRPRE8gSW1wbGVtZW50IGVycm9yIGNvZGVzIG9yIGZpeCB0aGlzIGlzIG9uIHRoZSBzZXJ2aWNlc1xuICAgICAgICB2YXIgaGFkTm9Tb3VyY2VzID0gZmFsc2U7XG4gICAgICAgIHJlbW92ZVNvdXJjZVJlcy5lcnJvcnMuZm9yRWFjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICBpZiAoZXJyb3IubWVzc2FnZSA9PT0gJ0FwcGxpY2F0aW9uIFNvdXJjZSB3aXRoIHRoZSBnaXZlbiBJRCBkb2VzIG5vdCBleGlzdCcpIHtcbiAgICAgICAgICAgIGhhZE5vU291cmNlcyA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFoYWROb1NvdXJjZXMpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVtb3ZlU291cmNlUmVzLmVycm9yc1swXS5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBhZGRBcHBsaWNhdGlvblNvdXJjZVJlcyA9IGF3YWl0IHRoaXMuYWRkQXBwbGljYXRpb25Tb3VyY2UoY2xpZW50LCBhcHBsaWNhdGlvbklkLCB7XG4gICAgICAgIGNvbnRlbnQ6IF96aXAuZ2VuZXJhdGUoe3R5cGU6ICdiYXNlNjQnfSksXG4gICAgICAgIGZpbGVuYW1lOiAnYXBwbGljYXRpb24uemlwJyxcbiAgICAgICAgZXh0ZW5zaW9uOiAnemlwJ1xuICAgICAgfSk7XG4gICAgICBlcnJvckhhbmRsZXIoYWRkQXBwbGljYXRpb25Tb3VyY2VSZXMpO1xuICAgIH1cblxuICAgIGNvbnN0ICRzZXQgPSB7XG4gICAgICBfaWQ6IGFwcGxpY2F0aW9uSWRcbiAgICB9O1xuXG4gICAgaWYgKHBhcmFtcyAmJiBPYmplY3Qua2V5cyhwYXJhbXMpLmxlbmd0aCkge1xuICAgICAgJHNldC5wYXJhbWV0ZXJzID0gSlNPTi5zdHJpbmdpZnkobm9ybWFsaXplUGFyYW1ldGVycyhwYXJhbXMpKTtcbiAgICAgICRzZXQuYXJlU3Vic2NyaWJlcnNPcmRlcmVkID0gQXJyYXkuaXNBcnJheShwYXJhbXMpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYXJlU3Vic2NyaWJlcnNPcmRlcmVkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgJHNldC5hcmVTdWJzY3JpYmVyc09yZGVyZWQgPSBhcmVTdWJzY3JpYmVyc09yZGVyZWQ7XG4gICAgfVxuXG4gICAgaWYgKGFwcGxpY2F0aW9uVHlwZXMpIHtcbiAgICAgICRzZXQuYXBwbGljYXRpb25UeXBlcyA9IGFwcGxpY2F0aW9uVHlwZXM7XG4gICAgfVxuXG4gICAgaWYgKGxhbmd1YWdlU3BlY2lmaWNhdGlvbnMpIHtcbiAgICAgICRzZXQubGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucyA9IGxhbmd1YWdlU3BlY2lmaWNhdGlvbnM7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBzb3VyY2VNYXBzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICRzZXQuc291cmNlTWFwcyA9IEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcHMpO1xuICAgIH1cblxuICAgIGlmICgkc2V0LnBhcmFtZXRlcnMgfHwgJHNldC5hcHBsaWNhdGlvblR5cGVzIHx8ICRzZXQubGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucyB8fFxuICAgICAgICB0eXBlb2YgJHNldC5hcmVTdWJzY3JpYmVyc09yZGVyZWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjb25zdCB1cGRhdGVBcHBsaWNhdGlvblJlcyA9IGF3YWl0IHRoaXMudXBkYXRlQXBwbGljYXRpb24oY2xpZW50LCAkc2V0KTtcbiAgICAgIGVycm9ySGFuZGxlcih1cGRhdGVBcHBsaWNhdGlvblJlcyk7XG4gICAgfVxuXG4gICAgY29uc3QgY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uUmVzID0gYXdhaXQgdGhpcy5jcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24oY2xpZW50LCBhcHBsaWNhdGlvbklkLCB7fSwgcmFuZG9taXphdGlvblNlZWQpO1xuICAgIGVycm9ySGFuZGxlcihjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb25SZXMpO1xuXG4gICAgY29uc3QgcHJvdGVjdGlvbklkID0gY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uUmVzLmRhdGEuY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uLl9pZDtcbiAgICBhd2FpdCB0aGlzLnBvbGxQcm90ZWN0aW9uKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkKTtcblxuICAgIGNvbnN0IGRvd25sb2FkID0gYXdhaXQgdGhpcy5kb3dubG9hZEFwcGxpY2F0aW9uUHJvdGVjdGlvbihjbGllbnQsIHByb3RlY3Rpb25JZCk7XG4gICAgZXJyb3JIYW5kbGVyKGRvd25sb2FkKTtcbiAgICB1bnppcChkb3dubG9hZCwgZmlsZXNEZXN0IHx8IGRlc3RDYWxsYmFjayk7XG4gICAgY29uc29sZS5sb2cocHJvdGVjdGlvbklkKTtcbiAgfSxcblxuICBhc3luYyBkb3dubG9hZFNvdXJjZU1hcHMgKGNvbmZpZ3MsIGRlc3RDYWxsYmFjaykge1xuICAgIGNvbnN0IHtcbiAgICAgIGtleXMsXG4gICAgICBob3N0LFxuICAgICAgcG9ydCxcbiAgICAgIGZpbGVzRGVzdCxcbiAgICAgIGZpbGVzU3JjLFxuICAgICAgcHJvdGVjdGlvbklkXG4gICAgfSA9IGNvbmZpZ3M7XG5cbiAgICBjb25zdCB7XG4gICAgICBhY2Nlc3NLZXksXG4gICAgICBzZWNyZXRLZXlcbiAgICB9ID0ga2V5cztcblxuICAgIGNvbnN0IGNsaWVudCA9IG5ldyB0aGlzLkNsaWVudCh7XG4gICAgICBhY2Nlc3NLZXksXG4gICAgICBzZWNyZXRLZXksXG4gICAgICBob3N0LFxuICAgICAgcG9ydFxuICAgIH0pO1xuXG4gICAgaWYgKCFmaWxlc0Rlc3QgJiYgIWRlc3RDYWxsYmFjaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXF1aXJlZCAqZmlsZXNEZXN0KiBub3QgcHJvdmlkZWQnKTtcbiAgICB9XG5cbiAgICBpZiAoIXByb3RlY3Rpb25JZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXF1aXJlZCAqcHJvdGVjdGlvbklkKiBub3QgcHJvdmlkZWQnKTtcbiAgICB9XG5cblxuICAgIGlmIChmaWxlc1NyYykge1xuICAgICAgY29uc29sZS5sb2coJ1tXYXJuaW5nXSBJZ25vcmluZyBzb3VyY2VzIHN1cHBsaWVkLiBEb3dubG9hZGluZyBzb3VyY2UgbWFwcyBvZiBnaXZlbiBwcm90ZWN0aW9uJyk7XG4gICAgfVxuICAgIGxldCBkb3dubG9hZDtcbiAgICB0cnkge1xuICAgICAgZG93bmxvYWQgPSBhd2FpdCB0aGlzLmRvd25sb2FkU291cmNlTWFwc1JlcXVlc3QoY2xpZW50LCBwcm90ZWN0aW9uSWQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGVycm9ySGFuZGxlcihlKTtcbiAgICB9XG4gICAgdW56aXAoZG93bmxvYWQsIGZpbGVzRGVzdCB8fCBkZXN0Q2FsbGJhY2spO1xuICB9LFxuXG4gIGFzeW5jIHBvbGxQcm90ZWN0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHByb3RlY3Rpb25JZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuXG4gICAgY29uc3QgcG9sbCA9IGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGFwcGxpY2F0aW9uUHJvdGVjdGlvbiA9IGF3YWl0IHRoaXMuZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkKTtcbiAgICAgIGlmIChhcHBsaWNhdGlvblByb3RlY3Rpb24uZXJyb3JzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdFcnJvciBwb2xsaW5nIHByb3RlY3Rpb24nLCBhcHBsaWNhdGlvblByb3RlY3Rpb24uZXJyb3JzKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciBwb2xsaW5nIHByb3RlY3Rpb24nKTtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdFcnJvciBwb2xsaW5nIHByb3RlY3Rpb24nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gYXBwbGljYXRpb25Qcm90ZWN0aW9uLmRhdGEuYXBwbGljYXRpb25Qcm90ZWN0aW9uLnN0YXRlO1xuICAgICAgICBpZiAoc3RhdGUgIT09ICdmaW5pc2hlZCcgJiYgc3RhdGUgIT09ICdlcnJvcmVkJykge1xuICAgICAgICAgIHNldFRpbWVvdXQocG9sbCwgNTAwKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gJ2Vycm9yZWQnKSB7XG4gICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vYXBwLmpzY3JhbWJsZXIuY29tL2FwcC8ke2FwcGxpY2F0aW9uSWR9L3Byb3RlY3Rpb25zLyR7cHJvdGVjdGlvbklkfWA7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGBQcm90ZWN0aW9uIGZhaWxlZC4gRm9yIG1vcmUgaW5mb3JtYXRpb24gdmlzaXQ6ICR7dXJsfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBwb2xsKCk7XG5cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgY3JlYXRlQXBwbGljYXRpb24gKGNsaWVudCwgZGF0YSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGNyZWF0ZUFwcGxpY2F0aW9uKGRhdGEsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBkdXBsaWNhdGVBcHBsaWNhdGlvbiAoY2xpZW50LCBkYXRhLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgZHVwbGljYXRlQXBwbGljYXRpb24oZGF0YSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHJlbW92ZUFwcGxpY2F0aW9uIChjbGllbnQsIGlkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHJlbW92ZUFwcGxpY2F0aW9uKGlkKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHJlbW92ZVByb3RlY3Rpb24gKGNsaWVudCwgaWQsIGFwcElkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgcmVtb3ZlUHJvdGVjdGlvbihpZCwgYXBwSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBjYW5jZWxQcm90ZWN0aW9uIChjbGllbnQsIGlkLCBhcHBJZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGNhbmNlbFByb3RlY3Rpb24oaWQsIGFwcElkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgdXBkYXRlQXBwbGljYXRpb24gKGNsaWVudCwgYXBwbGljYXRpb24sIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCB1cGRhdGVBcHBsaWNhdGlvbihhcHBsaWNhdGlvbiwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHVubG9ja0FwcGxpY2F0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgdW5sb2NrQXBwbGljYXRpb24oYXBwbGljYXRpb24sIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvbihhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25Tb3VyY2UgKGNsaWVudCwgc291cmNlSWQsIGZyYWdtZW50cywgbGltaXRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb25Tb3VyY2Uoc291cmNlSWQsIGZyYWdtZW50cywgbGltaXRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnMgKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcGFyYW1zLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zKGFwcGxpY2F0aW9uSWQsIHBhcmFtcywgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudCAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zQ291bnQoYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGNyZWF0ZVRlbXBsYXRlIChjbGllbnQsIHRlbXBsYXRlLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgY3JlYXRlVGVtcGxhdGUodGVtcGxhdGUsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyByZW1vdmVUZW1wbGF0ZSAoY2xpZW50LCBpZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCByZW1vdmVUZW1wbGF0ZShpZCksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRUZW1wbGF0ZXMgKGNsaWVudCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0VGVtcGxhdGVzKGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvbnMgKGNsaWVudCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb25zKGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBhZGRBcHBsaWNhdGlvblNvdXJjZSAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBhcHBsaWNhdGlvblNvdXJjZSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGFkZEFwcGxpY2F0aW9uU291cmNlKGFwcGxpY2F0aW9uSWQsIGFwcGxpY2F0aW9uU291cmNlLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgYWRkQXBwbGljYXRpb25Tb3VyY2VGcm9tVVJMIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHVybCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgcmV0dXJuIGdldEZpbGVGcm9tVXJsKGNsaWVudCwgdXJsKVxuICAgICAgLnRoZW4oZnVuY3Rpb24oZmlsZSkge1xuICAgICAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgYWRkQXBwbGljYXRpb25Tb3VyY2UoYXBwbGljYXRpb25JZCwgZmlsZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgfSk7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHVwZGF0ZUFwcGxpY2F0aW9uU291cmNlIChjbGllbnQsIGFwcGxpY2F0aW9uU291cmNlLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgdXBkYXRlQXBwbGljYXRpb25Tb3VyY2UoYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyByZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24gKGNsaWVudCwgc291cmNlSWQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCByZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24oc291cmNlSWQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBhcHBseVRlbXBsYXRlIChjbGllbnQsIHRlbXBsYXRlSWQsIGFwcElkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgYXBwbHlUZW1wbGF0ZSh0ZW1wbGF0ZUlkLCBhcHBJZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHVwZGF0ZVRlbXBsYXRlIChjbGllbnQsIHRlbXBsYXRlLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgdXBkYXRlVGVtcGxhdGUodGVtcGxhdGUsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzLCByYW5kb21pemF0aW9uU2VlZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24oYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzLCByYW5kb21pemF0aW9uU2VlZCksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRQcm90ZWN0aW9uKGFwcGxpY2F0aW9uSWQsIHByb3RlY3Rpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGRvd25sb2FkU291cmNlTWFwc1JlcXVlc3QgKGNsaWVudCwgcHJvdGVjdGlvbklkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldChgL2FwcGxpY2F0aW9uL3NvdXJjZU1hcHMvJHtwcm90ZWN0aW9uSWR9YCwgbnVsbCwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSwgZmFsc2UpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBkb3dubG9hZEFwcGxpY2F0aW9uUHJvdGVjdGlvbiAoY2xpZW50LCBwcm90ZWN0aW9uSWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KGAvYXBwbGljYXRpb24vZG93bmxvYWQvJHtwcm90ZWN0aW9uSWR9YCwgbnVsbCwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSwgZmFsc2UpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9XG59O1xuXG5mdW5jdGlvbiBnZXRGaWxlRnJvbVVybCAoY2xpZW50LCB1cmwpIHtcbiAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gIHZhciBmaWxlO1xuICByZXF1ZXN0LmdldCh1cmwpXG4gICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgZmlsZSA9IHtcbiAgICAgICAgY29udGVudDogcmVzLmRhdGEsXG4gICAgICAgIGZpbGVuYW1lOiBwYXRoLmJhc2VuYW1lKHVybCksXG4gICAgICAgIGV4dGVuc2lvbjogcGF0aC5leHRuYW1lKHVybCkuc3Vic3RyKDEpXG4gICAgICB9O1xuICAgICAgZGVmZXJyZWQucmVzb2x2ZShmaWxlKTtcbiAgICB9KVxuICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcbiAgICB9KTtcbiAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cbmZ1bmN0aW9uIHJlc3BvbnNlSGFuZGxlciAoZGVmZXJyZWQpIHtcbiAgcmV0dXJuIChlcnIsIHJlcykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYm9keSA9IHJlcy5kYXRhO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPj0gNDAwKSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGJvZHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYm9keSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChib2R5KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGVycm9ySGFuZGxlciAocmVzKSB7XG4gIGlmIChyZXMuZXJyb3JzICYmIHJlcy5lcnJvcnMubGVuZ3RoKSB7XG4gICAgcmVzLmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLm1lc3NhZ2UpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKHJlcy5tZXNzYWdlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKHJlcy5tZXNzYWdlKTtcbiAgfVxuXG4gIHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVBhcmFtZXRlcnMgKHBhcmFtZXRlcnMpIHtcbiAgdmFyIHJlc3VsdDtcblxuICBpZiAoIUFycmF5LmlzQXJyYXkocGFyYW1ldGVycykpIHtcbiAgICByZXN1bHQgPSBbXTtcbiAgICBPYmplY3Qua2V5cyhwYXJhbWV0ZXJzKS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIG9wdGlvbnM6IHBhcmFtZXRlcnNbbmFtZV1cbiAgICAgIH0pXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gcGFyYW1ldGVycztcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG4iXX0=
