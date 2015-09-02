// Run me!

var dataSource = require( './src/dataSource.js' ),
	dataModel = require( './src/dataModel.js' ),

	verbose = 0 ;			// Debug output level, 0 == off, 


module.exports = function () {

	var defaultDataFilePath = './data',
		defaultDomainOrderFilePath = defaultDataFilePath + '/domain_order.csv',
		defaultStudentTestsFilePath = defaultDataFilePath + '/student_tests.csv',

		file_domainOrder,
		file_studentTests,

		domainOrder = [],
		studentTests = [],


	// Callback sent to dataSource to deal with successfull reading in of domain_order data
	processDomainOrderData = function( data ) {
		domainOrder.push( data );
	},

	// Callback sent to dataSource to deal with succesful reading in of student_tests data
	processStudentTestsData = function( data ) {
		studentTests.push( data );
	},


	// First thing app has to do:  read in data_model & student_tests files
	getFiles = function() {
		var whenDoneWithDomainOrder = function() {
				dataSource.parseCsvFromFile( file_studentTests, processStudentTestsData, whenDoneWithStudentTests, true );
			}, 
			whenDoneWithStudentTests = function() {
				afterGettingFiles();
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


	// TODO: bad function name, change this
	processAllStudents = function() {
		var i,
			studentCount = dataModel.studentTestScoresCount();

		console.log( 'Total Students: ' + studentCount );

		for ( i=0 ; i < studentCount; i++ ) {
			processStudent( i );
		}
	},


	processStudent = function( which ) {
		var record = dataModel.getStudentRecord( which ),
			obj = dataModel.getLowestGradeAndDomainOfStudent( which ),
			tempDomain;

		var rankOfDomainInGrade = dataModel.getRankOfDomainInGrade( obj.domain, obj.grade );

		while ( rankOfDomainInGrade <= dataModel.countOfDomainsInGrade( obj.grade ) ) {
			tempDomain = dataModel.getNthDomainFromGrade( rankOfDomainInGrade, obj.grade );
			if ( dataModel.getTestGradeOfStudentForDomain( which, tempDomain ) === obj.grade ) {
				dataModel.addToCurriculum( which, tempDomain, obj.grade );
				// todo: update processed data
			}
			rankOfDomainInGrade++;
		}


		console.log( record, obj, dataModel.countOfDomainsInGrade( obj.grade ), rankOfDomainInGrade );
	},


	// Will get invoked by getFiles() after both the domain_order and student_tests are read in.
	// Tells the dataModel module to process the data, get it ready,
	// 
	afterGettingFiles = function() {
		if ( verbose > 1 ) {
			console.log( domainOrder );
			console.log( studentTests );
		}

		dataModel.init( domainOrder, studentTests );

		processAllStudents();
	},


	run_App = function() {
		getFiles( domainOrder, studentTests );
	}();


	return {
		file_domainOrder : file_domainOrder,
		file_studentTests : file_studentTests
	};

}();