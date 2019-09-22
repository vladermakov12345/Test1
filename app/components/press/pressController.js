module.exports = function(app) {
    var pressController = function ($rootScope,$stateParams,environmentService) {

        var vm = this;
        vm.env = environmentService();
        vm.init = init;
        //vm.getJPostPDF = getJPostPDF;
        require("./press.less");

        vm.init();

        function init() {

            //setup meta tags
            var title = 'In the Press';
            var desc = 'In the Press';
            $rootScope.metaTagService.setup({
                metaTitle: title,
                ogTitle: title,
                twitterTitle: title,
                twitterImageAlt: title,
                ogDescription: desc,
                twitterDescription: desc,
            });

        }

        // function getJPostPDF() {
        //     return vm.env.BASEURL_CONTENT + "/Download/GetJPostPressPDF";    //web/public/resources/img/press/Jpost_pg13_2807_JIJ_06_15_3.pdf
        // }
    };

    pressController.$inject = ['$rootScope','$stateParams','environmentService'];
    app.controller('pressController', pressController);
};
