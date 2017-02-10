'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getApplication = getApplication;
exports.getApplicationSource = getApplicationSource;
exports.getApplicationProtections = getApplicationProtections;
exports.getApplicationProtectionsCount = getApplicationProtectionsCount;
exports.getTemplates = getTemplates;
exports.getApplications = getApplications;
exports.getProtection = getProtection;
var getApplicationDefaultFragments = '\n  _id,\n  name,\n  createdAt,\n  sources {\n    _id,\n    filename,\n    extension\n  }\n';

function getApplication(applicationId) {
  var fragments = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getApplicationDefaultFragments;

  return {
    query: '\n      query getApplication ($applicationId: String!) {\n        application(_id: $applicationId) {\n          ' + fragments + '\n        }\n      }\n    ',
    params: JSON.stringify({
      applicationId: applicationId
    })
  };
}

var getApplicationSourceDefaultFragments = '\n  _id,\n  filename,\n  extension\n';

function getApplicationSource(sourceId) {
  var fragments = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getApplicationSourceDefaultFragments;
  var limits = arguments[2];

  return {
    query: '\n      query getApplicationSource ($sourceId: String!, $contentLimit: Int, $transformedLimit: Int) {\n        applicationSource(_id: $sourceId, contentLimit: $contentLimit, transformedLimit: $transformedLimit) {\n          ' + fragments + '\n        }\n      }\n    ',
    params: JSON.stringify(_extends({
      sourceId: sourceId
    }, limits))
  };
}

var getApplicationProtectionsDefaultFragments = '\n  _id,\n  sources,\n  parameters,\n  finishedAt,\n  randomizationSeed\n';

function getApplicationProtections(applicationId, params) {
  var fragments = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : getApplicationProtectionsDefaultFragments;

  return {
    query: '\n      query getApplicationProtections ($applicationId: String!, $sort: String, $order: String, $limit: Int, $page: Int) {\n        applicationProtections(_id: $applicationId, sort: $sort, order: $order, limit: $limit, page: $page) {\n          ' + fragments + '\n        }\n      }\n    ',
    params: JSON.stringify(_extends({
      applicationId: applicationId
    }, params))
  };
}

var getApplicationProtectionsCountDefaultFragments = '\n  count\n';

function getApplicationProtectionsCount(applicationId) {
  var fragments = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getApplicationProtectionsCountDefaultFragments;

  return {
    query: '\n      query getApplicationProtectionsCount ($applicationId: String!) {\n        applicationProtectionsCount(_id: $applicationId) {\n          ' + fragments + '\n        }\n      }\n    ',
    params: JSON.stringify({
      applicationId: applicationId
    })
  };
}

var getTemplatesDefaultFragments = '\n  _id,\n  parameters\n';

function getTemplates() {
  var fragments = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getTemplatesDefaultFragments;

  return {
    query: '\n      query getTemplates {\n        templates {\n          ' + fragments + '\n        }\n      }\n    ',
    params: '{}'
  };
}

var getApplicationsDefaultFragments = '\n  _id,\n  name,\n  protections,\n  parameters\n';

function getApplications() {
  var fragments = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getApplicationsDefaultFragments;

  return {
    query: '\n      query getApplications {\n        applications {\n          ' + fragments + '\n        }\n      }\n    ',
    params: '{}'
  };
}

var getProtectionDefaultFragments = {
  application: '\n    name\n  ',
  applicationProtection: '\n    _id,\n    state,\n    bail,\n    sources {\n      filename,\n      errorMessages {\n        message,\n        line,\n        column,\n        fatal\n      }\n    }\n  '
};

function getProtection(applicationId, protectionId) {
  var fragments = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : getProtectionDefaultFragments;

  return {
    query: '\n      query getProtection ($applicationId: String!, $protectionId: String!) {\n        application (_id: $applicationId) {\n          ' + fragments.application + '\n        }\n        applicationProtection (_id: $protectionId) {\n          ' + fragments.applicationProtection + '\n        }\n      }\n    ',
    params: JSON.stringify({
      applicationId: applicationId,
      protectionId: protectionId
    })
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvcXVlcmllcy5qcyJdLCJuYW1lcyI6WyJnZXRBcHBsaWNhdGlvbiIsImdldEFwcGxpY2F0aW9uU291cmNlIiwiZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9ucyIsImdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudCIsImdldFRlbXBsYXRlcyIsImdldEFwcGxpY2F0aW9ucyIsImdldFByb3RlY3Rpb24iLCJnZXRBcHBsaWNhdGlvbkRlZmF1bHRGcmFnbWVudHMiLCJhcHBsaWNhdGlvbklkIiwiZnJhZ21lbnRzIiwicXVlcnkiLCJwYXJhbXMiLCJKU09OIiwic3RyaW5naWZ5IiwiZ2V0QXBwbGljYXRpb25Tb3VyY2VEZWZhdWx0RnJhZ21lbnRzIiwic291cmNlSWQiLCJsaW1pdHMiLCJnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zRGVmYXVsdEZyYWdtZW50cyIsImdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudERlZmF1bHRGcmFnbWVudHMiLCJnZXRUZW1wbGF0ZXNEZWZhdWx0RnJhZ21lbnRzIiwiZ2V0QXBwbGljYXRpb25zRGVmYXVsdEZyYWdtZW50cyIsImdldFByb3RlY3Rpb25EZWZhdWx0RnJhZ21lbnRzIiwiYXBwbGljYXRpb24iLCJhcHBsaWNhdGlvblByb3RlY3Rpb24iLCJwcm90ZWN0aW9uSWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O1FBV2dCQSxjLEdBQUFBLGM7UUFxQkFDLG9CLEdBQUFBLG9CO1FBd0JBQyx5QixHQUFBQSx5QjtRQW9CQUMsOEIsR0FBQUEsOEI7UUFvQkFDLFksR0FBQUEsWTtRQW9CQUMsZSxHQUFBQSxlO1FBaUNBQyxhLEdBQUFBLGE7QUFySmhCLElBQU1DLDhIQUFOOztBQVdPLFNBQVNQLGNBQVQsQ0FBeUJRLGFBQXpCLEVBQW9GO0FBQUEsTUFBNUNDLFNBQTRDLHVFQUFoQ0YsOEJBQWdDOztBQUN6RixTQUFPO0FBQ0xHLGdJQUdRRCxTQUhSLCtCQURLO0FBUUxFLFlBQVFDLEtBQUtDLFNBQUwsQ0FBZTtBQUNyQkw7QUFEcUIsS0FBZjtBQVJILEdBQVA7QUFZRDs7QUFFRCxJQUFNTSw2RUFBTjs7QUFNTyxTQUFTYixvQkFBVCxDQUErQmMsUUFBL0IsRUFBbUc7QUFBQSxNQUExRE4sU0FBMEQsdUVBQTlDSyxvQ0FBOEM7QUFBQSxNQUFSRSxNQUFROztBQUN4RyxTQUFPO0FBQ0xOLGdQQUdRRCxTQUhSLCtCQURLO0FBUUxFLFlBQVFDLEtBQUtDLFNBQUw7QUFDTkU7QUFETSxPQUVIQyxNQUZHO0FBUkgsR0FBUDtBQWFEOztBQUVELElBQU1DLHVIQUFOOztBQVFPLFNBQVNmLHlCQUFULENBQW9DTSxhQUFwQyxFQUFtREcsTUFBbkQsRUFBa0g7QUFBQSxNQUF2REYsU0FBdUQsdUVBQTNDUSx5Q0FBMkM7O0FBQ3ZILFNBQU87QUFDTFAsc1FBR1FELFNBSFIsK0JBREs7QUFRTEUsWUFBUUMsS0FBS0MsU0FBTDtBQUNOTDtBQURNLE9BRUhHLE1BRkc7QUFSSCxHQUFQO0FBYUQ7O0FBRUQsSUFBTU8sOERBQU47O0FBSU8sU0FBU2YsOEJBQVQsQ0FBeUNLLGFBQXpDLEVBQW9IO0FBQUEsTUFBNURDLFNBQTRELHVFQUFoRFMsOENBQWdEOztBQUN6SCxTQUFPO0FBQ0xSLGdLQUdRRCxTQUhSLCtCQURLO0FBUUxFLFlBQVFDLEtBQUtDLFNBQUwsQ0FBZTtBQUNyQkw7QUFEcUIsS0FBZjtBQVJILEdBQVA7QUFZRDs7QUFFRCxJQUFNVyx5REFBTjs7QUFLTyxTQUFTZixZQUFULEdBQWlFO0FBQUEsTUFBMUNLLFNBQTBDLHVFQUE5QlUsNEJBQThCOztBQUN0RSxTQUFPO0FBQ0xULDZFQUdRRCxTQUhSLCtCQURLO0FBUUxFLFlBQVE7QUFSSCxHQUFQO0FBVUQ7O0FBRUQsSUFBTVMscUZBQU47O0FBT08sU0FBU2YsZUFBVCxHQUF1RTtBQUFBLE1BQTdDSSxTQUE2Qyx1RUFBakNXLCtCQUFpQzs7QUFDNUUsU0FBTztBQUNMVixtRkFHUUQsU0FIUiwrQkFESztBQVFMRSxZQUFRO0FBUkgsR0FBUDtBQVVEOztBQUVELElBQU1VLGdDQUFnQztBQUNwQ0MsK0JBRG9DO0FBSXBDQztBQUpvQyxDQUF0Qzs7QUFvQk8sU0FBU2pCLGFBQVQsQ0FBd0JFLGFBQXhCLEVBQXVDZ0IsWUFBdkMsRUFBZ0c7QUFBQSxNQUEzQ2YsU0FBMkMsdUVBQS9CWSw2QkFBK0I7O0FBQ3JHLFNBQU87QUFDTFgsd0pBR1FELFVBQVVhLFdBSGxCLHFGQU1RYixVQUFVYyxxQkFObEIsK0JBREs7QUFXTFosWUFBUUMsS0FBS0MsU0FBTCxDQUFlO0FBQ3JCTCxrQ0FEcUI7QUFFckJnQjtBQUZxQixLQUFmO0FBWEgsR0FBUDtBQWdCRCIsImZpbGUiOiJxdWVyaWVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZ2V0QXBwbGljYXRpb25EZWZhdWx0RnJhZ21lbnRzID0gYFxuICBfaWQsXG4gIG5hbWUsXG4gIGNyZWF0ZWRBdCxcbiAgc291cmNlcyB7XG4gICAgX2lkLFxuICAgIGZpbGVuYW1lLFxuICAgIGV4dGVuc2lvblxuICB9XG5gO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwbGljYXRpb24gKGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyA9IGdldEFwcGxpY2F0aW9uRGVmYXVsdEZyYWdtZW50cykge1xuICByZXR1cm4ge1xuICAgIHF1ZXJ5OiBgXG4gICAgICBxdWVyeSBnZXRBcHBsaWNhdGlvbiAoJGFwcGxpY2F0aW9uSWQ6IFN0cmluZyEpIHtcbiAgICAgICAgYXBwbGljYXRpb24oX2lkOiAkYXBwbGljYXRpb25JZCkge1xuICAgICAgICAgICR7ZnJhZ21lbnRzfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgYCxcbiAgICBwYXJhbXM6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIGFwcGxpY2F0aW9uSWRcbiAgICB9KVxuICB9O1xufVxuXG5jb25zdCBnZXRBcHBsaWNhdGlvblNvdXJjZURlZmF1bHRGcmFnbWVudHMgPSBgXG4gIF9pZCxcbiAgZmlsZW5hbWUsXG4gIGV4dGVuc2lvblxuYDtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcGxpY2F0aW9uU291cmNlIChzb3VyY2VJZCwgZnJhZ21lbnRzID0gZ2V0QXBwbGljYXRpb25Tb3VyY2VEZWZhdWx0RnJhZ21lbnRzLCBsaW1pdHMpIHtcbiAgcmV0dXJuIHtcbiAgICBxdWVyeTogYFxuICAgICAgcXVlcnkgZ2V0QXBwbGljYXRpb25Tb3VyY2UgKCRzb3VyY2VJZDogU3RyaW5nISwgJGNvbnRlbnRMaW1pdDogSW50LCAkdHJhbnNmb3JtZWRMaW1pdDogSW50KSB7XG4gICAgICAgIGFwcGxpY2F0aW9uU291cmNlKF9pZDogJHNvdXJjZUlkLCBjb250ZW50TGltaXQ6ICRjb250ZW50TGltaXQsIHRyYW5zZm9ybWVkTGltaXQ6ICR0cmFuc2Zvcm1lZExpbWl0KSB7XG4gICAgICAgICAgJHtmcmFnbWVudHN9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBgLFxuICAgIHBhcmFtczogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgc291cmNlSWQsXG4gICAgICAuLi5saW1pdHNcbiAgICB9KVxuICB9O1xufVxuXG5jb25zdCBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zRGVmYXVsdEZyYWdtZW50cyA9IGBcbiAgX2lkLFxuICBzb3VyY2VzLFxuICBwYXJhbWV0ZXJzLFxuICBmaW5pc2hlZEF0LFxuICByYW5kb21pemF0aW9uU2VlZFxuYDtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnMgKGFwcGxpY2F0aW9uSWQsIHBhcmFtcywgZnJhZ21lbnRzID0gZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0RlZmF1bHRGcmFnbWVudHMpIHtcbiAgcmV0dXJuIHtcbiAgICBxdWVyeTogYFxuICAgICAgcXVlcnkgZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9ucyAoJGFwcGxpY2F0aW9uSWQ6IFN0cmluZyEsICRzb3J0OiBTdHJpbmcsICRvcmRlcjogU3RyaW5nLCAkbGltaXQ6IEludCwgJHBhZ2U6IEludCkge1xuICAgICAgICBhcHBsaWNhdGlvblByb3RlY3Rpb25zKF9pZDogJGFwcGxpY2F0aW9uSWQsIHNvcnQ6ICRzb3J0LCBvcmRlcjogJG9yZGVyLCBsaW1pdDogJGxpbWl0LCBwYWdlOiAkcGFnZSkge1xuICAgICAgICAgICR7ZnJhZ21lbnRzfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgYCxcbiAgICBwYXJhbXM6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIGFwcGxpY2F0aW9uSWQsXG4gICAgICAuLi5wYXJhbXNcbiAgICB9KVxuICB9O1xufVxuXG5jb25zdCBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zQ291bnREZWZhdWx0RnJhZ21lbnRzID0gYFxuICBjb3VudFxuYDtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudCAoYXBwbGljYXRpb25JZCwgZnJhZ21lbnRzID0gZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50RGVmYXVsdEZyYWdtZW50cykge1xuICByZXR1cm4ge1xuICAgIHF1ZXJ5OiBgXG4gICAgICBxdWVyeSBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zQ291bnQgKCRhcHBsaWNhdGlvbklkOiBTdHJpbmchKSB7XG4gICAgICAgIGFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudChfaWQ6ICRhcHBsaWNhdGlvbklkKSB7XG4gICAgICAgICAgJHtmcmFnbWVudHN9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBgLFxuICAgIHBhcmFtczogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgYXBwbGljYXRpb25JZFxuICAgIH0pXG4gIH07XG59XG5cbmNvbnN0IGdldFRlbXBsYXRlc0RlZmF1bHRGcmFnbWVudHMgPSBgXG4gIF9pZCxcbiAgcGFyYW1ldGVyc1xuYDtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRlbXBsYXRlcyAoZnJhZ21lbnRzID0gZ2V0VGVtcGxhdGVzRGVmYXVsdEZyYWdtZW50cykge1xuICByZXR1cm4ge1xuICAgIHF1ZXJ5OiBgXG4gICAgICBxdWVyeSBnZXRUZW1wbGF0ZXMge1xuICAgICAgICB0ZW1wbGF0ZXMge1xuICAgICAgICAgICR7ZnJhZ21lbnRzfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgYCxcbiAgICBwYXJhbXM6ICd7fSdcbiAgfTtcbn1cblxuY29uc3QgZ2V0QXBwbGljYXRpb25zRGVmYXVsdEZyYWdtZW50cyA9IGBcbiAgX2lkLFxuICBuYW1lLFxuICBwcm90ZWN0aW9ucyxcbiAgcGFyYW1ldGVyc1xuYDtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcGxpY2F0aW9ucyAoZnJhZ21lbnRzID0gZ2V0QXBwbGljYXRpb25zRGVmYXVsdEZyYWdtZW50cykge1xuICByZXR1cm4ge1xuICAgIHF1ZXJ5OiBgXG4gICAgICBxdWVyeSBnZXRBcHBsaWNhdGlvbnMge1xuICAgICAgICBhcHBsaWNhdGlvbnMge1xuICAgICAgICAgICR7ZnJhZ21lbnRzfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgYCxcbiAgICBwYXJhbXM6ICd7fSdcbiAgfTtcbn1cblxuY29uc3QgZ2V0UHJvdGVjdGlvbkRlZmF1bHRGcmFnbWVudHMgPSB7XG4gIGFwcGxpY2F0aW9uOiBgXG4gICAgbmFtZVxuICBgLFxuICBhcHBsaWNhdGlvblByb3RlY3Rpb246IGBcbiAgICBfaWQsXG4gICAgc3RhdGUsXG4gICAgYmFpbCxcbiAgICBzb3VyY2VzIHtcbiAgICAgIGZpbGVuYW1lLFxuICAgICAgZXJyb3JNZXNzYWdlcyB7XG4gICAgICAgIG1lc3NhZ2UsXG4gICAgICAgIGxpbmUsXG4gICAgICAgIGNvbHVtbixcbiAgICAgICAgZmF0YWxcbiAgICAgIH1cbiAgICB9XG4gIGBcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcm90ZWN0aW9uIChhcHBsaWNhdGlvbklkLCBwcm90ZWN0aW9uSWQsIGZyYWdtZW50cyA9IGdldFByb3RlY3Rpb25EZWZhdWx0RnJhZ21lbnRzKSB7XG4gIHJldHVybiB7XG4gICAgcXVlcnk6IGBcbiAgICAgIHF1ZXJ5IGdldFByb3RlY3Rpb24gKCRhcHBsaWNhdGlvbklkOiBTdHJpbmchLCAkcHJvdGVjdGlvbklkOiBTdHJpbmchKSB7XG4gICAgICAgIGFwcGxpY2F0aW9uIChfaWQ6ICRhcHBsaWNhdGlvbklkKSB7XG4gICAgICAgICAgJHtmcmFnbWVudHMuYXBwbGljYXRpb259XG4gICAgICAgIH1cbiAgICAgICAgYXBwbGljYXRpb25Qcm90ZWN0aW9uIChfaWQ6ICRwcm90ZWN0aW9uSWQpIHtcbiAgICAgICAgICAke2ZyYWdtZW50cy5hcHBsaWNhdGlvblByb3RlY3Rpb259XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBgLFxuICAgIHBhcmFtczogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgYXBwbGljYXRpb25JZCxcbiAgICAgIHByb3RlY3Rpb25JZFxuICAgIH0pXG4gIH07XG59XG4iXX0=
