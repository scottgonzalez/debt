var util = require( "./util" );

exports = module.exports = ticket;
exports.Ticket = Ticket;

function ticket( app ) {
	return new Ticket( app );
}

function Ticket( app ) {
	this.app = app;
	this.database = this.app.database;
}

util.extend( Ticket.prototype, {
	create: function( data, callback ) {
		if ( !data.title ) {
			return callback( null, new Error( "Missing required field `title`." ) );
		}

		// TODO: support setting custom create (for imports)
		this.database.query(
			"INSERT INTO `tickets` SET " +
				"`title` = ?, " +
				"`body` = ?, " +
				"`edited` = NOW()",
			[ data.title, data.body || "" ],
		function( error, result ) {
			if ( error ) {
				return callback( error );
			}

			// TODO: insert fields

			callback( null, result.insertId );
		});
	},

	get: function( id, callback ) {
		if ( !id ) {
			return callback( null, new Error( "Missing required parameter `id`." ) );
		}

		this.database.query(
			"SELECT * FROM `tickets` WHERE `id` = ?",
			[ id ],
		function( error, rows ) {
			if ( error ) {
				return callback ( error );
			}

			// TODO: get fields

			callback( null, rows[ 0 ] );
		});
	}
});
