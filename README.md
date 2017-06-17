# Mongo UUID

When saving a UUID in MongoDB, you probably want to save the binary data in
their native format. This helper is meant to ease that.

```js
const m = require('mongodb')	// "mongodb-core" or "bson" work as well
const u = require('mongo-uuid')

const uuid = i => u(m.Binary, i)

const id = uuid()
// -> Binary

console.log(u.stringify(id))
// -> fa4aab39-bdd8-406c-9813-6206433912e9

uuid('fa4aab39-bdd8-406c-9813-6206433912e9')
// -> Binary
```

## API

`Binary` should be the Binary constructor from the BSON package.

### Create

```js
u.create(Binary)
u(Binary)
```

### Parse

```js
u.parse(Binary, 'dcc090ea-a65b-4ea4-9d91-22310bdad8af')
u(Binary, 'dcc090ea-a65b-4ea4-9d91-22310bdad8af')
```

Parse might throw a `ParseError`. The error class is exposed as `u.ParseError`
for recognizing and catching.

### Stringify

```js
u.stringify(uuid)	// dcc090ea-a65b-4ea4-9d91-22310bdad8af
```

### Is valid

Check if the input is a valid UUID string without throwing.

```js
u.isValid('dcc090ea-a65b-4ea4-9d91-22310bdad8af')	// true
```

## Examples

```js
const { join } = require('bluebird')
const { Binary, connect } = require('mongodb')
const uuid = require('mongo-uuid')

const uuid = i => u(Binary, i)

const db = connect('mongodb://localhost:27017/myproject')

// Creating documents

const id = uuid()

const insert = db.then(
	db => db.collection('docs').insertOne({
		_id: id,
	})
).then(
	() => console.log('Inserted with ID', uuid.stringify(id))
)


// Finding documents

const id = uuid('dcc090ea-a65b-4ea4-9d91-22310bdad8af')

join(db, insert,
	db => db.collection('docs').find({
		_id: id,
	}).limit(1).next()
).then(console.log)
```
