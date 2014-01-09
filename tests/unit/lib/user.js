var UserManager = require( "../../../lib/user" ).UserManager;
var User = require( "../../../model/user" ).User;

exports.create = {
	setUp: function( done ) {
		this.app = {
			database: {}
		};
		this.userManager = new UserManager( this.app );
		done();
	},

	"missing username": function( test ) {
		test.expect( 1 );

		this.userManager.create({
			email: "dc@example.com",
			name: "Debt Collector"
		}, function( error ) {
			test.equal( error.message, "Missing required field `username`.",
				"Should throw for missing username." );
			test.done();
		});
	},

	"invalid username": function( test ) {
		test.expect( 1 );

		this.userManager.create({
			username: "debt collector",
			email: "dc@example.com",
			name: "Debt Collector"
		}, function( error ) {
			test.equal( error.message, "Invalid `username`.",
				"Should throw for invalid username." );
			test.done();
		});
	},

	"missing email": function( test ) {
		test.expect( 1 );

		this.userManager.create({
			username: "debt-collector",
			name: "Debt Collector"
		}, function( error ) {
			test.equal( error.message, "Missing required field `email`.",
				"Should throw for missing email." );
			test.done();
		});
	},

	"invalid email": function( test ) {
		test.expect( 1 );

		this.userManager.create({
			username: "debt-collector",
			email: "dc",
			name: "Debt Collector"
		}, function( error ) {
			test.equal( error.message, "Invalid `email`.",
				"Should throw for invalid email." );
			test.done();
		});
	},

	"api key generation error": function( test ) {
		test.expect( 2 );

		this.userManager._createApiKey = function( callback ) {
			test.ok( true, "Should create an API key." );

			process.nextTick(function() {
				callback( new Error( "Hasing is fun." ) );
			});
		};

		this.userManager.create({
			username: "debt-collector",
			email: "dc@example.com",
			name: "Debt Collector"
		}, function( error ) {
			test.equal( error.message, "Hasing is fun.",
				"Should throw for API key generation error." );
			test.done();
		});
	},

	"database insertion error": function( test ){
		test.expect( 4 );

		var providedApiKey = "da39a3ee5e6b4b0d3255bfef95601890afd80709";

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"INSERT INTO `users` SET " +
					"`username` = ?," +
					"`email` = ?," +
					"`name` = ?," +
					"`apiKey` = ?",
				"Query should insert values into database." );
			test.deepEqual( values,
				[ "debt-collector", "dc@example.com", "Debt Collector", providedApiKey ],
				"Should pass values for escaping." );

			process.nextTick(function() {
				callback( new Error( "database gone" ) );
			});
		};

		this.userManager._createApiKey = function( callback ) {
			test.ok( true, "Should create an API key." );

			process.nextTick(function() {
				callback( null, providedApiKey );
			});
		};

		this.userManager.create({
			username: "debt-collector",
			email: "dc@example.com",
			name: "Debt Collector"
		}, function( error ) {
			test.equal( error.message, "database gone", "Should pass the error." );
			test.done();
		});
	},

	"valid": function( test ){
		test.expect( 5 );

		var providedApiKey = "da39a3ee5e6b4b0d3255bfef95601890afd80709";

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"INSERT INTO `users` SET " +
					"`username` = ?," +
					"`email` = ?," +
					"`name` = ?," +
					"`apiKey` = ?",
				"Query should insert values into database." );
			test.deepEqual( values,
				[ "debt-collector", "dc@example.com", "Debt Collector", providedApiKey ],
				"Should pass values for escaping." );

			process.nextTick(function() {
				callback( null, { insertId: 99 } );
			});
		};

		this.userManager._createApiKey = function( callback ) {
			test.ok( true, "Should create an API key." );

			process.nextTick(function() {
				callback( null, providedApiKey );
			});
		};

		this.userManager.create({
			username: "debt-collector",
			email: "dc@example.com",
			name: "Debt Collector"
		}, function( error, id ) {
			test.equal( error, null, "Should not pass an error." );
			test.equal( id, 99, "Should return inserted id." );
			test.done();
		});
	}
};

exports.get = {
	setUp: function( done ) {
		this.app = {
			database: {}
		};
		this.userManager = new UserManager( this.app );
		done();
	},

	"missing id": function( test ) {
		test.expect( 1 );

		this.userManager.get( null, function( error ) {
			test.equal( error.message, "Missing required parameter `id`.",
				"Should throw for missing id." );
			test.done();
		});
	},

	"database query error": function( test ) {
		test.expect( 3 );

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"SELECT * FROM `users` WHERE `id` = ?",
				"Query should search by id." );
			test.deepEqual( values, [ 37 ], "Should pass values for escaping." );

			process.nextTick(function() {
				callback( new Error( "database gone" ) );
			});
		};

		this.userManager.get( 37, function( error ) {
			test.equal( error.message, "database gone", "Should pass the error." );
			test.done();
		});
	},

	"valid": function( test ) {
		test.expect( 4 );

		var providedUser = {
			id: 37,
			username: "debt-collector",
			email: "dc@example.com",
			name: "Debt Collector",
			apiKey: "da39a3ee5e6b4b0d3255bfef95601890afd80709"
		};

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"SELECT * FROM `users` WHERE `id` = ?",
				"Query should search by id." );
			test.deepEqual( values, [ 37 ], "Should pass values for escaping." );

			process.nextTick(function() {
				callback( null, [ providedUser ] );
			});
		};

		this.userManager.get( 37, function( error, user ) {
			test.equal( error, null, "Should not pass an error." );
			test.strictEqual( user, providedUser, "Should pass user." );
			test.done();
		});
	}
};

exports.getByUsername = {
	setUp: function( done ) {
		this.app = {
			database: {}
		};
		this.userManager = new UserManager( this.app );
		done();
	},

	"missing username": function( test ) {
		test.expect( 1 );

		this.userManager.getByUsername( null, function( error ) {
			test.equal( error.message, "Missing required parameter `username`.",
				"Should throw for missing username." );
			test.done();
		});
	},

	"database query error": function( test ) {
		test.expect( 3 );

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"SELECT * FROM `users` WHERE `username` = ?",
				"Query should search by username." );
			test.deepEqual( values, [ "debt-collector" ],
				"Should pass values for escaping." );

			process.nextTick(function() {
				callback( new Error( "database gone" ) );
			});
		};

		this.userManager.getByUsername( "debt-collector", function( error ) {
			test.equal( error.message, "database gone", "Should pass the error." );
			test.done();
		});
	},

	"no user": function( test ) {
		test.expect( 4 );

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"SELECT * FROM `users` WHERE `username` = ?",
				"Query should search by username." );
			test.deepEqual( values, [ "debt-collector" ],
				"Should pass values for escaping." );

			process.nextTick(function() {
				callback( null, [] );
			});
		};

		this.userManager.getByUsername( "debt-collector", function( error, user ) {
			test.equal( error, null, "Should not pass an error." );
			test.equal( user, null, "Shoul not pass a user." );
			test.done();
		});
	},

	"valid": function( test ) {
		test.expect( 4 );

		var providedUser = {
			id: 37,
			username: "debt-collector",
			email: "dc@example.com",
			name: "Debt Collector",
			apiKey: "da39a3ee5e6b4b0d3255bfef95601890afd80709"
		};

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"SELECT * FROM `users` WHERE `username` = ?",
				"Query should search by username." );
			test.deepEqual( values, [ "debt-collector" ],
				"Should pass values for escaping." );

			process.nextTick(function() {
				callback( null, [ providedUser ] );
			});
		};

		this.userManager.getByUsername( "debt-collector", function( error, user ) {
			test.equal( error, null, "Should not pass an error." );
			test.strictEqual( user, providedUser, "Should pass user." );
			test.done();
		});
	}
};

exports.getInstance = {
	setUp: function( done ) {
		this.app = {};
		this.userManager = new UserManager( this.app );
		done();
	},

	"get error": function( test ) {
		test.expect( 2 );

		this.userManager.get = function( id, callback ) {
			test.equal( id, 37, "Should pass id." );

			process.nextTick(function() {
				callback( new Error( "database gone" ) );
			});
		};

		this.userManager.getInstance( 37, function( error ) {
			test.equal( error.message, "database gone", "Should pass the error." );
			test.done();
		});
	},

	"init error": function( test ) {
		test.expect( 3 );

		var providedSettings = {
			id: 37,
			username: "debt-collector",
			email: "dc@example.com",
			name: "Debt Collector",
			apiKey: "da39a3ee5e6b4b0d3255bfef95601890afd80709"
		};

		this.userManager.get = function( id, callback ) {
			test.equal( id, 37, "Should pass id." );

			process.nextTick(function() {
				callback( null, providedSettings );
			});
		};

		this.userManager._getInstance = function( settings, callback ) {
			test.strictEqual( settings, providedSettings, "Should pass settings." );

			process.nextTick(function() {
				callback( new Error( "bad init" ) );
			});
		};

		this.userManager.getInstance( 37, function( error ) {
			test.equal( error.message, "bad init", "Should pass the error." );
			test.done();
		});
	},

	"valid user": function( test ) {
		test.expect( 3 );

		var fakeInstance;
		var providedSettings = {
			id: 37,
			username: "debt-collector",
			email: "dc@example.com",
			name: "Debt Collector",
			apiKey: "da39a3ee5e6b4b0d3255bfef95601890afd80709"
		};

		this.userManager.get = function( id, callback ) {
			process.nextTick(function() {
				callback( null, providedSettings );
			});
		};

		this.userManager._getInstance = function( settings, callback ) {
			test.strictEqual( settings, providedSettings, "Should pass settings." );

			fakeInstance = {};
			process.nextTick(function() {
				callback( null, fakeInstance );
			});
		};

		this.userManager.getInstance( 37, function( error, instance ) {
			test.equal( error, null, "Should not pass an error." );
			test.strictEqual( instance, fakeInstance, "Should pass user instance." );
			test.done();
		});
	}
};

exports.getInstanceByUsername = {
	setUp: function( done ) {
		this.app = {};
		this.userManager = new UserManager( this.app );
		done();
	},

	"get error": function( test ) {
		test.expect( 2 );

		this.userManager.getByUsername = function( username, callback ) {
			test.equal( username, "debt-collector", "Should pass username." );

			process.nextTick(function() {
				callback( new Error( "database gone" ) );
			});
		};

		this.userManager.getInstanceByUsername( "debt-collector", function( error ) {
			test.equal( error.message, "database gone", "Should pass the error." );
			test.done();
		});
	},

	"init error": function( test ) {
		test.expect( 3 );

		var providedSettings = {
			id: 37,
			username: "debt-collector",
			email: "dc@example.com",
			name: "Debt Collector",
			apiKey: "da39a3ee5e6b4b0d3255bfef95601890afd80709"
		};

		this.userManager.getByUsername = function( username, callback ) {
			test.equal( username, "debt-collector", "Should pass username." );

			process.nextTick(function() {
				callback( null, providedSettings );
			});
		};

		this.userManager._getInstance = function( settings, callback ) {
			test.strictEqual( settings, providedSettings, "Should pass settings." );

			process.nextTick(function() {
				callback( new Error( "bad init" ) );
			});
		};

		this.userManager.getInstanceByUsername( "debt-collector", function( error ) {
			test.equal( error.message, "bad init", "Should pass the error." );
			test.done();
		});
	},

	"no user": function( test ) {
		test.expect( 3 );

		this.userManager.getByUsername = function( username, callback ) {
			test.equal( username, "debt-collector", "Should pass username." );

			process.nextTick(function() {
				callback( null, null );
			});
		};

		this.userManager.getInstanceByUsername( "debt-collector", function( error, user ) {
			test.equal( error, null, "Should no pass an error." );
			test.equal( user, null, "Should no pass a user." );
			test.done();
		});
	},

	"valid user": function( test ) {
		test.expect( 3 );

		var fakeInstance;
		var providedSettings = {
			id: 37,
			username: "debt-collector",
			email: "dc@example.com",
			name: "Debt Collector",
			apiKey: "da39a3ee5e6b4b0d3255bfef95601890afd80709"
		};

		this.userManager.getByUsername = function( username, callback ) {
			process.nextTick(function() {
				callback( null, providedSettings );
			});
		};

		this.userManager._getInstance = function( settings, callback ) {
			test.strictEqual( settings, providedSettings, "Should pass settings." );

			fakeInstance = {};
			process.nextTick(function() {
				callback( null, fakeInstance );
			});
		};

		this.userManager.getInstanceByUsername( "debt-collector", function( error, instance ) {
			test.equal( error, null, "Should not pass an error." );
			test.strictEqual( instance, fakeInstance, "Should pass user instance." );
			test.done();
		});
	}
};

exports._getInstance = {
	setUp: function( done ) {
		this._initFromSettings = User.prototype.initFromSettings;

		this.app = {};
		this.userManager = new UserManager( this.app );
		done();
	},

	tearDown: function( done ) {
		User.prototype.initFromSettings = this._initFromSettings;
		done();
	},

	"init error": function( test ) {
		test.expect( 4 );

		var providedApp = this.app;
		var providedSettings = {
			id: 37,
			username: "debt-collector",
			email: "dc@example.com",
			name: "Debt Collector",
			apiKey: "da39a3ee5e6b4b0d3255bfef95601890afd80709"
		};

		User.prototype.initFromSettings = function( settings, callback ) {
			test.strictEqual( this.app, providedApp, "Should pass app to user." );
			test.equal( this.id, 37, "Should pass id to user." );
			test.strictEqual( settings, providedSettings, "Should pass settings to user." );

			process.nextTick(function() {
				callback( new Error( "bad init" ) );
			});
		};

		this.userManager._getInstance( providedSettings, function( error, user ) {
			test.equal( error.message, "bad init", "Should pass the error." );
			test.done();
		});
	},

	"valid user": function( test ) {
		test.expect( 5 );

		var instance;
		var providedApp = this.app;
		var providedSettings = {
			id: 37,
			username: "debt-collector",
			email: "dc@example.com",
			name: "Debt Collector",
			apiKey: "da39a3ee5e6b4b0d3255bfef95601890afd80709"
		};

		User.prototype.initFromSettings = function( settings, callback ) {
			instance = this;

			test.strictEqual( this.app, providedApp, "Should pass app to user." );
			test.equal( this.id, 37, "Should pass id to user." );
			test.strictEqual( settings, providedSettings, "Should pass settings to user." );

			process.nextTick(function() {
				callback( null );
			});
		};

		this.userManager._getInstance( providedSettings, function( error, user ) {
			test.equal( error, null, "Should not pass an error." );
			test.strictEqual( user, instance, "Should pass user instance." );
			test.done();
		});
	}
};

exports._createApiKey = {
	"creation": function( test ) {
		test.expect( 5 );

		UserManager.prototype._createApiKey(function( error, firstKey ) {
			test.equal( error, null, "Should not pass an error." );
			test.ok( /^[a-f0-9]{40}$/.test( firstKey ), "Should produce a sha1 hash." );

			UserManager.prototype._createApiKey(function( error, key ) {
				test.equal( error, null, "Should not pass an error." );
				test.ok( /^[a-f0-9]{40}$/.test( key ), "Should produce a sha1 hash." );
				test.notEqual( key, firstKey, "Should produce a unique key." );
				test.done();
			});
		});
	}
};
