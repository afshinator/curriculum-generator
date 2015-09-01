/* dataSource -- Where we get the data from

	In this case, from csv files.
 */

var verbose = false;					// true to output debugging info


var fs = require('fs');
var csv = require("fast-csv");		// Parses CSV files

module.exports = function () {

	var 

	parseCsvFromFile = function( src, successHandlerFx, whenDoneFx, firstRowIsHeaders ) {
		var stream = fs.createReadStream( src ),
			csvStream,
			options = {};

		// If the csv file's first row is headers for the columns, 
		if ( firstRowIsHeaders === true ) { 
			options.header = true;
		}

		csvStream = csv( options )
		    .on( "data", successHandlerFx )
		    .on( "end", function(){
		         if ( verbose ) { console.info( "dataSource finishing loading/parsing : " + src ); }
		         whenDoneFx();
			});
		 
		stream.pipe( csvStream );

	};

	return {
		parseCsvFromFile : parseCsvFromFile
	};

}();