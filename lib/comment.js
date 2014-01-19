var util = require( "./util" );

exports = module.exports = comment;
exports.Comment = Comment;

function comment( app ) {
	return new Comment( app );
}

function Comment( app ) {
	this.app = app;
	this.database = this.app.database;
}

util.extend( Comment.prototype, {
	create: function( data, callback ) {
		if ( !data.ticketId ) {
			return util.delay( callback, util.createError({
				code: "E_MISSING_DATA",
				message: "Missing required field `ticketId`.",
				field: "ticketId"
			}));
		}

		if ( !data.userId ) {
			return util.delay( callback, util.createError({
				code: "E_MISSING_DATA",
				message: "Missing required field `userId`.",
				field: "userId"
			}));
		}

		if ( !data.body ) {
			return util.delay( callback, util.createError({
				code: "E_MISSING_DATA",
				message: "Missing required field `body`.",
				field: "body"
			}));
		}

		this.database.query(
			"INSERT INTO `comments` SET " +
				"`ticketId` = ?," +
				"`userId` = ?," +
				"`body` = ?",
			[ data.ticketId, data.userId, data.body ],
		function( error, result ) {
			if ( error ) {
				return callback( error );
			}

			// TODO: handle invalid ticketId/userId (#41)

			callback( null, result.insertId );
		});
	},

	get: function( id, callback ) {
		if ( !id ) {
			return util.delay( callback, util.createError({
				code: "E_MISSING_DATA",
				message: "Missing required parameter `id`.",
				field: "id",
			}));
		}

		this.database.query(
			"SELECT * FROM `comments` WHERE `id` = ?",
			[ id ],
		function( error, rows ) {
			if ( error ) {
				return callback ( error );
			}

			if ( !rows.length ) {
				return callback( util.createError({
					code: "E_NOT_FOUND",
					message: "Unknown comment id: " + id,
					id: id
				}));
			}

			callback( null, rows[ 0 ] );
		});
	},

	getTicketComments: function( ticketId, callback ) {
		if ( !ticketId ) {
			return util.delay( callback, util.createError({
				code: "E_MISSING_DATA",
				message: "Missing required parameter `ticketId`.",
				field: "ticketId",
			}));
		}

		this.database.query(
			"SELECT * FROM `comments` WHERE `ticketId` = ?",
			[ ticketId ],
		function( error, rows ) {
			if ( error ) {
				return callback ( error );
			}

			callback( null, rows );
		});
	}
});
