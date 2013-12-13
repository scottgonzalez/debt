var crypto = require( "crypto" );
var util = require( "./util" );

exports = module.exports = user;
exports.User = User;

function user( app ) {
	return new User( app );
}

function User( app ) {
	this.app = app;
	this.database = this.app.database;
}

util.extend( User.prototype, {
	create: function( data, callback ) {
		if ( !data.username ) {
			return util.delay( callback, new Error( "Missing required field `username`." ) );
		}

		if ( !util.isLabel( data.username ) ) {
			return util.delay( callback, new Error( "Invalid `username`." ) );
		}

		if ( !data.email ) {
			return util.delay( callback, new Error( "Missing required field `email`." ) );
		}

		if ( !util.isEmail( data.email ) ) {
			return util.delay( callback, new Error( "Invalid `email`." ) );
		}

		this._createApiKey(function( error, apiKey ) {
			if ( error ) {
				return callback( error );
			}

			this.database.query(
				"INSERT INTO `users` SET " +
					"`username` = ?," +
					"`email` = ?," +
					"`name` = ?," +
					"`apiKey` = ?",
				[ data.username, data.email, data.name || "", apiKey ],
			function( error, result ) {
				if ( error ) {
					return callback( error );
				}

				callback( null, result.insertId );
			});
		}.bind( this ));
	},

	get: function( id, callback ) {
		if ( !id ) {
			return util.delay( callback, new Error( "Missing required parameter `id`." ) );
		}

		this.database.query(
			"SELECT * FROM `users` WHERE `id` = ?",
			[ id ],
		function( error, rows ) {
			if ( error ) {
				return callback ( error );
			}

			callback( null, rows[ 0 ] );
		});
	},

	getByUsername: function( username, callback ) {
		if ( !username ) {
			return util.delay( callback, new Error( "Missing required parameter `username`." ) );
		}

		this.database.query(
			"SELECT * FROM `users` WHERE `username` = ?",
			[ username ],
		function( error, rows ) {
			if ( error ) {
				return callback ( error );
			}

			callback( null, rows[ 0 ] );
		});
	},

	_createApiKey: function( callback ) {
		var shasum = crypto.createHash( "sha1" );
		crypto.randomBytes( 256, function( error, data ) {
			if ( error ) {
				return callback( error );
			}

			shasum.update( data );
			callback( null, shasum.digest( "hex" ) );
		});
	}
});
