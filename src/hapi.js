import Util from 'util';
import QS from 'qs';
import _ from 'lodash';
import YAML from 'yamljs';
import { Client } from 'kraken-transport';

const methods = [
  'get', 'post', 'put', 'delete', 'patch'
];

const krakenClient = new Client(new Client.Discovery.Localhost());

export default class Hapi {
  constructor(swaggerOrPath) {
    if (_.isString(swaggerOrPath)) {
      swaggerOrPath = YAML.load(swaggerOrPath);
    }

    this._manifest = swaggerOrPath;
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
    return (request, reply) => {
      krakenClient.dispatch(
        model,
        operation,
        {
          params: request.params,
          filters: QS.parse(request.query).filters
        },
        (error, response) => {
          reply(error || response);
        }
      );
    };
  }
}
