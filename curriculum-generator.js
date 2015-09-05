// Run me!

var dataSource = require( './src/dataSource.js' ),
	gradeDomains = require( './src/gradeDomains.js' ),
	studentScores = require( './src/studentScores.js' ),

	verbose = 0,					// Debug output level, 0 == off, 
	MAX_COURSES_TO_GENERATE = 5;	// How many courses to generate per student


module.exports = function () {

	var defaultDataFilePath = './data',
		defaultDomainOrderFilePath = defaultDataFilePath + '/domain_order.csv',
		defaultStudentTestsFilePath = defaultDataFilePath + '/student_tests.csv',

		fileName_domainOrder,		// Final filename/path to use for domain_order.csv file
		fileName_studentTests,		// Final filename/path to use for student_test.csv file

		rawDomainOrderData = [],			// unprocessed file data
		rawStudentTestsData = [],



	// If command line has args, use them for filename/path of domain_name & student_tests, return count of command line args;
	// else use default filenames and return 0.
	processCommandLineOptions = function() {
		if ( process.argv.length < 3 ){				// No command line args, use default filenames
			fileName_domainOrder = defaultDomainOrderFilePath;
			fileName_studentTests = defaultStudentTestsFilePath;
			return 0;
		}
		else {
			fileName_domainOrder = process.argv[2];
			fileName_studentTests = process.argv.length > 3 ? process.argv[3] : defaultStudentTestsFilePath;
			return argv.length;
		}
	},


	// First thing app has to do:  read in data_model & student_tests files
	getFiles = function() {
		var // Callback sent to dataSource to deal with successfull reading in of domain_order data
			processDomainOrderData = function( data ) {
				rawDomainOrderData.push( data );
			},
			// Callback sent to dataSource to deal with succesful reading in of student_tests data
			processStudentTestsData = function( data ) {
				rawStudentTestsData.push( data );
			},
			whenDoneWithDomainOrder = function() {
				dataSource.parseCsvFromFile( fileName_studentTests, processStudentTestsData, whenDoneWithStudentTests, true );
			}, 
			whenDoneWithStudentTests = function() {
				afterGettingFiles();
			};

		processCommandLineOptions();		// Command line can indicate non-default filenames/path for use

		dataSource.parseCsvFromFile( fileName_domainOrder, processDomainOrderData, whenDoneWithDomainOrder );
	},


	// Will get invoked by getFiles() after both the domain_order and student_tests are read in.
	// Tells the dataModel module to process the data, get it ready,
	afterGettingFiles = function() {
		if ( verbose > 2 ) {
			console.log( rawDomainOrderData );
			console.log( rawStudentTestsData );
		}

		gradeDomains.init( rawDomainOrderData );
		studentScores.init( rawStudentTestsData );

		// dataModel.init( rawDomainOrderData, rawStudentTestsData );

		processAllStudents();
	},


	processAllStudents = function() {
		if ( verbose > 1 ) { console.log( 'Going to process ' + studentScores.studentCount() + ' students.' ); }

		for ( var i = 0; i < studentScores.studentCount(); i++ ) {
		// for ( var i = 0; i < 7; i++ ) {			
			generateInitialStudentCurriculum( i, MAX_COURSES_TO_GENERATE );
			sortCurriculumByDomaingOrdering( i );
			showStudentsCurriculum( i );
		}
	},


	generateInitialStudentCurriculum = function( whichStudent, maxCourses ) {
		var lowestScoreObj = {},
			coursesInStudentCurric = studentScores.studentCurric( whichStudent ).length,
			domainRank,
			domainIndex,
			grade,
			domain, score;

		// console.log( coursesInStudentCurric + ' courses for student id ' + whichStudent );

		while (  coursesInStudentCurric < maxCourses ) {
			lowestScoreObj = studentScores.getDataForLowestScoreFromProcessedResults( whichStudent );

			if ( verbose > 2 ) console.log( lowestScoreObj, whichStudent, studentScores.studentName( whichStudent) );

			grade = lowestScoreObj.score;

			// domain of the lowest score
			domainIndex = gradeDomains.domainIndexForGrade( grade, lowestScoreObj.domain );   // undefined if domain not in grade

			// console.log( studentScores.studentName( whichStudent) + ' domainIndex : ' + domainIndex + ' for ' + lowestScoreObj.domain + ' in ' + grade + ' grade ');

			if ( domainIndex !== undefined ) {
				while ( domainIndex <= gradeDomains.domainsInGradeCount( grade ) && coursesInStudentCurric < maxCourses ) {
					domain = gradeDomains.nthDomainInGrade( grade, domainIndex );
					score = studentScores.studentScoreForDomain( whichStudent, domain );
								// console.log( 'On domain ' + domain + ' with score ' + score );
					if ( score === grade ) {
						studentScores.addToCurriculum( whichStudent, domain, grade );
						studentScores.promoteScoreInProcessedResults( whichStudent, domain );
					}

					domainIndex++;
					coursesInStudentCurric = studentScores.studentCurric( whichStudent ).length;
				}
			} else {
				studentScores.promoteScoreInProcessedResults( whichStudent, lowestScoreObj.domain  );
			}

			// console.log( getRecord( whichStudent ) );
		}
		if ( verbose > 1 ) { console.log( getRecord( whichStudent ) ); }
	},



	sortCurriculumByDomaingOrdering = function( whichStudent ) {
		var tempCurric = [],
			currentCurric = studentScores.studentCurric( whichStudent ),
			gradeIterator = 0;

		for ( var i = 0; i < 7; i++ ) {
			gradeIterator = ( i === 0 ) ? 'K' : ( i + '' );

			for ( var j = 0; j < gradeDomains.domainsInGradeCount( gradeIterator ); j++ ) {
				domainToLookFor = gradeDomains.nthDomainInGrade( gradeIterator, j + 1 );
				curricElement = gradeIterator + '.' + domainToLookFor;

				if ( verbose > 2 ) console.log( ' Looking for ' + curricElement + ' compared to ' + currentCurric[i] );

				for ( k = 0 ; k < currentCurric.length; k++ ) { 
					if ( curricElement === currentCurric[ k ] ) {
						tempCurric.push( curricElement );
					}
				}

			}
		}

		studentScores.setCurricForStudent( whichStudent, tempCurric );

		if ( verbose  ) {
			console.log( '-->' );
			console.log( tempCurric );
			console.log();
		}
	},


	showStudentsCurriculum = function( whichStudent ) {
		var currentCurric = studentScores.studentCurric( whichStudent ),
			outputStr = '';

		outputStr = studentScores.studentName( whichStudent ) + ' : ';

		for ( var i = 0; i < currentCurric.length; i++ ) {
			outputStr += currentCurric[ i ] + ', ';
		}

		console.log( outputStr );
	},




	run_App = function() {
		getFiles( );
	}();


	return {
		fileName_domainOrder : fileName_domainOrder,
		fileName_studentTests : fileName_studentTests
	};

}();