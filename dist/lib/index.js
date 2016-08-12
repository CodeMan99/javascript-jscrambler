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
              client = new _this.Client({
                accessKey: accessKey,
                secretKey: secretKey,
                host: host,
                port: port
              });

              if (applicationId) {
                _context.next = 16;
                break;
              }

              throw new Error('Required *applicationId* not provided');

            case 16:
              if (!(!filesDest && !destCallback)) {
                _context.next = 18;
                break;
              }

              throw new Error('Required *filesDest* not provided');

            case 18:
              if (!(filesSrc && filesSrc.length)) {
                _context.next = 36;
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

              _context.next = 23;
              return (0, _zip2.zip)(_filesSrc, cwd);

            case 23:
              _zip = _context.sent;
              _context.next = 26;
              return _this.removeSourceFromApplication(client, '', applicationId);

            case 26:
              removeSourceRes = _context.sent;

              if (!removeSourceRes.errors) {
                _context.next = 32;
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
                _context.next = 32;
                break;
              }

              throw new Error(removeSourceRes.errors[0].message);

            case 32:
              _context.next = 34;
              return _this.addApplicationSource(client, applicationId, {
                content: _zip.generate({ type: 'base64' }),
                filename: 'application.zip',
                extension: 'zip'
              });

            case 34:
              addApplicationSourceRes = _context.sent;

              errorHandler(addApplicationSourceRes);

            case 36:
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
                _context.next = 46;
                break;
              }

              _context.next = 44;
              return _this.updateApplication(client, $set);

            case 44:
              updateApplicationRes = _context.sent;

              errorHandler(updateApplicationRes);

            case 46:
              _context.next = 48;
              return _this.createApplicationProtection(client, applicationId);

            case 48:
              createApplicationProtectionRes = _context.sent;

              errorHandler(createApplicationProtectionRes);

              protectionId = createApplicationProtectionRes.data.createApplicationProtection._id;
              _context.next = 53;
              return _this.pollProtection(client, applicationId, protectionId);

            case 53:
              _context.next = 55;
              return _this.downloadApplicationProtection(client, protectionId);

            case 55:
              download = _context.sent;

              errorHandler(download);
              (0, _zip2.unzip)(download, filesDest || destCallback);

            case 58:
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFnQkE7O0FBU0E7Ozs7OztrQkFLZTtBQUNiLDBCQURhO0FBRWIsMEJBRmE7QUFHYixzREFIYTtBQUliO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNNLG9CQTlDTyw4QkE4Q2Esa0JBOUNiLEVBOENpQyxZQTlDakMsRUE4QytDO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNwRCxvQkFEb0QsR0FDM0MsT0FBTyxrQkFBUCxLQUE4QixRQUE5QixHQUNiLFFBQVEsa0JBQVIsQ0FEYSxHQUNpQixrQkFGMEI7QUFLeEQsMkJBTHdELEdBZXRELE1BZnNELENBS3hELGFBTHdEO0FBTXhELGtCQU53RCxHQWV0RCxNQWZzRCxDQU14RCxJQU53RDtBQU94RCxrQkFQd0QsR0FldEQsTUFmc0QsQ0FPeEQsSUFQd0Q7QUFReEQsa0JBUndELEdBZXRELE1BZnNELENBUXhELElBUndEO0FBU3hELHVCQVR3RCxHQWV0RCxNQWZzRCxDQVN4RCxTQVR3RDtBQVV4RCxzQkFWd0QsR0FldEQsTUFmc0QsQ0FVeEQsUUFWd0Q7QUFXeEQsaUJBWHdELEdBZXRELE1BZnNELENBV3hELEdBWHdEO0FBWXhELG9CQVp3RCxHQWV0RCxNQWZzRCxDQVl4RCxNQVp3RDtBQWF4RCw4QkFid0QsR0FldEQsTUFmc0QsQ0FheEQsZ0JBYndEO0FBY3hELG9DQWR3RCxHQWV0RCxNQWZzRCxDQWN4RCxzQkFkd0Q7QUFrQnhELHVCQWxCd0QsR0FvQnRELElBcEJzRCxDQWtCeEQsU0FsQndEO0FBbUJ4RCx1QkFuQndELEdBb0J0RCxJQXBCc0QsQ0FtQnhELFNBbkJ3RDtBQXNCcEQsb0JBdEJvRCxHQXNCM0MsSUFBSSxNQUFLLE1BQVQsQ0FBZ0I7QUFDN0Isb0NBRDZCO0FBRTdCLG9DQUY2QjtBQUc3QiwwQkFINkI7QUFJN0I7QUFKNkIsZUFBaEIsQ0F0QjJDOztBQUFBLGtCQTZCckQsYUE3QnFEO0FBQUE7QUFBQTtBQUFBOztBQUFBLG9CQThCbEQsSUFBSSxLQUFKLENBQVUsdUNBQVYsQ0E5QmtEOztBQUFBO0FBQUEsb0JBaUN0RCxDQUFDLFNBQUQsSUFBYyxDQUFDLFlBakN1QztBQUFBO0FBQUE7QUFBQTs7QUFBQSxvQkFrQ2xELElBQUksS0FBSixDQUFVLG1DQUFWLENBbENrRDs7QUFBQTtBQUFBLG9CQXFDdEQsWUFBWSxTQUFTLE1BckNpQztBQUFBO0FBQUE7QUFBQTs7QUFzQ3BELHVCQXRDb0QsR0FzQ3hDLEVBdEN3Qzs7QUF1Q3hELG1CQUFTLENBQVQsR0FBYSxDQUFiLEVBQWdCLENBQWhCLEdBQW9CLFNBQVMsTUFBN0IsRUFBcUMsSUFBSSxDQUF6QyxFQUE0QyxFQUFFLENBQTlDLEVBQWlEO0FBQy9DLG9CQUFJLE9BQU8sU0FBUyxDQUFULENBQVAsS0FBdUIsUUFBM0IsRUFBcUM7QUFDbkM7QUFDQSw4QkFBWSxVQUFVLE1BQVYsQ0FBaUIsZUFBSyxJQUFMLENBQVUsU0FBUyxDQUFULENBQVYsRUFBdUIsRUFBQyxLQUFLLElBQU4sRUFBdkIsQ0FBakIsQ0FBWjtBQUNELGlCQUhELE1BR087QUFDTCw0QkFBVSxJQUFWLENBQWUsU0FBUyxDQUFULENBQWY7QUFDRDtBQUNGOztBQTlDdUQ7QUFBQSxxQkFnRHJDLGVBQUksU0FBSixFQUFlLEdBQWYsQ0FoRHFDOztBQUFBO0FBZ0RsRCxrQkFoRGtEO0FBQUE7QUFBQSxxQkFrRDFCLE1BQUssMkJBQUwsQ0FBaUMsTUFBakMsRUFBeUMsRUFBekMsRUFBNkMsYUFBN0MsQ0FsRDBCOztBQUFBO0FBa0RsRCw2QkFsRGtEOztBQUFBLG1CQW1EcEQsZ0JBQWdCLE1BbkRvQztBQUFBO0FBQUE7QUFBQTs7QUFvRHREO0FBQ0ksMEJBckRrRCxHQXFEbkMsS0FyRG1DOztBQXNEdEQsOEJBQWdCLE1BQWhCLENBQXVCLE9BQXZCLENBQStCLFVBQVUsS0FBVixFQUFpQjtBQUM5QyxvQkFBSSxNQUFNLE9BQU4sS0FBa0IscURBQXRCLEVBQTZFO0FBQzNFLGlDQUFlLElBQWY7QUFDRDtBQUNGLGVBSkQ7O0FBdERzRCxrQkEyRGpELFlBM0RpRDtBQUFBO0FBQUE7QUFBQTs7QUFBQSxvQkE0RDlDLElBQUksS0FBSixDQUFVLGdCQUFnQixNQUFoQixDQUF1QixDQUF2QixFQUEwQixPQUFwQyxDQTVEOEM7O0FBQUE7QUFBQTtBQUFBLHFCQWdFbEIsTUFBSyxvQkFBTCxDQUEwQixNQUExQixFQUFrQyxhQUFsQyxFQUFpRDtBQUNyRix5QkFBUyxLQUFLLFFBQUwsQ0FBYyxFQUFDLE1BQU0sUUFBUCxFQUFkLENBRDRFO0FBRXJGLDBCQUFVLGlCQUYyRTtBQUdyRiwyQkFBVztBQUgwRSxlQUFqRCxDQWhFa0I7O0FBQUE7QUFnRWxELHFDQWhFa0Q7O0FBcUV4RCwyQkFBYSx1QkFBYjs7QUFyRXdEO0FBd0VwRCxrQkF4RW9ELEdBd0U3QztBQUNYLHFCQUFLO0FBRE0sZUF4RTZDOzs7QUE0RTFELGtCQUFJLFVBQVUsT0FBTyxJQUFQLENBQVksTUFBWixFQUFvQixNQUFsQyxFQUEwQztBQUN4QyxxQkFBSyxVQUFMLEdBQWtCLEtBQUssU0FBTCxDQUFlLG9CQUFvQixNQUFwQixDQUFmLENBQWxCO0FBQ0EscUJBQUsscUJBQUwsR0FBNkIsTUFBTSxPQUFOLENBQWMsTUFBZCxDQUE3QjtBQUNEOztBQUVELGtCQUFJLE9BQU8scUJBQVAsS0FBaUMsV0FBckMsRUFBa0Q7QUFDaEQscUJBQUsscUJBQUwsR0FBNkIscUJBQTdCO0FBQ0Q7O0FBRUQsa0JBQUksZ0JBQUosRUFBc0I7QUFDcEIscUJBQUssZ0JBQUwsR0FBd0IsZ0JBQXhCO0FBQ0Q7O0FBRUQsa0JBQUksc0JBQUosRUFBNEI7QUFDMUIscUJBQUssc0JBQUwsR0FBOEIsc0JBQTlCO0FBQ0Q7O0FBM0Z5RCxvQkE2RnRELEtBQUssVUFBTCxJQUFtQixLQUFLLGdCQUF4QixJQUE0QyxLQUFLLHNCQUFqRCxJQUNBLE9BQU8sS0FBSyxxQkFBWixLQUFzQyxXQTlGZ0I7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxxQkErRnJCLE1BQUssaUJBQUwsQ0FBdUIsTUFBdkIsRUFBK0IsSUFBL0IsQ0EvRnFCOztBQUFBO0FBK0ZsRCxrQ0EvRmtEOztBQWdHeEQsMkJBQWEsb0JBQWI7O0FBaEd3RDtBQUFBO0FBQUEscUJBbUdiLE1BQUssMkJBQUwsQ0FBaUMsTUFBakMsRUFBeUMsYUFBekMsQ0FuR2E7O0FBQUE7QUFtR3BELDRDQW5Hb0Q7O0FBb0cxRCwyQkFBYSw4QkFBYjs7QUFFTSwwQkF0R29ELEdBc0dyQywrQkFBK0IsSUFBL0IsQ0FBb0MsMkJBQXBDLENBQWdFLEdBdEczQjtBQUFBO0FBQUEscUJBdUdwRCxNQUFLLGNBQUwsQ0FBb0IsTUFBcEIsRUFBNEIsYUFBNUIsRUFBMkMsWUFBM0MsQ0F2R29EOztBQUFBO0FBQUE7QUFBQSxxQkF5R25DLE1BQUssNkJBQUwsQ0FBbUMsTUFBbkMsRUFBMkMsWUFBM0MsQ0F6R21DOztBQUFBO0FBeUdwRCxzQkF6R29EOztBQTBHMUQsMkJBQWEsUUFBYjtBQUNBLCtCQUFNLFFBQU4sRUFBZ0IsYUFBYSxZQUE3Qjs7QUEzRzBEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBNEczRCxHQTFKWTs7QUEySmI7QUFDTSxnQkE1Sk8sMEJBNEpTLE1BNUpULEVBNEppQixhQTVKakIsRUE0SmdDLFlBNUpoQyxFQTRKOEM7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDbkQsc0JBRG1ELEdBQ3hDLFlBQUUsS0FBRixFQUR3Qzs7QUFHbkQsa0JBSG1EO0FBQUEscUVBRzVDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUNBQ3lCLE9BQUssd0JBQUwsQ0FBOEIsTUFBOUIsRUFBc0MsYUFBdEMsRUFBcUQsWUFBckQsQ0FEekI7O0FBQUE7QUFDTCwrQ0FESzs7QUFBQSwrQkFFUCxzQkFBc0IsTUFGZjtBQUFBO0FBQUE7QUFBQTs7QUFBQSxnQ0FHSCxJQUFJLEtBQUosQ0FBVSwwQkFBVixDQUhHOztBQUFBO0FBTUgsK0JBTkcsR0FNSyxzQkFBc0IsSUFBdEIsQ0FBMkIscUJBQTNCLENBQWlELEtBTnREOztBQU9ULDhCQUFJLFVBQVUsVUFBVixJQUF3QixVQUFVLFNBQXRDLEVBQWlEO0FBQy9DLHVDQUFXLElBQVgsRUFBaUIsR0FBakI7QUFDRCwyQkFGRCxNQUVPLElBQUksVUFBVSxTQUFkLEVBQXlCO0FBQ3hCLCtCQUR3Qix1Q0FDZ0IsYUFEaEIscUJBQzZDLFlBRDdDOztBQUU5QixxQ0FBUyxNQUFULHFEQUFrRSxHQUFsRTtBQUNELDJCQUhNLE1BR0E7QUFDTCxxQ0FBUyxPQUFUO0FBQ0Q7O0FBZFE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBSDRDOztBQUFBLGdDQUduRCxJQUhtRDtBQUFBO0FBQUE7QUFBQTs7QUFxQnpEOztBQXJCeUQsZ0RBdUJsRCxTQUFTLE9BdkJ5Qzs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQXdCMUQsR0FwTFk7O0FBcUxiO0FBQ00sbUJBdExPLDZCQXNMWSxNQXRMWixFQXNMb0IsSUF0THBCLEVBc0wwQixTQXRMMUIsRUFzTHFDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQzFDLHNCQUQwQyxHQUMvQixZQUFFLEtBQUYsRUFEK0I7O0FBRWhELHFCQUFPLElBQVAsQ0FBWSxjQUFaLEVBQTRCLGtDQUFrQixJQUFsQixFQUF3QixTQUF4QixDQUE1QixFQUFnRSxnQkFBZ0IsUUFBaEIsQ0FBaEU7QUFGZ0QsZ0RBR3pDLFNBQVMsT0FIZ0M7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJakQsR0ExTFk7O0FBMkxiO0FBQ00sc0JBNUxPLGdDQTRMZSxNQTVMZixFQTRMdUIsSUE1THZCLEVBNEw2QixTQTVMN0IsRUE0THdDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQzdDLHNCQUQ2QyxHQUNsQyxZQUFFLEtBQUYsRUFEa0M7O0FBRW5ELHFCQUFPLElBQVAsQ0FBWSxjQUFaLEVBQTRCLHFDQUFxQixJQUFyQixFQUEyQixTQUEzQixDQUE1QixFQUFtRSxnQkFBZ0IsUUFBaEIsQ0FBbkU7QUFGbUQsZ0RBRzVDLFNBQVMsT0FIbUM7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJcEQsR0FoTVk7O0FBaU1iO0FBQ00sbUJBbE1PLDZCQWtNWSxNQWxNWixFQWtNb0IsRUFsTXBCLEVBa013QjtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUM3QixzQkFENkIsR0FDbEIsWUFBRSxLQUFGLEVBRGtCOztBQUVuQyxxQkFBTyxJQUFQLENBQVksY0FBWixFQUE0QixrQ0FBa0IsRUFBbEIsQ0FBNUIsRUFBbUQsZ0JBQWdCLFFBQWhCLENBQW5EO0FBRm1DLGdEQUc1QixTQUFTLE9BSG1COztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSXBDLEdBdE1ZOztBQXVNYjtBQUNNLGtCQXhNTyw0QkF3TVcsTUF4TVgsRUF3TW1CLEVBeE1uQixFQXdNdUIsS0F4TXZCLEVBd004QixTQXhNOUIsRUF3TXlDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQzlDLHNCQUQ4QyxHQUNuQyxZQUFFLEtBQUYsRUFEbUM7O0FBRXBELHFCQUFPLElBQVAsQ0FBWSxjQUFaLEVBQTRCLGlDQUFpQixFQUFqQixFQUFxQixLQUFyQixFQUE0QixTQUE1QixDQUE1QixFQUFvRSxnQkFBZ0IsUUFBaEIsQ0FBcEU7QUFGb0QsZ0RBRzdDLFNBQVMsT0FIb0M7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJckQsR0E1TVk7O0FBNk1iO0FBQ00sbUJBOU1PLDZCQThNWSxNQTlNWixFQThNb0IsV0E5TXBCLEVBOE1pQyxTQTlNakMsRUE4TTRDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ2pELHNCQURpRCxHQUN0QyxZQUFFLEtBQUYsRUFEc0M7O0FBRXZELHFCQUFPLElBQVAsQ0FBWSxjQUFaLEVBQTRCLGtDQUFrQixXQUFsQixFQUErQixTQUEvQixDQUE1QixFQUF1RSxnQkFBZ0IsUUFBaEIsQ0FBdkU7QUFGdUQsZ0RBR2hELFNBQVMsT0FIdUM7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJeEQsR0FsTlk7O0FBbU5iO0FBQ00sbUJBcE5PLDZCQW9OWSxNQXBOWixFQW9Ob0IsV0FwTnBCLEVBb05pQyxTQXBOakMsRUFvTjRDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ2pELHNCQURpRCxHQUN0QyxZQUFFLEtBQUYsRUFEc0M7O0FBRXZELHFCQUFPLElBQVAsQ0FBWSxjQUFaLEVBQTRCLGtDQUFrQixXQUFsQixFQUErQixTQUEvQixDQUE1QixFQUF1RSxnQkFBZ0IsUUFBaEIsQ0FBdkU7QUFGdUQsZ0RBR2hELFNBQVMsT0FIdUM7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJeEQsR0F4Tlk7O0FBeU5iO0FBQ00sZ0JBMU5PLDBCQTBOUyxNQTFOVCxFQTBOaUIsYUExTmpCLEVBME5nQyxTQTFOaEMsRUEwTjJDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ2hELHNCQURnRCxHQUNyQyxZQUFFLEtBQUYsRUFEcUM7O0FBRXRELHFCQUFPLEdBQVAsQ0FBVyxjQUFYLEVBQTJCLDZCQUFlLGFBQWYsRUFBOEIsU0FBOUIsQ0FBM0IsRUFBcUUsZ0JBQWdCLFFBQWhCLENBQXJFO0FBRnNELGlEQUcvQyxTQUFTLE9BSHNDOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSXZELEdBOU5ZOztBQStOYjtBQUNNLHNCQWhPTyxnQ0FnT2UsTUFoT2YsRUFnT3VCLFFBaE92QixFQWdPaUMsU0FoT2pDLEVBZ080QyxNQWhPNUMsRUFnT29EO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ3pELHNCQUR5RCxHQUM5QyxZQUFFLEtBQUYsRUFEOEM7O0FBRS9ELHFCQUFPLEdBQVAsQ0FBVyxjQUFYLEVBQTJCLG1DQUFxQixRQUFyQixFQUErQixTQUEvQixFQUEwQyxNQUExQyxDQUEzQixFQUE4RSxnQkFBZ0IsUUFBaEIsQ0FBOUU7QUFGK0QsaURBR3hELFNBQVMsT0FIK0M7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJaEUsR0FwT1k7O0FBcU9iO0FBQ00sMkJBdE9PLHFDQXNPb0IsTUF0T3BCLEVBc080QixhQXRPNUIsRUFzTzJDLE1BdE8zQyxFQXNPbUQsU0F0T25ELEVBc084RDtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNuRSxzQkFEbUUsR0FDeEQsWUFBRSxLQUFGLEVBRHdEOztBQUV6RSxxQkFBTyxHQUFQLENBQVcsY0FBWCxFQUEyQix3Q0FBMEIsYUFBMUIsRUFBeUMsTUFBekMsRUFBaUQsU0FBakQsQ0FBM0IsRUFBd0YsZ0JBQWdCLFFBQWhCLENBQXhGO0FBRnlFLGlEQUdsRSxTQUFTLE9BSHlEOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSTFFLEdBMU9ZOztBQTJPYjtBQUNNLGdDQTVPTywwQ0E0T3lCLE1BNU96QixFQTRPaUMsYUE1T2pDLEVBNE9nRCxTQTVPaEQsRUE0TzJEO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ2hFLHNCQURnRSxHQUNyRCxZQUFFLEtBQUYsRUFEcUQ7O0FBRXRFLHFCQUFPLEdBQVAsQ0FBVyxjQUFYLEVBQTJCLDZDQUErQixhQUEvQixFQUE4QyxTQUE5QyxDQUEzQixFQUFxRixnQkFBZ0IsUUFBaEIsQ0FBckY7QUFGc0UsaURBRy9ELFNBQVMsT0FIc0Q7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJdkUsR0FoUFk7O0FBaVBiO0FBQ00sZ0JBbFBPLDBCQWtQUyxNQWxQVCxFQWtQaUIsUUFsUGpCLEVBa1AyQixTQWxQM0IsRUFrUHNDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQzNDLHNCQUQyQyxHQUNoQyxZQUFFLEtBQUYsRUFEZ0M7O0FBRWpELHFCQUFPLElBQVAsQ0FBWSxjQUFaLEVBQTRCLCtCQUFlLFFBQWYsRUFBeUIsU0FBekIsQ0FBNUIsRUFBaUUsZ0JBQWdCLFFBQWhCLENBQWpFO0FBRmlELGlEQUcxQyxTQUFTLE9BSGlDOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSWxELEdBdFBZOztBQXVQYjtBQUNNLGdCQXhQTywwQkF3UFMsTUF4UFQsRUF3UGlCLEVBeFBqQixFQXdQcUI7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDMUIsc0JBRDBCLEdBQ2YsWUFBRSxLQUFGLEVBRGU7O0FBRWhDLHFCQUFPLElBQVAsQ0FBWSxjQUFaLEVBQTRCLCtCQUFlLEVBQWYsQ0FBNUIsRUFBZ0QsZ0JBQWdCLFFBQWhCLENBQWhEO0FBRmdDLGlEQUd6QixTQUFTLE9BSGdCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSWpDLEdBNVBZOztBQTZQYjtBQUNNLGNBOVBPLHdCQThQTyxNQTlQUCxFQThQZSxTQTlQZixFQThQMEI7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDL0Isc0JBRCtCLEdBQ3BCLFlBQUUsS0FBRixFQURvQjs7QUFFckMscUJBQU8sR0FBUCxDQUFXLGNBQVgsRUFBMkIsMkJBQWEsU0FBYixDQUEzQixFQUFvRCxnQkFBZ0IsUUFBaEIsQ0FBcEQ7QUFGcUMsaURBRzlCLFNBQVMsT0FIcUI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJdEMsR0FsUVk7O0FBbVFiO0FBQ00saUJBcFFPLDJCQW9RVSxNQXBRVixFQW9Ra0IsU0FwUWxCLEVBb1E2QjtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNsQyxzQkFEa0MsR0FDdkIsWUFBRSxLQUFGLEVBRHVCOztBQUV4QyxxQkFBTyxHQUFQLENBQVcsY0FBWCxFQUEyQiw4QkFBZ0IsU0FBaEIsQ0FBM0IsRUFBdUQsZ0JBQWdCLFFBQWhCLENBQXZEO0FBRndDLGlEQUdqQyxTQUFTLE9BSHdCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSXpDLEdBeFFZOztBQXlRYjtBQUNNLHNCQTFRTyxnQ0EwUWUsTUExUWYsRUEwUXVCLGFBMVF2QixFQTBRc0MsaUJBMVF0QyxFQTBReUQsU0ExUXpELEVBMFFvRTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUN6RSxzQkFEeUUsR0FDOUQsWUFBRSxLQUFGLEVBRDhEOztBQUUvRSxxQkFBTyxJQUFQLENBQVksY0FBWixFQUE0QixxQ0FBcUIsYUFBckIsRUFBb0MsaUJBQXBDLEVBQXVELFNBQXZELENBQTVCLEVBQStGLGdCQUFnQixRQUFoQixDQUEvRjtBQUYrRSxpREFHeEUsU0FBUyxPQUgrRDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUloRixHQTlRWTs7QUErUWI7QUFDTSw2QkFoUk8sdUNBZ1JzQixNQWhSdEIsRUFnUjhCLGFBaFI5QixFQWdSNkMsR0FoUjdDLEVBZ1JrRCxTQWhSbEQsRUFnUjZEO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ2xFLHNCQURrRSxHQUN2RCxZQUFFLEtBQUYsRUFEdUQ7QUFBQSxpREFFakUsZUFBZSxNQUFmLEVBQXVCLEdBQXZCLEVBQ0osSUFESSxDQUNDLFVBQVMsSUFBVCxFQUFlO0FBQ25CLHVCQUFPLElBQVAsQ0FBWSxjQUFaLEVBQTRCLHFDQUFxQixhQUFyQixFQUFvQyxJQUFwQyxFQUEwQyxTQUExQyxDQUE1QixFQUFrRixnQkFBZ0IsUUFBaEIsQ0FBbEY7QUFDQSx1QkFBTyxTQUFTLE9BQWhCO0FBQ0QsZUFKSSxDQUZpRTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQU96RSxHQXZSWTs7QUF3UmI7QUFDTSx5QkF6Uk8sbUNBeVJrQixNQXpSbEIsRUF5UjBCLGlCQXpSMUIsRUF5UjZDLFNBelI3QyxFQXlSd0Q7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDN0Qsc0JBRDZELEdBQ2xELFlBQUUsS0FBRixFQURrRDs7QUFFbkUscUJBQU8sSUFBUCxDQUFZLGNBQVosRUFBNEIsd0NBQXdCLGlCQUF4QixFQUEyQyxTQUEzQyxDQUE1QixFQUFtRixnQkFBZ0IsUUFBaEIsQ0FBbkY7QUFGbUUsaURBRzVELFNBQVMsT0FIbUQ7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJcEUsR0E3Ulk7O0FBOFJiO0FBQ00sNkJBL1JPLHVDQStSc0IsTUEvUnRCLEVBK1I4QixRQS9SOUIsRUErUndDLGFBL1J4QyxFQStSdUQsU0EvUnZELEVBK1JrRTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUN2RSxzQkFEdUUsR0FDNUQsWUFBRSxLQUFGLEVBRDREOztBQUU3RSxxQkFBTyxJQUFQLENBQVksY0FBWixFQUE0Qiw0Q0FBNEIsUUFBNUIsRUFBc0MsYUFBdEMsRUFBcUQsU0FBckQsQ0FBNUIsRUFBNkYsZ0JBQWdCLFFBQWhCLENBQTdGO0FBRjZFLGlEQUd0RSxTQUFTLE9BSDZEOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSTlFLEdBblNZOztBQW9TYjtBQUNNLGVBclNPLHlCQXFTUSxNQXJTUixFQXFTZ0IsVUFyU2hCLEVBcVM0QixLQXJTNUIsRUFxU21DLFNBclNuQyxFQXFTOEM7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDbkQsc0JBRG1ELEdBQ3hDLFlBQUUsS0FBRixFQUR3Qzs7QUFFekQscUJBQU8sSUFBUCxDQUFZLGNBQVosRUFBNEIsOEJBQWMsVUFBZCxFQUEwQixLQUExQixFQUFpQyxTQUFqQyxDQUE1QixFQUF5RSxnQkFBZ0IsUUFBaEIsQ0FBekU7QUFGeUQsaURBR2xELFNBQVMsT0FIeUM7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJMUQsR0F6U1k7O0FBMFNiO0FBQ00sZ0JBM1NPLDBCQTJTUyxNQTNTVCxFQTJTaUIsUUEzU2pCLEVBMlMyQixTQTNTM0IsRUEyU3NDO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQzNDLHNCQUQyQyxHQUNoQyxZQUFFLEtBQUYsRUFEZ0M7O0FBRWpELHFCQUFPLElBQVAsQ0FBWSxjQUFaLEVBQTRCLCtCQUFlLFFBQWYsRUFBeUIsU0FBekIsQ0FBNUIsRUFBaUUsZ0JBQWdCLFFBQWhCLENBQWpFO0FBRmlELGlEQUcxQyxTQUFTLE9BSGlDOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSWxELEdBL1NZOztBQWdUYjtBQUNNLDZCQWpUTyx1Q0FpVHNCLE1BalR0QixFQWlUOEIsYUFqVDlCLEVBaVQ2QyxTQWpUN0MsRUFpVHdEO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQzdELHNCQUQ2RCxHQUNsRCxZQUFFLEtBQUYsRUFEa0Q7O0FBRW5FLHFCQUFPLElBQVAsQ0FBWSxjQUFaLEVBQTRCLDRDQUE0QixhQUE1QixFQUEyQyxTQUEzQyxDQUE1QixFQUFtRixnQkFBZ0IsUUFBaEIsQ0FBbkY7QUFGbUUsaURBRzVELFNBQVMsT0FIbUQ7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJcEUsR0FyVFk7O0FBc1RiO0FBQ00sMEJBdlRPLG9DQXVUbUIsTUF2VG5CLEVBdVQyQixhQXZUM0IsRUF1VDBDLFlBdlQxQyxFQXVUd0QsU0F2VHhELEVBdVRtRTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUN4RSxzQkFEd0UsR0FDN0QsWUFBRSxLQUFGLEVBRDZEOztBQUU5RSxxQkFBTyxHQUFQLENBQVcsY0FBWCxFQUEyQiw0QkFBYyxhQUFkLEVBQTZCLFlBQTdCLEVBQTJDLFNBQTNDLENBQTNCLEVBQWtGLGdCQUFnQixRQUFoQixDQUFsRjtBQUY4RSxpREFHdkUsU0FBUyxPQUg4RDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUkvRSxHQTNUWTs7QUE0VGI7QUFDTSwrQkE3VE8seUNBNlR3QixNQTdUeEIsRUE2VGdDLFlBN1RoQyxFQTZUOEM7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDbkQsc0JBRG1ELEdBQ3hDLFlBQUUsS0FBRixFQUR3Qzs7QUFFekQscUJBQU8sR0FBUCw0QkFBb0MsWUFBcEMsRUFBb0QsSUFBcEQsRUFBMEQsZ0JBQWdCLFFBQWhCLENBQTFELEVBQXFGLEtBQXJGO0FBRnlELGlEQUdsRCxTQUFTLE9BSHlDOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSTFEO0FBalVZLEM7OztBQW9VZixTQUFTLGNBQVQsQ0FBeUIsTUFBekIsRUFBaUMsR0FBakMsRUFBc0M7QUFDcEMsTUFBTSxXQUFXLFlBQUUsS0FBRixFQUFqQjtBQUNBLE1BQUksSUFBSjtBQUNBLGtCQUFRLEdBQVIsQ0FBWSxHQUFaLEVBQ0csSUFESCxDQUNRLFVBQUMsR0FBRCxFQUFTO0FBQ2IsV0FBTztBQUNMLGVBQVMsSUFBSSxJQURSO0FBRUwsZ0JBQVUsZUFBSyxRQUFMLENBQWMsR0FBZCxDQUZMO0FBR0wsaUJBQVcsZUFBSyxPQUFMLENBQWEsR0FBYixFQUFrQixNQUFsQixDQUF5QixDQUF6QjtBQUhOLEtBQVA7QUFLQSxhQUFTLE9BQVQsQ0FBaUIsSUFBakI7QUFDRCxHQVJILEVBU0csS0FUSCxDQVNTLFVBQUMsR0FBRCxFQUFTO0FBQ2QsYUFBUyxNQUFULENBQWdCLEdBQWhCO0FBQ0QsR0FYSDtBQVlBLFNBQU8sU0FBUyxPQUFoQjtBQUNEOztBQUVELFNBQVMsZUFBVCxDQUEwQixRQUExQixFQUFvQztBQUNsQyxTQUFPLFVBQUMsR0FBRCxFQUFNLEdBQU4sRUFBYztBQUNuQixRQUFJLEdBQUosRUFBUztBQUNQLGVBQVMsTUFBVCxDQUFnQixHQUFoQjtBQUNELEtBRkQsTUFFTztBQUNMLFVBQUksT0FBTyxJQUFJLElBQWY7QUFDQSxVQUFJO0FBQ0YsWUFBSSxJQUFJLE1BQUosSUFBYyxHQUFsQixFQUF1QjtBQUNyQixtQkFBUyxNQUFULENBQWdCLElBQWhCO0FBQ0QsU0FGRCxNQUVPO0FBQ0wsbUJBQVMsT0FBVCxDQUFpQixJQUFqQjtBQUNEO0FBQ0YsT0FORCxDQU1FLE9BQU8sRUFBUCxFQUFXO0FBQ1gsaUJBQVMsTUFBVCxDQUFnQixJQUFoQjtBQUNEO0FBQ0Y7QUFDRixHQWZEO0FBZ0JEOztBQUVELFNBQVMsWUFBVCxDQUF1QixHQUF2QixFQUE0QjtBQUMxQixNQUFJLElBQUksTUFBSixJQUFjLElBQUksTUFBSixDQUFXLE1BQTdCLEVBQXFDO0FBQ25DLFFBQUksTUFBSixDQUFXLE9BQVgsQ0FBbUIsVUFBVSxLQUFWLEVBQWlCO0FBQ2xDLFlBQU0sSUFBSSxLQUFKLENBQVUsTUFBTSxPQUFoQixDQUFOO0FBQ0QsS0FGRDtBQUdEOztBQUVELFNBQU8sR0FBUDtBQUNEOztBQUVELFNBQVMsbUJBQVQsQ0FBOEIsVUFBOUIsRUFBMEM7QUFDeEMsTUFBSSxNQUFKOztBQUVBLE1BQUksQ0FBQyxNQUFNLE9BQU4sQ0FBYyxVQUFkLENBQUwsRUFBZ0M7QUFDOUIsYUFBUyxFQUFUO0FBQ0EsV0FBTyxJQUFQLENBQVksVUFBWixFQUF3QixPQUF4QixDQUFnQyxVQUFDLElBQUQsRUFBVTtBQUN4QyxhQUFPLElBQVAsQ0FBWTtBQUNWLGtCQURVO0FBRVYsaUJBQVMsV0FBVyxJQUFYO0FBRkMsT0FBWjtBQUlELEtBTEQ7QUFNRCxHQVJELE1BUU87QUFDTCxhQUFTLFVBQVQ7QUFDRDs7QUFFRCxTQUFPLE1BQVA7QUFDRCIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnYmFiZWwtcG9seWZpbGwnO1xuXG5pbXBvcnQgZ2xvYiBmcm9tICdnbG9iJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHJlcXVlc3QgZnJvbSAnYXhpb3MnO1xuaW1wb3J0IFEgZnJvbSAncSc7XG5cbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IGdlbmVyYXRlU2lnbmVkUGFyYW1zIGZyb20gJy4vZ2VuZXJhdGUtc2lnbmVkLXBhcmFtcyc7XG5pbXBvcnQgSlNjcmFtYmxlckNsaWVudCBmcm9tICcuL2NsaWVudCc7XG5pbXBvcnQge1xuICBhZGRBcHBsaWNhdGlvblNvdXJjZSxcbiAgY3JlYXRlQXBwbGljYXRpb24sXG4gIHJlbW92ZUFwcGxpY2F0aW9uLFxuICB1cGRhdGVBcHBsaWNhdGlvbixcbiAgdXBkYXRlQXBwbGljYXRpb25Tb3VyY2UsXG4gIHJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbixcbiAgY3JlYXRlVGVtcGxhdGUsXG4gIHJlbW92ZVRlbXBsYXRlLFxuICB1cGRhdGVUZW1wbGF0ZSxcbiAgY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uLFxuICByZW1vdmVQcm90ZWN0aW9uLFxuICBkdXBsaWNhdGVBcHBsaWNhdGlvbixcbiAgdW5sb2NrQXBwbGljYXRpb24sXG4gIGFwcGx5VGVtcGxhdGVcbn0gZnJvbSAnLi9tdXRhdGlvbnMnO1xuaW1wb3J0IHtcbiAgZ2V0QXBwbGljYXRpb24sXG4gIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnMsXG4gIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudCxcbiAgZ2V0QXBwbGljYXRpb25zLFxuICBnZXRBcHBsaWNhdGlvblNvdXJjZSxcbiAgZ2V0VGVtcGxhdGVzLFxuICBnZXRQcm90ZWN0aW9uXG59IGZyb20gJy4vcXVlcmllcyc7XG5pbXBvcnQge1xuICB6aXAsXG4gIHVuemlwXG59IGZyb20gJy4vemlwJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBDbGllbnQ6IEpTY3JhbWJsZXJDbGllbnQsXG4gIGNvbmZpZyxcbiAgZ2VuZXJhdGVTaWduZWRQYXJhbXMsXG4gIC8vIFRoaXMgbWV0aG9kIGlzIGEgc2hvcnRjdXQgbWV0aG9kIHRoYXQgYWNjZXB0cyBhbiBvYmplY3Qgd2l0aCBldmVyeXRoaW5nIG5lZWRlZFxuICAvLyBmb3IgdGhlIGVudGlyZSBwcm9jZXNzIG9mIHJlcXVlc3RpbmcgYW4gYXBwbGljYXRpb24gcHJvdGVjdGlvbiBhbmQgZG93bmxvYWRpbmdcbiAgLy8gdGhhdCBzYW1lIHByb3RlY3Rpb24gd2hlbiB0aGUgc2FtZSBlbmRzLlxuICAvL1xuICAvLyBgY29uZmlnUGF0aE9yT2JqZWN0YCBjYW4gYmUgYSBwYXRoIHRvIGEgSlNPTiBvciBkaXJlY3RseSBhbiBvYmplY3QgY29udGFpbmluZ1xuICAvLyB0aGUgZm9sbG93aW5nIHN0cnVjdHVyZTpcbiAgLy9cbiAgLy8gYGBganNvblxuICAvLyB7XG4gIC8vICAgXCJrZXlzXCI6IHtcbiAgLy8gICAgIFwiYWNjZXNzS2V5XCI6IFwiXCIsXG4gIC8vICAgICBcInNlY3JldEtleVwiOiBcIlwiXG4gIC8vICAgfSxcbiAgLy8gICBcImFwcGxpY2F0aW9uSWRcIjogXCJcIixcbiAgLy8gICBcImZpbGVzRGVzdFwiOiBcIlwiXG4gIC8vIH1cbiAgLy8gYGBgXG4gIC8vXG4gIC8vIEFsc28gdGhlIGZvbGxvd2luZyBvcHRpb25hbCBwYXJhbWV0ZXJzIGFyZSBhY2NlcHRlZDpcbiAgLy9cbiAgLy8gYGBganNvblxuICAvLyB7XG4gIC8vICAgXCJmaWxlc1NyY1wiOiBbXCJcIl0sXG4gIC8vICAgXCJwYXJhbXNcIjoge30sXG4gIC8vICAgXCJjd2RcIjogXCJcIixcbiAgLy8gICBcImhvc3RcIjogXCJhcGkuanNjcmFtYmxlci5jb21cIixcbiAgLy8gICBcInBvcnRcIjogXCI0NDNcIlxuICAvLyB9XG4gIC8vIGBgYFxuICAvL1xuICAvLyBgZmlsZXNTcmNgIHN1cHBvcnRzIGdsb2IgcGF0dGVybnMsIGFuZCBpZiBpdCdzIHByb3ZpZGVkIGl0IHdpbGwgcmVwbGFjZSB0aGVcbiAgLy8gZW50aXJlIGFwcGxpY2F0aW9uIHNvdXJjZXMuXG4gIC8vXG4gIC8vIGBwYXJhbXNgIGlmIHByb3ZpZGVkIHdpbGwgcmVwbGFjZSBhbGwgdGhlIGFwcGxpY2F0aW9uIHRyYW5zZm9ybWF0aW9uIHBhcmFtZXRlcnMuXG4gIC8vXG4gIC8vIGBjd2RgIGFsbG93cyB5b3UgdG8gc2V0IHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IHRvIHJlc29sdmUgcHJvYmxlbXMgd2l0aFxuICAvLyByZWxhdGl2ZSBwYXRocyB3aXRoIHlvdXIgYGZpbGVzU3JjYCBpcyBvdXRzaWRlIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LlxuICAvL1xuICAvLyBGaW5hbGx5LCBgaG9zdGAgYW5kIGBwb3J0YCBjYW4gYmUgb3ZlcnJpZGRlbiBpZiB5b3UgdG8gZW5nYWdlIHdpdGggYSBkaWZmZXJlbnRcbiAgLy8gZW5kcG9pbnQgdGhhbiB0aGUgZGVmYXVsdCBvbmUsIHVzZWZ1bCBpZiB5b3UncmUgcnVubmluZyBhbiBlbnRlcnByaXNlIHZlcnNpb24gb2ZcbiAgLy8gSnNjcmFtYmxlciBvciBpZiB5b3UncmUgcHJvdmlkZWQgYWNjZXNzIHRvIGJldGEgZmVhdHVyZXMgb2Ygb3VyIHByb2R1Y3QuXG4gIC8vXG4gIGFzeW5jIHByb3RlY3RBbmREb3dubG9hZCAoY29uZmlnUGF0aE9yT2JqZWN0LCBkZXN0Q2FsbGJhY2spIHtcbiAgICBjb25zdCBjb25maWcgPSB0eXBlb2YgY29uZmlnUGF0aE9yT2JqZWN0ID09PSAnc3RyaW5nJyA/XG4gICAgICByZXF1aXJlKGNvbmZpZ1BhdGhPck9iamVjdCkgOiBjb25maWdQYXRoT3JPYmplY3Q7XG5cbiAgICBjb25zdCB7XG4gICAgICBhcHBsaWNhdGlvbklkLFxuICAgICAgaG9zdCxcbiAgICAgIHBvcnQsXG4gICAgICBrZXlzLFxuICAgICAgZmlsZXNEZXN0LFxuICAgICAgZmlsZXNTcmMsXG4gICAgICBjd2QsXG4gICAgICBwYXJhbXMsXG4gICAgICBhcHBsaWNhdGlvblR5cGVzLFxuICAgICAgbGFuZ3VhZ2VTcGVjaWZpY2F0aW9uc1xuICAgIH0gPSBjb25maWc7XG5cbiAgICBjb25zdCB7XG4gICAgICBhY2Nlc3NLZXksXG4gICAgICBzZWNyZXRLZXlcbiAgICB9ID0ga2V5cztcblxuICAgIGNvbnN0IGNsaWVudCA9IG5ldyB0aGlzLkNsaWVudCh7XG4gICAgICBhY2Nlc3NLZXksXG4gICAgICBzZWNyZXRLZXksXG4gICAgICBob3N0LFxuICAgICAgcG9ydFxuICAgIH0pO1xuXG4gICAgaWYgKCFhcHBsaWNhdGlvbklkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlcXVpcmVkICphcHBsaWNhdGlvbklkKiBub3QgcHJvdmlkZWQnKTtcbiAgICB9XG5cbiAgICBpZiAoIWZpbGVzRGVzdCAmJiAhZGVzdENhbGxiYWNrKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlcXVpcmVkICpmaWxlc0Rlc3QqIG5vdCBwcm92aWRlZCcpO1xuICAgIH1cblxuICAgIGlmIChmaWxlc1NyYyAmJiBmaWxlc1NyYy5sZW5ndGgpIHtcbiAgICAgIGxldCBfZmlsZXNTcmMgPSBbXTtcbiAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gZmlsZXNTcmMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZmlsZXNTcmNbaV0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgLy8gVE9ETyBSZXBsYWNlIGBnbG9iLnN5bmNgIHdpdGggYXN5bmMgdmVyc2lvblxuICAgICAgICAgIF9maWxlc1NyYyA9IF9maWxlc1NyYy5jb25jYXQoZ2xvYi5zeW5jKGZpbGVzU3JjW2ldLCB7ZG90OiB0cnVlfSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9maWxlc1NyYy5wdXNoKGZpbGVzU3JjW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBfemlwID0gYXdhaXQgemlwKF9maWxlc1NyYywgY3dkKTtcblxuICAgICAgY29uc3QgcmVtb3ZlU291cmNlUmVzID0gYXdhaXQgdGhpcy5yZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24oY2xpZW50LCAnJywgYXBwbGljYXRpb25JZCk7XG4gICAgICBpZiAocmVtb3ZlU291cmNlUmVzLmVycm9ycykge1xuICAgICAgICAvLyBUT0RPIEltcGxlbWVudCBlcnJvciBjb2RlcyBvciBmaXggdGhpcyBpcyBvbiB0aGUgc2VydmljZXNcbiAgICAgICAgdmFyIGhhZE5vU291cmNlcyA9IGZhbHNlO1xuICAgICAgICByZW1vdmVTb3VyY2VSZXMuZXJyb3JzLmZvckVhY2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgaWYgKGVycm9yLm1lc3NhZ2UgPT09ICdBcHBsaWNhdGlvbiBTb3VyY2Ugd2l0aCB0aGUgZ2l2ZW4gSUQgZG9lcyBub3QgZXhpc3QnKSB7XG4gICAgICAgICAgICBoYWROb1NvdXJjZXMgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghaGFkTm9Tb3VyY2VzKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlbW92ZVNvdXJjZVJlcy5lcnJvcnNbMF0ubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgYWRkQXBwbGljYXRpb25Tb3VyY2VSZXMgPSBhd2FpdCB0aGlzLmFkZEFwcGxpY2F0aW9uU291cmNlKGNsaWVudCwgYXBwbGljYXRpb25JZCwge1xuICAgICAgICBjb250ZW50OiBfemlwLmdlbmVyYXRlKHt0eXBlOiAnYmFzZTY0J30pLFxuICAgICAgICBmaWxlbmFtZTogJ2FwcGxpY2F0aW9uLnppcCcsXG4gICAgICAgIGV4dGVuc2lvbjogJ3ppcCdcbiAgICAgIH0pO1xuICAgICAgZXJyb3JIYW5kbGVyKGFkZEFwcGxpY2F0aW9uU291cmNlUmVzKTtcbiAgICB9XG5cbiAgICBjb25zdCAkc2V0ID0ge1xuICAgICAgX2lkOiBhcHBsaWNhdGlvbklkXG4gICAgfTtcblxuICAgIGlmIChwYXJhbXMgJiYgT2JqZWN0LmtleXMocGFyYW1zKS5sZW5ndGgpIHtcbiAgICAgICRzZXQucGFyYW1ldGVycyA9IEpTT04uc3RyaW5naWZ5KG5vcm1hbGl6ZVBhcmFtZXRlcnMocGFyYW1zKSk7XG4gICAgICAkc2V0LmFyZVN1YnNjcmliZXJzT3JkZXJlZCA9IEFycmF5LmlzQXJyYXkocGFyYW1zKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGFyZVN1YnNjcmliZXJzT3JkZXJlZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICRzZXQuYXJlU3Vic2NyaWJlcnNPcmRlcmVkID0gYXJlU3Vic2NyaWJlcnNPcmRlcmVkO1xuICAgIH1cblxuICAgIGlmIChhcHBsaWNhdGlvblR5cGVzKSB7XG4gICAgICAkc2V0LmFwcGxpY2F0aW9uVHlwZXMgPSBhcHBsaWNhdGlvblR5cGVzO1xuICAgIH1cblxuICAgIGlmIChsYW5ndWFnZVNwZWNpZmljYXRpb25zKSB7XG4gICAgICAkc2V0Lmxhbmd1YWdlU3BlY2lmaWNhdGlvbnMgPSBsYW5ndWFnZVNwZWNpZmljYXRpb25zO1xuICAgIH1cblxuICAgIGlmICgkc2V0LnBhcmFtZXRlcnMgfHwgJHNldC5hcHBsaWNhdGlvblR5cGVzIHx8ICRzZXQubGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucyB8fFxuICAgICAgICB0eXBlb2YgJHNldC5hcmVTdWJzY3JpYmVyc09yZGVyZWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjb25zdCB1cGRhdGVBcHBsaWNhdGlvblJlcyA9IGF3YWl0IHRoaXMudXBkYXRlQXBwbGljYXRpb24oY2xpZW50LCAkc2V0KTtcbiAgICAgIGVycm9ySGFuZGxlcih1cGRhdGVBcHBsaWNhdGlvblJlcyk7XG4gICAgfVxuXG4gICAgY29uc3QgY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uUmVzID0gYXdhaXQgdGhpcy5jcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24oY2xpZW50LCBhcHBsaWNhdGlvbklkKTtcbiAgICBlcnJvckhhbmRsZXIoY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uUmVzKTtcblxuICAgIGNvbnN0IHByb3RlY3Rpb25JZCA9IGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcy5kYXRhLmNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbi5faWQ7XG4gICAgYXdhaXQgdGhpcy5wb2xsUHJvdGVjdGlvbihjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHByb3RlY3Rpb25JZCk7XG5cbiAgICBjb25zdCBkb3dubG9hZCA9IGF3YWl0IHRoaXMuZG93bmxvYWRBcHBsaWNhdGlvblByb3RlY3Rpb24oY2xpZW50LCBwcm90ZWN0aW9uSWQpO1xuICAgIGVycm9ySGFuZGxlcihkb3dubG9hZCk7XG4gICAgdW56aXAoZG93bmxvYWQsIGZpbGVzRGVzdCB8fCBkZXN0Q2FsbGJhY2spO1xuICB9LFxuICAvL1xuICBhc3luYyBwb2xsUHJvdGVjdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcblxuICAgIGNvbnN0IHBvbGwgPSBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBhcHBsaWNhdGlvblByb3RlY3Rpb24gPSBhd2FpdCB0aGlzLmdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbihjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHByb3RlY3Rpb25JZCk7XG4gICAgICBpZiAoYXBwbGljYXRpb25Qcm90ZWN0aW9uLmVycm9ycykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIHBvbGxpbmcgcHJvdGVjdGlvbicpO1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ0Vycm9yIHBvbGxpbmcgcHJvdGVjdGlvbicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBhcHBsaWNhdGlvblByb3RlY3Rpb24uZGF0YS5hcHBsaWNhdGlvblByb3RlY3Rpb24uc3RhdGU7XG4gICAgICAgIGlmIChzdGF0ZSAhPT0gJ2ZpbmlzaGVkJyAmJiBzdGF0ZSAhPT0gJ2Vycm9yZWQnKSB7XG4gICAgICAgICAgc2V0VGltZW91dChwb2xsLCA1MDApO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSAnZXJyb3JlZCcpIHtcbiAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcHAuanNjcmFtYmxlci5jb20vYXBwLyR7YXBwbGljYXRpb25JZH0vcHJvdGVjdGlvbnMvJHtwcm90ZWN0aW9uSWR9YDtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoYFByb3RlY3Rpb24gZmFpbGVkLiBGb3IgbW9yZSBpbmZvcm1hdGlvbiB2aXNpdDogJHt1cmx9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHBvbGwoKTtcblxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBjcmVhdGVBcHBsaWNhdGlvbiAoY2xpZW50LCBkYXRhLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgY3JlYXRlQXBwbGljYXRpb24oZGF0YSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGR1cGxpY2F0ZUFwcGxpY2F0aW9uIChjbGllbnQsIGRhdGEsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBkdXBsaWNhdGVBcHBsaWNhdGlvbihkYXRhLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgcmVtb3ZlQXBwbGljYXRpb24gKGNsaWVudCwgaWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgcmVtb3ZlQXBwbGljYXRpb24oaWQpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgcmVtb3ZlUHJvdGVjdGlvbiAoY2xpZW50LCBpZCwgYXBwSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCByZW1vdmVQcm90ZWN0aW9uKGlkLCBhcHBJZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHVwZGF0ZUFwcGxpY2F0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgdXBkYXRlQXBwbGljYXRpb24oYXBwbGljYXRpb24sIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyB1bmxvY2tBcHBsaWNhdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbiwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHVubG9ja0FwcGxpY2F0aW9uKGFwcGxpY2F0aW9uLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb24oYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uU291cmNlIChjbGllbnQsIHNvdXJjZUlkLCBmcmFnbWVudHMsIGxpbWl0cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9uU291cmNlKHNvdXJjZUlkLCBmcmFnbWVudHMsIGxpbWl0cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHBhcmFtcywgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9ucyhhcHBsaWNhdGlvbklkLCBwYXJhbXMsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zQ291bnQgKGNsaWVudCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldCgnL2FwcGxpY2F0aW9uJywgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50KGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBjcmVhdGVUZW1wbGF0ZSAoY2xpZW50LCB0ZW1wbGF0ZSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGNyZWF0ZVRlbXBsYXRlKHRlbXBsYXRlLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgcmVtb3ZlVGVtcGxhdGUgKGNsaWVudCwgaWQpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgcmVtb3ZlVGVtcGxhdGUoaWQpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0VGVtcGxhdGVzIChjbGllbnQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldFRlbXBsYXRlcyhmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25zIChjbGllbnQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9ucyhmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgYWRkQXBwbGljYXRpb25Tb3VyY2UgKGNsaWVudCwgYXBwbGljYXRpb25JZCwgYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBhZGRBcHBsaWNhdGlvblNvdXJjZShhcHBsaWNhdGlvbklkLCBhcHBsaWNhdGlvblNvdXJjZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGFkZEFwcGxpY2F0aW9uU291cmNlRnJvbVVSTCAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCB1cmwsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIHJldHVybiBnZXRGaWxlRnJvbVVybChjbGllbnQsIHVybClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGFkZEFwcGxpY2F0aW9uU291cmNlKGFwcGxpY2F0aW9uSWQsIGZpbGUsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgIH0pO1xuICB9LFxuICAvL1xuICBhc3luYyB1cGRhdGVBcHBsaWNhdGlvblNvdXJjZSAoY2xpZW50LCBhcHBsaWNhdGlvblNvdXJjZSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHVwZGF0ZUFwcGxpY2F0aW9uU291cmNlKGFwcGxpY2F0aW9uU291cmNlLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgcmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uIChjbGllbnQsIHNvdXJjZUlkLCBhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgcmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uKHNvdXJjZUlkLCBhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgYXBwbHlUZW1wbGF0ZSAoY2xpZW50LCB0ZW1wbGF0ZUlkLCBhcHBJZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGFwcGx5VGVtcGxhdGUodGVtcGxhdGVJZCwgYXBwSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyB1cGRhdGVUZW1wbGF0ZSAoY2xpZW50LCB0ZW1wbGF0ZSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHVwZGF0ZVRlbXBsYXRlKHRlbXBsYXRlLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24oYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldFByb3RlY3Rpb24oYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZG93bmxvYWRBcHBsaWNhdGlvblByb3RlY3Rpb24gKGNsaWVudCwgcHJvdGVjdGlvbklkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LmdldChgL2FwcGxpY2F0aW9uL2Rvd25sb2FkLyR7cHJvdGVjdGlvbklkfWAsIG51bGwsIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCksIGZhbHNlKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZ2V0RmlsZUZyb21VcmwgKGNsaWVudCwgdXJsKSB7XG4gIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICB2YXIgZmlsZTtcbiAgcmVxdWVzdC5nZXQodXJsKVxuICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgIGZpbGUgPSB7XG4gICAgICAgIGNvbnRlbnQ6IHJlcy5kYXRhLFxuICAgICAgICBmaWxlbmFtZTogcGF0aC5iYXNlbmFtZSh1cmwpLFxuICAgICAgICBleHRlbnNpb246IHBhdGguZXh0bmFtZSh1cmwpLnN1YnN0cigxKVxuICAgICAgfTtcbiAgICAgIGRlZmVycmVkLnJlc29sdmUoZmlsZSk7XG4gICAgfSlcbiAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgZGVmZXJyZWQucmVqZWN0KGVycik7XG4gICAgfSk7XG4gIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufVxuXG5mdW5jdGlvbiByZXNwb25zZUhhbmRsZXIgKGRlZmVycmVkKSB7XG4gIHJldHVybiAoZXJyLCByZXMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBkZWZlcnJlZC5yZWplY3QoZXJyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGJvZHkgPSByZXMuZGF0YTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChyZXMuc3RhdHVzID49IDQwMCkge1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdChib2R5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGJvZHkpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoYm9keSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBlcnJvckhhbmRsZXIgKHJlcykge1xuICBpZiAocmVzLmVycm9ycyAmJiByZXMuZXJyb3JzLmxlbmd0aCkge1xuICAgIHJlcy5lcnJvcnMuZm9yRWFjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvci5tZXNzYWdlKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVBhcmFtZXRlcnMgKHBhcmFtZXRlcnMpIHtcbiAgdmFyIHJlc3VsdDtcblxuICBpZiAoIUFycmF5LmlzQXJyYXkocGFyYW1ldGVycykpIHtcbiAgICByZXN1bHQgPSBbXTtcbiAgICBPYmplY3Qua2V5cyhwYXJhbWV0ZXJzKS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIG9wdGlvbnM6IHBhcmFtZXRlcnNbbmFtZV1cbiAgICAgIH0pXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gcGFyYW1ldGVycztcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG4iXX0=
