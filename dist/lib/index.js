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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvaW5kZXguanMiXSwibmFtZXMiOlsiQ2xpZW50IiwiY29uZmlnIiwiZ2VuZXJhdGVTaWduZWRQYXJhbXMiLCJwcm90ZWN0QW5kRG93bmxvYWQiLCJjb25maWdQYXRoT3JPYmplY3QiLCJkZXN0Q2FsbGJhY2siLCJyZXF1aXJlIiwiYXBwbGljYXRpb25JZCIsImhvc3QiLCJwb3J0Iiwia2V5cyIsImZpbGVzRGVzdCIsImZpbGVzU3JjIiwiY3dkIiwicGFyYW1zIiwiYXBwbGljYXRpb25UeXBlcyIsImxhbmd1YWdlU3BlY2lmaWNhdGlvbnMiLCJhY2Nlc3NLZXkiLCJzZWNyZXRLZXkiLCJjbGllbnQiLCJFcnJvciIsImxlbmd0aCIsIl9maWxlc1NyYyIsImkiLCJsIiwiY29uY2F0Iiwic3luYyIsImRvdCIsInB1c2giLCJfemlwIiwicmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uIiwicmVtb3ZlU291cmNlUmVzIiwiZXJyb3JzIiwiaGFkTm9Tb3VyY2VzIiwiZm9yRWFjaCIsImVycm9yIiwibWVzc2FnZSIsImFkZEFwcGxpY2F0aW9uU291cmNlIiwiY29udGVudCIsImdlbmVyYXRlIiwidHlwZSIsImZpbGVuYW1lIiwiZXh0ZW5zaW9uIiwiYWRkQXBwbGljYXRpb25Tb3VyY2VSZXMiLCJlcnJvckhhbmRsZXIiLCIkc2V0IiwiX2lkIiwiT2JqZWN0IiwicGFyYW1ldGVycyIsIkpTT04iLCJzdHJpbmdpZnkiLCJub3JtYWxpemVQYXJhbWV0ZXJzIiwiYXJlU3Vic2NyaWJlcnNPcmRlcmVkIiwiQXJyYXkiLCJpc0FycmF5IiwidXBkYXRlQXBwbGljYXRpb24iLCJ1cGRhdGVBcHBsaWNhdGlvblJlcyIsImNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbiIsImNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcyIsInByb3RlY3Rpb25JZCIsImRhdGEiLCJwb2xsUHJvdGVjdGlvbiIsImRvd25sb2FkQXBwbGljYXRpb25Qcm90ZWN0aW9uIiwiZG93bmxvYWQiLCJkZWZlcnJlZCIsImRlZmVyIiwicG9sbCIsImdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbiIsImFwcGxpY2F0aW9uUHJvdGVjdGlvbiIsInN0YXRlIiwic2V0VGltZW91dCIsInVybCIsInJlamVjdCIsInJlc29sdmUiLCJwcm9taXNlIiwiY3JlYXRlQXBwbGljYXRpb24iLCJmcmFnbWVudHMiLCJwb3N0IiwicmVzcG9uc2VIYW5kbGVyIiwiZHVwbGljYXRlQXBwbGljYXRpb24iLCJyZW1vdmVBcHBsaWNhdGlvbiIsImlkIiwicmVtb3ZlUHJvdGVjdGlvbiIsImFwcElkIiwiYXBwbGljYXRpb24iLCJ1bmxvY2tBcHBsaWNhdGlvbiIsImdldEFwcGxpY2F0aW9uIiwiZ2V0IiwiZ2V0QXBwbGljYXRpb25Tb3VyY2UiLCJzb3VyY2VJZCIsImxpbWl0cyIsImdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnMiLCJnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zQ291bnQiLCJjcmVhdGVUZW1wbGF0ZSIsInRlbXBsYXRlIiwicmVtb3ZlVGVtcGxhdGUiLCJnZXRUZW1wbGF0ZXMiLCJnZXRBcHBsaWNhdGlvbnMiLCJhcHBsaWNhdGlvblNvdXJjZSIsImFkZEFwcGxpY2F0aW9uU291cmNlRnJvbVVSTCIsImdldEZpbGVGcm9tVXJsIiwidGhlbiIsImZpbGUiLCJ1cGRhdGVBcHBsaWNhdGlvblNvdXJjZSIsImFwcGx5VGVtcGxhdGUiLCJ0ZW1wbGF0ZUlkIiwidXBkYXRlVGVtcGxhdGUiLCJyZXMiLCJiYXNlbmFtZSIsImV4dG5hbWUiLCJzdWJzdHIiLCJjYXRjaCIsImVyciIsImJvZHkiLCJzdGF0dXMiLCJleCIsInJlc3VsdCIsIm5hbWUiLCJvcHRpb25zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQWdCQTs7QUFTQTs7Ozs7O2tCQUtlO0FBQ2JBLDBCQURhO0FBRWJDLDBCQUZh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QUNELFNBRkQsTUFFTztBQUNMakQsbUJBQVNTLE9BQVQsQ0FBaUJ3QyxJQUFqQjtBQUNEO0FBQ0YsT0FORCxDQU1FLE9BQU9FLEVBQVAsRUFBVztBQUNYbkQsaUJBQVNRLE1BQVQsQ0FBZ0J5QyxJQUFoQjtBQUNEO0FBQ0Y7QUFDRixHQWZEO0FBZ0JEOztBQUVELFNBQVNyRSxZQUFULENBQXVCK0QsR0FBdkIsRUFBNEI7QUFDMUIsTUFBSUEsSUFBSTNFLE1BQUosSUFBYzJFLElBQUkzRSxNQUFKLENBQVdYLE1BQTdCLEVBQXFDO0FBQ25Dc0YsUUFBSTNFLE1BQUosQ0FBV0UsT0FBWCxDQUFtQixVQUFVQyxLQUFWLEVBQWlCO0FBQ2xDLFlBQU0sSUFBSWYsS0FBSixDQUFVZSxNQUFNQyxPQUFoQixDQUFOO0FBQ0QsS0FGRDtBQUdEOztBQUVELFNBQU91RSxHQUFQO0FBQ0Q7O0FBRUQsU0FBU3hELG1CQUFULENBQThCSCxVQUE5QixFQUEwQztBQUN4QyxNQUFJb0UsTUFBSjs7QUFFQSxNQUFJLENBQUMvRCxNQUFNQyxPQUFOLENBQWNOLFVBQWQsQ0FBTCxFQUFnQztBQUM5Qm9FLGFBQVMsRUFBVDtBQUNBckUsV0FBT3JDLElBQVAsQ0FBWXNDLFVBQVosRUFBd0JkLE9BQXhCLENBQWdDLFVBQUNtRixJQUFELEVBQVU7QUFDeENELGFBQU94RixJQUFQLENBQVk7QUFDVnlGLGtCQURVO0FBRVZDLGlCQUFTdEUsV0FBV3FFLElBQVg7QUFGQyxPQUFaO0FBSUQsS0FMRDtBQU1ELEdBUkQsTUFRTztBQUNMRCxhQUFTcEUsVUFBVDtBQUNEOztBQUVELFNBQU9vRSxNQUFQO0FBQ0QiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ2JhYmVsLXBvbHlmaWxsJztcblxuaW1wb3J0IGdsb2IgZnJvbSAnZ2xvYic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCByZXF1ZXN0IGZyb20gJ2F4aW9zJztcbmltcG9ydCBRIGZyb20gJ3EnO1xuXG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJztcbmltcG9ydCBnZW5lcmF0ZVNpZ25lZFBhcmFtcyBmcm9tICcuL2dlbmVyYXRlLXNpZ25lZC1wYXJhbXMnO1xuaW1wb3J0IEpTY3JhbWJsZXJDbGllbnQgZnJvbSAnLi9jbGllbnQnO1xuaW1wb3J0IHtcbiAgYWRkQXBwbGljYXRpb25Tb3VyY2UsXG4gIGNyZWF0ZUFwcGxpY2F0aW9uLFxuICByZW1vdmVBcHBsaWNhdGlvbixcbiAgdXBkYXRlQXBwbGljYXRpb24sXG4gIHVwZGF0ZUFwcGxpY2F0aW9uU291cmNlLFxuICByZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24sXG4gIGNyZWF0ZVRlbXBsYXRlLFxuICByZW1vdmVUZW1wbGF0ZSxcbiAgdXBkYXRlVGVtcGxhdGUsXG4gIGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbixcbiAgcmVtb3ZlUHJvdGVjdGlvbixcbiAgZHVwbGljYXRlQXBwbGljYXRpb24sXG4gIHVubG9ja0FwcGxpY2F0aW9uLFxuICBhcHBseVRlbXBsYXRlXG59IGZyb20gJy4vbXV0YXRpb25zJztcbmltcG9ydCB7XG4gIGdldEFwcGxpY2F0aW9uLFxuICBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zLFxuICBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zQ291bnQsXG4gIGdldEFwcGxpY2F0aW9ucyxcbiAgZ2V0QXBwbGljYXRpb25Tb3VyY2UsXG4gIGdldFRlbXBsYXRlcyxcbiAgZ2V0UHJvdGVjdGlvblxufSBmcm9tICcuL3F1ZXJpZXMnO1xuaW1wb3J0IHtcbiAgemlwLFxuICB1bnppcFxufSBmcm9tICcuL3ppcCc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgQ2xpZW50OiBKU2NyYW1ibGVyQ2xpZW50LFxuICBjb25maWcsXG4gIGdlbmVyYXRlU2lnbmVkUGFyYW1zLFxuICAvLyBUaGlzIG1ldGhvZCBpcyBhIHNob3J0Y3V0IG1ldGhvZCB0aGF0IGFjY2VwdHMgYW4gb2JqZWN0IHdpdGggZXZlcnl0aGluZyBuZWVkZWRcbiAgLy8gZm9yIHRoZSBlbnRpcmUgcHJvY2VzcyBvZiByZXF1ZXN0aW5nIGFuIGFwcGxpY2F0aW9uIHByb3RlY3Rpb24gYW5kIGRvd25sb2FkaW5nXG4gIC8vIHRoYXQgc2FtZSBwcm90ZWN0aW9uIHdoZW4gdGhlIHNhbWUgZW5kcy5cbiAgLy9cbiAgLy8gYGNvbmZpZ1BhdGhPck9iamVjdGAgY2FuIGJlIGEgcGF0aCB0byBhIEpTT04gb3IgZGlyZWN0bHkgYW4gb2JqZWN0IGNvbnRhaW5pbmdcbiAgLy8gdGhlIGZvbGxvd2luZyBzdHJ1Y3R1cmU6XG4gIC8vXG4gIC8vIGBgYGpzb25cbiAgLy8ge1xuICAvLyAgIFwia2V5c1wiOiB7XG4gIC8vICAgICBcImFjY2Vzc0tleVwiOiBcIlwiLFxuICAvLyAgICAgXCJzZWNyZXRLZXlcIjogXCJcIlxuICAvLyAgIH0sXG4gIC8vICAgXCJhcHBsaWNhdGlvbklkXCI6IFwiXCIsXG4gIC8vICAgXCJmaWxlc0Rlc3RcIjogXCJcIlxuICAvLyB9XG4gIC8vIGBgYFxuICAvL1xuICAvLyBBbHNvIHRoZSBmb2xsb3dpbmcgb3B0aW9uYWwgcGFyYW1ldGVycyBhcmUgYWNjZXB0ZWQ6XG4gIC8vXG4gIC8vIGBgYGpzb25cbiAgLy8ge1xuICAvLyAgIFwiZmlsZXNTcmNcIjogW1wiXCJdLFxuICAvLyAgIFwicGFyYW1zXCI6IHt9LFxuICAvLyAgIFwiY3dkXCI6IFwiXCIsXG4gIC8vICAgXCJob3N0XCI6IFwiYXBpLmpzY3JhbWJsZXIuY29tXCIsXG4gIC8vICAgXCJwb3J0XCI6IFwiNDQzXCJcbiAgLy8gfVxuICAvLyBgYGBcbiAgLy9cbiAgLy8gYGZpbGVzU3JjYCBzdXBwb3J0cyBnbG9iIHBhdHRlcm5zLCBhbmQgaWYgaXQncyBwcm92aWRlZCBpdCB3aWxsIHJlcGxhY2UgdGhlXG4gIC8vIGVudGlyZSBhcHBsaWNhdGlvbiBzb3VyY2VzLlxuICAvL1xuICAvLyBgcGFyYW1zYCBpZiBwcm92aWRlZCB3aWxsIHJlcGxhY2UgYWxsIHRoZSBhcHBsaWNhdGlvbiB0cmFuc2Zvcm1hdGlvbiBwYXJhbWV0ZXJzLlxuICAvL1xuICAvLyBgY3dkYCBhbGxvd3MgeW91IHRvIHNldCB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSB0byByZXNvbHZlIHByb2JsZW1zIHdpdGhcbiAgLy8gcmVsYXRpdmUgcGF0aHMgd2l0aCB5b3VyIGBmaWxlc1NyY2AgaXMgb3V0c2lkZSB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS5cbiAgLy9cbiAgLy8gRmluYWxseSwgYGhvc3RgIGFuZCBgcG9ydGAgY2FuIGJlIG92ZXJyaWRkZW4gaWYgeW91IHRvIGVuZ2FnZSB3aXRoIGEgZGlmZmVyZW50XG4gIC8vIGVuZHBvaW50IHRoYW4gdGhlIGRlZmF1bHQgb25lLCB1c2VmdWwgaWYgeW91J3JlIHJ1bm5pbmcgYW4gZW50ZXJwcmlzZSB2ZXJzaW9uIG9mXG4gIC8vIEpzY3JhbWJsZXIgb3IgaWYgeW91J3JlIHByb3ZpZGVkIGFjY2VzcyB0byBiZXRhIGZlYXR1cmVzIG9mIG91ciBwcm9kdWN0LlxuICAvL1xuICBhc3luYyBwcm90ZWN0QW5kRG93bmxvYWQgKGNvbmZpZ1BhdGhPck9iamVjdCwgZGVzdENhbGxiYWNrKSB7XG4gICAgY29uc3QgY29uZmlnID0gdHlwZW9mIGNvbmZpZ1BhdGhPck9iamVjdCA9PT0gJ3N0cmluZycgP1xuICAgICAgcmVxdWlyZShjb25maWdQYXRoT3JPYmplY3QpIDogY29uZmlnUGF0aE9yT2JqZWN0O1xuXG4gICAgY29uc3Qge1xuICAgICAgYXBwbGljYXRpb25JZCxcbiAgICAgIGhvc3QsXG4gICAgICBwb3J0LFxuICAgICAga2V5cyxcbiAgICAgIGZpbGVzRGVzdCxcbiAgICAgIGZpbGVzU3JjLFxuICAgICAgY3dkLFxuICAgICAgcGFyYW1zLFxuICAgICAgYXBwbGljYXRpb25UeXBlcyxcbiAgICAgIGxhbmd1YWdlU3BlY2lmaWNhdGlvbnNcbiAgICB9ID0gY29uZmlnO1xuXG4gICAgY29uc3Qge1xuICAgICAgYWNjZXNzS2V5LFxuICAgICAgc2VjcmV0S2V5XG4gICAgfSA9IGtleXM7XG5cbiAgICBjb25zdCBjbGllbnQgPSBuZXcgdGhpcy5DbGllbnQoe1xuICAgICAgYWNjZXNzS2V5LFxuICAgICAgc2VjcmV0S2V5LFxuICAgICAgaG9zdCxcbiAgICAgIHBvcnRcbiAgICB9KTtcblxuICAgIGlmICghYXBwbGljYXRpb25JZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXF1aXJlZCAqYXBwbGljYXRpb25JZCogbm90IHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgaWYgKCFmaWxlc0Rlc3QgJiYgIWRlc3RDYWxsYmFjaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXF1aXJlZCAqZmlsZXNEZXN0KiBub3QgcHJvdmlkZWQnKTtcbiAgICB9XG5cbiAgICBpZiAoZmlsZXNTcmMgJiYgZmlsZXNTcmMubGVuZ3RoKSB7XG4gICAgICBsZXQgX2ZpbGVzU3JjID0gW107XG4gICAgICBmb3IgKGxldCBpID0gMCwgbCA9IGZpbGVzU3JjLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgICBpZiAodHlwZW9mIGZpbGVzU3JjW2ldID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIC8vIFRPRE8gUmVwbGFjZSBgZ2xvYi5zeW5jYCB3aXRoIGFzeW5jIHZlcnNpb25cbiAgICAgICAgICBfZmlsZXNTcmMgPSBfZmlsZXNTcmMuY29uY2F0KGdsb2Iuc3luYyhmaWxlc1NyY1tpXSwge2RvdDogdHJ1ZX0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfZmlsZXNTcmMucHVzaChmaWxlc1NyY1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgX3ppcCA9IGF3YWl0IHppcChfZmlsZXNTcmMsIGN3ZCk7XG5cbiAgICAgIGNvbnN0IHJlbW92ZVNvdXJjZVJlcyA9IGF3YWl0IHRoaXMucmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uKGNsaWVudCwgJycsIGFwcGxpY2F0aW9uSWQpO1xuICAgICAgaWYgKHJlbW92ZVNvdXJjZVJlcy5lcnJvcnMpIHtcbiAgICAgICAgLy8gVE9ETyBJbXBsZW1lbnQgZXJyb3IgY29kZXMgb3IgZml4IHRoaXMgaXMgb24gdGhlIHNlcnZpY2VzXG4gICAgICAgIHZhciBoYWROb1NvdXJjZXMgPSBmYWxzZTtcbiAgICAgICAgcmVtb3ZlU291cmNlUmVzLmVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvci5tZXNzYWdlID09PSAnQXBwbGljYXRpb24gU291cmNlIHdpdGggdGhlIGdpdmVuIElEIGRvZXMgbm90IGV4aXN0Jykge1xuICAgICAgICAgICAgaGFkTm9Tb3VyY2VzID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIWhhZE5vU291cmNlcykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZW1vdmVTb3VyY2VSZXMuZXJyb3JzWzBdLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFkZEFwcGxpY2F0aW9uU291cmNlUmVzID0gYXdhaXQgdGhpcy5hZGRBcHBsaWNhdGlvblNvdXJjZShjbGllbnQsIGFwcGxpY2F0aW9uSWQsIHtcbiAgICAgICAgY29udGVudDogX3ppcC5nZW5lcmF0ZSh7dHlwZTogJ2Jhc2U2NCd9KSxcbiAgICAgICAgZmlsZW5hbWU6ICdhcHBsaWNhdGlvbi56aXAnLFxuICAgICAgICBleHRlbnNpb246ICd6aXAnXG4gICAgICB9KTtcbiAgICAgIGVycm9ySGFuZGxlcihhZGRBcHBsaWNhdGlvblNvdXJjZVJlcyk7XG4gICAgfVxuXG4gICAgY29uc3QgJHNldCA9IHtcbiAgICAgIF9pZDogYXBwbGljYXRpb25JZFxuICAgIH07XG5cbiAgICBpZiAocGFyYW1zICYmIE9iamVjdC5rZXlzKHBhcmFtcykubGVuZ3RoKSB7XG4gICAgICAkc2V0LnBhcmFtZXRlcnMgPSBKU09OLnN0cmluZ2lmeShub3JtYWxpemVQYXJhbWV0ZXJzKHBhcmFtcykpO1xuICAgICAgJHNldC5hcmVTdWJzY3JpYmVyc09yZGVyZWQgPSBBcnJheS5pc0FycmF5KHBhcmFtcyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhcmVTdWJzY3JpYmVyc09yZGVyZWQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAkc2V0LmFyZVN1YnNjcmliZXJzT3JkZXJlZCA9IGFyZVN1YnNjcmliZXJzT3JkZXJlZDtcbiAgICB9XG5cbiAgICBpZiAoYXBwbGljYXRpb25UeXBlcykge1xuICAgICAgJHNldC5hcHBsaWNhdGlvblR5cGVzID0gYXBwbGljYXRpb25UeXBlcztcbiAgICB9XG5cbiAgICBpZiAobGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucykge1xuICAgICAgJHNldC5sYW5ndWFnZVNwZWNpZmljYXRpb25zID0gbGFuZ3VhZ2VTcGVjaWZpY2F0aW9ucztcbiAgICB9XG5cbiAgICBpZiAoJHNldC5wYXJhbWV0ZXJzIHx8ICRzZXQuYXBwbGljYXRpb25UeXBlcyB8fCAkc2V0Lmxhbmd1YWdlU3BlY2lmaWNhdGlvbnMgfHxcbiAgICAgICAgdHlwZW9mICRzZXQuYXJlU3Vic2NyaWJlcnNPcmRlcmVkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc3QgdXBkYXRlQXBwbGljYXRpb25SZXMgPSBhd2FpdCB0aGlzLnVwZGF0ZUFwcGxpY2F0aW9uKGNsaWVudCwgJHNldCk7XG4gICAgICBlcnJvckhhbmRsZXIodXBkYXRlQXBwbGljYXRpb25SZXMpO1xuICAgIH1cblxuICAgIGNvbnN0IGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcyA9IGF3YWl0IHRoaXMuY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uKGNsaWVudCwgYXBwbGljYXRpb25JZCk7XG4gICAgZXJyb3JIYW5kbGVyKGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvblJlcyk7XG5cbiAgICBjb25zdCBwcm90ZWN0aW9uSWQgPSBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb25SZXMuZGF0YS5jcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24uX2lkO1xuICAgIGF3YWl0IHRoaXMucG9sbFByb3RlY3Rpb24oY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQpO1xuXG4gICAgY29uc3QgZG93bmxvYWQgPSBhd2FpdCB0aGlzLmRvd25sb2FkQXBwbGljYXRpb25Qcm90ZWN0aW9uKGNsaWVudCwgcHJvdGVjdGlvbklkKTtcbiAgICBlcnJvckhhbmRsZXIoZG93bmxvYWQpO1xuICAgIHVuemlwKGRvd25sb2FkLCBmaWxlc0Rlc3QgfHwgZGVzdENhbGxiYWNrKTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgcG9sbFByb3RlY3Rpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cbiAgICBjb25zdCBwb2xsID0gYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgYXBwbGljYXRpb25Qcm90ZWN0aW9uID0gYXdhaXQgdGhpcy5nZXRBcHBsaWNhdGlvblByb3RlY3Rpb24oY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQpO1xuICAgICAgaWYgKGFwcGxpY2F0aW9uUHJvdGVjdGlvbi5lcnJvcnMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciBwb2xsaW5nIHByb3RlY3Rpb24nKTtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdFcnJvciBwb2xsaW5nIHByb3RlY3Rpb24nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gYXBwbGljYXRpb25Qcm90ZWN0aW9uLmRhdGEuYXBwbGljYXRpb25Qcm90ZWN0aW9uLnN0YXRlO1xuICAgICAgICBpZiAoc3RhdGUgIT09ICdmaW5pc2hlZCcgJiYgc3RhdGUgIT09ICdlcnJvcmVkJykge1xuICAgICAgICAgIHNldFRpbWVvdXQocG9sbCwgNTAwKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gJ2Vycm9yZWQnKSB7XG4gICAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vYXBwLmpzY3JhbWJsZXIuY29tL2FwcC8ke2FwcGxpY2F0aW9uSWR9L3Byb3RlY3Rpb25zLyR7cHJvdGVjdGlvbklkfWA7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGBQcm90ZWN0aW9uIGZhaWxlZC4gRm9yIG1vcmUgaW5mb3JtYXRpb24gdmlzaXQ6ICR7dXJsfWApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBwb2xsKCk7XG5cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgY3JlYXRlQXBwbGljYXRpb24gKGNsaWVudCwgZGF0YSwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIGNyZWF0ZUFwcGxpY2F0aW9uKGRhdGEsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBkdXBsaWNhdGVBcHBsaWNhdGlvbiAoY2xpZW50LCBkYXRhLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgZHVwbGljYXRlQXBwbGljYXRpb24oZGF0YSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHJlbW92ZUFwcGxpY2F0aW9uIChjbGllbnQsIGlkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHJlbW92ZUFwcGxpY2F0aW9uKGlkKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHJlbW92ZVByb3RlY3Rpb24gKGNsaWVudCwgaWQsIGFwcElkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgcmVtb3ZlUHJvdGVjdGlvbihpZCwgYXBwSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyB1cGRhdGVBcHBsaWNhdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbiwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHVwZGF0ZUFwcGxpY2F0aW9uKGFwcGxpY2F0aW9uLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgdW5sb2NrQXBwbGljYXRpb24gKGNsaWVudCwgYXBwbGljYXRpb24sIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCB1bmxvY2tBcHBsaWNhdGlvbihhcHBsaWNhdGlvbiwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9uIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9uKGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblNvdXJjZSAoY2xpZW50LCBzb3VyY2VJZCwgZnJhZ21lbnRzLCBsaW1pdHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvblNvdXJjZShzb3VyY2VJZCwgZnJhZ21lbnRzLCBsaW1pdHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9ucyAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBwYXJhbXMsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnMoYXBwbGljYXRpb25JZCwgcGFyYW1zLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50IChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoJy9hcHBsaWNhdGlvbicsIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudChhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgY3JlYXRlVGVtcGxhdGUgKGNsaWVudCwgdGVtcGxhdGUsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBjcmVhdGVUZW1wbGF0ZSh0ZW1wbGF0ZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHJlbW92ZVRlbXBsYXRlIChjbGllbnQsIGlkKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHJlbW92ZVRlbXBsYXRlKGlkKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldFRlbXBsYXRlcyAoY2xpZW50LCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRUZW1wbGF0ZXMoZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGdldEFwcGxpY2F0aW9ucyAoY2xpZW50LCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRBcHBsaWNhdGlvbnMoZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGFkZEFwcGxpY2F0aW9uU291cmNlIChjbGllbnQsIGFwcGxpY2F0aW9uSWQsIGFwcGxpY2F0aW9uU291cmNlLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgYWRkQXBwbGljYXRpb25Tb3VyY2UoYXBwbGljYXRpb25JZCwgYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBhZGRBcHBsaWNhdGlvblNvdXJjZUZyb21VUkwgKGNsaWVudCwgYXBwbGljYXRpb25JZCwgdXJsLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICByZXR1cm4gZ2V0RmlsZUZyb21VcmwoY2xpZW50LCB1cmwpXG4gICAgICAudGhlbihmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBhZGRBcHBsaWNhdGlvblNvdXJjZShhcHBsaWNhdGlvbklkLCBmaWxlLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICB9KTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgdXBkYXRlQXBwbGljYXRpb25Tb3VyY2UgKGNsaWVudCwgYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCB1cGRhdGVBcHBsaWNhdGlvblNvdXJjZShhcHBsaWNhdGlvblNvdXJjZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIHJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbiAoY2xpZW50LCBzb3VyY2VJZCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgY2xpZW50LnBvc3QoJy9hcHBsaWNhdGlvbicsIHJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbihzb3VyY2VJZCwgYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGFwcGx5VGVtcGxhdGUgKGNsaWVudCwgdGVtcGxhdGVJZCwgYXBwSWQsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCBhcHBseVRlbXBsYXRlKHRlbXBsYXRlSWQsIGFwcElkLCBmcmFnbWVudHMpLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfSxcbiAgLy9cbiAgYXN5bmMgdXBkYXRlVGVtcGxhdGUgKGNsaWVudCwgdGVtcGxhdGUsIGZyYWdtZW50cykge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5wb3N0KCcvYXBwbGljYXRpb24nLCB1cGRhdGVUZW1wbGF0ZSh0ZW1wbGF0ZSwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGNyZWF0ZUFwcGxpY2F0aW9uUHJvdGVjdGlvbiAoY2xpZW50LCBhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQucG9zdCgnL2FwcGxpY2F0aW9uJywgY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uKGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyksIHJlc3BvbnNlSGFuZGxlcihkZWZlcnJlZCkpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9LFxuICAvL1xuICBhc3luYyBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb24gKGNsaWVudCwgYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkLCBmcmFnbWVudHMpIHtcbiAgICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBjbGllbnQuZ2V0KCcvYXBwbGljYXRpb24nLCBnZXRQcm90ZWN0aW9uKGFwcGxpY2F0aW9uSWQsIHByb3RlY3Rpb25JZCwgZnJhZ21lbnRzKSwgcmVzcG9uc2VIYW5kbGVyKGRlZmVycmVkKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH0sXG4gIC8vXG4gIGFzeW5jIGRvd25sb2FkQXBwbGljYXRpb25Qcm90ZWN0aW9uIChjbGllbnQsIHByb3RlY3Rpb25JZCkge1xuICAgIGNvbnN0IGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIGNsaWVudC5nZXQoYC9hcHBsaWNhdGlvbi9kb3dubG9hZC8ke3Byb3RlY3Rpb25JZH1gLCBudWxsLCByZXNwb25zZUhhbmRsZXIoZGVmZXJyZWQpLCBmYWxzZSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGdldEZpbGVGcm9tVXJsIChjbGllbnQsIHVybCkge1xuICBjb25zdCBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgdmFyIGZpbGU7XG4gIHJlcXVlc3QuZ2V0KHVybClcbiAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICBmaWxlID0ge1xuICAgICAgICBjb250ZW50OiByZXMuZGF0YSxcbiAgICAgICAgZmlsZW5hbWU6IHBhdGguYmFzZW5hbWUodXJsKSxcbiAgICAgICAgZXh0ZW5zaW9uOiBwYXRoLmV4dG5hbWUodXJsKS5zdWJzdHIoMSlcbiAgICAgIH07XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKGZpbGUpO1xuICAgIH0pXG4gICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xuICAgIH0pO1xuICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxuZnVuY3Rpb24gcmVzcG9uc2VIYW5kbGVyIChkZWZlcnJlZCkge1xuICByZXR1cm4gKGVyciwgcmVzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgZGVmZXJyZWQucmVqZWN0KGVycik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBib2R5ID0gcmVzLmRhdGE7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAocmVzLnN0YXR1cyA+PSA0MDApIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoYm9keSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShib2R5KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGJvZHkpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZXJyb3JIYW5kbGVyIChyZXMpIHtcbiAgaWYgKHJlcy5lcnJvcnMgJiYgcmVzLmVycm9ycy5sZW5ndGgpIHtcbiAgICByZXMuZXJyb3JzLmZvckVhY2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVQYXJhbWV0ZXJzIChwYXJhbWV0ZXJzKSB7XG4gIHZhciByZXN1bHQ7XG5cbiAgaWYgKCFBcnJheS5pc0FycmF5KHBhcmFtZXRlcnMpKSB7XG4gICAgcmVzdWx0ID0gW107XG4gICAgT2JqZWN0LmtleXMocGFyYW1ldGVycykuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICBuYW1lLFxuICAgICAgICBvcHRpb25zOiBwYXJhbWV0ZXJzW25hbWVdXG4gICAgICB9KVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9IHBhcmFtZXRlcnM7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuIl19
