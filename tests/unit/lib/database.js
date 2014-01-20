var Database = require( "../../../lib/database" );

exports.referenceError = {
	"no error": function( test ) {
		test.expect( 1 );

		test.strictEqual( Database.prototype.referenceError( new Error() ), null,
			"Should not treat generic error as a reference error." );
		test.done();
	},

	"reference error": function( test ) {
		test.expect( 1 );

		var error = new Error();
		error.code = "ER_NO_REFERENCED_ROW_";
		error.message = "Cannot add or update a child row: " +
			"a foreign key constraint fails (" +
				"`bug-tracker`.`comments`, " +
				"CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)" +
			")";

		test.strictEqual( Database.prototype.referenceError( error ), "userId",
			"Should parse field id out of reference error." );
		test.done();
	}
};
