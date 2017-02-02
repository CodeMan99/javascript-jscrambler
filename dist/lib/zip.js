'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.zip = zip;
exports.unzip = unzip;

var _lodash = require('lodash.size');

var _lodash2 = _interopRequireDefault(_lodash);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _jszip = require('jszip');

var _jszip2 = _interopRequireDefault(_jszip);

var _fsExtra = require('fs-extra');

var _path = require('path');

var _q = require('q');

var _util = require('util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = !!process.env.DEBUG; // TODO Replace `sync` functions with async versions

function zip(files, cwd) {
  debug && console.log('Zipping files', (0, _util.inspect)(files));
  var deferred = (0, _q.defer)();
  // Flag to detect if any file was added to the zip archive
  var hasFiles = false;
  // Sanitize `cwd`
  if (cwd) {
    cwd = (0, _path.normalize)(cwd);
  }
  // If it's already a zip file
  if (files.length === 1 && /^.*\.zip$/.test(files[0])) {
    hasFiles = true;
    var _zip = new _jszip2.default();
    var zipFile = (0, _fsExtra.readFileSync)(files[0]);
    // @todo is it really necessary?
    (0, _fsExtra.outputFileSync)(_temp2.default.openSync({ suffix: '.zip' }).path, zipFile);
    zipFile = _zip.load(zipFile);
    deferred.resolve(zipFile);
  } else {
    var _zip2 = new _jszip2.default();
    for (var i = 0, l = files.length; i < l; ++i) {
      // Sanitise path
      if (typeof files[i] === 'string') {
        files[i] = (0, _path.normalize)(files[i]);
        if (files[i].indexOf('../') === 0) {
          files[i] = (0, _path.resolve)(files[i]);
        }
      }
      // Bypass unwanted patterns from `files`
      if (/.*\.(git|hg)(\/.*|$)/.test(files[i].path || files[i])) {
        continue;
      }
      var buffer = void 0,
          name = void 0;
      var sPath = void 0;
      if (cwd && files[i].indexOf && files[i].indexOf(cwd) !== 0) {
        sPath = (0, _path.join)(cwd, files[i]);
      } else {
        sPath = files[i];
      }
      // If buffer
      if (files[i].contents) {
        name = (0, _path.relative)(files[i].cwd, files[i].path);
        buffer = files[i].contents;
      }
      // Else if it's a path and not a directory
      else if (!(0, _fsExtra.statSync)(sPath).isDirectory()) {
          if (cwd && files[i].indexOf && files[i].indexOf(cwd) === 0) {
            name = files[i].substring(cwd.length);
          } else {
            name = files[i];
          }
          buffer = (0, _fsExtra.readFileSync)(sPath);
        }
        // Else if it's a directory path
        else {
            _zip2.folder(sPath);
          }
      if (name) {
        hasFiles = true;
        _zip2.file(name, buffer);
      }
    }
    if (hasFiles) {
      var tempFile = _temp2.default.openSync({ suffix: '.zip' });
      (0, _fsExtra.outputFileSync)(tempFile.path, _zip2.generate({ type: 'nodebuffer' }), { encoding: 'base64' });
      files[0] = tempFile.path;
      files.length = 1;
      deferred.resolve(_zip2);
    } else {
      throw new Error('No source files found. If you intend to send a whole directory sufix your path with "**" (e.g. ./my-directory/**)');
    }
  }

  return deferred.promise;
}

function unzip(zipFile, dest) {
  var zip = new _jszip2.default(zipFile);
  var _size = (0, _lodash2.default)(zip.files);

  for (var file in zip.files) {
    if (!zip.files[file].options.dir) {
      var buffer = zip.file(file).asNodeBuffer();

      if (typeof dest === 'function') {
        dest(buffer, file);
      } else if (dest) {
        var destPath;

        var lastDestChar = dest[dest.length - 1];
        if (_size === 1 && lastDestChar !== '/' && lastDestChar !== '\\') {
          destPath = dest;
        } else {
          destPath = (0, _path.join)(dest, file);
        }
        (0, _fsExtra.outputFileSync)(destPath, buffer);
      }
    }
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvemlwLmpzIl0sIm5hbWVzIjpbInppcCIsInVuemlwIiwiZGVidWciLCJwcm9jZXNzIiwiZW52IiwiREVCVUciLCJmaWxlcyIsImN3ZCIsImNvbnNvbGUiLCJsb2ciLCJkZWZlcnJlZCIsImhhc0ZpbGVzIiwibGVuZ3RoIiwidGVzdCIsInppcEZpbGUiLCJvcGVuU3luYyIsInN1ZmZpeCIsInBhdGgiLCJsb2FkIiwicmVzb2x2ZSIsImkiLCJsIiwiaW5kZXhPZiIsImJ1ZmZlciIsIm5hbWUiLCJzUGF0aCIsImNvbnRlbnRzIiwiaXNEaXJlY3RvcnkiLCJzdWJzdHJpbmciLCJmb2xkZXIiLCJmaWxlIiwidGVtcEZpbGUiLCJnZW5lcmF0ZSIsInR5cGUiLCJlbmNvZGluZyIsIkVycm9yIiwicHJvbWlzZSIsImRlc3QiLCJfc2l6ZSIsIm9wdGlvbnMiLCJkaXIiLCJhc05vZGVCdWZmZXIiLCJkZXN0UGF0aCIsImxhc3REZXN0Q2hhciJdLCJtYXBwaW5ncyI6Ijs7Ozs7UUFZZ0JBLEcsR0FBQUEsRztRQTRFQUMsSyxHQUFBQSxLOztBQXRGaEI7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFFQSxJQUFNQyxRQUFRLENBQUMsQ0FBQ0MsUUFBUUMsR0FBUixDQUFZQyxLQUE1QixDLENBVkE7O0FBWU8sU0FBU0wsR0FBVCxDQUFjTSxLQUFkLEVBQXFCQyxHQUFyQixFQUEwQjtBQUMvQkwsV0FBU00sUUFBUUMsR0FBUixDQUFZLGVBQVosRUFBNkIsbUJBQVFILEtBQVIsQ0FBN0IsQ0FBVDtBQUNBLE1BQU1JLFdBQVcsZUFBakI7QUFDQTtBQUNBLE1BQUlDLFdBQVcsS0FBZjtBQUNBO0FBQ0EsTUFBSUosR0FBSixFQUFTO0FBQ1BBLFVBQU0scUJBQVVBLEdBQVYsQ0FBTjtBQUNEO0FBQ0Q7QUFDQSxNQUFJRCxNQUFNTSxNQUFOLEtBQWlCLENBQWpCLElBQXNCLFlBQVlDLElBQVosQ0FBaUJQLE1BQU0sQ0FB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cyB3aXRoIGFzeW5jIHZlcnNpb25zXG5cbmltcG9ydCBzaXplIGZyb20gJ2xvZGFzaC5zaXplJztcbmltcG9ydCB0ZW1wIGZyb20gJ3RlbXAnO1xuaW1wb3J0IEpTWmlwIGZyb20gJ2pzemlwJztcbmltcG9ydCB7cmVhZEZpbGVTeW5jLCBzdGF0U3luYywgb3V0cHV0RmlsZVN5bmN9IGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCB7bm9ybWFsaXplLCByZXNvbHZlLCByZWxhdGl2ZSwgam9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQge2RlZmVyfSBmcm9tICdxJztcbmltcG9ydCB7aW5zcGVjdH0gZnJvbSAndXRpbCc7XG5cbmNvbnN0IGRlYnVnID0gISFwcm9jZXNzLmVudi5ERUJVRztcblxuZXhwb3J0IGZ1bmN0aW9uIHppcCAoZmlsZXMsIGN3ZCkge1xuICBkZWJ1ZyAmJiBjb25zb2xlLmxvZygnWmlwcGluZyBmaWxlcycsIGluc3BlY3QoZmlsZXMpKTtcbiAgY29uc3QgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAvLyBGbGFnIHRvIGRldGVjdCBpZiBhbnkgZmlsZSB3YXMgYWRkZWQgdG8gdGhlIHppcCBhcmNoaXZlXG4gIHZhciBoYXNGaWxlcyA9IGZhbHNlO1xuICAvLyBTYW5pdGl6ZSBgY3dkYFxuICBpZiAoY3dkKSB7XG4gICAgY3dkID0gbm9ybWFsaXplKGN3ZCk7XG4gIH1cbiAgLy8gSWYgaXQncyBhbHJlYWR5IGEgemlwIGZpbGVcbiAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMSAmJiAvXi4qXFwuemlwJC8udGVzdChmaWxlc1swXSkpIHtcbiAgICBoYXNGaWxlcyA9IHRydWU7XG4gICAgY29uc3QgemlwID0gbmV3IEpTWmlwKCk7XG4gICAgbGV0IHppcEZpbGUgPSByZWFkRmlsZVN5bmMoZmlsZXNbMF0pO1xuICAgIC8vIEB0b2RvIGlzIGl0IHJlYWxseSBuZWNlc3Nhcnk/XG4gICAgb3V0cHV0RmlsZVN5bmModGVtcC5vcGVuU3luYyh7c3VmZml4OiAnLnppcCd9KS5wYXRoLCB6aXBGaWxlKTtcbiAgICB6aXBGaWxlID0gemlwLmxvYWQoemlwRmlsZSk7XG4gICAgZGVmZXJyZWQucmVzb2x2ZSh6aXBGaWxlKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCB6aXAgPSBuZXcgSlNaaXAoKTtcbiAgICBmb3IgKGxldCBpID0gMCwgbCA9IGZpbGVzLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgLy8gU2FuaXRpc2UgcGF0aFxuICAgICAgaWYgKHR5cGVvZiBmaWxlc1tpXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgZmlsZXNbaV0gPSBub3JtYWxpemUoZmlsZXNbaV0pO1xuICAgICAgICBpZiAoZmlsZXNbaV0uaW5kZXhPZignLi4vJykgPT09IDApIHtcbiAgICAgICAgICBmaWxlc1tpXSA9IHJlc29sdmUoZmlsZXNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBCeXBhc3MgdW53YW50ZWQgcGF0dGVybnMgZnJvbSBgZmlsZXNgXG4gICAgICBpZiAoLy4qXFwuKGdpdHxoZykoXFwvLip8JCkvLnRlc3QoZmlsZXNbaV0ucGF0aCB8fCBmaWxlc1tpXSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBsZXQgYnVmZmVyLCBuYW1lO1xuICAgICAgbGV0IHNQYXRoO1xuICAgICAgaWYgKGN3ZCAmJiBmaWxlc1tpXS5pbmRleE9mICYmIGZpbGVzW2ldLmluZGV4T2YoY3dkKSAhPT0gMCkge1xuICAgICAgICBzUGF0aCA9IGpvaW4oY3dkLCBmaWxlc1tpXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzUGF0aCA9IGZpbGVzW2ldO1xuICAgICAgfVxuICAgICAgLy8gSWYgYnVmZmVyXG4gICAgICBpZiAoZmlsZXNbaV0uY29udGVudHMpIHtcbiAgICAgICAgbmFtZSA9IHJlbGF0aXZlKGZpbGVzW2ldLmN3ZCwgZmlsZXNbaV0ucGF0aCk7XG4gICAgICAgIGJ1ZmZlciA9IGZpbGVzW2ldLmNvbnRlbnRzO1xuICAgICAgfVxuICAgICAgLy8gRWxzZSBpZiBpdCdzIGEgcGF0aCBhbmQgbm90IGEgZGlyZWN0b3J5XG4gICAgICBlbHNlIGlmICghc3RhdFN5bmMoc1BhdGgpLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgaWYgKGN3ZCAmJiBmaWxlc1tpXS5pbmRleE9mICYmIGZpbGVzW2ldLmluZGV4T2YoY3dkKSA9PT0gMCkge1xuICAgICAgICAgIG5hbWUgPSBmaWxlc1tpXS5zdWJzdHJpbmcoY3dkLmxlbmd0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmFtZSA9IGZpbGVzW2ldO1xuICAgICAgICB9XG4gICAgICAgIGJ1ZmZlciA9IHJlYWRGaWxlU3luYyhzUGF0aCk7XG4gICAgICB9XG4gICAgICAvLyBFbHNlIGlmIGl0J3MgYSBkaXJlY3RvcnkgcGF0aFxuICAgICAgZWxzZSB7XG4gICAgICAgIHppcC5mb2xkZXIoc1BhdGgpO1xuICAgICAgfVxuICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgaGFzRmlsZXMgPSB0cnVlO1xuICAgICAgICB6aXAuZmlsZShuYW1lLCBidWZmZXIpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaGFzRmlsZXMpIHtcbiAgICAgIHZhciB0ZW1wRmlsZSA9IHRlbXAub3BlblN5bmMoe3N1ZmZpeDogJy56aXAnfSk7XG4gICAgICBvdXRwdXRGaWxlU3luYyh0ZW1wRmlsZS5wYXRoLCB6aXAuZ2VuZXJhdGUoe3R5cGU6ICdub2RlYnVmZmVyJ30pLCB7ZW5jb2Rpbmc6ICdiYXNlNjQnfSk7XG4gICAgICBmaWxlc1swXSA9IHRlbXBGaWxlLnBhdGg7XG4gICAgICBmaWxlcy5sZW5ndGggPSAxO1xuICAgICAgZGVmZXJyZWQucmVzb2x2ZSh6aXApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHNvdXJjZSBmaWxlcyBmb3VuZC4gSWYgeW91IGludGVuZCB0byBzZW5kIGEgd2hvbGUgZGlyZWN0b3J5IHN1Zml4IHlvdXIgcGF0aCB3aXRoIFwiKipcIiAoZS5nLiAuL215LWRpcmVjdG9yeS8qKiknKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuemlwICh6aXBGaWxlLCBkZXN0KSB7XG4gIGNvbnN0IHppcCA9IG5ldyBKU1ppcCh6aXBGaWxlKTtcbiAgY29uc3QgX3NpemUgPSBzaXplKHppcC5maWxlcyk7XG5cbiAgZm9yIChsZXQgZmlsZSBpbiB6aXAuZmlsZXMpIHtcbiAgICBpZiAoIXppcC5maWxlc1tmaWxlXS5vcHRpb25zLmRpcikge1xuICAgICAgY29uc3QgYnVmZmVyID0gemlwLmZpbGUoZmlsZSkuYXNOb2RlQnVmZmVyKCk7XG5cbiAgICAgIGlmICh0eXBlb2YgZGVzdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBkZXN0KGJ1ZmZlciwgZmlsZSk7XG4gICAgICB9IGVsc2UgaWYgKGRlc3QpIHtcbiAgICAgICAgdmFyIGRlc3RQYXRoO1xuXG4gICAgICAgIGNvbnN0IGxhc3REZXN0Q2hhciA9IGRlc3RbZGVzdC5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKF9zaXplID09PSAxICYmIGxhc3REZXN0Q2hhciAhPT0gJy8nICYmIGxhc3REZXN0Q2hhciAhPT0gJ1xcXFwnKSB7XG4gICAgICAgICAgZGVzdFBhdGggPSBkZXN0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlc3RQYXRoID0gam9pbihkZXN0LCBmaWxlKTtcbiAgICAgICAgfVxuICAgICAgICBvdXRwdXRGaWxlU3luYyhkZXN0UGF0aCwgYnVmZmVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==
