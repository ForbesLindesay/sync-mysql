# sync-mysql

Make synchronous queries to a mysql database

[![Build Status](https://img.shields.io/travis/ForbesLindesay/sync-mysql/master.svg)](https://travis-ci.org/ForbesLindesay/sync-mysql)
[![Dependency Status](https://img.shields.io/david/ForbesLindesay/sync-mysql/master.svg)](http://david-dm.org/ForbesLindesay/sync-mysql)
[![NPM version](https://img.shields.io/npm/v/sync-mysql.svg)](https://www.npmjs.org/package/sync-mysql)

## Installation

```
npm install sync-mysql --save
```

## Usage

```js
var MySql = require('sync-mysql');

var connection = new MySql({
  host: 'localhost',
  user: 'me',
  password: 'secret',
  database: 'mysqldbName'
});

const result = connection.query('SELECT 1 + 1 AS solution');
assert(result[0].solution === 2);
```

## API

### connection.getRecord(tableName, id)

Assuming that the table passed has an `id` column, get the record with that id.

### connection.query(str, values)

Return an array of objects from a SQL query. The query may optionally contain ?s to be replaced with escaped values from values which should be an array.

### connection.call(name, args)

Call a database procedure. If it returns only one set of values, that set of values is returned as an array of objects. If it returns multiple sets of values then they are returned as an array.

### connection.dispose()

Close the connection.


### connection.queueQuery(str, values)
### connection.queueCall(name, args)

Like `query` and `call` but does not wait for the result. instead it returns a function that synchronously waits for the results.

e.g.

```js
var MySql = require('sync-mysql');

var connection = new MySql({
  host: 'localhost',
  user: 'me',
  password: 'secret'
});

// these three queries all run in parallel
const resultA = connection.queueQuery('SELECT 1 + 1 AS solution');
const resultB = connection.queueQuery('SELECT 1 + 2 AS solution');
const resultC = connection.queueQuery('SELECT 1 + 3 AS solution');

// here we wait for them
assert(resultA()[0].solution === 2);
assert(resultB()[0].solution === 3);
assert(resultC()[0].solution === 4);
```

If you don't care about the results you can simply call `connection.finishAll()` to wait for all queries and calls to end.

## License

MIT
