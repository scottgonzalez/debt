module.exports = function( web ) {

var app = web.get( "debt" );

// Redirect all /ticket/ URLs to /tickets/
web.get( /^\/ticket\/(.+)/, function( request, response ) {
	response.redirect( 301, "/tickets/" + request.params[ 0 ] );
});

web.get( "/tickets/new", web.authorize, function( request, response ) {
	if ( !request.user || !request.user.hasPermission( "TICKET:CREATE" ) ) {
		return response.send( 401 );
	}

	response.render( "ticket-new" );
});

web.post( "/tickets", web.authorize, function( request, response ) {
	if ( !request.user || !request.user.hasPermission( "TICKET:CREATE" ) ) {
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

		response.redirect( "/tickets/" + ticketId );
	});
});

web.get( "/tickets/:id", function( request, response ) {
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

web.post( "/tickets/:ticketId/comments", function( request, response ) {
	if ( !request.user || !request.user.hasPermission( "TICKET:CREATE" ) ) {
		return response.send( 401 );
	}

	// TODO: validation

	var ticketId = request.params.ticketId;
	app.comment.create({
		ticketId: ticketId,
		body: request.body.body,
		userId: request.user.id
	}, function( error, commentId ) {
		if ( error ) {
			return response.send( 500 );
		}

		response.redirect( "/tickets/" + ticketId + "#comment-" + commentId );
	});
});

};
