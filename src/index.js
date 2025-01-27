import YAML from 'yamljs';
import Hapi from 'hapi';
import QS from 'qs';
import _ from 'lodash';
import Swaggerize from 'swaggerize-hapi';
import { Client } from '@nullfox/kraken-transport';
import { default as HapiGen } from './hapi';

let transport = new Client.Discovery.Localhost();

if (Client.Discovery.Quadra.isAvailable()) {
  transport = new Client.Discovery.Quadra();
}

const client = new Client(transport);

const filePath = process.env.SWAGGER_FILE ? process.env.SWAGGER_FILE : './swagger.yaml';
const manifest = YAML.load(filePath);

const server = new Hapi.Server();
const generator = new HapiGen(manifest, client);

server.connection({
  port: 8080
});

server.ext('onRequest', (request, reply) => {
  const override = request.headers['kraken-http-method-override'];

  if (request.method === 'post' && override) {
    request.raw.req.on('data', (body) => {
      let query = request.query || {};

      try {
        const parsed = JSON.parse(body.toString());
        query = _.merge(query, parsed);
      } catch (err) {
        // No-op
      }

      if (_.has(query, 'filters') && _.isString(query.filters)) {
        query.filters = QS.parse(new Buffer(query.filters, 'base64').toString('utf8'));
      }

      request.query = query;
      request.setMethod(override);

      reply.continue();
    });
  } else {
    reply.continue();
  }
});

server.register({
  register: Swaggerize,
  options: {
    api: manifest,
    handlers: generator.handlers
  }
});

server.start(() => {
  console.log('Starting server');
});
