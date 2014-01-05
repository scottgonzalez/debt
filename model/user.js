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

	_init: function( callback ) {
		process.nextTick(function() {
			callback( null );
		});
	},

	toJSON: function() {
		return {
			id: this.id,
			username: this.username,
			email: this.email,
			name: this.name
		};
	}
});
