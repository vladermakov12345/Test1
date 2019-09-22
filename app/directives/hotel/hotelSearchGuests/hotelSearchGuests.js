(function() {

    var hotelSearchGuestsController = function($scope) {
        
        var vm = this;
        vm.guests = [];

        vm.init = init;
        vm.setGuestNum = setGuestNum;

        vm.init();

        function init() {
        }

        function setGuestNum(entry) {
            vm.selectedValue = entry;
            vm.selectedValueChanged();
        }

        vm.selectedValueChanged = function () {
            if (typeof vm.onChange === 'function') {
                vm.onChange(vm.selectedValue);
            }
        };

        $scope.$watch('vm.max', function(newVal) {
            vm.guests = [];
            for (var i=vm.min;i<parseInt(vm.max);i++) {
                vm.guests.push(i);    
            }
        });
    };

    hotelSearchGuestsController.$inject = ['$scope'];

    var hotelSearchGuestsFunc = function ($state) {
        return {
        	restrict: 'E',
            controller: hotelSearchGuestsController,
            controllerAs: 'hsg',
            bindToController: true,
		    template: require("./hotelSearchGuests.html"),
            scope: {
                min: '@',
                max: '@',
                selectedValue: '=ngModel',
                label: '@label',
                onChange: '=onChange'
            },
		    link: function(scope, element, attrs) {
                scope.min = attrs.min;
                scope.max = attrs.max;
		    }
        };
    };

    hotelSearchGuestsFunc.$inject = ['$state'];
    angular.module('app').directive('hotelSearchGuests', hotelSearchGuestsFunc);
})();

    