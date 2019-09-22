module.exports = function(app) {
    var insuranceController = function ($rootScope) {

        var vm = this;

        vm.init = init;

        vm.init();

        function init() {

            //setup meta tags
            var desc = 'Accessible insurance options coming soon.';
            $rootScope.metaTagService.setup({
                ogDescription: desc,
                twitterDescription: desc,
            });

        }

    };

    insuranceController.$inject = ['$rootScope'];
    app.controller('insuranceController', insuranceController);
};
