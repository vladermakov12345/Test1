module.exports = function(app) {
    var partnersController = function ($rootScope,$stateParams,environmentService) {

        var vm = this;
        vm.env = environmentService();

        vm.init = init;
        vm.BASEURL_CONTENT = vm.env.BASEURL_CONTENT;

        vm.init();

        function init() {

            //setup meta tags
            var title = 'Our Partners'
            var desc = 'Our Partners';
            $rootScope.metaTagService.setup({
                metaTitle: title,
                ogTitle: title,
                twitterTitle: title,
                twitterImageAlt: title,
                ogDescription: desc,
                twitterDescription: desc,
            });

        }
    };

    partnersController.$inject = ['$rootScope','$stateParams','environmentService'];
    app.controller('partnersController', partnersController);
};
