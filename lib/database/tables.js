var async = require( "async" );
var util = require( "../util" );

// TODO: Add foreign keys

module.exports = function( Database ) {

util.extend( Database.prototype, {
	createTables: function( callback ) {
		async.parallel([
			this.createTicketsTable.bind( this ),
			this.createFieldsTable.bind( this ),
			this.createTicketFieldsTable.bind( this ),
			this.createCommentsTable.bind( this )
		], callback );
	},

	createTicketsTable: function( callback ) {
		this.query(
			"CREATE TABLE `tickets` (" +
				"`id` INT AUTO_INCREMENT PRIMARY KEY," +
				"`title` VARCHAR(255) NOT NULL," +
				"`body` TEXT," +
				"`userId` INT NOT NULL," +
				"`created` TIMESTAMP NOT NULL DEFAULT NOW()," +
				"`edited` TIMESTAMP NOT NULL" +
			") ENGINE=InnoDB DEFAULT CHARSET=utf8", callback );
	},

	createFieldsTable: function( callback ) {
		this.query(
			"CREATE TABLE `fields` (" +
				"`id` INT AUTO_INCREMENT PRIMARY KEY," +
				"`type` INT NOT NULL," +
				"`label` VARCHAR(255) NOT NULL," +
				"`settings` TEXT" +
			") ENGINE=InnoDB DEFAULT CHARSET=utf8", callback );
	},

	createTicketFieldsTable: function( callback ) {
		this.query(
			"CREATE TABLE `ticketFields` (" +
				"`ticketId` INT NOT NULL," +
				"`fieldId` INT NOT NULL," +
				"`value` VARCHAR(255) NOT NULL," +
				"INDEX `ticket` (`ticketId`)," +
				"INDEX `field_value` (`fieldId`, `value`)" +
			") ENGINE=InnoDB DEFAULT CHARSET=utf8", callback );
	},

	createCommentsTable: function( callback ) {
		this.query(
			"CREATE TABLE `comments` (" +
				"`id` INT AUTO_INCREMENT PRIMARY KEY," +
				"`ticketId` INT NOT NULL," +
				"`userId` INT NOT NULL," +
				"`body` TEXT NOT NULL," +
				"INDEX `ticket` (`ticketId`)" +
			") ENGINE=InnoDB DEFAULT CHARSET=utf8", callback );
	}
});

};
