module.exports = function(app){
	//require("./ideaSearchBox.less");

    var popularCitiesController = function($scope,$state,dataFactory,environmentService) {
        
        var vm = this;
        
        vm.env = environmentService();
        
        vm.defaultNumVisible = 6;
        vm.loadMoreAugment = 3;
        vm.numVisible = vm.defaultNumVisible;
        vm.homepageCitiesData = dataFactory.getHomepageCitiesData();
        vm.title = 'Popular Cities';
        vm.subtitle = "";

        vm.init = init;
        vm.setDefaultNumVisible = setDefaultNumVisible;
        vm.showMoreCities = showMoreCities;
        vm.resetSlider = resetSlider;
        vm.goTrippin = goTrippin;
        vm.setupSliderForCities = setupSliderForCities;
        vm.suggestCity = suggestCity;
        //vm.goToCity = goToCity;
        vm.citiessSlider = undefined;

        vm.init();

        function init() {
            vm.setupSliderForCities();
        }
        function showMoreCities() {
            vm.numVisible=vm.numVisible+vm.loadMoreAugment;
        }
        function goTrippin() {
            $state.go('tripPlanner');
        }
        function suggestCity() {
            $state.go('contact');
        }

        function setupSliderForCities() {
            angular.element(document).ready(function () {
                vm.resetSlider();
            });
        }

        // function goToCity(city) {
        //     if (vm.mode==='search') {
        //         $state.go('hotels',{ppnid:city.ppnid, type:'city', display:city.name+ ' '+city.state+' '+city.country});
        //         return;
        //     }
        //     $state.go('city', {name:city.name, state:city.state, country:city.country});
        // }

        function setDefaultNumVisible() {
            var num = vm.maxHorizontal==='4'?8:6;
            vm.defaultNumVisible = num;
            vm.numVisible = vm.defaultNumVisible;
            vm.loadMoreAugment = num/2;
        }

        function resetSlider() {
                vm.citiessSlider = angular.element('.cities');
                vm.citiessArgs = {
                    dots: true,
                    appendArrows: '.cities-nav',
                    appendDots: '.cities-nav',
                    mobileFirst: true,
                    responsive: [
                        {
                            breakpoint: 768,
                            settings: 'unslick'
                            // settings: {
                            //     slidesToShow: 3,
                            //     centerMode: true,
                            //     slidesToScroll: 1

                            // }
                        },
                        {
                            breakpoint: 620,
                            settings: {
                                slidesToShow: 2,
                                centerMode: false,
                                slidesToScroll: 1

                            }
                        },
                        {
                            breakpoint: 576,
                            settings: {
                                slidesToShow: 2,
                                centerMode: false,
                                slidesToScroll: 1,
                                infinite: true

                            }
                        },
                        {
                            breakpoint: 500,
                            settings: {
                                slidesToShow: 2,
                                centerMode: false,
                                infinite: false
                            }
                        },
                        {
                            breakpoint: 320,
                            settings: {
                                slidesToShow: 1,
                                centerMode: true,
                                infinite: true
                            }
                        }
                    ]
                };

                vm.citiessSlider.not('.slick-initialized').slick(vm.citiessArgs);

                angular.element(window).on('resize', function() {
                    if (angular.element(window).width() < 768) {
                        vm.numVisible = vm.homepageCitiesData.length;
                        vm.citiessSlider.not('.slick-initialized').slick(vm.citiessArgs);
                    } else {
                        vm.numVisible = vm.defaultNumVisible;
                    }
                });
        }

    };

    popularCitiesController.$inject = ['$scope','$state','dataFactory','environmentService'];

    var popularCitiesFunc = function (dataFactory) {
        return {
        	restrict: 'E',
            controller: popularCitiesController,
            
            //scope is bound to the controller's this reference
            controllerAs: 'pc',

            //bind the components properties to controller rather than scope
            bindToController: {
                title: '@title',
                subtitle: '@subtitle',
                mode: '@mode',
                backgroundImg: '@backgroundImg',
                maxHorizontal: '@maxHorizontal'
            },

		    template: require("./popularCities.html"),

            //isolate scope
            scope: {}

            //for directives that want to modify the dom
		    // link: function(scope, element, attrs, directiveController, transcludeFunc) {
      //           scope.pc.mode = attrs.mode;
		    // }

        };
    };

    popularCitiesFunc.$inject = ['dataFactory'];
    app.directive('popularCities', popularCitiesFunc);
};    