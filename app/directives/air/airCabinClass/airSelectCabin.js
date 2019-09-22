(function() {

    var airSelectCabinController = function() {
        
        var vm = this;

        vm.init = init;
        vm.setCabin = setCabin;

        vm.init();

        function init() {
        }

        function setCabin(entry) {
            vm.selectedValue = entry;
            vm.selectedValueChanged();
        }

        vm.selectedValueChanged = function () {
            if (typeof vm.onChange === 'function') {
                vm.onChange(vm.selectedValue);
            }
        };
    };

    airSelectCabinController.$inject = [];

    var airSelectCabinFunc = function ($state) {
        return {
        	restrict: 'E',
            controller: airSelectCabinController,
            controllerAs: 'vm',
            bindToController: true,
		    template: require("./airSelectCabin.html"),
            scope: {
                selectedValue: '=ngModel',
                label: '@',
                onChange: '=onChange',
                options: '=options'
            },
		    link: function(scope, element, attrs) {
                
		    }
        };
    };

    airSelectCabinFunc.$inject = ['$state'];
    angular.module('app').directive('airSelectCabin', airSelectCabinFunc);
})();

    