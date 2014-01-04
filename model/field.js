var util = require( "../lib/util" );

exports = module.exports = field;
exports.Field = Field;

function field( app, id ) {
	return new Field( app, id );
}

function Field( app, id ) {
	this.app = app;
	this.id = id;
}

util.extend( Field.prototype, {
	init: function( callback ) {
		this.app.field.get( this.id, function( error, settings ) {
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
