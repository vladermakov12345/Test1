module.exports = function(app) {
    var citySearchBarController = function($scope,$state,environmentService) {
        
        require('./citySearchBar.less');

        var vm = this;
        vm.env = environmentService();
        vm.goToCity = goToCity;

        //popover tip
        $scope.isOpen = false;
        $scope.closeCitySearchTipPopover = function() {
            $scope.isOpen=false;
        }

        function goToCity() {
            if (!vm.city) { return; }
            $state.go('city', {name: vm.city.city, state:vm.city.state, country: vm.city.country});
        }
    };

    citySearchBarController.$inject = ['$scope','$state','environmentService'];

    citySearchBarFunc = function (dataFactory,$state) {
        return {
        	restrict: 'E',
            controller: citySearchBarController,
            controllerAs: 'csb',
            bindToController: true,
		    template: require("./citySearchBar.html"),
		    link: function(scope, element, attrs) {
		    }
        };
    };

    citySearchBarFunc.$inject = ['dataFactory','$state'];
    app.directive('citySearchBar', citySearchBarFunc);
};    