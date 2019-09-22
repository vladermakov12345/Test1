module.exports = function(mod){
    var forumService = function ($rootScope,$state,discourseDataService, localStorageService,$window,$location,redirectionService,loginModalService) {
        var vm = this;

        vm.getCategory = getCategory;
        vm.getGeographyCategories = getGeographyCategories;
        vm.getSubCategories = getSubCategories;
        vm.getTopics = getTopics;

        //get a specific category
        function getCategory(category) {
            var sFunc = function (response) {
                if (!response.data || response.data.length===0) {
                    console.log(category.slug + ' not found');
                    return;
                }
                category.data = response.data[0];
            };
            var eFunc = function (response) {
                console.log('error while fetching parent category data');
            };
            discourseDataService.getCategory(category.slug).then(sFunc, eFunc);
        }

        //get geography categories
        function getGeographyCategories(requestObj, cb) {
            var successFunc = function (response) {
                requestObj.response = response.data;
                if (cb) { cb(); }
            };
            var errFunc = function (response) {
                requestObj.response = {
                    unrecoverableErrors: ['Error while fetching categories'],
                    id: 999
                };
                if (cb) { cb(); }
            };
            discourseDataService.getCategories().then(successFunc, errFunc);
        }

        //get sub categories
        function getSubCategories(requestObj,cb) {
            var successFunc = function (response) {
                requestObj.response = response.data;
                if (cb) { cb(); }
            };
            var errFunc = function (response) {
                requestObj.response = {
                    unrecoverableErrors: ['Error while fetching sub categories'],
                    id: 999
                };
                if (cb) { cb(); }
            };
            discourseDataService.getSubCategories(requestObj.categorySlug).then(successFunc, errFunc);
        }

        //get topics of a subcategory
        function getTopics(requestObj, cb) {
            var successFunc = function (response) {
                //var json = JSON.parse(response.data);
                //var requestedCategory = json.category_list.categories.filter(function(c) { return c.slug===$stateParams.slug; });
                // if (!response || !response.data) {
                //     request.err = 'Topics for '+ request.categorySlug + '/' + request.subCategorySlug +' not found.';
                //     return;
                // }

                // Object.assign(request,response.data);

                // if (cb) {
                //     cb();
                // }
                requestObj.response = response.data;
                if (cb) { cb(); }
            };

            var errFunc = function (response) {
                requestObj.response = {
                    unrecoverableErrors: ['Error while fetching topics'],
                    id: 999
                };
                if (cb) { cb(); }
            };

            discourseDataService.getTopics(requestObj.categorySlug, requestObj.subCategorySlug).then(successFunc, errFunc);
        }

        //get posts of a topic
        function getPosts(requestObj, cb) {
            var successFunc = function (response) {
                
                //default error response
                // if (!response || !response.data) {
                //     request.err = 'Posts for '+ request.categorySlug + '/' + request.subCategorySlug +'/' + request.topicSlug + ' not found.';
                // }

                // //explicit error response
                // if (!response.data.success) {
                //     request.err = response.data.message;
                // }

                // //merge
                // Object.assign(request,response.data);

                // //always call back
                // if (cb) {
                //     cb();
                // }
                requestObj.response = response.data;
                if (cb) { cb(); }
            };

            var errFunc = function (response) {
                //request.err = 'error while fetching posts';
                requestObj.response = {
                    unrecoverableErrors: ['Error while fetching topics'],
                    id: 999
                };
                if (cb) { cb(); }
            };

            discourseDataService.getPosts(requestObj.categorySlug, requestObj.subCategorySlug, requestObj.topicSlug).then(successFunc, errFunc);
        }

        //create a topic
        function createTopic(params, successFunc, errFunc) {

            //pass customer id
            var cust = {
                customerId: localStorageService.getCustomerId() 
            };
            Object.assign(params,cust);
            
            discourseDataService.createTopic(params).then(successFunc, errFunc);
        }

        //create a reply
        function createReply(params, successFunc, errFunc) {

            //pass customer id
            var cust = {
                customerId: localStorageService.getCustomerId() 
            };
            Object.assign(params,cust);
            
            discourseDataService.createReply(params).then(successFunc, errFunc);
        }


        //-- authentication --//
        function isForumAuthorized() {
            return localStorageService.getDiscourseSession();
        }

        function getForumAuthorizeUrl(toLocation) {
            if (!toLocation || toLocation==='') {
                toLocation = $location.absUrl();
                console.log('return_path defaulted to absUrl');
            }
            return 'https://community.accessiblego.com/session/sso?return_path='+toLocation;
        }

        function authorize(toLocation) {
            //discourse authentication
            if (!this.isForumAuthorized()) {
                var url = 'https://community.accessiblego.com/session/sso?return_path='+toLocation;
                //"https://community.accessiblego.com/session/sso?return_path=http://localhost:3000/forum/united-states/new-york/user/ask"
                $window.open(url, '_self');
            }
        }

        //-- navigation --//
        function navToCreateTopic(redirTo, redirParams) {

            var destination = $state.href(redirTo, redirParams, {absolute: true});

            //are we authenticated?
            if (!$rootScope.isAuthenticated) {

                //set redirection to the forum auth launch
                var to = 'forum-auth';
                var pageParams = {
                    destination: destination
                };
                redirectionService.setRedirect({to:'forum-auth', params: pageParams});
                loginModalService();
                return;
            }

            if (!isForumAuthorized()) {
                //set post forum redirection
                redirectionService.setRedirect(redirTo, redirParams);

                //determine url for forum to redirect to after auth
                var destination = $state.href(redirTo, redirParams, {absolute: true});

                //authorize forum
                this.authorize(destination);
            }

            //let's go!
            $state.go(redirTo, redirParams);

        }

        function navToCreateReply() {

        }

        return {
            getCategory: getCategory,
            getGeographyCategories: getGeographyCategories,
            getSubCategories: getSubCategories,
            getTopics: getTopics,
            getPosts: getPosts,
            isForumAuthorized: isForumAuthorized,
            authorize: authorize,
            createTopic: createTopic,
            createReply: createReply,
            navToCreateTopic: navToCreateTopic
        };
	};

    forumService.$inject = ['$rootScope','$state','discourseDataService','localStorageService','$window','$location','redirectionService','loginModalService'];
    mod.factory('forumService', forumService);
};