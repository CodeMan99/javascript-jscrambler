'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

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
              applicationId = config.applicationId;
              host = config.host;
              port = config.port;
              keys = config.keys;
              filesDest = config.filesDest;
              filesSrc = config.filesSrc;
              cwd = config.cwd;
              params = config.params;
              applicationTypes = config.applicationTypes;
              languageSpecifications = config.languageSpecifications;
              sourceMaps = config.sourceMaps;
              areSubscribersOrdered = config.areSubscribersOrdered;
              accessKey = keys.accessKey;
              secretKey = keys.secretKey;
              client = new _this.Client({
                accessKey: accessKey,
                secretKey: secretKey,
                host: host,
                port: port
              });

              if (applicationId) {
                _context.next = 18;
                break;
              }

              throw new Error('Required *applicationId* not provided');

            case 18:
              if (!(!filesDest && !destCallback)) {
                _context.next = 20;
                break;
              }

              throw new Error('Required *filesDest* not provided');

            case 20:
              if (!(filesSrc && filesSrc.length)) {
                _context.next = 38;
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

              _context.next = 25;
              return (0, _zip2.zip)(_filesSrc, cwd);

            case 25:
              _zip = _context.sent;
              _context.next = 28;
              return _this.removeSourceFromApplication(client, '', applicationId);

            case 28:
              removeSourceRes = _context.sent;

              if (!removeSourceRes.errors) {
                _context.next = 34;
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
                _context.next = 34;
                break;
              }

              throw new Error(removeSourceRes.errors[0].message);

            case 34:
              _context.next = 36;
              return _this.addApplicationSource(client, applicationId, {
                content: _zip.generate({ type: 'base64' }),
                filename: 'application.zip',
                extension: 'zip'
              });

            case 36:
              addApplicationSourceRes = _context.sent;

              errorHandler(addApplicationSourceRes);

            case 38:
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
                _context.next = 49;
                break;
              }

              _context.next = 47;
              return _this.updateApplication(client, $set);

            case 47:
              updateApplicationRes = _context.sent;

              errorHandler(updateApplicationRes);

            case 49:
              _context.next = 51;
              return _this.createApplicationProtection(client, applicationId);

            case 51:
              createApplicationProtectionRes = _context.sent;

              errorHandler(createApplicationProtectionRes);

              protectionId = createApplicationProtectionRes.data.createApplicationProtection._id;
              _context.next = 56;
              return _this.pollProtection(client, applicationId, protectionId);

            case 56:
              _context.next = 58;
              return _this.downloadApplicationProtection(client, protectionId);

            case 58:
              download = _context.sent;

              errorHandler(download);
              (0, _zip2.unzip)(download, filesDest || destCallback);

            case 61:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }))();
  },

  //
  pollProtection: function pollProtection(client, applicationId, protectionId) {
    var _this2 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
      var deferred, poll;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              deferred = _q2.default.defer();

              poll = function () {
                var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
                  var applicationProtection, state, url;
                  return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          _context2.next = 2;
                          return _this2.getApplicationProtection(client, applicationId, protectionId);

                        case 2:
                          applicationProtection = _context2.sent;

                          if (!applicationProtection.errors) {
                            _context2.next = 8;
                            break;
                          }

                          throw new Error('Error polling protection');

                        case 8:
                          state = applicationProtection.data.applicationProtection.state;

                          if (state !== 'finished' && state !== 'errored') {
                            setTimeout(poll, 500);
                          } else if (state === 'errored') {
                            url = 'https://app.jscrambler.com/app/' + applicationId + '/protections/' + protectionId;

                            deferred.reject('Protection failed. For more information visit: ' + url);
                          } else {
                            deferred.resolve();
                          }

                        case 10:
                        case 'end':
                          return _context2.stop();
                      }
                    }
                  }, _callee2, _this2);
                }));

                return function poll() {
                  return _ref.apply(this, arguments);
                };
              }();

              poll();

              return _context3.abrupt('return', deferred.promise);

            case 4:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this2);
    }))();
  },

  //
  createApplication: function createApplication(client, data, fragments) {
    var _this3 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.createApplication)(data, fragments), responseHandler(deferred));
              return _context4.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this3);
    }))();
  },

  //
  duplicateApplication: function duplicateApplication(client, data, fragments) {
    var _this4 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.duplicateApplication)(data, fragments), responseHandler(deferred));
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
  removeApplication: function removeApplication(client, id) {
    var _this5 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.removeApplication)(id), responseHandler(deferred));
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
  removeProtection: function removeProtection(client, id, appId, fragments) {
    var _this6 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee7() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.removeProtection)(id, appId, fragments), responseHandler(deferred));
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
  updateApplication: function updateApplication(client, application, fragments) {
    var _this7 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee8() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.updateApplication)(application, fragments), responseHandler(deferred));
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
  unlockApplication: function unlockApplication(client, application, fragments) {
    var _this8 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee9() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.unlockApplication)(application, fragments), responseHandler(deferred));
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
  getApplication: function getApplication(client, applicationId, fragments) {
    var _this9 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee10() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application', (0, _queries.getApplication)(applicationId, fragments), responseHandler(deferred));
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
  getApplicationSource: function getApplicationSource(client, sourceId, fragments, limits) {
    var _this10 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee11() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application', (0, _queries.getApplicationSource)(sourceId, fragments, limits), responseHandler(deferred));
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
  getApplicationProtections: function getApplicationProtections(client, applicationId, params, fragments) {
    var _this11 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee12() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application', (0, _queries.getApplicationProtections)(applicationId, params, fragments), responseHandler(deferred));
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
  getApplicationProtectionsCount: function getApplicationProtectionsCount(client, applicationId, fragments) {
    var _this12 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee13() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application', (0, _queries.getApplicationProtectionsCount)(applicationId, fragments), responseHandler(deferred));
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
  createTemplate: function createTemplate(client, template, fragments) {
    var _this13 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee14() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee14$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.createTemplate)(template, fragments), responseHandler(deferred));
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
  removeTemplate: function removeTemplate(client, id) {
    var _this14 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee15() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee15$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.removeTemplate)(id), responseHandler(deferred));
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
  getTemplates: function getTemplates(client, fragments) {
    var _this15 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee16() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee16$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application', (0, _queries.getTemplates)(fragments), responseHandler(deferred));
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
  getApplications: function getApplications(client, fragments) {
    var _this16 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee17() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee17$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application', (0, _queries.getApplications)(fragments), responseHandler(deferred));
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
  addApplicationSource: function addApplicationSource(client, applicationId, applicationSource, fragments) {
    var _this17 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee18() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee18$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.addApplicationSource)(applicationId, applicationSource, fragments), responseHandler(deferred));
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
  addApplicationSourceFromURL: function addApplicationSourceFromURL(client, applicationId, url, fragments) {
    var _this18 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee19() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee19$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              deferred = _q2.default.defer();
              return _context19.abrupt('return', getFileFromUrl(client, url).then(function (file) {
                client.post('/application', (0, _mutations.addApplicationSource)(applicationId, file, fragments), responseHandler(deferred));
                return deferred.promise;
              }));

            case 2:
            case 'end':
              return _context19.stop();
          }
        }
      }, _callee19, _this18);
    }))();
  },

  //
  updateApplicationSource: function updateApplicationSource(client, applicationSource, fragments) {
    var _this19 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee20() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee20$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.updateApplicationSource)(applicationSource, fragments), responseHandler(deferred));
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
  removeSourceFromApplication: function removeSourceFromApplication(client, sourceId, applicationId, fragments) {
    var _this20 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee21() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee21$(_context21) {
        while (1) {
          switch (_context21.prev = _context21.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.removeSourceFromApplication)(sourceId, applicationId, fragments), responseHandler(deferred));
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
  applyTemplate: function applyTemplate(client, templateId, appId, fragments) {
    var _this21 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee22() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee22$(_context22) {
        while (1) {
          switch (_context22.prev = _context22.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.applyTemplate)(templateId, appId, fragments), responseHandler(deferred));
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
  updateTemplate: function updateTemplate(client, template, fragments) {
    var _this22 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee23() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee23$(_context23) {
        while (1) {
          switch (_context23.prev = _context23.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.updateTemplate)(template, fragments), responseHandler(deferred));
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
  createApplicationProtection: function createApplicationProtection(client, applicationId, fragments) {
    var _this23 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee24() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee24$(_context24) {
        while (1) {
          switch (_context24.prev = _context24.next) {
            case 0:
              deferred = _q2.default.defer();

              client.post('/application', (0, _mutations.createApplicationProtection)(applicationId, fragments), responseHandler(deferred));
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
  getApplicationProtection: function getApplicationProtection(client, applicationId, protectionId, fragments) {
    var _this24 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee25() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee25$(_context25) {
        while (1) {
          switch (_context25.prev = _context25.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application', (0, _queries.getProtection)(applicationId, protectionId, fragments), responseHandler(deferred));
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
  downloadApplicationProtection: function downloadApplicationProtection(client, protectionId) {
    var _this25 = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee26() {
      var deferred;
      return regeneratorRuntime.wrap(function _callee26$(_context26) {
        while (1) {
          switch (_context26.prev = _context26.next) {
            case 0:
              deferred = _q2.default.defer();

              client.get('/application/download/' + protectionId, null, responseHandler(deferred), false);
              return _context26.abrupt('return', deferred.promise);

            case 3:
            case 'end':
              return _context26.stop();
          }
        }
      }, _callee26, _this25);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvaW5kZXguanMiXSwibmFtZXMiOlsiQ2xpZW50IiwiY29uZmlnIiwiZ2VuZXJhdGVTaWduZWRQYXJhbXMiLCJwcm90ZWN0QW5kRG93bmxvYWQiLCJjb25maWdQYXRoT3JPYmplY3QiLCJkZXN0Q2FsbGJhY2siLCJyZXF1aXJlIiwiYXBwbGljYXRpb25JZCIsImhvc3QiLCJwb3J0Iiwia2V5cyIsImZpbGVzRGVzdCIsImZpbGVzU3JjIiwiY3dkIiwicGFyYW1zIiwiYXBwbGljYXRpb25UeXBlcyIsImxhbmd1YWdlU3BlY2lmaWNhdGlvbnMiLCJzb3VyY2VNYXBzIiwiYXJlU3Vic2NyaWJlcnNPcmRlcmVkIiwiYWNjZXNzS2V5Iiwic2VjcmV0S2V5IiwiY2xpZW50IiwiRXJyb3IiLCJsZW5ndGgiLCJfZmlsZXNTcmMiLCJpIiwibCIsImNvbmNhdCIsInN5bmMiLCJkb3QiLCJwdXNoIiwiX3ppcCIsInJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbiIsInJlbW92ZVNvdXJjZVJlcyIsImVycm9ycyIsImhhZE5vU291cmNlcyIsImZvckVhY2giLCJlcnJvciIsIm1lc3NhZ2UiLCJhZGRBcHBsaWNhdGlvblNvdXJjZSIsImNvbnRlbnQiLCJnZW5lcmF0ZSIsInR5cGUiLCJmaWxlbmFtZSIsImV4dGVuc2lvbiIsImFkZEFwcGxpY2F0aW9uU291cmNlUmVzIiwiZXJyb3JIYW5kbGVyIiwiJHNldCIsIl9pZCIsIk9iamVjdCIsInBhcmFtZXRlcnMiLCJKU09OIiwic3RyaW5naWZ5Iiwibm9ybWFsaXplUGFyYW1ldGVycyIsIkFycmF5IiwiaXNBcnJheSIsInVuZGVmaW5lZCIsInVwZGF0ZUFwcGxpY2F0aW9uIiwidXBkYXRlQXBwbGljYXRpb25SZXMiLCJjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24iLCJjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb25SZXMiLCJwcm90ZWN0aW9uSWQiLCJkYXRhIiwicG9sbFByb3RlY3Rpb24iLCJkb3dubG9hZEFwcGxpY2F0aW9uUHJvdGVjdGlvbiIsImRvd25sb2FkIiwiZGVmZXJyZWQiLCJkZWZlciIsInBvbGwiLCJnZXRBcHBsaWNhdGlvblByb3RlY3Rpb24iLCJhcHBsaWNhdGlvblByb3RlY3Rpb24iLCJzdGF0ZSIsInNldFRpbWVvdXQiLCJ1cmwiLCJyZWplY3QiLCJyZXNvbHZlIiwicHJvbWlzZSIsImNyZWF0ZUFwcGxpY2F0aW9uIiwiZnJhZ21lbnRzIiwicG9zdCIsInJlc3BvbnNlSGFuZGxlciIsImR1cGxpY2F0ZUFwcGxpY2F0aW9uIiwicmVtb3ZlQXBwbGljYXRpb24iLCJpZCIsInJlbW92ZVByb3RlY3Rpb24iLCJhcHBJZCIsImFwcGxpY2F0aW9uIiwidW5sb2NrQXBwbGljYXRpb24iLCJnZXRBcHBsaWNhdGlvbiIsImdldCIsImdldEFwcGxpY2F0aW9uU291cmNlIiwic291cmNlSWQiLCJsaW1pdHMiLCJnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zIiwiZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50IiwiY3JlYXRlVGVtcGxhdGUiLCJ0ZW1wbGF0ZSIsInJlbW92ZVRlbXBsYXRlIiwiZ2V0VGVtcGxhdGVzIiwiZ2V0QXBwbGljYXRpb25zIiwiYXBwbGljYXRpb25Tb3VyY2UiLCJhZGRBcHBsaWNhdGlvblNvdXJjZUZyb21VUkwiLCJnZXRGaWxlRnJvbVVybCIsInRoZW4iLCJmaWxlIiwidXBkYXRlQXBwbGljYXRpb25Tb3VyY2UiLCJhcHBseVRlbXBsYXRlIiwidGVtcGxhdGVJZCIsInVwZGF0ZVRlbXBsYXRlIiwicmVzIiwiYmFzZW5hbWUiLCJleHRuYW1lIiwic3Vic3RyIiwiY2F0Y2giLCJlcnIiLCJib2R5Iiwic3RhdHVzIiwiZXgiLCJyZXN1bHQiLCJuYW1lIiwib3B0aW9ucyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQWdCQTs7QUFTQTs7Ozs7O2tC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LE9BQVo7QUFJRCxLQUxEO0FBTUQsR0FSRCxNQVFPO0FBQ0xELGFBQVNwRSxVQUFUO0FBQ0Q7O0FBRUQsU0FBT29FLE1BQVA7QUFDRCIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnYmFiZWwtcG9seWZpbGwnO1xuXG5pbXBvcnQgZ2xvYiBmcm9tICdnbG9iJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHJlcXVlc3QgZnJvbSAnYXhpb3MnO1xuaW1wb3J0IFEgZnJvbSAncSc7XG5cbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IGdlbmVyYXRlU2lnbmVkUGFyYW1zIGZyb20gJy4vZ2VuZXJhdGUtc2lnbmVkLXBhcmFtcyc7XG5pbXBvcnQgSlNjcmFtYmxlckNsaWVudCBmcm9tICcuL2NsaWVudCc7XG5pbXBvcnQge1xuICBhZGRBcHBsaWNhdGlvblNvdXJjZSxcbiAgY3JlYXRlQXBwbGljYXRpb24sXG4gIHJlbW92ZUFwcGxpY2F0aW9uLFxuICB1cGRhdGVBcHBsaWNhdGlvbixcbiAgdXBkYXRlQXBwbGljYXRpb25Tb3VyY2UsXG4gIHJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbixcbiAgY3JlYXRlVGVtcGxhdGUsXG4gIHJlbW92ZVRlbXBsYXRlLFxuICB1cGRhdGVUZW1wbGF0ZSxcbiAgY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uLFxuICByZW1vdmVQcm90ZWN0aW9uLFxuICBkdXBsaWNhdGVBcHBsaWNhdGlvbixcbiAgdW5sb2NrQXBwbGljYXRpb24sXG4gIGFwcGx5VGVtcGxhdGVcbn0gZnJvbSAnLi9tdXRhdGlvbnMnO1xuaW1wb3J0IHtcbiAgZ2V0QXBwbGljYXRpb24sXG4gIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnMsXG4gIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudCxcbiAgZ2V0QXBwbGljYXRpb25zLFxuICBnZXRBcHBsaWNhdGlvblNvdXJjZSxcbiAgZ2V0VGVtcGxhdGVzLFxuICBnZXRQcm90ZWN0aW9uXG59IGZyb20gJy4vcXVlcmllcyc7XG5pbXBvcnQge1xuICB6aXAsXG4gIHVuemlwXG59IGZyb20gJy4vemlwJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBDbGllbnQ6IEpTY3JhbWJsZXJDbGllbnQsXG4gIGNvbmZpZyxcbiAgZ2VuZXJhdGVTaWduZWRQYXJhbXMsXG4gIC8vIFRoaXMgbWV0aG9kIGlzIGEgc2hvcnRjdXQgbWV0aG9kIHRoYXQgYWNjZXB0cyBhbiBvYmplY3Qgd2l0aCBldmVyeXRoaW5nIG5lZWRlZFxuICAvLyBmb3IgdGhlIGVudGlyZSBwcm9jZXNzIG9mIHJlcXVlc3RpbmcgYW4gYXBwbGljYXRpb24gcHJvdGVjdGlvbiBhbmQgZG93bmxvYWRpbmdcbiAgLy8gdGhhdCBzYW1lIHByb3RlY3Rpb24gd2hlbiB0aGUgc2FtZSBlbmRzLlxuICAvL1xuICAvLyBgY29uZmlnUGF0aE9yT2JqZWN0YCBjYW4gYmUgYSBwYXRoIHRvIGEgSlNPTiBvciBkaXJlY3RseSBhbiBvYmplY3QgY29udGFpbmluZ1xuICAvLyB0aGUgZm9sbG93aW5nIHN0cnVjdHVyZTpcbiAgLy9cbiAgLy8gYGBganNvblxuICAvLyB7XG4gIC8vICAgXCJrZXlzXCI6IHtcbiAgLy8gICAgIFwiYWNjZXNzS2V5XCI6IFwiXCIsXG4gIC8vICAgICBcInNlY3JldEtleVwiOiBcIlwiXG4gIC8vICAgfSxcbiAgLy8gICBcImFwcGxpY2F0aW9uSWRcIjogXCJcIixcbiAgLy8gICBcImZpbGVzRGVzdFwiOiBcIlwiXG4gIC8vIH1cbiAgLy8gYGBgXG4gIC8vXG4gIC8vIEFsc28gdGhlIGZvbGxvd2luZyBvcHRpb25hbCBwYXJhbWV0ZXJzIGFyZSBhY2NlcHRlZDpcbiAgLy9cbiAgLy8gYGBganNvblxuICAvLyB7XG4gIC8vICAgXCJmaWxlc1NyY1wiOiBbXCJcIl0sXG4gIC8vICAgXCJwYXJhbXNcIjoge30sXG4gIC8vICAgXCJjd2RcIjogXCJcIixcbiAgLy8gICBcImhvc3RcIjogXCJhcGkuanNjcmFtYmxlci5jb21cIixcbiAgLy8gICBcInBvcnRcIjogXCI0NDNcIlxuICAvLyB9XG4gIC8vIGBgYFxuICAvL1xuICAvLyBgZmlsZXNTcmNgIHN1cHBvcnRzIGdsb2IgcGF0dGVybnMsIGFuZCBpZiBpdCdzIHByb3ZpZGVkIGl0IHdpbGwgcmVwbGFjZSB0aGVcbiAgLy8gZW50aXJlIGFwcGxpY2F0aW9uIHNvdXJjZXMuXG4gIC8vXG4gIC8vIGBwYXJhbXNgIGlmIHByb3ZpZGVkIHdpbGwgcmVwbGFjZSBhbGwgdGhlIGFwcGxpY2F0aW9uIHRyYW5zZm9ybWF0aW9uIHBhcmFtZXRlcnMuXG4gIC8vXG4gIC8vIGBjd2RgIGFsbG93cyB5b3UgdG8gc2V0IHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IHRvIHJlc29sdmUgcHJvYmxlbXMgd2l0aFxuICAvLyByZWxhdGl2ZSBwYXRocyB3aXRoIHlvdXIgYGZpbGVzU3JjYCBpcyBvdXRzaWRlIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LlxuICAvL1xuICAvLyBGaW5hbGx5LCBgaG9zdGAgYW5kIGBwb3J0YCBjYW4gYmUgb3ZlcnJpZGRlbiBpZiB5b3UgdG8gZW5nYWdlIHdpdGggYSBkaWZmZXJlbnRcbiAgLy8gZW5kcG9pbnQgdGhhbiB0aGUgZGVmYXVsdCBvbmUsIHVzZWZ1bCBpZiB5b3UncmUgcnVubmluZyBhbiBlbnRlcnByaXNlIHZlcnNpb24gb2ZcbiAgLy8gSnNjcmFtYmxlciBvciBpZiB5b3UncmUgcHJvdmlkZWQgYWNjZXNzIHRvIGJldGEgZmVhdHVyZXMgb2Ygb3VyIHByb2R1Y3QuXG4gIC8vXG4gIGFzeW5jIHByb3RlY3RBbmREb3dubG9hZCAoY29uZmlnUGF0aE9yT2JqZWN0LCBkZXN0Q2FsbGJhY2spIHtcbiAgICBjb25zdCBjb25maWcgPSB0eXBlb2YgY29uZmlnUGF0aE9yT2JqZWN0ID09PSAnc3RyaW5nJyA/XG4gICAgICByZXF1aXJlKGNvbmZpZ1BhdGhPck9iamVjdCkgOiBjb25maWdQYXRoT3JPYmplY3Q7XG5cbiAgICBjb25zdCB7XG4gICAgICBhcHBsaWNhdGlvbklkLFxuICAgICAgaG9zdCxcbiAgICAgIHBvcnQsXG4gICAgICBrZXlzLFxuICAgICAgZmlsZXNEZXN0LFxuICAgICAgZmlsZXNTcmMsXG4gICAgICBjd2QsXG4gICAgICBwYXJhbXMsXG4gICAgICBhcHBsaWNhdGlvblR5cGVzLFxuICAgICAgbGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucyxcbiAgICAgIHNvdXJjZU1hcHMsXG4gICAgICBhcmVTdWJzY3JpYmVyc09yZGVyZWRcbiAgICB9ID0gY29uZmlnO1xuXG4gICAgY29uc3Qge1xuICAgICAgYWNjZXNzS2V5LFxuICAgICAgc2VjcmV0S2V5XG4gICAgfSA9IGtleXM7XG5cbiAgICBjb25zdCBjbGllbnQgPSBuZXcgdGhpcy5DbGllbnQoe1xuICAgICAgYWNjZXNzS2V5LFxuICAgICAgc2VjcmV0S2V5LFxuICAgICAgaG9zdCxcbiAgICAgIHBvcnRcbiAgICB9KTtcblxuICAgIGlmICghYXBwbGljYXRpb25JZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXF1aXJlZCAqYXBwbGljYXRpb25JZCogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgaWYgKCFmaWxlc0Rlc3QgJiYgIWRlc3RDYWxsYmFjaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXF1aXJlZCAqZmlsZXNEZXN0KiBub3QgcHJvdmlkZWQnKTtcbiAgICB9XG5cbiAgICBpZiAoZmlsZXNTcmMgJiYgZmlsZXNTcmMubGVuZ3RoKSB7XG4gICAgICBsZXQgX2ZpbGVzU3JjID0gW107XG4gICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGZpbGVzU3JjLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgICBpZiAodHlwZW9mIGZpbGVzU3JjW2ldID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIC8vIFRPRE8gUmVwbGFjZSBgZ2xvYi5zeW5jYCB3aXRoIGFzeW5jIHZlcnNpb25cbiAgICAgICAgICBfZmlsZXNTcmMgPSBfZmlsZXNTcmMuY29uY2F0KGdsb2Iuc3luYyhmaWxlc1NyY1tpXSwge2RvdDogdHJ1ZX0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfZmlsZXNTcmMucHVzaChmaWxlc1NyY1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgX3ppcCA9IGF3YWl0IHppcChfZmlsZXNTcmMsIGN3ZCk7XG5cbiAgICAgIGNvbnN0IHJlbW92ZVNvdXJjZVJlcyA9IGF3YWl0IHRoaXMucmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uKGNsaWVudCwgJycsIGFwcGxpY2F0aW9uSWQpO1xuICAgICAgaWYgKHJlbW92ZVNvdXJjZVJlcy5lcnJvcnMpIHtcbiAgICAgICAgLy8gVE9ETyBJbXBsZW1lbnQgZXJyb3IgY29kZXMgb3IgZml4IHRoaXMgaXMgb24gdGhlIHNlcnZpY2VzXG4gICAgICAgIHZhciBoYWROb1NvdXJjZXMgPSBmYWxzZTtcbiAgICAgICAgcmVtb3ZlU291cmNlUmVzLmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvci5tZXNzYWdlID09PSAnQXBwbGljYXRpb24gU291cmNlIHdpdGggdGhlIGdpdmVuIElEIGRvZXMgbm90IGV4aXN0Jykge1xuICAgICAgICAgICAgaGFkTm9Tb3VyY2VzID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIWhhZE5vU291cmNlcykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZW1vdmVTb3VyY2VSZXMuZXJyb3JzWzBdLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFkZEFwcGxpY2F0aW9uU291cmNlUmVzID0gYXdhaXQgdGhpcy5hZGRBcHBsaWNhdGlvblNvdXJjZShjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHtcbiAgICAgICAgY29udGVudDogX3ppcC5nZW5lcmF0ZSh7dHlwZTogJ2Jhc2U2NCd9KSxcbiAgICAgICAgZmlsZW5hbWU6ICdhcHBsaWNhdGlvbi56aXAnLFxuICAgICAgICBleHRlbnNpb246ICd6aXAnXG4gICAgICB9KTtcbiAgICAgIGVycm9ySGFuZGxlcihhZGRBcHBsaWNhdGlvblNvdXJjZVJlcyk7XG4gICAgfVxuXG4gICAgY29uc3QgJHNldCA9IHtcbiAgICAgIF9pZDogYXBwbGljYXRpb25JZFxuICAgIH07XG5cbiAgICBpZiAocGFyYW1zICYmIE9iamVjdC5rZXlzKHBhcmFtcykubGVuZ3RoKSB7XG4gICAgICAkc2V0LnBhcmFtZXRlcnMgPSBKU09OLnN0cmluZ2lmeShub3JtYWxpemVQYXJhbWV0ZXJzKHBhcmFtcykpO1xuICAgICAgJHNldC5hcmVTdWJzY3JpYmVyc09yZGVyZWQgPSBBcnJheS5pc0FycmF5KHBhcmFtcyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhcmVTdWJzY3JpYmVyc09yZGVyZWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAkc2V0LmFyZVN1YnNjcmliZXJzT3JkZXJlZCA9IGFyZVN1YnNjcmliZXJzT3JkZXJlZDtcbiAgICB9XG5cbiAgICBpZiAoYXBwbGljYXRpb25UeXBlcykge1xuICAgICAgJHNldC5hcHBsaWNhdGlvblR5cGVzID0gYXBwbGljYXRpb25UeXBlcztcbiAgICB9XG5cbiAgICBpZiAobGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucykge1xuICAgICAgJHNldC5sYW5ndWFnZVNwZWNpZmljYXRpb25zID0gbGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucztcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHNvdXJjZU1hcHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgJHNldC5zb3VyY2VNYXBzID0gSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwcyk7XG4gICAgfVxuXG4gICAgaWYgKCRzZXQucGFyYW1ldGVycyB8fCAkc2V0LmFwcGxpY2F0aW9uVHlwZXMgfHwgJHNldC5sYW5ndWFnZVNwZWNpZmljYXRpb25zIHx8XG4gICAgICAgIHR5cGVvZiAkc2V0LmFyZVN1YnNjcmliZXJzT3JkZXJlZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnN0IHVwZGF0ZUFwcGxpY2F0aW9uUmVzID0gYXdhaXQgdGhpcy51cGRhdGVBcHBsaWNhdGlvbihjbGllbnQsICRzZXQpO1xuICAgICAgZXJyb3JIYW5kbGVyKHVwZGF0ZUFwcGxpY2F0aW9uUmVzKTtcbiAgICB9XG5cbiAgICBjb25zdCBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb25SZXMgPSBhd2FpdCB0aGlzLmNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbihjbGllbnQsIGFwcGxpY2F0aW9uSWQpO1xuICAgIGVycm9ySGFuZGxlcihjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb25SZXMpO1xuXG4gICAgY29uc3QgcHJvdGVjdGlvbklkID0gY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uUmVzLmRhdGEuY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uLl9pZDtcbiAgICBhd2FpdCB0aGlzLnBvbGxQcm90ZWN0aW9uKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkKTtcblxuICAgIGNvbnN0IGRvd25sb2FkID0gYXdhaXQgdGhpcy5kb3dubG9hZEFwcGxpY2F0aW9uUHJvdGVjdGlvbihjbGllbnQsIHByb3RlY3Rpb25JZCk7XG4gICAgZXJyb3JIYW5kbGVyKGRvd25sb2FkKTtcbiAgICB1bnppcChkb3dubG9hZCwgZmlsZXNEZXN0IHx8IGRlc3RDYWxsYmFjayk7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHBvbGxQcm90ZWN0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHByb3RlY3Rpb25JZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuXG4gICAgY29uc3QgcG9sbCA9IGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGFwcGxpY2F0aW9uUHJvdGVjdGlvbiA9IGF3YWl0IHRoaXMuZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkKTtcbiAgICAgIGlmIChhcHBsaWNhdGlvblByb3RlY3Rpb24uZXJyb3JzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3IgcG9sbGluZyBwcm90ZWN0aW9uJyk7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdCgnRXJyb3IgcG9sbGluZyBwcm90ZWN0aW9uJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IGFwcGxpY2F0aW9uUHJvdGVjdGlvbi5kYXRhLmFwcGxpY2F0aW9uUHJvdGVjdGlvbi5zdGF0ZTtcbiAgICAgICAgaWYgKHN0YXRlICE9PSAnZmluaXNoZWQnICYmIHN0YXRlICE9PSAnZXJyb3JlZCcpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KHBvbGwsIDUwMCk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09ICdlcnJvcmVkJykge1xuICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL2FwcC5qc2NyYW1ibGVyLmNvbS9hcHAvJHthcHBsaWNhdGlvbklkfS9wcm90ZWN0aW9ucy8ke3Byb3RlY3Rpb25JZH1gO1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdChgUHJvdGVjdGlvbiBmYWlsZWQuIEZvciBtb3JlIGluZm9ybWF0aW9uIHZpc2l0OiAke3VybH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcG9sbCgpO1xuXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGNyZWF0ZUFwcGxpY2F0aW9uIChjbGllbnQsIGRhdGEsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBjcmVhdGVBcHBsaWNhdGlvbihkYXRhLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZHVwbGljYXRlQXBwbGljYXRpb24gKGNsaWVudCwgZGF0YSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGR1cGxpY2F0ZUFwcGxpY2F0aW9uKGRhdGEsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyByZW1vdmVBcHBsaWNhdGlvbiAoY2xpZW50LCBpZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCByZW1vdmVBcHBsaWNhdGlvbihpZCksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyByZW1vdmVQcm90ZWN0aW9uIChjbGllbnQsIGlkLCBhcHBJZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHJlbW92ZVByb3RlY3Rpb24oaWQsIGFwcElkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgdXBkYXRlQXBwbGljYXRpb24gKGNsaWVudCwgYXBwbGljYXRpb24sIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCB1cGRhdGVBcHBsaWNhdGlvbihhcHBsaWNhdGlvbiwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHVubG9ja0FwcGxpY2F0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgdW5sb2NrQXBwbGljYXRpb24oYXBwbGljYXRpb24sIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvbihhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25Tb3VyY2UgKGNsaWVudCwgc291cmNlSWQsIGZyYWdtZW50cywgbGltaXRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb25Tb3VyY2Uoc291cmNlSWQsIGZyYWdtZW50cywgbGltaXRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnMgKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcGFyYW1zLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zKGFwcGxpY2F0aW9uSWQsIHBhcmFtcywgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudCAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zQ291bnQoYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGNyZWF0ZVRlbXBsYXRlIChjbGllbnQsIHRlbXBsYXRlLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgY3JlYXRlVGVtcGxhdGUodGVtcGxhdGUsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyByZW1vdmVUZW1wbGF0ZSAoY2xpZW50LCBpZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCByZW1vdmVUZW1wbGF0ZShpZCksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRUZW1wbGF0ZXMgKGNsaWVudCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0VGVtcGxhdGVzKGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvbnMgKGNsaWVudCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb25zKGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBhZGRBcHBsaWNhdGlvblNvdXJjZSAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBhcHBsaWNhdGlvblNvdXJjZSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGFkZEFwcGxpY2F0aW9uU291cmNlKGFwcGxpY2F0aW9uSWQsIGFwcGxpY2F0aW9uU291cmNlLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgYWRkQXBwbGljYXRpb25Tb3VyY2VGcm9tVVJMIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHVybCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgcmV0dXJuIGdldEZpbGVGcm9tVXJsKGNsaWVudCwgdXJsKVxuICAgICAgLnRoZW4oZnVuY3Rpb24oZmlsZSkge1xuICAgICAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgYWRkQXBwbGljYXRpb25Tb3VyY2UoYXBwbGljYXRpb25JZCwgZmlsZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgfSk7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHVwZGF0ZUFwcGxpY2F0aW9uU291cmNlIChjbGllbnQsIGFwcGxpY2F0aW9uU291cmNlLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgdXBkYXRlQXBwbGljYXRpb25Tb3VyY2UoYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyByZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24gKGNsaWVudCwgc291cmNlSWQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCByZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24oc291cmNlSWQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBhcHBseVRlbXBsYXRlIChjbGllbnQsIHRlbXBsYXRlSWQsIGFwcElkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgYXBwbHlUZW1wbGF0ZSh0ZW1wbGF0ZUlkLCBhcHBJZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHVwZGF0ZVRlbXBsYXRlIChjbGllbnQsIHRlbXBsYXRlLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgdXBkYXRlVGVtcGxhdGUodGVtcGxhdGUsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbihhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHByb3RlY3Rpb25JZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0UHJvdGVjdGlvbihhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBkb3dubG9hZEFwcGxpY2F0aW9uUHJvdGVjdGlvbiAoY2xpZW50LCBwcm90ZWN0aW9uSWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KGAvYXBwbGljYXRpb24vZG93bmxvYWQvJHtwcm90ZWN0aW9uSWR9YCwgbnVsbCwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSwgZmFsc2UpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9XG59O1xuXG5mdW5jdGlvbiBnZXRGaWxlRnJvbVVybCAoY2xpZW50LCB1cmwpIHtcbiAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gIHZhciBmaWxlO1xuICByZXF1ZXN0LmdldCh1cmwpXG4gICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgZmlsZSA9IHtcbiAgICAgICAgY29udGVudDogcmVzLmRhdGEsXG4gICAgICAgIGZpbGVuYW1lOiBwYXRoLmJhc2VuYW1lKHVybCksXG4gICAgICAgIGV4dGVuc2lvbjogcGF0aC5leHRuYW1lKHVybCkuc3Vic3RyKDEpXG4gICAgICB9O1xuICAgICAgZGVmZXJyZWQucmVzb2x2ZShmaWxlKTtcbiAgICB9KVxuICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcbiAgICB9KTtcbiAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cbmZ1bmN0aW9uIHJlc3BvbnNlSGFuZGxlciAoZGVmZXJyZWQpIHtcbiAgcmV0dXJuIChlcnIsIHJlcykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYm9keSA9IHJlcy5kYXRhO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPj0gNDAwKSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGJvZHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYm9keSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChib2R5KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGVycm9ySGFuZGxlciAocmVzKSB7XG4gIGlmIChyZXMuZXJyb3JzICYmIHJlcy5lcnJvcnMubGVuZ3RoKSB7XG4gICAgcmVzLmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLm1lc3NhZ2UpO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHJlcztcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplUGFyYW1ldGVycyAocGFyYW1ldGVycykge1xuICB2YXIgcmVzdWx0O1xuXG4gIGlmICghQXJyYXkuaXNBcnJheShwYXJhbWV0ZXJzKSkge1xuICAgIHJlc3VsdCA9IFtdO1xuICAgIE9iamVjdC5rZXlzKHBhcmFtZXRlcnMpLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgb3B0aW9uczogcGFyYW1ldGVyc1tuYW1lXVxuICAgICAgfSlcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSBwYXJhbWV0ZXJzO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdfQ==
