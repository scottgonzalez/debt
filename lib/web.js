var express = require( "express" );
var routes = require( "./web/routes" );

exports.createServer = createServer;

function createServer( app ) {
	var web = express();

	web.set( "debt", app );
	Object.keys( app.options.express ).forEach(function( prop ) {
		web.set( prop, app.options.express[ prop ] );
	});

	// web.use( express.favicon( "..." ) );
	web.use( express.logger() );
	web.use( express.compress() );
	web.use( express.bodyParser() );
	web.use( express.responseTime() );
	web.use( express.query() );

	routes( web );

	return web;
}
