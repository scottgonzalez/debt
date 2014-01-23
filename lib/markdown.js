var marked = require( "marked" );

exports.parse = parse;

function parse( str ) {
	return marked( str );
}
