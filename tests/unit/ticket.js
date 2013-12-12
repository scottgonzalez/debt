var Ticket = require( "../../lib/ticket" ).Ticket;

exports.create = {
	setUp: function( done ) {
		this.app = {
			database: {}
		};
		this.ticket = new Ticket( this.app );
		done();
	},

	"missing title": function( test ) {
		test.expect( 1 );

		this.ticket.create({
			body: "some description",
			userId: 37
		}, function( error ) {
			test.equal( error.message, "Missing required field `title`.",
				"Should throw for missing title." );
			test.done();
		});
	},

	"missing userId": function( test ) {
		test.expect( 1 );

		this.ticket.create({
			title: "my ticket",
			body: "some description"
		}, function( error ) {
			test.equal( error.message, "Missing required field `userId`.",
				"Should throw for missing userId." );
			test.done();
		});
	},

	"database insertion error": function( test ){
		test.expect( 3 );

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"INSERT INTO `tickets` SET " +
					"`title` = ?," +
					"`body` = ?," +
					"`userId` = ?," +
					"`created` = NOW()," +
					"`edited` = NOW()",
				"Query should insert values into database." );
			test.deepEqual( values, [ "my ticket", "some description", 37 ],
				"Should pass values for escaping." );

			process.nextTick(function() {
				callback( new Error( "database gone" ) );
			});
		};

		this.ticket.create({
			title: "my ticket",
			body: "some description",
			userId: 37
		}, function( error ) {
			test.equal( error.message, "database gone", "Should pass the error." );
			test.done();
		});
	},

	"minimal": function( test ) {
		test.expect( 4 );

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"INSERT INTO `tickets` SET " +
					"`title` = ?," +
					"`body` = ?," +
					"`userId` = ?," +
					"`created` = NOW()," +
					"`edited` = NOW()",
				"Query should insert values into database." );
			test.deepEqual( values, [ "my ticket", "some description", 37 ],
				"Should pass values for escaping." );

			process.nextTick(function() {
				callback( null, { insertId: 99 } );
			});
		};

		this.ticket.create({
			title: "my ticket",
			body: "some description",
			userId: 37
		}, function( error, id ) {
			test.equal( error, null, "Should not pass an error." );
			test.equal( id, 99, "Should return inserted id." );
			test.done();
		});
	},

	"with created": function( test ) {
		test.expect( 5 );

		this.app.database.escape = function( value ) {
			test.deepEqual( value, new Date( "Mon Nov 4 2013 11:01:54 -0500" ),
				"Should escape created value" );

			return "'escaped date'";
		};

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"INSERT INTO `tickets` SET " +
					"`title` = ?," +
					"`body` = ?," +
					"`userId` = ?," +
					"`created` = 'escaped date'," +
					"`edited` = NOW()",
				"Query should insert values into database." );
			test.deepEqual( values, [ "my ticket", "some description", 37 ],
				"Should pass values for escaping." );

			process.nextTick(function() {
				callback( null, { insertId: 99 } );
			});
		};

		this.ticket.create({
			title: "my ticket",
			body: "some description",
			userId: 37,
			created: new Date( "Mon Nov 4 2013 11:01:54 -0500" )
		}, function( error, id ) {
			test.equal( error, null, "Should not pass an error." );
			test.equal( id, 99, "Should return inserted id." );
			test.done();
		});
	}
};

exports.get = {
	setUp: function( done ) {
		this.app = {
			database: {}
		};
		this.ticket = new Ticket( this.app );
		done();
	},

	"missing id": function( test ) {
		test.expect( 1 );

		this.ticket.get( null, function( error) {
			test.equal( error.message, "Missing required parameter `id`.",
				"Should throw for missing id." );
			test.done();
		});
	},

	"valid": function( test ) {
		test.expect( 4 );

		var providedTicket = {
			id: 37,
			title: "my ticket",
			body: "some description",
			created: new Date( "Mon Nov 4 2013 11:01:54 -0500" ),
			edited: new Date( "Mon Dec 9 2013 20:56:17 -0500" )
		};

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"SELECT * FROM `tickets` WHERE `id` = ?",
				"Query should select values by id." );
			test.deepEqual( values, [ 37 ],
				"Should pass values for escaping." );

			process.nextTick(function() {
				callback( null, [ providedTicket ] );
			});
		};

		this.ticket.get( 37, function( error, ticket ) {
			test.equal( error, null, "Should not pass an error." );
			test.strictEqual( ticket, providedTicket, "Should pass ticket." );
			test.done();
		});
	}
};
