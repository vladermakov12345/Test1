(function() {
	require("./articleCarousel.less");

    var articleCarouselController = function($scope, $state, dataFactory) {
        var vm = this;

        vm.init = init;
        vm.articleBoxes = [];
        vm.articleBoxesToShow = [0,1,2,3];
        vm.searchString = $scope.searchString;
        vm.isInArticleBoxesToShow = isInArticleBoxesToShow;
        vm.shiftArticleBoxesRight = shiftArticleBoxesRight;
        vm.shiftArticleBoxesLeft = shiftArticleBoxesLeft;
        vm.shiftRight = shiftRight;
        vm.shiftLeft = shiftLeft;
        vm.articleFetchIsComplete = false;

        vm.init();

        function init() {

            //get all articles
            var sFunc = function(response) {
                var d = response.data;
                for (var i = 0; i < d.length; i++) {
                    vm.articleBoxes.push(d[i]);
                    /*if (d[i].City.Id.toUpperCase() === '6AFC63D5-93F3-435D-B7DE-4867129FFE66') {
                        vm.articleBoxes.push(d[i]);
                    }*/
                }

                vm.articleFetchIsComplete = true;
            };
            var eFunc = function() {
                console.log('no article data found');
            };

            //vm.articleBoxes = response.data;

            if ($scope.searchString) {
                dataFactory.searchArticles($scope.searchString).then(sFunc,eFunc);
            } else {
                dataFactory.getAllArticles(true).then(sFunc,eFunc);
            }
        }

        function isInArticleBoxesToShow(index) {
            return $.inArray(index, vm.articleBoxesToShow) !== -1;
        }
        function shiftArticleBoxesRight() {
            vm.shiftRight(vm.articleBoxesToShow,vm.articleBoxes.length);
        }
        function shiftArticleBoxesLeft() {
            vm.shiftLeft(vm.articleBoxesToShow);
        }

        function shiftRight(numarr,numTotalBoxes) {
            var nextNum = numarr[numarr.length-1]+1;
            if (nextNum > numTotalBoxes-1)
                return;
            numarr.shift();
            numarr.push(nextNum);
        }
        function shiftLeft(numarr) {
            var prevNum = numarr[0]-1;
            if (prevNum < 0)
                return;
            numarr.unshift(prevNum);
            numarr.pop();
        }
    };

    articleCarouselController.$inject = ['$scope','$state','dataFactory'];

    var articleCarouselFunc = function () {
        return {
        	restrict: 'E',
            controller: articleCarouselController,
            controllerAs: 'articleCarousel',
		    template: require("./articleCarousel.html"),
            scope: {
                searchString: '@searchString'
            },
		    link: function(scope, element, attrs) {

                // scope.what = scope.bookbox.what;
                // scope.bookbox.hotel_destination = attrs.city;
                // scope.bookbox.bookingtype = attrs.type;

		    }
        };
    };

    angular.module('app').directive('articleCarousel', articleCarouselFunc);
})();

    