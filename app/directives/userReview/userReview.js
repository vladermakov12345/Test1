(function() {
     require("./userReview.less");
   

    var userReviewController = function($scope,$state,dataFactory,authService) {
        var vm = this;
        //vm.review = {};

        vm.initialize = initialize;

        //needed by ng-init to prep review data (ex rating)
        function initialize() {
            vm.reviewData =  JSON.parse(vm.review);
        }
        

        vm.init = init;

        vm.init();
        function init() {}
    };

    userReviewController.$inject = ['$scope','$state', 'dataFactory','authService'];

    var userReviewFunc = function (dataFactory,$state,authService) {
        return {
        	restrict: 'E',
            controller: userReviewController,
            controllerAs: 'userReview',
            bindToController: true,
            template: require("./userReview.html"),
            scope: {
                review: '@'
            },
		        link: function(scope, element, attrs) {
                    scope.review=JSON.parse(attrs.review);
              //scope.reviewid=attrs.reviewid;
              //scope.reviewtype=attrs.reviewtype;
                    scope.avatar = scope.review.picture;
                    if (scope.review.service !== 'auth0') {
                        scope.avatar = authService.get_avatar_from_service(scope.review.service, scope.review.userid, 115);
                    }
		        }
        };
    };

    userReviewFunc.$inject = ['dataFactory','$state','authService'];
    angular.module('app').directive('userReview', userReviewFunc);
})();

    