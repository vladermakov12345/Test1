module.exports = function (app) {
    var categoriesController = function ($rootScope, $stateParams, discourseDataService, $scope, $state, environmentService,forumService) {
        var vm = this;
        vm.env = environmentService();

        //state managment
        vm.state = 'pending';   //[pending|unrecoverable|ready]

        //user messaging handling
        vm.validationErrors = [];
        vm.unrecoverableErrors = [];

        //data
        vm.geographyObj = {};
        vm.themesObj = {
            categorySlug: 'themes'
        };

        //page readiness
        vm.isReady = false;
        vm.isCategoriesAvailable = false;
        vm.isThemesAvailable = false;

        vm.init = init;
        vm.geographyObjLoadedCB = geographyObjLoadedCB;
        vm.themesObjLoadedCB = themesObjLoadedCB;
        vm.updateReadiness = updateReadiness;

        vm.init();

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
                googleBotIndex: 'noindex'
                //ogImage: img,
                //twitterImage: img
            });

            forumService.getGeographyCategories(vm.geographyObj, vm.geographyObjLoadedCB);
            forumService.getSubCategories(vm.themesObj, vm.themesObjLoadedCB) 
        }

        function geographyObjLoadedCB() {
            vm.updateReadiness();

            //once unrecoverable, no going back
            if (vm.state === 'unrecoverable') return;

            //errors?
            if (!vm.geographyObj.response.success) {
                vm.unrecoverableErrors = vm.unrecoverableErrors.concat(vm.geographyObj.response.unrecoverableErrors);
                vm.unrecoverableId = vm.geographyObj.response.id;
                vm.state = 'unrecoverable';
                return;
            }

            //success
            vm.geographyObj.categories = vm.geographyObj.response.data;
        }

        function themesObjLoadedCB() {
            vm.updateReadiness();

            //once unrecoverable, no going back
            if (vm.state === 'unrecoverable') return;

            //errors?
            if (!vm.themesObj.response.success) {
                vm.unrecoverableErrors = vm.unrecoverableErrors.concat(vm.themesObj.response.unrecoverableErrors);
                vm.unrecoverableId = vm.themesObj.response.id;
                vm.state = 'unrecoverable';
                return;
            }

            //success
            vm.themesObj.subCategories = vm.themesObj.response.data.subCategories;
        }

        function updateReadiness() {
            //once unrecoverable, no going back
            if (vm.state === 'unrecoverable') return;

            if (vm.geographyObj.response && vm.themesObj.response) {
                vm.state = 'ready';
            }
            // if (vm.geographyObj.categories && vm.geographyObj.categories.length>0) {
            //     vm.isCategoriesAvailable = true;
            // }

            // if (vm.themesObj.subCategories && vm.themesObj.subCategories.length>0) {
            //     vm.isThemesAvailable = true;
            // }

            vm.isReady = true;// (vm.isCategoriesAvailable && vm.isThemesAvailable);
        }

    };

    categoriesController.$inject = ['$rootScope', '$stateParams', 'discourseDataService', '$scope', '$state', 'environmentService','forumService'];
    app.controller('categoriesController', categoriesController);
};
