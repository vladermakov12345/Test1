module.exports = function (app) {
    var providerController = function ($rootScope, $scope, $state, $stateParams, dataFactory, environmentService, utilities, discourseDataService, $window) {

        require("./provider.less");

        var vm = this;

        vm.env = environmentService();
        vm.provider = {};
        vm.breadcrumbs = [];
        vm.reviews = {
            isLoading: true,
            data: [],
            error: undefined,
            hasData: function() { return vm.reviews.data.length>0; }
        };
        vm.isPageReady = false;

        vm.init = init;
        vm.getProviderDetail = getProviderDetail;
        vm.getProviderReviews = getProviderReviews;
        vm.setupMetaTags = setupMetaTags;

        vm.init();

        function init() {

            //runs after provider details are returned
            var cb = function() {

                //breadcrumbs
                vm.breadcrumbs = [
                    { isActive: false, title: 'Plan By City', state: 'by-city' },
                    { isActive: true, title: vm.provider.city.name + ', ' + vm.provider.city.state + ', ' + vm.provider.city.country + ' / ' + vm.provider.category }
                ];

                //reviews
                vm.getProviderReviews();

                //seo
                vm.setupMetaTags();

            }

            vm.getProviderDetail(cb);
        }

        function getProviderDetail(cb) {
            var warn = function() {
                console.warn('unable to retrieve provider detail');
                //TODO: show a message for this error state
                vm.isPageReady = true;
            }

            var s = function (response) {
                if (!response || !response.data || !response.data.data) {
                    warn();
                    return;
                }
                vm.provider = response.data.data;

                //run post success callback
                if (cb) {
                    cb();
                }

                vm.isPageReady = true;
            };

            var e = function (response) {
                warn();
            };

            var params = {
                city: $stateParams.city,
                state: $stateParams.state,
                country: $stateParams.country,
                slug: $stateParams.slug
            }

            dataFactory.getProvider(params).then(s,e)
        }

        function getProviderReviews() {

            var successFunc =function(response){

                if (!response || !response.data) {
                    vm.reviews.error = 'Unable to retrieve provider reviews at this time';
                    vm.reviews.isLoading = false;
                    return;
                }

                vm.reviews.data = response.data;

                if (vm.reviews.hasData()) {
                    var ratingsSum = vm.reviews.data.reduce(function(total,currentReview) {
                        return total+parseInt(currentReview.rating);
                    },0);
                    var avg = (ratingsSum/vm.reviews.data.length).toFixed(1);;

                    //var ratings = _map(vm.reviews, 'rating');
                    vm.averageRatings = avg;    //(_.sum(ratings) / ratings.length).toFixed(1);
                }

                vm.reviews.isLoading = false;
            };

            var errFunc= function(response){
                vm.reviews.error = 'Error occurred while attempting to retrieve provider reviews at this time';
                vm.reviews.isLoading = false;
            };

            dataFactory.GetDirectoryReviewsById(vm.provider.directoryId).then(successFunc, errFunc);
        }

        function setupMetaTags() {
            var title = vm.provider.name + ' ' + utilities.getEndash() + ' ' + vm.provider.city.name;
            var desc = vm.provider.description;

            $rootScope.metaTagService.setup({
                metaTitle: title,
                metaDescription: desc,
                ogTitle: title,
                ogDescription: desc,
                //ogImage: img,
                twitterTitle: title,
                twitterDescription: desc,
                //twitterImage: img,
                twitterImageAlt: title,
            });
        }
    };

    providerController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'dataFactory', 'environmentService', 'utilities', 'discourseDataService', '$window'];
    app.controller('providerController', providerController);
};
