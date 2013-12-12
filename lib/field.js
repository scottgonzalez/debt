var fs = require( "fs" );
var basename = require( "path" ).basename;
var inherits = require( "util" ).inherits;
var util = require( "./util" );

exports = module.exports = fieldManager;
exports.FieldManager = FieldManager;
exports.Field = Field;

function fieldManager( app ) {
	return new FieldManager( app );
}

function FieldManager( app ) {
	this.app = app;
	this.database = app.database;
}

util.extend( FieldManager, {

	// Map of type name to constructor
	types: {},

	register: function( type, prototype ) {
		if ( !util.isLabel( type ) ) {
			throw new Error( "Invalid `type` (" + type + ")." );
		}

		function Constructor() {
			Field.apply( this, arguments );
		}

		inherits( Constructor, Field );

		prototype.type = type;
		util.extend( Constructor.prototype, prototype );
		FieldManager.types[ type ] = Constructor;
	}
});

util.extend( FieldManager.prototype, {
	create: function( settings, callback ) {
		if ( !settings.type ) {
			return util.delay( callback, new Error( "Missing required field `type`." ) );
		}

		if ( !FieldManager.types.hasOwnProperty( settings.type ) ) {
			return util.delay( callback, new Error( "Invalid `type` (" + settings.type + ")." ) );
		}

		if ( !settings.label ) {
			return util.delay( callback, new Error( "Missing required field `label`." ) );
		}

		if ( settings.label.length > 63 ) {
			return util.delay( callback, new Error( "Invalid `label` (" + settings.label + ")." ) );
		}

		// TODO: Check for duplicate labels

		this.database.query(
			"INSERT INTO `fields` SET " +
				"`type` = ?," +
				"`label` = ?," +
				"`config` = ?",
			[ settings.type, settings.label, settings.config || "" ],
		function( error, result ) {
			if ( error ) {
				return callback( error );
			}

			callback( null, result.insertId );
		});
	},

	get: function( id, callback ) {
		var field = new Field( this.app, id );
		field.getSettings(function( error, settings ) {
			if ( error ) {
				return callback( error );
			}

			var Constructor = FieldManager.types[ settings.type ];

			if ( !Constructor ) {
				return callback( new Error( "Invalid `type` (" + settings.type + ") " +
					"for field " + id + "." ) );
			}

			var field = new Constructor( this.app, id );
			field.initFromSettings( settings, function( error ) {
				if ( error ) {
					return callback( error );
				}

				callback( null, field );
			});
		}.bind( this ));
	}
});

function Field( app, id ) {
	this.app = app;
	this.database = this.app.database;
	this.id = id;
}

util.extend( Field.prototype, {
	init: function( callback ) {
		this.getSettings(function( error, settings ) {
			if ( error ) {
				return callback( error );
			}

			this.initFromSettings( settings, callback );
		}.bind( this ));
	},

	initFromSettings: function( settings, callback ) {
		this.label = settings.label;
		this.config = settings.config;
		this.inputName = "field_" +
			this.label.toLowerCase().replace( /[^a-z]/g, "" );
		this._init( callback );
	},

	getSettings: function( callback ) {
		this.database.query(
			"SELECT * FROM `fields` WHERE `id` = ?",
			[ this.id ],
		function( error, rows ) {
			if ( error ) {
				return callback( error );
			}

			if ( !rows.length ) {
				return callback( new Error( "Unknown field id: " + this.id ) );
			}

			callback( null, rows[ 0 ] );
		}.bind( this ));
	},

	_init: function( callback ) {
		process.nextTick(function() {
			callback( null );
		});
	}
});

// Abstract methods
util.extend( Field.prototype, {
	render: function( value ) {
		throw new Error( "Missing required method `render()` " +
			"for field type '" + this.type + "'." );
	},

	renderEditable: function( value ) {
		throw new Error( "Missing required method `renderEditable()` " +
			"for field type '" + this.type + "'." );
	},

	validate: function( value ) {
		throw new Error( "Missing required method `validate()` " +
			"for field type '" + this.type + "'." );
	}
});

// Load all built-in field types
fs.readdirSync( __dirname + "/field" ).forEach(function( module ) {
	var type = basename( module, ".js" );
	var prototype = require( "./field/" + type );
	FieldManager.register( type, prototype );
});
