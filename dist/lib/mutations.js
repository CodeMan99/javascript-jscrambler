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
  var bail = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var randomizationSeed = arguments[3];

  return {
    query: "\n      mutation createApplicationProtection ($applicationId: String!, $bail: Boolean, $randomizationSeed: String) {\n        createApplicationProtection (applicationId: $applicationId, bail: $bail, randomizationSeed: $randomizationSeed) {\n          " + fragments + "\n        }\n      }\n    ",
    params: {
      applicationId: applicationId,
      bail: bail,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvbXV0YXRpb25zLmpzIl0sIm5hbWVzIjpbImNyZWF0ZUFwcGxpY2F0aW9uIiwiZHVwbGljYXRlQXBwbGljYXRpb24iLCJyZW1vdmVBcHBsaWNhdGlvbiIsInJlbW92ZVByb3RlY3Rpb24iLCJjYW5jZWxQcm90ZWN0aW9uIiwidXBkYXRlQXBwbGljYXRpb24iLCJ1bmxvY2tBcHBsaWNhdGlvbiIsImFkZEFwcGxpY2F0aW9uU291cmNlIiwidXBkYXRlQXBwbGljYXRpb25Tb3VyY2UiLCJyZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24iLCJjcmVhdGVUZW1wbGF0ZSIsInJlbW92ZVRlbXBsYXRlIiwidXBkYXRlVGVtcGxhdGUiLCJjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24iLCJhcHBseVRlbXBsYXRlIiwiY3JlYXRlQXBwbGljYXRpb25EZWZhdWx0RnJhZ21lbnRzIiwiZGF0YSIsImZyYWdtZW50cyIsInF1ZXJ5IiwicGFyYW1zIiwiZHVwbGljYXRlQXBwbGljYXRpb25EZWZhdWx0RnJhZ21lbnRzIiwiaWQiLCJfaWQiLCJyZW1vdmVBcHBsaWNhdGlvbkRlZmF1bHRGcmFnbWVudHMiLCJyZW1vdmVQcm90ZWN0aW9uRGVmYXVsdEZyYWdtZW50cyIsImFwcElkIiwiYXBwbGljYXRpb25JZCIsImNhbmNlbFByb3RlY3Rpb25EZWZhdWx0RnJhZ21lbnRzIiwidXBkYXRlQXBwbGljYXRpb25EZWZhdWx0RnJhZ21lbnRzIiwiYXBwbGljYXRpb24iLCJ1bmxvY2tBcHBsaWNhdGlvbkRlZmF1bHRGcmFnbWVudHMiLCJhZGRBcHBsaWNhdGlvblNvdXJjZURlZmF1bHRGcmFnbWVudHMiLCJ1cGRhdGVBcHBsaWNhdGlvblNvdXJjZURlZmF1bHRGcmFnbWVudHMiLCJhcHBsaWNhdGlvblNvdXJjZSIsInNvdXJjZUlkIiwicmVtb3ZlU291cmNlRnJvbUFwcGxpY2F0aW9uRGVmYXVsdEZyYWdtZW50cyIsImZpbGVuYW1lIiwiY3JlYXRlVGVtcGxhdGVEZWZhdWx0RnJhZ21lbnRzIiwidGVtcGxhdGUiLCJyZW1vdmVUZW1wbGF0ZURlZmF1bHRGcmFnbWVudHMiLCJ1cGRhdGVUZW1wbGF0ZURlZmF1bHRGcmFnbWVudHMiLCJ0ZW1wbGF0ZUlkIiwiY3JlYXRlUHJvdGVjdGlvbkRlZmF1bHRGcmFnbWVudHMiLCJiYWlsIiwicmFuZG9taXphdGlvblNlZWQiLCJhcHBseVRlbXBsYXRlRGVmYXVsdEZyYWdtZW50cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7UUFNZ0JBLGlCLEdBQUFBLGlCO1FBbUJBQyxvQixHQUFBQSxvQjtRQW1CQUMsaUIsR0FBQUEsaUI7UUFtQkFDLGdCLEdBQUFBLGdCO1FBb0JBQyxnQixHQUFBQSxnQjtRQXNCQUMsaUIsR0FBQUEsaUI7UUF5QkFDLGlCLEdBQUFBLGlCO1FBcUJBQyxvQixHQUFBQSxvQjtRQXNCQUMsdUIsR0FBQUEsdUI7UUEwQkFDLDJCLEdBQUFBLDJCO1FBdUJBQyxjLEdBQUFBLGM7UUFtQkFDLGMsR0FBQUEsYztRQW9CQUMsYyxHQUFBQSxjO1FBd0JBQywyQixHQUFBQSwyQjtRQXNCQUMsYSxHQUFBQSxhO0FBblRoQixJQUFNQyxzRUFBTjs7QUFNTyxTQUFTZixpQkFBVCxDQUE0QmdCLElBQTVCLEVBQWlGO0FBQUEsTUFBL0NDLFNBQStDLHVFQUFuQ0YsaUNBQW1DOztBQUN0RixTQUFPO0FBQ0xHLHNJQUdRRCxTQUhSLCtCQURLO0FBUUxFLFlBQVE7QUFDTkg7QUFETTtBQVJILEdBQVA7QUFZRDs7QUFFRCxJQUFNSSxrREFBTjs7QUFJTyxTQUFTbkIsb0JBQVQsQ0FBK0JvQixFQUEvQixFQUFxRjtBQUFBLE1BQWxESixTQUFrRCx1RUFBdENHLG9DQUFzQzs7QUFDMUYsU0FBTztBQUNMRiwrSEFHUUQsU0FIUiwrQkFESztBQVFMRSxZQUFRO0FBQ05HLFdBQUtEO0FBREM7QUFSSCxHQUFQO0FBWUQ7O0FBRUQsSUFBTUUsK0NBQU47O0FBSU8sU0FBU3JCLGlCQUFULENBQTRCbUIsRUFBNUIsRUFBK0U7QUFBQSxNQUEvQ0os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Qzs7QUFDOUUsU0FBTztBQUNMckIsbUhBR1FELFNBSFIsK0JBREs7QUFRTEUsWUFBUTtBQUNORyxXQUFLRDtBQURDO0FBUkgsR0FBUDtBQVlEOztBQUVELElBQU1tQiwyREFBTjs7QUFLTyxTQUFTNUIsY0FBVCxDQUF5QjBCLFFBQXpCLEVBQStFO0FBQUEsTUFBNUNyQixTQUE0Qyx1RUFBaEN1Qiw4QkFBZ0M7O0FBQ3BGLE1BQU1DLGFBQWFILFNBQVNoQixHQUE1QjtBQUNBLFNBQU9nQixTQUFTaEIsR0FBaEI7O0FBRUEsU0FBTztBQUNMSixpS0FHUUQsU0FIUiwrQkFESztBQVFMRSxZQUFRO0FBQ05zQiw0QkFETTtBQUVOekIsWUFBTXNCO0FBRkE7QUFSSCxHQUFQO0FBYUQ7O0FBRUQsSUFBTUksd0RBQU47O0FBS08sU0FBUzdCLDJCQUFULENBQXNDYSxhQUF0QyxFQUFvSTtBQUFBLE1BQS9FVCxTQUErRSx1RUFBbkV5QixnQ0FBbUU7QUFBQSxNQUFqQ0MsSUFBaUMsdUVBQTFCLEtBQTBCO0FBQUEsTUFBbkJDLGlCQUFtQjs7QUFDekksU0FBTztBQUNMMUIsMlFBR1FELFNBSFIsK0JBREs7QUFRTEUsWUFBUTtBQUNOTyxxQkFBZUEsYUFEVDtBQUVOaUIsWUFBTUEsSUFGQTtBQUdOQyx5QkFBbUJBO0FBSGI7QUFSSCxHQUFQO0FBY0Q7O0FBRUQsSUFBTUMsMERBQU47O0FBS08sU0FBUy9CLGFBQVQsQ0FBd0IyQixVQUF4QixFQUFvQ2hCLEtBQXBDLEVBQXNGO0FBQUEsTUFBM0NSLFNBQTJDLHVFQUEvQjRCLDZCQUErQjs7QUFDM0YsU0FBTztBQUNMM0Isc0tBR1FELFNBSFIsK0JBREs7QUFRTEUsWUFBUTtBQUNOc0IsNEJBRE07QUFFTmhCO0FBRk07QUFSSCxHQUFQO0FBYUQiLCJmaWxlIjoibXV0YXRpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgY3JlYXRlQXBwbGljYXRpb25EZWZhdWx0RnJhZ21lbnRzID0gYFxuICBfaWQsXG4gIGNyZWF0ZWRBdCxcbiAgbmFtZVxuYDtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUFwcGxpY2F0aW9uIChkYXRhLCBmcmFnbWVudHMgPSBjcmVhdGVBcHBsaWNhdGlvbkRlZmF1bHRGcmFnbWVudHMpIHtcbiAgcmV0dXJuIHtcbiAgICBxdWVyeTogYFxuICAgICAgbXV0YXRpb24gY3JlYXRlQXBwbGljYXRpb24gKCRkYXRhOiBBcHBsaWNhdGlvbkNyZWF0ZSEpIHtcbiAgICAgICAgY3JlYXRlQXBwbGljYXRpb24oZGF0YTogJGRhdGEpIHtcbiAgICAgICAgICAke2ZyYWdtZW50c31cbiAgICAgICAgfVxuICAgICAgfVxuICAgIGAsXG4gICAgcGFyYW1zOiB7XG4gICAgICBkYXRhXG4gICAgfVxuICB9O1xufVxuXG5jb25zdCBkdXBsaWNhdGVBcHBsaWNhdGlvbkRlZmF1bHRGcmFnbWVudHMgPSBgXG4gIF9pZFxuYDtcblxuZXhwb3J0IGZ1bmN0aW9uIGR1cGxpY2F0ZUFwcGxpY2F0aW9uIChpZCwgZnJhZ21lbnRzID0gZHVwbGljYXRlQXBwbGljYXRpb25EZWZhdWx0RnJhZ21lbnRzKSB7XG4gIHJldHVybiB7XG4gICAgcXVlcnk6IGBcbiAgICAgIG11dGF0aW9uIGR1cGxpY2F0ZUFwcGxpY2F0aW9uICgkX2lkOiBTdHJpbmchKSB7XG4gICAgICAgIGR1cGxpY2F0ZUFwcGxpY2F0aW9uIChfaWQ6ICRfaWQpIHtcbiAgICAgICAgICAke2ZyYWdtZW50c31cbiAgICAgICAgfVxuICAgICAgfVxuICAgIGAsXG4gICAgcGFyYW1zOiB7XG4gICAgICBfaWQ6IGlkXG4gICAgfVxuICB9O1xufVxuXG5jb25zdCByZW1vdmVBcHBsaWNhdGlvbkRlZmF1bHRGcmFnbWVudHMgPSBgXG4gIF9pZFxuYDtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUFwcGxpY2F0aW9uIChpZCwgZnJhZ21lbnRzID0gcmVtb3ZlQXBwbGljYXRpb25EZWZhdWx0RnJhZ21lbnRzKSB7XG4gIHJldHVybiB7XG4gICAgcXVlcnk6IGBcbiAgICAgIG11dGF0aW9uIHJlbW92ZUFwcGxpY2F0aW9uICgkX2lkOiBTdHJpbmchKSB7XG4gICAgICAgIHJlbW92ZUFwcGxpY2F0aW9uIChfaWQ6ICRfaWQpIHtcbiAgICAgICAgICAke2ZyYWdtZW50c31cbiAgICAgICAgfVxuICAgICAgfVxuICAgIGAsXG4gICAgcGFyYW1zOiB7XG4gICAgICBfaWQ6IGlkXG4gICAgfVxuICB9O1xufVxuXG5jb25zdCByZW1vdmVQcm90ZWN0aW9uRGVmYXVsdEZyYWdtZW50cyA9IGBcbiAgX2lkXG5gO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlUHJvdGVjdGlvbiAoaWQsIGFwcElkLCBmcmFnbWVudHMgPSByZW1vdmVQcm90ZWN0aW9uRGVmYXVsdEZyYWdtZW50cykge1xuICByZXR1cm4ge1xuICAgIHF1ZXJ5OiBgXG4gICAgICBtdXRhdGlvbiByZW1vdmVQcm90ZWN0aW9uICgkX2lkOiBTdHJpbmchLCAkYXBwbGljYXRpb25JZDogU3RyaW5nISkge1xuICAgICAgICByZW1vdmVQcm90ZWN0aW9uIChfaWQ6ICRfaWQsIGFwcGxpY2F0aW9uSWQ6ICRhcHBsaWNhdGlvbklkKSB7XG4gICAgICAgICAgJHtmcmFnbWVudHN9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBgLFxuICAgIHBhcmFtczoge1xuICAgICAgX2lkOiBpZCxcbiAgICAgIGFwcGxpY2F0aW9uSWQ6IGFwcElkXG4gICAgfVxuICB9O1xufVxuXG5jb25zdCBjYW5jZWxQcm90ZWN0aW9uRGVmYXVsdEZyYWdtZW50cyA9IGBcbiAgX2lkXG5gO1xuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsUHJvdGVjdGlvbiAoaWQsIGFwcElkLCBmcmFnbWVudHMgPSBjYW5jZWxQcm90ZWN0aW9uRGVmYXVsdEZyYWdtZW50cykge1xuICByZXR1cm4ge1xuICAgIHF1ZXJ5OiBgXG4gICAgICBtdXRhdGlvbiBjYW5jZWxQcm90ZWN0aW9uICgkX2lkOiBTdHJpbmchLCAkYXBwbGljYXRpb25JZDogU3RyaW5nISkge1xuICAgICAgICBjYW5jZWxQcm90ZWN0aW9uIChfaWQ6ICRfaWQsIGFwcGxpY2F0aW9uSWQ6ICRhcHBsaWNhdGlvbklkKSB7XG4gICAgICAgICAgJHtmcmFnbWVudHN9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBgLFxuICAgIHBhcmFtczoge1xuICAgICAgX2lkOiBpZCxcbiAgICAgIGFwcGxpY2F0aW9uSWQ6IGFwcElkXG4gICAgfVxuICB9O1xufVxuXG5jb25zdCB1cGRhdGVBcHBsaWNhdGlvbkRlZmF1bHRGcmFnbWVudHMgPSBgXG4gIF9pZCxcbiAgY3JlYXRlZEF0LFxuICBuYW1lXG5gO1xuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlQXBwbGljYXRpb24gKGFwcGxpY2F0aW9uLCBmcmFnbWVudHMgPSB1cGRhdGVBcHBsaWNhdGlvbkRlZmF1bHRGcmFnbWVudHMpIHtcbiAgY29uc3QgYXBwbGljYXRpb25JZCA9IGFwcGxpY2F0aW9uLl9pZDtcbiAgZGVsZXRlIGFwcGxpY2F0aW9uLl9pZDtcblxuICByZXR1cm4ge1xuICAgIHF1ZXJ5OiBgXG4gICAgICBtdXRhdGlvbiB1cGRhdGVBcHBsaWNhdGlvbiAoJGFwcGxpY2F0aW9uSWQ6IFN0cmluZyEsICRkYXRhOiBBcHBsaWNhdGlvblVwZGF0ZSEpIHtcbiAgICAgICAgdXBkYXRlQXBwbGljYXRpb24gKF9pZDogJGFwcGxpY2F0aW9uSWQsIGRhdGE6ICRkYXRhKSB7XG4gICAgICAgICAgJHtmcmFnbWVudHN9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBgLFxuICAgIHBhcmFtczoge1xuICAgICAgYXBwbGljYXRpb25JZCxcbiAgICAgIGRhdGE6IGFwcGxpY2F0aW9uXG4gICAgfVxuICB9O1xufVxuXG5jb25zdCB1bmxvY2tBcHBsaWNhdGlvbkRlZmF1bHRGcmFnbWVudHMgPSBgXG4gIF9pZCxcbiAgY3JlYXRlZEF0LFxuICBuYW1lXG5gO1xuXG5leHBvcnQgZnVuY3Rpb24gdW5sb2NrQXBwbGljYXRpb24gKGFwcGxpY2F0aW9uLCBmcmFnbWVudHMgPSB1bmxvY2tBcHBsaWNhdGlvbkRlZmF1bHRGcmFnbWVudHMpIHtcbiAgcmV0dXJuIHtcbiAgICBxdWVyeTogYFxuICAgICAgbXV0YXRpb24gdW5sb2NrQXBwbGljYXRpb24gKCRhcHBsaWNhdGlvbklkOiBTdHJpbmchKSB7XG4gICAgICAgIHVubG9ja0FwcGxpY2F0aW9uIChfaWQ6ICRhcHBsaWNhdGlvbklkKSB7XG4gICAgICAgICAgJHtmcmFnbWVudHN9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBgLFxuICAgIHBhcmFtczoge1xuICAgICAgYXBwbGljYXRpb25JZDogYXBwbGljYXRpb24uX2lkXG4gICAgfVxuICB9O1xufVxuXG5jb25zdCBhZGRBcHBsaWNhdGlvblNvdXJjZURlZmF1bHRGcmFnbWVudHMgPSBgXG4gIF9pZCxcbiAgZmlsZW5hbWUsXG4gIGV4dGVuc2lvblxuYDtcblxuZXhwb3J0IGZ1bmN0aW9uIGFkZEFwcGxpY2F0aW9uU291cmNlIChhcHBsaWNhdGlvbklkLCBkYXRhLCBmcmFnbWVudHMgPSBhZGRBcHBsaWNhdGlvblNvdXJjZURlZmF1bHRGcmFnbWVudHMpIHtcbiAgcmV0dXJuIHtcbiAgICBxdWVyeTogYFxuICAgICAgbXV0YXRpb24gYWRkU291cmNlVG9BcHBsaWNhdGlvbiAoJGFwcGxpY2F0aW9uSWQ6IFN0cmluZyEsICRkYXRhOiBBcHBsaWNhdGlvblNvdXJjZUNyZWF0ZSEpIHtcbiAgICAgICAgYWRkU291cmNlVG9BcHBsaWNhdGlvbihhcHBsaWNhdGlvbklkOiAkYXBwbGljYXRpb25JZCwgZGF0YTogJGRhdGEpIHtcbiAgICAgICAgICAke2ZyYWdtZW50c31cbiAgICAgICAgfVxuICAgICAgfVxuICAgIGAsXG4gICAgcGFyYW1zOiB7XG4gICAgICBhcHBsaWNhdGlvbklkLFxuICAgICAgZGF0YVxuICAgIH1cbiAgfTtcbn1cblxuY29uc3QgdXBkYXRlQXBwbGljYXRpb25Tb3VyY2VEZWZhdWx0RnJhZ21lbnRzID0gYFxuICBfaWQsXG4gIGZpbGVuYW1lLFxuICBleHRlbnNpb25cbmA7XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVBcHBsaWNhdGlvblNvdXJjZSAoYXBwbGljYXRpb25Tb3VyY2UsIGZyYWdtZW50cyA9IHVwZGF0ZUFwcGxpY2F0aW9uU291cmNlRGVmYXVsdEZyYWdtZW50cykge1xuICBjb25zdCBzb3VyY2VJZCA9IGFwcGxpY2F0aW9uU291cmNlLl9pZDtcbiAgZGVsZXRlIGFwcGxpY2F0aW9uU291cmNlLl9pZDtcblxuICByZXR1cm4ge1xuICAgIHF1ZXJ5OiBgXG4gICAgICBtdXRhdGlvbiB1cGRhdGVBcHBsaWNhdGlvblNvdXJjZSAoJHNvdXJjZUlkOiBTdHJpbmchLCAkZGF0YTogQXBwbGljYXRpb25Tb3VyY2VVcGRhdGUhKSB7XG4gICAgICAgIHVwZGF0ZUFwcGxpY2F0aW9uU291cmNlKF9pZDogJHNvdXJjZUlkLCBkYXRhOiAkZGF0YSkge1xuICAgICAgICAgICR7ZnJhZ21lbnRzfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgYCxcbiAgICBwYXJhbXM6IHtcbiAgICAgIHNvdXJjZUlkOiBzb3VyY2VJZCxcbiAgICAgIGRhdGE6IGFwcGxpY2F0aW9uU291cmNlXG4gICAgfVxuICB9O1xufVxuXG5jb25zdCByZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb25EZWZhdWx0RnJhZ21lbnRzID0gYFxuICBfaWQsXG4gIHNvdXJjZXMge1xuICAgIGZpbGVuYW1lXG4gIH1cbmA7XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb24gKGZpbGVuYW1lLCBhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMgPSByZW1vdmVTb3VyY2VGcm9tQXBwbGljYXRpb25EZWZhdWx0RnJhZ21lbnRzKSB7XG4gIHJldHVybiB7XG4gICAgcXVlcnk6IGBcbiAgICAgIG11dGF0aW9uIHJlbW92ZVNvdXJjZSAoJGZpbGVuYW1lOiBTdHJpbmchLCAkYXBwbGljYXRpb25JZDogU3RyaW5nISkge1xuICAgICAgICByZW1vdmVTb3VyY2UgKGZpbGVuYW1lOiAkZmlsZW5hbWUsIGFwcGxpY2F0aW9uSWQ6ICRhcHBsaWNhdGlvbklkKSB7XG4gICAgICAgICAgJHtmcmFnbWVudHN9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBgLFxuICAgIHBhcmFtczoge1xuICAgICAgZmlsZW5hbWUsXG4gICAgICBhcHBsaWNhdGlvbklkXG4gICAgfVxuICB9O1xufVxuXG5jb25zdCBjcmVhdGVUZW1wbGF0ZURlZmF1bHRGcmFnbWVudHMgPSBgXG4gIF9pZCxcbiAgbmFtZSxcbiAgZGVzY3JpcHRpb24sXG4gIHBhcmFtZXRlcnNcbmA7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUZW1wbGF0ZSAodGVtcGxhdGUsIGZyYWdtZW50cyA9IGNyZWF0ZVRlbXBsYXRlRGVmYXVsdEZyYWdtZW50cykge1xuICByZXR1cm4ge1xuICAgIHF1ZXJ5OiBgXG4gICAgICBtdXRhdGlvbiBjcmVhdGVUZW1wbGF0ZSAoJGRhdGE6IFRlbXBsYXRlSW5wdXQhKSB7XG4gICAgICAgIGNyZWF0ZVRlbXBsYXRlIChkYXRhOiAkZGF0YSkge1xuICAgICAgICAgICR7ZnJhZ21lbnRzfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgYCxcbiAgICBwYXJhbXM6IHtcbiAgICAgIGRhdGE6IHRlbXBsYXRlXG4gICAgfVxuICB9O1xufVxuXG5jb25zdCByZW1vdmVUZW1wbGF0ZURlZmF1bHRGcmFnbWVudHMgPSBgXG4gIF9pZFxuYDtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVRlbXBsYXRlIChpZCwgZnJhZ21lbnRzID0gcmVtb3ZlVGVtcGxhdGVEZWZhdWx0RnJhZ21lbnRzKSB7XG4gIHJldHVybiB7XG4gICAgcXVlcnk6IGBcbiAgICAgIG11dGF0aW9uIHJlbW92ZVRlbXBsYXRlICgkX2lkOiBTdHJpbmchKSB7XG4gICAgICAgIHJlbW92ZVRlbXBsYXRlIChfaWQ6ICRfaWQpIHtcbiAgICAgICAgICAke2ZyYWdtZW50c31cbiAgICAgICAgfVxuICAgICAgfVxuICAgIGAsXG4gICAgcGFyYW1zOiB7XG4gICAgICBfaWQ6IGlkXG4gICAgfVxuICB9O1xufVxuXG5jb25zdCB1cGRhdGVUZW1wbGF0ZURlZmF1bHRGcmFnbWVudHMgPSBgXG4gIF9pZCxcbiAgcGFyYW1ldGVyc1xuYDtcblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVRlbXBsYXRlICh0ZW1wbGF0ZSwgZnJhZ21lbnRzID0gdXBkYXRlVGVtcGxhdGVEZWZhdWx0RnJhZ21lbnRzKSB7XG4gIGNvbnN0IHRlbXBsYXRlSWQgPSB0ZW1wbGF0ZS5faWQ7XG4gIGRlbGV0ZSB0ZW1wbGF0ZS5faWQ7XG5cbiAgcmV0dXJuIHtcbiAgICBxdWVyeTogYFxuICAgICAgbXV0YXRpb24gdXBkYXRlVGVtcGxhdGUgKCR0ZW1wbGF0ZUlkOiBJRCEsICRkYXRhOiBUZW1wbGF0ZUlucHV0ISkge1xuICAgICAgICB1cGRhdGVUZW1wbGF0ZSAoX2lkOiAkdGVtcGxhdGVJZCwgZGF0YTogJGRhdGEpIHtcbiAgICAgICAgICAke2ZyYWdtZW50c31cbiAgICAgICAgfVxuICAgICAgfVxuICAgIGAsXG4gICAgcGFyYW1zOiB7XG4gICAgICB0ZW1wbGF0ZUlkLFxuICAgICAgZGF0YTogdGVtcGxhdGVcbiAgICB9XG4gIH07XG59XG5cbmNvbnN0IGNyZWF0ZVByb3RlY3Rpb25EZWZhdWx0RnJhZ21lbnRzID0gYFxuICBfaWQsXG4gIHN0YXRlXG5gO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uIChhcHBsaWNhdGlvbklkLCBmcmFnbWVudHMgPSBjcmVhdGVQcm90ZWN0aW9uRGVmYXVsdEZyYWdtZW50cywgYmFpbCA9IGZhbHNlLCByYW5kb21pemF0aW9uU2VlZCkge1xuICByZXR1cm4ge1xuICAgIHF1ZXJ5OiBgXG4gICAgICBtdXRhdGlvbiBjcmVhdGVBcHBsaWNhdGlvblByb3RlY3Rpb24gKCRhcHBsaWNhdGlvbklkOiBTdHJpbmchLCAkYmFpbDogQm9vbGVhbiwgJHJhbmRvbWl6YXRpb25TZWVkOiBTdHJpbmcpIHtcbiAgICAgICAgY3JlYXRlQXBwbGljYXRpb25Qcm90ZWN0aW9uIChhcHBsaWNhdGlvbklkOiAkYXBwbGljYXRpb25JZCwgYmFpbDogJGJhaWwsIHJhbmRvbWl6YXRpb25TZWVkOiAkcmFuZG9taXphdGlvblNlZWQpIHtcbiAgICAgICAgICAke2ZyYWdtZW50c31cbiAgICAgICAgfVxuICAgICAgfVxuICAgIGAsXG4gICAgcGFyYW1zOiB7XG4gICAgICBhcHBsaWNhdGlvbklkOiBhcHBsaWNhdGlvbklkLFxuICAgICAgYmFpbDogYmFpbCxcbiAgICAgIHJhbmRvbWl6YXRpb25TZWVkOiByYW5kb21pemF0aW9uU2VlZFxuICAgIH1cbiAgfTtcbn1cblxuY29uc3QgYXBwbHlUZW1wbGF0ZURlZmF1bHRGcmFnbWVudHMgPSBgXG4gIF9pZCxcbiAgcGFyYW1ldGVyc1xuYDtcblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5VGVtcGxhdGUgKHRlbXBsYXRlSWQsIGFwcElkLCBmcmFnbWVudHMgPSBhcHBseVRlbXBsYXRlRGVmYXVsdEZyYWdtZW50cykge1xuICByZXR1cm4ge1xuICAgIHF1ZXJ5OiBgXG4gICAgICBtdXRhdGlvbiBhcHBseVRlbXBsYXRlICgkdGVtcGxhdGVJZDogU3RyaW5nISwgJGFwcElkOiBTdHJpbmchKSB7XG4gICAgICAgIGFwcGx5VGVtcGxhdGUgKHRlbXBsYXRlSWQ6ICR0ZW1wbGF0ZUlkLCBhcHBJZDogJGFwcElkKSB7XG4gICAgICAgICAgJHtmcmFnbWVudHN9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBgLFxuICAgIHBhcmFtczoge1xuICAgICAgdGVtcGxhdGVJZCxcbiAgICAgIGFwcElkXG4gICAgfVxuICB9O1xufVxuIl19
