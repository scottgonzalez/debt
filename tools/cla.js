var http = require( "http" );
var async = require( "async" );
var Repo = require( "git-tools" );
var key = "0AgyHrN8YnS0IdHVPcm1WWklEa29uYjdRZWpRbE9KUEE";

exports.getSignatureErrors = getSignatureErrors;
exports.getValidAuthors = getValidAuthors;
exports.getInvalidAuthors = getInvalidAuthors;

function getSignatures( callback ) {
	var request = http.request({
		hostname: "spreadsheets.google.com",
		path: "/feeds/list/" + key + "/1/public/values?alt=json"
	}, function( response ) {
		var data = "";

		response.setEncoding( "utf8" );
		response.on( "data", function( chunk ) {
			data += chunk;
		});
		response.on( "end", function() {
			if ( response.statusCode >= 400 ) {
				return callback( new Error( data || "Error getting signatures" ) );
			}

			try {
				data = JSON.parse( data );
			} catch( error ) {
				return callback( error );
			}

			callback( null, data.feed.entry );
		});
	});

	request.on( "error", function( error ) {
		callback( error );
	});

	request.end();
}

function getValidAuthors( callback ) {
	getSignatures(function( error, data ) {
		if ( error ) {
			return callback( error );
		}

		var authors = validate( data ).authors.concat({
			name: "Scott González",
			email: "scott.gonzalez@gmail.com"
		});

		callback( null, authors );
	});
}

function getSignatureErrors( callback ) {
	getSignatures(function( error, data ) {
		if ( error ) {
			return callback( error );
		}

		callback( null, validate( data ).errors );
	});
}

function isEmail( str ) {
	return (/^[a-zA-Z0-9.!#$%&'*+\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*$/).test( str );
}

function validate( entries ) {
	var filtered,
		authorEmails = {},
		errors = [];

	filtered = entries
		.filter(function( row ) {
			var email = row.gsx$emailaddress.$t,
				name = row.gsx$fullname.$t,
				nameParts = name.split( " " );

			// Check for valid email address
			if ( !isEmail( email ) ) {
				errors.push( email + " is not a valid email address." );
				return false;
			}

			// Check for duplicate signatures
			if ( authorEmails.hasOwnProperty( email ) ) {
				errors.push( email + " signed multiple times." );
				return false;
			} else {
				authorEmails[ email ] = true;
			}

			// Verify confirmation field
			if ( row.gsx$confirmation.$t.trim().toUpperCase() !== "I AGREE" ) {
				errors.push( email + " did not properly confirm agreement." );
				return false;
			}

			// The remaining checks are for the full name
			// Skip any names that have been manually verified
			if ( row.gsx$nameconfirmation && row.gsx$nameconfirmation.$t ) {
				return true;
			}

			// Must have at least 2 names
			if ( nameParts.length < 2 ) {
				errors.push( "Suspicious name: " + name );
				return false;
			}

			// Must have at least 2 characters per name
			if ( name.length < 5 ) {
				errors.push( "Suspicious name: " + name );
				return false;
			}

			return true;
		})

		// Map to name and email
		.map(function( row ) {
			return {
				name: row.gsx$fullname.$t,
				email: row.gsx$emailaddress.$t
			};
		});

	return {
		authors: filtered,
		errors: errors
	};
}

function getCommits( callback ) {
	var repo = new Repo( "." );
	repo.exec( "log", "--format=%H %aE %aN", function( error, log ) {
		if ( error ) {
			return callback( error );
		}

		var commits = log.split( "\n" ).map(function( commit ) {
			var matches = /^(\S+)\s(\S+)\s(.+)$/.exec( commit );

			return {
				hash: matches[ 1 ],
				email: matches[ 2 ],
				name: matches[ 3 ]
			};
		});

		callback( null, commits );
	});
}

function getInvalidAuthors( callback ) {
	async.parallel({
		commits: getCommits,
		signatures: getValidAuthors
	}, function( error, data ) {
		if ( error ) {
			return callback( error );
		}

		var hashedSignatures = {};
		data.signatures.forEach(function( signature ) {
			hashedSignatures[ signature.email ] = signature.name;
		});

		var authors = data.commits

			// Filter out authors who have signed the CLA
			.filter(function( commit ) {
				var name = hashedSignatures[ commit.email ];
				return name !== commit.name;
			})

			// Map commits to authors
			.map(function( commit ) {
				return commit.name + " <" + commit.email + ">";
			})

			// Filter to unique authors
			.filter(function( author, index, array ) {
				return array.indexOf( author ) === index;
			});

		callback( null, authors );
	});
}
