import 'babel-polyfill';

import glob from 'glob';
import path from 'path';
import request from 'axios';
import defaults from 'lodash.defaults';
import Q from 'q';

import config from './config';
import generateSignedParams from './generate-signed-params';
import JScramblerClient from './client';
import {
  addApplicationSource,
  createApplication,
  removeApplication,
  updateApplication,
  updateApplicationSource,
  removeSourceFromApplication,
  createTemplate,
  removeTemplate,
  updateTemplate,
  createApplicationProtection,
  removeProtection,
  cancelProtection,
  duplicateApplication,
  unlockApplication,
  applyTemplate
} from './mutations';
import {
  getApplication,
  getApplicationProtections,
  getApplicationProtectionsCount,
  getApplications,
  getApplicationSource,
  getTemplates,
  getProtection
} from './queries';
import {zip, zipSources, unzip} from './zip';

import getProtectionDefaultFragments from './get-protection-default-fragments';

const debug = !!process.env.DEBUG;

export default {
  Client: JScramblerClient,
  config,
  generateSignedParams,
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
  async protectAndDownload(configPathOrObject, destCallback) {
    const _config =
      typeof configPathOrObject === 'string'
        ? require(configPathOrObject)
        : configPathOrObject;

    const finalConfig = defaults(_config, config);

    const {
      applicationId,
      host,
      port,
      protocol,
      cafile,
      keys,
      sources,
      stream = true,
      cwd,
      params,
      applicationTypes,
      languageSpecifications,
      sourceMaps,
      randomizationSeed,
      areSubscribersOrdered,
      useRecommendedOrder,
      bail,
      jscramblerVersion
    } = finalConfig;

    const {accessKey, secretKey} = keys;

    const client = new this.Client({
      accessKey,
      secretKey,
      host,
      port,
      protocol,
      cafile,
      jscramblerVersion
    });

    let filesSrc = finalConfig.filesSrc;
    let filesDest = finalConfig.filesDest;

    if (sources) {
      filesSrc = undefined;
    }

    if (destCallback) {
      filesDest = undefined;
    }

    if (!applicationId) {
      throw new Error('Required *applicationId* not provided');
    }

    if (!filesDest && !destCallback) {
      throw new Error('Required *filesDest* not provided');
    }

    let content;

    if (sources || (filesSrc && filesSrc.length)) {
      const removeSourceRes = await this.removeSourceFromApplication(
        client,
        '',
        applicationId
      );
      if (removeSourceRes.errors) {
        // TODO Implement error codes or fix this is on the services
        let hadNoSources = false;
        removeSourceRes.errors.forEach(error => {
          if (
            error.message ===
            'Application Source with the given ID does not exist'
          ) {
            hadNoSources = true;
          }
        });
        if (!hadNoSources) {
          throw new Error(removeSourceRes.errors[0].message);
        }
      }
    }

    if (filesSrc && filesSrc.length) {
      let _filesSrc = [];
      for (let i = 0, l = filesSrc.length; i < l; ++i) {
        if (typeof filesSrc[i] === 'string') {
          // TODO Replace `glob.sync` with async version
          _filesSrc = _filesSrc.concat(
            glob.sync(filesSrc[i], {
              dot: true
            })
          );
        } else {
          _filesSrc.push(filesSrc[i]);
        }
      }

      debug && console.log('Creating zip from source files');
      const _zip = await zip(_filesSrc, cwd);

      content = _zip.generate({
        type: 'nodebuffer'
      });
      content = content.toString('base64');

      debug && console.log('Adding sources to application');
      const addApplicationSourceRes = await this.addApplicationSource(
        client,
        applicationId,
        {
          content,
          filename: 'application.zip',
          extension: 'zip'
        }
      );
      debug && console.log('Finished adding sources to application');
      errorHandler(addApplicationSourceRes);
    } else if (sources) {
      debug && console.log('Creating zip from sources');
      const _zip = await zipSources(sources);

      content = _zip.generate({
        type: 'nodebuffer'
      });
      content = content.toString('base64');

      debug && console.log('Adding sources to application');
      const addApplicationSourceRes = await this.addApplicationSource(
        client,
        applicationId,
        {
          content,
          filename: 'application.zip',
          extension: 'zip'
        }
      );

      debug && console.log('Finished adding sources to application');
      errorHandler(addApplicationSourceRes);
    }

    const $set = {
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

    if (typeof useRecommendedOrder !== 'undefined') {
      $set.useRecommendedOrder = useRecommendedOrder;
    }

    if (languageSpecifications) {
      $set.languageSpecifications = languageSpecifications;
    }

    if (typeof sourceMaps !== undefined) {
      $set.sourceMaps = JSON.stringify(sourceMaps);
    }

    if (
      $set.parameters ||
      $set.applicationTypes ||
      $set.languageSpecifications ||
      typeof $set.areSubscribersOrdered !== 'undefined'
    ) {
      debug && console.log('Updating parameters of protection');
      const updateApplicationRes = await this.updateApplication(client, $set);
      debug && console.log('Finished updating parameters of protection');
      errorHandler(updateApplicationRes);
    }

    debug && console.log('Creating Application Protection');
    const createApplicationProtectionRes = await this.createApplicationProtection(
      client,
      applicationId,
      undefined,
      bail,
      randomizationSeed,
      debugMode
    );
    errorHandler(createApplicationProtectionRes);

    const protectionId =
      createApplicationProtectionRes.data.createApplicationProtection._id;
    const protection = await this.pollProtection(
      client,
      applicationId,
      protectionId,
      getProtectionDefaultFragments[jscramblerVersion]
    );
    debug && console.log('Finished protecting');

    const errors = protection.errorMessage
      ? [{message: protection.errorMessage}]
      : [];
    protection.sources.forEach(s => {
      if (s.errorMessages && s.errorMessages.length > 0) {
        errors.push(
          ...s.errorMessages.map(e => ({
            filename: s.filename,
            ...e
          }))
        );
      }
    });

    if (!bail && errors.length > 0) {
      errors.forEach(e =>
        console.error(`Non-fatal error: "${e.message}" in ${e.filename}`)
      );
    } else if (bail && protection.state === 'errored') {
      errors.forEach(e =>
        console.error(
          `Error: "${e.message}"${e.filename
            ? `in ${e.filename}${e.line ? `:${e.line}` : ''}`
            : ''}`
        )
      );
      throw new Error('Protection failed');
    }

    if (protection.deprecations) {
      protection.deprecations.forEach(deprecation => {
        if (deprecation.type === 'Transformation') {
          console.warn(
            `Warning: ${deprecation.type} ${deprecation.entity} is no longer maintained. Please consider removing it from your configuration.`
          );
        } else {
          console.warn(
            `Warning: ${deprecation.type} ${deprecation.entity} is deprecated.`
          );
        }
      });
    }

    debug && console.log('Downloading protection result');
    const download = await this.downloadApplicationProtection(
      client,
      protectionId
    );
    errorHandler(download);
    debug && console.log('Unzipping files');
    unzip(download, filesDest || destCallback, stream);
    debug && console.log('Finished unzipping files');
    console.log(protectionId);
    return protectionId;
  },

  async downloadSourceMaps(configs, destCallback) {
    const {
      keys,
      host,
      port,
      protocol,
      cafile,
      stream = true,
      filesDest,
      filesSrc,
      protectionId
    } = configs;

    const {accessKey, secretKey} = keys;

    const client = new this.Client({
      accessKey,
      secretKey,
      host,
      port,
      protocol,
      cafile
    });

    if (!filesDest && !destCallback) {
      throw new Error('Required *filesDest* not provided');
    }

    if (!protectionId) {
      throw new Error('Required *protectionId* not provided');
    }

    if (filesSrc) {
      console.log(
        '[Warning] Ignoring sources supplied. Downloading source maps of given protection'
      );
    }
    let download;
    try {
      download = await this.downloadSourceMapsRequest(client, protectionId);
    } catch (e) {
      errorHandler(e);
    }
    unzip(download, filesDest || destCallback, stream);
  },

  async pollProtection(client, applicationId, protectionId, fragments) {
    const deferred = Q.defer();

    const poll = async () => {
      const applicationProtection = await this.getApplicationProtection(
        client,
        applicationId,
        protectionId,
        fragments
      );
      const url = `https://app.jscrambler.com/app/${applicationId}/protections/${protectionId}`;
      if (applicationProtection.errors) {
        console.log('Error polling protection', applicationProtection.errors);
        deferred.reject(
          `Protection failed. For more information visit: ${url}`
        );
      } else {
        const state = applicationProtection.data.applicationProtection.state;
        const bail = applicationProtection.data.applicationProtection.bail;
        if (
          state !== 'finished' &&
          state !== 'errored' &&
          state !== 'canceled'
        ) {
          setTimeout(poll, 500);
        } else if (state === 'errored' && !bail) {
          deferred.reject(
            `Protection failed. For more information visit: ${url}`
          );
        } else if (state === 'canceled') {
          deferred.reject('Protection canceled by user');
        } else {
          deferred.resolve(applicationProtection.data.applicationProtection);
        }
      }
    };

    poll();

    return deferred.promise;
  },
  //
  async createApplication(client, data, fragments) {
    const deferred = Q.defer();
    client.post(
      '/application',
      createApplication(data, fragments),
      responseHandler(deferred)
    );
    return deferred.promise;
  },
  //
  async duplicateApplication(client, data, fragments) {
    const deferred = Q.defer();
    client.post(
      '/application',
      duplicateApplication(data, fragments),
      responseHandler(deferred)
    );
    return deferred.promise;
  },
  //
  async removeApplication(client, id) {
    const deferred = Q.defer();
    client.post(
      '/application',
      removeApplication(id),
      responseHandler(deferred)
    );
    return deferred.promise;
  },
  //
  async removeProtection(client, id, appId, fragments) {
    const deferred = Q.defer();
    client.post(
      '/application',
      removeProtection(id, appId, fragments),
      responseHandler(deferred)
    );
    return deferred.promise;
  },
  //
  async cancelProtection(client, id, appId, fragments) {
    const deferred = Q.defer();
    client.post(
      '/application',
      cancelProtection(id, appId, fragments),
      responseHandler(deferred)
    );
    return deferred.promise;
  },
  //
  async updateApplication(client, application, fragments) {
    const deferred = Q.defer();
    client.post(
      '/application',
      updateApplication(application, fragments),
      responseHandler(deferred)
    );
    return deferred.promise;
  },
  //
  async unlockApplication(client, application, fragments) {
    const deferred = Q.defer();
    client.post(
      '/application',
      unlockApplication(application, fragments),
      responseHandler(deferred)
    );
    return deferred.promise;
  },
  //
  async getApplication(client, applicationId, fragments, params) {
    const deferred = Q.defer();
    client.get(
      '/application',
      getApplication(applicationId, fragments, params),
      responseHandler(deferred)
    );
    return deferred.promise;
  },
  //
  async getApplicationSource(client, sourceId, fragments, limits) {
    const deferred = Q.defer();
    client.get(
      '/application',
      getApplicationSource(sourceId, fragments, limits),
      responseHandler(deferred)
    );
    return deferred.promise;
  },
  //
  async getApplicationProtections(client, applicationId, params, fragments) {
    const deferred = Q.defer();
    client.get(
      '/application',
      getApplicationProtections(applicationId, params, fragments),
      responseHandler(deferred)
    );
    return deferred.promise;
  },
  //
  async getApplicationProtectionsCount(client, applicationId, fragments) {
    const deferred = Q.defer();
    client.get(
      '/application',
      getApplicationProtectionsCount(applicationId, fragments),
      responseHandler(deferred)
    );
    return deferred.promise;
  },
  //
  async createTemplate(client, template, fragments) {
    const deferred = Q.defer();
    client.post(
      '/application',
      createTemplate(template, fragments),
      responseHandler(deferred)
    );
    return deferred.promise;
  },
  //
  async removeTemplate(client, id) {
    const deferred = Q.defer();
    client.post('/application', removeTemplate(id), responseHandler(deferred));
    return deferred.promise;
  },
  //
  async getTemplates(client, fragments) {
    const deferred = Q.defer();
    client.get(
      '/application',
      getTemplates(fragments),
      responseHandler(deferred)
    );
    return deferred.promise;
  },
  //
  async getApplications(client, fragments, params) {
    const deferred = Q.defer();
    client.get(
      '/application',
      getApplications(fragments, params),
      responseHandler(deferred)
    );
    return deferred.promise;
  },
  //
  async addApplicationSource(
    client,
    applicationId,
    applicationSource,
    fragments
  ) {
    const deferred = Q.defer();
    client.post(
      '/application',
      addApplicationSource(applicationId, applicationSource, fragments),
      responseHandler(deferred)
    );
    return deferred.promise;
  },
  //
  async addApplicationSourceFromURL(client, applicationId, url, fragments) {
    const deferred = Q.defer();
    return getFileFromUrl(client, url).then(file => {
      client.post(
        '/application',
        addApplicationSource(applicationId, file, fragments),
        responseHandler(deferred)
      );
      return deferred.promise;
    });
  },
  //
  async updateApplicationSource(client, applicationSource, fragments) {
    const deferred = Q.defer();
    client.post(
      '/application',
      updateApplicationSource(applicationSource, fragments),
      responseHandler(deferred)
    );
    return deferred.promise;
  },
  //
  async removeSourceFromApplication(
    client,
    sourceId,
    applicationId,
    fragments
  ) {
    const deferred = Q.defer();
    client.post(
      '/application',
      removeSourceFromApplication(sourceId, applicationId, fragments),
      responseHandler(deferred)
    );
    return deferred.promise;
  },
  //
  async applyTemplate(client, templateId, appId, fragments) {
    const deferred = Q.defer();
    client.post(
      '/application',
      applyTemplate(templateId, appId, fragments),
      responseHandler(deferred)
    );
    return deferred.promise;
  },
  //
  async updateTemplate(client, template, fragments) {
    const deferred = Q.defer();
    client.post(
      '/application',
      updateTemplate(template, fragments),
      responseHandler(deferred)
    );
    return deferred.promise;
  },
  //
  async createApplicationProtection(
    client,
    applicationId,
    fragments,
    bail,
    randomizationSeed,
    debugMode
  ) {
    const deferred = Q.defer();
    client.post(
      '/application',
      createApplicationProtection(
        applicationId,
        fragments,
        bail,
        randomizationSeed,
        debugMode
      ),
      responseHandler(deferred)
    );
    return deferred.promise;
  },
  //
  async getApplicationProtection(
    client,
    applicationId,
    protectionId,
    fragments
  ) {
    const deferred = Q.defer();
    client.get(
      '/application',
      getProtection(applicationId, protectionId, fragments),
      responseHandler(deferred)
    );
    return deferred.promise;
  },
  //
  async downloadSourceMapsRequest(client, protectionId) {
    const deferred = Q.defer();
    client.get(
      `/application/sourceMaps/${protectionId}`,
      null,
      responseHandler(deferred),
      false
    );
    return deferred.promise;
  },
  //
  async downloadApplicationProtection(client, protectionId) {
    const deferred = Q.defer();
    client.get(
      `/application/download/${protectionId}`,
      null,
      responseHandler(deferred),
      false
    );
    return deferred.promise;
  }
};

function getFileFromUrl(client, url) {
  const deferred = Q.defer();
  let file;
  request
    .get(url)
    .then(res => {
      file = {
        content: res.data,
        filename: path.basename(url),
        extension: path.extname(url).substr(1)
      };
      deferred.resolve(file);
    })
    .catch(err => {
      deferred.reject(err);
    });
  return deferred.promise;
}

function responseHandler(deferred) {
  return (err, res) => {
    if (err) {
      deferred.reject(err);
    } else {
      const body = res.data;
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
    res.errors.forEach(error => {
      throw new Error(`Error: ${error.message}`);
    });
  }

  if (res.message) {
    throw new Error(`Error: ${res.message}`);
  }

  return res;
}

function normalizeParameters(parameters) {
  let result;

  if (!Array.isArray(parameters)) {
    result = [];
    Object.keys(parameters).forEach(name => {
      result.push({
        name,
        options: parameters[name]
      });
    });
  } else {
    result = parameters;
  }

  return result;
}
