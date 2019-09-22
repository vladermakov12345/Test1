(function() {

	var fbLoginFunc = function ($rootScope) {
        return function (scope, iElement, iAttrs) {
	        if (typeof(FB) === "undefined") return;
	        FB.XFBML.parse(iElement[0]);
	    };
    };
    fbLoginFunc.$inject = ['$rootScope'];
    angular.module('app').directive('fbLogin', fbLoginFunc);
})();