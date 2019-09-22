module.exports = function(app) {
    var teamController = function ($rootScope,environmentService) {

        var vm = this;

        vm.init = init;
        vm.getMainImage = getMainImage;

        //required
        //require("file-loader?name=jeff.jpg!../../../resources/img/team/jeff.jpg");
        //require("file-loader?name=Miriam.jpg!../../../resources/img/team/Miriam.jpg");

        vm.init();

        function init() {

            //setup meta tags
            var title = 'Our team';
            var desc = 'Meet the Team';
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
            return environmentService().BASEURL_CONTENT + '/assets/cities/main/NewYork_main.jpg';
        }
    };

    teamController.$inject = ['$rootScope','environmentService'];
    app.controller('teamController', teamController);
};
