module.exports = function(app) {
    var aboutController = function ($rootScope,environmentService) {

        var vm = this;
        vm.topParagraph = 'accessibleGO is the only full-service accessible travel platform providing search, reviews, and bookings of accessible hotels, cruises, transport and destinations worldwide.  With timely insights, comprehensive resources, and a dynamic traveler community, accessibleGO is quickly becoming the number one travel resource for planning accessible trips.';

        vm.init = init;

        vm.getMainImage = getMainImage;
        require("file-loader?name=Miriam_and_her_mom.jpg!../../../resources/img/about/Miriam_and_her_mom.jpg");

        vm.init();

        function init() {

            //setup meta tags
            var title = 'About us';
            $rootScope.metaTagService.setup({
                metaTitle: title,
                ogTitle: title,
                twitterTitle: title,
                twitterImageAlt: title,

                ogDescription: vm.topParagraph,
                ogImage: getMainImage(),
                twitterDescription: vm.topParagraph,
                twitterImage: getMainImage()
            });

        }

        function getMainImage() {
            return environmentService().BASEURL_CONTENT + '/assets/cities/main/NewYork_main.jpg';
        }
    };

    aboutController.$inject = ['$rootScope','environmentService'];
    app.controller('aboutController', aboutController);
};
