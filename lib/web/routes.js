module.exports = function( web ) {

web.get( "/", function( request, response ) {
	response.render( "home" );
});

};
