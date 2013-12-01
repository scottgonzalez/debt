var util = require( "../lib/util" );

exports.extend = {
	"empty objects": function( test ) {
		test.expect( 3 );

		var a = {};
		var b = {};
		var result = util.extend( a, b );

		test.strictEqual( result, a, "A should be returned." );
		test.deepEqual( a, {}, "A should be empty." );
		test.deepEqual( b, {}, "B should be empty." );
		test.done();
	},

	"varying values": function( test ) {
		test.expect( 3 );

		function one() {}
		function two() {}

		var a = {
			string: "s",
			number: 1,
			array: [ "a", "b", "c" ],
			object: {
				first: 1,
				second: "two"
			},
			fn: one
		};
		var b = {
			string: "string",
			number: 20,
			array: [ "apple", "banana" ],
			object: {
				first: 100,
				last: 999
			},
			fn2: two
		};
		var result = util.extend( a, b );

		test.strictEqual( result, a, "A should be returned." );
		test.deepEqual( a, {
			string: "string",
			number: 20,
			array: [ "apple", "banana" ],
			object: {
				first: 100,
				last: 999
			},
			fn: one,
			fn2: two
		}, "Objects should be merged." );
		test.deepEqual( b, {
			string: "string",
			number: 20,
			array: [ "apple", "banana" ],
			object: {
				first: 100,
				last: 999
			},
			fn2: two
		}, "B should not change." );
		test.done();
	}
};

exports.deepExtend = {
	"empty objects": function( test ) {
		test.expect( 3 );

		var a = {};
		var b = {};
		var result = util.deepExtend( a, b );

		test.strictEqual( result, a, "A should be returned." );
		test.deepEqual( a, {}, "A should be empty." );
		test.deepEqual( b, {}, "B should be empty." );
		test.done();
	},

	"varying values": function( test ) {
		test.expect( 3 );

		function one() {}
		function two() {}

		var a = {
			string: "s",
			number: 1,
			array: [ "a", "b", "c" ],
			object: {
				first: 1,
				second: "two"
			},
			fn: one
		};
		var b = {
			string: "string",
			number: 20,
			array: [ "apple", "banana" ],
			object: {
				first: 100,
				last: 999
			},
			fn2: two
		};
		var result = util.deepExtend( a, b );

		test.strictEqual( result, a, "A should be returned." );
		test.deepEqual( a, {
			string: "string",
			number: 20,
			array: [ "apple", "banana" ],
			object: {
				first: 100,
				second: "two",
				last: 999
			},
			fn: one,
			fn2: two
		}, "Objects should be merged." );
		test.deepEqual( b, {
			string: "string",
			number: 20,
			array: [ "apple", "banana" ],
			object: {
				first: 100,
				last: 999
			},
			fn2: two
		}, "B should not change." );
		test.done();
	}
};

exports.escapeHtml = {
	"no replacement": function( test ) {
		test.expect( 1 );

		var escaped = util.escapeHtml( "Hello, world!" );
		test.equal( escaped, "Hello, world!", "No characters should be escaped." );
		test.done();
	},

	"escape all bad characters": function( test ) {
		test.expect( 1 );

		var escaped = util.escapeHtml( "<name> says, \"Hello & goodbye, y'all!\"" );
		test.equal( escaped, "&lt;name&gt; says, &quot;Hello &amp; goodbye, y&#039;all!&quot;",
			"All bad characters should be replaced." );
		test.done();
	}
};
