module.exports = function(app) {
	var capitalizeFirstLetterFunc = function() {
		return function(input) {
	      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
	    };
    };

    capitalizeFirstLetterFunc.$inject = [];
    app.filter('capitalize', capitalizeFirstLetterFunc);





	var filterPPNAccessibleAmenity = function(a) {
	    return function (ppnAmenities) {
	        return ppnAmenities.filter(function (item) {
	            return item.name.toLowerCase().indexOf('accessible') > -1;    
	        });
	    };
    };

    filterPPNAccessibleAmenity.$inject = [];
    app.filter('filterPPNAccessibleAmenity', filterPPNAccessibleAmenity);




    var filterUnsafe = function($sce) {
	    return function(val) {
	        return $sce.trustAsHtml(val);
	    };
	};

	filterUnsafe.$inject = ['$sce'];
    app.filter('unsafe', filterUnsafe);


	//camel case
	var camelCaseFilter = function($sce) {
		var ccf = function (input) {
			if (!input) return;
	        var words = input.split( ' ' );
	        for ( var i = 0, len = words.length; i < len; i++ )
	            words[i] = words[i].charAt( 0 ).toUpperCase() + words[i].slice( 1 ).toLowerCase();
	        return $sce.trustAsHtml(words.join( ' ' ));
    	};
    	return ccf;
    };
    camelCaseFilter.$inject = ['$sce'];
    app.filter('camelcase',camelCaseFilter);


	//limit by number of words
	var limitWordsFilter = function($sce) {
		var ccf = function (str, limit) {
			if (!str) return '';
			if (limit) {
		      return str.split(' ').splice(0, limit).join(' ');
		    } else {
		      // if limit not set or is zero return original string
		      return str;
		    }
    	};
    	return ccf;
    };
    limitWordsFilter.$inject = ['$sce'];
    app.filter('limitWords',limitWordsFilter);
};