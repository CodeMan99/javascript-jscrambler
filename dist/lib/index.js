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

              if ((typeof randomizationSeed === 'undefined' ? 'undefined' : _typeof(randomizationSeed)) !== undefined || randomizationSeed) {
                $set.randomizationSeed = JSON.stringify(randomizationSeed);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvaW5kZXguanMiXSwibmFtZXMiOlsiQ2xpZW50IiwiY29uZmlnIiwiZ2VuZXJhdGVTaWduZWRQYXJhbXMiLCJwcm90ZWN0QW5kRG93bmxvYWQiLCJjb25maWdQYXRoT3JPYmplY3QiLCJkZXN0Q2FsbGJhY2siLCJyZXF1aXJlIiwiYXBwbGljYXRpb25JZCIsImhvc3QiLCJwb3J0Iiwia2V5cyIsImZpbGVzRGVzdCIsImZpbGVzU3JjIiwiY3dkIiwicGFyYW1zIiwiYXBwbGljYXRpb25UeXBlcyIsImxhbmd1YWdlU3BlY2lmaWNhdGlvbnMiLCJzb3VyY2VNYXBzIiwicmFuZG9taXphdGlvblNlZWQiLCJhcmVTdWJzY3JpYmVyc09yZGVyZWQiLCJhY2Nlc3NLZXkiLCJzZWNyZXRLZXkiLCJjbGllbnQiLCJFcnJvciIsImxlbmd0aCIsIl9maWxlc1NyYyIsImkiLCJsIiwiY29uY2F0Iiwic3luYyIsImRvdCIsInB1c2giLCJfemlwIiwicmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uIiwicmVtb3ZlU291cmNlUmVzIiwiZXJyb3JzIiwiaGFkTm9Tb3VyY2VzIiwiZm9yRWFjaCIsImVycm9yIiwibWVzc2FnZSIsImFkZEFwcGxpY2F0aW9uU291cmNlIiwiY29udGVudCIsImdlbmVyYXRlIiwidHlwZSIsImZpbGVuYW1lIiwiZXh0ZW5zaW9uIiwiYWRkQXBwbGljYXRpb25Tb3VyY2VSZXMiLCJlcnJvckhhbmRsZXIiLCIkc2V0IiwiX2lkIiwiT2JqZWN0IiwicGFyYW1ldGVycyIsIkpTT04iLCJzdHJpbmdpZnkiLCJub3JtYWxpemVQYXJhbWV0ZXJzIiwiQXJyYXkiLCJpc0FycmF5IiwidW5kZWZpbmVkIiwidXBkYXRlQXBwbGljYXRpb24iLCJ1cGRhdGVBcHBsaWNhdGlvblJlcyIsImNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbiIsImNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcyIsInByb3RlY3Rpb25JZCIsImRhdGEiLCJwb2xsUHJvdGVjdGlvbiIsImRvd25sb2FkQXBwbGljYXRpb25Qcm90ZWN0aW9uIiwiZG93bmxvYWQiLCJjb25zb2xlIiwibG9nIiwiZG93bmxvYWRTb3VyY2VNYXBzIiwiY29uZmlncyIsImRvd25sb2FkU291cmNlTWFwc1JlcXVlc3QiLCJkZWZlcnJlZCIsImRlZmVyIiwicG9sbCIsImdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbiIsImFwcGxpY2F0aW9uUHJvdGVjdGlvbiIsInN0YXRlIiwic2V0VGltZW91dCIsInVybCIsInJlamVjdCIsInJlc29sdmUiLCJwcm9taXNlIiwiY3JlYXRlQXBwbGljYXRpb24iLCJmcmFnbWVudHMiLCJwb3N0IiwicmVzcG9uc2VIYW5kbGVyIiwiZHVwbGljYXRlQXBwbGljYXRpb24iLCJyZW1vdmVBcHBsaWNhdGlvbiIsImlkIiwicmVtb3ZlUHJvdGVjdGlvbiIsImFwcElkIiwiY2FuY2VsUHJvdGVjdGlvbiIsImFwcGxpY2F0aW9uIiwidW5sb2NrQXBwbGljYXRpb24iLCJnZXRBcHBsaWNhdGlvbiIsImdldCIsImdldEFwcGxpY2F0aW9uU291cmNlIiwic291cmNlSWQiLCJsaW1pdHMiLCJnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zIiwiZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50IiwiY3JlYXRlVGVtcGxhdGUiLCJ0ZW1wbGF0ZSIsInJlbW92ZVRlbXBsYXRlIiwiZ2V0VGVtcGxhdGVzIiwiZ2V0QXBwbGljYXRpb25zIiwiYXBwbGljYXRpb25Tb3VyY2UiLCJhZGRBcHBsaWNhdGlvblNvdXJjZUZyb21VUkwiLCJnZXRGaWxlRnJvbVVybCIsInRoZW4iLCJmaWxlIiwidXBkYXRlQXBwbGljYXRpb25Tb3VyY2UiLCJhcHBseVRlbXBsYXRlIiwidGVtcGxhdGVJZCIsInVwZGF0ZVRlbXBsYXRlIiwicmVzIiwiYmFzZW5hbWUiLCJleHRuYW1lIiwic3Vic3RyIiwiY2F0Y2giLCJlcnIiLCJib2R5Iiwic3RhdHVzIiwiZXgiLCJyZXN1bHQiLCJuYW1lIiwib3B0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SixDQUFVNkYsSUFBSTdFLE9BQWQsQ0FBTjtBQUNEOztBQUVELFNBQU82RSxHQUFQO0FBQ0Q7O0FBRUQsU0FBUzlELG1CQUFULENBQThCSCxVQUE5QixFQUEwQztBQUN4QyxNQUFJMEUsTUFBSjs7QUFFQSxNQUFJLENBQUN0RSxNQUFNQyxPQUFOLENBQWNMLFVBQWQsQ0FBTCxFQUFnQztBQUM5QjBFLGFBQVMsRUFBVDtBQUNBM0UsV0FBT3hDLElBQVAsQ0FBWXlDLFVBQVosRUFBd0JkLE9BQXhCLENBQWdDLFVBQUN5RixJQUFELEVBQVU7QUFDeENELGFBQU85RixJQUFQLENBQVk7QUFDVitGLGtCQURVO0FBRVZDLGlCQUFTNUUsV0FBVzJFLElBQVg7QUFGQyxPQUFaO0FBSUQsS0FMRDtBQU1ELEdBUkQsTUFRTztBQUNMRCxhQUFTMUUsVUFBVDtBQUNEOztBQUVELFNBQU8wRSxNQUFQO0FBQ0QiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ2JhYmVsLXBvbHlmaWxsJztcblxuaW1wb3J0IGdsb2IgZnJvbSAnZ2xvYic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCByZXF1ZXN0IGZyb20gJ2F4aW9zJztcbmltcG9ydCBRIGZyb20gJ3EnO1xuXG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJztcbmltcG9ydCBnZW5lcmF0ZVNpZ25lZFBhcmFtcyBmcm9tICcuL2dlbmVyYXRlLXNpZ25lZC1wYXJhbXMnO1xuaW1wb3J0IEpTY3JhbWJsZXJDbGllbnQgZnJvbSAnLi9jbGllbnQnO1xuaW1wb3J0IHtcbiAgYWRkQXBwbGljYXRpb25Tb3VyY2UsXG4gIGNyZWF0ZUFwcGxpY2F0aW9uLFxuICByZW1vdmVBcHBsaWNhdGlvbixcbiAgdXBkYXRlQXBwbGljYXRpb24sXG4gIHVwZGF0ZUFwcGxpY2F0aW9uU291cmNlLFxuICByZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24sXG4gIGNyZWF0ZVRlbXBsYXRlLFxuICByZW1vdmVUZW1wbGF0ZSxcbiAgdXBkYXRlVGVtcGxhdGUsXG4gIGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbixcbiAgcmVtb3ZlUHJvdGVjdGlvbixcbiAgY2FuY2VsUHJvdGVjdGlvbixcbiAgZHVwbGljYXRlQXBwbGljYXRpb24sXG4gIHVubG9ja0FwcGxpY2F0aW9uLFxuICBhcHBseVRlbXBsYXRlXG59IGZyb20gJy4vbXV0YXRpb25zJztcbmltcG9ydCB7XG4gIGdldEFwcGxpY2F0aW9uLFxuICBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zLFxuICBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zQ291bnQsXG4gIGdldEFwcGxpY2F0aW9ucyxcbiAgZ2V0QXBwbGljYXRpb25Tb3VyY2UsXG4gIGdldFRlbXBsYXRlcyxcbiAgZ2V0UHJvdGVjdGlvblxufSBmcm9tICcuL3F1ZXJpZXMnO1xuaW1wb3J0IHtcbiAgemlwLFxuICB1bnppcFxufSBmcm9tICcuL3ppcCc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgQ2xpZW50OiBKU2NyYW1ibGVyQ2xpZW50LFxuICBjb25maWcsXG4gIGdlbmVyYXRlU2lnbmVkUGFyYW1zLFxuICAvLyBUaGlzIG1ldGhvZCBpcyBhIHNob3J0Y3V0IG1ldGhvZCB0aGF0IGFjY2VwdHMgYW4gb2JqZWN0IHdpdGggZXZlcnl0aGluZyBuZWVkZWRcbiAgLy8gZm9yIHRoZSBlbnRpcmUgcHJvY2VzcyBvZiByZXF1ZXN0aW5nIGFuIGFwcGxpY2F0aW9uIHByb3RlY3Rpb24gYW5kIGRvd25sb2FkaW5nXG4gIC8vIHRoYXQgc2FtZSBwcm90ZWN0aW9uIHdoZW4gdGhlIHNhbWUgZW5kcy5cbiAgLy9cbiAgLy8gYGNvbmZpZ1BhdGhPck9iamVjdGAgY2FuIGJlIGEgcGF0aCB0byBhIEpTT04gb3IgZGlyZWN0bHkgYW4gb2JqZWN0IGNvbnRhaW5pbmdcbiAgLy8gdGhlIGZvbGxvd2luZyBzdHJ1Y3R1cmU6XG4gIC8vXG4gIC8vIGBgYGpzb25cbiAgLy8ge1xuICAvLyAgIFwia2V5c1wiOiB7XG4gIC8vICAgICBcImFjY2Vzc0tleVwiOiBcIlwiLFxuICAvLyAgICAgXCJzZWNyZXRLZXlcIjogXCJcIlxuICAvLyAgIH0sXG4gIC8vICAgXCJhcHBsaWNhdGlvbklkXCI6IFwiXCIsXG4gIC8vICAgXCJmaWxlc0Rlc3RcIjogXCJcIlxuICAvLyB9XG4gIC8vIGBgYFxuICAvL1xuICAvLyBBbHNvIHRoZSBmb2xsb3dpbmcgb3B0aW9uYWwgcGFyYW1ldGVycyBhcmUgYWNjZXB0ZWQ6XG4gIC8vXG4gIC8vIGBgYGpzb25cbiAgLy8ge1xuICAvLyAgIFwiZmlsZXNTcmNcIjogW1wiXCJdLFxuICAvLyAgIFwicGFyYW1zXCI6IHt9LFxuICAvLyAgIFwiY3dkXCI6IFwiXCIsXG4gIC8vICAgXCJob3N0XCI6IFwiYXBpLmpzY3JhbWJsZXIuY29tXCIsXG4gIC8vICAgXCJwb3J0XCI6IFwiNDQzXCJcbiAgLy8gfVxuICAvLyBgYGBcbiAgLy9cbiAgLy8gYGZpbGVzU3JjYCBzdXBwb3J0cyBnbG9iIHBhdHRlcm5zLCBhbmQgaWYgaXQncyBwcm92aWRlZCBpdCB3aWxsIHJlcGxhY2UgdGhlXG4gIC8vIGVudGlyZSBhcHBsaWNhdGlvbiBzb3VyY2VzLlxuICAvL1xuICAvLyBgcGFyYW1zYCBpZiBwcm92aWRlZCB3aWxsIHJlcGxhY2UgYWxsIHRoZSBhcHBsaWNhdGlvbiB0cmFuc2Zvcm1hdGlvbiBwYXJhbWV0ZXJzLlxuICAvL1xuICAvLyBgY3dkYCBhbGxvd3MgeW91IHRvIHNldCB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSB0byByZXNvbHZlIHByb2JsZW1zIHdpdGhcbiAgLy8gcmVsYXRpdmUgcGF0aHMgd2l0aCB5b3VyIGBmaWxlc1NyY2AgaXMgb3V0c2lkZSB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS5cbiAgLy9cbiAgLy8gRmluYWxseSwgYGhvc3RgIGFuZCBgcG9ydGAgY2FuIGJlIG92ZXJyaWRkZW4gaWYgeW91IHRvIGVuZ2FnZSB3aXRoIGEgZGlmZmVyZW50XG4gIC8vIGVuZHBvaW50IHRoYW4gdGhlIGRlZmF1bHQgb25lLCB1c2VmdWwgaWYgeW91J3JlIHJ1bm5pbmcgYW4gZW50ZXJwcmlzZSB2ZXJzaW9uIG9mXG4gIC8vIEpzY3JhbWJsZXIgb3IgaWYgeW91J3JlIHByb3ZpZGVkIGFjY2VzcyB0byBiZXRhIGZlYXR1cmVzIG9mIG91ciBwcm9kdWN0LlxuICAvL1xuICBhc3luYyBwcm90ZWN0QW5kRG93bmxvYWQgKGNvbmZpZ1BhdGhPck9iamVjdCwgZGVzdENhbGxiYWNrKSB7XG4gICAgY29uc3QgY29uZmlnID0gdHlwZW9mIGNvbmZpZ1BhdGhPck9iamVjdCA9PT0gJ3N0cmluZycgP1xuICAgICAgcmVxdWlyZShjb25maWdQYXRoT3JPYmplY3QpIDogY29uZmlnUGF0aE9yT2JqZWN0O1xuXG4gICAgY29uc3Qge1xuICAgICAgYXBwbGljYXRpb25JZCxcbiAgICAgIGhvc3QsXG4gICAgICBwb3J0LFxuICAgICAga2V5cyxcbiAgICAgIGZpbGVzRGVzdCxcbiAgICAgIGZpbGVzU3JjLFxuICAgICAgY3dkLFxuICAgICAgcGFyYW1zLFxuICAgICAgYXBwbGljYXRpb25UeXBlcyxcbiAgICAgIGxhbmd1YWdlU3BlY2lmaWNhdGlvbnMsXG4gICAgICBzb3VyY2VNYXBzLFxuICAgICAgcmFuZG9taXphdGlvblNlZWQsXG4gICAgICBhcmVTdWJzY3JpYmVyc09yZGVyZWRcbiAgICB9ID0gY29uZmlnO1xuXG4gICAgY29uc3Qge1xuICAgICAgYWNjZXNzS2V5LFxuICAgICAgc2VjcmV0S2V5XG4gICAgfSA9IGtleXM7XG5cbiAgICBjb25zdCBjbGllbnQgPSBuZXcgdGhpcy5DbGllbnQoe1xuICAgICAgYWNjZXNzS2V5LFxuICAgICAgc2VjcmV0S2V5LFxuICAgICAgaG9zdCxcbiAgICAgIHBvcnRcbiAgICB9KTtcblxuICAgIGlmICghYXBwbGljYXRpb25JZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXF1aXJlZCAqYXBwbGljYXRpb25JZCogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgaWYgKCFmaWxlc0Rlc3QgJiYgIWRlc3RDYWxsYmFjaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXF1aXJlZCAqZmlsZXNEZXN0KiBub3QgcHJvdmlkZWQnKTtcbiAgICB9XG5cbiAgICBpZiAoZmlsZXNTcmMgJiYgZmlsZXNTcmMubGVuZ3RoKSB7XG4gICAgICBsZXQgX2ZpbGVzU3JjID0gW107XG4gICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGZpbGVzU3JjLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgICBpZiAodHlwZW9mIGZpbGVzU3JjW2ldID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIC8vIFRPRE8gUmVwbGFjZSBgZ2xvYi5zeW5jYCB3aXRoIGFzeW5jIHZlcnNpb25cbiAgICAgICAgICBfZmlsZXNTcmMgPSBfZmlsZXNTcmMuY29uY2F0KGdsb2Iuc3luYyhmaWxlc1NyY1tpXSwge2RvdDogdHJ1ZX0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfZmlsZXNTcmMucHVzaChmaWxlc1NyY1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgX3ppcCA9IGF3YWl0IHppcChfZmlsZXNTcmMsIGN3ZCk7XG5cbiAgICAgIGNvbnN0IHJlbW92ZVNvdXJjZVJlcyA9IGF3YWl0IHRoaXMucmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uKGNsaWVudCwgJycsIGFwcGxpY2F0aW9uSWQpO1xuICAgICAgaWYgKHJlbW92ZVNvdXJjZVJlcy5lcnJvcnMpIHtcbiAgICAgICAgLy8gVE9ETyBJbXBsZW1lbnQgZXJyb3IgY29kZXMgb3IgZml4IHRoaXMgaXMgb24gdGhlIHNlcnZpY2VzXG4gICAgICAgIHZhciBoYWROb1NvdXJjZXMgPSBmYWxzZTtcbiAgICAgICAgcmVtb3ZlU291cmNlUmVzLmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvci5tZXNzYWdlID09PSAnQXBwbGljYXRpb24gU291cmNlIHdpdGggdGhlIGdpdmVuIElEIGRvZXMgbm90IGV4aXN0Jykge1xuICAgICAgICAgICAgaGFkTm9Tb3VyY2VzID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIWhhZE5vU291cmNlcykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZW1vdmVTb3VyY2VSZXMuZXJyb3JzWzBdLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFkZEFwcGxpY2F0aW9uU291cmNlUmVzID0gYXdhaXQgdGhpcy5hZGRBcHBsaWNhdGlvblNvdXJjZShjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHtcbiAgICAgICAgY29udGVudDogX3ppcC5nZW5lcmF0ZSh7dHlwZTogJ2Jhc2U2NCd9KSxcbiAgICAgICAgZmlsZW5hbWU6ICdhcHBsaWNhdGlvbi56aXAnLFxuICAgICAgICBleHRlbnNpb246ICd6aXAnXG4gICAgICB9KTtcbiAgICAgIGVycm9ySGFuZGxlcihhZGRBcHBsaWNhdGlvblNvdXJjZVJlcyk7XG4gICAgfVxuXG4gICAgY29uc3QgJHNldCA9IHtcbiAgICAgIF9pZDogYXBwbGljYXRpb25JZFxuICAgIH07XG5cbiAgICBpZiAocGFyYW1zICYmIE9iamVjdC5rZXlzKHBhcmFtcykubGVuZ3RoKSB7XG4gICAgICAkc2V0LnBhcmFtZXRlcnMgPSBKU09OLnN0cmluZ2lmeShub3JtYWxpemVQYXJhbWV0ZXJzKHBhcmFtcykpO1xuICAgICAgJHNldC5hcmVTdWJzY3JpYmVyc09yZGVyZWQgPSBBcnJheS5pc0FycmF5KHBhcmFtcyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhcmVTdWJzY3JpYmVyc09yZGVyZWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAkc2V0LmFyZVN1YnNjcmliZXJzT3JkZXJlZCA9IGFyZVN1YnNjcmliZXJzT3JkZXJlZDtcbiAgICB9XG5cbiAgICBpZiAoYXBwbGljYXRpb25UeXBlcykge1xuICAgICAgJHNldC5hcHBsaWNhdGlvblR5cGVzID0gYXBwbGljYXRpb25UeXBlcztcbiAgICB9XG5cbiAgICBpZiAobGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucykge1xuICAgICAgJHNldC5sYW5ndWFnZVNwZWNpZmljYXRpb25zID0gbGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucztcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHNvdXJjZU1hcHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgJHNldC5zb3VyY2VNYXBzID0gSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwcyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiByYW5kb21pemF0aW9uU2VlZCAhPT0gdW5kZWZpbmVkIHx8IHJhbmRvbWl6YXRpb25TZWVkKSB7XG4gICAgICAkc2V0LnJhbmRvbWl6YXRpb25TZWVkID0gSlNPTi5zdHJpbmdpZnkocmFuZG9taXphdGlvblNlZWQpO1xuICAgIH1cblxuICAgIGlmICgkc2V0LnBhcmFtZXRlcnMgfHwgJHNldC5hcHBsaWNhdGlvblR5cGVzIHx8ICRzZXQubGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucyB8fFxuICAgICAgICB0eXBlb2YgJHNldC5hcmVTdWJzY3JpYmVyc09yZGVyZWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjb25zdCB1cGRhdGVBcHBsaWNhdGlvblJlcyA9IGF3YWl0IHRoaXMudXBkYXRlQXBwbGljYXRpb24oY2xpZW50LCAkc2V0KTtcbiAgICAgIGVycm9ySGFuZGxlcih1cGRhdGVBcHBsaWNhdGlvblJlcyk7XG4gICAgfVxuXG4gICAgY29uc3QgY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uUmVzID0gYXdhaXQgdGhpcy5jcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24oY2xpZW50LCBhcHBsaWNhdGlvbklkKTtcbiAgICBlcnJvckhhbmRsZXIoY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uUmVzKTtcblxuICAgIGNvbnN0IHByb3RlY3Rpb25JZCA9IGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcy5kYXRhLmNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbi5faWQ7XG4gICAgYXdhaXQgdGhpcy5wb2xsUHJvdGVjdGlvbihjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHByb3RlY3Rpb25JZCk7XG5cbiAgICBjb25zdCBkb3dubG9hZCA9IGF3YWl0IHRoaXMuZG93bmxvYWRBcHBsaWNhdGlvblByb3RlY3Rpb24oY2xpZW50LCBwcm90ZWN0aW9uSWQpO1xuICAgIGVycm9ySGFuZGxlcihkb3dubG9hZCk7XG4gICAgdW56aXAoZG93bmxvYWQsIGZpbGVzRGVzdCB8fCBkZXN0Q2FsbGJhY2spO1xuICAgIGNvbnNvbGUubG9nKHByb3RlY3Rpb25JZCk7XG4gIH0sXG5cbiAgYXN5bmMgZG93bmxvYWRTb3VyY2VNYXBzIChjb25maWdzLCBkZXN0Q2FsbGJhY2spIHtcbiAgICBjb25zdCB7XG4gICAgICBrZXlzLFxuICAgICAgaG9zdCxcbiAgICAgIHBvcnQsXG4gICAgICBmaWxlc0Rlc3QsXG4gICAgICBmaWxlc1NyYyxcbiAgICAgIHByb3RlY3Rpb25JZFxuICAgIH0gPSBjb25maWdzO1xuXG4gICAgY29uc3Qge1xuICAgICAgYWNjZXNzS2V5LFxuICAgICAgc2VjcmV0S2V5XG4gICAgfSA9IGtleXM7XG5cbiAgICBjb25zdCBjbGllbnQgPSBuZXcgdGhpcy5DbGllbnQoe1xuICAgICAgYWNjZXNzS2V5LFxuICAgICAgc2VjcmV0S2V5LFxuICAgICAgaG9zdCxcbiAgICAgIHBvcnRcbiAgICB9KTtcblxuICAgIGlmICghZmlsZXNEZXN0ICYmICFkZXN0Q2FsbGJhY2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKmZpbGVzRGVzdCogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgaWYgKCFwcm90ZWN0aW9uSWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKnByb3RlY3Rpb25JZCogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG5cbiAgICBpZiAoZmlsZXNTcmMpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdbV2FybmluZ10gSWdub3Jpbmcgc291cmNlcyBzdXBwbGllZC4gRG93bmxvYWRpbmcgc291cmNlIG1hcHMgb2YgZ2l2ZW4gcHJvdGVjdGlvbicpO1xuICAgIH1cbiAgICBsZXQgZG93bmxvYWQ7XG4gICAgdHJ5IHtcbiAgICAgIGRvd25sb2FkID0gYXdhaXQgdGhpcy5kb3dubG9hZFNvdXJjZU1hcHNSZXF1ZXN0KGNsaWVudCwgcHJvdGVjdGlvbklkKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBlcnJvckhhbmRsZXIoZSk7XG4gICAgfVxuICAgIHVuemlwKGRvd25sb2FkLCBmaWxlc0Rlc3QgfHwgZGVzdENhbGxiYWNrKTtcbiAgfSxcblxuICBhc3luYyBwb2xsUHJvdGVjdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcblxuICAgIGNvbnN0IHBvbGwgPSBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBhcHBsaWNhdGlvblByb3RlY3Rpb24gPSBhd2FpdCB0aGlzLmdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbihjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHByb3RlY3Rpb25JZCk7XG4gICAgICBpZiAoYXBwbGljYXRpb25Qcm90ZWN0aW9uLmVycm9ycykge1xuICAgICAgICBjb25zb2xlLmxvZygnRXJyb3IgcG9sbGluZyBwcm90ZWN0aW9uJywgYXBwbGljYXRpb25Qcm90ZWN0aW9uLmVycm9ycyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3IgcG9sbGluZyBwcm90ZWN0aW9uJyk7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdCgnRXJyb3IgcG9sbGluZyBwcm90ZWN0aW9uJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IGFwcGxpY2F0aW9uUHJvdGVjdGlvbi5kYXRhLmFwcGxpY2F0aW9uUHJvdGVjdGlvbi5zdGF0ZTtcbiAgICAgICAgaWYgKHN0YXRlICE9PSAnZmluaXNoZWQnICYmIHN0YXRlICE9PSAnZXJyb3JlZCcpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KHBvbGwsIDUwMCk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09ICdlcnJvcmVkJykge1xuICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL2FwcC5qc2NyYW1ibGVyLmNvbS9hcHAvJHthcHBsaWNhdGlvbklkfS9wcm90ZWN0aW9ucy8ke3Byb3RlY3Rpb25JZH1gO1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdChgUHJvdGVjdGlvbiBmYWlsZWQuIEZvciBtb3JlIGluZm9ybWF0aW9uIHZpc2l0OiAke3VybH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcG9sbCgpO1xuXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGNyZWF0ZUFwcGxpY2F0aW9uIChjbGllbnQsIGRhdGEsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBjcmVhdGVBcHBsaWNhdGlvbihkYXRhLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZHVwbGljYXRlQXBwbGljYXRpb24gKGNsaWVudCwgZGF0YSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGR1cGxpY2F0ZUFwcGxpY2F0aW9uKGRhdGEsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyByZW1vdmVBcHBsaWNhdGlvbiAoY2xpZW50LCBpZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCByZW1vdmVBcHBsaWNhdGlvbihpZCksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyByZW1vdmVQcm90ZWN0aW9uIChjbGllbnQsIGlkLCBhcHBJZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHJlbW92ZVByb3RlY3Rpb24oaWQsIGFwcElkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgY2FuY2VsUHJvdGVjdGlvbiAoY2xpZW50LCBpZCwgYXBwSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBjYW5jZWxQcm90ZWN0aW9uKGlkLCBhcHBJZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHVwZGF0ZUFwcGxpY2F0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgdXBkYXRlQXBwbGljYXRpb24oYXBwbGljYXRpb24sIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyB1bmxvY2tBcHBsaWNhdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbiwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHVubG9ja0FwcGxpY2F0aW9uKGFwcGxpY2F0aW9uLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb24oYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uU291cmNlIChjbGllbnQsIHNvdXJjZUlkLCBmcmFnbWVudHMsIGxpbWl0cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9uU291cmNlKHNvdXJjZUlkLCBmcmFnbWVudHMsIGxpbWl0cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHBhcmFtcywgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9ucyhhcHBsaWNhdGlvbklkLCBwYXJhbXMsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zQ291bnQgKGNsaWVudCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50KGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBjcmVhdGVUZW1wbGF0ZSAoY2xpZW50LCB0ZW1wbGF0ZSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGNyZWF0ZVRlbXBsYXRlKHRlbXBsYXRlLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgcmVtb3ZlVGVtcGxhdGUgKGNsaWVudCwgaWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgcmVtb3ZlVGVtcGxhdGUoaWQpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0VGVtcGxhdGVzIChjbGllbnQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldFRlbXBsYXRlcyhmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25zIChjbGllbnQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9ucyhmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgYWRkQXBwbGljYXRpb25Tb3VyY2UgKGNsaWVudCwgYXBwbGljYXRpb25JZCwgYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBhZGRBcHBsaWNhdGlvblNvdXJjZShhcHBsaWNhdGlvbklkLCBhcHBsaWNhdGlvblNvdXJjZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGFkZEFwcGxpY2F0aW9uU291cmNlRnJvbVVSTCAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCB1cmwsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIHJldHVybiBnZXRGaWxlRnJvbVVybChjbGllbnQsIHVybClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGFkZEFwcGxpY2F0aW9uU291cmNlKGFwcGxpY2F0aW9uSWQsIGZpbGUsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgIH0pO1xuICB9LFxuICAvL1xuICBhc3luYyB1cGRhdGVBcHBsaWNhdGlvblNvdXJjZSAoY2xpZW50LCBhcHBsaWNhdGlvblNvdXJjZSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHVwZGF0ZUFwcGxpY2F0aW9uU291cmNlKGFwcGxpY2F0aW9uU291cmNlLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgcmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uIChjbGllbnQsIHNvdXJjZUlkLCBhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgcmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uKHNvdXJjZUlkLCBhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgYXBwbHlUZW1wbGF0ZSAoY2xpZW50LCB0ZW1wbGF0ZUlkLCBhcHBJZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGFwcGx5VGVtcGxhdGUodGVtcGxhdGVJZCwgYXBwSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyB1cGRhdGVUZW1wbGF0ZSAoY2xpZW50LCB0ZW1wbGF0ZSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHVwZGF0ZVRlbXBsYXRlKHRlbXBsYXRlLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24oYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldFByb3RlY3Rpb24oYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZG93bmxvYWRTb3VyY2VNYXBzUmVxdWVzdCAoY2xpZW50LCBwcm90ZWN0aW9uSWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KGAvYXBwbGljYXRpb24vc291cmNlTWFwcy8ke3Byb3RlY3Rpb25JZH1gLCBudWxsLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpLCBmYWxzZSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGRvd25sb2FkQXBwbGljYXRpb25Qcm90ZWN0aW9uIChjbGllbnQsIHByb3RlY3Rpb25JZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoYC9hcHBsaWNhdGlvbi9kb3dubG9hZC8ke3Byb3RlY3Rpb25JZH1gLCBudWxsLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpLCBmYWxzZSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGdldEZpbGVGcm9tVXJsIChjbGllbnQsIHVybCkge1xuICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgdmFyIGZpbGU7XG4gIHJlcXVlc3QuZ2V0KHVybClcbiAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICBmaWxlID0ge1xuICAgICAgICBjb250ZW50OiByZXMuZGF0YSxcbiAgICAgICAgZmlsZW5hbWU6IHBhdGguYmFzZW5hbWUodXJsKSxcbiAgICAgICAgZXh0ZW5zaW9uOiBwYXRoLmV4dG5hbWUodXJsKS5zdWJzdHIoMSlcbiAgICAgIH07XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGZpbGUpO1xuICAgIH0pXG4gICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xuICAgIH0pO1xuICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxuZnVuY3Rpb24gcmVzcG9uc2VIYW5kbGVyIChkZWZlcnJlZCkge1xuICByZXR1cm4gKGVyciwgcmVzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgZGVmZXJyZWQucmVqZWN0KGVycik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBib2R5ID0gcmVzLmRhdGE7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAocmVzLnN0YXR1cyA+PSA0MDApIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoYm9keSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShib2R5KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGJvZHkpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZXJyb3JIYW5kbGVyIChyZXMpIHtcbiAgaWYgKHJlcy5lcnJvcnMgJiYgcmVzLmVycm9ycy5sZW5ndGgpIHtcbiAgICByZXMuZXJyb3JzLmZvckVhY2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSk7XG4gICAgfSk7XG4gIH1cblxuICBpZiAocmVzLm1lc3NhZ2UpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IocmVzLm1lc3NhZ2UpO1xuICB9XG5cbiAgcmV0dXJuIHJlcztcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplUGFyYW1ldGVycyAocGFyYW1ldGVycykge1xuICB2YXIgcmVzdWx0O1xuXG4gIGlmICghQXJyYXkuaXNBcnJheShwYXJhbWV0ZXJzKSkge1xuICAgIHJlc3VsdCA9IFtdO1xuICAgIE9iamVjdC5rZXlzKHBhcmFtZXRlcnMpLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgb3B0aW9uczogcGFyYW1ldGVyc1tuYW1lXVxuICAgICAgfSlcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSBwYXJhbWV0ZXJzO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdfQ==
