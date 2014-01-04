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
			test.equal( id, 37, "Should pass id to user." );

			process.nextTick(function() {
				callback( new Error( "database gone" ) );
			});
		};

		var instance = new User( this.app, 37 );
		instance.init(function( error ) {
			test.equal( error.message, "database gone", "Should pass the error." );
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
			test.equal( id, 37, "Should pass id to user." );

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
			test.equal( error, null, "Should not pass an error." );
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
			test.equal( error.message, "bad init", "Should pass the error." );
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
			test.equal( error, null, "Should not pass an error." );
			test.equal( this.user.username, providedSettings.username, "Should save username." );
			test.equal( this.user.email, providedSettings.email, "Should save email." );
			test.equal( this.user.name, providedSettings.name, "Should save name." );
			test.equal( this.user.apiKey, providedSettings.apiKey, "Should save apiKey." );
			test.done();
		}.bind( this ));
	}
};
