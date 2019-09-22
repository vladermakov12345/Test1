module.exports = function (app) {
    var topicsController = function ($rootScope, $stateParams, discourseDataService, $scope, $state, environmentService, forumService, loginModalService, redirectionService) {
        var vm = this;
        vm.env = environmentService();

        //state managment
        vm.state = 'pending';   //[pending|unrecoverable|ready]

        //user messaging handling
        vm.validationErrors = [];
        vm.unrecoverableErrors = [];

        //data
        vm.categoryObj = {
            categorySlug: $stateParams.categorySlug,
            subCategorySlug: $stateParams.subCategorySlug
        };
        vm.themesObj = {
            categorySlug: 'themes'
        };

        //functions
        vm.init = init;
        vm.postRequestCallback = postRequestCallback;
        vm.goToForum = goToForum;
        vm.ask = ask;
        
        vm.init();

        function init() {

            // //validations
            // if (!vm.categoryObj.categorySlug || vm.categoryObj.categorySlug==='') {
            //     vm.SetError('Missing category parameter');
            //     return;
            // }
            // if (!vm.categoryObj.subCategorySlug || vm.categoryObj.subCategorySlug==='') {
            //     vm.SetError('Missing sub category parameter');
            //     return;
            // }

            //get forum data
            forumService.getTopics(vm.categoryObj, postRequestCallback);

            //get theme categories for side bar
            forumService.getSubCategories(vm.themesObj) 
            



            // //get parent category
            // var sFunc = function (response) {
            //     if (!response.data || response.data.length===0) {
            //         console.log('parent category not found');
            //         return;
            //     }
            //     vm.parentCategory = response.data[0];

            // };
            // var eFunc = function (response) {
            //     console.log('error while fetching parent category data');
            // };
            // discourseDataService.getCategory(vm.parentSlug).then(sFunc, eFunc);


            // //get category
            // var sCatFunc = function (response) {
            //     if (!response.data || response.data.length===0) {
            //         console.log('category not found');
            //         return;
            //     }
            //     vm.subCategory = response.data[0];

            // };
            // var eCatFunc = function (response) {
            //     console.log('error while fetching category data');
            // };
            // discourseDataService.getCategory(vm.slug).then(sCatFunc, eCatFunc);



            //get category topics

        }

        function postRequestCallback() {

            if (!vm.categoryObj.response.success) {
                vm.unrecoverableErrors = vm.unrecoverableErrors.concat(vm.categoryObj.response.unrecoverableErrors);
                vm.unrecoverableId = vm.categoryObj.response.id;
                vm.state = 'unrecoverable';
                return;
            }

            vm.state = 'ready';
           
            //setup meta tags
            var title = 'Accessible Travel Forum :: ' + vm.categoryObj.response.data.category.name + ' :: ' + vm.categoryObj.response.data.subCategory.name;
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

        function goToForum(subCategorySlug) {
            $state.go('forum-topics',{categorySlug:vm.categoryObj.categorySlug, subCategorySlug: subCategorySlug});
        }

        function ask() {
            var to = 'forum-ask';
            var params = {
                categorySlug:vm.categoryObj.categorySlug,
                subCategorySlug: vm.categoryObj.subCategorySlug
            };
            forumService.navToCreateTopic(to,params);
        }

    };

    topicsController.$inject = ['$rootScope', '$stateParams', 'discourseDataService', '$scope', '$state', 'environmentService','forumService','loginModalService','redirectionService'];
    app.controller('topicsController', topicsController);
};
