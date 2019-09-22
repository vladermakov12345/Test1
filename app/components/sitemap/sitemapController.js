module.exports = function(app) {
    var sitemapController = function ($rootScope) {

        var vm = this;

        vm.init = init;
        
        vm.init();

        function init() {

            //setup meta tags
            var title = 'Sitemap';
            var desc = 'Sitemap';
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

    sitemapController.$inject = ['$rootScope'];
    app.controller('sitemapController', sitemapController);
};
