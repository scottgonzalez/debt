var FieldManager = require( "../../lib/field" ).FieldManager;
var Field = require( "../../lib/field" ).Field;

exports.init = {
	setUp: function( done ) {
		this._getSettings = Field.prototype.getSettings;
		this._initFromSettings = Field.prototype.initFromSettings;

		this.app = {
			database: {}
		};
		done();
	},

	tearDown: function( done ) {
		Field.prototype.getSettings = this._getSettings;
		Field.prototype.initFromSettings = this._initFromSettings;
		done();
	},

	"getSettings error": function( test ) {
		test.expect( 3 );

		var providedApp = this.app;

		Field.prototype.getSettings = function( callback ) {
			test.strictEqual( this.app, providedApp, "Should pass app to field." );
			test.equal( this.id, 37, "Should pass id to field." );

			process.nextTick(function() {
				callback( new Error( "database gone" ) );
			});
		};

		var instance = new Field( this.app, 37 );
		instance.init(function( error ) {
			test.equal( error.message, "database gone", "Should pass the error." );
			test.done();
		});
	},

	"valid": function( test ) {
		test.expect( 5 );

		var providedApp = this.app;
		var providedSettings = {
			id: 37,
			type: "fake",
			label: "my field",
			config: "custom config"
		};

		Field.prototype.getSettings = function( callback ) {
			test.strictEqual( this.app, providedApp, "Should pass app to field." );
			test.strictEqual( this.database, providedApp.database,
				"Should pass database to field." );
			test.equal( this.id, 37, "Should pass id to field." );

			process.nextTick(function() {
				callback( null, providedSettings );
			});
		};

		Field.prototype.initFromSettings = function( settings, callback ) {
			test.strictEqual( settings, providedSettings, "Should pass settings." );

			process.nextTick(function() {
				callback( null );
			});
		};

		var instance = new Field( this.app, 37 );
		instance.init(function( error ) {
			test.equal( error, null, "Should not pass an error." );
			test.done();
		});
	}
};

exports.initFromSettings = {
	setUp: function( done ) {
		this.app = {};
		this.field = new Field( this.app, 37 );
		done();
	},

	"init error": function( test ) {
		test.expect( 3 );

		var providedApp = this.app;

		this.field._init = function( callback ) {
			test.strictEqual( this.app, providedApp, "Should pass app to field." );
			test.equal( this.id, 37, "Should pass id to field." );

			process.nextTick(function() {
				callback( new Error( "bad init" ) );
			});
		};

		this.field.initFromSettings({
			id: 37,
			type: "text",
			label: "my field",
			config: ""
		}, function( error ) {
			test.equal( error.message, "bad init", "Should pass the error." );
			test.done();
		});
	},

	"valid": function( test ) {
		test.expect( 6 );

		var providedApp = this.app;

		this.field._init = function( callback ) {
			test.strictEqual( this.app, providedApp, "Should pass app to field." );
			test.equal( this.id, 37, "Should pass id to field." );

			process.nextTick(function() {
				callback( null );
			});
		};

		this.field.initFromSettings({
			id: 37,
			type: "fake",
			label: "my field",
			config: "custom config"
		}, function( error ) {
			test.equal( error, null, "Should not pass an error." );
			test.equal( this.field.label, "my field", "Should save label." );
			test.equal( this.field.config, "custom config", "Should save config." );
			test.equal( this.field.inputName, "field_myfield", "Should generate inputName." );
			test.done();
		}.bind( this ));
	}
};

exports.getSettings = {
	setUp: function( done ) {
		this.app = {
			database: {}
		};
		this.field = new Field( this.app, 37 );
		done();
	},

	"database query error": function( test ) {
		test.expect( 3 );

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"SELECT * FROM `fields` WHERE `id` = ?",
				"Query should search by id." );
			test.deepEqual( values, [ 37 ], "Should pass values for escaping." );

			process.nextTick(function() {
				callback( new Error( "database gone" ) );
			});
		};

		this.field.getSettings(function( error ) {
			test.equal( error.message, "database gone", "Should pass the error." );
			test.done();
		});
	},

	"unknown field": function( test ) {
		test.expect( 3 );

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"SELECT * FROM `fields` WHERE `id` = ?",
				"Query should search by id." );
			test.deepEqual( values, [ 37 ], "Should pass values for escaping." );

			process.nextTick(function() {
				callback( null, [] );
			});
		};

		this.field.getSettings(function( error ) {
			test.equal( error.message, "Unknown field id: 37", "Should pass the error." );
			test.done();
		});
	},

	"existing field": function( test ) {
		test.expect( 4 );

		var providedSettings = {
			id: 37,
			type: "text",
			label: "my field",
			config: "custom config"
		};

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"SELECT * FROM `fields` WHERE `id` = ?",
				"Query should search by id." );
			test.deepEqual( values, [ 37 ], "Should pass values for escaping." );

			process.nextTick(function() {
				callback( null, [ providedSettings ]);
			});
		};

		this.field.getSettings(function( error, settings ) {
			test.equal( error, null, "Should not pass an error." );
			test.strictEqual( settings, providedSettings, "Should pass settings." );
			test.done();
		});
	}
};

// TODO: abstract methods
