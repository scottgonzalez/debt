var util = require( "./util" );

exports = module.exports = auth;
exports.Auth = Auth;

function auth( app ) {
	return new Auth( app );
}

function Auth( app ) {
	this.app = app;
}

util.extend( Auth.prototype, {
	init: function() {
		this.provider = this.app.options.authProvider( this.app );
		this.provider.init();

		this.app.web.get( "/login", function( request ) {
			request.session.loginRedirect = request.get( "referer" ) || "/";
			this.provider.authorize.apply( this.provider, arguments );
		}.bind( this ));
	},

	authorize: function( request ) {
		request.session.authRedirect = request.originalUrl;
		return this.provider.authorize.apply( this.provider, arguments );
	},

	error: function( request, response ) {
		response.send( 500 );
	},

	success: function( request, response, user ) {
		request.session.user = user;

		var redirect = request.authRedirect;
		delete request.authRedirect;

		if ( request.session.loginRedirect ) {
			redirect = request.session.loginRedirect;
			delete request.session.loginRedirect;
		}

		response.redirect( redirect );
	},

	registerUser: function( request, response, data ) {
		var app = this.app;

		app.user.create({
			username: data.login,
			email: data.email,
			name: data.name
		}, function( error, userId ) {
			if ( error ) {
				return app.auth.error( request, response, error );
			}

			app.user.get( userId, function( error, user ) {
				if ( error ) {
					return app.auth.error( request, response, error );
				}

				app.auth.success( request, response, user );
			});
		});
	}
});
