var fs = require( "fs" );

all([
	unitTests,
	checkCla
], function( errors ) {
	if ( errors.length ) {
		process.exit( 1 );
	}
});

function all( steps, callback ) {
	var errors = [];

	function next() {
		var step = steps.shift();
		step(function( error ) {
			if ( error ) {
				errors.push( error );
			}

			if ( !steps.length ) {
				return callback( errors );
			}

			next();
		});
	}

	next();
}

function unitTests( callback ) {
	var nodeunit = require( "nodeunit" );
	var reporter = nodeunit.reporters.default;
	var options = require( "nodeunit/bin/nodeunit.json" );

	reporter.run([ "tests/unit" ], options, callback );
}

function checkCla( callback ) {
	var cla = require( "../tools/cla" );

	console.log();
	console.log( "Checking CLA signature for all authors..." );
	cla.getInvalidAuthors(function( error, authors ) {
		if ( error ) {
			return callback( error );
		}

		if ( authors.length ) {
			console.log( "The following authors have not signed the CLA:" );
			authors.forEach(function( author ) {
				console.log( "- " + author );
			});

			return callback( new Error( "Invalid authors" ) );
		}

		console.log( "All authors have signed the CLA." );
		callback( null );
	});
}
