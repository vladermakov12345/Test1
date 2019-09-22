module.exports = function(app) {
    var verifiedController = function ($rootScope) {

        var vm = this;

        vm.isConfirmed = false;
        vm.init = init;

        vm.init();

        function init(){
            vm.isConfirmed = true;

            //meta tags
            $rootScope.metaTagService.setup({
                googleBotIndex: 'noindex'
            });
        }
    };

    verifiedController.$inject = ['$rootScope'];
    app.controller('verifiedController', verifiedController);
};