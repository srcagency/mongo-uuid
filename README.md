# Mongo UUID

When saving a UUID in MongoDB, you probably want to save the binary data in
their native format. This helper is meant to ease that.

```js
var u = require('mongo-uuid');

u.parse(u.stringify(u.create()));
```

## API

### Create

```js
u.create();

u();

new u();
```

### Parse

```js
u.parse('dcc090ea-a65b-4ea4-9d91-22310bdad8af');

u('dcc090ea-a65b-4ea4-9d91-22310bdad8af');
```

### Stringify

```js
u.stringify(uuid);	// dcc090ea-a65b-4ea4-9d91-22310bdad8af
```

## Examples

```js
var Promise = require('bluebird');
var u = require('mongo-uuid');
var mdb = require('mongodb');

var db = mdb.connect('mongodb://localhost:27017/myproject');

var uuid = new u();

// Creating uuids

var insert = db.then(function( db ){
	return db.collection('docs').insertOne({
		_id: uuid,
	});
});


// Finding documents

Promise.join(db, insert, function( db ){
	return db.collection('docs').find({
		_id: uuid,
	}).limit(1).next().then(console.log);
});
```
