var Field = require( "../../../model/field" ).Field;

exports.init = {
	setUp: function( done ) {
		this._initFromSettings = Field.prototype.initFromSettings;

		this.app = {
			field: {}
		};
		done();
	},

	tearDown: function( done ) {
		Field.prototype.initFromSettings = this._initFromSettings;
		done();
	},

	"app.field.get error": function( test ) {
		test.expect( 2 );

		this.app.field.get = function( id, callback ) {
			test.strictEqual( id, 37, "Should pass id to field." );

			process.nextTick(function() {
				callback( new Error( "database gone" ) );
			});
		};

		var instance = new Field( this.app, 37 );
		instance.init(function( error ) {
			test.strictEqual( error.message, "database gone", "Should pass the error." );
			test.done();
		});
	},

	"valid": function( test ) {
		test.expect( 3 );

		var providedSettings = {
			id: 37,
			type: "fake",
			label: "my field",
			config: "custom config"
		};

		this.app.field.get = function( id, callback ) {
			test.strictEqual( id, 37, "Should pass id to field." );

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
			test.strictEqual( error, null, "Should not pass an error." );
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
		test.expect( 1 );

		this.field._init = function( callback ) {
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
			test.strictEqual( error.message, "bad init", "Should pass the error." );
			test.done();
		});
	},

	"valid": function( test ) {
		test.expect( 4 );

		this.field._init = function( callback ) {
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
			test.strictEqual( error, null, "Should not pass an error." );
			test.strictEqual( this.field.label, "my field", "Should save label." );
			test.strictEqual( this.field.config, "custom config", "Should save config." );
			test.strictEqual( this.field.inputName, "field_myfield", "Should generate inputName." );
			test.done();
		}.bind( this ));
	}
};

// TODO: abstract methods
