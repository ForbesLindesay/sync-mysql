const rpc = require('sync-rpc');

class Connection {
  constructor(config) {
    this._client = rpc(__dirname + '/worker.js', config);
  }
  _end(id) {
    return this._client({type: 'end', id});
  }
  finishAll() {
    this._client({type: 'end-all'});
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
    return this._client({type: 'call', name, args});
  }
  query(str, values = []) {
    if (typeof str !== 'string') {
      throw new TypeError('Expected query to be a string');
    }
    if (!Array.isArray(values)) {
      throw new TypeError('Expected args to be strings');
    }
    if (
      !values.every(
        arg => typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean' || arg === null
      )
    ) {
      throw new TypeError('Expected every arg to be a string, number, boolean or null');
    }
    return this._client({type: 'query', str, values});
  }
  dispose() {
    return this._client({type: 'dispose'});
  }
  queueQuery(str, values = []) {
    if (typeof str !== 'string') {
      throw new TypeError('Expected query to be a string');
    }
    if (!Array.isArray(values)) {
      throw new TypeError('Expected args to be strings');
    }
    if (
      !values.every(
        arg => typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean' || arg === null
      )
    ) {
      throw new TypeError('Expected every arg to be a string, number, boolean or null');
    }
    const id = this._client({type: 'queue-query', str, values});
    return () => this._end(id);
  }
  queueCall(name, args) {
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
    const id = this._client({type: 'queue-call', name, args});
    return () => this._end(id);
  }

  // shorthands
  update(...args) {
    return this.query(...args);
  }
  queueUpdate(...args) {
    return this.queueQuery(...args);
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

module.exports = Connection;
