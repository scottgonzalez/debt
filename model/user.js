var util = require( "../lib/util" );

exports = module.exports = user;
exports.User = User;

function user( app, id ) {
	return new User( app, id );
}

function User( app, id ) {
	this.app = app;
	this.id = id;
}

util.extend( User.prototype, {
	init: function( callback ) {
		this.app.user.get( this.id, function( error, settings ) {
			if ( error ) {
				return callback( error );
			}

			this.initFromSettings( settings, callback );
		}.bind( this ));
	},

	initFromSettings: function( settings, callback ) {
		this.username = settings.username;
		this.email = settings.email;
		this.name = settings.name;
		this.apiKey = settings.apiKey;
		this._init( callback );
	},

	hasPermission: function( permission ) {
		return this.app.permission.satisfies( this.permissions, permission );
	},

	_init: function( callback ) {
		this._loadPermissions( callback );
	},

	_loadPermissions: function( callback ) {
		this.app.permission.getUserPermissions( this.id, function( error, permissions ) {
			if ( error ) {
				return callback( error );
			}

			this.permissions = permissions;
			callback( null );
		}.bind( this ));
	}
});
