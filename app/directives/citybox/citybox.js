(function() {
	require("./citybox.less");

    var cityboxController = function($scope,$state,environmentService) {
        var vm = this;
        vm.env = environmentService();
    };

    cityboxController.$inject = ['$scope','$state','environmentService'];

    var cityboxFunc = function (dataFactory,$state) {
        return {
        	restrict: 'E',
            controller: cityboxController,
            controllerAs: 'citybox',
            bindToController: true,
		    template: require("./citybox.html"),
		    link: function(scope, element, attrs) {
                scope.citybox.cityid = attrs.cityid;
                scope.citybox.cityname = attrs.cityname;
                scope.citybox.color = attrs.color;
		    }
        };
    };

    cityboxFunc.$inject = ['dataFactory','$state'];
    angular.module('app').directive('citybox', cityboxFunc);
})();

    