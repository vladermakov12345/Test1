module.exports = function (app) {
    var subCategoriesController = function ($rootScope, $stateParams, discourseDataService, $scope, $state, environmentService, forumService) {
        var vm = this;
        vm.env = environmentService();

        //state managment
        vm.state = 'pending';   //[pending|unrecoverable|ready]

        //user messaging handling
        vm.validationErrors = [];
        vm.unrecoverableErrors = [];

        //data
        vm.categoryObj = {
            categorySlug: $stateParams.categorySlug
        };

        //functions
        vm.init = init;
        vm.postRequestCallback = postRequestCallback;
        
        vm.init();

        function init() {

            //validations
            // if (!vm.categoryObj.categorySlug || vm.categoryObj.categorySlug==='') {
            //     vm.SetError('Missing category parameter');
            //     return;
            // }

            //get sub categories
            forumService.getSubCategories(vm.categoryObj, postRequestCallback);
        }

        function postRequestCallback() {

            if (!vm.categoryObj.response.success) {
                vm.unrecoverableErrors = vm.unrecoverableErrors.concat(vm.categoryObj.response.unrecoverableErrors);
                vm.unrecoverableId = vm.categoryObj.response.id;
                vm.state = 'unrecoverable';
                return;
            }

            vm.state = 'ready';

            //meta data
            var title = 'Accessible Travel Forum :: ' + vm.categoryObj.response.data.category.name;
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
            });
        }
    };

    subCategoriesController.$inject = ['$rootScope', '$stateParams', 'discourseDataService', '$scope', '$state', 'environmentService','forumService'];
    app.controller('subCategoriesController', subCategoriesController);
};
