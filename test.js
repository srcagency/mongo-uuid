'use strict'

var Promise = require('bluebird')
var mdb = require('mongodb')
var test = require('tape')

var muuid = require('./')
var Binary = mdb.Binary

var rx = /^[a-fA-F0-9]{8}(-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}$/

var create = muuid.create.bind(null, Binary)
var parse = muuid.parse.bind(null, Binary)
var stringify = muuid.stringify
var isValid = muuid.isValid

test('Create', function( t ){
	t.ok(create(), 'create()')
	t.notEqual(create(), create(), 'unique')
	t.equal(create().buffer.length, 16)

	t.ok(muuid(Binary), 'muuid(Binary)')
	t.notEqual(muuid(Binary), muuid(Binary), 'unique')
	t.equal(muuid(Binary).buffer.length, 16)

	var id = create()

	t.deepEqual(parse(stringify(id)), id)

	t.end()
})

test('Stringify', function( t ){
	var uuid = create()

	t.ok(rx.exec(stringify(uuid)), 'stringify')

	t.end()
})

test('Parse', function( t ){
	var i = 'dcc090ea-a65b-4ea4-9d91-22310bdad8af'

	t.ok(parse(i), '.parse')
	t.ok(muuid(Binary, i), '.parse')

	t.equal(stringify(muuid(Binary, i)), i)
	t.equal(stringify(parse(i)), i)

	t.throws(function(){
		parse('bad')
	}, muuid.ParseError)

	t.throws(function(){
		parse('notahexa-aaab-4ea4-9d91-22310bdad8af')
	}, muuid.ParseError)

	t.end()
})

test('Is valid', function( t ){
	t.equal(typeof muuid.isValid, 'function')

	t.equal(isValid(), false)
	t.equal(isValid(2), false)
	t.equal(isValid(false), false)
	t.equal(isValid(''), false)
	t.equal(isValid(''), false)
	t.equal(isValid('xcc090ea-a65b-4ea4-9d91-22310bdad8af'), false)
	t.equal(isValid('xdcc090eaa65b4ea49d9122310bdad8af'), false)
	t.equal(isValid('dcc090ea-a65b-4ea4-9d91-22310bdad8af'), true)
	t.equal(isValid('dcc0-90ea-a6-5b-4ea4-9d91-22310-bdad8af'), true)
	t.equal(isValid('dcc090eaa65b4ea49d9122310bdad8af'), true)

	t.end()
})

test('DB', function( t ){
	t.plan(1)

	var db = mdb.connect('mongodb://localhost:27017/_mongouuidtest')

	var i = 'dcc090ea-a65b-4ea4-9d91-22310bdad8af'

	var insert = db.then(function( db ){
		return db.collection('docs').insertOne({
			_id: parse(i),
		})
	})

	var found = Promise.join(db, insert, function( db ){
		return db.collection('docs').find({
			_id: parse(i),
		}).limit(1).next().then(function( doc ){
			t.equal(stringify(doc._id), i)
		})
	})

	found
		.return(db).call('dropDatabase', '_mongouuidtest')
		.return(db).call('close')
})
