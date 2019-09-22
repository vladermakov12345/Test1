(function() {
	require("./comingsoon.less");
    var comingSoonFunc = function ($compile,dataFactory) {
        return {
        	restrict: 'E',
		    scope: {
            	name: '@'
            },
		    template: require("./comingsoon.html"),
		    link: function(scope, element, attrs) {
		        scope.GO = function () {
                    //validate email address
                    if (!this.email || this.email === '') return;

                    //submit
                    var successFunc = function (data) {
                        scope.hasSignedUp = true;
                        console.log('newsletter signup: success');
                    };
                    var errFunc = function (data, status, headers, config) {
                        console.log('newsletter signup: failed');
                    };
                    //dataFactory.signUp(this.email).then(successFunc,errFunc);
                };
		    }
        };

        function linkFn(scope, element, attrs) {
			$compile(element.contents())(scope.$new());
    	}
    };

    comingSoonFunc.$inject = ['$compile','dataFactory'];
    angular.module('app').directive('comingSoon', comingSoonFunc);
})();

    