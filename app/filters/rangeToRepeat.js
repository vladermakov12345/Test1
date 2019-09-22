module.exports = function(app) {
	var rangeToRepeat = function() {
		return function(input, start, finish, desc) {
		    start = parseInt(start);
		    finish = parseInt(finish);

		    for (var i=start; i<=finish; i++) {
		      if (desc) {
		      	input.unshift(i);
		      } else {
		      	input.push(i);
		      }
		    }

		    return input;
		  };
    };

    rangeToRepeat.$inject = [];
    app.filter('rangeToRepeat', rangeToRepeat);
};