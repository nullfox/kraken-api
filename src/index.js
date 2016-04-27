import YAML from 'yamljs';
import Hapi from 'hapi';
import Swaggerize from 'swaggerize-hapi';
import { default as HapiGen } from './hapi';

if (process.env.SWAGGER_FILE) {
  throw new RangeError('SWAGGER_FILE environment path variable must be defined');
}

const manifest = YAML.load(process.env.SWAGGER_FILE);

const server = new Hapi.Server();
const generator = new HapiGen(manifest);

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
