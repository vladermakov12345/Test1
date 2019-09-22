module.exports = function(app) {
    var accessibilityController = function ($rootScope,$stateParams,environmentService) {

        var vm = this;

        vm.init = init;
        vm.getMainImage = getMainImage;
        
        vm.init();

        function init() {

            //setup meta tags
            var title = 'Our accessibility commitment';
            var desc = 'Learn about our venue selection process and accessibility.';
            $rootScope.metaTagService.setup({
                metaTitle: title,
                ogTitle: title,
                twitterTitle: title,
                twitterImageAlt: title,
                ogDescription: desc,
                ogImage: getMainImage(),
                twitterDescription: desc,
                twitterImage: getMainImage()
            });

        }

        function getMainImage() {
            var env = environmentService();
            return env.BASEURL_CONTENT + '/assets/cities/main/NewYork_main.jpg';
        }
    };

    accessibilityController.$inject = ['$rootScope','$stateParams','environmentService'];
    app.controller('accessibilityController', accessibilityController);
};
