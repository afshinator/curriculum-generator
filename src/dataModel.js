/* dataModel -- Where we store & process data from the domain_order and student_tests files.


 */

module.exports = function () {

	var verbose = 0;					// 1 == show debug output, 2 == show all debug output

	var rawDomainOrder,					// Unprocessed data read in from domain_order file
		rawStudentTests,				// Unprocessed data read in from student_tests files

		studentTestsDomainOrder = [],	// the order of the domains presented in the first row of the student_tests file

		records = [],				// Will hold all student tests scores, generated curriculum, & intermediate data



	// Put headings of students test results in array for order reference later
	initStudentTestsDomainOrder = function() {
		// Expecting 4 domains, but we'll go by length of read in data to allow adding others;
		// Starts at 1 instead of 0 because 1st row from file is column headers
		for (var i = 1; i < rawStudentTests[0].length; i++ ) {
			studentTestsDomainOrder.push( rawStudentTests[0][i] );
		}		
	},


	// Put all students and their test results into a data structure we're going to be adding to
	initRecords = function() {
		var i, j, testScores, processedTestScores;

		for (i = 1; i < rawStudentTests.length; i++ ) {
			testScores = [];
			processedTestScores = null;

			// create an array holding all the test results, for reference
			for (j = 1; j < rawStudentTests[i].length; j++ ) {
				testScores.push( rawStudentTests[i][j] );
			}

			processedTestScores = testScores.slice( 0 ); 		// Do a shallow copy of array

			records.push({ 
				name: rawStudentTests[i][0],
				testResults: testScores,
				processedTestScores : processedTestScores,
				curriculum: []						// Contents to be computed
			});
		}

		if ( verbose ) {
			console.log( records );
		}
	},


	studentCount = function() {
		return records.length;
	},


	getStudentRecord = function( index ) {
		return records[ index ];
	},


	// Given index into records, find and return lowest test score and its associated domain
	// from the processed test scores.
	getLowestGradeAndDomain = function( index ) {
		var i,
			result = { 
				grade: 'Z' 		// start with default high grade so anything will be lower
			}, 
			isLower = function( grade ) {
				grade = grade.toUpperCase();

				// Return true if this is first occurance of 'K'
				if ( grade === 'K' ) {
					if ( result.grade !== 'K' ) return true;
					return false;
				}

				// Grade is not 'K', so it must be a number
				if ( result.grade === 'Z' ) return true;  // Any number isLower than default value

			
				// multiply by 1 to turn it into integer
				if ( ( grade * 1 ) < ( result.grade * 1 ) ) {
					return true;
				}
 
				return false;
			};

		for ( i = 0; i < records[ index ].processedTestScores.length; i++ ) {
			if ( isLower( records[ index ].processedTestScores[ i ] ) ) {
				result.grade = records[ index ].processedTestScores[ i ];
				result.index = i;
				result.domain = studentTestsDomainOrder[ i ];
			}
		}

		return result;
	},


	init = function( domain, tests ) {
		var allIsGood = true;					// Will be false by end of function if we encounter an error

		rawDomainOrder = domain;
		rawStudentTests = tests;

		if ( verbose > 1 ) {
			console.log( rawDomainOrder );
			console.log( rawStudentTests );
		}


		// Sanity checks

		if ( rawDomainOrder.length < 1 ) {
			allIsGood = false;
		}

		if ( rawStudentTests.length < 2 ) {
			allIsGood = false;
		}

		if ( rawStudentTests[0][0] !== 'Student Name' ) {
			allIsGood = false;
			console.error( 'Student Name wasnt the first column heading in student tests file.')
		}

		initStudentTestsDomainOrder();			// Note order of domains in student test results
		initRecords();							// Get data ready for processing

		return allIsGood;
	};


	return {
		init : init,
		studentCount : studentCount,
		getStudentRecord : getStudentRecord,
		getLowestGradeAndDomain: getLowestGradeAndDomain
	};

}();