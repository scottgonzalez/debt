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
			return util.delay( callback, util.createError({
				code: "E_MISSING_DATA",
				message: "Missing required field `title`.",
				field: "title"
			}));
		}

		if ( !data.userId ) {
			return util.delay( callback, util.createError({
				code: "E_MISSING_DATA",
				message: "Missing required field `userId`.",
				field: "userId"
			}));
		}

		var createdValue = data.created ?
			this.database.escape( data.created ) :
			"NOW()";

		this.database.query(
			"INSERT INTO `tickets` SET " +
				"`title` = ?," +
				"`body` = ?," +
				"`userId` = ?," +
				"`created` = " + createdValue + "," +
				"`edited` = NOW()",
			[ data.title, data.body || "", data.userId ],
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
			return util.delay( callback, util.createError({
				code: "E_MISSING_DATA",
				message: "Missing required parameter `id`.",
				field: "id"
			}));
		}

		this.database.query(
			"SELECT * FROM `tickets` WHERE `id` = ?",
			[ id ],
		function( error, rows ) {
			if ( error ) {
				return callback ( error );
			}

			if ( !rows.length ) {
				return callback( null, null );
			}

			// TODO: get fields

			callback( null, rows[ 0 ] );
		});
	}
});
