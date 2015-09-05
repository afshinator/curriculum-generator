// StudentScores - 
// 		The contents of the student_tests.csv file, and related methods to get and use that data,
//		including processed test results used to build curriculum

var verbose = 0;

module.exports = function () {

	var data = [],					// Processed data including student names, student test results, curriculum
		testsDomainOrder = [],		// In student_tests, the ordering of domains


	init = function( rawStudentDataFromFile ) {
		var i, j, oneStudentsScores, scoresCopy,

			initTestsDomainOrder = function() {
				// Expecting 4 domains, but we'll go by length of read in data to allow for more in future;
				for ( i = 1; i < rawStudentDataFromFile[ 0 ].length; i++ ) {
					testsDomainOrder.push( rawStudentDataFromFile[ 0 ][ i ] );
				}		
			};


		// Data integrity sanity check:
		if ( ! rawStudentDataFromFile ) { 
			console.error( '!!! student_tests seems to be empty?! '); 
			return false;
		}

		// First row should contain headings which shows corresponding domains for test results;
		// Save that information for referral later
		initTestsDomainOrder();


		// Go through each row in the student_tests file and add them to internal data structure
		for ( i = 1; i < rawStudentDataFromFile.length; i++ ) {		// row 0 is headings, so start at 1
			oneStudentsScores = [];
			scoresCopy = null;

			// create an array holding all the test results for current student
			for ( j = 1; j < rawStudentDataFromFile[ i ].length; j++ ) {		// col 0 is last name, so start at 1
				oneStudentsScores.push( rawStudentDataFromFile[ i ][ j ] );
			}

			scoresCopy = oneStudentsScores.slice( 0 ); 		// Do a shallow copy of array			

			data.push({ 
				name: rawStudentDataFromFile[ i ][ 0 ],
				testResults: oneStudentsScores,				// one row from file
				processedTestResults : scoresCopy,			// copy of testResults
				curriculum: []								// contents to be computed
			});
		}

		if ( verbose  > 1) {
			console.log( data );
		}

		return true;
	},

	getOrderOfDomainInTests = function( whichDomain ) {
		for ( var i = 0; i < testsDomainOrder.length; i++ ) {
			if ( testsDomainOrder[ i ] === whichDomain ) return i;
		}
		console.error( '!!! Couldnt find domain order for ' + whichDomain );
	},


	getStudentCount = function() {
		return data.length;
	},

	getStudentName = function( whichStudent ) {
		return data[ whichStudent ].name;
	}

	getStudentCurriculum = function( whichStudent ) {
		return data[ whichStudent ].curriculum;
	},

	setCurricForStudent = function( whichStudent, curric ) {
		data[ whichStudent].curriculum = curric;
	},

	getScoreOfStudentForDomain = function( whichStudent, whichDomain ) {
		if ( verbose > 1 ) console.log( 'order of ' + whichDomain + ' is ' + getOrderOfDomainInTests( whichDomain ) );
		return data[ whichStudent ].processedTestResults[ getOrderOfDomainInTests( whichDomain ) ];
	},

	getDataForLowestScoreFromProcessedResults = function( whichStudent ) {
		var result = { score: 'Z' },  // // start with default score so anything will be lower

			isCurrentLowest = function( score ) {
				score = score.toUpperCase();			// safeguard! 

				if ( score === 'K' ) {		// Only return true on first occurance of 'K'
					if ( result.score !== 'K' ) return true;
					return false;
				}

				if ( result.score === 'Z' ) return true; // Anything is lower than default 'Z'

				// Score is not 'K', so turn it and the current lowest to integers to compare
				if ( ( score * 1 ) < ( result.score * 1 ) ) { return true; }

				return false;
			};

		// Go through every test score for particular student,
		for ( i = 0; i < data[ whichStudent ].processedTestResults.length; i++ ) {
			if ( isCurrentLowest( data[ whichStudent ].processedTestResults[ i ] ) ) {
				result.score = data[ whichStudent ].processedTestResults[ i ];				// lowest score
				result.index = i;															// index of that test result
				result.domain = testsDomainOrder[ i ];										// domain associated with lowest score
			}
		}

		return result;
	},


	addToCurriculum = function( whichStudent, domain, grade ) {
		var course = grade + '.' + domain;
		data[ whichStudent ].curriculum.push( course );
	},


	promoteScoreInProcessedResults= function( whichStudent, whichDomain ) {
		var score = getScoreOfStudentForDomain( whichStudent, whichDomain ),
			newScore;

		if ( score === 'K' ) { newScore = '1'; }
		else {
			newScore = score * 1;
			newScore++;
			newScore += '';				// turn it back into a string
		}

		data[ whichStudent ].processedTestResults[ getOrderOfDomainInTests( whichDomain ) ] = newScore;
	},

	getRecord = function( whichStudent ) {
		return data[ whichStudent ];
	};

	return {
		init : init,
		studentCount : getStudentCount,
		studentName : getStudentName,

		studentScoreForDomain: getScoreOfStudentForDomain,

		getDataForLowestScoreFromProcessedResults : getDataForLowestScoreFromProcessedResults,
		promoteScoreInProcessedResults : promoteScoreInProcessedResults,

		studentCurric : getStudentCurriculum,
		setCurricForStudent : setCurricForStudent,
		addToCurriculum : addToCurriculum,

		getRecord : getRecord
	};

}();
