(function() {

    require("./radioToggle.less");

    var radioToggleController = function() {

        var vm = this;

        vm.init = init;

        vm.init();

        function init() {
        }

        var toggle = angular.element('.switcher label');
        toggle.click(function(){
            angular.element(this).parent('.btn-group').toggleClass('on');
        });
    };

    radioToggleController.$inject = [];

    var radioToggleFunc = function ($state) {
        return {
            restrict: 'E',
            controller: radioToggleController,
            controllerAs: 'vm',
            bindToController: true,
            template: require("./radioToggle.html"),
            scope: {
                id: '@id',
                label: '@label',
                checked: '@checked',
                disabled: '@disabled'
            },
            link: function(scope, element, attrs) {

            }
        };
    };

    radioToggleFunc.$inject = ['$state'];
    angular.module('app').directive('radioToggle', radioToggleFunc);
})();






