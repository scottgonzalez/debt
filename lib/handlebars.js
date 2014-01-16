var hbs = require( "hbs" );
var handlebars = require( "handlebars" );
var moment = require( "moment" );
var util = require( "./util" );

hbs.handlebars = handlebars;

handlebars.registerHelper( "not", function( value ) {
	return !value;
});

handlebars.registerHelper( "equal", function ( a, b ) {
	if ( a != null ) {
		a = a.valueOf();
	}
	if ( b != null ) {
		b = b.valueOf();
	}

	return a === b;
});

handlebars.registerHelper( "timeSince", function( date ) {
	return new handlebars.SafeString(
		util.htmlTag( "span", { title: date.toString() } ) +
			moment( date ).fromNow() +
		"</span>"
	);
});

handlebars.registerHelper( "ticketLink", function( id ) {
	return new handlebars.SafeString(
		util.htmlTag( "a", { href: "/ticket/" + id } ) +
			"#" + id +
		"</a>"
	);
});

handlebars.registerHelper( "userLink", function( user ) {
	return new handlebars.SafeString(
		util.htmlTag( "a", { href: "/user/" + user.username } ) +
			user.username +
		"</a>"
	);
});
