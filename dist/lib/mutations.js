"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createApplication = createApplication;
exports.duplicateApplication = duplicateApplication;
exports.removeApplication = removeApplication;
exports.removeProtection = removeProtection;
exports.cancelProtection = cancelProtection;
exports.updateApplication = updateApplication;
exports.unlockApplication = unlockApplication;
exports.addApplicationSource = addApplicationSource;
exports.updateApplicationSource = updateApplicationSource;
exports.removeSourceFromApplication = removeSourceFromApplication;
exports.createTemplate = createTemplate;
exports.removeTemplate = removeTemplate;
exports.updateTemplate = updateTemplate;
exports.createApplicationProtection = createApplicationProtection;
exports.applyTemplate = applyTemplate;
var createApplicationDefaultFragments = "\n  _id,\n  createdAt,\n  name\n";

function createApplication(data) {
  var fragments = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : createApplicationDefaultFragments;

  return {
    query: "\n      mutation createApplication ($data: ApplicationCreate!) {\n        createApplication(data: $data) {\n          " + fragments + "\n        }\n      }\n    ",
    params: {
      data: data
    }
  };
}

var duplicateApplicationDefaultFragments = "\n  _id\n";

function duplicateApplication(id) {
  var fragments = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : duplicateApplicationDefaultFragments;

  return {
    query: "\n      mutation duplicateApplication ($_id: String!) {\n        duplicateApplication (_id: $_id) {\n          " + fragments + "\n        }\n      }\n    ",
    params: {
      _id: id
    }
  };
}

var removeApplicationDefaultFragments = "\n  _id\n";

function removeApplication(id) {
  var fragments = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : removeApplicationDefaultFragments;

  return {
    query: "\n      mutation removeApplication ($_id: String!) {\n        removeApplication (_id: $_id) {\n          " + fragments + "\n        }\n      }\n    ",
    params: {
      _id: id
    }
  };
}

var removeProtectionDefaultFragments = "\n  _id\n";

function removeProtection(id, appId) {
  var fragments = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : removeProtectionDefaultFragments;

  return {
    query: "\n      mutation removeProtection ($_id: String!, $applicationId: String!) {\n        removeProtection (_id: $_id, applicationId: $applicationId) {\n          " + fragments + "\n        }\n      }\n    ",
    params: {
      _id: id,
      applicationId: appId
    }
  };
}

var cancelProtectionDefaultFragments = "\n  _id\n";

function cancelProtection(id, appId) {
  var fragments = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : cancelProtectionDefaultFragments;

  return {
    query: "\n      mutation cancelProtection ($_id: String!, $applicationId: String!) {\n        cancelProtection (_id: $_id, applicationId: $applicationId) {\n          " + fragments + "\n        }\n      }\n    ",
    params: {
      _id: id,
      applicationId: appId
    }
  };
}

var updateApplicationDefaultFragments = "\n  _id,\n  createdAt,\n  name\n";

function updateApplication(application) {
  var fragments = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : updateApplicationDefaultFragments;

  var applicationId = application._id;
  delete application._id;

  return {
    query: "\n      mutation updateApplication ($applicationId: String!, $data: ApplicationUpdate!) {\n        updateApplication (_id: $applicationId, data: $data) {\n          " + fragments + "\n        }\n      }\n    ",
    params: {
      applicationId: applicationId,
      data: application
    }
  };
}

var unlockApplicationDefaultFragments = "\n  _id,\n  createdAt,\n  name\n";

function unlockApplication(application) {
  var fragments = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : unlockApplicationDefaultFragments;

  return {
    query: "\n      mutation unlockApplication ($applicationId: String!) {\n        unlockApplication (_id: $applicationId) {\n          " + fragments + "\n        }\n      }\n    ",
    params: {
      applicationId: application._id
    }
  };
}

var addApplicationSourceDefaultFragments = "\n  _id,\n  filename,\n  extension\n";

function addApplicationSource(applicationId, data) {
  var fragments = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : addApplicationSourceDefaultFragments;

  return {
    query: "\n      mutation addSourceToApplication ($applicationId: String!, $data: ApplicationSourceCreate!) {\n        addSourceToApplication(applicationId: $applicationId, data: $data) {\n          " + fragments + "\n        }\n      }\n    ",
    params: {
      applicationId: applicationId,
      data: data
    }
  };
}

var updateApplicationSourceDefaultFragments = "\n  _id,\n  filename,\n  extension\n";

function updateApplicationSource(applicationSource) {
  var fragments = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : updateApplicationSourceDefaultFragments;

  var sourceId = applicationSource._id;
  delete applicationSource._id;

  return {
    query: "\n      mutation updateApplicationSource ($sourceId: String!, $data: ApplicationSourceUpdate!) {\n        updateApplicationSource(_id: $sourceId, data: $data) {\n          " + fragments + "\n        }\n      }\n    ",
    params: {
      sourceId: sourceId,
      data: applicationSource
    }
  };
}

var removeSourceFromApplicationDefaultFragments = "\n  _id,\n  sources {\n    filename\n  }\n";

function removeSourceFromApplication(filename, applicationId) {
  var fragments = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : removeSourceFromApplicationDefaultFragments;

  return {
    query: "\n      mutation removeSource ($filename: String!, $applicationId: String!) {\n        removeSource (filename: $filename, applicationId: $applicationId) {\n          " + fragments + "\n        }\n      }\n    ",
    params: {
      filename: filename,
      applicationId: applicationId
    }
  };
}

var createTemplateDefaultFragments = "\n  _id,\n  name,\n  description,\n  parameters\n";

function createTemplate(template) {
  var fragments = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : createTemplateDefaultFragments;

  return {
    query: "\n      mutation createTemplate ($data: TemplateInput!) {\n        createTemplate (data: $data) {\n          " + fragments + "\n        }\n      }\n    ",
    params: {
      data: template
    }
  };
}

var removeTemplateDefaultFragments = "\n  _id\n";

function removeTemplate(id) {
  var fragments = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : removeTemplateDefaultFragments;

  return {
    query: "\n      mutation removeTemplate ($_id: String!) {\n        removeTemplate (_id: $_id) {\n          " + fragments + "\n        }\n      }\n    ",
    params: {
      _id: id
    }
  };
}

var updateTemplateDefaultFragments = "\n  _id,\n  parameters\n";

function updateTemplate(template) {
  var fragments = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : updateTemplateDefaultFragments;

  var templateId = template._id;
  delete template._id;

  return {
    query: "\n      mutation updateTemplate ($templateId: ID!, $data: TemplateInput!) {\n        updateTemplate (_id: $templateId, data: $data) {\n          " + fragments + "\n        }\n      }\n    ",
    params: {
      templateId: templateId,
      data: template
    }
  };
}

var createProtectionDefaultFragments = "\n  _id,\n  state\n";

function createApplicationProtection(applicationId) {
  var fragments = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : createProtectionDefaultFragments;
  var randomizationSeed = arguments[2];

  return {
    query: "\n      mutation createApplicationProtection ($applicationId: String!, $randomizationSeed: String) {\n        createApplicationProtection (applicationId: $applicationId) {\n          " + fragments + "\n        }\n      }\n    ",
    params: {
      applicationId: applicationId,
      randomizationSeed: randomizationSeed
    }
  };
}

var applyTemplateDefaultFragments = "\n  _id,\n  parameters\n";

function applyTemplate(templateId, appId) {
  var fragments = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : applyTemplateDefaultFragments;

  return {
    query: "\n      mutation applyTemplate ($templateId: String!, $appId: String!) {\n        applyTemplate (templateId: $templateId, appId: $appId) {\n          " + fragments + "\n        }\n      }\n    ",
    params: {
      templateId: templateId,
      appId: appId
    }
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvbXV0YXRpb25zLmpzIl0sIm5hbWVzIjpbImNyZWF0ZUFwcGxpY2F0aW9uIiwiZHVwbGljYXRlQXBwbGljYXRpb24iLCJyZW1vdmVBcHBsaWNhdGlvbiIsInJlbW92ZVByb3RlY3Rpb24iLCJjYW5jZWxQcm90ZWN0aW9uIiwidXBkYXRlQXBwbGljYXRpb24iLCJ1bmxvY2tBcHBsaWNhdGlvbiIsImFkZEFwcGxpY2F0aW9uU291cmNlIiwidXBkYXRlQXBwbGljYXRpb25Tb3VyY2UiLCJyZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24iLCJjcmVhdGVUZW1wbGF0ZSIsInJlbW92ZVRlbXBsYXRlIiwidXBkYXRlVGVtcGxhdGUiLCJjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24iLCJhcHBseVRlbXBsYXRlIiwiY3JlYXRlQXBwbGljYXRpb25EZWZhdWx0RnJhZ21lbnRzIiwiZGF0YSIsImZyYWdtZW50cyIsInF1ZXJ5IiwicGFyYW1zIiwiZHVwbGljYXRlQXBwbGljYXRpb25EZWZhdWx0RnJhZ21lbnRzIiwiaWQiLCJfaWQiLCJyZW1vdmVBcHBsaWNhdGlvbkRlZmF1bHRGcmFnbWVudHMiLCJyZW1vdmVQcm90ZWN0aW9uRGVmYXVsdEZyYWdtZW50cyIsImFwcElkIiwiYXBwbGljYXRpb25JZCIsImNhbmNlbFByb3RlY3Rpb25EZWZhdWx0RnJhZ21lbnRzIiwidXBkYXRlQXBwbGljYXRpb25EZWZhdWx0RnJhZ21lbnRzIiwiYXBwbGljYXRpb24iLCJ1bmxvY2tBcHBsaWNhdGlvbkRlZmF1bHRGcmFnbWVudHMiLCJhZGRBcHBsaWNhdGlvblNvdXJjZURlZmF1bHRGcmFnbWVudHMiLCJ1cGRhdGVBcHBsaWNhdGlvblNvdXJjZURlZmF1bHRGcmFnbWVudHMiLCJhcHBsaWNhdGlvblNvdXJjZSIsInNvdXJjZUlkIiwicmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uRGVmYXVsdEZyYWdtZW50cyIsImZpbGVuYW1lIiwiY3JlYXRlVGVtcGxhdGVEZWZhdWx0RnJhZ21lbnRzIiwidGVtcGxhdGUiLCJyZW1vdmVUZW1wbGF0ZURlZmF1bHRGcmFnbWVudHMiLCJ1cGRhdGVUZW1wbGF0ZURlZmF1bHRGcmFnbWVudHMiLCJ0ZW1wbGF0ZUlkIiwiY3JlYXRlUHJvdGVjdGlvbkRlZmF1bHRGcmFnbWVudHMiLCJyYW5kb21pemF0aW9uU2VlZCIsImFwcGx5VGVtcGxhdGVEZWZhdWx0RnJhZ21lbnRzIl0sIm1hcHBpbmdzIjoiOzs7OztRQU1nQkEsaUIsR0FBQUEsaUI7UUFtQkFDLG9CLEdBQUFBLG9CO1FBbUJBQyxpQixHQUFBQSxpQjtRQW1CQUMsZ0IsR0FBQUEsZ0I7UUFvQkFDLGdCLEdBQUFBLGdCO1FBc0JBQyxpQixHQUFBQSxpQjtRQXlCQUMsaUIsR0FBQUEsaUI7UUFxQkFDLG9CLEdBQUFBLG9CO1FBc0JBQyx1QixHQUFBQSx1QjtRQTBCQUMsMkIsR0FBQUEsMkI7UUF1QkFDLGMsR0FBQUEsYztRQW1CQUMsYyxHQUFBQSxjO1FBb0JBQyxjLEdBQUFBLGM7UUF3QkFDLDJCLEdBQUFBLDJCO1FBcUJBQyxhLEdBQUFBLGE7QUFsVGhCLElBQU1DLHNFQUFOOztBQU1PLFNBQVNmLGlCQUFULENBQTRCZ0IsSUFBNUIsRUFBaUY7QUFBQSxNQUEvQ0MsU0FBK0MsdUVBQW5DRixpQ0FBbUM7O0FBQ3RGLFNBQU87QUFDTEcsc0lBR1FELFNBSFIsK0JBREs7QUFRTEUsWUFBUTtBQUNOSDtBQURNO0FBUkgsR0FBUDtBQVlEOztBQUVELElBQU1JLGtEQUFOOztBQUlPLFNBQVNuQixvQkFBVCxDQUErQm9CLEVBQS9CLEVBQXFGO0FBQUEsTUFBbERKLFNBQWtELHVFQUF0Q0csb0NBQXNDOztBQUMxRixTQUFPO0FBQ0xGLCtIQUdRRCxTQUhSLCtCQURLO0FBUUxFLFlBQVE7QUFDTkcsV0FBS0Q7QUFEQztBQVJILEdBQVA7QUFZRDs7QUFFRCxJQUFNRSwrQ0FBTjs7QUFJTyxTQUFTckIsaUJBQVQsQ0FBNEJtQixFQUE1QixFQUErRTtBQUFBLE1BQS9DSixTQUErQyx1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RSxTQUFPO0FBQ0xyQixtSEFHUUQsU0FIUiwrQkFESztBQVFMRSxZQUFRO0FBQ05HLFdBQUtEO0FBREM7QUFSSCxHQUFQO0FBWUQ7O0FBRUQsSUFBTW1CLDJEQUFOOztBQUtPLFNBQVM1QixjQUFULENBQXlCMEIsUUFBekIsRUFBK0U7QUFBQSxNQUE1Q3JCLFNBQTRDLHVFQUFoQ3VCLDhCQUFnQzs7QUFDcEYsTUFBTUMsYUFBYUgsU0FBU2hCLEdBQTVCO0FBQ0EsU0FBT2dCLFNBQVNoQixHQUFoQjs7QUFFQSxTQUFPO0FBQ0xKLGlLQUdRRCxTQUhSLCtCQURLO0FBUUxFLFlBQVE7QUFDTnNCLDRCQURNO0FBRU56QixZQUFNc0I7QUFGQTtBQVJILEdBQVA7QUFhRDs7QUFFRCxJQUFNSSx3REFBTjs7QUFLTyxTQUFTN0IsMkJBQVQsQ0FBc0NhLGFBQXRDLEVBQXNIO0FBQUEsTUFBakVULFNBQWlFLHVFQUFyRHlCLGdDQUFxRDtBQUFBLE1BQW5CQyxpQkFBbUI7O0FBQzNILFNBQU87QUFDTHpCLHVNQUdRRCxTQUhSLCtCQURLO0FBUUxFLFlBQVE7QUFDTk8scUJBQWVBLGFBRFQ7QUFFTmlCLHlCQUFtQkE7QUFGYjtBQVJILEdBQVA7QUFhRDs7QUFFRCxJQUFNQywwREFBTjs7QUFLTyxTQUFTOUIsYUFBVCxDQUF3QjJCLFVBQXhCLEVBQW9DaEIsS0FBcEMsRUFBc0Y7QUFBQSxNQUEzQ1IsU0FBMkMsdUVBQS9CMkIsNkJBQStCOztBQUMzRixTQUFPO0FBQ0wxQixzS0FHUUQsU0FIUiwrQkFESztBQVFMRSxZQUFRO0FBQ05zQiw0QkFETTtBQUVOaEI7QUFGTTtBQVJILEdBQVA7QUFhRCIsImZpbGUiOiJtdXRhdGlvbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBjcmVhdGVBcHBsaWNhdGlvbkRlZmF1bHRGcmFnbWVudHMgPSBgXG4gIF9pZCxcbiAgY3JlYXRlZEF0LFxuICBuYW1lXG5gO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXBwbGljYXRpb24gKGRhdGEsIGZyYWdtZW50cyA9IGNyZWF0ZUFwcGxpY2F0aW9uRGVmYXVsdEZyYWdtZW50cykge1xuICByZXR1cm4ge1xuICAgIHF1ZXJ5OiBgXG4gICAgICBtdXRhdGlvbiBjcmVhdGVBcHBsaWNhdGlvbiAoJGRhdGE6IEFwcGxpY2F0aW9uQ3JlYXRlISkge1xuICAgICAgICBjcmVhdGVBcHBsaWNhdGlvbihkYXRhOiAkZGF0YSkge1xuICAgICAgICAgICR7ZnJhZ21lbnRzfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgYCxcbiAgICBwYXJhbXM6IHtcbiAgICAgIGRhdGFcbiAgICB9XG4gIH07XG59XG5cbmNvbnN0IGR1cGxpY2F0ZUFwcGxpY2F0aW9uRGVmYXVsdEZyYWdtZW50cyA9IGBcbiAgX2lkXG5gO1xuXG5leHBvcnQgZnVuY3Rpb24gZHVwbGljYXRlQXBwbGljYXRpb24gKGlkLCBmcmFnbWVudHMgPSBkdXBsaWNhdGVBcHBsaWNhdGlvbkRlZmF1bHRGcmFnbWVudHMpIHtcbiAgcmV0dXJuIHtcbiAgICBxdWVyeTogYFxuICAgICAgbXV0YXRpb24gZHVwbGljYXRlQXBwbGljYXRpb24gKCRfaWQ6IFN0cmluZyEpIHtcbiAgICAgICAgZHVwbGljYXRlQXBwbGljYXRpb24gKF9pZDogJF9pZCkge1xuICAgICAgICAgICR7ZnJhZ21lbnRzfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgYCxcbiAgICBwYXJhbXM6IHtcbiAgICAgIF9pZDogaWRcbiAgICB9XG4gIH07XG59XG5cbmNvbnN0IHJlbW92ZUFwcGxpY2F0aW9uRGVmYXVsdEZyYWdtZW50cyA9IGBcbiAgX2lkXG5gO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlQXBwbGljYXRpb24gKGlkLCBmcmFnbWVudHMgPSByZW1vdmVBcHBsaWNhdGlvbkRlZmF1bHRGcmFnbWVudHMpIHtcbiAgcmV0dXJuIHtcbiAgICBxdWVyeTogYFxuICAgICAgbXV0YXRpb24gcmVtb3ZlQXBwbGljYXRpb24gKCRfaWQ6IFN0cmluZyEpIHtcbiAgICAgICAgcmVtb3ZlQXBwbGljYXRpb24gKF9pZDogJF9pZCkge1xuICAgICAgICAgICR7ZnJhZ21lbnRzfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgYCxcbiAgICBwYXJhbXM6IHtcbiAgICAgIF9pZDogaWRcbiAgICB9XG4gIH07XG59XG5cbmNvbnN0IHJlbW92ZVByb3RlY3Rpb25EZWZhdWx0RnJhZ21lbnRzID0gYFxuICBfaWRcbmA7XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVQcm90ZWN0aW9uIChpZCwgYXBwSWQsIGZyYWdtZW50cyA9IHJlbW92ZVByb3RlY3Rpb25EZWZhdWx0RnJhZ21lbnRzKSB7XG4gIHJldHVybiB7XG4gICAgcXVlcnk6IGBcbiAgICAgIG11dGF0aW9uIHJlbW92ZVByb3RlY3Rpb24gKCRfaWQ6IFN0cmluZyEsICRhcHBsaWNhdGlvbklkOiBTdHJpbmchKSB7XG4gICAgICAgIHJlbW92ZVByb3RlY3Rpb24gKF9pZDogJF9pZCwgYXBwbGljYXRpb25JZDogJGFwcGxpY2F0aW9uSWQpIHtcbiAgICAgICAgICAke2ZyYWdtZW50c31cbiAgICAgICAgfVxuICAgICAgfVxuICAgIGAsXG4gICAgcGFyYW1zOiB7XG4gICAgICBfaWQ6IGlkLFxuICAgICAgYXBwbGljYXRpb25JZDogYXBwSWRcbiAgICB9XG4gIH07XG59XG5cbmNvbnN0IGNhbmNlbFByb3RlY3Rpb25EZWZhdWx0RnJhZ21lbnRzID0gYFxuICBfaWRcbmA7XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWxQcm90ZWN0aW9uIChpZCwgYXBwSWQsIGZyYWdtZW50cyA9IGNhbmNlbFByb3RlY3Rpb25EZWZhdWx0RnJhZ21lbnRzKSB7XG4gIHJldHVybiB7XG4gICAgcXVlcnk6IGBcbiAgICAgIG11dGF0aW9uIGNhbmNlbFByb3RlY3Rpb24gKCRfaWQ6IFN0cmluZyEsICRhcHBsaWNhdGlvbklkOiBTdHJpbmchKSB7XG4gICAgICAgIGNhbmNlbFByb3RlY3Rpb24gKF9pZDogJF9pZCwgYXBwbGljYXRpb25JZDogJGFwcGxpY2F0aW9uSWQpIHtcbiAgICAgICAgICAke2ZyYWdtZW50c31cbiAgICAgICAgfVxuICAgICAgfVxuICAgIGAsXG4gICAgcGFyYW1zOiB7XG4gICAgICBfaWQ6IGlkLFxuICAgICAgYXBwbGljYXRpb25JZDogYXBwSWRcbiAgICB9XG4gIH07XG59XG5cbmNvbnN0IHVwZGF0ZUFwcGxpY2F0aW9uRGVmYXVsdEZyYWdtZW50cyA9IGBcbiAgX2lkLFxuICBjcmVhdGVkQXQsXG4gIG5hbWVcbmA7XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVBcHBsaWNhdGlvbiAoYXBwbGljYXRpb24sIGZyYWdtZW50cyA9IHVwZGF0ZUFwcGxpY2F0aW9uRGVmYXVsdEZyYWdtZW50cykge1xuICBjb25zdCBhcHBsaWNhdGlvbklkID0gYXBwbGljYXRpb24uX2lkO1xuICBkZWxldGUgYXBwbGljYXRpb24uX2lkO1xuXG4gIHJldHVybiB7XG4gICAgcXVlcnk6IGBcbiAgICAgIG11dGF0aW9uIHVwZGF0ZUFwcGxpY2F0aW9uICgkYXBwbGljYXRpb25JZDogU3RyaW5nISwgJGRhdGE6IEFwcGxpY2F0aW9uVXBkYXRlISkge1xuICAgICAgICB1cGRhdGVBcHBsaWNhdGlvbiAoX2lkOiAkYXBwbGljYXRpb25JZCwgZGF0YTogJGRhdGEpIHtcbiAgICAgICAgICAke2ZyYWdtZW50c31cbiAgICAgICAgfVxuICAgICAgfVxuICAgIGAsXG4gICAgcGFyYW1zOiB7XG4gICAgICBhcHBsaWNhdGlvbklkLFxuICAgICAgZGF0YTogYXBwbGljYXRpb25cbiAgICB9XG4gIH07XG59XG5cbmNvbnN0IHVubG9ja0FwcGxpY2F0aW9uRGVmYXVsdEZyYWdtZW50cyA9IGBcbiAgX2lkLFxuICBjcmVhdGVkQXQsXG4gIG5hbWVcbmA7XG5cbmV4cG9ydCBmdW5jdGlvbiB1bmxvY2tBcHBsaWNhdGlvbiAoYXBwbGljYXRpb24sIGZyYWdtZW50cyA9IHVubG9ja0FwcGxpY2F0aW9uRGVmYXVsdEZyYWdtZW50cykge1xuICByZXR1cm4ge1xuICAgIHF1ZXJ5OiBgXG4gICAgICBtdXRhdGlvbiB1bmxvY2tBcHBsaWNhdGlvbiAoJGFwcGxpY2F0aW9uSWQ6IFN0cmluZyEpIHtcbiAgICAgICAgdW5sb2NrQXBwbGljYXRpb24gKF9pZDogJGFwcGxpY2F0aW9uSWQpIHtcbiAgICAgICAgICAke2ZyYWdtZW50c31cbiAgICAgICAgfVxuICAgICAgfVxuICAgIGAsXG4gICAgcGFyYW1zOiB7XG4gICAgICBhcHBsaWNhdGlvbklkOiBhcHBsaWNhdGlvbi5faWRcbiAgICB9XG4gIH07XG59XG5cbmNvbnN0IGFkZEFwcGxpY2F0aW9uU291cmNlRGVmYXVsdEZyYWdtZW50cyA9IGBcbiAgX2lkLFxuICBmaWxlbmFtZSxcbiAgZXh0ZW5zaW9uXG5gO1xuXG5leHBvcnQgZnVuY3Rpb24gYWRkQXBwbGljYXRpb25Tb3VyY2UgKGFwcGxpY2F0aW9uSWQsIGRhdGEsIGZyYWdtZW50cyA9IGFkZEFwcGxpY2F0aW9uU291cmNlRGVmYXVsdEZyYWdtZW50cykge1xuICByZXR1cm4ge1xuICAgIHF1ZXJ5OiBgXG4gICAgICBtdXRhdGlvbiBhZGRTb3VyY2VUb0FwcGxpY2F0aW9uICgkYXBwbGljYXRpb25JZDogU3RyaW5nISwgJGRhdGE6IEFwcGxpY2F0aW9uU291cmNlQ3JlYXRlISkge1xuICAgICAgICBhZGRTb3VyY2VUb0FwcGxpY2F0aW9uKGFwcGxpY2F0aW9uSWQ6ICRhcHBsaWNhdGlvbklkLCBkYXRhOiAkZGF0YSkge1xuICAgICAgICAgICR7ZnJhZ21lbnRzfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgYCxcbiAgICBwYXJhbXM6IHtcbiAgICAgIGFwcGxpY2F0aW9uSWQsXG4gICAgICBkYXRhXG4gICAgfVxuICB9O1xufVxuXG5jb25zdCB1cGRhdGVBcHBsaWNhdGlvblNvdXJjZURlZmF1bHRGcmFnbWVudHMgPSBgXG4gIF9pZCxcbiAgZmlsZW5hbWUsXG4gIGV4dGVuc2lvblxuYDtcblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUFwcGxpY2F0aW9uU291cmNlIChhcHBsaWNhdGlvblNvdXJjZSwgZnJhZ21lbnRzID0gdXBkYXRlQXBwbGljYXRpb25Tb3VyY2VEZWZhdWx0RnJhZ21lbnRzKSB7XG4gIGNvbnN0IHNvdXJjZUlkID0gYXBwbGljYXRpb25Tb3VyY2UuX2lkO1xuICBkZWxldGUgYXBwbGljYXRpb25Tb3VyY2UuX2lkO1xuXG4gIHJldHVybiB7XG4gICAgcXVlcnk6IGBcbiAgICAgIG11dGF0aW9uIHVwZGF0ZUFwcGxpY2F0aW9uU291cmNlICgkc291cmNlSWQ6IFN0cmluZyEsICRkYXRhOiBBcHBsaWNhdGlvblNvdXJjZVVwZGF0ZSEpIHtcbiAgICAgICAgdXBkYXRlQXBwbGljYXRpb25Tb3VyY2UoX2lkOiAkc291cmNlSWQsIGRhdGE6ICRkYXRhKSB7XG4gICAgICAgICAgJHtmcmFnbWVudHN9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBgLFxuICAgIHBhcmFtczoge1xuICAgICAgc291cmNlSWQ6IHNvdXJjZUlkLFxuICAgICAgZGF0YTogYXBwbGljYXRpb25Tb3VyY2VcbiAgICB9XG4gIH07XG59XG5cbmNvbnN0IHJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbkRlZmF1bHRGcmFnbWVudHMgPSBgXG4gIF9pZCxcbiAgc291cmNlcyB7XG4gICAgZmlsZW5hbWVcbiAgfVxuYDtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbiAoZmlsZW5hbWUsIGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyA9IHJlbW92ZVNvdXJjZUZyb21BcHBsaWNhdGlvbkRlZmF1bHRGcmFnbWVudHMpIHtcbiAgcmV0dXJuIHtcbiAgICBxdWVyeTogYFxuICAgICAgbXV0YXRpb24gcmVtb3ZlU291cmNlICgkZmlsZW5hbWU6IFN0cmluZyEsICRhcHBsaWNhdGlvbklkOiBTdHJpbmchKSB7XG4gICAgICAgIHJlbW92ZVNvdXJjZSAoZmlsZW5hbWU6ICRmaWxlbmFtZSwgYXBwbGljYXRpb25JZDogJGFwcGxpY2F0aW9uSWQpIHtcbiAgICAgICAgICAke2ZyYWdtZW50c31cbiAgICAgICAgfVxuICAgICAgfVxuICAgIGAsXG4gICAgcGFyYW1zOiB7XG4gICAgICBmaWxlbmFtZSxcbiAgICAgIGFwcGxpY2F0aW9uSWRcbiAgICB9XG4gIH07XG59XG5cbmNvbnN0IGNyZWF0ZVRlbXBsYXRlRGVmYXVsdEZyYWdtZW50cyA9IGBcbiAgX2lkLFxuICBuYW1lLFxuICBkZXNjcmlwdGlvbixcbiAgcGFyYW1ldGVyc1xuYDtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRlbXBsYXRlICh0ZW1wbGF0ZSwgZnJhZ21lbnRzID0gY3JlYXRlVGVtcGxhdGVEZWZhdWx0RnJhZ21lbnRzKSB7XG4gIHJldHVybiB7XG4gICAgcXVlcnk6IGBcbiAgICAgIG11dGF0aW9uIGNyZWF0ZVRlbXBsYXRlICgkZGF0YTogVGVtcGxhdGVJbnB1dCEpIHtcbiAgICAgICAgY3JlYXRlVGVtcGxhdGUgKGRhdGE6ICRkYXRhKSB7XG4gICAgICAgICAgJHtmcmFnbWVudHN9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBgLFxuICAgIHBhcmFtczoge1xuICAgICAgZGF0YTogdGVtcGxhdGVcbiAgICB9XG4gIH07XG59XG5cbmNvbnN0IHJlbW92ZVRlbXBsYXRlRGVmYXVsdEZyYWdtZW50cyA9IGBcbiAgX2lkXG5gO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlVGVtcGxhdGUgKGlkLCBmcmFnbWVudHMgPSByZW1vdmVUZW1wbGF0ZURlZmF1bHRGcmFnbWVudHMpIHtcbiAgcmV0dXJuIHtcbiAgICBxdWVyeTogYFxuICAgICAgbXV0YXRpb24gcmVtb3ZlVGVtcGxhdGUgKCRfaWQ6IFN0cmluZyEpIHtcbiAgICAgICAgcmVtb3ZlVGVtcGxhdGUgKF9pZDogJF9pZCkge1xuICAgICAgICAgICR7ZnJhZ21lbnRzfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgYCxcbiAgICBwYXJhbXM6IHtcbiAgICAgIF9pZDogaWRcbiAgICB9XG4gIH07XG59XG5cbmNvbnN0IHVwZGF0ZVRlbXBsYXRlRGVmYXVsdEZyYWdtZW50cyA9IGBcbiAgX2lkLFxuICBwYXJhbWV0ZXJzXG5gO1xuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlVGVtcGxhdGUgKHRlbXBsYXRlLCBmcmFnbWVudHMgPSB1cGRhdGVUZW1wbGF0ZURlZmF1bHRGcmFnbWVudHMpIHtcbiAgY29uc3QgdGVtcGxhdGVJZCA9IHRlbXBsYXRlLl9pZDtcbiAgZGVsZXRlIHRlbXBsYXRlLl9pZDtcblxuICByZXR1cm4ge1xuICAgIHF1ZXJ5OiBgXG4gICAgICBtdXRhdGlvbiB1cGRhdGVUZW1wbGF0ZSAoJHRlbXBsYXRlSWQ6IElEISwgJGRhdGE6IFRlbXBsYXRlSW5wdXQhKSB7XG4gICAgICAgIHVwZGF0ZVRlbXBsYXRlIChfaWQ6ICR0ZW1wbGF0ZUlkLCBkYXRhOiAkZGF0YSkge1xuICAgICAgICAgICR7ZnJhZ21lbnRzfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgYCxcbiAgICBwYXJhbXM6IHtcbiAgICAgIHRlbXBsYXRlSWQsXG4gICAgICBkYXRhOiB0ZW1wbGF0ZVxuICAgIH1cbiAgfTtcbn1cblxuY29uc3QgY3JlYXRlUHJvdGVjdGlvbkRlZmF1bHRGcmFnbWVudHMgPSBgXG4gIF9pZCxcbiAgc3RhdGVcbmA7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24gKGFwcGxpY2F0aW9uSWQsIGZyYWdtZW50cyA9IGNyZWF0ZVByb3RlY3Rpb25EZWZhdWx0RnJhZ21lbnRzLCByYW5kb21pemF0aW9uU2VlZCkge1xuICByZXR1cm4ge1xuICAgIHF1ZXJ5OiBgXG4gICAgICBtdXRhdGlvbiBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24gKCRhcHBsaWNhdGlvbklkOiBTdHJpbmchLCAkcmFuZG9taXphdGlvblNlZWQ6IFN0cmluZykge1xuICAgICAgICBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24gKGFwcGxpY2F0aW9uSWQ6ICRhcHBsaWNhdGlvbklkKSB7XG4gICAgICAgICAgJHtmcmFnbWVudHN9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBgLFxuICAgIHBhcmFtczoge1xuICAgICAgYXBwbGljYXRpb25JZDogYXBwbGljYXRpb25JZCxcbiAgICAgIHJhbmRvbWl6YXRpb25TZWVkOiByYW5kb21pemF0aW9uU2VlZFxuICAgIH1cbiAgfTtcbn1cblxuY29uc3QgYXBwbHlUZW1wbGF0ZURlZmF1bHRGcmFnbWVudHMgPSBgXG4gIF9pZCxcbiAgcGFyYW1ldGVyc1xuYDtcblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5VGVtcGxhdGUgKHRlbXBsYXRlSWQsIGFwcElkLCBmcmFnbWVudHMgPSBhcHBseVRlbXBsYXRlRGVmYXVsdEZyYWdtZW50cykge1xuICByZXR1cm4ge1xuICAgIHF1ZXJ5OiBgXG4gICAgICBtdXRhdGlvbiBhcHBseVRlbXBsYXRlICgkdGVtcGxhdGVJZDogU3RyaW5nISwgJGFwcElkOiBTdHJpbmchKSB7XG4gICAgICAgIGFwcGx5VGVtcGxhdGUgKHRlbXBsYXRlSWQ6ICR0ZW1wbGF0ZUlkLCBhcHBJZDogJGFwcElkKSB7XG4gICAgICAgICAgJHtmcmFnbWVudHN9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBgLFxuICAgIHBhcmFtczoge1xuICAgICAgdGVtcGxhdGVJZCxcbiAgICAgIGFwcElkXG4gICAgfVxuICB9O1xufVxuIl19
