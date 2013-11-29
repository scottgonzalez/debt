var Database = require( "./lib/database" );
var web = require( "./lib/web" );
var util = require( "./lib/util" );
var webDefaults = require( "./lib/web/defaults" );

exports = module.exports = debt;
exports.Debt = Debt;

function debt( options, callback ) {
	var app = new Debt( options );
	app.init(function( error ) {
		if ( error ) {
			return callback( error );
		}

		callback( null, app );
	});
}

function Debt( options ) {

	// Just merge default options
	// Everything else waits until the app is initialized
	this.options = util.deepExtend({
		title: "DEBT",
		express: webDefaults( this ),
	}, options );
}

util.extend( Debt.prototype, {
	basePath: __dirname,

	init: function( callback ) {

		// Remove database options to prevent leaking information to templates
		var databaseOptions = this.options.database;
		delete this.options.database;

		// Create Express application
		this.web = web.createServer( this );

		// Expose application settings to templates via `app`
		this.web.locals.app = this.options;

		// Connect to the database
		Database.createClient( databaseOptions, function( error, database ) {
			if ( error ) {
				return callback( error );
			}

			this.database = database;
			this._initModules();
			callback( null );
		}.bind( this ));
	},

	_initModules: function() {
		this.ticket = require( "./lib/ticket" )( this );
	},

	install: function( callback ) {
		this.database.createTables( callback );
	},

	listen: function() {
		this.web.listen.apply( this.web, arguments );
	}
});
