var express = require( "express" );
var MysqlStore = require( "connect-mysql" )( express );
var routes = require( "./web/routes" );

exports.createServer = createServer;

function createServer( app ) {
	var web = express();

	// Expose DEBT instance to Express app
	web.set( "debt", app );

	// Set all Express options
	Object.keys( app.options.express ).forEach(function( prop ) {
		web.set( prop, app.options.express[ prop ] );
	});

	// Expose application settings to templates via `app`
	web.locals.app = app.options;

	// web.use( express.favicon( "..." ) );
	web.use( express.logger() );
	web.use( express.compress() );
	web.use( express.bodyParser() );
	web.use( express.responseTime() );
	web.use( express.query() );

	// Enable sessions
	web.use( express.cookieParser() );
	web.use( express.session({
		key: "debt.sid",
		secret: app.options.cookieSecret,
		store: new MysqlStore({
			client: app.database.connection
		})
	}));

	web.use(function( request, response, next ) {
		response.locals.activeUser = request.session.user;
		next();
	});

	routes( web );

	return web;
}
