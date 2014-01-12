var User = require( "../../../model/user" ).User;

exports.init = {
	setUp: function( done ) {
		this._initFromSettings = User.prototype.initFromSettings;

		this.app = {
			user: {}
		};
		done();
	},

	tearDown: function( done ) {
		User.prototype.initFromSettings = this._initFromSettings;
		done();
	},

	"app.user.get error": function( test ) {
		test.expect( 2 );

		this.app.user.get = function( id, callback ) {
			test.strictEqual( id, 37, "Should pass id to user." );

			process.nextTick(function() {
				callback( new Error( "database gone" ) );
			});
		};

		var instance = new User( this.app, 37 );
		instance.init(function( error ) {
			test.strictEqual( error.message, "database gone", "Should pass the error." );
			test.done();
		});
	},

	"valid": function( test ) {
		test.expect( 3 );

		var providedSettings = {
			id: 37,
			username: "debt-collector",
			email: "dc@example.com",
			name: "Debt Collector",
			apiKey: "da39a3ee5e6b4b0d3255bfef95601890afd80709"
		};

		this.app.user.get = function( id, callback ) {
			test.strictEqual( id, 37, "Should pass id to user." );

			process.nextTick(function() {
				callback( null, providedSettings );
			});
		};

		User.prototype.initFromSettings = function( settings, callback ) {
			test.strictEqual( settings, providedSettings, "Should pass settings." );

			process.nextTick(function() {
				callback( null );
			});
		};

		var instance = new User( this.app, 37 );
		instance.init(function( error ) {
			test.strictEqual( error, null, "Should not pass an error." );
			test.done();
		});
	}
};

exports.initFromSettings = {
	setUp: function( done ) {
		this.app = {};
		this.user = new User( this.app, 37 );
		done();
	},

	"init error": function( test ) {
		test.expect( 1 );

		this.user._init = function( callback ) {
			process.nextTick(function() {
				callback( new Error( "bad init" ) );
			});
		};

		this.user.initFromSettings({
			id: 37,
			username: "debt-collector",
			email: "dc@example.com",
			name: "Debt Collector",
			apiKey: "da39a3ee5e6b4b0d3255bfef95601890afd80709"
		}, function( error ) {
			test.strictEqual( error.message, "bad init", "Should pass the error." );
			test.done();
		});
	},

	"valid": function( test ) {
		test.expect( 5 );

		var providedSettings = {
			id: 37,
			username: "debt-collector",
			email: "dc@example.com",
			name: "Debt Collector",
			apiKey: "da39a3ee5e6b4b0d3255bfef95601890afd80709"
		};

		this.user._init = function( callback ) {
			process.nextTick(function() {
				callback( null );
			});
		};

		this.user.initFromSettings( providedSettings, function( error ) {
			test.strictEqual( error, null, "Should not pass an error." );
			test.strictEqual( this.user.username, providedSettings.username,
				"Should save username." );
			test.strictEqual( this.user.email, providedSettings.email, "Should save email." );
			test.strictEqual( this.user.name, providedSettings.name, "Should save name." );
			test.strictEqual( this.user.apiKey, providedSettings.apiKey, "Should save apiKey." );
			test.done();
		}.bind( this ));
	}
};

exports.hasPermission = {
	setUp: function( done ) {
		this.app = {
			permission: {}
		};
		this.user = new User( this.app, 37 );
		done();
	},

	"invalid": function( test ) {
		test.expect( 3 );

		var providedPermissions = {};
		this.user.permissions = providedPermissions;

		this.app.permission.satisfies = function( permissions, permission ) {
			test.strictEqual( permissions, providedPermissions, "Should pass permissions." );
			test.strictEqual( permission, "TICKET:CREATE", "Should pass permission." );

			return false;
		};

		test.strictEqual( this.user.hasPermission( "TICKET:CREATE" ), false,
			"Should pass result from permission.satisfies()." );
		test.done();
	},

	"valid": function( test ) {
		test.expect( 3 );

		var providedPermissions = { TICKET: { CREATE: true } };
		this.user.permissions = providedPermissions;

		this.app.permission.satisfies = function( permissions, permission ) {
			test.strictEqual( permissions, providedPermissions, "Should pass permissions." );
			test.strictEqual( permission, "TICKET:CREATE", "Should pass permission." );

			return true;
		};

		test.ok( this.user.hasPermission( "TICKET:CREATE" ),
			"Should pass result from permission.satisfies()." );
		test.done();
	}
};

exports._init = {
	setUp: function( done ) {
		this.app = {};
		this.user = new User( this.app, 37 );
		done();
	},

	"loadPermissions error": function( test ) {
		test.expect( 2 );

		this.user._loadPermissions = function( callback ) {
			test.ok( true, "_loadPermissions() should be called." );

			process.nextTick(function() {
				callback( new Error( "load error" ) );
			});
		};

		this.user._init(function( error ) {
			test.strictEqual( error.message, "load error", "Should pass the error." );
			test.done();
		});
	},

	"valid": function( test ) {
		test.expect( 2 );

		this.user._loadPermissions = function( callback ) {
			test.ok( true, "_loadPermissions() should be called." );

			process.nextTick(function() {
				callback( null );
			});
		};

		this.user._init(function( error ) {
			test.strictEqual( error, null, "Should not pass an error." );
			test.done();
		});
	}
};

exports._loadPermissions = {
	setUp: function( done ) {
		this.app = {
			permission: {}
		};
		this.user = new User( this.app, 37 );
		done();
	},

	"getUserPermissions error": function( test ) {
		test.expect( 2 );

		this.app.permission.getUserPermissions = function( userId, callback ) {
			test.strictEqual( userId, 37, "Should pass id." );

			process.nextTick(function() {
				callback( new Error( "permission error" ) );
			});
		};

		this.user._loadPermissions(function( error ) {
			test.strictEqual( error.message, "permission error", "Should pass the error." );
			test.done();
		});
	},

	"valid": function( test ) {
		test.expect( 3 );

		var providedPermissions = {};

		this.app.permission.getUserPermissions = function( userId, callback ) {
			test.strictEqual( userId, 37, "Should pass id." );

			process.nextTick(function() {
				callback( null, providedPermissions );
			});
		};

		this.user._loadPermissions(function( error ) {
			test.strictEqual( error, null, "Should not pass an error." );
			test.strictEqual( this.user.permissions, providedPermissions,
				"Should store permissions." );
			test.done();
		}.bind( this ));
	}
};
