'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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
      var config, applicationId, host, port, keys, filesDest, filesSrc, cwd, params, applicationTypes, languageSpecifications, accessKey, secretKey, client, _filesSrc, i, l, _zip, removeSourceRes, hadNoSources, addApplicationSourceRes, $set, updateApplicationRes, createApplicationProtectionRes, protectionId, download;

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
              accessKey = keys.accessKey;
              secretKey = keys.secretKey;

              if (accessKey) {
                _context.next = 15;
                break;
              }

              throw new Error('Required *accessKey* not provided');

            case 15:
              if (secretKey) {
                _context.next = 17;
                break;
              }

              throw new Error('Required *secretKey* not provided');

            case 17:
              client = new _this.Client({
                accessKey: accessKey,
                secretKey: secretKey,
                host: host,
                port: port
              });

              if (applicationId) {
                _context.next = 20;
                break;
              }

              throw new Error('Required *applicationId* not provided');

            case 20:
              if (!(!filesDest && !destCallback)) {
                _context.next = 22;
                break;
              }

              throw new Error('Required *filesDest* not provided');

            case 22:
              if (!(filesSrc && filesSrc.length)) {
                _context.next = 40;
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

              _context.next = 27;
              return (0, _zip2.zip)(filesSrc, cwd);

            case 27:
              _zip = _context.sent;
              _context.next = 30;
              return _this.removeSourceFromApplication(client, '', applicationId);

            case 30:
              removeSourceRes = _context.sent;

              if (!removeSourceRes.errors) {
                _context.next = 36;
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
                _context.next = 36;
                break;
              }

              throw new Error(removeSourceRes.errors[0].message);

            case 36:
              _context.next = 38;
              return _this.addApplicationSource(client, applicationId, {
                content: _zip.generate({ type: 'base64' }),
                filename: 'application.zip',
                extension: 'zip'
              });

            case 38:
              addApplicationSourceRes = _context.sent;

              errorHandler(addApplicationSourceRes);

            case 40:
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

              if (!($set.parameters || $set.applicationTypes || $set.languageSpecifications || typeof $set.areSubscribersOrdered !== 'undefined')) {
                _context.next = 50;
                break;
              }

              _context.next = 48;
              return _this.updateApplication(client, $set);

            case 48:
              updateApplicationRes = _context.sent;

              errorHandler(updateApplicationRes);

            case 50:
              _context.next = 52;
              return _this.createApplicationProtection(client, applicationId);

            case 52:
              createApplicationProtectionRes = _context.sent;

              errorHandler(createApplicationProtectionRes);

              protectionId = createApplicationProtectionRes.data.createApplicationProtection._id;
              _context.next = 57;
              return _this.pollProtection(client, applicationId, protectionId);

            case 57:
              _context.next = 59;
              return _this.downloadApplicationProtection(client, protectionId);

            case 59:
              download = _context.sent;

              errorHandler(download);
              (0, _zip2.unzip)(download, filesDest || destCallback);

            case 62:
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
                var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
                  var applicationProtection, state;
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
                  return ref.apply(this, arguments);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFnQkE7O0FBU0E7Ozs7OztrQkFLZTtBQUNiLDBCQURhO0FBRWIsMEJBRmE7QUFHYixzREFIYTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQThDUCxvQkE5Q08sOEJBOENhLGtCQTlDYixFQThDaUMsWUE5Q2pDLEVBOEMrQztBQUFBOztBQUFBO0FBQUEsVUFDcEQsTUFEb0QsRUFLeEQsYUFMd0QsRUFNeEQsSUFOd0QsRUFPeEQsSUFQd0QsRUFReEQsSUFSd0QsRUFTeEQsU0FUd0QsRUFVeEQsUUFWd0QsRUFXeEQsR0FYd0QsRUFZeEQsTUFad0QsRUFheEQsZ0JBYndELEVBY3hELHNCQWR3RCxFQWtCeEQsU0FsQndELEVBbUJ4RCxTQW5Cd0QsRUE4QnBELE1BOUJvRCxFQThDcEQsU0E5Q29ELEVBK0MvQyxDQS9DK0MsRUErQ3hDLENBL0N3QyxFQXdEbEQsSUF4RGtELEVBMERsRCxlQTFEa0QsRUE2RGxELFlBN0RrRCxFQXdFbEQsdUJBeEVrRCxFQWdGcEQsSUFoRm9ELEVBdUdsRCxvQkF2R2tELEVBMkdwRCw4QkEzR29ELEVBOEdwRCxZQTlHb0QsRUFpSHBELFFBakhvRDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNwRCxvQkFEb0QsR0FDM0MsT0FBTyxrQkFBUCxLQUE4QixRQUE5QixHQUNiLFFBQVEsa0JBQVIsQ0FEYSxHQUNpQixrQkFGMEI7QUFLeEQsMkJBTHdELEdBZXRELE1BZnNELENBS3hELGFBTHdEO0FBTXhELGtCQU53RCxHQWV0RCxNQWZzRCxDQU14RCxJQU53RDtBQU94RCxrQkFQd0QsR0FldEQsTUFmc0QsQ0FPeEQsSUFQd0Q7QUFReEQsa0JBUndELEdBZXRELE1BZnNELENBUXhELElBUndE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SSxNQUFKLElBQWMsSUFBSSxNQUFKLENBQVcsTUFBN0IsRUFBcUM7QUFDbkMsUUFBSSxNQUFKLENBQVcsT0FBWCxDQUFtQixVQUFVLEtBQVYsRUFBaUI7QUFDbEMsWUFBTSxJQUFJLEtBQUosQ0FBVSxNQUFNLE9BQWhCLENBQU47QUFDRCxLQUZEO0FBR0Q7O0FBRUQsU0FBTyxHQUFQO0FBQ0Q7O0FBRUQsU0FBUyxtQkFBVCxDQUE4QixVQUE5QixFQUEwQztBQUN4QyxNQUFJLE1BQUo7O0FBRUEsTUFBSSxDQUFDLE1BQU0sT0FBTixDQUFjLFVBQWQsQ0FBTCxFQUFnQztBQUM5QixhQUFTLEVBQVQ7QUFDQSxXQUFPLElBQVAsQ0FBWSxVQUFaLEVBQXdCLE9BQXhCLENBQWdDLFVBQUMsSUFBRCxFQUFVO0FBQ3hDLGFBQU8sSUFBUCxDQUFZO0FBQ1Ysa0JBRFU7QUFFVixpQkFBUyxXQUFXLElBQVg7QUFGQyxPQUFaO0FBSUQsS0FMRDtBQU1ELEdBUkQsTUFRTztBQUNMLGFBQVMsVUFBVDtBQUNEOztBQUVELFNBQU8sTUFBUDtBQUNEIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICdiYWJlbC1wb2x5ZmlsbCc7XG5cbmltcG9ydCBnbG9iIGZyb20gJ2dsb2InO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgcmVxdWVzdCBmcm9tICdheGlvcyc7XG5pbXBvcnQgUSBmcm9tICdxJztcblxuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgZ2VuZXJhdGVTaWduZWRQYXJhbXMgZnJvbSAnLi9nZW5lcmF0ZS1zaWduZWQtcGFyYW1zJztcbmltcG9ydCBKU2NyYW1ibGVyQ2xpZW50IGZyb20gJy4vY2xpZW50JztcbmltcG9ydCB7XG4gIGFkZEFwcGxpY2F0aW9uU291cmNlLFxuICBjcmVhdGVBcHBsaWNhdGlvbixcbiAgcmVtb3ZlQXBwbGljYXRpb24sXG4gIHVwZGF0ZUFwcGxpY2F0aW9uLFxuICB1cGRhdGVBcHBsaWNhdGlvblNvdXJjZSxcbiAgcmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uLFxuICBjcmVhdGVUZW1wbGF0ZSxcbiAgcmVtb3ZlVGVtcGxhdGUsXG4gIHVwZGF0ZVRlbXBsYXRlLFxuICBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24sXG4gIHJlbW92ZVByb3RlY3Rpb24sXG4gIGR1cGxpY2F0ZUFwcGxpY2F0aW9uLFxuICB1bmxvY2tBcHBsaWNhdGlvbixcbiAgYXBwbHlUZW1wbGF0ZVxufSBmcm9tICcuL211dGF0aW9ucyc7XG5pbXBvcnQge1xuICBnZXRBcHBsaWNhdGlvbixcbiAgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9ucyxcbiAgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50LFxuICBnZXRBcHBsaWNhdGlvbnMsXG4gIGdldEFwcGxpY2F0aW9uU291cmNlLFxuICBnZXRUZW1wbGF0ZXMsXG4gIGdldFByb3RlY3Rpb25cbn0gZnJvbSAnLi9xdWVyaWVzJztcbmltcG9ydCB7XG4gIHppcCxcbiAgdW56aXBcbn0gZnJvbSAnLi96aXAnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIENsaWVudDogSlNjcmFtYmxlckNsaWVudCxcbiAgY29uZmlnLFxuICBnZW5lcmF0ZVNpZ25lZFBhcmFtcyxcbiAgLy8gVGhpcyBtZXRob2QgaXMgYSBzaG9ydGN1dCBtZXRob2QgdGhhdCBhY2NlcHRzIGFuIG9iamVjdCB3aXRoIGV2ZXJ5dGhpbmcgbmVlZGVkXG4gIC8vIGZvciB0aGUgZW50aXJlIHByb2Nlc3Mgb2YgcmVxdWVzdGluZyBhbiBhcHBsaWNhdGlvbiBwcm90ZWN0aW9uIGFuZCBkb3dubG9hZGluZ1xuICAvLyB0aGF0IHNhbWUgcHJvdGVjdGlvbiB3aGVuIHRoZSBzYW1lIGVuZHMuXG4gIC8vXG4gIC8vIGBjb25maWdQYXRoT3JPYmplY3RgIGNhbiBiZSBhIHBhdGggdG8gYSBKU09OIG9yIGRpcmVjdGx5IGFuIG9iamVjdCBjb250YWluaW5nXG4gIC8vIHRoZSBmb2xsb3dpbmcgc3RydWN0dXJlOlxuICAvL1xuICAvLyBgYGBqc29uXG4gIC8vIHtcbiAgLy8gICBcImtleXNcIjoge1xuICAvLyAgICAgXCJhY2Nlc3NLZXlcIjogXCJcIixcbiAgLy8gICAgIFwic2VjcmV0S2V5XCI6IFwiXCJcbiAgLy8gICB9LFxuICAvLyAgIFwiYXBwbGljYXRpb25JZFwiOiBcIlwiLFxuICAvLyAgIFwiZmlsZXNEZXN0XCI6IFwiXCJcbiAgLy8gfVxuICAvLyBgYGBcbiAgLy9cbiAgLy8gQWxzbyB0aGUgZm9sbG93aW5nIG9wdGlvbmFsIHBhcmFtZXRlcnMgYXJlIGFjY2VwdGVkOlxuICAvL1xuICAvLyBgYGBqc29uXG4gIC8vIHtcbiAgLy8gICBcImZpbGVzU3JjXCI6IFtcIlwiXSxcbiAgLy8gICBcInBhcmFtc1wiOiB7fSxcbiAgLy8gICBcImN3ZFwiOiBcIlwiLFxuICAvLyAgIFwiaG9zdFwiOiBcImFwaS5qc2NyYW1ibGVyLmNvbVwiLFxuICAvLyAgIFwicG9ydFwiOiBcIjQ0M1wiXG4gIC8vIH1cbiAgLy8gYGBgXG4gIC8vXG4gIC8vIGBmaWxlc1NyY2Agc3VwcG9ydHMgZ2xvYiBwYXR0ZXJucywgYW5kIGlmIGl0J3MgcHJvdmlkZWQgaXQgd2lsbCByZXBsYWNlIHRoZVxuICAvLyBlbnRpcmUgYXBwbGljYXRpb24gc291cmNlcy5cbiAgLy9cbiAgLy8gYHBhcmFtc2AgaWYgcHJvdmlkZWQgd2lsbCByZXBsYWNlIGFsbCB0aGUgYXBwbGljYXRpb24gdHJhbnNmb3JtYXRpb24gcGFyYW1ldGVycy5cbiAgLy9cbiAgLy8gYGN3ZGAgYWxsb3dzIHlvdSB0byBzZXQgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgdG8gcmVzb2x2ZSBwcm9ibGVtcyB3aXRoXG4gIC8vIHJlbGF0aXZlIHBhdGhzIHdpdGggeW91ciBgZmlsZXNTcmNgIGlzIG91dHNpZGUgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuXG4gIC8vXG4gIC8vIEZpbmFsbHksIGBob3N0YCBhbmQgYHBvcnRgIGNhbiBiZSBvdmVycmlkZGVuIGlmIHlvdSB0byBlbmdhZ2Ugd2l0aCBhIGRpZmZlcmVudFxuICAvLyBlbmRwb2ludCB0aGFuIHRoZSBkZWZhdWx0IG9uZSwgdXNlZnVsIGlmIHlvdSdyZSBydW5uaW5nIGFuIGVudGVycHJpc2UgdmVyc2lvbiBvZlxuICAvLyBKc2NyYW1ibGVyIG9yIGlmIHlvdSdyZSBwcm92aWRlZCBhY2Nlc3MgdG8gYmV0YSBmZWF0dXJlcyBvZiBvdXIgcHJvZHVjdC5cbiAgLy9cbiAgYXN5bmMgcHJvdGVjdEFuZERvd25sb2FkIChjb25maWdQYXRoT3JPYmplY3QsIGRlc3RDYWxsYmFjaykge1xuICAgIGNvbnN0IGNvbmZpZyA9IHR5cGVvZiBjb25maWdQYXRoT3JPYmplY3QgPT09ICdzdHJpbmcnID9cbiAgICAgIHJlcXVpcmUoY29uZmlnUGF0aE9yT2JqZWN0KSA6IGNvbmZpZ1BhdGhPck9iamVjdDtcblxuICAgIGNvbnN0IHtcbiAgICAgIGFwcGxpY2F0aW9uSWQsXG4gICAgICBob3N0LFxuICAgICAgcG9ydCxcbiAgICAgIGtleXMsXG4gICAgICBmaWxlc0Rlc3QsXG4gICAgICBmaWxlc1NyYyxcbiAgICAgIGN3ZCxcbiAgICAgIHBhcmFtcyxcbiAgICAgIGFwcGxpY2F0aW9uVHlwZXMsXG4gICAgICBsYW5ndWFnZVNwZWNpZmljYXRpb25zXG4gICAgfSA9IGNvbmZpZztcblxuICAgIGNvbnN0IHtcbiAgICAgIGFjY2Vzc0tleSxcbiAgICAgIHNlY3JldEtleVxuICAgIH0gPSBrZXlzO1xuXG4gICAgaWYgKCFhY2Nlc3NLZXkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKmFjY2Vzc0tleSogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgaWYgKCFzZWNyZXRLZXkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKnNlY3JldEtleSogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgY29uc3QgY2xpZW50ID0gbmV3IHRoaXMuQ2xpZW50KHtcbiAgICAgIGFjY2Vzc0tleSxcbiAgICAgIHNlY3JldEtleSxcbiAgICAgIGhvc3QsXG4gICAgICBwb3J0XG4gICAgfSk7XG5cbiAgICBpZiAoIWFwcGxpY2F0aW9uSWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKmFwcGxpY2F0aW9uSWQqIG5vdCBwcm92aWRlZCcpO1xuICAgIH1cblxuICAgIGlmICghZmlsZXNEZXN0ICYmICFkZXN0Q2FsbGJhY2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgKmZpbGVzRGVzdCogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgaWYgKGZpbGVzU3JjICYmIGZpbGVzU3JjLmxlbmd0aCkge1xuICAgICAgbGV0IF9maWxlc1NyYyA9IFtdO1xuICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBmaWxlc1NyYy5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBmaWxlc1NyY1tpXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAvLyBUT0RPIFJlcGxhY2UgYGdsb2Iuc3luY2Agd2l0aCBhc3luYyB2ZXJzaW9uXG4gICAgICAgICAgX2ZpbGVzU3JjID0gX2ZpbGVzU3JjLmNvbmNhdChnbG9iLnN5bmMoZmlsZXNTcmNbaV0sIHtkb3Q6IHRydWV9KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX2ZpbGVzU3JjLnB1c2goZmlsZXNTcmNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IF96aXAgPSBhd2FpdCB6aXAoZmlsZXNTcmMsIGN3ZCk7XG5cbiAgICAgIGNvbnN0IHJlbW92ZVNvdXJjZVJlcyA9IGF3YWl0IHRoaXMucmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uKGNsaWVudCwgJycsIGFwcGxpY2F0aW9uSWQpO1xuICAgICAgaWYgKHJlbW92ZVNvdXJjZVJlcy5lcnJvcnMpIHtcbiAgICAgICAgLy8gVE9ETyBJbXBsZW1lbnQgZXJyb3IgY29kZXMgb3IgZml4IHRoaXMgaXMgb24gdGhlIHNlcnZpY2VzXG4gICAgICAgIHZhciBoYWROb1NvdXJjZXMgPSBmYWxzZTtcbiAgICAgICAgcmVtb3ZlU291cmNlUmVzLmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvci5tZXNzYWdlID09PSAnQXBwbGljYXRpb24gU291cmNlIHdpdGggdGhlIGdpdmVuIElEIGRvZXMgbm90IGV4aXN0Jykge1xuICAgICAgICAgICAgaGFkTm9Tb3VyY2VzID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIWhhZE5vU291cmNlcykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZW1vdmVTb3VyY2VSZXMuZXJyb3JzWzBdLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFkZEFwcGxpY2F0aW9uU291cmNlUmVzID0gYXdhaXQgdGhpcy5hZGRBcHBsaWNhdGlvblNvdXJjZShjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHtcbiAgICAgICAgY29udGVudDogX3ppcC5nZW5lcmF0ZSh7dHlwZTogJ2Jhc2U2NCd9KSxcbiAgICAgICAgZmlsZW5hbWU6ICdhcHBsaWNhdGlvbi56aXAnLFxuICAgICAgICBleHRlbnNpb246ICd6aXAnXG4gICAgICB9KTtcbiAgICAgIGVycm9ySGFuZGxlcihhZGRBcHBsaWNhdGlvblNvdXJjZVJlcyk7XG4gICAgfVxuXG4gICAgY29uc3QgJHNldCA9IHtcbiAgICAgIF9pZDogYXBwbGljYXRpb25JZFxuICAgIH07XG5cbiAgICBpZiAocGFyYW1zICYmIE9iamVjdC5rZXlzKHBhcmFtcykubGVuZ3RoKSB7XG4gICAgICAkc2V0LnBhcmFtZXRlcnMgPSBKU09OLnN0cmluZ2lmeShub3JtYWxpemVQYXJhbWV0ZXJzKHBhcmFtcykpO1xuICAgICAgJHNldC5hcmVTdWJzY3JpYmVyc09yZGVyZWQgPSBBcnJheS5pc0FycmF5KHBhcmFtcyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhcmVTdWJzY3JpYmVyc09yZGVyZWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAkc2V0LmFyZVN1YnNjcmliZXJzT3JkZXJlZCA9IGFyZVN1YnNjcmliZXJzT3JkZXJlZDtcbiAgICB9XG5cbiAgICBpZiAoYXBwbGljYXRpb25UeXBlcykge1xuICAgICAgJHNldC5hcHBsaWNhdGlvblR5cGVzID0gYXBwbGljYXRpb25UeXBlcztcbiAgICB9XG5cbiAgICBpZiAobGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucykge1xuICAgICAgJHNldC5sYW5ndWFnZVNwZWNpZmljYXRpb25zID0gbGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucztcbiAgICB9XG5cbiAgICBpZiAoJHNldC5wYXJhbWV0ZXJzIHx8ICRzZXQuYXBwbGljYXRpb25UeXBlcyB8fCAkc2V0Lmxhbmd1YWdlU3BlY2lmaWNhdGlvbnMgfHxcbiAgICAgICAgdHlwZW9mICRzZXQuYXJlU3Vic2NyaWJlcnNPcmRlcmVkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc3QgdXBkYXRlQXBwbGljYXRpb25SZXMgPSBhd2FpdCB0aGlzLnVwZGF0ZUFwcGxpY2F0aW9uKGNsaWVudCwgJHNldCk7XG4gICAgICBlcnJvckhhbmRsZXIodXBkYXRlQXBwbGljYXRpb25SZXMpO1xuICAgIH1cblxuICAgIGNvbnN0IGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcyA9IGF3YWl0IHRoaXMuY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uKGNsaWVudCwgYXBwbGljYXRpb25JZCk7XG4gICAgZXJyb3JIYW5kbGVyKGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcyk7XG5cbiAgICBjb25zdCBwcm90ZWN0aW9uSWQgPSBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb25SZXMuZGF0YS5jcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24uX2lkO1xuICAgIGF3YWl0IHRoaXMucG9sbFByb3RlY3Rpb24oY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQpO1xuXG4gICAgY29uc3QgZG93bmxvYWQgPSBhd2FpdCB0aGlzLmRvd25sb2FkQXBwbGljYXRpb25Qcm90ZWN0aW9uKGNsaWVudCwgcHJvdGVjdGlvbklkKTtcbiAgICBlcnJvckhhbmRsZXIoZG93bmxvYWQpO1xuICAgIHVuemlwKGRvd25sb2FkLCBmaWxlc0Rlc3QgfHwgZGVzdENhbGxiYWNrKTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgcG9sbFByb3RlY3Rpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cbiAgICBjb25zdCBwb2xsID0gYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgYXBwbGljYXRpb25Qcm90ZWN0aW9uID0gYXdhaXQgdGhpcy5nZXRBcHBsaWNhdGlvblByb3RlY3Rpb24oY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQpO1xuICAgICAgaWYgKGFwcGxpY2F0aW9uUHJvdGVjdGlvbi5lcnJvcnMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciBwb2xsaW5nIHByb3RlY3Rpb24nKTtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdFcnJvciBwb2xsaW5nIHByb3RlY3Rpb24nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gYXBwbGljYXRpb25Qcm90ZWN0aW9uLmRhdGEuYXBwbGljYXRpb25Qcm90ZWN0aW9uLnN0YXRlO1xuICAgICAgICBpZiAoc3RhdGUgIT09ICdmaW5pc2hlZCcgJiYgc3RhdGUgIT09ICdlcnJvcmVkJykge1xuICAgICAgICAgIHNldFRpbWVvdXQocG9sbCwgNTAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcG9sbCgpO1xuXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGNyZWF0ZUFwcGxpY2F0aW9uIChjbGllbnQsIGRhdGEsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBjcmVhdGVBcHBsaWNhdGlvbihkYXRhLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZHVwbGljYXRlQXBwbGljYXRpb24gKGNsaWVudCwgZGF0YSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGR1cGxpY2F0ZUFwcGxpY2F0aW9uKGRhdGEsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyByZW1vdmVBcHBsaWNhdGlvbiAoY2xpZW50LCBpZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCByZW1vdmVBcHBsaWNhdGlvbihpZCksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyByZW1vdmVQcm90ZWN0aW9uIChjbGllbnQsIGlkLCBhcHBJZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHJlbW92ZVByb3RlY3Rpb24oaWQsIGFwcElkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgdXBkYXRlQXBwbGljYXRpb24gKGNsaWVudCwgYXBwbGljYXRpb24sIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCB1cGRhdGVBcHBsaWNhdGlvbihhcHBsaWNhdGlvbiwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHVubG9ja0FwcGxpY2F0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgdW5sb2NrQXBwbGljYXRpb24oYXBwbGljYXRpb24sIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvbihhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25Tb3VyY2UgKGNsaWVudCwgc291cmNlSWQsIGZyYWdtZW50cywgbGltaXRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb25Tb3VyY2Uoc291cmNlSWQsIGZyYWdtZW50cywgbGltaXRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnMgKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcGFyYW1zLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zKGFwcGxpY2F0aW9uSWQsIHBhcmFtcywgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudCAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zQ291bnQoYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGNyZWF0ZVRlbXBsYXRlIChjbGllbnQsIHRlbXBsYXRlLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgY3JlYXRlVGVtcGxhdGUodGVtcGxhdGUsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyByZW1vdmVUZW1wbGF0ZSAoY2xpZW50LCBpZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCByZW1vdmVUZW1wbGF0ZShpZCksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRUZW1wbGF0ZXMgKGNsaWVudCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0VGVtcGxhdGVzKGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvbnMgKGNsaWVudCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb25zKGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBhZGRBcHBsaWNhdGlvblNvdXJjZSAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBhcHBsaWNhdGlvblNvdXJjZSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGFkZEFwcGxpY2F0aW9uU291cmNlKGFwcGxpY2F0aW9uSWQsIGFwcGxpY2F0aW9uU291cmNlLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgYWRkQXBwbGljYXRpb25Tb3VyY2VGcm9tVVJMIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHVybCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgcmV0dXJuIGdldEZpbGVGcm9tVXJsKGNsaWVudCwgdXJsKVxuICAgICAgLnRoZW4oZnVuY3Rpb24oZmlsZSkge1xuICAgICAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgYWRkQXBwbGljYXRpb25Tb3VyY2UoYXBwbGljYXRpb25JZCwgZmlsZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgfSk7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHVwZGF0ZUFwcGxpY2F0aW9uU291cmNlIChjbGllbnQsIGFwcGxpY2F0aW9uU291cmNlLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgdXBkYXRlQXBwbGljYXRpb25Tb3VyY2UoYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyByZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24gKGNsaWVudCwgc291cmNlSWQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCByZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24oc291cmNlSWQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBhcHBseVRlbXBsYXRlIChjbGllbnQsIHRlbXBsYXRlSWQsIGFwcElkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgYXBwbHlUZW1wbGF0ZSh0ZW1wbGF0ZUlkLCBhcHBJZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHVwZGF0ZVRlbXBsYXRlIChjbGllbnQsIHRlbXBsYXRlLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgdXBkYXRlVGVtcGxhdGUodGVtcGxhdGUsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbihhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHByb3RlY3Rpb25JZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0UHJvdGVjdGlvbihhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBkb3dubG9hZEFwcGxpY2F0aW9uUHJvdGVjdGlvbiAoY2xpZW50LCBwcm90ZWN0aW9uSWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KGAvYXBwbGljYXRpb24vZG93bmxvYWQvJHtwcm90ZWN0aW9uSWR9YCwgbnVsbCwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSwgZmFsc2UpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9XG59O1xuXG5mdW5jdGlvbiBnZXRGaWxlRnJvbVVybCAoY2xpZW50LCB1cmwpIHtcbiAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gIHZhciBmaWxlO1xuICByZXF1ZXN0LmdldCh1cmwpXG4gICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgZmlsZSA9IHtcbiAgICAgICAgY29udGVudDogcmVzLmRhdGEsXG4gICAgICAgIGZpbGVuYW1lOiBwYXRoLmJhc2VuYW1lKHVybCksXG4gICAgICAgIGV4dGVuc2lvbjogcGF0aC5leHRuYW1lKHVybCkuc3Vic3RyKDEpXG4gICAgICB9O1xuICAgICAgZGVmZXJyZWQucmVzb2x2ZShmaWxlKTtcbiAgICB9KVxuICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcbiAgICB9KTtcbiAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cbmZ1bmN0aW9uIHJlc3BvbnNlSGFuZGxlciAoZGVmZXJyZWQpIHtcbiAgcmV0dXJuIChlcnIsIHJlcykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYm9keSA9IHJlcy5kYXRhO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPj0gNDAwKSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGJvZHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYm9keSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChib2R5KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGVycm9ySGFuZGxlciAocmVzKSB7XG4gIGlmIChyZXMuZXJyb3JzICYmIHJlcy5lcnJvcnMubGVuZ3RoKSB7XG4gICAgcmVzLmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLm1lc3NhZ2UpO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHJlcztcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplUGFyYW1ldGVycyAocGFyYW1ldGVycykge1xuICB2YXIgcmVzdWx0O1xuXG4gIGlmICghQXJyYXkuaXNBcnJheShwYXJhbWV0ZXJzKSkge1xuICAgIHJlc3VsdCA9IFtdO1xuICAgIE9iamVjdC5rZXlzKHBhcmFtZXRlcnMpLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgb3B0aW9uczogcGFyYW1ldGVyc1tuYW1lXVxuICAgICAgfSlcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSBwYXJhbWV0ZXJzO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdfQ==
