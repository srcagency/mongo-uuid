'use strict';

var Promise = require('bluebird');
var mdb = require('mongodb');
var test = require('tape');

var muuid = require('./');

var rx = /^[a-fA-F0-9]{8}(-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}$/;

var stringify = muuid.stringify;
var parse = muuid.parse;

test('Create', function( t ){
	t.ok(muuid.create(), 'muuid.create()');
	t.notEqual(muuid.create(), muuid.create(), 'unique');
	t.equal(muuid.create().buffer.length, 16);

	t.ok(new muuid(), 'new muuid()');
	t.notEqual(new muuid(), new muuid(), 'unique');
	t.equal(new muuid().buffer.length, 16);

	t.ok(muuid(), 'muuid()');
	t.notEqual(muuid(), muuid(), 'unique');
	t.equal(muuid().buffer.length, 16);

	t.end();
});

test('Stringify', function( t ){
	var uuid = muuid.create();

	t.ok(rx.exec(muuid.stringify(uuid)), 'stringify');

	t.end();
});

test('Parse', function( t ){
	var i = 'dcc090ea-a65b-4ea4-9d91-22310bdad8af';

	t.ok(parse(i), '.parse');
	t.ok(muuid(i), '.parse');
	t.ok(new muuid(i), 'new muuid(i)');

	t.equal(stringify(muuid(i)), i);
	t.equal(stringify(new muuid(i)), i);
	t.equal(stringify(parse(i)), i);

	t.throws(function(){
		parse('bad');
	}, muuid.ParseError);

	t.throws(function(){
		parse('notahexa-aaab-4ea4-9d91-22310bdad8af');
	}, muuid.ParseError);

	t.end();
});

test('DB', function( t ){
	t.plan(1);

	var db = mdb.connect('mongodb://localhost:27017/_mongouuidtest');

	var i = 'dcc090ea-a65b-4ea4-9d91-22310bdad8af';

	var insert = db.then(function( db ){
		return db.collection('docs').insertOne({
			_id: muuid.parse(i),
		});
	});

	var found = Promise.join(db, insert, function( db ){
		return db.collection('docs').find({
			_id: muuid.parse(i),
		}).limit(1).next().then(function( doc ){
			t.equal(muuid.stringify(doc._id), i);
		});
	});

	found
		.return(db).call('dropDatabase', '_mongouuidtest')
		.return(db).call('close');
});
