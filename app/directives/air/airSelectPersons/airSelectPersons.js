(function() {

    var airSelectPersonsController = function() {
        
        var vm = this;
        //vm.persons = [1,2,3,4,5,6];

        vm.init = init;
        vm.setNum = setNum;

        vm.init();

        function init() {
        }

        function setNum(entry) {
            vm.selectedValue = entry;
            vm.selectedValueChanged();
        }

        vm.selectedValueChanged = function () {
            if (typeof vm.onChange === 'function') {
                vm.onChange(vm.selectedValue);
            }
        };
    };

    airSelectPersonsController.$inject = [];

    var airSelectPersonsFunc = function ($state) {
        return {
        	restrict: 'E',
            controller: airSelectPersonsController,
            controllerAs: 'vm',
            bindToController: true,
		    template: require("./airSelectPersons.html"),
            scope: {
                id: '@id',
                selectedValue: '=ngModel',
                label: '@',
                onChange: '=onChange',
                options: '=options'
            },
		    link: function(scope, element, attrs) {
                
		    }
        };
    };

    airSelectPersonsFunc.$inject = ['$state'];
    angular.module('app').directive('airSelectPersons', airSelectPersonsFunc);
})();

    