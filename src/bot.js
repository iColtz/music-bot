const YAML = require('yaml');
const config = YAML.parse(require('fs').readFileSync('config.yml', 'utf-8'));
const Client = require('./struct/client.js');
const client = new Client(config);
client.start(config.token);