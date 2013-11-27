exports.extend = extend;
exports.deepExtend = deepExtend;

function extend( a, b ) {
	for ( var prop in b ) {
		a[ prop ] = b[ prop ];
	}

	return a;
}

function deepExtend( a, b ) {
	for ( var prop in b ) {
		if ( typeof b[ prop ] === "object" ) {
			a[ prop ] = typeof a[ prop ] === "object" ?
				deepExtend( a[ prop ] || {}, b[ prop ] ) :
				b[ prop ];
		} else {
			a[ prop ] = b[ prop ];
		}
	}

	return a;
}
