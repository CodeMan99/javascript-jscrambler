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
      var config, applicationId, host, port, keys, filesDest, filesSrc, cwd, params, applicationTypes, languageSpecifications, sourceMaps, areSubscribersOrdered, accessKey, secretKey, client, _filesSrc, i, l, _zip, removeSourceRes, hadNoSources, addApplicationSourceRes, $set, updateApplicationRes, createApplicationProtectionRes, protectionId, download;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              config = typeof configPathOrObject === 'string' ? require(configPathOrObject) : configPathOrObject;
              applicationId = config.applicationId, host = config.host, port = config.port, keys = config.keys, filesDest = config.filesDest, filesSrc = config.filesSrc, cwd = config.cwd, params = config.params, applicationTypes = config.applicationTypes, languageSpecifications = config.languageSpecifications, sourceMaps = config.sourceMaps, areSubscribersOrdered = config.areSubscribersOrdered;
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
              return _this.createApplicationProtection(client, applicationId);

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

            case 49:
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

              _context2.next = 10;
              return _this2.downloadSourceMapsRequest(client, protectionId);

            case 10:
              download = _context2.sent;

              errorHandler(download);
              (0, _zip2.unzip)(download, filesDest || destCallback);

            case 13:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this2);
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
  updateApplication: function updateApplication(client, application, fragments) {
    var _this8 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee9() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.updateApplication)(application, fragments), responseHandler(deferred));
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
  unlockApplication: function unlockApplication(client, application, fragments) {
    var _this9 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee10() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.unlockApplication)(application, fragments), responseHandler(deferred));
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
  getApplication: function getApplication(client, applicationId, fragments) {
    var _this10 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee11() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application', (0, _queries.getApplication)(applicationId, fragments), responseHandler(deferred));
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
  getApplicationSource: function getApplicationSource(client, sourceId, fragments, limits) {
    var _this11 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee12() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application', (0, _queries.getApplicationSource)(sourceId, fragments, limits), responseHandler(deferred));
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
  getApplicationProtections: function getApplicationProtections(client, applicationId, params, fragments) {
    var _this12 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee13() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application', (0, _queries.getApplicationProtections)(applicationId, params, fragments), responseHandler(deferred));
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
  getApplicationProtectionsCount: function getApplicationProtectionsCount(client, applicationId, fragments) {
    var _this13 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee14() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee14$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application', (0, _queries.getApplicationProtectionsCount)(applicationId, fragments), responseHandler(deferred));
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
  createTemplate: function createTemplate(client, template, fragments) {
    var _this14 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee15() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee15$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.createTemplate)(template, fragments), responseHandler(deferred));
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
  removeTemplate: function removeTemplate(client, id) {
    var _this15 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee16() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee16$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.removeTemplate)(id), responseHandler(deferred));
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
  getTemplates: function getTemplates(client, fragments) {
    var _this16 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee17() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee17$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application', (0, _queries.getTemplates)(fragments), responseHandler(deferred));
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
  getApplications: function getApplications(client, fragments) {
    var _this17 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee18() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee18$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application', (0, _queries.getApplications)(fragments), responseHandler(deferred));
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
  addApplicationSource: function addApplicationSource(client, applicationId, applicationSource, fragments) {
    var _this18 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee19() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee19$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.addApplicationSource)(applicationId, applicationSource, fragments), responseHandler(deferred));
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
  addApplicationSourceFromURL: function addApplicationSourceFromURL(client, applicationId, url, fragments) {
    var _this19 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee20() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee20$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              deferred = _q2.default.defer();
              return _context20.abrupt('return', getFileFromUrl(client, url).then(function (file) {
                client.post('/application', (0, _mutations.addApplicationSource)(applicationId, file, fragments), responseHandler(deferred));
                return deferred.promise;
              }));

            case 2:
            case 'end':
              return _context20.stop();
          }
        }
      }, _callee20, _this19);
    }))();
  },

  //
  updateApplicationSource: function updateApplicationSource(client, applicationSource, fragments) {
    var _this20 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee21() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee21$(_context21) {
        while (1) {
          switch (_context21.prev = _context21.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.updateApplicationSource)(applicationSource, fragments), responseHandler(deferred));
              return _context21.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context21.stop();
          }
        }
      }, _callee21, _this20);
    }))();
  },

  //
  removeSourceFromApplication: function removeSourceFromApplication(client, sourceId, applicationId, fragments) {
    var _this21 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee22() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee22$(_context22) {
        while (1) {
          switch (_context22.prev = _context22.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.removeSourceFromApplication)(sourceId, applicationId, fragments), responseHandler(deferred));
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
  applyTemplate: function applyTemplate(client, templateId, appId, fragments) {
    var _this22 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee23() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee23$(_context23) {
        while (1) {
          switch (_context23.prev = _context23.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.applyTemplate)(templateId, appId, fragments), responseHandler(deferred));
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
  updateTemplate: function updateTemplate(client, template, fragments) {
    var _this23 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee24() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee24$(_context24) {
        while (1) {
          switch (_context24.prev = _context24.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.updateTemplate)(template, fragments), responseHandler(deferred));
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
  createApplicationProtection: function createApplicationProtection(client, applicationId, fragments) {
    var _this24 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee25() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee25$(_context25) {
        while (1) {
          switch (_context25.prev = _context25.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.createApplicationProtection)(applicationId, fragments), responseHandler(deferred));
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
  getApplicationProtection: function getApplicationProtection(client, applicationId, protectionId, fragments) {
    var _this25 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee26() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee26$(_context26) {
        while (1) {
          switch (_context26.prev = _context26.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application', (0, _queries.getProtection)(applicationId, protectionId, fragments), responseHandler(deferred));
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
  downloadSourceMapsRequest: function downloadSourceMapsRequest(client, protectionId) {
    var _this26 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee27() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee27$(_context27) {
        while (1) {
          switch (_context27.prev = _context27.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application/sourceMaps/' + protectionId, null, responseHandler(deferred), false);
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
  downloadApplicationProtection: function downloadApplicationProtection(client, protectionId) {
    var _this27 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee28() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee28$(_context28) {
        while (1) {
          switch (_context28.prev = _context28.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application/download/' + protectionId, null, responseHandler(deferred), false);
              return _context28.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context28.stop();
          }
        }
      }, _callee28, _this27);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvaW5kZXguanMiXSwibmFtZXMiOlsiQ2xpZW50IiwiY29uZmlnIiwiZ2VuZXJhdGVTaWduZWRQYXJhbXMiLCJwcm90ZWN0QW5kRG93bmxvYWQiLCJjb25maWdQYXRoT3JPYmplY3QiLCJkZXN0Q2FsbGJhY2siLCJyZXF1aXJlIiwiYXBwbGljYXRpb25JZCIsImhvc3QiLCJwb3J0Iiwia2V5cyIsImZpbGVzRGVzdCIsImZpbGVzU3JjIiwiY3dkIiwicGFyYW1zIiwiYXBwbGljYXRpb25UeXBlcyIsImxhbmd1YWdlU3BlY2lmaWNhdGlvbnMiLCJzb3VyY2VNYXBzIiwiYXJlU3Vic2NyaWJlcnNPcmRlcmVkIiwiYWNjZXNzS2V5Iiwic2VjcmV0S2V5IiwiY2xpZW50IiwiRXJyb3IiLCJsZW5ndGgiLCJfZmlsZXNTcmMiLCJpIiwibCIsImNvbmNhdCIsInN5bmMiLCJkb3QiLCJwdXNoIiwiX3ppcCIsInJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbiIsInJlbW92ZVNvdXJjZVJlcyIsImVycm9ycyIsImhhZE5vU291cmNlcyIsImZvckVhY2giLCJlcnJvciIsIm1lc3NhZ2UiLCJhZGRBcHBsaWNhdGlvblNvdXJjZSIsImNvbnRlbnQiLCJnZW5lcmF0ZSIsInR5cGUiLCJmaWxlbmFtZSIsImV4dGVuc2lvbiIsImFkZEFwcGxpY2F0aW9uU291cmNlUmVzIiwiZXJyb3JIYW5kbGVyIiwiJHNldCIsIl9pZCIsIk9iamVjdCIsInBhcmFtZXRlcnMiLCJKU09OIiwic3RyaW5naWZ5Iiwibm9ybWFsaXplUGFyYW1ldGVycyIsIkFycmF5IiwiaXNBcnJheSIsInVuZGVmaW5lZCIsInVwZGF0ZUFwcGxpY2F0aW9uIiwidXBkYXRlQXBwbGljYXRpb25SZXMiLCJjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24iLCJjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb25SZXMiLCJwcm90ZWN0aW9uSWQiLCJkYXRhIiwicG9sbFByb3RlY3Rpb24iLCJkb3dubG9hZEFwcGxpY2F0aW9uUHJvdGVjdGlvbiIsImRvd25sb2FkIiwiZG93bmxvYWRTb3VyY2VNYXBzIiwiY29uZmlncyIsImNvbnNvbGUiLCJsb2ciLCJkb3dubG9hZFNvdXJjZU1hcHNSZXF1ZXN0IiwiZGVmZXJyZWQiLCJkZWZlciIsInBvbGwiLCJnZXRBcHBsaWNhdGlvblByb3RlY3Rpb24iLCJhcHBsaWNhdGlvblByb3RlY3Rpb24iLCJzdGF0ZSIsInNldFRpbWVvdXQiLCJ1cmwiLCJyZWplY3QiLCJyZXNvbHZlIiwicHJvbWlzZSIsImNyZWF0ZUFwcGxpY2F0aW9uIiwiZnJhZ21lbnRzIiwicG9zdCIsInJlc3BvbnNlSGFuZGxlciIsImR1cGxpY2F0ZUFwcGxpY2F0aW9uIiwicmVtb3ZlQXBwbGljYXRpb24iLCJpZCIsInJlbW92ZVByb3RlY3Rpb24iLCJhcHBJZCIsImFwcGxpY2F0aW9uIiwidW5sb2NrQXBwbGljYXRpb24iLCJnZXRBcHBsaWNhdGlvbiIsImdldCIsImdldEFwcGxpY2F0aW9uU291cmNlIiwic291cmNlSWQiLCJsaW1pdHMiLCJnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zIiwiZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50IiwiY3JlYXRlVGVtcGxhdGUiLCJ0ZW1wbGF0ZSIsInJlbW92ZVRlbXBsYXRlIiwiZ2V0VGVtcGxhdGVzIiwiZ2V0QXBwbGljYXRpb25zIiwiYXBwbGljYXRpb25Tb3VyY2UiLCJhZGRBcHBsaWNhdGlvblNvdXJjZUZyb21VUkwiLCJnZXRGaWxlRnJvbVVybCIsInRoZW4iLCJmaWxlIiwidXBkYXRlQXBwbGljYXRpb25Tb3VyY2UiLCJhcHBseVRlbXBsYXRlIiwidGVtcGxhdGVJZCIsInVwZGF0ZVRlbXBsYXRlIiwicmVzIiwiYmFzZW5hbWUiLCJleHRuYW1lIiwic3Vic3RyIiwiY2F0Y2giLCJlcnIiLCJib2R5Iiwic3RhdHVzIiwiZXgiLCJyZXN1bHQiLCJuYW1lIiwib3B0aW9ucyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7QUFFQTs7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LFNBQVMxRSxZQUFULENBQXVCb0UsR0FBdkIsRUFBNEI7QUFDMUIsTUFBSUEsSUFBSWhGLE1BQUosSUFBY2dGLElBQUloRixNQUFKLENBQVdYLE1BQTdCLEVBQXFDO0FBQ25DMkYsUUFBSWhGLE1BQUosQ0FBV0UsT0FBWCxDQUFtQixVQUFVQyxLQUFWLEVBQWlCO0FBQ2xDLFlBQU0sSUFBSWYsS0FBSixDQUFVZSxNQUFNQyxPQUFoQixDQUFOO0FBQ0QsS0FGRDtBQUdEOztBQUVELFNBQU80RSxHQUFQO0FBQ0Q7O0FBRUQsU0FBUzdELG1CQUFULENBQThCSCxVQUE5QixFQUEwQztBQUN4QyxNQUFJeUUsTUFBSjs7QUFFQSxNQUFJLENBQUNyRSxNQUFNQyxPQUFOLENBQWNMLFVBQWQsQ0FBTCxFQUFnQztBQUM5QnlFLGFBQVMsRUFBVDtBQUNBMUUsV0FBT3ZDLElBQVAsQ0FBWXdDLFVBQVosRUFBd0JkLE9BQXhCLENBQWdDLFVBQUN3RixJQUFELEVBQVU7QUFDeENELGFBQU83RixJQUFQLENBQVk7QUFDVjhGLGtCQURVO0FBRVZDLGlCQUFTM0UsV0FBVzBFLElBQVg7QUFGQyxPQUFaO0FBSUQsS0FMRDtBQU1ELEdBUkQsTUFRTztBQUNMRCxhQUFTekUsVUFBVDtBQUNEOztBQUVELFNBQU95RSxNQUFQO0FBQ0QiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ2JhYmVsLXBvbHlmaWxsJztcblxuaW1wb3J0IGdsb2IgZnJvbSAnZ2xvYic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCByZXF1ZXN0IGZyb20gJ2F4aW9zJztcbmltcG9ydCBRIGZyb20gJ3EnO1xuXG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJztcbmltcG9ydCBnZW5lcmF0ZVNpZ25lZFBhcmFtcyBmcm9tICcuL2dlbmVyYXRlLXNpZ25lZC1wYXJhbXMnO1xuaW1wb3J0IEpTY3JhbWJsZXJDbGllbnQgZnJvbSAnLi9jbGllbnQnO1xuaW1wb3J0IHtcbiAgYWRkQXBwbGljYXRpb25Tb3VyY2UsXG4gIGNyZWF0ZUFwcGxpY2F0aW9uLFxuICByZW1vdmVBcHBsaWNhdGlvbixcbiAgdXBkYXRlQXBwbGljYXRpb24sXG4gIHVwZGF0ZUFwcGxpY2F0aW9uU291cmNlLFxuICByZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24sXG4gIGNyZWF0ZVRlbXBsYXRlLFxuICByZW1vdmVUZW1wbGF0ZSxcbiAgdXBkYXRlVGVtcGxhdGUsXG4gIGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbixcbiAgcmVtb3ZlUHJvdGVjdGlvbixcbiAgZHVwbGljYXRlQXBwbGljYXRpb24sXG4gIHVubG9ja0FwcGxpY2F0aW9uLFxuICBhcHBseVRlbXBsYXRlXG59IGZyb20gJy4vbXV0YXRpb25zJztcbmltcG9ydCB7XG4gIGdldEFwcGxpY2F0aW9uLFxuICBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zLFxuICBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zQ291bnQsXG4gIGdldEFwcGxpY2F0aW9ucyxcbiAgZ2V0QXBwbGljYXRpb25Tb3VyY2UsXG4gIGdldFRlbXBsYXRlcyxcbiAgZ2V0UHJvdGVjdGlvblxufSBmcm9tICcuL3F1ZXJpZXMnO1xuaW1wb3J0IHtcbiAgemlwLFxuICB1bnppcFxufSBmcm9tICcuL3ppcCc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgQ2xpZW50OiBKU2NyYW1ibGVyQ2xpZW50LFxuICBjb25maWcsXG4gIGdlbmVyYXRlU2lnbmVkUGFyYW1zLFxuICAvLyBUaGlzIG1ldGhvZCBpcyBhIHNob3J0Y3V0IG1ldGhvZCB0aGF0IGFjY2VwdHMgYW4gb2JqZWN0IHdpdGggZXZlcnl0aGluZyBuZWVkZWRcbiAgLy8gZm9yIHRoZSBlbnRpcmUgcHJvY2VzcyBvZiByZXF1ZXN0aW5nIGFuIGFwcGxpY2F0aW9uIHByb3RlY3Rpb24gYW5kIGRvd25sb2FkaW5nXG4gIC8vIHRoYXQgc2FtZSBwcm90ZWN0aW9uIHdoZW4gdGhlIHNhbWUgZW5kcy5cbiAgLy9cbiAgLy8gYGNvbmZpZ1BhdGhPck9iamVjdGAgY2FuIGJlIGEgcGF0aCB0byBhIEpTT04gb3IgZGlyZWN0bHkgYW4gb2JqZWN0IGNvbnRhaW5pbmdcbiAgLy8gdGhlIGZvbGxvd2luZyBzdHJ1Y3R1cmU6XG4gIC8vXG4gIC8vIGBgYGpzb25cbiAgLy8ge1xuICAvLyAgIFwia2V5c1wiOiB7XG4gIC8vICAgICBcImFjY2Vzc0tleVwiOiBcIlwiLFxuICAvLyAgICAgXCJzZWNyZXRLZXlcIjogXCJcIlxuICAvLyAgIH0sXG4gIC8vICAgXCJhcHBsaWNhdGlvbklkXCI6IFwiXCIsXG4gIC8vICAgXCJmaWxlc0Rlc3RcIjogXCJcIlxuICAvLyB9XG4gIC8vIGBgYFxuICAvL1xuICAvLyBBbHNvIHRoZSBmb2xsb3dpbmcgb3B0aW9uYWwgcGFyYW1ldGVycyBhcmUgYWNjZXB0ZWQ6XG4gIC8vXG4gIC8vIGBgYGpzb25cbiAgLy8ge1xuICAvLyAgIFwiZmlsZXNTcmNcIjogW1wiXCJdLFxuICAvLyAgIFwicGFyYW1zXCI6IHt9LFxuICAvLyAgIFwiY3dkXCI6IFwiXCIsXG4gIC8vICAgXCJob3N0XCI6IFwiYXBpLmpzY3JhbWJsZXIuY29tXCIsXG4gIC8vICAgXCJwb3J0XCI6IFwiNDQzXCJcbiAgLy8gfVxuICAvLyBgYGBcbiAgLy9cbiAgLy8gYGZpbGVzU3JjYCBzdXBwb3J0cyBnbG9iIHBhdHRlcm5zLCBhbmQgaWYgaXQncyBwcm92aWRlZCBpdCB3aWxsIHJlcGxhY2UgdGhlXG4gIC8vIGVudGlyZSBhcHBsaWNhdGlvbiBzb3VyY2VzLlxuICAvL1xuICAvLyBgcGFyYW1zYCBpZiBwcm92aWRlZCB3aWxsIHJlcGxhY2UgYWxsIHRoZSBhcHBsaWNhdGlvbiB0cmFuc2Zvcm1hdGlvbiBwYXJhbWV0ZXJzLlxuICAvL1xuICAvLyBgY3dkYCBhbGxvd3MgeW91IHRvIHNldCB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSB0byByZXNvbHZlIHByb2JsZW1zIHdpdGhcbiAgLy8gcmVsYXRpdmUgcGF0aHMgd2l0aCB5b3VyIGBmaWxlc1NyY2AgaXMgb3V0c2lkZSB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS5cbiAgLy9cbiAgLy8gRmluYWxseSwgYGhvc3RgIGFuZCBgcG9ydGAgY2FuIGJlIG92ZXJyaWRkZW4gaWYgeW91IHRvIGVuZ2FnZSB3aXRoIGEgZGlmZmVyZW50XG4gIC8vIGVuZHBvaW50IHRoYW4gdGhlIGRlZmF1bHQgb25lLCB1c2VmdWwgaWYgeW91J3JlIHJ1bm5pbmcgYW4gZW50ZXJwcmlzZSB2ZXJzaW9uIG9mXG4gIC8vIEpzY3JhbWJsZXIgb3IgaWYgeW91J3JlIHByb3ZpZGVkIGFjY2VzcyB0byBiZXRhIGZlYXR1cmVzIG9mIG91ciBwcm9kdWN0LlxuICAvL1xuICBhc3luYyBwcm90ZWN0QW5kRG93bmxvYWQgKGNvbmZpZ1BhdGhPck9iamVjdCwgZGVzdENhbGxiYWNrKSB7XG4gICAgY29uc3QgY29uZmlnID0gdHlwZW9mIGNvbmZpZ1BhdGhPck9iamVjdCA9PT0gJ3N0cmluZycgP1xuICAgICAgcmVxdWlyZShjb25maWdQYXRoT3JPYmplY3QpIDogY29uZmlnUGF0aE9yT2JqZWN0O1xuXG4gICAgY29uc3Qge1xuICAgICAgYXBwbGljYXRpb25JZCxcbiAgICAgIGhvc3QsXG4gICAgICBwb3J0LFxuICAgICAga2V5cyxcbiAgICAgIGZpbGVzRGVzdCxcbiAgICAgIGZpbGVzU3JjLFxuICAgICAgY3dkLFxuICAgICAgcGFyYW1zLFxuICAgICAgYXBwbGljYXRpb25UeXBlcyxcbiAgICAgIGxhbmd1YWdlU3BlY2lmaWNhdGlvbnMsXG4gICAgICBzb3VyY2VNYXBzLFxuICAgICAgYXJlU3Vic2NyaWJlcnNPcmRlcmVkXG4gICAgfSA9IGNvbmZpZztcblxuICAgIGNvbnN0IHtcbiAgICAgIGFjY2Vzc0tleSxcbiAgICAgIHNlY3JldEtleVxuICAgIH0gPSBrZXlzO1xuXG4gICAgY29uc3QgY2xpZW50ID0gbmV3IHRoaXMuQ2xpZW50KHtcbiAgICAgIGFjY2Vzc0tleSxcbiAgICAgIHNlY3JldEtleSxcbiAgICAgIGhvc3QsXG4gICAgICBwb3J0XG4gICAgfSk7XG5cbiAgICBpZiAoIWFwcGxpY2F0aW9uSWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKmFwcGxpY2F0aW9uSWQqIG5vdCBwcm92aWRlZCcpO1xuICAgIH1cblxuICAgIGlmICghZmlsZXNEZXN0ICYmICFkZXN0Q2FsbGJhY2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKmZpbGVzRGVzdCogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgaWYgKGZpbGVzU3JjICYmIGZpbGVzU3JjLmxlbmd0aCkge1xuICAgICAgbGV0IF9maWxlc1NyYyA9IFtdO1xuICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBmaWxlc1NyYy5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBmaWxlc1NyY1tpXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAvLyBUT0RPIFJlcGxhY2UgYGdsb2Iuc3luY2Agd2l0aCBhc3luYyB2ZXJzaW9uXG4gICAgICAgICAgX2ZpbGVzU3JjID0gX2ZpbGVzU3JjLmNvbmNhdChnbG9iLnN5bmMoZmlsZXNTcmNbaV0sIHtkb3Q6IHRydWV9KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX2ZpbGVzU3JjLnB1c2goZmlsZXNTcmNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IF96aXAgPSBhd2FpdCB6aXAoX2ZpbGVzU3JjLCBjd2QpO1xuXG4gICAgICBjb25zdCByZW1vdmVTb3VyY2VSZXMgPSBhd2FpdCB0aGlzLnJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbihjbGllbnQsICcnLCBhcHBsaWNhdGlvbklkKTtcbiAgICAgIGlmIChyZW1vdmVTb3VyY2VSZXMuZXJyb3JzKSB7XG4gICAgICAgIC8vIFRPRE8gSW1wbGVtZW50IGVycm9yIGNvZGVzIG9yIGZpeCB0aGlzIGlzIG9uIHRoZSBzZXJ2aWNlc1xuICAgICAgICB2YXIgaGFkTm9Tb3VyY2VzID0gZmFsc2U7XG4gICAgICAgIHJlbW92ZVNvdXJjZVJlcy5lcnJvcnMuZm9yRWFjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICBpZiAoZXJyb3IubWVzc2FnZSA9PT0gJ0FwcGxpY2F0aW9uIFNvdXJjZSB3aXRoIHRoZSBnaXZlbiBJRCBkb2VzIG5vdCBleGlzdCcpIHtcbiAgICAgICAgICAgIGhhZE5vU291cmNlcyA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFoYWROb1NvdXJjZXMpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVtb3ZlU291cmNlUmVzLmVycm9yc1swXS5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBhZGRBcHBsaWNhdGlvblNvdXJjZVJlcyA9IGF3YWl0IHRoaXMuYWRkQXBwbGljYXRpb25Tb3VyY2UoY2xpZW50LCBhcHBsaWNhdGlvbklkLCB7XG4gICAgICAgIGNvbnRlbnQ6IF96aXAuZ2VuZXJhdGUoe3R5cGU6ICdiYXNlNjQnfSksXG4gICAgICAgIGZpbGVuYW1lOiAnYXBwbGljYXRpb24uemlwJyxcbiAgICAgICAgZXh0ZW5zaW9uOiAnemlwJ1xuICAgICAgfSk7XG4gICAgICBlcnJvckhhbmRsZXIoYWRkQXBwbGljYXRpb25Tb3VyY2VSZXMpO1xuICAgIH1cblxuICAgIGNvbnN0ICRzZXQgPSB7XG4gICAgICBfaWQ6IGFwcGxpY2F0aW9uSWRcbiAgICB9O1xuXG4gICAgaWYgKHBhcmFtcyAmJiBPYmplY3Qua2V5cyhwYXJhbXMpLmxlbmd0aCkge1xuICAgICAgJHNldC5wYXJhbWV0ZXJzID0gSlNPTi5zdHJpbmdpZnkobm9ybWFsaXplUGFyYW1ldGVycyhwYXJhbXMpKTtcbiAgICAgICRzZXQuYXJlU3Vic2NyaWJlcnNPcmRlcmVkID0gQXJyYXkuaXNBcnJheShwYXJhbXMpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYXJlU3Vic2NyaWJlcnNPcmRlcmVkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgJHNldC5hcmVTdWJzY3JpYmVyc09yZGVyZWQgPSBhcmVTdWJzY3JpYmVyc09yZGVyZWQ7XG4gICAgfVxuXG4gICAgaWYgKGFwcGxpY2F0aW9uVHlwZXMpIHtcbiAgICAgICRzZXQuYXBwbGljYXRpb25UeXBlcyA9IGFwcGxpY2F0aW9uVHlwZXM7XG4gICAgfVxuXG4gICAgaWYgKGxhbmd1YWdlU3BlY2lmaWNhdGlvbnMpIHtcbiAgICAgICRzZXQubGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucyA9IGxhbmd1YWdlU3BlY2lmaWNhdGlvbnM7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBzb3VyY2VNYXBzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICRzZXQuc291cmNlTWFwcyA9IEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcHMpO1xuICAgIH1cblxuICAgIGlmICgkc2V0LnBhcmFtZXRlcnMgfHwgJHNldC5hcHBsaWNhdGlvblR5cGVzIHx8ICRzZXQubGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucyB8fFxuICAgICAgICB0eXBlb2YgJHNldC5hcmVTdWJzY3JpYmVyc09yZGVyZWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjb25zdCB1cGRhdGVBcHBsaWNhdGlvblJlcyA9IGF3YWl0IHRoaXMudXBkYXRlQXBwbGljYXRpb24oY2xpZW50LCAkc2V0KTtcbiAgICAgIGVycm9ySGFuZGxlcih1cGRhdGVBcHBsaWNhdGlvblJlcyk7XG4gICAgfVxuXG4gICAgY29uc3QgY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uUmVzID0gYXdhaXQgdGhpcy5jcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24oY2xpZW50LCBhcHBsaWNhdGlvbklkKTtcbiAgICBlcnJvckhhbmRsZXIoY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uUmVzKTtcblxuICAgIGNvbnN0IHByb3RlY3Rpb25JZCA9IGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcy5kYXRhLmNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbi5faWQ7XG4gICAgYXdhaXQgdGhpcy5wb2xsUHJvdGVjdGlvbihjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHByb3RlY3Rpb25JZCk7XG5cbiAgICBjb25zdCBkb3dubG9hZCA9IGF3YWl0IHRoaXMuZG93bmxvYWRBcHBsaWNhdGlvblByb3RlY3Rpb24oY2xpZW50LCBwcm90ZWN0aW9uSWQpO1xuICAgIGVycm9ySGFuZGxlcihkb3dubG9hZCk7XG4gICAgdW56aXAoZG93bmxvYWQsIGZpbGVzRGVzdCB8fCBkZXN0Q2FsbGJhY2spO1xuICB9LFxuXG4gIGFzeW5jIGRvd25sb2FkU291cmNlTWFwcyAoY29uZmlncywgZGVzdENhbGxiYWNrKSB7XG4gICAgY29uc3Qge1xuICAgICAga2V5cyxcbiAgICAgIGhvc3QsXG4gICAgICBwb3J0LFxuICAgICAgZmlsZXNEZXN0LFxuICAgICAgZmlsZXNTcmMsXG4gICAgICBwcm90ZWN0aW9uSWRcbiAgICB9ID0gY29uZmlncztcblxuICAgIGNvbnN0IHtcbiAgICAgIGFjY2Vzc0tleSxcbiAgICAgIHNlY3JldEtleVxuICAgIH0gPSBrZXlzO1xuXG4gICAgY29uc3QgY2xpZW50ID0gbmV3IHRoaXMuQ2xpZW50KHtcbiAgICAgIGFjY2Vzc0tleSxcbiAgICAgIHNlY3JldEtleSxcbiAgICAgIGhvc3QsXG4gICAgICBwb3J0XG4gICAgfSk7XG5cbiAgICBpZiAoIWZpbGVzRGVzdCAmJiAhZGVzdENhbGxiYWNrKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlcXVpcmVkICpmaWxlc0Rlc3QqIG5vdCBwcm92aWRlZCcpO1xuICAgIH1cblxuICAgIGlmICghcHJvdGVjdGlvbklkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlcXVpcmVkICpwcm90ZWN0aW9uSWQqIG5vdCBwcm92aWRlZCcpO1xuICAgIH1cblxuXG4gICAgaWYgKGZpbGVzU3JjKSB7XG4gICAgICBjb25zb2xlLmxvZygnW1dhcm5pbmddIElnbm9yaW5nIHNvdXJjZXMgc3VwcGxpZWQuIERvd25sb2FkaW5nIHNvdXJjZSBtYXBzIG9mIGdpdmVuIHByb3RlY3Rpb24nKTtcbiAgICB9XG5cbiAgICBjb25zdCBkb3dubG9hZCA9IGF3YWl0IHRoaXMuZG93bmxvYWRTb3VyY2VNYXBzUmVxdWVzdChjbGllbnQsIHByb3RlY3Rpb25JZCk7XG4gICAgZXJyb3JIYW5kbGVyKGRvd25sb2FkKTtcbiAgICB1bnppcChkb3dubG9hZCwgZmlsZXNEZXN0IHx8IGRlc3RDYWxsYmFjayk7XG4gIH0sXG5cbiAgYXN5bmMgcG9sbFByb3RlY3Rpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cbiAgICBjb25zdCBwb2xsID0gYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgYXBwbGljYXRpb25Qcm90ZWN0aW9uID0gYXdhaXQgdGhpcy5nZXRBcHBsaWNhdGlvblByb3RlY3Rpb24oY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQpO1xuICAgICAgaWYgKGFwcGxpY2F0aW9uUHJvdGVjdGlvbi5lcnJvcnMpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIHBvbGxpbmcgcHJvdGVjdGlvbicsIGFwcGxpY2F0aW9uUHJvdGVjdGlvbi5lcnJvcnMpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIHBvbGxpbmcgcHJvdGVjdGlvbicpO1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ0Vycm9yIHBvbGxpbmcgcHJvdGVjdGlvbicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBhcHBsaWNhdGlvblByb3RlY3Rpb24uZGF0YS5hcHBsaWNhdGlvblByb3RlY3Rpb24uc3RhdGU7XG4gICAgICAgIGlmIChzdGF0ZSAhPT0gJ2ZpbmlzaGVkJyAmJiBzdGF0ZSAhPT0gJ2Vycm9yZWQnKSB7XG4gICAgICAgICAgc2V0VGltZW91dChwb2xsLCA1MDApO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSAnZXJyb3JlZCcpIHtcbiAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcHAuanNjcmFtYmxlci5jb20vYXBwLyR7YXBwbGljYXRpb25JZH0vcHJvdGVjdGlvbnMvJHtwcm90ZWN0aW9uSWR9YDtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoYFByb3RlY3Rpb24gZmFpbGVkLiBGb3IgbW9yZSBpbmZvcm1hdGlvbiB2aXNpdDogJHt1cmx9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHBvbGwoKTtcblxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBjcmVhdGVBcHBsaWNhdGlvbiAoY2xpZW50LCBkYXRhLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgY3JlYXRlQXBwbGljYXRpb24oZGF0YSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGR1cGxpY2F0ZUFwcGxpY2F0aW9uIChjbGllbnQsIGRhdGEsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBkdXBsaWNhdGVBcHBsaWNhdGlvbihkYXRhLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgcmVtb3ZlQXBwbGljYXRpb24gKGNsaWVudCwgaWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgcmVtb3ZlQXBwbGljYXRpb24oaWQpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgcmVtb3ZlUHJvdGVjdGlvbiAoY2xpZW50LCBpZCwgYXBwSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCByZW1vdmVQcm90ZWN0aW9uKGlkLCBhcHBJZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHVwZGF0ZUFwcGxpY2F0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgdXBkYXRlQXBwbGljYXRpb24oYXBwbGljYXRpb24sIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyB1bmxvY2tBcHBsaWNhdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbiwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHVubG9ja0FwcGxpY2F0aW9uKGFwcGxpY2F0aW9uLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb24oYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uU291cmNlIChjbGllbnQsIHNvdXJjZUlkLCBmcmFnbWVudHMsIGxpbWl0cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9uU291cmNlKHNvdXJjZUlkLCBmcmFnbWVudHMsIGxpbWl0cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHBhcmFtcywgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9ucyhhcHBsaWNhdGlvbklkLCBwYXJhbXMsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zQ291bnQgKGNsaWVudCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50KGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBjcmVhdGVUZW1wbGF0ZSAoY2xpZW50LCB0ZW1wbGF0ZSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGNyZWF0ZVRlbXBsYXRlKHRlbXBsYXRlLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgcmVtb3ZlVGVtcGxhdGUgKGNsaWVudCwgaWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgcmVtb3ZlVGVtcGxhdGUoaWQpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0VGVtcGxhdGVzIChjbGllbnQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldFRlbXBsYXRlcyhmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25zIChjbGllbnQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9ucyhmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgYWRkQXBwbGljYXRpb25Tb3VyY2UgKGNsaWVudCwgYXBwbGljYXRpb25JZCwgYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBhZGRBcHBsaWNhdGlvblNvdXJjZShhcHBsaWNhdGlvbklkLCBhcHBsaWNhdGlvblNvdXJjZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGFkZEFwcGxpY2F0aW9uU291cmNlRnJvbVVSTCAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCB1cmwsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIHJldHVybiBnZXRGaWxlRnJvbVVybChjbGllbnQsIHVybClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGFkZEFwcGxpY2F0aW9uU291cmNlKGFwcGxpY2F0aW9uSWQsIGZpbGUsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgIH0pO1xuICB9LFxuICAvL1xuICBhc3luYyB1cGRhdGVBcHBsaWNhdGlvblNvdXJjZSAoY2xpZW50LCBhcHBsaWNhdGlvblNvdXJjZSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHVwZGF0ZUFwcGxpY2F0aW9uU291cmNlKGFwcGxpY2F0aW9uU291cmNlLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgcmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uIChjbGllbnQsIHNvdXJjZUlkLCBhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgcmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uKHNvdXJjZUlkLCBhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgYXBwbHlUZW1wbGF0ZSAoY2xpZW50LCB0ZW1wbGF0ZUlkLCBhcHBJZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGFwcGx5VGVtcGxhdGUodGVtcGxhdGVJZCwgYXBwSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyB1cGRhdGVUZW1wbGF0ZSAoY2xpZW50LCB0ZW1wbGF0ZSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHVwZGF0ZVRlbXBsYXRlKHRlbXBsYXRlLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24oYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldFByb3RlY3Rpb24oYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZG93bmxvYWRTb3VyY2VNYXBzUmVxdWVzdCAoY2xpZW50LCBwcm90ZWN0aW9uSWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KGAvYXBwbGljYXRpb24vc291cmNlTWFwcy8ke3Byb3RlY3Rpb25JZH1gLCBudWxsLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpLCBmYWxzZSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGRvd25sb2FkQXBwbGljYXRpb25Qcm90ZWN0aW9uIChjbGllbnQsIHByb3RlY3Rpb25JZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoYC9hcHBsaWNhdGlvbi9kb3dubG9hZC8ke3Byb3RlY3Rpb25JZH1gLCBudWxsLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpLCBmYWxzZSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGdldEZpbGVGcm9tVXJsIChjbGllbnQsIHVybCkge1xuICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgdmFyIGZpbGU7XG4gIHJlcXVlc3QuZ2V0KHVybClcbiAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICBmaWxlID0ge1xuICAgICAgICBjb250ZW50OiByZXMuZGF0YSxcbiAgICAgICAgZmlsZW5hbWU6IHBhdGguYmFzZW5hbWUodXJsKSxcbiAgICAgICAgZXh0ZW5zaW9uOiBwYXRoLmV4dG5hbWUodXJsKS5zdWJzdHIoMSlcbiAgICAgIH07XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGZpbGUpO1xuICAgIH0pXG4gICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xuICAgIH0pO1xuICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxuZnVuY3Rpb24gcmVzcG9uc2VIYW5kbGVyIChkZWZlcnJlZCkge1xuICByZXR1cm4gKGVyciwgcmVzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgZGVmZXJyZWQucmVqZWN0KGVycik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBib2R5ID0gcmVzLmRhdGE7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAocmVzLnN0YXR1cyA+PSA0MDApIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoYm9keSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShib2R5KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGJvZHkpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZXJyb3JIYW5kbGVyIChyZXMpIHtcbiAgaWYgKHJlcy5lcnJvcnMgJiYgcmVzLmVycm9ycy5sZW5ndGgpIHtcbiAgICByZXMuZXJyb3JzLmZvckVhY2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVQYXJhbWV0ZXJzIChwYXJhbWV0ZXJzKSB7XG4gIHZhciByZXN1bHQ7XG5cbiAgaWYgKCFBcnJheS5pc0FycmF5KHBhcmFtZXRlcnMpKSB7XG4gICAgcmVzdWx0ID0gW107XG4gICAgT2JqZWN0LmtleXMocGFyYW1ldGVycykuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICBuYW1lLFxuICAgICAgICBvcHRpb25zOiBwYXJhbWV0ZXJzW25hbWVdXG4gICAgICB9KVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9IHBhcmFtZXRlcnM7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuIl19
