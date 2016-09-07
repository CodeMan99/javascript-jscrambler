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

              console.log('dafuq', cwd);
              console.log(config);
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

              if (!($set.parameters || $set.applicationTypes || $set.languageSpecifications || typeof $set.areSubscribersOrdered !== 'undefined')) {
                _context.next = 48;
                break;
              }

              _context.next = 46;
              return _this.updateApplication(client, $set);

            case 46:
              updateApplicationRes = _context.sent;

              errorHandler(updateApplicationRes);

            case 48:
              _context.next = 50;
              return _this.createApplicationProtection(client, applicationId);

            case 50:
              createApplicationProtectionRes = _context.sent;

              errorHandler(createApplicationProtectionRes);

              protectionId = createApplicationProtectionRes.data.createApplicationProtection._id;
              _context.next = 55;
              return _this.pollProtection(client, applicationId, protectionId);

            case 55:
              _context.next = 57;
              return _this.downloadApplicationProtection(client, protectionId);

            case 57:
              download = _context.sent;

              errorHandler(download);
              (0, _zip2.unzip)(download, filesDest || destCallback);

            case 60:
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvaW5kZXguanMiXSwibmFtZXMiOlsiQ2xpZW50IiwiY29uZmlnIiwiZ2VuZXJhdGVTaWduZWRQYXJhbXMiLCJwcm90ZWN0QW5kRG93bmxvYWQiLCJjb25maWdQYXRoT3JPYmplY3QiLCJkZXN0Q2FsbGJhY2siLCJyZXF1aXJlIiwiYXBwbGljYXRpb25JZCIsImhvc3QiLCJwb3J0Iiwia2V5cyIsImZpbGVzRGVzdCIsImZpbGVzU3JjIiwiY3dkIiwicGFyYW1zIiwiYXBwbGljYXRpb25UeXBlcyIsImxhbmd1YWdlU3BlY2lmaWNhdGlvbnMiLCJjb25zb2xlIiwibG9nIiwiYWNjZXNzS2V5Iiwic2VjcmV0S2V5IiwiY2xpZW50IiwiRXJyb3IiLCJsZW5ndGgiLCJfZmlsZXNTcmMiLCJpIiwibCIsImNvbmNhdCIsInN5bmMiLCJkb3QiLCJwdXNoIiwiX3ppcCIsInJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbiIsInJlbW92ZVNvdXJjZVJlcyIsImVycm9ycyIsImhhZE5vU291cmNlcyIsImZvckVhY2giLCJlcnJvciIsIm1lc3NhZ2UiLCJhZGRBcHBsaWNhdGlvblNvdXJjZSIsImNvbnRlbnQiLCJnZW5lcmF0ZSIsInR5cGUiLCJmaWxlbmFtZSIsImV4dGVuc2lvbiIsImFkZEFwcGxpY2F0aW9uU291cmNlUmVzIiwiZXJyb3JIYW5kbGVyIiwiJHNldCIsIl9pZCIsIk9iamVjdCIsInBhcmFtZXRlcnMiLCJKU09OIiwic3RyaW5naWZ5Iiwibm9ybWFsaXplUGFyYW1ldGVycyIsImFyZVN1YnNjcmliZXJzT3JkZXJlZCIsIkFycmF5IiwiaXNBcnJheSIsInVwZGF0ZUFwcGxpY2F0aW9uIiwidXBkYXRlQXBwbGljYXRpb25SZXMiLCJjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24iLCJjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb25SZXMiLCJwcm90ZWN0aW9uSWQiLCJkYXRhIiwicG9sbFByb3RlY3Rpb24iLCJkb3dubG9hZEFwcGxpY2F0aW9uUHJvdGVjdGlvbiIsImRvd25sb2FkIiwiZGVmZXJyZWQiLCJkZWZlciIsInBvbGwiLCJnZXRBcHBsaWNhdGlvblByb3RlY3Rpb24iLCJhcHBsaWNhdGlvblByb3RlY3Rpb24iLCJzdGF0ZSIsInNldFRpbWVvdXQiLCJ1cmwiLCJyZWplY3QiLCJyZXNvbHZlIiwicHJvbWlzZSIsImNyZWF0ZUFwcGxpY2F0aW9uIiwiZnJhZ21lbnRzIiwicG9zdCIsInJlc3BvbnNlSGFuZGxlciIsImR1cGxpY2F0ZUFwcGxpY2F0aW9uIiwicmVtb3ZlQXBwbGljYXRpb24iLCJpZCIsInJlbW92ZVByb3RlY3Rpb24iLCJhcHBJZCIsImFwcGxpY2F0aW9uIiwidW5sb2NrQXBwbGljYXRpb24iLCJnZXRBcHBsaWNhdGlvbiIsImdldCIsImdldEFwcGxpY2F0aW9uU291cmNlIiwic291cmNlSWQiLCJsaW1pdHMiLCJnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zIiwiZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50IiwiY3JlYXRlVGVtcGxhdGUiLCJ0ZW1wbGF0ZSIsInJlbW92ZVRlbXBsYXRlIiwiZ2V0VGVtcGxhdGVzIiwiZ2V0QXBwbGljYXRpb25zIiwiYXBwbGljYXRpb25Tb3VyY2UiLCJhZGRBcHBsaWNhdGlvblNvdXJjZUZyb21VUkwiLCJnZXRGaWxlRnJvbVVybCIsInRoZW4iLCJmaWxlIiwidXBkYXRlQXBwbGljYXRpb25Tb3VyY2UiLCJhcHBseVRlbXBsYXRlIiwidGVtcGxhdGVJZCIsInVwZGF0ZVRlbXBsYXRlIiwicmVzIiwiYmFzZW5hbWUiLCJleHRuYW1lIiwic3Vic3RyIiwiY2F0Y2giLCJlcnIiLCJib2R5Iiwic3RhdHVzIiwiZXgiLCJyZXN1bHQiLCJuYW1lIiwib3B0aW9ucyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFnQkE7O0FBU0E7Ozs7OztrQkFLZTtBQUNiQSww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LElBQWY7QUFDQSxVQUFJO0FBQ0YsWUFBSStDLElBQUlPLE1BQUosSUFBYyxHQUFsQixFQUF1QjtBQUNyQmxELG1CQUFTUSxNQUFULENBQWdCeUMsSUFBaEI7QUFDRCxTQUZELE1BRU87QUFDTGpELG1CQUFTUyxPQUFULENBQWlCd0MsSUFBakI7QUFDRDtBQUNGLE9BTkQsQ0FNRSxPQUFPRSxFQUFQLEVBQVc7QUFDWG5ELGlCQUFTUSxNQUFULENBQWdCeUMsSUFBaEI7QUFDRDtBQUNGO0FBQ0YsR0FmRDtBQWdCRDs7QUFFRCxTQUFTckUsWUFBVCxDQUF1QitELEdBQXZCLEVBQTRCO0FBQzFCLE1BQUlBLElBQUkzRSxNQUFKLElBQWMyRSxJQUFJM0UsTUFBSixDQUFXWCxNQUE3QixFQUFxQztBQUNuQ3NGLFFBQUkzRSxNQUFKLENBQVdFLE9BQVgsQ0FBbUIsVUFBVUMsS0FBVixFQUFpQjtBQUNsQyxZQUFNLElBQUlmLEtBQUosQ0FBVWUsTUFBTUMsT0FBaEIsQ0FBTjtBQUNELEtBRkQ7QUFHRDs7QUFFRCxTQUFPdUUsR0FBUDtBQUNEOztBQUVELFNBQVN4RCxtQkFBVCxDQUE4QkgsVUFBOUIsRUFBMEM7QUFDeEMsTUFBSW9FLE1BQUo7O0FBRUEsTUFBSSxDQUFDL0QsTUFBTUMsT0FBTixDQUFjTixVQUFkLENBQUwsRUFBZ0M7QUFDOUJvRSxhQUFTLEVBQVQ7QUFDQXJFLFdBQU92QyxJQUFQLENBQVl3QyxVQUFaLEVBQXdCZCxPQUF4QixDQUFnQyxVQUFDbUYsSUFBRCxFQUFVO0FBQ3hDRCxhQUFPeEYsSUFBUCxDQUFZO0FBQ1Z5RixrQkFEVTtBQUVWQyxpQkFBU3RFLFdBQVdxRSxJQUFYO0FBRkMsT0FBWjtBQUlELEtBTEQ7QUFNRCxHQVJELE1BUU87QUFDTEQsYUFBU3BFLFVBQVQ7QUFDRDs7QUFFRCxTQUFPb0UsTUFBUDtBQUNEIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICdiYWJlbC1wb2x5ZmlsbCc7XG5cbmltcG9ydCBnbG9iIGZyb20gJ2dsb2InO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgcmVxdWVzdCBmcm9tICdheGlvcyc7XG5pbXBvcnQgUSBmcm9tICdxJztcblxuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgZ2VuZXJhdGVTaWduZWRQYXJhbXMgZnJvbSAnLi9nZW5lcmF0ZS1zaWduZWQtcGFyYW1zJztcbmltcG9ydCBKU2NyYW1ibGVyQ2xpZW50IGZyb20gJy4vY2xpZW50JztcbmltcG9ydCB7XG4gIGFkZEFwcGxpY2F0aW9uU291cmNlLFxuICBjcmVhdGVBcHBsaWNhdGlvbixcbiAgcmVtb3ZlQXBwbGljYXRpb24sXG4gIHVwZGF0ZUFwcGxpY2F0aW9uLFxuICB1cGRhdGVBcHBsaWNhdGlvblNvdXJjZSxcbiAgcmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uLFxuICBjcmVhdGVUZW1wbGF0ZSxcbiAgcmVtb3ZlVGVtcGxhdGUsXG4gIHVwZGF0ZVRlbXBsYXRlLFxuICBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24sXG4gIHJlbW92ZVByb3RlY3Rpb24sXG4gIGR1cGxpY2F0ZUFwcGxpY2F0aW9uLFxuICB1bmxvY2tBcHBsaWNhdGlvbixcbiAgYXBwbHlUZW1wbGF0ZVxufSBmcm9tICcuL211dGF0aW9ucyc7XG5pbXBvcnQge1xuICBnZXRBcHBsaWNhdGlvbixcbiAgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9ucyxcbiAgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50LFxuICBnZXRBcHBsaWNhdGlvbnMsXG4gIGdldEFwcGxpY2F0aW9uU291cmNlLFxuICBnZXRUZW1wbGF0ZXMsXG4gIGdldFByb3RlY3Rpb25cbn0gZnJvbSAnLi9xdWVyaWVzJztcbmltcG9ydCB7XG4gIHppcCxcbiAgdW56aXBcbn0gZnJvbSAnLi96aXAnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIENsaWVudDogSlNjcmFtYmxlckNsaWVudCxcbiAgY29uZmlnLFxuICBnZW5lcmF0ZVNpZ25lZFBhcmFtcyxcbiAgLy8gVGhpcyBtZXRob2QgaXMgYSBzaG9ydGN1dCBtZXRob2QgdGhhdCBhY2NlcHRzIGFuIG9iamVjdCB3aXRoIGV2ZXJ5dGhpbmcgbmVlZGVkXG4gIC8vIGZvciB0aGUgZW50aXJlIHByb2Nlc3Mgb2YgcmVxdWVzdGluZyBhbiBhcHBsaWNhdGlvbiBwcm90ZWN0aW9uIGFuZCBkb3dubG9hZGluZ1xuICAvLyB0aGF0IHNhbWUgcHJvdGVjdGlvbiB3aGVuIHRoZSBzYW1lIGVuZHMuXG4gIC8vXG4gIC8vIGBjb25maWdQYXRoT3JPYmplY3RgIGNhbiBiZSBhIHBhdGggdG8gYSBKU09OIG9yIGRpcmVjdGx5IGFuIG9iamVjdCBjb250YWluaW5nXG4gIC8vIHRoZSBmb2xsb3dpbmcgc3RydWN0dXJlOlxuICAvL1xuICAvLyBgYGBqc29uXG4gIC8vIHtcbiAgLy8gICBcImtleXNcIjoge1xuICAvLyAgICAgXCJhY2Nlc3NLZXlcIjogXCJcIixcbiAgLy8gICAgIFwic2VjcmV0S2V5XCI6IFwiXCJcbiAgLy8gICB9LFxuICAvLyAgIFwiYXBwbGljYXRpb25JZFwiOiBcIlwiLFxuICAvLyAgIFwiZmlsZXNEZXN0XCI6IFwiXCJcbiAgLy8gfVxuICAvLyBgYGBcbiAgLy9cbiAgLy8gQWxzbyB0aGUgZm9sbG93aW5nIG9wdGlvbmFsIHBhcmFtZXRlcnMgYXJlIGFjY2VwdGVkOlxuICAvL1xuICAvLyBgYGBqc29uXG4gIC8vIHtcbiAgLy8gICBcImZpbGVzU3JjXCI6IFtcIlwiXSxcbiAgLy8gICBcInBhcmFtc1wiOiB7fSxcbiAgLy8gICBcImN3ZFwiOiBcIlwiLFxuICAvLyAgIFwiaG9zdFwiOiBcImFwaS5qc2NyYW1ibGVyLmNvbVwiLFxuICAvLyAgIFwicG9ydFwiOiBcIjQ0M1wiXG4gIC8vIH1cbiAgLy8gYGBgXG4gIC8vXG4gIC8vIGBmaWxlc1NyY2Agc3VwcG9ydHMgZ2xvYiBwYXR0ZXJucywgYW5kIGlmIGl0J3MgcHJvdmlkZWQgaXQgd2lsbCByZXBsYWNlIHRoZVxuICAvLyBlbnRpcmUgYXBwbGljYXRpb24gc291cmNlcy5cbiAgLy9cbiAgLy8gYHBhcmFtc2AgaWYgcHJvdmlkZWQgd2lsbCByZXBsYWNlIGFsbCB0aGUgYXBwbGljYXRpb24gdHJhbnNmb3JtYXRpb24gcGFyYW1ldGVycy5cbiAgLy9cbiAgLy8gYGN3ZGAgYWxsb3dzIHlvdSB0byBzZXQgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgdG8gcmVzb2x2ZSBwcm9ibGVtcyB3aXRoXG4gIC8vIHJlbGF0aXZlIHBhdGhzIHdpdGggeW91ciBgZmlsZXNTcmNgIGlzIG91dHNpZGUgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuXG4gIC8vXG4gIC8vIEZpbmFsbHksIGBob3N0YCBhbmQgYHBvcnRgIGNhbiBiZSBvdmVycmlkZGVuIGlmIHlvdSB0byBlbmdhZ2Ugd2l0aCBhIGRpZmZlcmVudFxuICAvLyBlbmRwb2ludCB0aGFuIHRoZSBkZWZhdWx0IG9uZSwgdXNlZnVsIGlmIHlvdSdyZSBydW5uaW5nIGFuIGVudGVycHJpc2UgdmVyc2lvbiBvZlxuICAvLyBKc2NyYW1ibGVyIG9yIGlmIHlvdSdyZSBwcm92aWRlZCBhY2Nlc3MgdG8gYmV0YSBmZWF0dXJlcyBvZiBvdXIgcHJvZHVjdC5cbiAgLy9cbiAgYXN5bmMgcHJvdGVjdEFuZERvd25sb2FkIChjb25maWdQYXRoT3JPYmplY3QsIGRlc3RDYWxsYmFjaykge1xuICAgIGNvbnN0IGNvbmZpZyA9IHR5cGVvZiBjb25maWdQYXRoT3JPYmplY3QgPT09ICdzdHJpbmcnID9cbiAgICAgIHJlcXVpcmUoY29uZmlnUGF0aE9yT2JqZWN0KSA6IGNvbmZpZ1BhdGhPck9iamVjdDtcblxuICAgIGNvbnN0IHtcbiAgICAgIGFwcGxpY2F0aW9uSWQsXG4gICAgICBob3N0LFxuICAgICAgcG9ydCxcbiAgICAgIGtleXMsXG4gICAgICBmaWxlc0Rlc3QsXG4gICAgICBmaWxlc1NyYyxcbiAgICAgIGN3ZCxcbiAgICAgIHBhcmFtcyxcbiAgICAgIGFwcGxpY2F0aW9uVHlwZXMsXG4gICAgICBsYW5ndWFnZVNwZWNpZmljYXRpb25zXG4gICAgfSA9IGNvbmZpZztcbiAgICBjb25zb2xlLmxvZygnZGFmdXEnLCBjd2QpO1xuICAgIGNvbnNvbGUubG9nKGNvbmZpZyk7XG4gICAgY29uc3Qge1xuICAgICAgYWNjZXNzS2V5LFxuICAgICAgc2VjcmV0S2V5XG4gICAgfSA9IGtleXM7XG5cbiAgICBjb25zdCBjbGllbnQgPSBuZXcgdGhpcy5DbGllbnQoe1xuICAgICAgYWNjZXNzS2V5LFxuICAgICAgc2VjcmV0S2V5LFxuICAgICAgaG9zdCxcbiAgICAgIHBvcnRcbiAgICB9KTtcblxuICAgIGlmICghYXBwbGljYXRpb25JZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXF1aXJlZCAqYXBwbGljYXRpb25JZCogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgaWYgKCFmaWxlc0Rlc3QgJiYgIWRlc3RDYWxsYmFjaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXF1aXJlZCAqZmlsZXNEZXN0KiBub3QgcHJvdmlkZWQnKTtcbiAgICB9XG5cbiAgICBpZiAoZmlsZXNTcmMgJiYgZmlsZXNTcmMubGVuZ3RoKSB7XG4gICAgICBsZXQgX2ZpbGVzU3JjID0gW107XG4gICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGZpbGVzU3JjLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgICBpZiAodHlwZW9mIGZpbGVzU3JjW2ldID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIC8vIFRPRE8gUmVwbGFjZSBgZ2xvYi5zeW5jYCB3aXRoIGFzeW5jIHZlcnNpb25cbiAgICAgICAgICBfZmlsZXNTcmMgPSBfZmlsZXNTcmMuY29uY2F0KGdsb2Iuc3luYyhmaWxlc1NyY1tpXSwge2RvdDogdHJ1ZX0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfZmlsZXNTcmMucHVzaChmaWxlc1NyY1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgX3ppcCA9IGF3YWl0IHppcChfZmlsZXNTcmMsIGN3ZCk7XG5cbiAgICAgIGNvbnN0IHJlbW92ZVNvdXJjZVJlcyA9IGF3YWl0IHRoaXMucmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uKGNsaWVudCwgJycsIGFwcGxpY2F0aW9uSWQpO1xuICAgICAgaWYgKHJlbW92ZVNvdXJjZVJlcy5lcnJvcnMpIHtcbiAgICAgICAgLy8gVE9ETyBJbXBsZW1lbnQgZXJyb3IgY29kZXMgb3IgZml4IHRoaXMgaXMgb24gdGhlIHNlcnZpY2VzXG4gICAgICAgIHZhciBoYWROb1NvdXJjZXMgPSBmYWxzZTtcbiAgICAgICAgcmVtb3ZlU291cmNlUmVzLmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvci5tZXNzYWdlID09PSAnQXBwbGljYXRpb24gU291cmNlIHdpdGggdGhlIGdpdmVuIElEIGRvZXMgbm90IGV4aXN0Jykge1xuICAgICAgICAgICAgaGFkTm9Tb3VyY2VzID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIWhhZE5vU291cmNlcykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZW1vdmVTb3VyY2VSZXMuZXJyb3JzWzBdLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFkZEFwcGxpY2F0aW9uU291cmNlUmVzID0gYXdhaXQgdGhpcy5hZGRBcHBsaWNhdGlvblNvdXJjZShjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHtcbiAgICAgICAgY29udGVudDogX3ppcC5nZW5lcmF0ZSh7dHlwZTogJ2Jhc2U2NCd9KSxcbiAgICAgICAgZmlsZW5hbWU6ICdhcHBsaWNhdGlvbi56aXAnLFxuICAgICAgICBleHRlbnNpb246ICd6aXAnXG4gICAgICB9KTtcbiAgICAgIGVycm9ySGFuZGxlcihhZGRBcHBsaWNhdGlvblNvdXJjZVJlcyk7XG4gICAgfVxuXG4gICAgY29uc3QgJHNldCA9IHtcbiAgICAgIF9pZDogYXBwbGljYXRpb25JZFxuICAgIH07XG5cbiAgICBpZiAocGFyYW1zICYmIE9iamVjdC5rZXlzKHBhcmFtcykubGVuZ3RoKSB7XG4gICAgICAkc2V0LnBhcmFtZXRlcnMgPSBKU09OLnN0cmluZ2lmeShub3JtYWxpemVQYXJhbWV0ZXJzKHBhcmFtcykpO1xuICAgICAgJHNldC5hcmVTdWJzY3JpYmVyc09yZGVyZWQgPSBBcnJheS5pc0FycmF5KHBhcmFtcyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhcmVTdWJzY3JpYmVyc09yZGVyZWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAkc2V0LmFyZVN1YnNjcmliZXJzT3JkZXJlZCA9IGFyZVN1YnNjcmliZXJzT3JkZXJlZDtcbiAgICB9XG5cbiAgICBpZiAoYXBwbGljYXRpb25UeXBlcykge1xuICAgICAgJHNldC5hcHBsaWNhdGlvblR5cGVzID0gYXBwbGljYXRpb25UeXBlcztcbiAgICB9XG5cbiAgICBpZiAobGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucykge1xuICAgICAgJHNldC5sYW5ndWFnZVNwZWNpZmljYXRpb25zID0gbGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucztcbiAgICB9XG5cbiAgICBpZiAoJHNldC5wYXJhbWV0ZXJzIHx8ICRzZXQuYXBwbGljYXRpb25UeXBlcyB8fCAkc2V0Lmxhbmd1YWdlU3BlY2lmaWNhdGlvbnMgfHxcbiAgICAgICAgdHlwZW9mICRzZXQuYXJlU3Vic2NyaWJlcnNPcmRlcmVkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc3QgdXBkYXRlQXBwbGljYXRpb25SZXMgPSBhd2FpdCB0aGlzLnVwZGF0ZUFwcGxpY2F0aW9uKGNsaWVudCwgJHNldCk7XG4gICAgICBlcnJvckhhbmRsZXIodXBkYXRlQXBwbGljYXRpb25SZXMpO1xuICAgIH1cblxuICAgIGNvbnN0IGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcyA9IGF3YWl0IHRoaXMuY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uKGNsaWVudCwgYXBwbGljYXRpb25JZCk7XG4gICAgZXJyb3JIYW5kbGVyKGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcyk7XG5cbiAgICBjb25zdCBwcm90ZWN0aW9uSWQgPSBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb25SZXMuZGF0YS5jcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24uX2lkO1xuICAgIGF3YWl0IHRoaXMucG9sbFByb3RlY3Rpb24oY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQpO1xuXG4gICAgY29uc3QgZG93bmxvYWQgPSBhd2FpdCB0aGlzLmRvd25sb2FkQXBwbGljYXRpb25Qcm90ZWN0aW9uKGNsaWVudCwgcHJvdGVjdGlvbklkKTtcbiAgICBlcnJvckhhbmRsZXIoZG93bmxvYWQpO1xuICAgIHVuemlwKGRvd25sb2FkLCBmaWxlc0Rlc3QgfHwgZGVzdENhbGxiYWNrKTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgcG9sbFByb3RlY3Rpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cbiAgICBjb25zdCBwb2xsID0gYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgYXBwbGljYXRpb25Qcm90ZWN0aW9uID0gYXdhaXQgdGhpcy5nZXRBcHBsaWNhdGlvblByb3RlY3Rpb24oY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQpO1xuICAgICAgaWYgKGFwcGxpY2F0aW9uUHJvdGVjdGlvbi5lcnJvcnMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciBwb2xsaW5nIHByb3RlY3Rpb24nKTtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdFcnJvciBwb2xsaW5nIHByb3RlY3Rpb24nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gYXBwbGljYXRpb25Qcm90ZWN0aW9uLmRhdGEuYXBwbGljYXRpb25Qcm90ZWN0aW9uLnN0YXRlO1xuICAgICAgICBpZiAoc3RhdGUgIT09ICdmaW5pc2hlZCcgJiYgc3RhdGUgIT09ICdlcnJvcmVkJykge1xuICAgICAgICAgIHNldFRpbWVvdXQocG9sbCwgNTAwKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gJ2Vycm9yZWQnKSB7XG4gICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vYXBwLmpzY3JhbWJsZXIuY29tL2FwcC8ke2FwcGxpY2F0aW9uSWR9L3Byb3RlY3Rpb25zLyR7cHJvdGVjdGlvbklkfWA7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGBQcm90ZWN0aW9uIGZhaWxlZC4gRm9yIG1vcmUgaW5mb3JtYXRpb24gdmlzaXQ6ICR7dXJsfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBwb2xsKCk7XG5cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgY3JlYXRlQXBwbGljYXRpb24gKGNsaWVudCwgZGF0YSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGNyZWF0ZUFwcGxpY2F0aW9uKGRhdGEsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBkdXBsaWNhdGVBcHBsaWNhdGlvbiAoY2xpZW50LCBkYXRhLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgZHVwbGljYXRlQXBwbGljYXRpb24oZGF0YSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHJlbW92ZUFwcGxpY2F0aW9uIChjbGllbnQsIGlkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHJlbW92ZUFwcGxpY2F0aW9uKGlkKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHJlbW92ZVByb3RlY3Rpb24gKGNsaWVudCwgaWQsIGFwcElkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgcmVtb3ZlUHJvdGVjdGlvbihpZCwgYXBwSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyB1cGRhdGVBcHBsaWNhdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbiwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHVwZGF0ZUFwcGxpY2F0aW9uKGFwcGxpY2F0aW9uLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgdW5sb2NrQXBwbGljYXRpb24gKGNsaWVudCwgYXBwbGljYXRpb24sIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCB1bmxvY2tBcHBsaWNhdGlvbihhcHBsaWNhdGlvbiwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9uKGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblNvdXJjZSAoY2xpZW50LCBzb3VyY2VJZCwgZnJhZ21lbnRzLCBsaW1pdHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvblNvdXJjZShzb3VyY2VJZCwgZnJhZ21lbnRzLCBsaW1pdHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9ucyAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwYXJhbXMsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnMoYXBwbGljYXRpb25JZCwgcGFyYW1zLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50IChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudChhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgY3JlYXRlVGVtcGxhdGUgKGNsaWVudCwgdGVtcGxhdGUsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBjcmVhdGVUZW1wbGF0ZSh0ZW1wbGF0ZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHJlbW92ZVRlbXBsYXRlIChjbGllbnQsIGlkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHJlbW92ZVRlbXBsYXRlKGlkKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldFRlbXBsYXRlcyAoY2xpZW50LCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRUZW1wbGF0ZXMoZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9ucyAoY2xpZW50LCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvbnMoZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGFkZEFwcGxpY2F0aW9uU291cmNlIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIGFwcGxpY2F0aW9uU291cmNlLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgYWRkQXBwbGljYXRpb25Tb3VyY2UoYXBwbGljYXRpb25JZCwgYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBhZGRBcHBsaWNhdGlvblNvdXJjZUZyb21VUkwgKGNsaWVudCwgYXBwbGljYXRpb25JZCwgdXJsLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICByZXR1cm4gZ2V0RmlsZUZyb21VcmwoY2xpZW50LCB1cmwpXG4gICAgICAudGhlbihmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBhZGRBcHBsaWNhdGlvblNvdXJjZShhcHBsaWNhdGlvbklkLCBmaWxlLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICB9KTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgdXBkYXRlQXBwbGljYXRpb25Tb3VyY2UgKGNsaWVudCwgYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCB1cGRhdGVBcHBsaWNhdGlvblNvdXJjZShhcHBsaWNhdGlvblNvdXJjZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbiAoY2xpZW50LCBzb3VyY2VJZCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbihzb3VyY2VJZCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGFwcGx5VGVtcGxhdGUgKGNsaWVudCwgdGVtcGxhdGVJZCwgYXBwSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBhcHBseVRlbXBsYXRlKHRlbXBsYXRlSWQsIGFwcElkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgdXBkYXRlVGVtcGxhdGUgKGNsaWVudCwgdGVtcGxhdGUsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCB1cGRhdGVUZW1wbGF0ZSh0ZW1wbGF0ZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uKGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRQcm90ZWN0aW9uKGFwcGxpY2F0aW9uSWQsIHByb3RlY3Rpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGRvd25sb2FkQXBwbGljYXRpb25Qcm90ZWN0aW9uIChjbGllbnQsIHByb3RlY3Rpb25JZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoYC9hcHBsaWNhdGlvbi9kb3dubG9hZC8ke3Byb3RlY3Rpb25JZH1gLCBudWxsLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpLCBmYWxzZSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGdldEZpbGVGcm9tVXJsIChjbGllbnQsIHVybCkge1xuICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgdmFyIGZpbGU7XG4gIHJlcXVlc3QuZ2V0KHVybClcbiAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICBmaWxlID0ge1xuICAgICAgICBjb250ZW50OiByZXMuZGF0YSxcbiAgICAgICAgZmlsZW5hbWU6IHBhdGguYmFzZW5hbWUodXJsKSxcbiAgICAgICAgZXh0ZW5zaW9uOiBwYXRoLmV4dG5hbWUodXJsKS5zdWJzdHIoMSlcbiAgICAgIH07XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGZpbGUpO1xuICAgIH0pXG4gICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xuICAgIH0pO1xuICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxuZnVuY3Rpb24gcmVzcG9uc2VIYW5kbGVyIChkZWZlcnJlZCkge1xuICByZXR1cm4gKGVyciwgcmVzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgZGVmZXJyZWQucmVqZWN0KGVycik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBib2R5ID0gcmVzLmRhdGE7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAocmVzLnN0YXR1cyA+PSA0MDApIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoYm9keSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShib2R5KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGJvZHkpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZXJyb3JIYW5kbGVyIChyZXMpIHtcbiAgaWYgKHJlcy5lcnJvcnMgJiYgcmVzLmVycm9ycy5sZW5ndGgpIHtcbiAgICByZXMuZXJyb3JzLmZvckVhY2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVQYXJhbWV0ZXJzIChwYXJhbWV0ZXJzKSB7XG4gIHZhciByZXN1bHQ7XG5cbiAgaWYgKCFBcnJheS5pc0FycmF5KHBhcmFtZXRlcnMpKSB7XG4gICAgcmVzdWx0ID0gW107XG4gICAgT2JqZWN0LmtleXMocGFyYW1ldGVycykuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICBuYW1lLFxuICAgICAgICBvcHRpb25zOiBwYXJhbWV0ZXJzW25hbWVdXG4gICAgICB9KVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9IHBhcmFtZXRlcnM7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuIl19
