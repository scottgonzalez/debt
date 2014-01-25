var Model = require( "./model" ).Model;
var markdown = require( "../lib/markdown" );

exports.Ticket = Model.factory( "Ticket", {
	getComments: function( callback ) {
		this.app.comment.getTicketCommentInstances( this.id, callback );
	},

	_initFromSettings: function( settings, callback ) {
		this.title = settings.title;
		this.rawBody = settings.body;
		this.body = markdown.parse( this.rawBody );
		this.userId = settings.userId;
		this.created = settings.created;
		this.edited = settings.edited;
		callback( null );
	},

	_init: function( callback ) {
		this._loadUser( callback );
	},

	_loadUser: function( callback ) {
		this.app.user.getInstance( this.userId, function( error, user ) {
			if ( error ) {
				return callback( error );
			}

			this.user = user;
			callback( null );
		}.bind( this ));
	}
});
