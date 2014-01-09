var Permission = require( "../../../lib/permission" ).Permission;

exports.register = {
	setUp: function( done ) {
		this.app = {
			database: {}
		};
		this.permission = new Permission( this.app );
		done();
	},

	"native permissions": function( test ) {
		test.expect( 1 );

		test.deepEqual( this.permission.permissions, {
			DEBT: [ "ADMIN" ],
			TICKET: [ "ADMIN", "CREATE", "EDIT", "DELETE" ],
			GROUP: [ "ADMIN", "CREATE", "DELETE" ],
			PERMISSION: [ "ADMIN", "GRANT", "REVOKE" ]
		}, "Should have all native permissions" );
		test.done();
	},

	"missing component": function( test ) {
		test.expect( 4 );

		test.throws(
			function() {
				this.permission.register( null, "CREATE" );
			}.bind( this ),
			function( error ) {
				test.equal( error.message,
					"E_MISSING_DATA: Missing required parameter `component`." );
				test.equal( error.code, "E_MISSING_DATA" );
				test.equal( error.field, "component", "Should pass field name with error." );
				return true;
			},
			"Should throw for missing component."
		);
		test.done();
	},

	"invalid component": function( test ) {
		test.expect( 5 );

		test.throws(
			function() {
				this.permission.register( "test component", "CREATE" );
			}.bind( this ),
			function( error ) {
				test.equal( error.message,
					"E_INVALID_DATA: Invalid `component` (test component)." );
				test.equal( error.code, "E_INVALID_DATA" );
				test.equal( error.field, "component", "Should pass field name with error." );
				test.equal( error.component, "test component",
					"Should pass component with error." );
				return true;
			},
			"Should throw for invalid component."
		);
		test.done();
	},

	"missing action": function( test ) {
		test.expect( 4 );

		test.throws(
			function() {
				this.permission.register( "TEST-COMPONENT", null );
			}.bind( this ),
			function( error ) {
				test.equal( error.message,
					"E_MISSING_DATA: Missing required parameter `action`." );
				test.equal( error.code, "E_MISSING_DATA" );
				test.equal( error.field, "action", "Should pass field name with error." );
				return true;
			},
			"Should throw for missing action."
		);
		test.done();
	},

	"invalid action": function( test ) {
		test.expect( 5 );

		test.throws(
			function() {
				this.permission.register( "TEST-COMPONENT", "test action" );
			}.bind( this ),
			function( error ) {
				test.equal( error.message,
					"E_INVALID_DATA: Invalid `action` (test action)." );
				test.equal( error.code, "E_INVALID_DATA" );
				test.equal( error.field, "action", "Should pass field name with error." );
				test.equal( error.action, "test action", "Should pass action with error." );
				return true;
			},
			"Should throw for invalid action."
		);
		test.done();
	},

	"registration": function( test ) {
		test.expect( 2 );

		this.permission.register( "TEST-COMPONENT", "TEST-ACTION" );
		test.deepEqual( this.permission.permissions[ "TEST-COMPONENT" ],
			[ "ADMIN", "TEST-ACTION" ],
			"Action should be added, along with ADMIN action." );

		this.permission.register( "TEST-COMPONENT", "OTHER-ACTION" );
		test.deepEqual( this.permission.permissions[ "TEST-COMPONENT" ],
			[ "ADMIN", "TEST-ACTION", "OTHER-ACTION" ],
			"Action should be added to existing actions." );

		test.done();
	}
};

exports.grantToUser = {
	setUp: function( done ) {
		this.app = {
			database: {}
		};
		this.permission = new Permission( this.app );
		done();
	},

	"missing userId": function( test ) {
		test.expect( 3 );

		this.permission.grantToUser( null, "TICKET:CREATE", function( error ) {
			test.equal( error.message, "E_MISSING_DATA: Missing required parameter `userId`.",
				"Should throw for missing userId." );
			test.equal( error.code, "E_MISSING_DATA" );
			test.equal( error.field, "userId", "Should pass field name with error." );
			test.done();
		});
	},

	"missing permission": function( test ) {
		test.expect( 3 );

		this.permission.grantToUser( 37, null, function( error ) {
			test.equal( error.message, "E_MISSING_DATA: Missing required parameter `permission`.",
				"Should throw for missing permission." );
			test.equal( error.code, "E_MISSING_DATA" );
			test.equal( error.field, "permission", "Should pass field name with error." );
			test.done();
		});
	},

	"grant error": function( test ) {
		test.expect( 4 );

		this.permission._grant = function( type, id, permissions, callback ) {
			test.equal( type, "user", "Should set correct type." );
			test.equal( id, 37, "Should pass userId." );
			test.deepEqual( permissions, [ "TICKET:CREATE" ], "Should pass permissions." );

			process.nextTick(function() {
				callback( new Error( "some error" ) );
			});
		};

		this.permission.grantToUser( 37, "TICKET:CREATE", function( error ) {
			test.equal( error.message, "some error", "Should pass the error." );
			test.done();
		});
	},

	"valid": function( test ) {
		test.expect( 4 );

		this.permission._grant = function( type, id, permissions, callback ) {
			test.equal( type, "user", "Should set correct type." );
			test.equal( id, 37, "Should pass userId." );
			test.deepEqual( permissions, [ "TICKET:CREATE" ], "Should pass permissions." );

			process.nextTick(function() {
				callback( null );
			});
		};

		this.permission.grantToUser( 37, "TICKET:CREATE", function( error ) {
			test.equal( error, null, "Should not pass an error." );
			test.done();
		});
	}
};

exports.grantToGroup = {
	setUp: function( done ) {
		this.app = {
			database: {}
		};
		this.permission = new Permission( this.app );
		done();
	},

	"missing userId": function( test ) {
		test.expect( 3 );

		this.permission.grantToGroup( null, "TICKET:CREATE", function( error ) {
			test.equal( error.message, "E_MISSING_DATA: Missing required parameter `groupId`.",
				"Should throw for missing groupId." );
			test.equal( error.code, "E_MISSING_DATA" );
			test.equal( error.field, "groupId", "Should pass field name with error." );
			test.done();
		});
	},

	"missing permission": function( test ) {
		test.expect( 3 );

		this.permission.grantToGroup( 37, null, function( error ) {
			test.equal( error.message, "E_MISSING_DATA: Missing required parameter `permission`.",
				"Should throw for missing permission." );
			test.equal( error.code, "E_MISSING_DATA" );
			test.equal( error.field, "permission", "Should pass field name with error." );
			test.done();
		});
	},

	"grant error": function( test ) {
		test.expect( 4 );

		this.permission._grant = function( type, id, permissions, callback ) {
			test.equal( type, "group", "Should set correct type." );
			test.equal( id, 37, "Should pass groupId." );
			test.deepEqual( permissions, [ "TICKET:CREATE" ], "Should pass permissions." );

			process.nextTick(function() {
				callback( new Error( "some error" ) );
			});
		};

		this.permission.grantToGroup( 37, "TICKET:CREATE", function( error ) {
			test.equal( error.message, "some error", "Should pass the error." );
			test.done();
		});
	},

	"valid": function( test ) {
		test.expect( 4 );

		this.permission._grant = function( type, id, permissions, callback ) {
			test.equal( type, "group", "Should set correct type." );
			test.equal( id, 37, "Should pass userId." );
			test.deepEqual( permissions, [ "TICKET:CREATE" ], "Should pass permissions." );

			process.nextTick(function() {
				callback( null );
			});
		};

		this.permission.grantToGroup( 37, "TICKET:CREATE", function( error ) {
			test.equal( error, null, "Should not pass an error." );
			test.done();
		});
	}
};

exports._validPermission = {
	setUp: function( done ) {
		this.app = {
			database: {}
		};
		this.permission = new Permission( this.app );
		done();
	},

	"invalid": function( test ) {
		test.expect( 2 );

		test.equal( this.permission._validPermission( "TEST-COMPONENT:CREATE" ), false,
			"Invalid component." );
		test.equal( this.permission._validPermission( "TICKET:TEST-ACTION" ), false,
			"Invalid action." );
		test.done();
	},

	"valid": function( test ) {
		test.expect( 1 );

		test.equal( this.permission._validPermission( "TICKET:CREATE" ), true );
		test.done();
	}
};

exports._grant = {
	setUp: function( done ) {
		this.app = {
			database: {}
		};
		this.permission = new Permission( this.app );
		done();
	},

	"invalid permission": function( test ) {
		test.expect( 4 );

		this.permission._grant( "user", 37, [ "+" ], function( error ) {
			test.equal( error.message, "E_INVALID_DATA: Invalid permission (+).",
				"Should throw for invalid permission." );
			test.equal( error.code, "E_INVALID_DATA" );
			test.equal( error.field, "permission", "Should pass field name with error." );
			test.equal( error.permission, "+", "Should pass permission with error." );
			test.done();
		});
	},

	"database error": function( test ) {
		test.expect( 3 );

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"INSERT INTO `userPermissions` (`userId`, `permission`) VALUES " +
					"(?, ?)",
				"Query should insert values into database." );
			test.deepEqual( values, [ 37, "TICKET:CREATE" ],
				"Should pass values for escaping." );

			process.nextTick(function() {
				callback( new Error( "database gone" ) );
			});
		};

		this.permission._grant( "user", 37, [ "TICKET:CREATE" ], function( error ) {
			test.equal( error.message, "database gone", "Should pass the error." );
			test.done();
		});
	},

	"single permission": function( test ) {
		test.expect( 3 );

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"INSERT INTO `userPermissions` (`userId`, `permission`) VALUES " +
					"(?, ?)",
				"Query should insert values into database." );
			test.deepEqual( values, [ 37, "TICKET:CREATE" ],
				"Should pass values for escaping." );

			process.nextTick(function() {
				callback( null );
			});
		};

		this.permission._grant( "user", 37, [ "TICKET:CREATE" ], function( error ) {
			test.equal( error, null, "Should not pass an error." );
			test.done();
		});
	},

	"multiple permissions": function( test ) {
		test.expect( 3 );

		this.app.database.query = function( query, values, callback ) {
			test.equal( query,
				"INSERT INTO `userPermissions` (`userId`, `permission`) VALUES " +
					"(?, ?)," +
					"(?, ?)," +
					"(?, ?)",
				"Query should insert values into database." );
			test.deepEqual( values,
				[ 37, "TICKET:CREATE", 37, "TICKET:DELETE", 37, "GROUP:CREATE" ],
				"Should pass values for escaping." );

			process.nextTick(function() {
				callback( null );
			});
		};

		this.permission._grant( "user", 37,
			[ "TICKET:CREATE", "TICKET:DELETE", "GROUP:CREATE" ],
		function( error ) {
			test.equal( error, null, "Should not pass an error." );
			test.done();
		});
	}
};
