var marked = require( "marked" );
var util = require( "../lib/util" );

exports = module.exports = comment;
exports.Comment = Comment;

function comment( app, id ) {
	return new Comment( app, id );
}

function Comment( app, id ) {
	this.app = app;
	this.id = id;
}

util.extend( Comment.prototype, {
	init: function( callback ) {
		this.app.comment.get( this.id, function( error, settings ) {
			if ( error ) {
				return callback( error );
			}

			this.initFromSettings( settings, callback );
		}.bind( this ));
	},

	initFromSettings: function( settings, callback ) {
		this.rawBody = settings.body;
		this.body = this._parseBody( this.rawBody );
		this.ticketId = settings.ticketId;
		this.userId = settings.userId;
		this.created = settings.created;
		this._init( callback );
	},

	_parseBody: function( body ) {
		return marked( body );
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
