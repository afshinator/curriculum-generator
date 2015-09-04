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

		// for ( i=0 ; i < studentCount; i++ ) {
		for ( i=0 ; i < 5; i++ ) {
			processStudent( i );
		}
	},



	processStudent = function( whichStudent ) {
		var coursesCount = dataModel.numberOfCoursesInStudentsCurric( whichStudent ),
			obj = {},
			tempDomain,
			rankOfDomainInGrade;

console.log('before while ' + whichStudent );
console.log('coursesCount :' + coursesCount );
		while ( coursesCount < 5 ) {
			// 1. Find lowest grade student recieved & related domain in test results;
			// 	  use 1st one if same grade across multiple domains
			obj = dataModel.getLowestGradeAndDomainOfStudent( whichStudent ),
console.log(' obj ');
console.log( obj );
			// 2. Get the rank of the domain associated with the lowest score for that grade from domain_order file
			rankOfDomainInGrade = dataModel.getRankOfDomainInGrade( obj.domain, obj.grade );
console.log( 'rankOfDomainInGrade : ' + rankOfDomainInGrade );
			// For the domain associated with the students lowest score, and every domain in the order listed
			// in the domain_order file after that, do the following:
			while ( rankOfDomainInGrade <= dataModel.countOfDomainsInGrade( obj.grade ) && coursesCount < 5 ) {
				// Get the domain we're currently on;  same as obj.domain only the first time through loop
				tempDomain = dataModel.getNthDomainFromGrade( rankOfDomainInGrade, obj.grade );		// same as obj.domain only the first time through this loop

				// 3. If the test score for the domain we're currently at is the same as that lowest score we started this round on, 
				if ( dataModel.getTestGradeOfStudentForDomain( whichStudent, tempDomain ) === obj.grade ) {
					dataModel.addToCurriculum( whichStudent, tempDomain, obj.grade );				// Add it to this students curriculum
					dataModel.promoteGradeInProcessedGrades( whichStudent, tempDomain, obj.grade );		// Update internal data structure so we know we've done this grade.domain
					
					coursesCount++;
				}

				rankOfDomainInGrade++;
			}

		}
		console.log( dataModel.getStudentRecord( whichStudent ) );				
		console.log(' ---------------------------- ');		

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