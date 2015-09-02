/* dataModel -- Where we store & process data from the domain_order and student_tests files.


 */

module.exports = function () {

	var verbose = 2;					// 1 == show debug output, 2 == show all debug output

	var rawDomainOrder,					// Unprocessed data read in from domain_order file
		rawStudentTests,				// Unprocessed data read in from student_tests files

		studentTestsDomainOrder = [],	// the order of the domains presented in the first row of the student_tests file

		records = [],	// Will hold processed student tests scores, generated curriculum, & intermediate data



	// Put headings of students test results in array for order reference later
	initStudentTestsDomainOrder = function() {
		// Expecting 4 domains, but we'll go by length of read in data to allow adding others;
		// Starts at 1 instead of 0 because 1st row from file is column headers
		for (var i = 1; i < rawStudentTests[0].length; i++ ) {
			studentTestsDomainOrder.push( rawStudentTests[0][i] );
		}		
	},

	getOrderOfDomainInStudentTests = function( domain ) {
		for ( var i = 0; i < studentTestsDomainOrder.length; i++ ) {
			if ( studentTestsDomainOrder[i] === domain ) return i;
		}
	},


	// Put all students and their test results into records; will be used to hold intermediate data later
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
				testResults: testScores,					// one row from file
				processedTestScores : processedTestScores,	// copy of testResults
				curriculum: []								// contents to be computed
			});
		}

		if ( verbose ) {
			console.log( records );
		}
	},

	convertGradeToIndex = function( grade ) {
		if ( grade.toUpperCase() === 'K' ) grade = 0;
		else grade *= 1; 	// turn it into an integer to use as index into array
		return grade;
	},

	// From domain_order file data, return how many domains are listed for particular grade
	countOfDomainsInGrade = function( grade ) {
		grade = convertGradeToIndex( grade );

		// Have to subtract 1 because 1st element of each row is grade
		return rawDomainOrder[ grade ].length - 1;
	},


	getNthDomainFromGrade = function( n, grade ) {
		grade = convertGradeToIndex( grade );

		return rawDomainOrder[ grade ][ n ];
	},


	getTestGradeOfStudentForDomain = function( which, domain ) {
		var idx = getOrderOfDomainInStudentTests( domain );

		return records[ which ].processedTestScores[ idx ];
	},


	// Refering to the domain_order file, return a number representing the rank of the passed in
	// domain in the passed in grade.  0 means domain not found in that grade. 
	getRankOfDomainInGrade = function( domain, grade ) {
		var result = 0;			// default to value for domain not found in grade

		// Sanity check
		if ( rawDomainOrder[0][0] !== 'K' ) { console.error( 'domain_order data problems' ); }

console.log( ' grade we are looking at : ' + grade );

		grade = convertGradeToIndex( grade );

		for ( var i = 1; i < rawDomainOrder[ grade ].length; i++ ) {
			// dont need to compensate for grade being first element in row of domains because 
			// we dont want to return 0-based index.  Using 0 to mean not found.			
			if ( rawDomainOrder[ grade ][ i ] === domain ) return i;  
		}

		return result;
	},


	studentTestScoresCount = function() {
		return records.length;
	},


	/* each student record: {
		name :'',
		testResults : [],
		processedTestScores : [],
		curriculum, []
	   }
	*/
	getStudentRecord = function( index ) {
		return records[ index ];
	},


	// From processed test scores, return the lowest grade received and what domain it was in.
	// Given index into records, find and return lowest test score and its associated domain
	// from the processed test scores.
	getLowestGradeAndDomainOfStudent = function( index ) {
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


	addToCurriculum = function( which, domain, grade ) {
		var courseToAdd = grade + '.' + domain;

		records[ which ].curriculum.push( courseToAdd );

		console.log( 'Curric: ' + records[which] );
	},


	// Parameters domain and tests are both 2 dimensional arrays;
	// Each sub-array in domain lists ordering of domains with the 1st element being the grade,
	// Each sub-array in tests holds student name and test scores per domain, in order of listed of 1st row in file
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
		studentTestScoresCount : studentTestScoresCount,
		getStudentRecord : getStudentRecord,
		getLowestGradeAndDomainOfStudent: getLowestGradeAndDomainOfStudent,
		countOfDomainsInGrade : countOfDomainsInGrade,		
		getRankOfDomainInGrade : getRankOfDomainInGrade,
		getNthDomainFromGrade : getNthDomainFromGrade,
		getTestGradeOfStudentForDomain : getTestGradeOfStudentForDomain,
		addToCurriculum : addToCurriculum
	};

}();