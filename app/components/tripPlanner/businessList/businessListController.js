module.exports = function (app) {
    var businessListController = function ($rootScope, $stateParams, dataFactory, $scope, NgMap, $state, $window, environmentService, guid) {
        var vm = this;

        vm.businesses = [];

        vm.init = init;

        vm.init();
        
        function init() {

        	//orphaned page for SEO
        	console.info('business list controller called');

            var successFunc = function (response) {

                //include reviews with response.data
                vm.businesses = response.data;

                //setup meta tags
                var title = 'Business Directory';
                var desc = 'Plan a trip using our business directory';
                $rootScope.metaTagService.setup({
                    metaTitle: title,
                    ogTitle: title,
                    twitterTitle: title,
                    metaDescription: desc,
                    ogDescription: desc,
                    twitterDescription: desc
                });
            };
            var errFunc = function (response) {
                console.warn('business listing retrieval error: ' + response);
            };

            dataFactory.getBusinesses().then(successFunc, errFunc);
    	}
    };

    businessListController.$inject = ['$rootScope', '$stateParams', 'dataFactory', '$scope', 'NgMap', '$state', '$window','environmentService','guid'];
    app.controller('businessListController', businessListController);
};