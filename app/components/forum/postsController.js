module.exports = function (app) {
    var postsController = function ($rootScope, $stateParams, discourseDataService, $scope, $state, environmentService, $sce, forumService, localStorageService, loginModalService, $location, $window) {
        var vm = this;
        vm.env = environmentService();

        //state managment
        vm.state = 'pending';   //[pending|unrecoverable|ready]

        //user messaging handling
        vm.validationErrors = [];
        vm.unrecoverableErrors = [];
        vm.createReplyErrors = [];

        //authorization
        vm.isAuthenticated = localStorageService.getAuthenticationState();

        //data
        vm.categoryObj = {
            categorySlug: $stateParams.categorySlug,
            subCategorySlug: $stateParams.subCategorySlug,
            topicSlug: $stateParams.topicSlug
        };
        vm.posts = [];

        //functions
        vm.init = init;
        vm.requestCallback = requestCallback;
        vm.getPostUsername = getPostUsername;
        vm.getNumPostsByUser = getNumPostsByUser;
        vm.trustHtml = trustHtml;
        vm.createReply = createReply;
        vm.goToReply = goToReply;
        
        vm.init();

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
            // if (!vm.categoryObj.topicSlug || vm.categoryObj.topicSlug==='') {
            //     vm.SetError('Missing topic parameter');
            //     return;
            // }

            //get forum data
            forumService.getPosts(vm.categoryObj, requestCallback);

//todo: does this jhelp
// if (vm.topic && vm.topic.post_stream && vm.topic.post_stream.posts) {
// //should be a call getPosts that returns existing rather than allocating more space to hold the same data
// vm.posts = vm.topic.post_stream.posts;
// }

            //not sure if we need this for the posts page:
            //get theme categories for side bar
            //forumService.getSubCategories(vm.themesObj, vm.themesObjLoadedCB) 
        }

        function requestCallback() {

            if (!vm.categoryObj.response.success) {
                vm.unrecoverableErrors = vm.unrecoverableErrors.concat(vm.categoryObj.response.unrecoverableErrors);
                vm.unrecoverableId = vm.categoryObj.response.id;
                vm.state = 'unrecoverable';
                return;
            }

            vm.state = 'ready';

            //simplify access to posts
            vm.posts = vm.categoryObj.response.data.posts.post_stream.posts;
            
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
            });
        }

        function getPostUsername(userId) {
            if (vm.categoryObj && vm.categoryObj.response && vm.categoryObj.response.data && vm.categoryObj.response.data.posts && vm.categoryObj.response.data.posts.details && vm.categoryObj.response.data.posts.details.participants) {
                var results = vm.categoryObj.response.data.posts.details.participants.filter(function(x) { return x.id===userId; });
                if (results.length===1) {
                    return results[0].username;
                }
            }
            return '';
        }

        function getNumPostsByUser(userId) {
            if (vm.categoryObj && vm.categoryObj.response && vm.categoryObj.response.data && vm.categoryObj.response.data.posts && vm.categoryObj.response.data.posts.details && vm.categoryObj.response.data.posts.details.participants) {
                var results = vm.categoryObj.response.data.posts.details.participants.filter(function(x) { return x.id===userId; });
                if (results.length===1) {
                    return results[0].post_count;
                }
            }
            return 0;
        }

        function trustHtml(post) {
            if (!post) return '?';
            return $sce.trustAsHtml(post.cooked);
        }

        function goToReply() {
            
            //auth0 authenticated?
            if (!$rootScope.isAuthenticated) {

                //define login callback
                var loginCB = function() {
                    vm.isAuthenticated = true;

                    //scroll to reply form
                    $scope.scrollTo('replyForm');
                };

                //show login
                var params = {
                    onSuccessFunc: loginCB
                };
                loginModalService(params);
                return;
            }

            //discourse authentication
            if (!localStorageService.getDiscourseSession()) {
                var currentLocation = $location.absUrl();
                var url = 'https://community.accessiblego.com/session/sso?return_path='+ encodeURIComponent(currentLocation);
                $window.open(url, '_self');
            }

            //scroll to reply form
            $scope.scrollTo('replyForm');
        }

        function createReply() {

            //are we authenticated?
            if (!$rootScope.isAuthenticated) {
                loginModalService();
                return;
            }

            //reset
            vm.createReplyErrors = [];

            //validation
            // if (!vm.message || vm.message ==='') {
            //     vm.createReplyErrors.push({message: 'Missing message.'});
            //     return;
            // }

            //create the reply
            var params = {
                topicId: vm.categoryObj.response.data.topic.id,
                message: vm.message
            }

            var successFunc = function (response) {

                // if (!response || !response.data) {
                //     vm.createReplyErrors.push({message: 'Error while creating a reply'});
                //     return;
                // }

                // if (response.data.error) {
                //     vm.createReplyErrors.push({message: response.data.error});
                //     return;
                // }

                //error
                if (!response.data.success) {
                    
                    //unrecoverable errors
                    $.each(response.data.unrecoverableErrors, function(idx, err) {
                        vm.createReplyErrors.push({message: err});
                    });

                    //validation errors
                    $.each(response.data.validationErrors, function(idx, err) {
                        vm.createReplyErrors.push({message: err});
                    });

                    return;
                }

                //success :: refresh posts page
                var pageParams = {
                    categorySlug:vm.categoryObj.categorySlug,
                    subCategorySlug: vm.categoryObj.subCategorySlug,
                    topicSlug: response.data.data.create_reply.topic_slug
                };
                $state.go($state.current, {}, {reload:true});
            };

            var errFunc = function (response) {
                console.log(response);
                //todo: identify how to detect this and determine if further work is required
                vm.createReplyErrors.push({message: 'Error while creating a reply'});
            };

            //get forum data
            forumService.createReply(params, successFunc, errFunc);
        }

    };

    postsController.$inject = ['$rootScope', '$stateParams', 'discourseDataService', '$scope', '$state', 'environmentService', '$sce', 'forumService', 'localStorageService', 'loginModalService','$location','$window'];
    app.controller('postsController', postsController);
};
