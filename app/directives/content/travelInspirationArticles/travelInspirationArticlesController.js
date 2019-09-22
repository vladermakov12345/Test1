module.exports = function(app) {
	//require("./bookbox.less");

    var travelInspirationArticlesController = function($scope,environmentService,dataFactory) {
    	var vm = this;
    	vm.env = environmentService();

        vm.defaultNumVisible = 6;
        vm.numVisible = vm.defaultNumVisible;
        vm.articleFetchIsComplete = false;
        vm.articles = [];
        vm.travelInspirationElem = undefined;

    	vm.init = init;
    	vm.setupSliderForArticles = setupSliderForArticles;
        vm.populateArticles = populateArticles;
        vm.showMoreArticles = showMoreArticles;

    	vm.init();

    	function init() {
            //get article data
            vm.populateArticles();
    	}
        function showMoreArticles() {
            vm.numVisible=vm.numVisible+3;
        }

        function setupSliderForArticles() {
            //this is buggy, may have to do with timing of image directive lazy-load
            angular.element(document).ready(function () {
                vm.travelInspirationElem = angular.element('.travel-inspiration');
                vm.travelInspirationArgs = {
                    dots: true,
                    appendArrows: '.travel-inspiration-nav',
                    appendDots: '.travel-inspiration-nav',
                    responsive: [
                        {
                            breakpoint: 9999,
                            settings: "unslick"
                            // settings: {
                            //     slidesToShow: 3,
                            //     centerMode: true,
                            //     slidesToScroll: 1

                            // }
                        },
                        {
                            breakpoint: 760,
                            settings: {
                                slidesToShow: 1,
                                centerMode: true,
                                slidesToScroll: 1,
                                infinite: true

                            }
                        },
                        {
                            breakpoint: 576,
                            settings: {
                                centerMode: true,
                                slidesToShow: 1,
                                slidesToScroll: 1

                            }
                        }
                    ]
                };
                vm.travelInspirationElem.not('.slick-initialized').slick(vm.travelInspirationArgs);

                angular.element(window).on('resize', function() {
                    if (angular.element(window).width() < 760) {
                        //vm.numVisible = Math.min(vm.articles.length,12);
                        //$scope.$apply();
                        vm.travelInspirationElem.not('.slick-initialized').slick(vm.travelInspirationArgs);
                    } else {
                        //vm.numVisible = vm.defaultNumVisible;
                        //$scope.$apply();
                    }
                });

                // angular.element('.article-wrapper').hover(function() {
                //     angular.element(this).toggleClass('hovered')
                // });
            });
        }

        function populateArticles() {
            var sFunc = function(response) {
                if (!response.data) {
                    console.log('unable to retrieve article data');
                    return;
                }

                var articles = response.data;
                vm.articles = articles.filter(function(article,i) {

                    if (!article || !article.IsActive) {
                        return false;
                    }

                    switch (vm.content) {
                        case 'city': {
                            return article.City && article.City.Name !=='';
                        };
                        case 'noncity': {
                            return article.City && article.City.Name ==='';
                        };
                        default: {
                            return true;
                        }
                    }
                });

                //setup slider
                vm.setupSliderForArticles();

                //var d = response.data;
                //for (var i = 0; i < d.length; i++) {
                    //vm.articles.push(d[i]);
                    /*if (d[i].City.Id.toUpperCase() === '6AFC63D5-93F3-435D-B7DE-4867129FFE66') {
                        vm.articleBoxes.push(d[i]);
                    }*/
                //}

                vm.articleFetchIsComplete = true;
            };
            var eFunc = function(err) {
                console.log('no article data found: ' + err);
            };
            dataFactory.getAllArticles(true).then(sFunc,eFunc);
        }
    };

    travelInspirationArticlesController.$inject = ['$scope','environmentService','dataFactory'];

    var travelInspirationArticlesFunc = function ($state) {
        return {
          restrict: 'E',
          controller: travelInspirationArticlesController,
          controllerAs: 'tia',
          bindToController: true,
          template: require("./travelInspirationArticles.html"),
          scope: {
            title: '@title',
            subtitle: '@subtitle',
            header: '@header',
            content: '@content',
            limit: '@limit'
          },
	      link: function(scope, element, attrs) {
	      }
        };
    };

    travelInspirationArticlesFunc.$inject = ['$state'];
    app.directive('travelInspirationArticles', travelInspirationArticlesFunc);
};


