import YAML from 'yamljs';
import Hapi from 'hapi';
import Swaggerize from 'swaggerize-hapi';
import { default as HapiGen } from './hapi';

const swaggerFile = process.env.SWAGGER_FILE ? process.env.SWAGGER_FILE : './swagger.yaml';

const manifest = YAML.load(swaggerFile);

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
