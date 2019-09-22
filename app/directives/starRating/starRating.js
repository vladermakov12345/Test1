(function() {
    var starRatingController = function($scope) {
        //var vm = this;

        require("file-loader?name=star-empty-lg.png!../../../resources/img/common/star-empty-lg.png");
        require("file-loader?name=star-fill-lg.png!../../../resources/img/common/star-fill-lg.png");

        $scope.maxRatings = [];

        for (var i = 1; i <= $scope.maxRating; i++) {
            $scope.maxRatings.push({});
        }

        $scope._rating = $scope.rating;
        
        $scope.isolatedClick = function (param) {
            if ($scope.readOnly == 'true') return;

            $scope.rating = $scope._rating = param;
            $scope.hoverValue = 0;
            $scope.click({
                param: param
            });
        };

        $scope.isolatedMouseHover = function (param) {
            if ($scope.readOnly == 'true') return;

            $scope._rating = 0;
            $scope.hoverValue = param;
            $scope.mouseHover({
                param: param
            });
        };

        $scope.isolatedMouseLeave = function (param) {
            if ($scope.readOnly == 'true') return;

            $scope._rating = $scope.rating;
            $scope.hoverValue = 0;
            $scope.mouseLeave({
                param: param
            });
        };
    };
    starRatingController.$inject = ['$scope'];

    var starRatingFunc = function () {
        return {
            scope: {
                rating: '=',
                maxRating: '@',
                readOnly: '@',
                click: "&",
                mouseHover: "&",
                mouseLeave: "&"
            },
            restrict: 'EA',
            template: require("./starRating.html"),
            compile: function (element, attrs) {
                if (!attrs.maxRating || (Number(attrs.maxRating) <= 0)) {
                    attrs.maxRating = '5';
                }
            },
            controller: starRatingController,
            controllerAs: 'vm',
        };
    };

    starRatingFunc.$inject = [];
    angular.module('app').directive('starRating', starRatingFunc);
})();