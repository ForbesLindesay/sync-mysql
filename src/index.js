import {readFileSync} from 'fs';
import {spawnSync} from 'child_process';

const WORKER_PATH = require.resolve('./worker');

Function('', readFileSync(WORKER_PATH, 'utf8'));

class Connection {
  constructor(config) {
    this._config = config;
  }
  call(name, args) {
    if (typeof name !== 'string') {
      throw new TypeError('Expected name to be a string');
    }
    if (!Array.isArray(args)) {
      throw new TypeError('Expected args to be strings');
    }
    if (
      !args.every(
        arg => typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean' || arg === null
      )
    ) {
      throw new TypeError('Expected every arg to be a string, number, boolean or null');
    }
    return request({
      config: this._config,
      method: 'call',
      args: [name, args],
    });
  }
  query(q, args) {
    if (typeof q !== 'string') {
      throw new TypeError('Expected q to be a string');
    }
    if (!Array.isArray(args)) {
      throw new TypeError('Expected args to be strings');
    }
    if (
      !args.every(
        arg => typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean' || arg === null
      )
    ) {
      throw new TypeError('Expected every arg to be a string, number, boolean or null');
    }
    return request({
      config: this._config,
      method: 'query',
      args: [q, args],
    });
  }
  update(...args) {
    return this.query(...args);
  }
  getRecord(table, id) {
    if (typeof table !== 'string') {
      throw new TypeError('Expected "table" to be a string but got ' + typeof table);
    }
    if (typeof id !== 'string' && typeof id !== 'number') {
      throw new TypeError('Expected "id" in table "' + table + '" to be a string or number but got ' + typeof id);
    }
    return this.query('SELECT * FROM ?? WHERE id = ?', [table, id])[0];
  }
}

function request(input) {
  if (!spawnSync) {
    throw new Error(
      'Sync-request requires node version 0.12 or later.  If you need to use it with an older version of node\n' +
      'you can `npm install sync-request@2.2.0`, which was the last version to support older versions of node.'
    );
  }
  const req = JSON.stringify(input);
  const res = spawnSync(process.execPath, [WORKER_PATH], {input: req});
  if (res.status !== 0) {
    throw new Error(res.stderr.toString());
  }
  if (res.error) {
    if (typeof res.error === 'string') res.error = new Error(res.error);
    throw res.error;
  }

  const response = JSON.parse(res.stdout);
  if (response.success) {
    return response.result;
  } else {
    throw new Error(response.error.message || response.error || response);
  }
}

module.exports = Connection;
