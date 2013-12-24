var util = require( "./util" );

exports = module.exports = group;
exports.Group = Group;

function group( app ) {
	return new Group( app );
}

function Group( app ) {
	this.app = app;
	this.database = this.app.database;
}

util.extend( Group.prototype, {
	create: function( data, callback ) {
		if ( !data.name ) {
			return util.delay( callback, new Error( "Missing required field `name`." ) );
		}

		if ( !util.isLabel( data.name ) ) {
			return util.delay( callback, new Error( "Invalid `name`." ) );
		}

		this.database.query(
			"INSERT INTO `groups` SET " +
				"`name` = ?," +
				"`description` = ?",
			[ data.name, data.description || "" ],
		function( error, result ) {
			if ( error ) {
				return callback( error );
			}

			callback( null, result.insertId );
		});
	},

	get: function( id, callback ) {
		if ( !id ) {
			return util.delay( callback, new Error( "Missing required parameter `id`." ) );
		}

		this.database.query(
			"SELECT * FROM `groups` WHERE `id` = ?",
			[ id ],
		function( error, rows ) {
			if ( error ) {
				return callback ( error );
			}

			callback( null, rows[ 0 ] );
		});
	},

	getByName: function( name, callback ) {
		if ( !name ) {
			return util.delay( callback, new Error( "Missing required parameter `name`." ) );
		}

		this.database.query(
			"SELECT * FROM `groups` WHERE `name` = ?",
			[ name ],
		function( error, rows ) {
			if ( error ) {
				return callback ( error );
			}

			callback( null, rows[ 0 ] );
		});
	}
});
