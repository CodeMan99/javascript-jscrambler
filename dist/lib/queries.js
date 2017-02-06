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

var getApplicationProtectionsDefaultFragments = '\n  _id,\n  sources,\n  parameters,\n  finishedAt\n';

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
  applicationProtection: '\n    _id,\n    state,\n    sources {\n      filename,\n      errorMessages {\n        message,\n        fatal\n      }\n    }\n  '
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvcXVlcmllcy5qcyJdLCJuYW1lcyI6WyJnZXRBcHBsaWNhdGlvbiIsImdldEFwcGxpY2F0aW9uU291cmNlIiwiZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9ucyIsImdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudCIsImdldFRlbXBsYXRlcyIsImdldEFwcGxpY2F0aW9ucyIsImdldFByb3RlY3Rpb24iLCJnZXRBcHBsaWNhdGlvbkRlZmF1bHRGcmFnbWVudHMiLCJhcHBsaWNhdGlvbklkIiwiZnJhZ21lbnRzIiwicXVlcnkiLCJwYXJhbXMiLCJKU09OIiwic3RyaW5naWZ5IiwiZ2V0QXBwbGljYXRpb25Tb3VyY2VEZWZhdWx0RnJhZ21lbnRzIiwic291cmNlSWQiLCJsaW1pdHMiLCJnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zRGVmYXVsdEZyYWdtZW50cyIsImdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudERlZmF1bHRGcmFnbWVudHMiLCJnZXRUZW1wbGF0ZXNEZWZhdWx0RnJhZ21lbnRzIiwiZ2V0QXBwbGljYXRpb25zRGVmYXVsdEZyYWdtZW50cyIsImdldFByb3RlY3Rpb25EZWZhdWx0RnJhZ21lbnRzIiwiYXBwbGljYXRpb24iLCJhcHBsaWNhdGlvblByb3RlY3Rpb24iLCJwcm90ZWN0aW9uSWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O1FBV2dCQSxjLEdBQUFBLGM7UUFxQkFDLG9CLEdBQUFBLG9CO1FBdUJBQyx5QixHQUFBQSx5QjtRQW9CQUMsOEIsR0FBQUEsOEI7UUFvQkFDLFksR0FBQUEsWTtRQW9CQUMsZSxHQUFBQSxlO1FBOEJBQyxhLEdBQUFBLGE7QUFqSmhCLElBQU1DLDhIQUFOOztBQVdPLFNBQVNQLGNBQVQsQ0FBeUJRLGFBQXpCLEVBQW9GO0FBQUEsTUFBNUNDLFNBQTRDLHVFQUFoQ0YsOEJBQWdDOztBQUN6RixTQUFPO0FBQ0xHLGdJQUdRRCxTQUhSLCtCQURLO0FBUUxFLFlBQVFDLEtBQUtDLFNBQUwsQ0FBZTtBQUNyQkw7QUFEcUIsS0FBZjtBQVJILEdBQVA7QUFZRDs7QUFFRCxJQUFNTSw2RUFBTjs7QUFNTyxTQUFTYixvQkFBVCxDQUErQmMsUUFBL0IsRUFBbUc7QUFBQSxNQUExRE4sU0FBMEQsdUVBQTlDSyxvQ0FBOEM7QUFBQSxNQUFSRSxNQUFROztBQUN4RyxTQUFPO0FBQ0xOLGdQQUdRRCxTQUhSLCtCQURLO0FBUUxFLFlBQVFDLEtBQUtDLFNBQUw7QUFDTkU7QUFETSxPQUVIQyxNQUZHO0FBUkgsR0FBUDtBQWFEOztBQUVELElBQU1DLGlHQUFOOztBQU9PLFNBQVNmLHlCQUFULENBQW9DTSxhQUFwQyxFQUFtREcsTUFBbkQsRUFBa0g7QUFBQSxNQUF2REYsU0FBdUQsdUVBQTNDUSx5Q0FBMkM7O0FBQ3ZILFNBQU87QUFDTFAsc1FBR1FELFNBSFIsK0JBREs7QUFRTEUsWUFBUUMsS0FBS0MsU0FBTDtBQUNOTDtBQURNLE9BRUhHLE1BRkc7QUFSSCxHQUFQO0FBYUQ7O0FBRUQsSUFBTU8sOERBQU47O0FBSU8sU0FBU2YsOEJBQVQsQ0FBeUNLLGFBQXpDLEVBQW9IO0FBQUEsTUFBNURDLFNBQTRELHVFQUFoRFMsOENBQWdEOztBQUN6SCxTQUFPO0FBQ0xSLGdLQUdRRCxTQUhSLCtCQURLO0FBUUxFLFlBQVFDLEtBQUtDLFNBQUwsQ0FBZTtBQUNyQkw7QUFEcUIsS0FBZjtBQVJILEdBQVA7QUFZRDs7QUFFRCxJQUFNVyx5REFBTjs7QUFLTyxTQUFTZixZQUFULEdBQWlFO0FBQUEsTUFBMUNLLFNBQTBDLHVFQUE5QlUsNEJBQThCOztBQUN0RSxTQUFPO0FBQ0xULDZFQUdRRCxTQUhSLCtCQURLO0FBUUxFLFlBQVE7QUFSSCxHQUFQO0FBVUQ7O0FBRUQsSUFBTVMscUZBQU47O0FBT08sU0FBU2YsZUFBVCxHQUF1RTtBQUFBLE1BQTdDSSxTQUE2Qyx1RUFBakNXLCtCQUFpQzs7QUFDNUUsU0FBTztBQUNMVixtRkFHUUQsU0FIUiwrQkFESztBQVFMRSxZQUFRO0FBUkgsR0FBUDtBQVVEOztBQUVELElBQU1VLGdDQUFnQztBQUNwQ0MsK0JBRG9DO0FBSXBDQztBQUpvQyxDQUF0Qzs7QUFpQk8sU0FBU2pCLGFBQVQsQ0FBd0JFLGFBQXhCLEVBQXVDZ0IsWUFBdkMsRUFBZ0c7QUFBQSxNQUEzQ2YsU0FBMkMsdUVBQS9CWSw2QkFBK0I7O0FBQ3JHLFNBQU87QUFDTFgsd0pBR1FELFVBQVVhLFdBSGxCLHFGQU1RYixVQUFVYyxxQkFObEIsK0JBREs7QUFXTFosWUFBUUMsS0FBS0MsU0FBTCxDQUFlO0FBQ3JCTCxrQ0FEcUI7QUFFckJnQjtBQUZxQixLQUFmO0FBWEgsR0FBUDtBQWdCRCIsImZpbGUiOiJxdWVyaWVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZ2V0QXBwbGljYXRpb25EZWZhdWx0RnJhZ21lbnRzID0gYFxuICBfaWQsXG4gIG5hbWUsXG4gIGNyZWF0ZWRBdCxcbiAgc291cmNlcyB7XG4gICAgX2lkLFxuICAgIGZpbGVuYW1lLFxuICAgIGV4dGVuc2lvblxuICB9XG5gO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwbGljYXRpb24gKGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyA9IGdldEFwcGxpY2F0aW9uRGVmYXVsdEZyYWdtZW50cykge1xuICByZXR1cm4ge1xuICAgIHF1ZXJ5OiBgXG4gICAgICBxdWVyeSBnZXRBcHBsaWNhdGlvbiAoJGFwcGxpY2F0aW9uSWQ6IFN0cmluZyEpIHtcbiAgICAgICAgYXBwbGljYXRpb24oX2lkOiAkYXBwbGljYXRpb25JZCkge1xuICAgICAgICAgICR7ZnJhZ21lbnRzfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgYCxcbiAgICBwYXJhbXM6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIGFwcGxpY2F0aW9uSWRcbiAgICB9KVxuICB9O1xufVxuXG5jb25zdCBnZXRBcHBsaWNhdGlvblNvdXJjZURlZmF1bHRGcmFnbWVudHMgPSBgXG4gIF9pZCxcbiAgZmlsZW5hbWUsXG4gIGV4dGVuc2lvblxuYDtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFwcGxpY2F0aW9uU291cmNlIChzb3VyY2VJZCwgZnJhZ21lbnRzID0gZ2V0QXBwbGljYXRpb25Tb3VyY2VEZWZhdWx0RnJhZ21lbnRzLCBsaW1pdHMpIHtcbiAgcmV0dXJuIHtcbiAgICBxdWVyeTogYFxuICAgICAgcXVlcnkgZ2V0QXBwbGljYXRpb25Tb3VyY2UgKCRzb3VyY2VJZDogU3RyaW5nISwgJGNvbnRlbnRMaW1pdDogSW50LCAkdHJhbnNmb3JtZWRMaW1pdDogSW50KSB7XG4gICAgICAgIGFwcGxpY2F0aW9uU291cmNlKF9pZDogJHNvdXJjZUlkLCBjb250ZW50TGltaXQ6ICRjb250ZW50TGltaXQsIHRyYW5zZm9ybWVkTGltaXQ6ICR0cmFuc2Zvcm1lZExpbWl0KSB7XG4gICAgICAgICAgJHtmcmFnbWVudHN9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBgLFxuICAgIHBhcmFtczogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgc291cmNlSWQsXG4gICAgICAuLi5saW1pdHNcbiAgICB9KVxuICB9O1xufVxuXG5jb25zdCBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zRGVmYXVsdEZyYWdtZW50cyA9IGBcbiAgX2lkLFxuICBzb3VyY2VzLFxuICBwYXJhbWV0ZXJzLFxuICBmaW5pc2hlZEF0XG5gO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9ucyAoYXBwbGljYXRpb25JZCwgcGFyYW1zLCBmcmFnbWVudHMgPSBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zRGVmYXVsdEZyYWdtZW50cykge1xuICByZXR1cm4ge1xuICAgIHF1ZXJ5OiBgXG4gICAgICBxdWVyeSBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zICgkYXBwbGljYXRpb25JZDogU3RyaW5nISwgJHNvcnQ6IFN0cmluZywgJG9yZGVyOiBTdHJpbmcsICRsaW1pdDogSW50LCAkcGFnZTogSW50KSB7XG4gICAgICAgIGFwcGxpY2F0aW9uUHJvdGVjdGlvbnMoX2lkOiAkYXBwbGljYXRpb25JZCwgc29ydDogJHNvcnQsIG9yZGVyOiAkb3JkZXIsIGxpbWl0OiAkbGltaXQsIHBhZ2U6ICRwYWdlKSB7XG4gICAgICAgICAgJHtmcmFnbWVudHN9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBgLFxuICAgIHBhcmFtczogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgYXBwbGljYXRpb25JZCxcbiAgICAgIC4uLnBhcmFtc1xuICAgIH0pXG4gIH07XG59XG5cbmNvbnN0IGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudERlZmF1bHRGcmFnbWVudHMgPSBgXG4gIGNvdW50XG5gO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50IChhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMgPSBnZXRBcHBsaWNhdGlvblByb3RlY3Rpb25zQ291bnREZWZhdWx0RnJhZ21lbnRzKSB7XG4gIHJldHVybiB7XG4gICAgcXVlcnk6IGBcbiAgICAgIHF1ZXJ5IGdldEFwcGxpY2F0aW9uUHJvdGVjdGlvbnNDb3VudCAoJGFwcGxpY2F0aW9uSWQ6IFN0cmluZyEpIHtcbiAgICAgICAgYXBwbGljYXRpb25Qcm90ZWN0aW9uc0NvdW50KF9pZDogJGFwcGxpY2F0aW9uSWQpIHtcbiAgICAgICAgICAke2ZyYWdtZW50c31cbiAgICAgICAgfVxuICAgICAgfVxuICAgIGAsXG4gICAgcGFyYW1zOiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICBhcHBsaWNhdGlvbklkXG4gICAgfSlcbiAgfTtcbn1cblxuY29uc3QgZ2V0VGVtcGxhdGVzRGVmYXVsdEZyYWdtZW50cyA9IGBcbiAgX2lkLFxuICBwYXJhbWV0ZXJzXG5gO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGVtcGxhdGVzIChmcmFnbWVudHMgPSBnZXRUZW1wbGF0ZXNEZWZhdWx0RnJhZ21lbnRzKSB7XG4gIHJldHVybiB7XG4gICAgcXVlcnk6IGBcbiAgICAgIHF1ZXJ5IGdldFRlbXBsYXRlcyB7XG4gICAgICAgIHRlbXBsYXRlcyB7XG4gICAgICAgICAgJHtmcmFnbWVudHN9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBgLFxuICAgIHBhcmFtczogJ3t9J1xuICB9O1xufVxuXG5jb25zdCBnZXRBcHBsaWNhdGlvbnNEZWZhdWx0RnJhZ21lbnRzID0gYFxuICBfaWQsXG4gIG5hbWUsXG4gIHByb3RlY3Rpb25zLFxuICBwYXJhbWV0ZXJzXG5gO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwbGljYXRpb25zIChmcmFnbWVudHMgPSBnZXRBcHBsaWNhdGlvbnNEZWZhdWx0RnJhZ21lbnRzKSB7XG4gIHJldHVybiB7XG4gICAgcXVlcnk6IGBcbiAgICAgIHF1ZXJ5IGdldEFwcGxpY2F0aW9ucyB7XG4gICAgICAgIGFwcGxpY2F0aW9ucyB7XG4gICAgICAgICAgJHtmcmFnbWVudHN9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBgLFxuICAgIHBhcmFtczogJ3t9J1xuICB9O1xufVxuXG5jb25zdCBnZXRQcm90ZWN0aW9uRGVmYXVsdEZyYWdtZW50cyA9IHtcbiAgYXBwbGljYXRpb246IGBcbiAgICBuYW1lXG4gIGAsXG4gIGFwcGxpY2F0aW9uUHJvdGVjdGlvbjogYFxuICAgIF9pZCxcbiAgICBzdGF0ZSxcbiAgICBzb3VyY2VzIHtcbiAgICAgIGZpbGVuYW1lLFxuICAgICAgZXJyb3JNZXNzYWdlcyB7XG4gICAgICAgIG1lc3NhZ2UsXG4gICAgICAgIGZhdGFsXG4gICAgICB9XG4gICAgfVxuICBgXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvdGVjdGlvbiAoYXBwbGljYXRpb25JZCwgcHJvdGVjdGlvbklkLCBmcmFnbWVudHMgPSBnZXRQcm90ZWN0aW9uRGVmYXVsdEZyYWdtZW50cykge1xuICByZXR1cm4ge1xuICAgIHF1ZXJ5OiBgXG4gICAgICBxdWVyeSBnZXRQcm90ZWN0aW9uICgkYXBwbGljYXRpb25JZDogU3RyaW5nISwgJHByb3RlY3Rpb25JZDogU3RyaW5nISkge1xuICAgICAgICBhcHBsaWNhdGlvbiAoX2lkOiAkYXBwbGljYXRpb25JZCkge1xuICAgICAgICAgICR7ZnJhZ21lbnRzLmFwcGxpY2F0aW9ufVxuICAgICAgICB9XG4gICAgICAgIGFwcGxpY2F0aW9uUHJvdGVjdGlvbiAoX2lkOiAkcHJvdGVjdGlvbklkKSB7XG4gICAgICAgICAgJHtmcmFnbWVudHMuYXBwbGljYXRpb25Qcm90ZWN0aW9ufVxuICAgICAgICB9XG4gICAgICB9XG4gICAgYCxcbiAgICBwYXJhbXM6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIGFwcGxpY2F0aW9uSWQsXG4gICAgICBwcm90ZWN0aW9uSWRcbiAgICB9KVxuICB9O1xufVxuIl19
