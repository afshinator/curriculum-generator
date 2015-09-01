// Run me!

var dataSource = require( './src/dataSource.js' ),
	dataModel = require( './src/dataModel.js' ),

	verbose = 1 ;			// Debug output level, 0 == off, 


module.exports = function () {

	var defaultDataFilePath = './data',
		defaultDomainOrderFilePath = defaultDataFilePath + '/domain_order.csv',
		defaultStudentTestsFilePath = defaultDataFilePath + '/student_tests.csv',

		file_domainOrder,
		file_studentTests,

		domainOrder = [],
		studentTests = [],


	processDomainOrderData = function( data ) {
		domainOrder.push( data );
	},

	processStudentTestsData = function( data ) {
		studentTests.push( data );
	},

	getFiles = function() {
		var whenDoneWithDomainOrder = function() {
				dataSource.parseCsvFromFile( file_studentTests, processStudentTestsData, whenDoneWithStudentTests, true );
			}, 
			whenDoneWithStudentTests = function() {
				doneGettingFiles();
			};

		if ( process.argv.length < 3 ){				// No command line args, use default filenames
			file_domainOrder = defaultDomainOrderFilePath;
			file_studentTests = defaultStudentTestsFilePath;
		}
		else {
			file_domainOrder = process.argv[2];
			file_studentTests = process.argv.length > 3 ? process.argv[3] : defaultStudentTestsFilePath;
		}
	
		dataSource.parseCsvFromFile( file_domainOrder, processDomainOrderData, whenDoneWithDomainOrder );
	},


	doneGettingFiles = function() {
		if ( verbose > 1 ) {
			console.log( domainOrder );
			console.log( studentTests );
		}

		dataModel.init( domainOrder, studentTests );
	},

	run_App = function() {
		getFiles( domainOrder, studentTests );
	}();


	return {
		file_domainOrder : file_domainOrder,
		file_studentTests : file_studentTests
	};

}();