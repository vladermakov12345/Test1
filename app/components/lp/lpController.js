module.exports = function(app) {
    var lpController = function ($stateParams) {

        var vm = this;

        vm.hotelDestination = '';
        vm.portalId = 'not specified';
        vm.showDetails = false;

        vm.init = init;

        vm.init();

        function init() {

            //check portal id
            vm.portalId = $stateParams.p;
            if (vm.portalId==='934u8')
                vm.showDetails = true;
        }
    };

    lpController.$inject = ['$stateParams'];
    app.controller('lpController', lpController);
};