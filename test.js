'use strict'

const { join } = require('bluebird')
const { Binary, connect } = require('mongodb')
const test = require('tape')

const muuid = require('./')

const rx = /^[a-fA-F0-9]{8}(-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}$/

const create = () => muuid.create(Binary)
const parse = i => muuid.parse(Binary, i)
const stringify = muuid.stringify
const isValid = muuid.isValid

test('Create', function( t ){
	t.ok(create(), 'create()')
	t.notEqual(create(), create(), 'unique')
	t.equal(create().buffer.length, 16)

	t.ok(muuid(Binary), 'muuid(Binary)')
	t.notEqual(muuid(Binary), muuid(Binary), 'unique')
	t.equal(muuid(Binary).buffer.length, 16)

	const id = create()

	t.deepEqual(parse(stringify(id)), id)

	t.end()
})

test('Stringify', function( t ){
	const uuid = create()

	t.ok(rx.exec(stringify(uuid)), 'stringify')

	t.end()
})

test('Parse', function( t ){
	const i = 'dcc090ea-a65b-4ea4-9d91-22310bdad8af'

	t.ok(parse(i), '.parse')
	t.ok(muuid(Binary, i), '.parse')

	t.equal(stringify(muuid(Binary, i)), i)
	t.equal(stringify(parse(i)), i)

	t.throws(() => parse('bad'), muuid.ParseError)

	t.throws(() => parse('notahexa-aaab-4ea4-9d91-22310bdad8af'), muuid.ParseError)

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

	const db = connect('mongodb://localhost:'+process.env.MONGODB_PORT+'/test')

	const i = 'dcc090ea-a65b-4ea4-9d91-22310bdad8af'

	const insert = db.then(
		db => db.collection('docs').insertOne({
			_id: parse(i),
		})
	)

	const found = join(db, insert,
		db => db.collection('docs').find({
			_id: parse(i),
		}).limit(1).next()
	).then(
		doc => t.equal(stringify(doc._id), i)
	)

	join(db, found, db => db.close())
})
