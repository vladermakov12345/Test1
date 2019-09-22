module.exports = function(app) {
    var browsersController = function ($rootScope,$stateParams) {

        var vm = this;

        vm.init = init;

        vm.init();

        //required
        require("./supportedBrowsers.less");

        function init() {

            //setup meta tags
            var title = 'Supported Browsers';
            var desc = 'Browsers we officially support.';
            $rootScope.metaTagService.setup({
                metaTitle: title,
                ogTitle: title,
                twitterTitle: title,
                twitterImageAlt: title,
                ogDescription: desc,
                twitterDescription: desc
            });


        }

    };

    browsersController.$inject = ['$rootScope','$stateParams'];
    app.controller('browsersController', browsersController);
};