// GradeDomainsModel - 
// 		The contents of the domain_order.csv file,
//		and related methods to get and use that data


var verbose = 1;			// for debug output


module.exports = function () {

	var data,			// two dimmensional array, each row corresponds to a grade


	// For passed in grade, return index into which row of data
	convertGradeToIndexIntoData = function( whichGrade ) {
		// Convert 'K' to 0; other grades to their integer counterpart
		return ( whichGrade.toUpperCase() === 'K' ) ? 0 : ( whichGrade *= 1 );
	},


	// Return order in which passed-in domain is listed for passed in grade  (according to domain_order file)
	domainIndexForGrade = function( whichGrade, whichDomain ) {
		whichGrade = convertGradeToIndexIntoData( whichGrade );

		for ( var i = 1; i < data[ whichGrade ].length; i++ ){
			if ( data[ whichGrade ][ i ] === whichDomain ) return i;
		}

		//TODO: what to return if not found??  0 or i ?  
	},


	// Return how many domains have been defined for the passed in grade level.
	getNumberOfDomainsForParticularGrade = function( whichGrade ) {
		whichGrade = convertGradeToIndexIntoData( whichGrade );
		return data[ whichGrade ].length - 1;			// Subtract 1 because 1st element of each row is grade
	},


	getNthDomainInGrade = function( whichGrade, n ) {
		whichGrade = convertGradeToIndexIntoData( whichGrade );		
		return data[ whichGrade ][ n ];
	}


	init = function( rawDataFromFile ) {
		data = rawDataFromFile;

		// Data integrity sanity check:
		if ( data[0][0] !== 'K' ) { 
			console.error( '!!! domain_order problems! ');
			return false;
		}

	};


	return {
		init : init,
		domainIndexForGrade : domainIndexForGrade,
		domainsInGradeCount : getNumberOfDomainsForParticularGrade,
		nthDomainInGrade : getNthDomainInGrade
	};

}();
