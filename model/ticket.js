var markdown = require( "../lib/markdown" );
var util = require( "../lib/util" );

exports = module.exports = ticket;
exports.Ticket = Ticket;

function ticket( app, id ) {
	return new Ticket( app, id );
}

function Ticket( app, id ) {
	this.app = app;
	this.id = id;
}

util.extend( Ticket.prototype, {
	init: function( callback ) {
		this.app.ticket.get( this.id, function( error, settings ) {
			if ( error ) {
				return callback( error );
			}

			this.initFromSettings( settings, callback );
		}.bind( this ));
	},

	initFromSettings: function( settings, callback ) {
		this.title = settings.title;
		this.rawBody = settings.body;
		this.body = markdown.parse( this.rawBody );
		this.userId = settings.userId;
		this.created = settings.created;
		this.edited = settings.edited;
		this._init( callback );
	},

	getComments: function( callback ) {
		this.app.comment.getTicketCommentInstances( this.id, callback );
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
