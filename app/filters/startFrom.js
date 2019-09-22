//for ng-repeat
module.exports = function(app) {
	var startFromFilter = function() {
        return function(input, start) {
	        start = +start; //parse to int
	        if (!input) return 0;
	        return input.slice(start);
	    };
    };

    startFromFilter.$inject = [];
    app.filter('startFrom', startFromFilter);
};
