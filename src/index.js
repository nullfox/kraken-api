import YAML from 'yamljs';
import Hapi from 'hapi';
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

server.register({
  register: Swaggerize,
  options: {
    api: manifest,
    handlers: generator.handlers
  }
});

server.start();
