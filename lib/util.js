exports.extend = extend;
exports.deepExtend = deepExtend;
exports.escapeHtml = escapeHtml;

var classToType = {};
[
	"Boolean",
	"Number",
	"String",
	"Function",
	"Array",
	"Date",
	"RegExp",
	"Object",
	"Error"
].forEach(function( type ) {
	classToType[ "[object " + type + "]" ] = type.toLowerCase();
});

function type( obj ) {
	return classToType[ ({}).toString.call( obj ) ];
}

function extend( a, b ) {
	for ( var prop in b ) {
		a[ prop ] = b[ prop ];
	}

	return a;
}

function deepExtend( a, b ) {
	for ( var prop in b ) {
		if ( typeof b[ prop ] === "object" ) {
			a[ prop ] = type( a[ prop ] ) === "object" ?
				deepExtend( a[ prop ] || {}, b[ prop ] ) :
				b[ prop ];
		} else {
			a[ prop ] = b[ prop ];
		}
	}

	return a;
}

function escapeHtml( string ) {
	return string.replace( /[&<>"'`]/g, function( char ) {
		return ({
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#039;"
		})[ char ];
	});
}
