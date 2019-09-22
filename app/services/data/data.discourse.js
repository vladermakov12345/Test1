module.exports = function(mod){
    var discourseDataService = function ($http, utilities, $q, transformRequestAsFormPost, localStorageService, environmentService, $sce) {

        var vm = this;
        vm.env = environmentService();
        vm.postRequestWithAuthHandler = postRequestWithAuthHandler;
        vm.getAccessToken = getAccessToken;

        var dataService = {};

        dataService.getCategory = function (slug) {
            var url = vm.env.BASEURL_CRM + '/api/forum/getCategory?slug='+slug;
            return $http.get(url);
        };

		dataService.getCategories = function () {
            var url = vm.env.BASEURL_CRM + '/api/forum/getCategories';
            return $http.get(url);
        };

        dataService.getSubCategories = function(slug) {
        	var url = vm.env.BASEURL_CRM + '/api/forum/getSubCategories?slug='+slug;
            return $http.get(url);
        };

        dataService.getTopics = function(categorySlug, subCategorySlug) {
        	var url = vm.env.BASEURL_CRM + '/api/forum/getTopics?categorySlug='+categorySlug+'&subCategorySlug='+subCategorySlug;
            return $http.get(url);
        };

        dataService.getLatest = function() {
            var url = vm.env.BASEURL_CRM + '/api/forum/getLatest';
            var options = { cache: false };
            return $http.get(url, options);
        };

        //ex: http://localhost:82/api/forum/getPosts?categorySlug=united-states&subCategorySlug=new-york&topicSlug=what-to-do-in-birmingham
        //ex: http://localhost:82/api/forum/getPosts?categorySlug=themes&subCategorySlug=public-transportation&topicSlug=about-the-public-transportation-category
        dataService.getPosts = function(categorySlug, subCategorySlug, topicSlug) {
            var url = vm.env.BASEURL_CRM + '/api/forum/getPosts?categorySlug='+categorySlug+'&subCategorySlug='+subCategorySlug+'&topicSlug='+topicSlug;
            return $http.get(url);
        };

        // dataService.getTopic = function(topicId) {
        // 	var url = vm.env.BASEURL_CRM + '/api/forum/getTopic?topicId='+topicId;
        // 	var config = {
        // 		headers: {
        // 			'Accept': 'application/json; charset=utf-8',
        // 			'Accept-Charset': 'charset=utf-8'
        // 		}
        // 	};
        //     return $http.get(url, config);
        // };


        //--- requires authorization ---//
        dataService.getDiscoursePayload = function(base64EncodedPayload) {
            var url = vm.env.BASEURL_CRM + '/api/forum/getDiscoursePayload';
            return $http({
                url: url,
                method: "POST",
                data: 'base64EncodedPayload='+base64EncodedPayload,
                transformRequest: transformRequestAsFormPost,
                cache: false,
                dataType: "json",   //what to return, whereas content-type is what you are sending
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Bearer ' + vm.getAccessToken(),
                }
            });
        };

        dataService.createTopic = function(params) {
            var url = vm.env.BASEURL_CRM + '/api/forum/createTopic';
            return vm.postRequestWithAuthHandler(url, params);
        };

        dataService.createReply = function(params) {
            var url = vm.env.BASEURL_CRM + '/api/forum/createReply';
            return vm.postRequestWithAuthHandler(url, params);
        };

        function postRequestWithAuthHandler(url, params) {
            return $http({
                url: url,
                method: "POST",
                data: params,
                transformRequest: transformRequestAsFormPost,
                cache: false,
                dataType: "json",   //what to return, whereas content-type is what you are sending
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Bearer ' + vm.getAccessToken(),
                }
            });
        }

        function getAccessToken() {
            return localStorageService.getAccessToken();
        }
        

        return dataService;
    };

    discourseDataService.$inject = ['$http', 'utilities', '$q', 'transformRequestAsFormPost', 'localStorageService', 'environmentService', '$sce'];
    mod.factory('discourseDataService', discourseDataService);
};