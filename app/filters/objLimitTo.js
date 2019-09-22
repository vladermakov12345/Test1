/*
//never tried this, just used something like this instead: ng-hide="$index>pc.numVisible">
module.exports = function(app) {
	var objLimitTo = function() {
		return function(obj, limit){
	        var keys = Object.keys(obj);
	        if(keys.length < 1){
	            return [];
	        }

	        var ret = new Object,
	        count = 0;
	        angular.forEach(keys, function(key, arrayIndex){
	            if(count >= limit){
	                return false;
	            }
	            ret[key] = obj[key];
	            count++;
	        });
	        return ret;
	    };
    };

    objLimitTo.$inject = [];
    app.filter('objLimitTo', objLimitTo);
};
*/