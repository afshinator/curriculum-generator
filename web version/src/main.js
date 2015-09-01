var curriculumGenerator = ( function ($, my) {

	// Things that are globally accessible to the whole app like constants
	my.globals = {
		domainOrderFile : 'data/domain_order.csv',
		studentTestResultsFile: 'data/student_tests.csv'
	};


	var loadFile = function( filename, successHandler ) {
		var request = $.ajax({
			type: "GET",
			url: filename,
			isLocal: true,
			dataType: "text",
			// success: function(data) { successHandler( data ); }
		})
		.done( function( data ) {
			alert( "success" );
			successHandler( data );
		})
		.fail( function( jqXHR, textStatus, errThrown) {
			alert( "Request failed: " + textStatus + ',' + errThrown );
		})
		.always( function() {
			alert( "complete" );
		});
	};

	loadFile( my.globals.domainOrderFile, function(data) { console.log( data ); });

	return my;
}( jQuery, curriculumGenerator || {} ) );