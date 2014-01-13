var Ticket = require( "../../../model/ticket" ).Ticket;

exports.init = {
	setUp: function( done ) {
		this._initFromSettings = Ticket.prototype.initFromSettings;

		this.app = {
			ticket: {}
		};
		done();
	},

	tearDown: function( done ) {
		Ticket.prototype.initFromSettings = this._initFromSettings;
		done();
	},

	"app.ticket.get error": function( test ) {
		test.expect( 2 );

		this.app.ticket.get = function( id, callback ) {
			test.strictEqual( id, 37, "Should pass id to ticket." );

			process.nextTick(function() {
				callback( new Error( "database gone" ) );
			});
		};

		var instance = new Ticket( this.app, 37 );
		instance.init(function( error ) {
			test.strictEqual( error.message, "database gone", "Should pass the error." );
			test.done();
		});
	},

	"valid": function( test ) {
		test.expect( 3 );

		var providedSettings = {
			id: 37,
			title: "Pay down your debt",
			body: "Your debt is *too* high!",
			userId: 99,
			created: new Date( "2012-01-12 21:00:00" ),
			edited: new Date( "2012-01-12 21:15:00" )
		};

		this.app.ticket.get = function( id, callback ) {
			test.strictEqual( id, 37, "Should pass id to ticket." );

			process.nextTick(function() {
				callback( null, providedSettings );
			});
		};

		Ticket.prototype.initFromSettings = function( settings, callback ) {
			test.strictEqual( settings, providedSettings, "Should pass settings." );

			process.nextTick(function() {
				callback( null );
			});
		};

		var instance = new Ticket( this.app, 37 );
		instance.init(function( error ) {
			test.strictEqual( error, null, "Should not pass an error." );
			test.done();
		});
	}
};

exports.initFromSettings = {
	setUp: function( done ) {
		this.app = {};
		this.ticket = new Ticket( this.app, 37 );
		done();
	},

	"init error": function( test ) {
		test.expect( 1 );

		this.ticket._init = function( callback ) {
			process.nextTick(function() {
				callback( new Error( "bad init" ) );
			});
		};

		this.ticket.initFromSettings({
			id: 37,
			title: "Pay down your debt",
			body: "Your debt is *too* high!",
			userId: 99,
			created: new Date( "2012-01-12 21:00:00" ),
			edited: new Date( "2012-01-12 21:15:00" )
		}, function( error ) {
			test.strictEqual( error.message, "bad init", "Should pass the error." );
			test.done();
		});
	},

	"valid": function( test ) {
		test.expect( 6 );

		var providedSettings = {
			id: 37,
			title: "Pay down your debt",
			body: "Your debt is *too* high!",
			userId: 99,
			created: new Date( "2012-01-12 21:00:00" ),
			edited: new Date( "2012-01-12 21:15:00" )
		};

		this.ticket._init = function( callback ) {
			test.strictEqual( this.title, providedSettings.title, "Should save title." );
			test.strictEqual( this.rawBody, providedSettings.body, "Should save body." );
			test.strictEqual( this.userId, providedSettings.userId, "Should save userId." );
			test.strictEqual( this.created, providedSettings.created, "Should save created." );
			test.strictEqual( this.edited, providedSettings.edited, "Should save edited." );

			process.nextTick(function() {
				callback( null );
			});
		};

		this.ticket.initFromSettings( providedSettings, function( error ) {
			test.strictEqual( error, null, "Should not pass an error." );
			test.done();
		});
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
