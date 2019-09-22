module.exports = function (app) {
    var askController = function ($rootScope, $stateParams, discourseDataService, $scope, $state, environmentService, forumService, localStorageService, $window, $location) {

        var vm = this;
        vm.env = environmentService();

        //state managment
        vm.state = 'pending';   //[pending|unrecoverable|ready]

        //user messaging handling
        vm.validationErrors = [];
        vm.unrecoverableErrors = [];
        vm.createTopicErrors = [];

        //data
        vm.categoryObj = {
            categorySlug: $stateParams.categorySlug,
            subCategorySlug: $stateParams.subCategorySlug
        };
        vm.themesObj = {
            categorySlug: 'themes'
        };
        vm.subject = '';
        vm.message = '';


        //functions
        vm.init = init;
        vm.postRequestCallback = postRequestCallback;
        vm.goToForum = goToForum;
        vm.createTopic = createTopic;
        
        vm.init();

        //initialiation
        function init() {

            //validations
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

        function createTopic() {
            
            //are we authenticated?
            if (!$rootScope.isAuthenticated) {
                loginModalService();
                return;
            }

            //reset
            vm.createTopicErrors = [];

            //validation
            // if (!vm.subject || vm.subject ==='') {
            //     vm.createTopicErrors.push({message: 'Missing subject.'});
            //     return;
            // }
            // if (!vm.message || vm.message ==='') {
            //     vm.createTopicErrors.push({message: 'Missing message.'});
            //     return;
            // }

            //create the topic
            var topicParams = {
                categoryId: vm.categoryObj.response.data.subCategory.id,
                subject: vm.subject,
                message: vm.message
            }


            var successFunc = function (response) {

                // if (!response || !response.data) {
                //     vm.createTopicErrors.push({message: 'Error while creating a topic'});
                //     //request.err = 'Posts for '+ request.categorySlug + '/' + request.subCategorySlug +'/' + request.topicSlug + ' not found.';
                //     return;
                // }

                //error
                if (!response.data.success) {
                    
                    //unrecoverable errors
                    $.each(response.data.unrecoverableErrors, function(idx, err) {
                        vm.createTopicErrors.push({message: err});
                    });

                    //validation errors
                    $.each(response.data.validationErrors, function(idx, err) {
                        vm.createTopicErrors.push({message: err});
                    });

                    return;
                }

                //success :: go to new topic
                var pageParams = {
                    categorySlug:vm.categoryObj.categorySlug,
                    subCategorySlug: vm.categoryObj.subCategorySlug,
                    topicSlug: response.data.data.create_topic.topic_slug
                };
                $state.go('forum-posts',pageParams);
            };

            var errFunc = function (response) {
                console.log(response);
                //todo: identify how to detect this and determine if further work is required
                vm.createTopicErrors.push({message: 'Error while creating a topic'});
            };

            //get forum data
            forumService.createTopic(topicParams, successFunc, errFunc);
        }

    };

    askController.$inject = ['$rootScope', '$stateParams', 'discourseDataService', '$scope', '$state', 'environmentService', 'forumService', 'localStorageService','$window','$location'];
    app.controller('askController', askController);
};
