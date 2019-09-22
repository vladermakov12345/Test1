(function() {

    require("./formLabelQ.less");

    var formLabelQController = function(joinModalService) {

        var vm = this;

        vm.init = init;

        vm.showJoinModal = showJoinModal;

        vm.init();

        vm.image_accessible1 = require("../../../resources/img_new/label/accessible-1.png");

        vm.image_accessible2 = require("../../../resources/img_new/label/accessible-2.png");

        vm.image_nearHospitals = require("../../../resources/img_new/label/near-hospitals.png");

        vm.image_clubGo = require("../../../resources/img_new/label/clubgo.png");

        function init() {
        }

        function showJoinModal() {
            joinModalService();
        }

    };

    formLabelQController.$inject = ['joinModalService'];

    var formLabelQFunc = function ($scope) {
        return {
            restrict: 'E',
            controller: formLabelQController,
            controllerAs: 'vm',
            bindToController: true,
            template: require("./formLabelQ.html"),
            scope: {
                id: '@id',
                label: '@label',
                content: '@content',
                templateUrl: '@templateUrl'
            },

            link: function(scope, element, attrs) {

            }

        };
    };

    formLabelQFunc.$inject = ['$state'];
    angular.module('app').directive('formLabelQ', formLabelQFunc);
})();






