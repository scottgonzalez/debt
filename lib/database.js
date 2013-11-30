var mysql = require( "mysql" );
var util = require( "./util" );

exports = module.exports = Database;
exports.createClient = createClient;

function createClient( options, callback ) {
	var database = new Database( options, function( error ) {
		if ( error ) {
			return callback( error );
		}

		callback( null, database );
	});
}

function Database( options, callback ) {
	this.connection = mysql.createConnection( options );
	this.connection.connect(function( error ) {
		if ( error ) {
			return callback( error );
		}

		callback( null );
	}.bind( this ));
}

util.extend( Database.prototype, {
	query: function() {
		return this.connection.query.apply( this.connection, arguments );
	},

	escape: function() {
		return this.connection.escape.apply( this.connection, arguments );
	}
});

require( "./database/tables" )( Database );
