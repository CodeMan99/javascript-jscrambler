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
  console.log('normalize', cwd);
  // If it's already a zip file
  if (files.length === 1 && /^.*\.zip$/.test(files[0])) {
    hasFiles = true;
    (0, _fsExtra.outputFileSync)(_temp2.default.openSync({ suffix: '.zip' }).path, (0, _fsExtra.readFileSync)(files[0]));
  } else {
    var _zip = new _jszip2.default();
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
        console.log('join', sPath);
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
            console.log('substring', name);
          } else {
            name = files[i];
          }
          buffer = (0, _fsExtra.readFileSync)(sPath);
        }
        // Else if it's a directory path
        else {
            _zip.folder(sPath);
          }
      if (name) {
        hasFiles = true;
        _zip.file(name, buffer);
      }
    }
    if (hasFiles) {
      var tempFile = _temp2.default.openSync({ suffix: '.zip' });
      (0, _fsExtra.outputFileSync)(tempFile.path, _zip.generate({ type: 'nodebuffer' }), { encoding: 'base64' });
      files[0] = tempFile.path;
      files.length = 1;
      deferred.resolve(_zip);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvemlwLmpzIl0sIm5hbWVzIjpbInppcCIsInVuemlwIiwiZGVidWciLCJwcm9jZXNzIiwiZW52IiwiREVCVUciLCJmaWxlcyIsImN3ZCIsImNvbnNvbGUiLCJsb2ciLCJkZWZlcnJlZCIsImhhc0ZpbGVzIiwibGVuZ3RoIiwidGVzdCIsIm9wZW5TeW5jIiwic3VmZml4IiwicGF0aCIsImkiLCJsIiwiaW5kZXhPZiIsImJ1ZmZlciIsIm5hbWUiLCJzUGF0aCIsImNvbnRlbnRzIiwiaXNEaXJlY3RvcnkiLCJzdWJzdHJpbmciLCJmb2xkZXIiLCJmaWxlIiwidGVtcEZpbGUiLCJnZW5lcmF0ZSIsInR5cGUiLCJlbmNvZGluZyIsInJlc29sdmUiLCJFcnJvciIsInByb21pc2UiLCJ6aXBGaWxlIiwiZGVzdCIsIl9zaXplIiwib3B0aW9ucyIsImRpciIsImFzTm9kZUJ1ZmZlciIsImRlc3RQYXRoIiwibGFzdERlc3RDaGFyIl0sIm1hcHBpbmdzIjoiOzs7OztRQVlnQkEsRyxHQUFBQSxHO1FBMEVBQyxLLEdBQUFBLEs7O0FBcEZoQjs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUVBLElBQU1DLFFBQVEsQ0FBQyxDQUFDQyxRQUFRQyxHQUFSLENBQVlDLEtBQTVCLEMsQ0FWQTs7QUFZTyxTQUFTTCxHQUFULENBQWNNLEtBQWQsRUFBcUJDLEdBQXJCLEVBQTBCO0FBQy9CTCxXQUFTTSxRQUFRQyxHQUFSLENBQVksZUFBWixFQUE2QixtQkFBUUgsS0FBUixDQUE3QixDQUFUO0FBQ0EsTUFBTUksV0FBVyxlQUFqQjtBQUNBO0FBQ0EsTUFBSUMsV0FBVyxLQUFmO0FBQ0E7QUFDQSxNQUFJSixHQUFKLEVBQVM7QUFDUEEsVUFBTSxxQkFBVUEsR0FBVixDQUFOO0FBQ0Q7QUFDREMsVUFBUUMsR0FBUixDQUFZLFdBQVosRUFBeUJGLEdBQXpCO0FBQ0E7QUFDQSxNQUFJRCxNQUFNTSxNQUFOLEtBQWlCLENBQWpCLElBQXNCLFlBQVlDLElBQVosQ0FBaUJQLE1BQU0sQ0FBTixDQUFqQixDQUExQixFQUFzRDtBQUNwREssZUFBVyxJQUFYO0FBQ0EsaUNBQWUsZUFBS0csUUFBTCxDQUFjLEVBQUNDLFFBQVEsTUFBVCxFQUFkLEVBQWdDQyxJQUEvQyxFQUFxRCwyQkFBYVYsTUFBTSxDQUFOLENBQWIsQ0FBckQ7QUFDRCxHQUhELE1BR087QUFDTCxRQUFNTixPQUFNLHFCQUFaO0FBQ0EsU0FBSyxJQUFJaUIsSUFBSSxDQUFSLEVBQVdDLElBQUlaLE1BQU1NLE1BQTFCLEVBQWtDSyxJQUFJQyxDQUF0QyxFQUF5QyxFQUFFRCxDQUEzQyxFQUE4QztBQUM1QztBQUNBLFVBQUksT0FBT1gsTUFBTVcsQ0FBTixDQUFQLEtBQW9CLFFBQXhCLEVBQWtDO0FBQ2hDWCxjQUFNVyxDQUFOLElBQVcscUJBQVVYLE1BQU1XLENBQU4sQ0FBVixDQUFYO0FBQ0EsWUFBSVgsTUFBTVcsQ0FBTixFQUFTRSxPQUFULENBQWlCLEtBQWpCLE1BQTRCLENBQWhDLEVBQW1DO0FBQ2pDYixnQkFBTVcsQ0FBTixJQUFXLG1CQUFRWCxNQUFNVyxDQUFOLENBQVIsQ0FBWDtBQUNEO0FBQ0Y7QUFDRDtBQUNBLFVBQUksdUJBQXVCSixJQUF2QixDQUE0QlAsTUFBTVcsQ0FBTixFQUFTRCxJQUFULElBQWlCVixNQUFNVyxDQUFOLENBQTdDLENBQUosRUFBNEQ7QUFDMUQ7QUFDRDtBQUNELFVBQUlHLGVBQUo7QUFBQSxVQUFZQyxhQUFaO0FBQ0EsVUFBSUMsY0FBSjtBQUNBLFVBQUlmLE9BQU9ELE1BQU1XLENBQU4sRUFBU0UsT0FBaEIsSUFBMkJiLE1BQU1XLENBQU4sRUFBU0UsT0FBVCxDQUFpQlosR0FBakIsTUFBMEIsQ0FBekQsRUFBNEQ7QUFDMURlLGdCQUFRLGdCQUFLZixHQUFMLEVBQVVELE1BQU1XLENBQU4sQ0FBVixDQUFSO0FBQ0FULGdCQUFRQyxHQUFSLENBQVksTUFBWixFQUFvQmEsS0FBcEI7QUFDRCxPQUhELE1BR087QUFDTEEsZ0JBQVFoQixNQUFNVyxDQUFOLENBQVI7QUFDRDtBQUNEO0FBQ0EsVUFBSVgsTUFBTVcsQ0FBTixFQUFTTSxRQUFiLEVBQXVCO0FBQ3JCRixlQUFPLG9CQUFTZixNQUFNVyxDQUFOLEVBQVNWLEdBQWxCLEVBQXVCRCxNQUFNVyxDQUFOLEVBQVNELElBQWhDLENBQVA7QUFDQUksaUJBQVNkLE1BQU1XLENBQU4sRUFBU00sUUFBbEI7QUFDRDtBQUNEO0FBSkEsV0FLSyxJQUFJLENBQUMsdUJBQVNELEtBQVQsRUFBZ0JFLFdBQWhCLEVBQUwsRUFBb0M7QUFDdkMsY0FBSWpCLE9BQU9ELE1BQU1XLENBQU4sRUFBU0UsT0FBaEIsSUFBMkJiLE1BQU1XLENBQU4sRUFBU0UsT0FBVCxDQUFpQlosR0FBakIsTUFBMEIsQ0FBekQsRUFBNEQ7QUFDMURjLG1CQUFPZixNQUFNVyxDQUFOLEVBQVNRLFNBQVQsQ0FBbUJsQixJQUFJSyxNQUF2QixDQUFQO0FBQ0FKLG9CQUFRQyxHQUFSLENBQVksV0FBWixFQUF5QlksSUFBekI7QUFDRCxXQUhELE1BR087QUFDTEEsbUJBQU9mLE1BQU1XLENBQU4sQ0FBUDtBQUNEO0FBQ0RHLG1CQUFTLDJCQUFhRSxLQUFiLENBQVQ7QUFDRDtBQUNEO0FBVEssYUFVQTtBQUNIdEIsaUJBQUkwQixNQUFKLENBQVdKLEtBQVg7QUFDRDtBQUNELFVBQUlELElBQUosRUFBVTtBQUNSVixtQkFBVyxJQUFYO0FBQ0FYLGFBQUkyQixJQUFKLENBQVNOLElBQVQsRUFBZUQsTUFBZjtBQUNEO0FBQ0Y7QUFDRCxRQUFJVCxRQUFKLEVBQWM7QUFDWixVQUFJaUIsV0FBVyxlQUFLZCxRQUFMLENBQWMsRUFBQ0MsUUFBUSxNQUFULEVBQWQsQ0FBZjtBQUNBLG1DQUFlYSxTQUFTWixJQUF4QixFQUE4QmhCLEtBQUk2QixRQUFKLENBQWEsRUFBQ0MsTUFBTSxZQUFQLEVBQWIsQ0FBOUIsRUFBa0UsRUFBQ0MsVUFBVSxRQUFYLEVBQWxFO0FBQ0F6QixZQUFNLENBQU4sSUFBV3NCLFNBQVNaLElBQXBCO0FBQ0FWLFlBQU1NLE1BQU4sR0FBZSxDQUFmO0FBQ0FGLGVBQVNzQixPQUFULENBQWlCaEMsSUFBakI7QUFDRCxLQU5ELE1BTU87QUFDTCxZQUFNLElBQUlpQyxLQUFKLENBQVUsbUhBQVYsQ0FBTjtBQUNEO0FBQ0Y7O0FBRUQsU0FBT3ZCLFNBQVN3QixPQUFoQjtBQUNEOztBQUVNLFNBQVNqQyxLQUFULENBQWdCa0MsT0FBaEIsRUFBeUJDLElBQXpCLEVBQStCO0FBQ3BDLE1BQU1wQyxNQUFNLG9CQUFVbUMsT0FBVixDQUFaO0FBQ0EsTUFBTUUsUUFBUSxzQkFBS3JDLElBQUlNLEtBQVQsQ0FBZDs7QUFFQSxPQUFLLElBQUlxQixJQUFULElBQWlCM0IsSUFBSU0sS0FBckIsRUFBNEI7QUFDMUIsUUFBSSxDQUFDTixJQUFJTSxLQUFKLENBQVVxQixJQUFWLEVBQWdCVyxPQUFoQixDQUF3QkMsR0FBN0IsRUFBa0M7QUFDaEMsVUFBTW5CLFNBQVNwQixJQUFJMkIsSUFBSixDQUFTQSxJQUFULEVBQWVhLFlBQWYsRUFBZjs7QUFFQSxVQUFJLE9BQU9KLElBQVAsS0FBZ0IsVUFBcEIsRUFBZ0M7QUFDOUJBLGFBQUtoQixNQUFMLEVBQWFPLElBQWI7QUFDRCxPQUZELE1BRU8sSUFBSVMsSUFBSixFQUFVO0FBQ2YsWUFBSUssUUFBSjs7QUFFQSxZQUFNQyxlQUFlTixLQUFLQSxLQUFLeEIsTUFBTCxHQUFjLENBQW5CLENBQXJCO0FBQ0EsWUFBSXlCLFVBQVUsQ0FBVixJQUFlSyxpQkFBaUIsR0FBaEMsSUFBdUNBLGlCQUFpQixJQUE1RCxFQUFrRTtBQUNoRUQscUJBQVdMLElBQVg7QUFDRCxTQUZELE1BRU87QUFDTEsscUJBQVcsZ0JBQUtMLElBQUwsRUFBV1QsSUFBWCxDQUFYO0FBQ0Q7QUFDRCxxQ0FBZWMsUUFBZixFQUF5QnJCLE1BQXpCO0FBQ0Q7QUFDRjtBQUNGO0FBQ0YiLCJmaWxlIjoiemlwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gVE9ETyBSZXBsYWNlIGBzeW5jYCBmdW5jdGlvbnMgd2l0aCBhc3luYyB2ZXJzaW9uc1xuXG5pbXBvcnQgc2l6ZSBmcm9tICdsb2Rhc2guc2l6ZSc7XG5pbXBvcnQgdGVtcCBmcm9tICd0ZW1wJztcbmltcG9ydCBKU1ppcCBmcm9tICdqc3ppcCc7XG5pbXBvcnQge3JlYWRGaWxlU3luYywgc3RhdFN5bmMsIG91dHB1dEZpbGVTeW5jfSBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQge25vcm1hbGl6ZSwgcmVzb2x2ZSwgcmVsYXRpdmUsIGpvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtkZWZlcn0gZnJvbSAncSc7XG5pbXBvcnQge2luc3BlY3R9IGZyb20gJ3V0aWwnO1xuXG5jb25zdCBkZWJ1ZyA9ICEhcHJvY2Vzcy5lbnYuREVCVUc7XG5cbmV4cG9ydCBmdW5jdGlvbiB6aXAgKGZpbGVzLCBjd2QpIHtcbiAgZGVidWcgJiYgY29uc29sZS5sb2coJ1ppcHBpbmcgZmlsZXMnLCBpbnNwZWN0KGZpbGVzKSk7XG4gIGNvbnN0IGRlZmVycmVkID0gZGVmZXIoKTtcbiAgLy8gRmxhZyB0byBkZXRlY3QgaWYgYW55IGZpbGUgd2FzIGFkZGVkIHRvIHRoZSB6aXAgYXJjaGl2ZVxuICB2YXIgaGFzRmlsZXMgPSBmYWxzZTtcbiAgLy8gU2FuaXRpemUgYGN3ZGBcbiAgaWYgKGN3ZCkge1xuICAgIGN3ZCA9IG5vcm1hbGl6ZShjd2QpO1xuICB9XG4gIGNvbnNvbGUubG9nKCdub3JtYWxpemUnLCBjd2QpO1xuICAvLyBJZiBpdCdzIGFscmVhZHkgYSB6aXAgZmlsZVxuICBpZiAoZmlsZXMubGVuZ3RoID09PSAxICYmIC9eLipcXC56aXAkLy50ZXN0KGZpbGVzWzBdKSkge1xuICAgIGhhc0ZpbGVzID0gdHJ1ZTtcbiAgICBvdXRwdXRGaWxlU3luYyh0ZW1wLm9wZW5TeW5jKHtzdWZmaXg6ICcuemlwJ30pLnBhdGgsIHJlYWRGaWxlU3luYyhmaWxlc1swXSkpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IHppcCA9IG5ldyBKU1ppcCgpO1xuICAgIGZvciAobGV0IGkgPSAwLCBsID0gZmlsZXMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgICAvLyBTYW5pdGlzZSBwYXRoXG4gICAgICBpZiAodHlwZW9mIGZpbGVzW2ldID09PSAnc3RyaW5nJykge1xuICAgICAgICBmaWxlc1tpXSA9IG5vcm1hbGl6ZShmaWxlc1tpXSk7XG4gICAgICAgIGlmIChmaWxlc1tpXS5pbmRleE9mKCcuLi8nKSA9PT0gMCkge1xuICAgICAgICAgIGZpbGVzW2ldID0gcmVzb2x2ZShmaWxlc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIEJ5cGFzcyB1bndhbnRlZCBwYXR0ZXJucyBmcm9tIGBmaWxlc2BcbiAgICAgIGlmICgvLipcXC4oZ2l0fGhnKShcXC8uKnwkKS8udGVzdChmaWxlc1tpXS5wYXRoIHx8IGZpbGVzW2ldKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGxldCBidWZmZXIsIG5hbWU7XG4gICAgICBsZXQgc1BhdGg7XG4gICAgICBpZiAoY3dkICYmIGZpbGVzW2ldLmluZGV4T2YgJiYgZmlsZXNbaV0uaW5kZXhPZihjd2QpICE9PSAwKSB7XG4gICAgICAgIHNQYXRoID0gam9pbihjd2QsIGZpbGVzW2ldKTtcbiAgICAgICAgY29uc29sZS5sb2coJ2pvaW4nLCBzUGF0aCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzUGF0aCA9IGZpbGVzW2ldO1xuICAgICAgfVxuICAgICAgLy8gSWYgYnVmZmVyXG4gICAgICBpZiAoZmlsZXNbaV0uY29udGVudHMpIHtcbiAgICAgICAgbmFtZSA9IHJlbGF0aXZlKGZpbGVzW2ldLmN3ZCwgZmlsZXNbaV0ucGF0aCk7XG4gICAgICAgIGJ1ZmZlciA9IGZpbGVzW2ldLmNvbnRlbnRzO1xuICAgICAgfVxuICAgICAgLy8gRWxzZSBpZiBpdCdzIGEgcGF0aCBhbmQgbm90IGEgZGlyZWN0b3J5XG4gICAgICBlbHNlIGlmICghc3RhdFN5bmMoc1BhdGgpLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgaWYgKGN3ZCAmJiBmaWxlc1tpXS5pbmRleE9mICYmIGZpbGVzW2ldLmluZGV4T2YoY3dkKSA9PT0gMCkge1xuICAgICAgICAgIG5hbWUgPSBmaWxlc1tpXS5zdWJzdHJpbmcoY3dkLmxlbmd0aCk7XG4gICAgICAgICAgY29uc29sZS5sb2coJ3N1YnN0cmluZycsIG5hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5hbWUgPSBmaWxlc1tpXTtcbiAgICAgICAgfVxuICAgICAgICBidWZmZXIgPSByZWFkRmlsZVN5bmMoc1BhdGgpO1xuICAgICAgfVxuICAgICAgLy8gRWxzZSBpZiBpdCdzIGEgZGlyZWN0b3J5IHBhdGhcbiAgICAgIGVsc2Uge1xuICAgICAgICB6aXAuZm9sZGVyKHNQYXRoKTtcbiAgICAgIH1cbiAgICAgIGlmIChuYW1lKSB7XG4gICAgICAgIGhhc0ZpbGVzID0gdHJ1ZTtcbiAgICAgICAgemlwLmZpbGUobmFtZSwgYnVmZmVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGhhc0ZpbGVzKSB7XG4gICAgICB2YXIgdGVtcEZpbGUgPSB0ZW1wLm9wZW5TeW5jKHtzdWZmaXg6ICcuemlwJ30pO1xuICAgICAgb3V0cHV0RmlsZVN5bmModGVtcEZpbGUucGF0aCwgemlwLmdlbmVyYXRlKHt0eXBlOiAnbm9kZWJ1ZmZlcid9KSwge2VuY29kaW5nOiAnYmFzZTY0J30pO1xuICAgICAgZmlsZXNbMF0gPSB0ZW1wRmlsZS5wYXRoO1xuICAgICAgZmlsZXMubGVuZ3RoID0gMTtcbiAgICAgIGRlZmVycmVkLnJlc29sdmUoemlwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBzb3VyY2UgZmlsZXMgZm91bmQuIElmIHlvdSBpbnRlbmQgdG8gc2VuZCBhIHdob2xlIGRpcmVjdG9yeSBzdWZpeCB5b3VyIHBhdGggd2l0aCBcIioqXCIgKGUuZy4gLi9teS1kaXJlY3RvcnkvKiopJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnppcCAoemlwRmlsZSwgZGVzdCkge1xuICBjb25zdCB6aXAgPSBuZXcgSlNaaXAoemlwRmlsZSk7XG4gIGNvbnN0IF9zaXplID0gc2l6ZSh6aXAuZmlsZXMpO1xuXG4gIGZvciAobGV0IGZpbGUgaW4gemlwLmZpbGVzKSB7XG4gICAgaWYgKCF6aXAuZmlsZXNbZmlsZV0ub3B0aW9ucy5kaXIpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IHppcC5maWxlKGZpbGUpLmFzTm9kZUJ1ZmZlcigpO1xuXG4gICAgICBpZiAodHlwZW9mIGRlc3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZGVzdChidWZmZXIsIGZpbGUpO1xuICAgICAgfSBlbHNlIGlmIChkZXN0KSB7XG4gICAgICAgIHZhciBkZXN0UGF0aDtcblxuICAgICAgICBjb25zdCBsYXN0RGVzdENoYXIgPSBkZXN0W2Rlc3QubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChfc2l6ZSA9PT0gMSAmJiBsYXN0RGVzdENoYXIgIT09ICcvJyAmJiBsYXN0RGVzdENoYXIgIT09ICdcXFxcJykge1xuICAgICAgICAgIGRlc3RQYXRoID0gZGVzdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZXN0UGF0aCA9IGpvaW4oZGVzdCwgZmlsZSk7XG4gICAgICAgIH1cbiAgICAgICAgb3V0cHV0RmlsZVN5bmMoZGVzdFBhdGgsIGJ1ZmZlcik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=
