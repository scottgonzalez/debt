var mysql = require( "mysql" );

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

Database.prototype.query = function() {
	this.connection.query.apply( this.connection, arguments );
};

require( "./database/tables" )( Database );
