var Model = require( "./model" ).Model;
var markdown = require( "../lib/markdown" );

exports.Ticket = Model.factory( "Ticket", {
	getComments: function( callback ) {
		this.app.comment.getTicketCommentInstances( this.id, callback );
	},

	addComment: function( data, callback ) {
		data.ticketId = this.id;
		if ( !data.created ) {
			data.created = new Date();
		}

		// TODO: wrap in transaction (#49)
		this.app.comment.create( data, function( error, commentId ) {
			if ( error ) {
				return callback( error );
			}

			this.app.ticket.edit( this.id, { edited: data.created }, function( error ) {
				if ( error ) {
					return callback( error );
				}

				callback( null, commentId );
			});
		}.bind( this ));
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
