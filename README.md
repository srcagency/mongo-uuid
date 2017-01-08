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

var id = new u();

var insert = db.then(function( db ){
	return db.collection('docs').insertOne({
		_id: id,
	});
}).then(function(){
	console.log('Inserted with ID', u.stringify(id));
});


// Finding documents

var id = u.parse('dcc090ea-a65b-4ea4-9d91-22310bdad8af');

Promise.join(db, insert, function( db ){
	return db.collection('docs').find({
		_id: id,
	}).limit(1).next().then(console.log);
});
```
