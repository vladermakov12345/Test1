(function () {
    require("./businessListing.less");

    var businessListingController = function ($scope, $state,$filter,dataFactory) {
        var vm = this;
        vm.overAllRating = overAllRating;
        vm.breakOnComma = breakOnComma;
        vm.setEmail = setEmail;

        $scope.$watch('businessListing.currentboxsetpage', function (a, b) {
            vm.currentBoxSetPage = vm.currentboxsetpage;
        });

        $scope.$watch('businessList', function (a,b) {
            $.each(a,function(i,v) {
                var that = this;
                var sFunc = function(response) {
                    if (!response || !response.data || response.data.length===0) return;
                    a[i].reviewList = response.data;
                };
                var eFunc = function(err) {
                    console.log(err);
                };
                dataFactory.GetDirectoryReviewsById(v.Id).then(sFunc,eFunc);
            });
        });


        function overAllRating(directoryEntry) {

            var rating = 0;
            if (directoryEntry.reviewList.length > 0 && directoryEntry.reviewList.length != undefined) {

                for (var i = 0; i < directoryEntry.reviewList.length; i++) {

                    rating += directoryEntry.reviewList[i].rating;

                }
                rating = rating / directoryEntry.reviewList.length;
                return rating;
            }
            else {
                return rating;
            }

        }


        function setEmail(text) {
            var clean = text.trim();
            if (clean.substring(0, 4) == 'http') {
                return "<a href=" + clean + " target=\"_newWindow\">Contact</a>";
            } else {
                return "<a href=mailto:" + clean + " alt='Send email to " + clean + "'>email</a>";
            }
            return text;
        }

        function breakOnComma(text) {
            if (!text) return;
            var textEntries = text.split(",");
            var result = "";
            textEntries.forEach(function (t) {
                result += t + "<br />";
            });
            return result;
        }

        function trackOutboundClick(url) {
            //removing as per Daniel
            //$window.ga('send', 'event', { eventCategory: 'outbound link', eventAction: 'click', eventLabel: url, transport: 'beacon' });
        }



        //-- reviews
        // function getBusinessReviews(directoryObj, key) {

        //     var successFunc =function(response){
        //         //directoryObj.reviews = response.data;
        //         vm.directories[key].Reviews = response.data || [];
        //         vm.directories[key] = vm.directories[key];
        //         //determine average ratings (see business individual controller)
        //     };

        //     var errFunc= function(response){
        //     };

        //     dataFactory.GetDirectoryReviewsById(directoryObj.Id).then(successFunc, errFunc);
        // }

        //get reviews
        // angular.forEach(businessListing.businessList, function (value, key) {
        //     businessListing.businessList[key].Reviews = [];
        //     //vm.getBusinessReviews(value,key);
        //     //getBusinessReviews();
        // });
    };

    businessListingController.$inject = ['$scope', '$state', '$filter','dataFactory'];

    var businessListingFunc = function (dataFactory, $state) {
        return {
            restrict: 'E',
            controller: businessListingController,
            scope: {
                currentboxsetpage : '='
            },
            controllerAs: 'businessListing',
            bindToController: true,
            template: require("./businessListing.html"),
            link: function (scope, element, attrs) {
                scope.businessList = JSON.parse(attrs.businesslist);
                scope.filter = attrs.filter.split(',');
                scope.city = attrs.city;
                scope.currentBoxSetPage=scope.businessListing.currentboxsetpage;
                scope.directoriesLimit = attrs.directorieslimit;
            }
        };
    };

    businessListingFunc.$inject = ['dataFactory', '$state','$filter'];
    angular.module('app').directive('businessListing', businessListingFunc);
})();



