# Mongo UUID

When saving a UUID in MongoDB, you probably want to save the binary data in
their native format. This helper is meant to ease that.

```js
var m = require('mongodb');	// "mongodb-core" or "bson" work as well
var u = require('mongo-uuid');

var uuid = u.create(m.Binary);
var asString = u.stringify();			// fa4aab39-bdd8-406c-9813-6206433912e9
u.parse(m.Binary, asString);
```

## API

`Binary` should be the Binary constructor from the BSON package.

### Create

```js
u.create(Binary);

u(Binary);

new u(Binary);
```

### Parse

```js
u.parse(Binary, 'dcc090ea-a65b-4ea4-9d91-22310bdad8af');

u(Binary, 'dcc090ea-a65b-4ea4-9d91-22310bdad8af');
```

Parse might throw a `ParseError`. The error class is exposed as `u.ParseError`
for recognizing and catching.

### Stringify

```js
u.stringify(uuid);	// dcc090ea-a65b-4ea4-9d91-22310bdad8af
```

### Is valid

Check if the input is a valid UUID string without throwing.

```js
u.isValid('dcc090ea-a65b-4ea4-9d91-22310bdad8af');	// true
```

## Examples

```js
var Promise = require('bluebird');
var u = require('mongo-uuid');
var mdb = require('mongodb');

var db = mdb.connect('mongodb://localhost:27017/myproject');

// Creating documents

var id = new u(mdb.Binary);

var insert = db.then(function( db ){
	return db.collection('docs').insertOne({
		_id: id,
	});
}).then(function(){
	console.log('Inserted with ID', u.stringify(id));
});


// Finding documents

var id = u.parse(mdb.Binary, 'dcc090ea-a65b-4ea4-9d91-22310bdad8af');

Promise.join(db, insert, function( db ){
	return db.collection('docs').find({
		_id: id,
	}).limit(1).next().then(console.log);
});
```
