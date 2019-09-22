module.exports = function (app) {
    var replyController = function ($rootScope, $stateParams, dataFactory, $scope, $state, environmentService) {
        var vm = this;
        vm.env = environmentService();

        vm.init = init;

        vm.init();

        //initialiation
        function init() {
            
            //setup meta tags
            var title = 'Accessible Travel Forum';
            var desc = 'Get answers to your accessible travel questions!';
//TODO: identify image for SEO
//var img = vm.env.BASEURL_CONTENT + '/assets/cities/main/' + vm.city.replace(" ", "") + '_main.jpg'; //vm.getMainImagePath();
            $rootScope.metaTagService.setup({
                metaTitle: title,
                ogTitle: title,
                twitterTitle: title,
                metaDescription: desc,
                ogDescription: desc,
                twitterDescription: desc,
                //ogImage: img,
                //twitterImage: img
googleBotIndex: false
            });

            //side article boxes
            // var successFunc = function (response) {
            //     vm.articleboxes = response.data;
            //     vm.handleIfItinerary();
            // };
            // var errFunc = function (response) {
            //     console.log('no article data found');
            // };
            // dataFactory.getAllArticles().then(successFunc, errFunc);
        }

    };

    replyController.$inject = ['$rootScope', '$stateParams', 'dataFactory', '$scope', '$state', 'environmentService'];
    app.controller('replyController', replyController);
};
