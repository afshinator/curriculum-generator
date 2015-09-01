/* dataModel -- Where we store & process data from the domain_order and student_tests files.


 */

var verbose = true;					// true to output debugging info


module.exports = function () {

	var rawDomainOrder,
		rawStudentTests,

		studentTestsDomainOrder = [],		// the order of the domains presented in the first row of the student_tests file


	init = function( domain, tests ) {
		rawDomainOrder = domain;
		rawStudentTests = tests;

		if ( verbose ) {
			console.log( rawDomainOrder );
			console.log( rawStudentTests );
		}

	};

	return {
		init : init
	};

}();