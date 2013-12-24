var Group = require( "../../lib/group" ).Group;

exports.create = {
	setUp: function( done ) {
		this.app = {
			database: {}
		};
		this.group = new Group( this.app );
		done();
	},

	"missing name": function( test ) {
		test.expect( 1 );

		this.group.create({
			description: "A group of users."
		}, function( error ) {
			test.equal( error.message, "Missing required field `name`.",
				"Should throw for missing name." );
			test.done();
		});
	},

	"invalid name": function( test ) {
		test.expect( 1 );

		this.group.create({
			name: "debt collectors",
			description: "A group of users."
		}, function( error ) {
			test.equal( error.message, "Invalid `name`.",
				"Should throw for invalid name." );
			test.done();
		});
	},

	"database insertion error": function( test ){
		test.expect( 3 );

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"INSERT INTO `groups` SET " +
					"`name` = ?," +
					"`description` = ?",
				"Query should insert values into database." );
			test.deepEqual( values,
				[ "debt-collectors", "A group of users." ],
				"Should pass values for escaping." );

			process.nextTick(function() {
				callback( new Error( "database gone" ) );
			});
		};

		this.group.create({
			name: "debt-collectors",
			description: "A group of users."
		}, function( error ) {
			test.equal( error.message, "database gone", "Should pass the error." );
			test.done();
		});
	},

	"valid": function( test ){
		test.expect( 4 );

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"INSERT INTO `groups` SET " +
					"`name` = ?," +
					"`description` = ?",
				"Query should insert values into database." );
			test.deepEqual( values,
				[ "debt-collectors", "A group of users." ],
				"Should pass values for escaping." );

			process.nextTick(function() {
				callback( null, { insertId: 99 } );
			});
		};

		this.group.create({
			name: "debt-collectors",
			description: "A group of users."
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
		this.group = new Group( this.app );
		done();
	},

	"missing id": function( test ) {
		test.expect( 1 );

		this.group.get( null, function( error ) {
			test.equal( error.message, "Missing required parameter `id`.",
				"Should throw for missing id." );
			test.done();
		});
	},

	"database query error": function( test ) {
		test.expect( 3 );

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"SELECT * FROM `groups` WHERE `id` = ?",
				"Query should search by id." );
			test.deepEqual( values, [ 37 ], "Should pass values for escaping." );

			process.nextTick(function() {
				callback( new Error( "database gone" ) );
			});
		};

		this.group.get( 37, function( error ) {
			test.equal( error.message, "database gone", "Should pass the error." );
			test.done();
		});
	},

	"valid": function( test ) {
		test.expect( 4 );

		var providedGroup = {
			id: 37,
			name: "debt-collector",
			description: "A group of users."
		};

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"SELECT * FROM `groups` WHERE `id` = ?",
				"Query should search by id." );
			test.deepEqual( values, [ 37 ], "Should pass values for escaping." );

			process.nextTick(function() {
				callback( null, [ providedGroup ] );
			});
		};

		this.group.get( 37, function( error, group ) {
			test.equal( error, null, "Should not pass an error." );
			test.strictEqual( group, providedGroup, "Should pass group." );
			test.done();
		});
	}
};

exports.getByName = {
	setUp: function( done ) {
		this.app = {
			database: {}
		};
		this.group = new Group( this.app );
		done();
	},

	"missing name": function( test ) {
		test.expect( 1 );

		this.group.getByName( null, function( error ) {
			test.equal( error.message, "Missing required parameter `name`.",
				"Should throw for missing name." );
			test.done();
		});
	},

	"database query error": function( test ) {
		test.expect( 3 );

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"SELECT * FROM `groups` WHERE `name` = ?",
				"Query should search by name." );
			test.deepEqual( values, [ "debt-collector" ],
				"Should pass values for escaping." );

			process.nextTick(function() {
				callback( new Error( "database gone" ) );
			});
		};

		this.group.getByName( "debt-collector", function( error ) {
			test.equal( error.message, "database gone", "Should pass the error." );
			test.done();
		});
	},

	"valid": function( test ) {
		test.expect( 4 );

		var providedGroup = {
			id: 37,
			name: "debt-collector",
			description: "A group of users."
		};

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"SELECT * FROM `groups` WHERE `name` = ?",
				"Query should search by name." );
			test.deepEqual( values, [ "debt-collector" ],
				"Should pass values for escaping." );

			process.nextTick(function() {
				callback( null, [ providedGroup ] );
			});
		};

		this.group.getByName( "debt-collector", function( error, group ) {
			test.equal( error, null, "Should not pass an error." );
			test.strictEqual( group, providedGroup, "Should pass group." );
			test.done();
		});
	}
};
