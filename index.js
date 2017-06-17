'use strict'

const uuid = require('uuid/v4')

module.exports = muuid

muuid.parse = parse
muuid.stringify = stringify
muuid.create = create
muuid.isValid = isValid

muuid.ParseError = ParseError

function muuid( MongoDbBinary, opt ){
	if (opt !== undefined)
		return parse(MongoDbBinary, opt)
	else
		return create(MongoDbBinary)
}

function create( MongoDbBinary ){
	return new MongoDbBinary(
		uuid(null, Buffer.allocUnsafe(16)),
		MongoDbBinary.SUBTYPE_UUID
	)
}

function parse( MongoDbBinary, string ){
	const normalized = normalize(string)

	if (normalized === false)
		throw new ParseError('Invalid hex string')

	return new MongoDbBinary(
		Buffer.from(normalized, 'hex'),
		MongoDbBinary.SUBTYPE_UUID
	)
}

function stringify( muuid ){
	const buffer = muuid.buffer

	return [
		buffer.toString('hex', 0, 4),
		buffer.toString('hex', 4, 6),
		buffer.toString('hex', 6, 8),
		buffer.toString('hex', 8, 10),
		buffer.toString('hex', 10, 16),
	].join('-')
}

function isValid( string ){
	return normalize(string) !== false
}

function normalize( string ){
	if (typeof string !== 'string')
		return false

	const stripped = string.replace(/-/g, '')

	if (stripped.length !== 32 || !stripped.match(/^[a-fA-F0-9]+$/))
		return false

	return stripped
}

function ParseError( message ){
	Error.call(this, message)

	this.name = 'ParseError'
}

ParseError.prototype = Object.create(Error.prototype)
