module.exports = function( web ) {

var app = web.get( "debt" );

web.get( "/ticket/new", web.authorize, function( request, response ) {
	if ( !request.user.hasPermission( "TICKET:CREATE" ) ) {
		return response.send( 401 );
	}

	response.render( "ticket-new" );
});

web.post( "/ticket/new", web.authorize, function( request, response ) {
	if ( !request.user.hasPermission( "TICKET:CREATE" ) ) {
		return response.send( 401 );
	}

	// TODO: validation

	app.ticket.create({
		title: request.body.title,
		body: request.body.body,
		userId: request.user.id
	}, function( error, ticketId ) {
		if ( error ) {
			return response.send( 500 );
		}

		response.redirect( "/ticket/" + ticketId );
	});
});

web.get( "/ticket/:id", function( request, response ) {
	app.ticket.getInstance( request.params.id, function( error, ticket ) {
		if ( error ) {
			if ( error.code === "E_NOT_FOUND" ) {
				return response.send( 404 );
			}

			return response.send( 500 );
		}

		ticket.getComments(function( error, comments ) {
			if ( error ) {
				response.send( 500 );
			}

			ticket.comments = comments;
			response.render( "ticket-view", ticket );
		});
	});
});

};
