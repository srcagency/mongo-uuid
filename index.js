'use strict';

var mongodb = require('mongodb');
var uuid = require('node-uuid');

var MBinary = mongodb.Binary;

module.exports = muuid;

muuid.parse = parse;
muuid.stringify = stringify;
muuid.create = create;

muuid.ParseError = ParseError;

function muuid( opt ){
	if (opt)
		return parse(opt);
	else
		return create();
}

function create(){
	return new MBinary(uuid.v4(null, new Buffer(16)), MBinary.SUBTYPE_UUID);
}

function parse( string ){
	if (typeof string !== 'string')
		throw new ParseError('Invalid hex string');

	var stripped = string.replace(/-/g, '');

	if (stripped.length !== 32 || !stripped.match(/^[a-fA-F0-9]+$/))
		throw new ParseError('Invalid hex string');

	return new MBinary(new Buffer(stripped, 'hex'), MBinary.SUBTYPE_UUID);
}

function stringify( muuid ){
	return uuid.unparse(muuid.buffer);
}

function ParseError( message ){
	Error.call(this, message);

	this.name = 'ParseError';
}

ParseError.prototype = Object.create(Error.prototype);
