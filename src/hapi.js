import Util from 'util';
import QS from 'qs';
import _ from 'lodash';
import YAML from 'yamljs';

const methods = [
  'get', 'post', 'put', 'delete', 'patch'
];

export default class Hapi {
  constructor(swaggerOrPath, client) {
    if (_.isString(swaggerOrPath)) {
      swaggerOrPath = YAML.load(swaggerOrPath);
    }

    this._manifest = swaggerOrPath;
    this._client = client;
  }

  get client() {
    return this._client;
  }

  get manifest() {
    return this._manifest;
  }

  get handlers() {
    const handlers = {};

    // Loop over each path and set into the handlers hash
    Object.keys(this.manifest.paths).forEach((path) => {
      const parts = path.replace(/^\//, '').split('/');
      const properties = this.manifest.paths[path];

      // Get the valid methods that exist for this path
      _.set(
        handlers,
        parts,

        // Loop over only valid http methods and register them with the model & operation
        _.chain(Object.keys(properties))
        .intersection(methods)
        .map((method) => {
          const key = Util.format('$%s', method);
          const handler = this.handlerForModelAndOperation(
            properties['x-kraken-collection'],
            properties[method].operationId
          );

          return [key, handler];
        })
        .fromPairs()
        .value()
      );
    });

    return handlers;
  }

  handlerForModelAndOperation(model, operation) {
    const client = this.client;

    return (request, reply) => {
      client.dispatch(
        model,
        operation,
        {
          params: request.params,
          filters: QS.parse(request.query).filters || {}
        },
        (error, response) => {
          reply(error || response);
        }
      );
    };
  }
}
