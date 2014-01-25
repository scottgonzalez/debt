var Ticket = require( "../../../model/ticket" ).Ticket;
var markdown = require( "../../../lib/markdown" );

exports._initFromSettings = {
	setUp: function( done ) {
		this._parse = markdown.parse;

		this.app = {};
		this.ticket = new Ticket( this.app, 37 );
		done();
	},

	tearDown: function( done ) {
		markdown.parse = this._parse;
		done();
	},

	"valid": function( test ) {
		test.expect( 8 );

		var providedSettings = {
			id: 37,
			title: "Pay down your debt",
			body: "Your debt is *too* high!",
			userId: 99,
			created: new Date( "2012-01-12 21:00:00" ),
			edited: new Date( "2012-01-12 21:15:00" )
		};

		markdown.parse = function( body ) {
			test.strictEqual( body, "Your debt is *too* high!" );
			return "parsed body";
		};

		this.ticket._initFromSettings( providedSettings, function( error ) {
			test.strictEqual( error, null, "Should not pass an error." );
			test.strictEqual( this.ticket.title, providedSettings.title,
				"Should save title." );
			test.strictEqual( this.ticket.rawBody, providedSettings.body,
				"Should save raw body." );
			test.strictEqual( this.ticket.body, "parsed body",
				"Should save parsed body." );
			test.strictEqual( this.ticket.userId, providedSettings.userId,
				"Should save userId." );
			test.strictEqual( this.ticket.created, providedSettings.created,
				"Should save created." );
			test.strictEqual( this.ticket.edited, providedSettings.edited,
				"Should save edited." );

			test.done();
		}.bind( this ));
	}
};

exports._init = {
	setUp: function( done ) {
		this.app = {};
		this.ticket = new Ticket( this.app, 37 );
		done();
	},

	"loadUser error": function( test ) {
		test.expect( 2 );

		this.ticket._loadUser = function( callback ) {
			test.ok( true, "_loadUser() should be called." );

			process.nextTick(function() {
				callback( new Error( "load error" ) );
			});
		};

		this.ticket._init(function( error ) {
			test.strictEqual( error.message, "load error", "Should pass the error." );
			test.done();
		});
	},

	"valid": function( test ) {
		test.expect( 2 );

		this.ticket._loadUser = function( callback ) {
			test.ok( true, "_loadUser() should be called." );

			process.nextTick(function() {
				callback( null );
			});
		};

		this.ticket._init(function( error ) {
			test.strictEqual( error, null, "Should not pass an error." );
			test.done();
		});
	}
};

exports._loadUser = {
	setUp: function( done ) {
		this.app = {
			user: {}
		};
		this.ticket = new Ticket( this.app, 37 );
		this.ticket.userId = 99;
		done();
	},

	"getInstance error": function( test ) {
		test.expect( 2 );

		this.app.user.getInstance = function( userId, callback ) {
			test.strictEqual( userId, 99, "Should pass id." );

			process.nextTick(function() {
				callback( new Error( "user error" ) );
			});
		};

		this.ticket._loadUser(function( error ) {
			test.strictEqual( error.message, "user error", "Should pass the error." );
			test.done();
		});
	},

	"valid": function( test ) {
		test.expect( 3 );

		var providedUser = {};

		this.app.user.getInstance = function( userId, callback ) {
			test.strictEqual( userId, 99, "Should pass id." );

			process.nextTick(function() {
				callback( null, providedUser );
			});
		};

		this.ticket._loadUser(function( error ) {
			test.strictEqual( error, null, "Should not pass an error." );
			test.strictEqual( this.ticket.user, providedUser, "Should store user." );
			test.done();
		}.bind( this ));
	}
};
