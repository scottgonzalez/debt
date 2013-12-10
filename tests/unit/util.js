var util = require( "../../lib/util" );

exports.delay = {
	"no parameters": function( test ) {
		test.expect( 2 );

		var async = false;
		util.delay(function() {
			test.equal( arguments.length, 0, "No arguments should be passed." );
			test.ok( async, "Should be async." );
			test.done();
		});
		async = true;
	},

	"with parameters": function( test ) {
		test.expect( 3 );

		var providedParams = [ {}, {} ];
		var async = false;
		util.delay(function( a, b ) {
			test.equal( arguments.length, 2, "Should pass argumenets." );
			test.strictEqual( a, providedParams[ 0 ], "Should pass first parameter." );
			test.strictEqual( b, providedParams[ 1 ], "Should pass second parameter." );
			test.done();
		}, providedParams[ 0 ], providedParams[ 1 ] );
		async = true;
	}
};

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

exports.htmlTag = {
	"no attributes": function( test ) {
		test.expect( 1 );

		var html = util.htmlTag( "blink" );
		test.equal( html, "<blink>", "Should produce just the tag with no attributes." );
		test.done();
	},

	"empty attributes": function( test ) {
		test.expect( 1 );

		var html = util.htmlTag( "blink", {} );
		test.equal( html, "<blink>", "Should produce just the tag with no attributes." );
		test.done();
	},

	"with attributes": function( test ) {
		test.expect( 1 );

		var html = util.htmlTag( "a", {
			href: "/",
			title: "5 > 2"
		});
		test.equal( html, "<a href='/' title='5 &gt; 2'>", "Should contain escaped attributes." );
		test.done();
	},

	"boolean attributes": function( test ) {
		test.expect( 1 );

		var html = util.htmlTag( "input", {
			type: "checkbox",
			checked: true,
			disabled: false
		});
		test.equal( html, "<input type='checkbox' checked='checked'>",
			"Should contain expanded checked and no disabled." );
		test.done();
	}
};
